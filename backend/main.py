from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
import os

# Internal Imports
from database import get_db, User, SavedClaim
from auth import get_password_hash, verify_password, create_access_token, get_current_user
from rag_engine import rag_pipeline, rag_pipeline_geo
from geo_store import get_heatmap, get_leaderboard, get_trends

app = FastAPI(title="FakeNews AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, change to your Vercel URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- SCHEMAS ---
class NewsRequest(BaseModel):
    news: str

class GeoRequest(BaseModel):
    news: str
    country: str
    region: str

class UserCreate(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class ClaimSave(BaseModel):
    claim_text: str
    label: str
    confidence: float
    explanation: str

# --- SYSTEM ENDPOINTS ---
@app.get("/")
def home():
    return {"message": "Fake News Detector API is running"}

@app.get("/ping")
def ping():
    return {"status": "alive"}

# --- AUTHENTICATION ENDPOINTS ---
@app.post("/register")
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pw = get_password_hash(user.password)
    new_user = User(name=user.name, email=user.email, hashed_password=hashed_pw)
    db.add(new_user)
    db.commit()
    return {"message": "User registered successfully"}

@app.post("/login")
def login_user(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    access_token = create_access_token(data={"sub": db_user.email})
    return {
        "access_token": access_token, 
        "token_type": "bearer", 
        "user": {"name": db_user.name, "email": db_user.email}
    }

# --- HISTORY ENDPOINTS ---
@app.post("/save-claim")
def save_claim(claim: ClaimSave, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    new_claim = SavedClaim(
        claim_text=claim.claim_text,
        label=claim.label,
        confidence=claim.confidence,
        explanation=claim.explanation,
        user_id=current_user.id
    )
    db.add(new_claim)
    db.commit()
    return {"message": "Claim saved successfully!", "id": new_claim.id}

@app.get("/history")
def get_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    claims = db.query(SavedClaim).filter(SavedClaim.user_id == current_user.id).order_by(SavedClaim.timestamp.desc()).all()
    return claims

# --- AI FACT CHECKING ENDPOINTS ---
@app.post("/verify")
def verify(request: NewsRequest):
    try:
        return rag_pipeline(request.news)
    except Exception as e:
        return {"error": str(e)}

@app.post("/geo-verify")
def geo_verify(request: GeoRequest):
    try:
        return rag_pipeline_geo(request.news, request.country, request.region)
    except Exception as e:
        return {"error": str(e)}

@app.post("/predict")
def predict(request: NewsRequest):
    return {"message": "Deprecated endpoint. Use /verify instead.", "status": "deprecated"}

# --- GEO DASHBOARD ENDPOINTS ---
@app.get("/geo-heatmap")
def geo_heatmap():
    return get_heatmap()

@app.get("/geo-leaderboard")
def geo_leaderboard():
    return get_leaderboard()

@app.get("/geo-trends/{state}")
def geo_trends(state: str):
    return get_trends(state)
