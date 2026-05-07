from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv

# Import the new decoupled logic handlers
from detector_logic import run_global_detector
from analyzer_logic import run_geo_analyzer

load_dotenv()

app = FastAPI(title="FakeNews AI API")

# ✅ THE CORS FIX: Trusting your Vercel UI
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://ai-powered-fake-news-detector.vercel.app",
        "https://ai-powered-fake-news-detector-jm4xvzb04.vercel.app",
        "*" # (Optional wildcard: temporarily allows ALL websites to test the connection)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ClaimRequest(BaseModel):
    claim: str

class GeoClaimRequest(BaseModel):
    claim: str
    region: str
    country: str = "India" # Default to India

# ✅ THE RAILWAY HEALTHCHECK FIX
@app.get("/ping")
async def ping():
    """Railway uses this to check if the server is awake."""
    return {"status": "alive and healthy"}

@app.post("/verify")
async def global_fact_check(request: ClaimRequest):
    """Endpoint for the standard Fact Detector tool."""
    try:
        result = run_global_detector(request.claim)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/geo-verify")
async def regional_fact_check(request: GeoClaimRequest):
    """Endpoint for the Geo Analysis tool."""
    try:
        result = run_geo_analyzer(request.claim, request.region, request.country)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
