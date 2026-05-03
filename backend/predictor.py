import pickle
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

model = None
vectorizer = None

try:
    model = pickle.load(open(os.path.join(BASE_DIR, "model", "model.pkl"), "rb"))
    vectorizer = pickle.load(open(os.path.join(BASE_DIR, "model", "vectorizer.pkl"), "rb"))
    print("✅ ML model loaded")
except Exception as e:
    print(f"⚠️ ML model not loaded: {e}")

def predict_news(text: str):
    if model is None or vectorizer is None:
        return {"prediction": "Unavailable", "confidence": 0.0}
    try:
        from utils.preprocess import clean_text
        cleaned = clean_text(text)
        vec = vectorizer.transform([cleaned])
        pred = model.predict(vec)[0]
        prob = model.predict_proba(vec).max()
        return {
            "prediction": "Fake" if pred == 1 else "Real",
            "confidence": float(prob)
        }
    except Exception as e:
        print(f"❌ Predict error: {e}")
        return {"prediction": "Error", "confidence": 0.0}
