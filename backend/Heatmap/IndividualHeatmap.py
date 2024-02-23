import sys
import json
import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.cm as cm
from scipy.ndimage.filters import gaussian_filter
from pymongo import MongoClient
from google.cloud import storage

def upload_to_gcs(bucket_name, local_file_path, remote_file_path, key_json_path):
    # Instantiate a client using your service account key
    client = storage.Client.from_service_account_json(key_json_path)

    # Get the bucket
    bucket = client.bucket(bucket_name)

    # Upload the file to GCS
    blob = bucket.blob(remote_file_path)
    blob.upload_from_filename(local_file_path)

    print(f"File {local_file_path} uploaded to {bucket_name}/{remote_file_path}.")

def myplot(x, y, s, bins=1000):
    heatmap, xedges, yedges = np.histogram2d(x, y, bins=bins)
    heatmap = gaussian_filter(heatmap, sigma=s)

    extent = [xedges[0], xedges[-1], yedges[0], yedges[-1]]
    return heatmap.T, extent

def generate_heatmap_image(roll_number, image_path, sigma, bucket_name, myplot_func):
    # Load MONGO_URI from config.json
    with open('../config.json') as f:
        config = json.load(f)
        mongo_uri = config['MONGO_URI']

    # Connect to MongoDB
    client = MongoClient(mongo_uri)
    db = client['INTUX']
    collection = db['GazeData']  # Assuming your collection name is 'GazeData'

    # Load the image
    img = plt.imread(image_path)

    # Fetch data for the specified roll number from MongoDB
    cursor = collection.find({'rollNo': roll_number})
    student_data = pd.DataFrame(list(cursor))

    # Scale the x and y coordinates by the width and height of the image
    x_scaled = student_data['normalizedX'] * img.shape[1]
    y_scaled = student_data['normalizedY'] * img.shape[0]

    # Calculate the aspect ratio of the image
    aspect_ratio = img.shape[1] / img.shape[0]

    # Specify the range for x and y axes
    x_range = [0, img.shape[1]]
    y_range = [0, img.shape[0]]

    # Filter data points within the specified range
    filtered_indices = np.where((x_scaled >= x_range[0]) & (x_scaled <= x_range[1]) & (y_scaled >= y_range[0]) & (y_scaled <= y_range[1]))
    x_filtered = x_scaled.iloc[filtered_indices]
    y_filtered = y_scaled.iloc[filtered_indices]

    # Create a new figure and axis
    fig, ax = plt.subplots(figsize=(10, 10 / aspect_ratio))  # Adjust the figure size as needed

    # Display the image
    ax.imshow(img, extent=[x_filtered.min(), x_filtered.max(), y_filtered.min(), y_filtered.max()], origin='upper')

    # Overlay the heatmap
    heatmap, extent = myplot_func(x_filtered, y_filtered, sigma)
    ax.imshow(heatmap, extent=extent, origin='upper', cmap=cm.jet, alpha=0.5)

    # Remove axis
    ax.axis('off')

    # Save the plot as an image file
    image_file = f'Heatmap_{roll_number}.jpg'
    plt.savefig(image_file, bbox_inches='tight', pad_inches=0)

    # Close the plot to release resources
    plt.close()

    # Upload the image to Google Cloud Storage
    key_json_path = "finalyear-409412-5412169777f2.json"
    upload_to_gcs(bucket_name, image_file, f'{roll_number}.jpg', key_json_path)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python script.py <roll_number>")
        sys.exit(1)

    roll_number = sys.argv[1]
    image_path = 'Picture2.png'  # Replace with the path to your image
    sigma = 16.0  # Adjust the sigma value as needed
    bucket_name = 'intux_heatmap'  # Replace with your bucket name

    generate_heatmap_image(roll_number, image_path, sigma, bucket_name, myplot)