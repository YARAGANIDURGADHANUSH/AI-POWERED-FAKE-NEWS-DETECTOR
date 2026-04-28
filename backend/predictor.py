import pickle
from backend.utils.preprocess import clean_text

# Load model once (efficient)
model = pickle.load(open("backend/model/model.pkl", "rb"))
vectorizer = pickle.load(open("backend/model/vectorizer.pkl", "rb"))

def predict_news(text: str):
    cleaned = clean_text(text)
    vec = vectorizer.transform([cleaned])

    pred = model.predict(vec)[0]
    prob = model.predict_proba(vec).max()

    return {
        "prediction": "Fake" if pred == 1 else "Real",
        "confidence": float(prob)
    }