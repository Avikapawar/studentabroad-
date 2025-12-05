"""
Comprehensive security utilities for input sanitization and validation
"""

import re
import html
import bleach
from typing import Any, Dict, List, Optional, Union
from flask import request, jsonify
from functools import wraps
import time
from collections import defaultdict, deque
import hashlib
import secrets
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SecurityError(Exception):
    """Custom exception for security-related errors"""
    pass

class InputSanitizer:
    """Comprehensive input sanitization utilities"""
    
    # Allowed HTML tags and attributes for rich text (if needed)
    ALLOWED_TAGS = ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li']
    ALLOWED_ATTRIBUTES = {}
    
    # Common XSS patterns
    XSS_PATTERNS = [
        r'<script[^>]*>.*?</script>',
        r'javascript:',
        r'vbscript:',
        r'onload\s*=',
        r'onerror\s*=',
        r'onclick\s*=',
        r'onmouseover\s*=',
        r'<iframe[^>]*>.*?</iframe>',
        r'<object[^>]*>.*?</object>',
        r'<embed[^>]*>.*?</embed>',
    ]
    
    # SQL injection patterns
    SQL_PATTERNS = [
        r'(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)',
        r'(\b(OR|AND)\s+\d+\s*=\s*\d+)',
        r'(\b(OR|AND)\s+[\'"][^\'"]*[\'"])',
        r'(--|#|/\*|\*/)',
        r'(\bUNION\s+SELECT\b)',
        r'(\bINTO\s+OUTFILE\b)',
    ]
    
    @classmethod
    def sanitize_string(cls, value: str, max_length: Optional[int] = None) -> str:
        """Sanitize string input to prevent XSS and other attacks"""
        if not isinstance(value, str):
            return str(value)
        
        # Remove null bytes
        value = value.replace('\x00', '')
        
        # HTML escape
        value = html.escape(value)
        
        # Remove potential XSS patterns
        for pattern in cls.XSS_PATTERNS:
            value = re.sub(pattern, '', value, flags=re.IGNORECASE)
        
        # Trim whitespace
        value = value.strip()
        
        # Enforce max length
        if max_length and len(value) > max_length:
            value = value[:max_length]
        
        return value
    
    @classmethod
    def sanitize_email(cls, email: str) -> str:
        """Sanitize and validate email address"""
        if not isinstance(email, str):
            raise SecurityError("Email must be a string")
        
        email = email.strip().lower()
        
        # Basic email validation
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, email):
            raise SecurityError("Invalid email format")
        
        # Check for suspicious patterns
        if any(pattern in email for pattern in ['..', '@.', '.@']):
            raise SecurityError("Invalid email format")
        
        return email
    
    @classmethod
    def sanitize_numeric(cls, value: Union[str, int, float], 
                        min_val: Optional[float] = None, 
                        max_val: Optional[float] = None,
                        allow_float: bool = True) -> Union[int, float]:
        """Sanitize numeric input"""
        try:
            if allow_float:
                num_value = float(value)
            else:
                num_value = int(value)
        except (ValueError, TypeError):
            raise SecurityError(f"Invalid numeric value: {value}")
        
        if min_val is not None and num_value < min_val:
            raise SecurityError(f"Value {num_value} is below minimum {min_val}")
        
        if max_val is not None and num_value > max_val:
            raise SecurityError(f"Value {num_value} is above maximum {max_val}")
        
        return num_value
    
    @classmethod
    def sanitize_list(cls, value: List[Any], max_items: int = 100) -> List[Any]:
        """Sanitize list input"""
        if not isinstance(value, list):
            raise SecurityError("Value must be a list")
        
        if len(value) > max_items:
            raise SecurityError(f"List too long: {len(value)} items (max {max_items})")
        
        return [cls.sanitize_string(str(item)) if isinstance(item, str) else item 
                for item in value]
    
    @classmethod
    def check_sql_injection(cls, value: str) -> bool:
        """Check for potential SQL injection patterns"""
        if not isinstance(value, str):
            return False
        
        value_upper = value.upper()
        for pattern in cls.SQL_PATTERNS:
            if re.search(pattern, value_upper, re.IGNORECASE):
                return True
        
        return False
    
    @classmethod
    def sanitize_dict(cls, data: Dict[str, Any], 
                     allowed_keys: Optional[List[str]] = None,
                     max_depth: int = 5) -> Dict[str, Any]:
        """Recursively sanitize dictionary data"""
        if max_depth <= 0:
            raise SecurityError("Maximum nesting depth exceeded")
        
        if not isinstance(data, dict):
            raise SecurityError("Data must be a dictionary")
        
        sanitized = {}
        
        for key, value in data.items():
            # Sanitize key
            clean_key = cls.sanitize_string(key, max_length=100)
            
            # Check if key is allowed
            if allowed_keys and clean_key not in allowed_keys:
                continue
            
            # Sanitize value based on type
            if isinstance(value, str):
                # Check for SQL injection
                if cls.check_sql_injection(value):
                    raise SecurityError(f"Potential SQL injection detected in field: {clean_key}")
                sanitized[clean_key] = cls.sanitize_string(value, max_length=1000)
            elif isinstance(value, (int, float)):
                sanitized[clean_key] = value
            elif isinstance(value, list):
                sanitized[clean_key] = cls.sanitize_list(value)
            elif isinstance(value, dict):
                sanitized[clean_key] = cls.sanitize_dict(value, max_depth=max_depth-1)
            elif isinstance(value, bool):
                sanitized[clean_key] = value
            elif value is None:
                sanitized[clean_key] = None
            else:
                # Convert other types to string and sanitize
                sanitized[clean_key] = cls.sanitize_string(str(value))
        
        return sanitized

class RateLimiter:
    """Rate limiting implementation"""
    
    def __init__(self):
        self.requests = defaultdict(deque)
        self.blocked_ips = defaultdict(float)
    
    def is_allowed(self, identifier: str, max_requests: int = 100, 
                   window_seconds: int = 3600, block_duration: int = 3600) -> bool:
        """Check if request is allowed based on rate limiting"""
        current_time = time.time()
        
        # Check if IP is currently blocked
        if identifier in self.blocked_ips:
            if current_time < self.blocked_ips[identifier]:
                return False
            else:
                # Unblock IP
                del self.blocked_ips[identifier]
        
        # Clean old requests
        request_times = self.requests[identifier]
        while request_times and request_times[0] < current_time - window_seconds:
            request_times.popleft()
        
        # Check rate limit
        if len(request_times) >= max_requests:
            # Block IP
            self.blocked_ips[identifier] = current_time + block_duration
            logger.warning(f"Rate limit exceeded for {identifier}. Blocking for {block_duration} seconds.")
            return False
        
        # Add current request
        request_times.append(current_time)
        return True
    
    def get_remaining_requests(self, identifier: str, max_requests: int = 100, 
                              window_seconds: int = 3600) -> int:
        """Get remaining requests for identifier"""
        current_time = time.time()
        request_times = self.requests[identifier]
        
        # Clean old requests
        while request_times and request_times[0] < current_time - window_seconds:
            request_times.popleft()
        
        return max(0, max_requests - len(request_times))

# Global rate limiter instance
rate_limiter = RateLimiter()

def get_client_ip() -> str:
    """Get client IP address from request"""
    # Check for forwarded IP (behind proxy)
    if 'X-Forwarded-For' in request.headers:
        return request.headers['X-Forwarded-For'].split(',')[0].strip()
    elif 'X-Real-IP' in request.headers:
        return request.headers['X-Real-IP']
    else:
        return request.remote_addr or 'unknown'

def rate_limit(max_requests: int = 100, window_seconds: int = 3600, 
               per_user: bool = False):
    """Rate limiting decorator"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Determine identifier
            if per_user:
                # Use user ID if authenticated, otherwise IP
                from flask_jwt_extended import get_jwt_identity, jwt_required
                try:
                    identifier = get_jwt_identity() or get_client_ip()
                except:
                    identifier = get_client_ip()
            else:
                identifier = get_client_ip()
            
            # Check rate limit
            if not rate_limiter.is_allowed(identifier, max_requests, window_seconds):
                remaining = rate_limiter.get_remaining_requests(identifier, max_requests, window_seconds)
                return jsonify({
                    'error': 'Rate limit exceeded',
                    'code': 'RATE_LIMITED',
                    'retry_after': window_seconds,
                    'remaining_requests': remaining
                }), 429
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def sanitize_request_data(allowed_keys: Optional[List[str]] = None):
    """Decorator to sanitize request data"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            try:
                if request.is_json:
                    data = request.get_json()
                    if data:
                        sanitized_data = InputSanitizer.sanitize_dict(data, allowed_keys)
                        # Replace request data with sanitized version
                        request._cached_json = (sanitized_data, True)
                
                return f(*args, **kwargs)
            except SecurityError as e:
                logger.warning(f"Security error from {get_client_ip()}: {str(e)}")
                return jsonify({
                    'error': 'Invalid input data',
                    'code': 'SECURITY_ERROR',
                    'details': str(e)
                }), 400
            except Exception as e:
                logger.error(f"Unexpected error in sanitization: {str(e)}")
                return jsonify({
                    'error': 'Request processing failed',
                    'code': 'PROCESSING_ERROR'
                }), 500
        
        return decorated_function
    return decorator

def validate_content_type(allowed_types: List[str] = ['application/json']):
    """Decorator to validate request content type"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if request.method in ['POST', 'PUT', 'PATCH']:
                content_type = request.content_type
                if not content_type or not any(allowed in content_type for allowed in allowed_types):
                    return jsonify({
                        'error': 'Invalid content type',
                        'code': 'INVALID_CONTENT_TYPE',
                        'allowed_types': allowed_types
                    }), 400
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def log_security_event(event_type: str, details: Dict[str, Any]):
    """Log security events for monitoring"""
    log_entry = {
        'timestamp': time.time(),
        'event_type': event_type,
        'ip_address': get_client_ip(),
        'user_agent': request.headers.get('User-Agent', 'Unknown'),
        'details': details
    }
    
    logger.warning(f"Security Event: {event_type} - {details}")
    
    # In production, you would send this to your security monitoring system
    # Example: send_to_security_monitoring(log_entry)

def generate_csrf_token() -> str:
    """Generate CSRF token"""
    return secrets.token_urlsafe(32)

def validate_csrf_token(token: str, expected_token: str) -> bool:
    """Validate CSRF token"""
    return secrets.compare_digest(token, expected_token)

class SecurityHeaders:
    """Security headers management"""
    
    @staticmethod
    def add_security_headers(response):
        """Add security headers to response"""
        # Prevent XSS attacks
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        
        # HTTPS enforcement (in production)
        if not response.headers.get('Strict-Transport-Security'):
            response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        
        # Content Security Policy
        csp = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self' https:; "
            "connect-src 'self' https:; "
            "frame-ancestors 'none';"
        )
        response.headers['Content-Security-Policy'] = csp
        
        # Referrer Policy
        response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        
        # Permissions Policy
        response.headers['Permissions-Policy'] = (
            "geolocation=(), microphone=(), camera=(), "
            "payment=(), usb=(), magnetometer=(), gyroscope=(), "
            "accelerometer=(), ambient-light-sensor=()"
        )
        
        return response

def secure_filename(filename: str) -> str:
    """Secure filename for file uploads"""
    # Remove path components
    filename = filename.split('/')[-1].split('\\')[-1]
    
    # Remove dangerous characters
    filename = re.sub(r'[^\w\-_\.]', '', filename)
    
    # Limit length
    if len(filename) > 255:
        name, ext = filename.rsplit('.', 1) if '.' in filename else (filename, '')
        filename = name[:250] + ('.' + ext if ext else '')
    
    return filename

def hash_password(password: str, salt: Optional[str] = None) -> tuple:
    """Hash password with salt"""
    if salt is None:
        salt = secrets.token_hex(32)
    
    # Use PBKDF2 with SHA-256
    password_hash = hashlib.pbkdf2_hmac('sha256', 
                                       password.encode('utf-8'), 
                                       salt.encode('utf-8'), 
                                       100000)  # 100,000 iterations
    
    return password_hash.hex(), salt

def verify_password(password: str, password_hash: str, salt: str) -> bool:
    """Verify password against hash"""
    computed_hash, _ = hash_password(password, salt)
    return secrets.compare_digest(computed_hash, password_hash)