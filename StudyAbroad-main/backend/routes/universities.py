from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from typing import Dict, Any, List
import math

# Import services with error handling
try:
    from services.firebase_university_service import FirebaseUniversityService
    FIREBASE_AVAILABLE = True
except ImportError as e:
    print(f"Firebase service not available: {e}")
    FIREBASE_AVAILABLE = False

from services.university_service_simple import UniversityService

# Create blueprint for university routes
universities_bp = Blueprint('universities', __name__, url_prefix='/api/universities')

# Initialize university service with Firebase fallback
if FIREBASE_AVAILABLE:
    try:
        university_service = FirebaseUniversityService()
        print("✅ Using Firebase University Service")
    except Exception as e:
        print(f"⚠️ Firebase failed, using JSON fallback: {e}")
        university_service = UniversityService()
        print("✅ Using JSON University Service")
else:
    university_service = UniversityService()
    print("✅ Using JSON University Service (Firebase not available)")

def parse_query_params(request_args: Dict[str, Any]) -> Dict[str, Any]:
    """Parse and validate query parameters for university search"""
    filters = {}
    
    # Country filter
    if 'country' in request_args:
        countries = request_args.get('country')
        if isinstance(countries, str):
            # Handle comma-separated countries - keep original case for full names
            filters['country'] = [c.strip() for c in countries.split(',') if c.strip()]
        else:
            filters['country'] = countries
    
    # Field of study filter
    if 'field' in request_args:
        fields = request_args.get('field')
        if isinstance(fields, str):
            # Handle comma-separated fields
            filters['field'] = [f.strip() for f in fields.split(',') if f.strip()]
        else:
            filters['field'] = fields
    
    # Tuition fee filters
    if 'min_tuition' in request_args:
        try:
            filters['min_tuition'] = float(request_args.get('min_tuition'))
        except (ValueError, TypeError):
            pass
    
    if 'max_tuition' in request_args:
        try:
            filters['max_tuition'] = float(request_args.get('max_tuition'))
        except (ValueError, TypeError):
            pass
    
    # CGPA requirement filters
    if 'min_cgpa' in request_args:
        try:
            filters['min_cgpa'] = float(request_args.get('min_cgpa'))
        except (ValueError, TypeError):
            pass
    
    if 'max_cgpa' in request_args:
        try:
            filters['max_cgpa'] = float(request_args.get('max_cgpa'))
        except (ValueError, TypeError):
            pass
    
    # GRE score filters
    if 'min_gre' in request_args:
        try:
            filters['min_gre'] = int(request_args.get('min_gre'))
        except (ValueError, TypeError):
            pass
    
    if 'max_gre' in request_args:
        try:
            filters['max_gre'] = int(request_args.get('max_gre'))
        except (ValueError, TypeError):
            pass
    
    # IELTS score filters
    if 'min_ielts' in request_args:
        try:
            filters['min_ielts'] = float(request_args.get('min_ielts'))
        except (ValueError, TypeError):
            pass
    
    if 'max_ielts' in request_args:
        try:
            filters['max_ielts'] = float(request_args.get('max_ielts'))
        except (ValueError, TypeError):
            pass
    
    # TOEFL score filters
    if 'min_toefl' in request_args:
        try:
            filters['min_toefl'] = int(request_args.get('min_toefl'))
        except (ValueError, TypeError):
            pass
    
    if 'max_toefl' in request_args:
        try:
            filters['max_toefl'] = int(request_args.get('max_toefl'))
        except (ValueError, TypeError):
            pass
    
    # University type filter
    if 'type' in request_args:
        uni_type = request_args.get('type')
        if uni_type:  # Accept any non-empty type value
            filters['type'] = uni_type
    
    # Ranking filters
    if 'min_ranking' in request_args:
        try:
            filters['min_ranking'] = int(request_args.get('min_ranking'))
        except (ValueError, TypeError):
            pass
    
    if 'max_ranking' in request_args:
        try:
            filters['max_ranking'] = int(request_args.get('max_ranking'))
        except (ValueError, TypeError):
            pass
    
    # Acceptance rate filters
    if 'min_acceptance_rate' in request_args:
        try:
            filters['min_acceptance_rate'] = float(request_args.get('min_acceptance_rate'))
        except (ValueError, TypeError):
            pass
    
    if 'max_acceptance_rate' in request_args:
        try:
            filters['max_acceptance_rate'] = float(request_args.get('max_acceptance_rate'))
        except (ValueError, TypeError):
            pass
    
    return filters

def paginate_results(results: List[Dict[str, Any]], page: int, per_page: int) -> Dict[str, Any]:
    """Paginate search results"""
    total = len(results)
    start = (page - 1) * per_page
    end = start + per_page
    
    paginated_results = results[start:end]
    
    return {
        'universities': paginated_results,
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': total,
            'pages': math.ceil(total / per_page) if per_page > 0 else 1,
            'has_prev': page > 1,
            'has_next': end < total
        }
    }

@universities_bp.route('', methods=['GET'])
def search_universities():
    """
    Search and filter universities with advanced filtering options
    
    Query Parameters:
    - q: Search query (university name or city)
    - country: Country code(s) (comma-separated)
    - field: Field(s) of study (comma-separated)
    - min_tuition, max_tuition: Tuition fee range
    - min_cgpa, max_cgpa: CGPA requirement range
    - min_gre, max_gre: GRE score range
    - min_ielts, max_ielts: IELTS score range
    - min_toefl, max_toefl: TOEFL score range
    - type: University type (Public/Private)
    - min_ranking, max_ranking: Ranking range
    - min_acceptance_rate, max_acceptance_rate: Acceptance rate range
    - sort_by: Sort field (ranking, tuition_fee, acceptance_rate, name)
    - sort_order: Sort order (asc, desc)
    - page: Page number (default: 1)
    - per_page: Results per page (default: 20, max: 100)
    """
    try:
        # Parse query parameters
        search_query = request.args.get('q', '').strip()
        filters = parse_query_params(request.args)
        
        # Sorting parameters
        sort_by = request.args.get('sort_by', 'ranking')
        sort_order = request.args.get('sort_order', 'asc')
        ascending = sort_order.lower() == 'asc'
        
        # Pagination parameters
        try:
            page = int(request.args.get('page', 1))
            per_page = min(int(request.args.get('per_page', 20)), 100)  # Max 100 per page
        except (ValueError, TypeError):
            page = 1
            per_page = 20
        
        if page < 1:
            page = 1
        if per_page < 1:
            per_page = 20
        
        # Get universities
        if search_query:
            # Search by name or city first, then apply filters
            universities = university_service.search_universities(search_query)
            if filters:
                # Apply additional filters to search results
                filtered_universities = []
                for university in universities:
                    if university_service._matches_filters(university, filters):
                        filtered_universities.append(university)
                universities = filtered_universities
        else:
            # Apply filters only
            if filters:
                universities = university_service.filter_universities(filters)
            else:
                universities = university_service.load_universities()
        
        # Sort results
        if sort_by in ['ranking', 'tuition_fee', 'acceptance_rate', 'name']:
            universities = university_service.sort_universities(universities, sort_by, ascending)
        
        # Paginate results
        result = paginate_results(universities, page, per_page)
        
        return jsonify({
            'success': True,
            'data': result,
            'filters_applied': filters,
            'search_query': search_query if search_query else None,
            'sort': {
                'field': sort_by,
                'order': sort_order
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to search universities',
            'code': 'SEARCH_ERROR',
            'details': str(e)
        }), 500

@universities_bp.route('/<int:university_id>', methods=['GET'])
def get_university_details(university_id: int):
    """Get detailed information about a specific university"""
    try:
        university = university_service.get_university_by_id(university_id)
        
        if not university:
            return jsonify({
                'error': 'University not found',
                'code': 'UNIVERSITY_NOT_FOUND'
            }), 404
        
        return jsonify({
            'success': True,
            'data': university
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to get university details',
            'code': 'UNIVERSITY_FETCH_ERROR',
            'details': str(e)
        }), 500

@universities_bp.route('/countries', methods=['GET'])
def get_countries():
    """Get list of available countries"""
    try:
        countries = university_service.load_countries()
        
        # If countries.json doesn't exist, extract from universities
        if not countries:
            universities = university_service.load_universities()
            country_set = set()
            for university in universities:
                if university.get('country'):
                    country_set.add(university['country'])
            
            countries = [{'code': country, 'name': country} for country in sorted(country_set)]
        
        return jsonify({
            'success': True,
            'data': countries
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to get countries',
            'code': 'COUNTRIES_FETCH_ERROR',
            'details': str(e)
        }), 500

@universities_bp.route('/fields', methods=['GET'])
def get_fields():
    """Get list of available fields of study"""
    try:
        fields = university_service.load_fields()
        
        # If fields.json doesn't exist, extract from universities
        if not fields:
            universities = university_service.load_universities()
            field_set = set()
            for university in universities:
                if university.get('fields'):
                    for field in university['fields']:
                        field_set.add(field)
            
            fields = [{'id': i+1, 'name': field} for i, field in enumerate(sorted(field_set))]
        
        return jsonify({
            'success': True,
            'data': fields
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to get fields of study',
            'code': 'FIELDS_FETCH_ERROR',
            'details': str(e)
        }), 500

@universities_bp.route('/statistics', methods=['GET'])
def get_statistics():
    """Get statistics about the university database"""
    try:
        stats = university_service.get_statistics()
        
        return jsonify({
            'success': True,
            'data': stats
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to get statistics',
            'code': 'STATISTICS_ERROR',
            'details': str(e)
        }), 500

@universities_bp.route('/search/suggestions', methods=['GET'])
def get_search_suggestions():
    """Get search suggestions based on partial query"""
    try:
        query = request.args.get('q', '').strip().lower()
        limit = min(int(request.args.get('limit', 10)), 20)  # Max 20 suggestions
        
        if not query or len(query) < 2:
            return jsonify({
                'success': True,
                'data': []
            }), 200
        
        universities = university_service.load_universities()
        suggestions = []
        
        for university in universities:
            name = university.get('name', '').lower()
            city = university.get('city', '').lower()
            
            if query in name or query in city:
                suggestions.append({
                    'id': university.get('id'),
                    'name': university.get('name'),
                    'city': university.get('city'),
                    'country': university.get('country'),
                    'type': 'university'
                })
                
                if len(suggestions) >= limit:
                    break
        
        return jsonify({
            'success': True,
            'data': suggestions
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to get search suggestions',
            'code': 'SUGGESTIONS_ERROR',
            'details': str(e)
        }), 500

@universities_bp.route('/compare', methods=['POST'])
@jwt_required()
def compare_universities():
    """Compare multiple universities side by side"""
    try:
        data = request.get_json()
        
        if not data or 'university_ids' not in data:
            return jsonify({
                'error': 'University IDs are required',
                'code': 'MISSING_UNIVERSITY_IDS'
            }), 400
        
        university_ids = data['university_ids']
        
        if not isinstance(university_ids, list) or len(university_ids) < 2:
            return jsonify({
                'error': 'At least 2 university IDs are required for comparison',
                'code': 'INSUFFICIENT_UNIVERSITIES'
            }), 400
        
        if len(university_ids) > 5:
            return jsonify({
                'error': 'Maximum 5 universities can be compared at once',
                'code': 'TOO_MANY_UNIVERSITIES'
            }), 400
        
        # Get universities
        universities = []
        not_found = []
        
        for uni_id in university_ids:
            try:
                uni_id = int(uni_id)
                university = university_service.get_university_by_id(uni_id)
                if university:
                    universities.append(university)
                else:
                    not_found.append(uni_id)
            except (ValueError, TypeError):
                not_found.append(uni_id)
        
        if not_found:
            return jsonify({
                'error': f'Universities not found: {not_found}',
                'code': 'UNIVERSITIES_NOT_FOUND'
            }), 404
        
        # Prepare comparison data
        comparison_fields = [
            'name', 'country', 'city', 'ranking', 'tuition_fee', 'living_cost',
            'application_fee', 'min_cgpa', 'min_gre', 'min_ielts', 'min_toefl',
            'acceptance_rate', 'type', 'student_population', 'international_students',
            'fields', 'established', 'website'
        ]
        
        comparison_data = {
            'universities': universities,
            'comparison': {}
        }
        
        # Create field-by-field comparison
        for field in comparison_fields:
            comparison_data['comparison'][field] = []
            for university in universities:
                comparison_data['comparison'][field].append({
                    'university_id': university.get('id'),
                    'value': university.get(field)
                })
        
        return jsonify({
            'success': True,
            'data': comparison_data
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to compare universities',
            'code': 'COMPARISON_ERROR',
            'details': str(e)
        }), 500