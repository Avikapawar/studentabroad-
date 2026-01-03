from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import get_db_session, User
from models.bookmark import Bookmark
from sqlalchemy.exc import IntegrityError

# Import services with error handling
try:
    from services.firebase_university_service import FirebaseUniversityService
    FIREBASE_AVAILABLE = True
except ImportError as e:
    print(f"Firebase service not available: {e}")
    FIREBASE_AVAILABLE = False

from services.university_service_simple import UniversityService

# Create blueprint for bookmark routes
bookmarks_bp = Blueprint('bookmarks', __name__, url_prefix='/api/bookmarks')

# Initialize university service with Firebase fallback
if FIREBASE_AVAILABLE:
    try:
        university_service = FirebaseUniversityService()
        print("✅ Bookmarks using Firebase University Service")
    except Exception as e:
        print(f"⚠️ Bookmarks Firebase failed, using JSON fallback: {e}")
        university_service = UniversityService()
        print("✅ Bookmarks using JSON University Service")
else:
    university_service = UniversityService()
    print("✅ Bookmarks using JSON University Service (Firebase not available)")

@bookmarks_bp.route('', methods=['GET'])
@jwt_required()
def get_user_bookmarks():
    """Get all bookmarked universities for the current user"""
    try:
        current_user_id = int(get_jwt_identity())
        
        # Get database session
        session = next(get_db_session())
        
        try:
            # Get user's bookmarks
            bookmarks = session.query(Bookmark).filter_by(user_id=current_user_id).all()
            
            # Get university details for each bookmark
            bookmarked_universities = []
            for bookmark in bookmarks:
                university = university_service.get_university_by_id(bookmark.university_id)
                if university:
                    bookmarked_universities.append({
                        'bookmark_id': bookmark.id,
                        'university': university,
                        'bookmarked_at': bookmark.created_at.isoformat(),
                        'notes': bookmark.notes
                    })
            
            return jsonify({
                'success': True,
                'data': bookmarked_universities,
                'total': len(bookmarked_universities)
            }), 200
            
        except Exception as e:
            return jsonify({
                'error': 'Failed to get bookmarks',
                'code': 'BOOKMARKS_FETCH_ERROR',
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

@bookmarks_bp.route('', methods=['POST'])
@jwt_required()
def add_bookmark():
    """Add a university to user's bookmarks"""
    try:
        current_user_id = int(get_jwt_identity())
        data = request.get_json()
        
        if not data or 'university_id' not in data:
            return jsonify({
                'error': 'University ID is required',
                'code': 'MISSING_UNIVERSITY_ID'
            }), 400
        
        university_id = data['university_id']
        notes = data.get('notes', '')
        
        # Validate university exists
        university = university_service.get_university_by_id(university_id)
        if not university:
            return jsonify({
                'error': 'University not found',
                'code': 'UNIVERSITY_NOT_FOUND'
            }), 404
        
        # Get database session
        session = next(get_db_session())
        
        try:
            # Check if bookmark already exists
            existing_bookmark = session.query(Bookmark).filter_by(
                user_id=current_user_id,
                university_id=university_id
            ).first()
            
            if existing_bookmark:
                return jsonify({
                    'error': 'University is already bookmarked',
                    'code': 'ALREADY_BOOKMARKED'
                }), 409
            
            # Create new bookmark
            new_bookmark = Bookmark(
                user_id=current_user_id,
                university_id=university_id,
                university_name=university.get('name', ''),
                university_country=university.get('country', ''),
                notes=notes
            )
            
            session.add(new_bookmark)
            session.commit()
            
            return jsonify({
                'success': True,
                'message': 'University bookmarked successfully',
                'data': {
                    'bookmark_id': new_bookmark.id,
                    'university_id': university_id,
                    'bookmarked_at': new_bookmark.created_at.isoformat(),
                    'notes': new_bookmark.notes
                }
            }), 201
            
        except IntegrityError:
            session.rollback()
            return jsonify({
                'error': 'University is already bookmarked',
                'code': 'ALREADY_BOOKMARKED'
            }), 409
        except Exception as e:
            session.rollback()
            return jsonify({
                'error': 'Failed to add bookmark',
                'code': 'BOOKMARK_ADD_ERROR',
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

@bookmarks_bp.route('/<int:bookmark_id>', methods=['DELETE'])
@jwt_required()
def remove_bookmark(bookmark_id: int):
    """Remove a bookmark"""
    try:
        current_user_id = int(get_jwt_identity())
        
        # Get database session
        session = next(get_db_session())
        
        try:
            # Find the bookmark
            bookmark = session.query(Bookmark).filter_by(
                id=bookmark_id,
                user_id=current_user_id
            ).first()
            
            if not bookmark:
                return jsonify({
                    'error': 'Bookmark not found',
                    'code': 'BOOKMARK_NOT_FOUND'
                }), 404
            
            # Delete the bookmark
            session.delete(bookmark)
            session.commit()
            
            return jsonify({
                'success': True,
                'message': 'Bookmark removed successfully'
            }), 200
            
        except Exception as e:
            session.rollback()
            return jsonify({
                'error': 'Failed to remove bookmark',
                'code': 'BOOKMARK_REMOVE_ERROR',
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

@bookmarks_bp.route('/university/<int:university_id>', methods=['DELETE'])
@jwt_required()
def remove_bookmark_by_university(university_id: int):
    """Remove a bookmark by university ID"""
    try:
        current_user_id = int(get_jwt_identity())
        
        # Get database session
        session = next(get_db_session())
        
        try:
            # Find the bookmark
            bookmark = session.query(Bookmark).filter_by(
                user_id=current_user_id,
                university_id=university_id
            ).first()
            
            if not bookmark:
                return jsonify({
                    'error': 'Bookmark not found',
                    'code': 'BOOKMARK_NOT_FOUND'
                }), 404
            
            # Delete the bookmark
            session.delete(bookmark)
            session.commit()
            
            return jsonify({
                'success': True,
                'message': 'Bookmark removed successfully'
            }), 200
            
        except Exception as e:
            session.rollback()
            return jsonify({
                'error': 'Failed to remove bookmark',
                'code': 'BOOKMARK_REMOVE_ERROR',
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

@bookmarks_bp.route('/<int:bookmark_id>', methods=['PUT'])
@jwt_required()
def update_bookmark(bookmark_id: int):
    """Update bookmark notes"""
    try:
        current_user_id = int(get_jwt_identity())
        data = request.get_json()
        
        if not data:
            return jsonify({
                'error': 'No data provided',
                'code': 'NO_DATA'
            }), 400
        
        # Get database session
        session = next(get_db_session())
        
        try:
            # Find the bookmark
            bookmark = session.query(Bookmark).filter_by(
                id=bookmark_id,
                user_id=current_user_id
            ).first()
            
            if not bookmark:
                return jsonify({
                    'error': 'Bookmark not found',
                    'code': 'BOOKMARK_NOT_FOUND'
                }), 404
            
            # Update bookmark
            if 'notes' in data:
                bookmark.notes = data['notes']
            
            session.commit()
            
            return jsonify({
                'success': True,
                'message': 'Bookmark updated successfully',
                'data': {
                    'bookmark_id': bookmark.id,
                    'university_id': bookmark.university_id,
                    'notes': bookmark.notes,
                    'updated_at': bookmark.updated_at.isoformat() if bookmark.updated_at else None
                }
            }), 200
            
        except Exception as e:
            session.rollback()
            return jsonify({
                'error': 'Failed to update bookmark',
                'code': 'BOOKMARK_UPDATE_ERROR',
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

@bookmarks_bp.route('/check/<int:university_id>', methods=['GET'])
@jwt_required()
def check_bookmark_status(university_id: int):
    """Check if a university is bookmarked by the current user"""
    try:
        current_user_id = int(get_jwt_identity())
        
        # Get database session
        session = next(get_db_session())
        
        try:
            # Check if bookmark exists
            bookmark = session.query(Bookmark).filter_by(
                user_id=current_user_id,
                university_id=university_id
            ).first()
            
            return jsonify({
                'success': True,
                'data': {
                    'is_bookmarked': bookmark is not None,
                    'bookmark_id': bookmark.id if bookmark else None
                }
            }), 200
            
        except Exception as e:
            return jsonify({
                'error': 'Failed to check bookmark status',
                'code': 'BOOKMARK_CHECK_ERROR',
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