from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

# Create base class for models
Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    cgpa = Column(Float)
    gre_score = Column(Integer)
    ielts_score = Column(Float)
    toefl_score = Column(Integer)
    field_of_study = Column(String(255))
    preferred_countries = Column(Text)  # JSON string of countries
    budget_min = Column(Float)
    budget_max = Column(Float)
    resume_url = Column(String(500))  # URL to uploaded resume file
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Convert user object to dictionary"""
        return {
            'id': self.id,
            'email': self.email,
            'cgpa': self.cgpa,
            'gre_score': self.gre_score,
            'ielts_score': self.ielts_score,
            'toefl_score': self.toefl_score,
            'field_of_study': self.field_of_study,
            'preferred_countries': self.preferred_countries,
            'budget_min': self.budget_min,
            'budget_max': self.budget_max,
            'resume_url': self.resume_url,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }