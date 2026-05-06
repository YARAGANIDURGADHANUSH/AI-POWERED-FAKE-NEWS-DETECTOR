import os
from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from datetime import datetime

# 1. Grab the database URL from the environment (Railway will inject this)
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# 2. Quick Fix: SQLAlchemy 1.4+ requires 'postgresql://', but Railway might output 'postgres://'
if SQLALCHEMY_DATABASE_URL and SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

# 3. Conditionally create the engine based on the environment
if not SQLALCHEMY_DATABASE_URL:
    # --- LOCAL ENVIRONMENT ---
    print("Running locally: Using SQLite database.")
    SQLALCHEMY_DATABASE_URL = "sqlite:///./fakenews.db"
    # SQLite requires the check_same_thread argument
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
else:
    # --- RAILWAY ENVIRONMENT ---
    print("Running in production: Using PostgreSQL database.")
    # PostgreSQL does NOT use the check_same_thread argument
    engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    
    # Links to the user's saved claims
    claims = relationship("SavedClaim", back_populates="owner")

class SavedClaim(Base):
    __tablename__ = "saved_claims"
    id = Column(Integer, primary_key=True, index=True)
    claim_text = Column(String)
    label = Column(String)
    confidence = Column(Float)
    explanation = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    user_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="claims")

# Create the tables in the database
Base.metadata.create_all(bind=engine)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
