from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import get_db_session, User
import json

# Create blueprint for user routes
users_bp = Blueprint('users', __name__, url_prefix='/api/users')

def validate_cgpa(cgpa):
    """Validate CGPA value"""
    if cgpa is None:
        return True, "CGPA is optional"
    try:
        cgpa_float = float(cgpa)
        if 0.0 <= cgpa_float <= 4.0:
            return True, "Valid CGPA"
        else:
            return False, "CGPA must be between 0.0 and 4.0"
    except (ValueError, TypeError):
        return False, "CGPA must be a valid number"

def validate_gre_score(gre_score):
    """Validate GRE score"""
    if gre_score is None:
        return True, "GRE score is optional"
    try:
        gre_int = int(gre_score)
        if 260 <= gre_int <= 340:
            return True, "Valid GRE score"
        else:
            return False, "GRE score must be between 260 and 340"
    except (ValueError, TypeError):
        return False, "GRE score must be a valid integer"

def validate_ielts_score(ielts_score):
    """Validate IELTS score"""
    if ielts_score is None:
        return True, "IELTS score is optional"
    try:
        ielts_float = float(ielts_score)
        if 0.0 <= ielts_float <= 9.0:
            return True, "Valid IELTS score"
        else:
            return False, "IELTS score must be between 0.0 and 9.0"
    except (ValueError, TypeError):
        return False, "IELTS score must be a valid number"

def validate_toefl_score(toefl_score):
    """Validate TOEFL score"""
    if toefl_score is None:
        return True, "TOEFL score is optional"
    try:
        toefl_int = int(toefl_score)
        if 0 <= toefl_int <= 120:
            return True, "Valid TOEFL score"
        else:
            return False, "TOEFL score must be between 0 and 120"
    except (ValueError, TypeError):
        return False, "TOEFL score must be a valid integer"

def validate_budget(budget_min, budget_max):
    """Validate budget range"""
    if budget_min is None and budget_max is None:
        return True, "Budget is optional"
    
    try:
        if budget_min is not None:
            budget_min = float(budget_min)
            if budget_min < 0:
                return False, "Minimum budget cannot be negative"
        
        if budget_max is not None:
            budget_max = float(budget_max)
            if budget_max < 0:
                return False, "Maximum budget cannot be negative"
        
        if budget_min is not None and budget_max is not None:
            if budget_min > budget_max:
                return False, "Minimum budget cannot be greater than maximum budget"
        
        return True, "Valid budget range"
    except (ValueError, TypeError):
        return False, "Budget values must be valid numbers"

def validate_countries(countries):
    """Validate preferred countries"""
    if countries is None or countries == "":
        return True, "Countries preference is optional"
    
    try:
        if isinstance(countries, str):
            # Try to parse as JSON
            countries_list = json.loads(countries)
        elif isinstance(countries, list):
            countries_list = countries
        else:
            return False, "Countries must be a list or JSON string"
        
        if not isinstance(countries_list, list):
            return False, "Countries must be a list"
        
        if len(countries_list) > 10:
            return False, "Maximum 10 countries allowed"
        
        for country in countries_list:
            if not isinstance(country, str) or len(country.strip()) == 0:
                return False, "Each country must be a non-empty string"
        
        return True, "Valid countries list"
    except json.JSONDecodeError:
        return False, "Invalid JSON format for countries"
    except Exception:
        return False, "Invalid countries format"

@users_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Get user profile"""
    try:
        current_user_id = int(get_jwt_identity())
        
        # Get database session
        session = next(get_db_session())
        
        try:
            user = session.query(User).filter_by(id=current_user_id).first()
            
            if not user:
                return jsonify({
                    'error': 'User not found',
                    'code': 'USER_NOT_FOUND'
                }), 404
            
            return jsonify({
                'profile': user.to_dict()
            }), 200
            
        except Exception as e:
            return jsonify({
                'error': 'Failed to get profile',
                'code': 'PROFILE_FETCH_ERROR',
                'details': str(e)
            }), 500
        finally:
            session.close()
            
    except Exception as e:
        return jsonify({
            'error': 'Authentication failed',
            'code': 'AUTH_ERROR',
            'details': str(e)
        }), 401

@users_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update user profile"""
    try:
        current_user_id = int(get_jwt_identity())
        data = request.get_json()
        
        if not data:
            return jsonify({
                'error': 'No data provided',
                'code': 'NO_DATA'
            }), 400
        
        # Validate profile data
        validation_errors = []
        
        # Validate CGPA
        if 'cgpa' in data:
            is_valid, message = validate_cgpa(data['cgpa'])
            if not is_valid:
                validation_errors.append(f"CGPA: {message}")
        
        # Validate GRE score
        if 'gre_score' in data:
            is_valid, message = validate_gre_score(data['gre_score'])
            if not is_valid:
                validation_errors.append(f"GRE: {message}")
        
        # Validate IELTS score
        if 'ielts_score' in data:
            is_valid, message = validate_ielts_score(data['ielts_score'])
            if not is_valid:
                validation_errors.append(f"IELTS: {message}")
        
        # Validate TOEFL score
        if 'toefl_score' in data:
            is_valid, message = validate_toefl_score(data['toefl_score'])
            if not is_valid:
                validation_errors.append(f"TOEFL: {message}")
        
        # Validate budget
        budget_min = data.get('budget_min')
        budget_max = data.get('budget_max')
        is_valid, message = validate_budget(budget_min, budget_max)
        if not is_valid:
            validation_errors.append(f"Budget: {message}")
        
        # Validate countries
        if 'preferred_countries' in data:
            is_valid, message = validate_countries(data['preferred_countries'])
            if not is_valid:
                validation_errors.append(f"Countries: {message}")
        
        # Validate field of study
        if 'field_of_study' in data and data['field_of_study']:
            if len(data['field_of_study'].strip()) == 0:
                validation_errors.append("Field of study cannot be empty")
            elif len(data['field_of_study']) > 255:
                validation_errors.append("Field of study is too long (max 255 characters)")
        
        if validation_errors:
            return jsonify({
                'error': 'Validation failed',
                'code': 'VALIDATION_ERROR',
                'details': validation_errors
            }), 400
        
        # Get database session
        session = next(get_db_session())
        
        try:
            user = session.query(User).filter_by(id=current_user_id).first()
            
            if not user:
                return jsonify({
                    'error': 'User not found',
                    'code': 'USER_NOT_FOUND'
                }), 404
            
            # Update user profile fields
            if 'cgpa' in data:
                user.cgpa = float(data['cgpa']) if data['cgpa'] is not None else None
            
            if 'gre_score' in data:
                user.gre_score = int(data['gre_score']) if data['gre_score'] is not None else None
            
            if 'ielts_score' in data:
                user.ielts_score = float(data['ielts_score']) if data['ielts_score'] is not None else None
            
            if 'toefl_score' in data:
                user.toefl_score = int(data['toefl_score']) if data['toefl_score'] is not None else None
            
            if 'field_of_study' in data:
                user.field_of_study = data['field_of_study'].strip() if data['field_of_study'] else None
            
            if 'preferred_countries' in data:
                countries = data['preferred_countries']
                if isinstance(countries, list):
                    user.preferred_countries = json.dumps(countries)
                elif isinstance(countries, str):
                    # Validate it's proper JSON
                    json.loads(countries)
                    user.preferred_countries = countries
                else:
                    user.preferred_countries = None
            
            if 'budget_min' in data:
                user.budget_min = float(data['budget_min']) if data['budget_min'] is not None else None
            
            if 'budget_max' in data:
                user.budget_max = float(data['budget_max']) if data['budget_max'] is not None else None
            
            session.commit()
            
            return jsonify({
                'message': 'Profile updated successfully',
                'profile': user.to_dict()
            }), 200
            
        except Exception as e:
            session.rollback()
            return jsonify({
                'error': 'Failed to update profile',
                'code': 'PROFILE_UPDATE_ERROR',
                'details': str(e)
            }), 500
        finally:
            session.close()
            
    except Exception as e:
        return jsonify({
            'error': 'Invalid request data',
            'code': 'INVALID_REQUEST',
            'details': str(e)
        }), 400

@users_bp.route('/profile/academic', methods=['PUT'])
@jwt_required()
def update_academic_credentials():
    """Update only academic credentials"""
    try:
        current_user_id = int(get_jwt_identity())
        data = request.get_json()
        
        if not data:
            return jsonify({
                'error': 'No data provided',
                'code': 'NO_DATA'
            }), 400
        
        # Validate academic data
        validation_errors = []
        
        if 'cgpa' in data:
            is_valid, message = validate_cgpa(data['cgpa'])
            if not is_valid:
                validation_errors.append(f"CGPA: {message}")
        
        if 'gre_score' in data:
            is_valid, message = validate_gre_score(data['gre_score'])
            if not is_valid:
                validation_errors.append(f"GRE: {message}")
        
        if 'ielts_score' in data:
            is_valid, message = validate_ielts_score(data['ielts_score'])
            if not is_valid:
                validation_errors.append(f"IELTS: {message}")
        
        if 'toefl_score' in data:
            is_valid, message = validate_toefl_score(data['toefl_score'])
            if not is_valid:
                validation_errors.append(f"TOEFL: {message}")
        
        if validation_errors:
            return jsonify({
                'error': 'Validation failed',
                'code': 'VALIDATION_ERROR',
                'details': validation_errors
            }), 400
        
        # Get database session
        session = next(get_db_session())
        
        try:
            user = session.query(User).filter_by(id=current_user_id).first()
            
            if not user:
                return jsonify({
                    'error': 'User not found',
                    'code': 'USER_NOT_FOUND'
                }), 404
            
            # Update only academic fields
            if 'cgpa' in data:
                user.cgpa = float(data['cgpa']) if data['cgpa'] is not None else None
            
            if 'gre_score' in data:
                user.gre_score = int(data['gre_score']) if data['gre_score'] is not None else None
            
            if 'ielts_score' in data:
                user.ielts_score = float(data['ielts_score']) if data['ielts_score'] is not None else None
            
            if 'toefl_score' in data:
                user.toefl_score = int(data['toefl_score']) if data['toefl_score'] is not None else None
            
            session.commit()
            
            return jsonify({
                'message': 'Academic credentials updated successfully',
                'academic_data': {
                    'cgpa': user.cgpa,
                    'gre_score': user.gre_score,
                    'ielts_score': user.ielts_score,
                    'toefl_score': user.toefl_score
                }
            }), 200
            
        except Exception as e:
            session.rollback()
            return jsonify({
                'error': 'Failed to update academic credentials',
                'code': 'ACADEMIC_UPDATE_ERROR',
                'details': str(e)
            }), 500
        finally:
            session.close()
            
    except Exception as e:
        return jsonify({
            'error': 'Invalid request data',
            'code': 'INVALID_REQUEST',
            'details': str(e)
        }), 400

@users_bp.route('/profile/preferences', methods=['PUT'])
@jwt_required()
def update_preferences():
    """Update user preferences (countries, field of study, budget)"""
    try:
        current_user_id = int(get_jwt_identity())
        data = request.get_json()
        
        if not data:
            return jsonify({
                'error': 'No data provided',
                'code': 'NO_DATA'
            }), 400
        
        # Validate preferences data
        validation_errors = []
        
        if 'preferred_countries' in data:
            is_valid, message = validate_countries(data['preferred_countries'])
            if not is_valid:
                validation_errors.append(f"Countries: {message}")
        
        if 'field_of_study' in data and data['field_of_study']:
            if len(data['field_of_study'].strip()) == 0:
                validation_errors.append("Field of study cannot be empty")
            elif len(data['field_of_study']) > 255:
                validation_errors.append("Field of study is too long (max 255 characters)")
        
        budget_min = data.get('budget_min')
        budget_max = data.get('budget_max')
        if 'budget_min' in data or 'budget_max' in data:
            is_valid, message = validate_budget(budget_min, budget_max)
            if not is_valid:
                validation_errors.append(f"Budget: {message}")
        
        if validation_errors:
            return jsonify({
                'error': 'Validation failed',
                'code': 'VALIDATION_ERROR',
                'details': validation_errors
            }), 400
        
        # Get database session
        session = next(get_db_session())
        
        try:
            user = session.query(User).filter_by(id=current_user_id).first()
            
            if not user:
                return jsonify({
                    'error': 'User not found',
                    'code': 'USER_NOT_FOUND'
                }), 404
            
            # Update preferences
            if 'field_of_study' in data:
                user.field_of_study = data['field_of_study'].strip() if data['field_of_study'] else None
            
            if 'preferred_countries' in data:
                countries = data['preferred_countries']
                if isinstance(countries, list):
                    user.preferred_countries = json.dumps(countries)
                elif isinstance(countries, str):
                    json.loads(countries)  # Validate JSON
                    user.preferred_countries = countries
                else:
                    user.preferred_countries = None
            
            if 'budget_min' in data:
                user.budget_min = float(data['budget_min']) if data['budget_min'] is not None else None
            
            if 'budget_max' in data:
                user.budget_max = float(data['budget_max']) if data['budget_max'] is not None else None
            
            session.commit()
            
            return jsonify({
                'message': 'Preferences updated successfully',
                'preferences': {
                    'field_of_study': user.field_of_study,
                    'preferred_countries': user.preferred_countries,
                    'budget_min': user.budget_min,
                    'budget_max': user.budget_max
                }
            }), 200
            
        except Exception as e:
            session.rollback()
            return jsonify({
                'error': 'Failed to update preferences',
                'code': 'PREFERENCES_UPDATE_ERROR',
                'details': str(e)
            }), 500
        finally:
            session.close()
            
    except Exception as e:
        return jsonify({
            'error': 'Invalid request data',
            'code': 'INVALID_REQUEST',
            'details': str(e)
        }), 400


@users_bp.route('/resume', methods=['POST'])
@jwt_required()
def upload_resume():
    """Upload user resume/CV"""
    try:
        current_user_id = get_jwt_identity()
        
        # Check if file is present
        if 'resume' not in request.files:
            return jsonify({
                'error': 'No resume file provided',
                'code': 'NO_FILE'
            }), 400
        
        file = request.files['resume']
        
        if file.filename == '':
            return jsonify({
                'error': 'No file selected',
                'code': 'NO_FILE_SELECTED'
            }), 400
        
        # Validate file type
        allowed_extensions = {'pdf', 'doc', 'docx'}
        file_extension = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else ''
        
        if file_extension not in allowed_extensions:
            return jsonify({
                'error': 'Invalid file type. Only PDF, DOC, and DOCX files are allowed.',
                'code': 'INVALID_FILE_TYPE'
            }), 400
        
        # Validate file size (5MB max)
        file.seek(0, 2)  # Seek to end of file
        file_size = file.tell()
        file.seek(0)  # Reset to beginning
        
        if file_size > 5 * 1024 * 1024:  # 5MB
            return jsonify({
                'error': 'File size too large. Maximum size is 5MB.',
                'code': 'FILE_TOO_LARGE'
            }), 400
        
        # In a real application, you would:
        # 1. Save the file to a secure location (AWS S3, local storage, etc.)
        # 2. Generate a unique filename to avoid conflicts
        # 3. Store the file path/URL in the database
        
        # For demo purposes, we'll simulate file upload
        import os
        import uuid
        
        # Create uploads directory if it doesn't exist
        upload_dir = os.path.join(os.path.dirname(__file__), '..', 'uploads', 'resumes')
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generate unique filename
        unique_filename = f"{current_user_id}_{uuid.uuid4().hex[:8]}.{file_extension}"
        file_path = os.path.join(upload_dir, unique_filename)
        
        # Save file
        file.save(file_path)
        
        # Generate URL (in production, this would be a proper URL)
        resume_url = f"/api/users/resume/{unique_filename}"
        
        # Update user record
        session = next(get_db_session())
        
        try:
            user = session.query(User).filter_by(id=current_user_id).first()
            
            if not user:
                return jsonify({
                    'error': 'User not found',
                    'code': 'USER_NOT_FOUND'
                }), 404
            
            # Delete old resume file if exists
            if user.resume_url:
                old_filename = user.resume_url.split('/')[-1]
                old_file_path = os.path.join(upload_dir, old_filename)
                if os.path.exists(old_file_path):
                    os.remove(old_file_path)
            
            user.resume_url = resume_url
            session.commit()
            
            return jsonify({
                'message': 'Resume uploaded successfully',
                'resume_url': resume_url,
                'filename': unique_filename
            }), 200
            
        except Exception as e:
            session.rollback()
            # Clean up uploaded file on database error
            if os.path.exists(file_path):
                os.remove(file_path)
            return jsonify({
                'error': 'Failed to save resume information',
                'code': 'DATABASE_ERROR',
                'details': str(e)
            }), 500
        finally:
            session.close()
    
    except Exception as e:
        return jsonify({
            'error': 'Internal server error',
            'code': 'INTERNAL_ERROR',
            'details': str(e)
        }), 500


@users_bp.route('/resume', methods=['DELETE'])
@jwt_required()
def delete_resume():
    """Delete user resume/CV"""
    try:
        current_user_id = get_jwt_identity()
        session = next(get_db_session())
        
        try:
            user = session.query(User).filter_by(id=current_user_id).first()
            
            if not user:
                return jsonify({
                    'error': 'User not found',
                    'code': 'USER_NOT_FOUND'
                }), 404
            
            if not user.resume_url:
                return jsonify({
                    'error': 'No resume found to delete',
                    'code': 'NO_RESUME'
                }), 404
            
            # Delete file from storage
            filename = user.resume_url.split('/')[-1]
            upload_dir = os.path.join(os.path.dirname(__file__), '..', 'uploads', 'resumes')
            file_path = os.path.join(upload_dir, filename)
            
            if os.path.exists(file_path):
                os.remove(file_path)
            
            # Update user record
            user.resume_url = None
            session.commit()
            
            return jsonify({
                'message': 'Resume deleted successfully'
            }), 200
            
        except Exception as e:
            session.rollback()
            return jsonify({
                'error': 'Failed to delete resume',
                'code': 'DATABASE_ERROR',
                'details': str(e)
            }), 500
        finally:
            session.close()
    
    except Exception as e:
        return jsonify({
            'error': 'Internal server error',
            'code': 'INTERNAL_ERROR',
            'details': str(e)
        }), 500


@users_bp.route('/resume/<filename>', methods=['GET'])
@jwt_required()
def download_resume(filename):
    """Download/view user resume"""
    try:
        current_user_id = get_jwt_identity()
        session = next(get_db_session())
        
        try:
            user = session.query(User).filter_by(id=current_user_id).first()
            
            if not user:
                return jsonify({
                    'error': 'User not found',
                    'code': 'USER_NOT_FOUND'
                }), 404
            
            # Verify the file belongs to the current user
            if not user.resume_url or filename not in user.resume_url:
                return jsonify({
                    'error': 'Resume not found or access denied',
                    'code': 'ACCESS_DENIED'
                }), 403
            
            upload_dir = os.path.join(os.path.dirname(__file__), '..', 'uploads', 'resumes')
            file_path = os.path.join(upload_dir, filename)
            
            if not os.path.exists(file_path):
                return jsonify({
                    'error': 'Resume file not found',
                    'code': 'FILE_NOT_FOUND'
                }), 404
            
            from flask import send_file
            return send_file(file_path, as_attachment=True)
            
        finally:
            session.close()
    
    except Exception as e:
        return jsonify({
            'error': 'Internal server error',
            'code': 'INTERNAL_ERROR',
            'details': str(e)
        }), 500