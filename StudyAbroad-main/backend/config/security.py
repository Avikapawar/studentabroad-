"""
Security configuration and settings
"""

import os
from datetime import timedelta

class SecurityConfig:
    """Security configuration class"""
    
    # HTTPS Configuration
    FORCE_HTTPS = os.getenv('FORCE_HTTPS', 'false').lower() == 'true'
    SSL_CERT_PATH = os.getenv('SSL_CERT_PATH', 'certs/cert.pem')
    SSL_KEY_PATH = os.getenv('SSL_KEY_PATH', 'certs/key.pem')
    
    # JWT Configuration
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', os.urandom(32))
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    JWT_ALGORITHM = 'HS256'
    JWT_BLACKLIST_ENABLED = True
    JWT_BLACKLIST_TOKEN_CHECKS = ['access', 'refresh']
    
    # Rate Limiting Configuration
    RATE_LIMIT_STORAGE_URL = os.getenv('RATE_LIMIT_STORAGE_URL', 'memory://')
    RATE_LIMIT_DEFAULT = "100 per hour"
    RATE_LIMIT_LOGIN = "10 per 15 minutes"
    RATE_LIMIT_REGISTER = "5 per hour"
    RATE_LIMIT_PASSWORD_CHANGE = "5 per hour"
    
    # Password Policy
    PASSWORD_MIN_LENGTH = 8
    PASSWORD_MAX_LENGTH = 128
    PASSWORD_REQUIRE_UPPERCASE = True
    PASSWORD_REQUIRE_LOWERCASE = True
    PASSWORD_REQUIRE_NUMBERS = True
    PASSWORD_REQUIRE_SPECIAL = True
    PASSWORD_SPECIAL_CHARS = "!@#$%^&*()_+-=[]{}|;:,.<>?"
    
    # Session Configuration
    SESSION_COOKIE_SECURE = FORCE_HTTPS
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    SESSION_PERMANENT_LIFETIME = timedelta(hours=24)
    
    # CORS Configuration
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:3000').split(',')
    CORS_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    CORS_ALLOW_HEADERS = ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token']
    CORS_SUPPORTS_CREDENTIALS = True
    CORS_MAX_AGE = 86400  # 24 hours
    
    # Content Security Policy
    CSP_DEFAULT_SRC = "'self'"
    CSP_SCRIPT_SRC = "'self' 'unsafe-inline' 'unsafe-eval'"
    CSP_STYLE_SRC = "'self' 'unsafe-inline'"
    CSP_IMG_SRC = "'self' data: https:"
    CSP_FONT_SRC = "'self' https:"
    CSP_CONNECT_SRC = "'self' https:"
    CSP_FRAME_ANCESTORS = "'none'"
    
    # Security Headers
    SECURITY_HEADERS = {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': (
            "geolocation=(), microphone=(), camera=(), "
            "payment=(), usb=(), magnetometer=(), gyroscope=(), "
            "accelerometer=(), ambient-light-sensor=()"
        )
    }
    
    # Input Validation
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB
    MAX_JSON_PAYLOAD_SIZE = 1024 * 1024  # 1MB
    MAX_FORM_FIELDS = 100
    MAX_FIELD_LENGTH = 10000
    
    # File Upload Security
    ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'doc', 'docx'}
    MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
    UPLOAD_FOLDER = 'uploads'
    
    # Database Security
    DB_POOL_SIZE = 10
    DB_MAX_OVERFLOW = 20
    DB_POOL_TIMEOUT = 30
    DB_POOL_RECYCLE = 3600
    
    # Logging Configuration
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    LOG_FILE = 'logs/security.log'
    LOG_MAX_BYTES = 10 * 1024 * 1024  # 10MB
    LOG_BACKUP_COUNT = 5
    
    # Encryption Configuration
    ENCRYPTION_KEY = os.getenv('ENCRYPTION_KEY', os.urandom(32))
    HASH_ROUNDS = 12  # bcrypt rounds
    
    # API Security
    API_KEY_LENGTH = 32
    API_KEY_EXPIRY = timedelta(days=365)
    
    # Monitoring and Alerting
    SECURITY_MONITORING_ENABLED = os.getenv('SECURITY_MONITORING_ENABLED', 'false').lower() == 'true'
    ALERT_EMAIL = os.getenv('ALERT_EMAIL', 'security@example.com')
    ALERT_WEBHOOK = os.getenv('ALERT_WEBHOOK', None)
    
    # Threat Detection
    MAX_LOGIN_ATTEMPTS = 5
    LOGIN_ATTEMPT_WINDOW = timedelta(minutes=15)
    ACCOUNT_LOCKOUT_DURATION = timedelta(hours=1)
    
    # Data Protection
    DATA_RETENTION_DAYS = 365
    GDPR_COMPLIANCE = True
    DATA_ANONYMIZATION_ENABLED = True
    
    # Backup Security
    BACKUP_ENCRYPTION_ENABLED = True
    BACKUP_RETENTION_DAYS = 30
    
    @classmethod
    def get_csp_header(cls):
        """Generate Content Security Policy header"""
        return (
            f"default-src {cls.CSP_DEFAULT_SRC}; "
            f"script-src {cls.CSP_SCRIPT_SRC}; "
            f"style-src {cls.CSP_STYLE_SRC}; "
            f"img-src {cls.CSP_IMG_SRC}; "
            f"font-src {cls.CSP_FONT_SRC}; "
            f"connect-src {cls.CSP_CONNECT_SRC}; "
            f"frame-ancestors {cls.CSP_FRAME_ANCESTORS};"
        )
    
    @classmethod
    def validate_environment(cls):
        """Validate security environment configuration"""
        issues = []
        
        # Check for production security requirements
        if os.getenv('FLASK_ENV') == 'production':
            if cls.JWT_SECRET_KEY == 'jwt-secret-string':
                issues.append("JWT_SECRET_KEY should be changed in production")
            
            if not cls.FORCE_HTTPS:
                issues.append("HTTPS should be enforced in production")
            
            if 'localhost' in cls.CORS_ORIGINS:
                issues.append("CORS origins should not include localhost in production")
        
        # Check for required environment variables
        required_vars = ['SECRET_KEY', 'DATABASE_URL']
        for var in required_vars:
            if not os.getenv(var):
                issues.append(f"Required environment variable {var} is not set")
        
        return issues

# Development vs Production configurations
class DevelopmentSecurityConfig(SecurityConfig):
    """Development-specific security configuration"""
    FORCE_HTTPS = False
    SESSION_COOKIE_SECURE = False
    CSP_SCRIPT_SRC = "'self' 'unsafe-inline' 'unsafe-eval'"
    LOG_LEVEL = 'DEBUG'

class ProductionSecurityConfig(SecurityConfig):
    """Production-specific security configuration"""
    FORCE_HTTPS = True
    SESSION_COOKIE_SECURE = True
    CSP_SCRIPT_SRC = "'self'"
    LOG_LEVEL = 'WARNING'
    SECURITY_MONITORING_ENABLED = True

def get_security_config():
    """Get appropriate security configuration based on environment"""
    env = os.getenv('FLASK_ENV', 'development')
    
    if env == 'production':
        return ProductionSecurityConfig()
    else:
        return DevelopmentSecurityConfig()