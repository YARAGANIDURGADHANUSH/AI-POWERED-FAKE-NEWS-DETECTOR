from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

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

@app.post("/verify")
def verify(request: NewsRequest):
    try:
        from hybrid_predictor import hybrid_predict
        return hybrid_predict(request.news)
    except Exception as e:
        return {"error": str(e)}

@app.post("/predict")
def predict(request: NewsRequest):
    try:
        from predictor import predict_news
        return predict_news(request.news)
    except Exception as e:
        return {"error": str(e)}
