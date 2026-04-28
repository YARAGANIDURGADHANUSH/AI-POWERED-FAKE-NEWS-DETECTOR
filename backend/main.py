from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from backend.predictor import predict_news
from backend.hybrid_predictor import hybrid_predict   # 🔥 NEW

app = FastAPI()

# ✅ CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request schema
class NewsRequest(BaseModel):
    news: str

@app.get("/")
def home():
    return {"message": "Fake News Detector API is running"}

# 🧠 OLD ML endpoint
@app.post("/predict")
def predict(request: NewsRequest):
    return predict_news(request.news)

# 🔥 NEW HYBRID endpoint
@app.post("/verify")
def verify(request: NewsRequest):
    return hybrid_predict(request.news)