from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from .user import Base

class Bookmark(Base):
    __tablename__ = 'bookmarks'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    university_id = Column(Integer, nullable=False)  # References university from JSON data
    university_name = Column(String(255), nullable=False)
    university_country = Column(String(100))
    notes = Column(Text)  # User's personal notes about the university
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        """Convert bookmark object to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'university_id': self.university_id,
            'university_name': self.university_name,
            'university_country': self.university_country,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class UserPreference(Base):
    __tablename__ = 'user_preferences'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    preference_type = Column(String(100), nullable=False)  # e.g., 'country', 'field', 'ranking_weight'
    preference_value = Column(String(255), nullable=False)  # The actual preference value
    weight = Column(Integer, default=1)  # Importance weight (1-10)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Convert preference object to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'preference_type': self.preference_type,
            'preference_value': self.preference_value,
            'weight': self.weight,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class SearchHistory(Base):
    __tablename__ = 'search_history'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    search_query = Column(Text)  # JSON string of search parameters
    search_type = Column(String(50), nullable=False)  # 'university_search', 'recommendation_request'
    results_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        """Convert search history object to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'search_query': self.search_query,
            'search_type': self.search_type,
            'results_count': self.results_count,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }