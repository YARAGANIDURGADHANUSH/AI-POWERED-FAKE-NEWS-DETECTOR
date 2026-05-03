from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

# ✅ FIXED IMPORTS
from predictor import predict_news
from hybrid_predictor import hybrid_predict

app = FastAPI()

# ✅ CORS (correct)
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
