import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Base configuration class"""
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///database/student_abroad.db')
    
    # ML Model settings
    ML_MODEL_PATH = os.getenv('ML_MODEL_PATH', 'models/')
    
    # Scraping settings
    SCRAPING_DELAY = int(os.getenv('SCRAPING_DELAY', '1'))
    MAX_RETRIES = int(os.getenv('MAX_RETRIES', '3'))
    
    # API settings
    API_RATE_LIMIT = os.getenv('API_RATE_LIMIT', '100 per hour')
    
class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    TESTING = False

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False
    SECRET_KEY = os.getenv('SECRET_KEY')  # Must be set in production

class TestingConfig(Config):
    """Testing configuration"""
    DEBUG = True
    TESTING = True
    DATABASE_URL = 'sqlite:///:memory:'

# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}