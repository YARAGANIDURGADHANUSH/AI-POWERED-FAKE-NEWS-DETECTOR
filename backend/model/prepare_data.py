import pandas as pd
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

fake_path = os.path.join(BASE_DIR, "../../data/Fake.csv")
true_path = os.path.join(BASE_DIR, "../../data/True.csv")

# Load datasets
fake_df = pd.read_csv(fake_path)
true_df = pd.read_csv(true_path)

# Add labels
fake_df["label"] = 1
true_df["label"] = 0

# Combine title + text
fake_df["text"] = fake_df["title"] + " " + fake_df["text"]
true_df["text"] = true_df["title"] + " " + true_df["text"]

# Keep only required columns
fake_df = fake_df[["text", "label"]]
true_df = true_df[["text", "label"]]

# Merge and shuffle
df = pd.concat([fake_df, true_df])
df = df.sample(frac=1).reset_index(drop=True)

# Save final dataset
output_path = os.path.join(BASE_DIR, "../../data/fake_news.csv")
df.to_csv(output_path, index=False)

print("✅ Dataset ready:", output_path)