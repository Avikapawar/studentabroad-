"""
Firebase University Service
Simple service that connects to Firebase for the website
"""
import firebase_admin
from firebase_admin import credentials, firestore
import os
from typing import List, Dict, Any, Optional

class FirebaseUniversityService:
    """Service class for Firebase university operations"""
    
    def __init__(self):
        """Initialize Firebase service"""
        try:
            # Initialize Firebase if not already done
            if not firebase_admin._apps:
                service_account_path = "studyabroad-e9afb-firebase-adminsdk-fbsvc-a1e7ee1a7f.json"
                if os.path.exists(service_account_path):
                    cred = credentials.Certificate(service_account_path)
                    firebase_admin.initialize_app(cred)
                else:
                    raise Exception("Firebase service account file not found")
            
            self.db = firestore.client()
            print("✅ Firebase University Service initialized")
            
        except Exception as e:
            print(f"❌ Firebase initialization failed: {e}")
            raise
    
    def load_universities(self) -> List[Dict[str, Any]]:
        """Load all universities from Firebase"""
        try:
            universities_ref = self.db.collection('universities')
            docs = universities_ref.stream()
            
            universities = []
            for doc in docs:
                university = doc.to_dict()
                university['id'] = int(doc.id) if doc.id.isdigit() else doc.id
                universities.append(university)
            
            return universities
        except Exception as e:
            print(f"Error loading universities: {e}")
            return []
    
    def load_countries(self) -> List[Dict[str, str]]:
        """Load all countries from Firebase"""
        try:
            countries_ref = self.db.collection('countries')
            docs = countries_ref.order_by('name').stream()
            
            countries = []
            for doc in docs:
                country = doc.to_dict()
                countries.append(country)
            
            return countries
        except Exception as e:
            print(f"Error loading countries: {e}")
            return []
    
    def load_fields(self) -> List[Dict[str, Any]]:
        """Load all fields from Firebase"""
        try:
            fields_ref = self.db.collection('fields')
            docs = fields_ref.order_by('name').stream()
            
            fields = []
            for doc in docs:
                field = doc.to_dict()
                fields.append(field)
            
            return fields
        except Exception as e:
            print(f"Error loading fields: {e}")
            return []
    
    def get_university_by_id(self, university_id: int) -> Optional[Dict[str, Any]]:
        """Get university by ID from Firebase"""
        try:
            doc_ref = self.db.collection('universities').document(str(university_id))
            doc = doc_ref.get()
            
            if doc.exists:
                university = doc.to_dict()
                university['id'] = int(doc.id) if doc.id.isdigit() else doc.id
                return university
            return None
        except Exception as e:
            print(f"Error getting university {university_id}: {e}")
            return None
    
    def filter_universities(self, filters: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Filter universities based on criteria"""
        try:
            # Start with base query
            query = self.db.collection('universities')
            
            # Apply Firebase-compatible filters
            if 'country' in filters:
                countries = filters['country']
                if isinstance(countries, str):
                    countries = [countries]
                if countries and len(countries) <= 10:  # Firestore 'in' limit
                    query = query.where('country', 'in', countries)
            
            # Get results and apply additional filters
            docs = query.stream()
            universities = []
            
            for doc in docs:
                university = doc.to_dict()
                university['id'] = int(doc.id) if doc.id.isdigit() else doc.id
                
                # Apply additional filters that can't be done in Firestore
                if self._matches_filters(university, filters):
                    universities.append(university)
            
            return universities
            
        except Exception as e:
            print(f"Error filtering universities: {e}")
            return []
    
    def _matches_filters(self, university: Dict[str, Any], filters: Dict[str, Any]) -> bool:
        """Check if university matches all filters"""
        
        # Country filter (if not already applied in Firestore)
        if 'country' in filters:
            countries = filters['country']
            if isinstance(countries, str):
                countries = [countries]
            if len(countries) > 10:  # If too many for Firestore 'in' query
                if university.get('country') not in countries:
                    return False
        
        # Field filter
        if 'field' in filters:
            fields = filters['field']
            if isinstance(fields, str):
                fields = [fields]
            university_fields = university.get('fields', [])
            if not any(field in university_fields for field in fields):
                return False
        
        # Tuition filters
        if 'min_tuition' in filters and filters['min_tuition']:
            if university.get('tuition_fee', 0) < float(filters['min_tuition']):
                return False
        
        if 'max_tuition' in filters and filters['max_tuition']:
            if university.get('tuition_fee', float('inf')) > float(filters['max_tuition']):
                return False
        
        # Ranking filters
        if 'min_ranking' in filters and filters['min_ranking']:
            if university.get('ranking', float('inf')) < int(filters['min_ranking']):
                return False
        
        if 'max_ranking' in filters and filters['max_ranking']:
            if university.get('ranking', 0) > int(filters['max_ranking']):
                return False
        
        # CGPA filters - Fixed logic
        # min_cgpa filter: user wants universities where they can get in with their CGPA
        # So university's requirement should be <= user's CGPA
        if 'min_cgpa' in filters and filters['min_cgpa']:
            user_cgpa = float(filters['min_cgpa'])
            uni_requirement = university.get('min_cgpa', 0)
            if uni_requirement > user_cgpa:  # University requires more than user has
                return False
        
        # max_cgpa filter: user wants universities with CGPA requirement <= this value
        if 'max_cgpa' in filters and filters['max_cgpa']:
            max_requirement = float(filters['max_cgpa'])
            uni_requirement = university.get('min_cgpa', 0)
            if uni_requirement > max_requirement:  # University requires more than the limit
                return False
        
        # GRE filters - Fixed logic
        if 'min_gre' in filters and filters['min_gre']:
            user_gre = int(filters['min_gre'])
            uni_requirement = university.get('min_gre', 0)
            if uni_requirement > user_gre:  # University requires more than user has
                return False
        
        if 'max_gre' in filters and filters['max_gre']:
            max_requirement = int(filters['max_gre'])
            uni_requirement = university.get('min_gre', 0)
            if uni_requirement > max_requirement:  # University requires more than the limit
                return False
        
        # IELTS filters - Fixed logic
        if 'min_ielts' in filters and filters['min_ielts']:
            user_ielts = float(filters['min_ielts'])
            uni_requirement = university.get('min_ielts', 0)
            if uni_requirement > user_ielts:  # University requires more than user has
                return False
        
        if 'max_ielts' in filters and filters['max_ielts']:
            max_requirement = float(filters['max_ielts'])
            uni_requirement = university.get('min_ielts', 0)
            if uni_requirement > max_requirement:  # University requires more than the limit
                return False
        
        # TOEFL filters - Fixed logic
        if 'min_toefl' in filters and filters['min_toefl']:
            user_toefl = int(filters['min_toefl'])
            uni_requirement = university.get('min_toefl', 0)
            if uni_requirement > user_toefl:  # University requires more than user has
                return False
        
        if 'max_toefl' in filters and filters['max_toefl']:
            max_requirement = int(filters['max_toefl'])
            uni_requirement = university.get('min_toefl', 0)
            if uni_requirement > max_requirement:  # University requires more than the limit
                return False
        
        # Acceptance rate filters
        if 'min_acceptance_rate' in filters and filters['min_acceptance_rate']:
            if university.get('acceptance_rate', 0) < float(filters['min_acceptance_rate']):
                return False
        
        if 'max_acceptance_rate' in filters and filters['max_acceptance_rate']:
            if university.get('acceptance_rate', 1.0) > float(filters['max_acceptance_rate']):
                return False
        
        # University type filter (case-insensitive)
        if 'type' in filters and filters['type']:
            filter_type = filters['type'].strip().lower()
            uni_type = university.get('type', '').strip().lower()
            if uni_type != filter_type:
                return False
        
        return True
    
    def search_universities(self, query: str) -> List[Dict[str, Any]]:
        """Search universities by name or other fields"""
        try:
            # Get all universities and filter client-side
            # Note: Firestore doesn't support full-text search natively
            all_universities = self.load_universities()
            
            query_lower = query.lower()
            matching_universities = []
            
            for university in all_universities:
                # Search in name, city, country, and fields
                searchable_text = ' '.join([
                    university.get('name', ''),
                    university.get('city', ''),
                    university.get('country', ''),
                    ' '.join(university.get('fields', []))
                ]).lower()
                
                if query_lower in searchable_text:
                    matching_universities.append(university)
            
            return matching_universities
            
        except Exception as e:
            print(f"Error searching universities: {e}")
            return []
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get database statistics"""
        try:
            universities = self.load_universities()
            countries = self.load_countries()
            fields = self.load_fields()
            
            if not universities:
                return {
                    'total_universities': 0,
                    'countries_count': len(countries),
                    'fields_count': len(fields)
                }
            
            # Calculate statistics
            country_counts = {}
            field_counts = {}
            
            for uni in universities:
                # Country statistics
                country = uni.get('country')
                if country:
                    country_counts[country] = country_counts.get(country, 0) + 1
                
                # Field statistics
                for field in uni.get('fields', []):
                    field_counts[field] = field_counts.get(field, 0) + 1
            
            return {
                'total_universities': len(universities),
                'countries_count': len(countries),
                'fields_count': len(fields),
                'universities_by_country': country_counts,
                'universities_by_field': field_counts
            }
            
        except Exception as e:
            print(f"Error calculating statistics: {e}")
            return {}
    
    def sort_universities(self, universities: List[Dict[str, Any]], 
                         sort_by: str = 'ranking', 
                         ascending: bool = True) -> List[Dict[str, Any]]:
        """Sort universities by specified field"""
        def get_sort_key(university):
            value = university.get(sort_by)
            if value is None:
                return float('inf') if ascending else float('-inf')
            return value
        
        return sorted(universities, key=get_sort_key, reverse=not ascending)