# Models package initialization

# Import all models
from .user import User
from .bookmark import Bookmark, UserPreference, SearchHistory
from .recommendation import RecommendationResult, AdmissionPrediction, RecommendationSession
from .database import DatabaseManager, db_manager, get_db_session, init_db

# Export all models and database utilities
__all__ = [
    'User',
    'Bookmark',
    'UserPreference', 
    'SearchHistory',
    'RecommendationResult',
    'AdmissionPrediction',
    'RecommendationSession',
    'DatabaseManager',
    'db_manager',
    'get_db_session',
    'init_db'
]