from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from backend.predictor import predict_news
from backend.hybrid_predictor import hybrid_predict   # ✅ THIS LINE MUST MATCH

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class NewsRequest(BaseModel):
    news: str

@app.get("/")
def home():
    return {"message": "Fake News Detector API is running"}

@app.post("/predict")
def predict(request: NewsRequest):
    return predict_news(request.news)

@app.post("/verify")
def verify(request: NewsRequest):
    return hybrid_predict(request.news)