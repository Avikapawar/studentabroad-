from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

# Database configuration
DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///database/student_abroad.db')

class DatabaseManager:
    def __init__(self, database_url=None):
        self.database_url = database_url or DATABASE_URL
        self.engine = None
        self.SessionLocal = None
        
    def initialize_database(self):
        """Initialize database connection and create tables"""
        # Create engine
        self.engine = create_engine(
            self.database_url,
            echo=False,  # Set to True for SQL debugging
            connect_args={"check_same_thread": False} if "sqlite" in self.database_url else {}
        )
        
        # Create session factory
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        
        # Create all tables
        self.create_tables()
        
        return self.engine
    
    def create_tables(self):
        """Create all database tables"""
        # Import all models to ensure they're registered with Base
        from .user import Base, User
        from .bookmark import Bookmark, UserPreference, SearchHistory
        from .recommendation import RecommendationResult, AdmissionPrediction, RecommendationSession
        
        # Create all tables
        Base.metadata.create_all(bind=self.engine)
        
        print("Database tables created successfully")
    
    def get_session(self):
        """Get a database session"""
        if not self.SessionLocal:
            raise Exception("Database not initialized. Call initialize_database() first.")
        return self.SessionLocal()
    
    def close_connection(self):
        """Close database connection"""
        if self.engine:
            self.engine.dispose()

# Global database manager instance
db_manager = DatabaseManager()

def get_db_session():
    """Dependency to get database session"""
    session = db_manager.get_session()
    try:
        yield session
    finally:
        session.close()

def init_db():
    """Initialize database - convenience function"""
    return db_manager.initialize_database()