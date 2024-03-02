import pandas as pd

# Replace 'your_input_file.csv' and 'your_output_file.csv' with your actual file names
input_file = 'CB.EN.U4CSE20447.csv'
output_file = 'output.csv'

# Read the CSV file into a pandas DataFrame
df = pd.read_csv(input_file)

# Convert float columns 'x' and 'y' to integers
df['x'] = df['x'].astype(int)
df['y'] = df['y'].astype(int)

# Save the modified DataFrame to a new CSV file
df.to_csv(output_file, index=False)

print(f"Conversion completed. Results saved to {output_file}")
