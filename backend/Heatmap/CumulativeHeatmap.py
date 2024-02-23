import numpy as np
import matplotlib.pyplot as plt
import matplotlib.cm as cm
from scipy.ndimage.filters import gaussian_filter
from pymongo import MongoClient
import json
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

# Connect to MongoDB

with open('../config.json') as f:
        config = json.load(f)
        mongo_uri = config['MONGO_URI']

client = MongoClient(mongo_uri)
db = client['INTUX']
collection = db['GazeData']

# Fetch data from MongoDB
data = collection.find({}, {'normalizedX': 1, 'normalizedY': 1})

x = []
y = []

for entry in data:
    x.append(entry['normalizedX'])
    y.append(entry['normalizedY'])

# Load the image
image_path = 'Picture2.png'  # Replace with the path to your image
img = plt.imread(image_path)

# Calculate the aspect ratio of the image
aspect_ratio = img.shape[1] / img.shape[0]

# Scale the x and y coordinates by the width and height of the image
x_scaled = np.array(x) * img.shape[1]
y_scaled = np.array(y) * img.shape[0]

# Specify the range for x and y axes
x_range = [0, img.shape[1]]
y_range = [0, img.shape[0]]

# Filter data points within the specified range
filtered_indices = np.where((x_scaled >= x_range[0]) & (x_scaled <= x_range[1]) & (y_scaled >= y_range[0]) & (y_scaled <= y_range[1]))
x_filtered = x_scaled[filtered_indices]
y_filtered = y_scaled[filtered_indices]

sigma = 16

# Create figure and axis with adjusted aspect ratio
fig, ax = plt.subplots(figsize=(10, 10 / aspect_ratio))  # Adjust the figure size as needed

# Display the image
ax.imshow(img, extent=[x_filtered.min(), x_filtered.max(), y_filtered.min(), y_filtered.max()], origin='upper')

# Overlay the heatmap
heatmap, extent = myplot(x_filtered, y_filtered, sigma)
ax.imshow(heatmap, extent=extent, origin='upper', cmap=cm.jet, alpha=0.5)

# Remove axis
ax.axis('off')

# Save the plot as an image file
image_file = 'heatmap.jpg'
plt.savefig(image_file, bbox_inches='tight', pad_inches=0)

# Upload the image to Google Cloud Storage
bucket_name = 'intux_general'  # Replace with your bucket name
key_json_path = 'finalyear-409412-5412169777f2.json'  # Replace with your service account key JSON path
remote_file_path = 'heatmap.jpg'
upload_to_gcs(bucket_name, image_file, remote_file_path, key_json_path)