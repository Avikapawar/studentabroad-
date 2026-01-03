from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from datetime import datetime
from .user import Base

class RecommendationResult(Base):
    __tablename__ = 'recommendation_results'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    university_id = Column(Integer, nullable=False)  # References university from JSON data
    university_name = Column(String(255), nullable=False)
    university_country = Column(String(100))
    admission_probability = Column(Float)  # 0.0 to 1.0
    cost_fit_score = Column(Float)  # 0.0 to 1.0
    overall_score = Column(Float)  # 0.0 to 1.0
    ranking_position = Column(Integer)  # Position in recommendation list
    reasons = Column(Text)  # JSON string of recommendation reasons
    confidence_level = Column(String(20))  # 'high', 'medium', 'low'
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        """Convert recommendation result object to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'university_id': self.university_id,
            'university_name': self.university_name,
            'university_country': self.university_country,
            'admission_probability': self.admission_probability,
            'cost_fit_score': self.cost_fit_score,
            'overall_score': self.overall_score,
            'ranking_position': self.ranking_position,
            'reasons': self.reasons,
            'confidence_level': self.confidence_level,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class AdmissionPrediction(Base):
    __tablename__ = 'admission_predictions'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    university_id = Column(Integer, nullable=False)
    university_name = Column(String(255), nullable=False)
    predicted_probability = Column(Float, nullable=False)  # 0.0 to 1.0
    confidence_score = Column(Float)  # Model confidence in prediction
    factors_analyzed = Column(Text)  # JSON string of factors considered
    model_version = Column(String(50))  # Version of ML model used
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        """Convert admission prediction object to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'university_id': self.university_id,
            'university_name': self.university_name,
            'predicted_probability': self.predicted_probability,
            'confidence_score': self.confidence_score,
            'factors_analyzed': self.factors_analyzed,
            'model_version': self.model_version,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class RecommendationSession(Base):
    __tablename__ = 'recommendation_sessions'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    session_type = Column(String(50), nullable=False)  # 'full_recommendation', 'quick_match', 'comparison'
    user_profile_snapshot = Column(Text)  # JSON snapshot of user profile at time of recommendation
    total_recommendations = Column(Integer, default=0)
    filters_applied = Column(Text)  # JSON string of filters used
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Convert recommendation session object to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'session_type': self.session_type,
            'user_profile_snapshot': self.user_profile_snapshot,
            'total_recommendations': self.total_recommendations,
            'filters_applied': self.filters_applied,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }