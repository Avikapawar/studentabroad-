from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, create_refresh_token
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.exc import IntegrityError
from models import get_db_session, User
import re
from datetime import timedelta

# Create blueprint for authentication routes
auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    """Simple password validation"""
    if not password:
        return False, "Password is required"
    if len(password) < 6:
        return False, "Password must be at least 6 characters long"
    if len(password) > 128:
        return False, "Password is too long (maximum 128 characters)"
    return True, "Password is valid"

@auth_bp.route('/register', methods=['POST'])
def register():
    """Simplified user registration endpoint"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({
                'error': 'Email and password are required',
                'code': 'MISSING_FIELDS'
            }), 400
        
        # Get and validate email
        email = data.get('email', '').strip().lower()
        if not validate_email(email):
            return jsonify({
                'error': 'Invalid email format',
                'code': 'INVALID_EMAIL'
            }), 400
        
        password = data.get('password')
        
        # Simple password validation
        is_valid, message = validate_password(password)
        if not is_valid:
            return jsonify({
                'error': message,
                'code': 'WEAK_PASSWORD'
            }), 400
        
        # Get database session
        session = next(get_db_session())
        
        try:
            # Check if user already exists
            existing_user = session.query(User).filter_by(email=email).first()
            if existing_user:
                return jsonify({
                    'error': 'User with this email already exists',
                    'code': 'USER_EXISTS'
                }), 409
            
            # Hash password
            password_hash = generate_password_hash(password)
            
            # Create new user
            new_user = User(
                email=email,
                password_hash=password_hash
            )
            
            session.add(new_user)
            session.commit()
            
            # Create access and refresh tokens
            access_token = create_access_token(
                identity=str(new_user.id),
                expires_delta=timedelta(hours=1)
            )
            refresh_token = create_refresh_token(
                identity=str(new_user.id),
                expires_delta=timedelta(days=30)
            )
            
            return jsonify({
                'message': 'User registered successfully',
                'user': {
                    'id': new_user.id,
                    'email': new_user.email
                },
                'access_token': access_token,
                'refresh_token': refresh_token
            }), 201
            
        except IntegrityError:
            session.rollback()
            return jsonify({
                'error': 'User with this email already exists',
                'code': 'USER_EXISTS'
            }), 409
        except Exception as e:
            session.rollback()
            return jsonify({
                'error': 'Registration failed',
                'code': 'REGISTRATION_ERROR'
            }), 500
        finally:
            session.close()
            
    except Exception as e:
        return jsonify({
            'error': 'Invalid request data',
            'code': 'INVALID_REQUEST'
        }), 400

@auth_bp.route('/login', methods=['POST'])
def login():
    """Simplified user login endpoint"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({
                'error': 'Email and password are required',
                'code': 'MISSING_CREDENTIALS'
            }), 400
        
        # Get email and password
        email = data.get('email', '').strip().lower()
        password = data.get('password')
        
        # Validate email format
        if not validate_email(email):
            return jsonify({
                'error': 'Invalid email format',
                'code': 'INVALID_EMAIL'
            }), 400
        
        # Get database session
        session = next(get_db_session())
        
        try:
            # Find user by email
            user = session.query(User).filter_by(email=email).first()
            
            if not user or not check_password_hash(user.password_hash, password):
                return jsonify({
                    'error': 'Invalid email or password',
                    'code': 'INVALID_CREDENTIALS'
                }), 401
            
            # Create access and refresh tokens
            access_token = create_access_token(
                identity=str(user.id),
                expires_delta=timedelta(hours=1)
            )
            refresh_token = create_refresh_token(
                identity=str(user.id),
                expires_delta=timedelta(days=30)
            )
            
            return jsonify({
                'message': 'Login successful',
                'user': {
                    'id': user.id,
                    'email': user.email
                },
                'access_token': access_token,
                'refresh_token': refresh_token
            }), 200
            
        except Exception as e:
            session.rollback()
            return jsonify({
                'error': 'Login failed',
                'code': 'LOGIN_ERROR'
            }), 500
        finally:
            session.close()
            
    except Exception as e:
        return jsonify({
            'error': 'Invalid request data',
            'code': 'INVALID_REQUEST'
        }), 400


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Refresh access token endpoint"""
    try:
        current_user_id = get_jwt_identity()
        
        # Create new access token
        new_access_token = create_access_token(
            identity=str(current_user_id),
            expires_delta=timedelta(hours=1)
        )
        
        return jsonify({
            'access_token': new_access_token
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': 'Token refresh failed',
            'code': 'REFRESH_ERROR'
        }), 500

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current user information"""
    try:
        current_user_id = int(get_jwt_identity())
        
        # Get database session
        session = next(get_db_session())
        
        try:
            user = session.query(User).filter_by(id=current_user_id).first()
            
            if not user:
                log_security_event('USER_NOT_FOUND', {
                    'ip': get_client_ip(),
                    'user_id': current_user_id
                })
                return jsonify({
                    'error': 'User not found',
                    'code': 'USER_NOT_FOUND'
                }), 404
            
            return jsonify({
                'user': user.to_dict()
            }), 200
            
        except Exception as e:
            log_security_event('USER_FETCH_ERROR', {
                'ip': get_client_ip(),
                'user_id': current_user_id,
                'error': str(e)
            })
            return jsonify({
                'error': 'Failed to get user information',
                'code': 'USER_FETCH_ERROR',
                'details': str(e)
            }), 500
        finally:
            session.close()
            
    except Exception as e:
        log_security_event('AUTH_ERROR', {
            'ip': get_client_ip(),
            'error': str(e)
        })
        return jsonify({
            'error': 'Authentication failed',
            'code': 'AUTH_ERROR',
            'details': str(e)
        }), 401

@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """Change user password with enhanced security"""
    try:
        current_user_id = int(get_jwt_identity())
        data = request.get_json()
        
        # Validate required fields
        if not data or not data.get('current_password') or not data.get('new_password'):
            log_security_event('PASSWORD_CHANGE_MISSING_FIELDS', {
                'ip': get_client_ip(),
                'user_id': current_user_id
            })
            return jsonify({
                'error': 'Current password and new password are required',
                'code': 'MISSING_FIELDS'
            }), 400
        
        current_password = data.get('current_password')
        new_password = data.get('new_password')
        
        # Validate new password strength
        is_valid, message = validate_password(new_password)
        if not is_valid:
            log_security_event('PASSWORD_CHANGE_WEAK_PASSWORD', {
                'ip': get_client_ip(),
                'user_id': current_user_id,
                'password_length': len(new_password)
            })
            return jsonify({
                'error': message,
                'code': 'WEAK_PASSWORD'
            }), 400
        
        # Check if new password is same as current
        if current_password == new_password:
            log_security_event('PASSWORD_CHANGE_SAME_PASSWORD', {
                'ip': get_client_ip(),
                'user_id': current_user_id
            })
            return jsonify({
                'error': 'New password must be different from current password',
                'code': 'SAME_PASSWORD'
            }), 400
        
        # Get database session
        session = next(get_db_session())
        
        try:
            user = session.query(User).filter_by(id=current_user_id).first()
            
            if not user:
                log_security_event('PASSWORD_CHANGE_USER_NOT_FOUND', {
                    'ip': get_client_ip(),
                    'user_id': current_user_id
                })
                return jsonify({
                    'error': 'User not found',
                    'code': 'USER_NOT_FOUND'
                }), 404
            
            # Verify current password
            if not check_password_hash(user.password_hash, current_password):
                log_security_event('PASSWORD_CHANGE_INVALID_CURRENT', {
                    'ip': get_client_ip(),
                    'user_id': current_user_id,
                    'email': user.email
                })
                return jsonify({
                    'error': 'Current password is incorrect',
                    'code': 'INVALID_PASSWORD'
                }), 401
            
            # Update password
            user.password_hash = generate_password_hash(new_password)
            session.commit()
            
            log_security_event('PASSWORD_CHANGE_SUCCESS', {
                'ip': get_client_ip(),
                'user_id': current_user_id,
                'email': user.email
            })
            
            return jsonify({
                'message': 'Password changed successfully'
            }), 200
            
        except Exception as e:
            session.rollback()
            log_security_event('PASSWORD_CHANGE_DATABASE_ERROR', {
                'ip': get_client_ip(),
                'user_id': current_user_id,
                'error': str(e)
            })
            return jsonify({
                'error': 'Failed to change password',
                'code': 'PASSWORD_CHANGE_ERROR',
                'details': str(e)
            }), 500
        finally:
            session.close()
            
    except SecurityError as e:
        log_security_event('PASSWORD_CHANGE_SECURITY_ERROR', {
            'ip': get_client_ip(),
            'error': str(e)
        })
        return jsonify({
            'error': 'Security validation failed',
            'code': 'SECURITY_ERROR'
        }), 400
    except Exception as e:
        log_security_event('PASSWORD_CHANGE_UNEXPECTED_ERROR', {
            'ip': get_client_ip(),
            'error': str(e)
        })
        return jsonify({
            'error': 'Invalid request data',
            'code': 'INVALID_REQUEST',
            'details': str(e)
        }), 400

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """Logout endpoint (for logging purposes)"""
    try:
        current_user_id = get_jwt_identity()
        
        log_security_event('LOGOUT', {
            'ip': get_client_ip(),
            'user_id': current_user_id
        })
        
        return jsonify({
            'message': 'Logged out successfully'
        }), 200
        
    except Exception as e:
        log_security_event('LOGOUT_ERROR', {
            'ip': get_client_ip(),
            'error': str(e)
        })
        return jsonify({
            'error': 'Logout failed',
            'code': 'LOGOUT_ERROR'
        }), 500