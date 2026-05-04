from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from rag_engine import rag_pipeline

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


@app.get("/ping")
def ping():
    return {"status": "alive"}


@app.post("/verify")
def verify(request: NewsRequest):
    try:
        return rag_pipeline(request.news)
    except Exception as e:
        return {"error": str(e)}


# 🔥 Replace old ML endpoint
@app.post("/predict")
def predict(request: NewsRequest):
    return {
        "message": "Deprecated endpoint. Use /verify instead.",
        "status": "deprecated"
    }
