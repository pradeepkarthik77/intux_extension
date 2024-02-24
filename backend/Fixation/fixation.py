import cv2
import numpy as np
from tqdm import tqdm
from pymongo import MongoClient
from google.cloud import storage
import sys
import json

def upload_to_gcs(bucket_name, local_file_path, remote_file_path, key_json_path):
    # Instantiate a client using your service account key
    client = storage.Client.from_service_account_json(key_json_path)

    # Get the bucket
    bucket = client.bucket(bucket_name)

    # Upload the file to GCS
    blob = bucket.blob(remote_file_path)
    blob.upload_from_filename(local_file_path)

    print(f"File {local_file_path} uploaded to {bucket_name}/{remote_file_path}.")

def GaussianMask(sizex, sizey, sigma=33, center=None, fix=1):
    """
    sizex  : mask width
    sizey  : mask height
    sigma  : gaussian Sd
    center : gaussian mean
    fix    : gaussian max
    return gaussian mask
    """
    x = np.arange(0, sizex, 1, float)
    y = np.arange(0, sizey, 1, float)
    x, y = np.meshgrid(x, y)

    if center is None:
        x0 = sizex // 2
        y0 = sizey // 2
    else:
        if np.isnan(center[0]) == False and np.isnan(center[1]) == False:
            x0 = center[0]
            y0 = center[1]
        else:
            return np.zeros((sizey, sizex))

    return fix * np.exp(-4 * np.log(2) * ((x - x0) ** 2 + (y - y0) ** 2) / sigma ** 2)

def Fixpos2Densemap(fix_arr, width, height, imgfile, alpha=0.5, threshold=10):
    """
    fix_arr   : fixation array number of subjects x 3(x,y,fixation)
    width     : output image width
    height    : output image height
    imgfile   : image file (optional)
    alpha     : merge rate imgfile and heatmap (optional)
    threshold : heatmap threshold (0~255)
    return heatmap 
    """

    heatmap = np.zeros((height, width), np.float32)
    for n_subject in tqdm(range(fix_arr.shape[0])):
        heatmap += GaussianMask(width, height, 33, (fix_arr[n_subject, 0], fix_arr[n_subject, 1]),
                                fix_arr[n_subject, 2])

    # Normalization
    heatmap = heatmap / np.amax(heatmap)
    heatmap = heatmap * 255
    heatmap = heatmap.astype("uint8")

    if imgfile.any():
        # Resize heatmap to imgfile shape 
        h, w, _ = imgfile.shape
        heatmap = cv2.resize(heatmap, (w, h))
        heatmap_color = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)

        # Create mask
        mask = np.where(heatmap <= threshold, 1, 0)
        mask = np.reshape(mask, (h, w, 1))
        mask = np.repeat(mask, 3, axis=2)

        # Merge images
        marge = imgfile * mask + heatmap_color * (1 - mask)
        marge = marge.astype("uint8")
        marge = cv2.addWeighted(imgfile, 1 - alpha, marge, alpha, 0)
        return marge

    else:
        heatmap = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)
        return heatmap

if __name__ == '__main__':
    # Connect to MongoDB

    with open('../config.json') as f:
        config = json.load(f)
        mongo_uri = config['MONGO_URI']

    client = MongoClient(mongo_uri)
    db = client['INTUX']
    collection = db['GazeData']

    # Load image file
    img = cv2.imread('sample.png')

    if len(sys.argv) != 2:
        print("Usage: python script.py <rollNo>")
        sys.exit(1)

    rollNo = sys.argv[1]

    # Fetch fixation data from MongoDB
    fixation_data = collection.find({"rollNo": rollNo}, {'normalizedX': 1, 'normalizedY': 1, 'fixation': 1})

    # Convert fixation data to numpy array
    fix_arr = []
    for entry in fixation_data:
        normalizedX = entry.get('normalizedX', None)
        normalizedY = entry.get('normalizedY', None)
        fixation = entry.get('fixation', 100)  # Default value set to 100 if 'fixation' field is not present
        if normalizedX is not None and normalizedY is not None:
            fix_arr.append([normalizedX, normalizedY, fixation])
    fix_arr = np.array(fix_arr)

    # Normalize fixation data if needed
    num_subjects = fix_arr.shape[0]
    H, W, _ = img.shape
    fix_arr[:, 0] *= W
    fix_arr[:, 1] *= H

    # Create heatmap
    heatmap = Fixpos2Densemap(fix_arr, W, H, img, 0.7, 5)
    cv2.imwrite(f"{rollNo}.png", heatmap)

    # Upload the image to Google Cloud Storage
    bucket_name = 'intux_fixation'  # Replace with your bucket name
    key_json_path = "../finalyear-409412-5412169777f2.json"  # Replace with your service account key JSON path
    remote_file_path = f'{rollNo}.png'  # Remote file path in your bucket
    upload_to_gcs(bucket_name, f"{rollNo}.png", remote_file_path, key_json_path)
