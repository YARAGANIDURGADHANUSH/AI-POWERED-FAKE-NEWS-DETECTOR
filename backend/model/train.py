import os
import pandas as pd
import pickle

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

from backend.utils.preprocess import clean_text

# Get current directory (backend/model)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# -----------------------------
# Load Dataset
# -----------------------------
data_path = os.path.join(BASE_DIR, "../../data/fake_news.csv")
data_path = os.path.abspath(data_path)

print(f"Loading dataset from: {data_path}")

df = pd.read_csv(data_path)

# -----------------------------
# Preprocess Data
# -----------------------------
df['text'] = df['text'].apply(clean_text)

X = df['text']
y = df['label']   # 0 = Real, 1 = Fake

# -----------------------------
# Train/Test Split
# -----------------------------
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# -----------------------------
# Vectorization (IMPROVED)
# -----------------------------
vectorizer = TfidfVectorizer(
    stop_words='english',
    ngram_range=(1, 2),   # 🔥 captures phrases
    max_df=0.7,
    min_df=5
)

X_train_vec = vectorizer.fit_transform(X_train)
X_test_vec = vectorizer.transform(X_test)

# -----------------------------
# Model Training (IMPROVED)
# -----------------------------
model = LogisticRegression(
    max_iter=2000,
    class_weight='balanced'
)

model.fit(X_train_vec, y_train)

# -----------------------------
# Evaluation
# -----------------------------
y_pred = model.predict(X_test_vec)

accuracy = accuracy_score(y_test, y_pred)
print(f"\nModel Accuracy: {accuracy:.4f}\n")

print("Classification Report:")
print(classification_report(y_test, y_pred))

# -----------------------------
# Save Model + Vectorizer
# -----------------------------
model_path = os.path.join(BASE_DIR, "model.pkl")
vectorizer_path = os.path.join(BASE_DIR, "vectorizer.pkl")

pickle.dump(model, open(model_path, "wb"))
pickle.dump(vectorizer, open(vectorizer_path, "wb"))

print("\n✅ Model and vectorizer saved successfully!")