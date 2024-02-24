import sys
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from pymongo import MongoClient
from google.cloud import storage
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


def generate_clickmap_image():
    # Connect to MongoDB
    with open('../config.json') as f:
        config = json.load(f)
        mongo_uri = config['MONGO_URI']

    client = MongoClient(mongo_uri)
    db = client['INTUX']
    collection = db['ClickData']  # Assuming your collection name is 'ClickData'

    # Fetch data for the specified roll number from MongoDB
    cursor = collection.find({})
    student_data = pd.DataFrame(list(cursor))

    # Load the image
    img = plt.imread('Picture2.png')  # Assuming the image path is fixed

    # Scale the x and y coordinates by the width and height of the image
    x_scaled = student_data['normalizedX'] * img.shape[1]
    y_scaled = student_data['normalizedY'] * img.shape[0]

    # Plot circles for each click
    plt.imshow(img)
    plt.plot(x_scaled, y_scaled, "or", markersize=5)  # 'or' for red circles

    # Remove x-axis and y-axis
    plt.axis('off')

    # Save the plot as an image file
    plt.savefig(f'clickmap.png', bbox_inches='tight', pad_inches=0)

    # Close the plot to release resources
    plt.close()

if __name__ == "__main__":

    generate_clickmap_image()
    # Upload the image to Google Cloud Storage
    bucket_name = 'intux_general'  # Replace with your bucket name
    key_json_path = "../finalyear-409412-5412169777f2.json"  # Replace with your service account key JSON path
    remote_file_path = f'clickmap.png'  # Remote file path in your bucket
    upload_to_gcs(bucket_name, f"clickmap.png", remote_file_path, key_json_path)