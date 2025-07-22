
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import os

# Database URL for SQLite
SQLALCHEMY_DATABASE_URL = "sqlite:///./auth_system.db"

# Create SQLite engine
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False}  # Required for SQLite
)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class
Base = declarative_base()

def get_db():
    """Database dependency that yields a database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
