"""
Recommendation and ML Prediction API Routes

This module provides Flask routes for university recommendations and admission predictions.
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import json
from datetime import datetime
from typing import Dict, List, Optional

from ml.ml_service import get_ml_service
from models.user_repository import UserRepository
from utils.data_validator import validate_user_profile_data

# Create blueprint
recommendations_bp = Blueprint('recommendations', __name__, url_prefix='/api/recommendations')

# Initialize services
ml_service = get_ml_service()
user_repository = UserRepository()


@recommendations_bp.route('/predict/<int:university_id>', methods=['POST'])
@jwt_required()
def predict_admission_probability(university_id: int):
    """
    Predict admission probability for a specific university
    
    Expected JSON payload:
    {
        "cgpa": 3.5,
        "gre_score": 320,
        "ielts_score": 7.0,
        "toefl_score": 100,
        "field_of_study": "Computer Science",
        "preferred_countries": "US,Canada",
        "budget_min": 30000,
        "budget_max": 60000
    }
    
    Or use current user profile if no data provided.
    """
    try:
        current_user_id = get_jwt_identity()
        
        # Get user profile data
        if request.json and any(key in request.json for key in ['cgpa', 'gre_score', 'ielts_score']):
            # Use provided profile data
            user_profile = request.json
            
            # Validate the provided data
            validation_result = validate_user_profile_data(user_profile)
            if not validation_result['valid']:
                return jsonify({
                    'error': 'Invalid profile data',
                    'details': validation_result['errors']
                }), 400
        else:
            # Use current user's profile from database
            user = user_repository.get_user_by_id(current_user_id)
            if not user:
                return jsonify({'error': 'User not found'}), 404
            
            user_profile = user.to_dict()
            
            # Check if user has sufficient profile data
            required_fields = ['cgpa', 'gre_score']
            missing_fields = [field for field in required_fields if not user_profile.get(field)]
            if missing_fields:
                return jsonify({
                    'error': 'Incomplete user profile',
                    'message': f'Please complete your profile. Missing: {", ".join(missing_fields)}',
                    'missing_fields': missing_fields
                }), 400
        
        # Make prediction
        prediction = ml_service.predict_admission_probability(user_profile, university_id)
        
        if 'error' in prediction:
            return jsonify(prediction), 404
        
        return jsonify({
            'success': True,
            'prediction': prediction,
            'university_id': university_id
        })
        
    except Exception as e:
        return jsonify({
            'error': 'Prediction failed',
            'message': str(e)
        }), 500


@recommendations_bp.route('/predict/batch', methods=['POST'])
@jwt_required()
def predict_batch_admission():
    """
    Predict admission probability for multiple universities
    
    Expected JSON payload:
    {
        "university_ids": [1, 2, 3, 4, 5],
        "user_profile": {  // Optional - uses current user if not provided
            "cgpa": 3.5,
            "gre_score": 320,
            "ielts_score": 7.0,
            // ... other profile fields
        }
    }
    """
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data or 'university_ids' not in data:
            return jsonify({
                'error': 'Missing required field: university_ids'
            }), 400
        
        university_ids = data['university_ids']
        if not isinstance(university_ids, list) or not university_ids:
            return jsonify({
                'error': 'university_ids must be a non-empty list'
            }), 400
        
        # Get user profile data
        if 'user_profile' in data and data['user_profile']:
            user_profile = data['user_profile']
            
            # Validate the provided data
            validation_result = validate_user_profile_data(user_profile)
            if not validation_result['valid']:
                return jsonify({
                    'error': 'Invalid profile data',
                    'details': validation_result['errors']
                }), 400
        else:
            # Use current user's profile from database
            user = user_repository.get_user_by_id(current_user_id)
            if not user:
                return jsonify({'error': 'User not found'}), 404
            
            user_profile = user.to_dict()
        
        # Make batch predictions
        predictions = ml_service.predict_batch_admission(user_profile, university_ids)
        
        # Separate successful predictions from errors
        successful_predictions = [p for p in predictions if 'error' not in p]
        failed_predictions = [p for p in predictions if 'error' in p]
        
        return jsonify({
            'success': True,
            'predictions': successful_predictions,
            'failed_predictions': failed_predictions,
            'total_requested': len(university_ids),
            'successful_count': len(successful_predictions),
            'failed_count': len(failed_predictions)
        })
        
    except Exception as e:
        return jsonify({
            'error': 'Batch prediction failed',
            'message': str(e)
        }), 500


@recommendations_bp.route('/generate', methods=['POST'])
@jwt_required(optional=True)
def generate_recommendations():
    """
    Generate personalized university recommendations
    
    Expected JSON payload:
    {
        "max_recommendations": 10,  // Optional, default 10
        "filters": {  // Optional filters
            "countries": ["US", "Canada", "UK"],
            "fields": ["Computer Science", "Engineering"],
            "max_budget": 60000,
            "max_ranking": 100,
            "min_acceptance_rate": 0.1
        },
        "user_profile": {  // Optional - uses current user if not provided
            "cgpa": 3.5,
            "gre_score": 320,
            // ... other profile fields
        }
    }
    """
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json() or {}
        
        # Get parameters
        max_recommendations = data.get('max_recommendations', 10)
        filters = data.get('filters', {})
        
        # Validate max_recommendations
        if not isinstance(max_recommendations, int) or max_recommendations < 1 or max_recommendations > 50:
            return jsonify({
                'error': 'max_recommendations must be an integer between 1 and 50'
            }), 400
        
        # Get user profile data
        if 'user_profile' in data and data['user_profile']:
            user_profile = data['user_profile']
            
            # Validate the provided data
            validation_result = validate_user_profile_data(user_profile)
            if not validation_result['valid']:
                return jsonify({
                    'error': 'Invalid profile data',
                    'details': validation_result['errors']
                }), 400
        elif current_user_id:
            # Use current user's profile from database if authenticated
            user = user_repository.get_user_by_id(current_user_id)
            if not user:
                return jsonify({'error': 'User not found'}), 404
            
            user_profile = user.to_dict()
            
            # Check if user has sufficient profile data
            required_fields = ['cgpa', 'field_of_study']
            missing_fields = [field for field in required_fields if not user_profile.get(field)]
            if missing_fields:
                return jsonify({
                    'error': 'Incomplete user profile',
                    'message': f'Please complete your profile. Missing: {", ".join(missing_fields)}',
                    'missing_fields': missing_fields
                }), 400
        else:
            # Use demo profile for unauthenticated users
            user_profile = {
                'cgpa': 3.5,
                'gre_score': 315,
                'ielts_score': 7.0,
                'toefl_score': 95,
                'field_of_study': 'Computer Science',
                'preferred_countries': 'US,UK,CA',
                'budget_min': 30000,
                'budget_max': 60000
            }
        
        # Generate recommendations
        result = ml_service.generate_recommendations(user_profile, filters, max_recommendations)
        
        if 'error' in result:
            return jsonify(result), 500
        
        return jsonify({
            'success': True,
            'recommendations': result['recommendations'],
            'summary': result['summary'],
            'total_universities_considered': result.get('total_universities_considered', 0),
            'filters_applied': filters,
            'user_profile_summary': {
                'cgpa': user_profile.get('cgpa'),
                'field_of_study': user_profile.get('field_of_study'),
                'preferred_countries': user_profile.get('preferred_countries'),
                'budget_range': f"${user_profile.get('budget_min', 0):,.0f} - ${user_profile.get('budget_max', 0):,.0f}"
            }
        })
        
    except Exception as e:
        return jsonify({
            'error': 'Recommendation generation failed',
            'message': str(e)
        }), 500


@recommendations_bp.route('/explain/<int:university_id>', methods=['POST'])
@jwt_required()
def explain_recommendation(university_id: int):
    """
    Get detailed explanation for why a university was recommended
    
    Expected JSON payload:
    {
        "user_profile": {  // Optional - uses current user if not provided
            "cgpa": 3.5,
            "gre_score": 320,
            // ... other profile fields
        }
    }
    """
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json() or {}
        
        # Get user profile data
        if 'user_profile' in data and data['user_profile']:
            user_profile = data['user_profile']
            
            # Validate the provided data
            validation_result = validate_user_profile_data(user_profile)
            if not validation_result['valid']:
                return jsonify({
                    'error': 'Invalid profile data',
                    'details': validation_result['errors']
                }), 400
        else:
            # Use current user's profile from database
            user = user_repository.get_user_by_id(current_user_id)
            if not user:
                return jsonify({'error': 'User not found'}), 404
            
            user_profile = user.to_dict()
        
        # Get explanation
        explanation = ml_service.get_recommendation_explanation(user_profile, university_id)
        
        if 'error' in explanation:
            return jsonify(explanation), 404
        
        return jsonify({
            'success': True,
            'explanation': explanation,
            'university_id': university_id
        })
        
    except Exception as e:
        return jsonify({
            'error': 'Explanation generation failed',
            'message': str(e)
        }), 500


@recommendations_bp.route('/model-info', methods=['GET'])
@jwt_required()
def get_model_info():
    """
    Get information about the ML models
    """
    try:
        model_info = ml_service.get_model_info()
        
        if 'error' in model_info:
            return jsonify(model_info), 500
        
        return jsonify({
            'success': True,
            'model_info': model_info
        })
        
    except Exception as e:
        return jsonify({
            'error': 'Unable to retrieve model information',
            'message': str(e)
        }), 500


@recommendations_bp.route('/cost-analysis', methods=['POST'])
@jwt_required()
def get_cost_analysis():
    """
    Get detailed cost analysis and trends for multiple universities
    
    Expected JSON payload:
    {
        "university_ids": [1, 2, 3, 4, 5],
        "analysis_type": "comparison",  // "comparison", "trends", "affordability"
        "user_profile": {  // Optional - uses current user if not provided
            "budget_max": 60000,
            "budget_min": 30000,
            // ... other profile fields
        }
    }
    """
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data or 'university_ids' not in data:
            return jsonify({
                'error': 'Missing required field: university_ids'
            }), 400
        
        university_ids = data['university_ids']
        analysis_type = data.get('analysis_type', 'comparison')
        
        # Get user profile data
        if 'user_profile' in data and data['user_profile']:
            user_profile = data['user_profile']
        else:
            user = user_repository.get_user_by_id(current_user_id)
            if not user:
                return jsonify({'error': 'User not found'}), 404
            user_profile = user.to_dict()
        
        # Generate cost analysis
        cost_analysis = ml_service.generate_cost_analysis(user_profile, university_ids, analysis_type)
        
        if 'error' in cost_analysis:
            return jsonify(cost_analysis), 500
        
        return jsonify({
            'success': True,
            'cost_analysis': cost_analysis,
            'analysis_type': analysis_type,
            'university_count': len(university_ids)
        })
        
    except Exception as e:
        return jsonify({
            'error': 'Cost analysis failed',
            'message': str(e)
        }), 500


@recommendations_bp.route('/cost-trends/<int:university_id>', methods=['POST'])
@jwt_required()
def get_cost_trends(university_id: int):
    """
    Get cost trends and projections for a specific university
    
    Expected JSON payload:
    {
        "years": 4,  // Number of years to project
        "inflation_rate": 3.0,  // Annual inflation rate percentage
        "user_profile": {  // Optional
            "budget_max": 60000,
            // ... other profile fields
        }
    }
    """
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json() or {}
        
        years = data.get('years', 4)
        inflation_rate = data.get('inflation_rate', 3.0)
        
        # Get user profile data
        if 'user_profile' in data and data['user_profile']:
            user_profile = data['user_profile']
        else:
            user = user_repository.get_user_by_id(current_user_id)
            if not user:
                return jsonify({'error': 'User not found'}), 404
            user_profile = user.to_dict()
        
        # Generate cost trends
        cost_trends = ml_service.generate_cost_trends(user_profile, university_id, years, inflation_rate)
        
        if 'error' in cost_trends:
            return jsonify(cost_trends), 404
        
        return jsonify({
            'success': True,
            'cost_trends': cost_trends,
            'university_id': university_id,
            'projection_years': years,
            'inflation_rate': inflation_rate
        })
        
    except Exception as e:
        return jsonify({
            'error': 'Cost trends analysis failed',
            'message': str(e)
        }), 500


@recommendations_bp.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint for the recommendation service
    """
    try:
        # Check if ML service is working
        model_info = ml_service.get_model_info()
        
        return jsonify({
            'status': 'healthy',
            'service': 'recommendations',
            'ml_models_loaded': 'error' not in model_info,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'service': 'recommendations',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500


# Error handlers
@recommendations_bp.errorhandler(400)
def bad_request(error):
    return jsonify({
        'error': 'Bad Request',
        'message': 'The request was invalid or malformed'
    }), 400


@recommendations_bp.errorhandler(401)
def unauthorized(error):
    return jsonify({
        'error': 'Unauthorized',
        'message': 'Authentication required'
    }), 401


@recommendations_bp.errorhandler(404)
def not_found(error):
    return jsonify({
        'error': 'Not Found',
        'message': 'The requested resource was not found'
    }), 404


@recommendations_bp.errorhandler(500)
def internal_error(error):
    return jsonify({
        'error': 'Internal Server Error',
        'message': 'An unexpected error occurred'
    }), 500