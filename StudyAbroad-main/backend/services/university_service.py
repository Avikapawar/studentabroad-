"""
University Service Module

This module provides functions to read, filter, and manage university data
from Firebase Firestore. It supports comprehensive filtering by various criteria
including country, field of study, tuition fees, admission requirements, etc.

Maintains backward compatibility with JSON-based operations as fallback.
"""

import json
import os
from typing import List, Dict, Any, Optional
from services.firebase_service import FirebaseService


class UniversityService:
    """Service class for managing university data operations."""
    
    def __init__(self, data_path: str = "data", use_firebase: bool = True):
        """
        Initialize the UniversityService.
        
        Args:
            data_path (str): Path to the data directory containing JSON files (fallback)
            use_firebase (bool): Whether to use Firebase or JSON files
        """
        self.data_path = data_path
        self.use_firebase = use_firebase
        self.universities_file = os.path.join(data_path, "universities.json")
        self.countries_file = os.path.join(data_path, "countries.json")
        self.fields_file = os.path.join(data_path, "fields.json")
        
        # Initialize Firebase service if enabled
        if self.use_firebase:
            try:
                self.firebase_service = FirebaseService()
                print("✅ University Service initialized with Firebase")
            except Exception as e:
                print(f"⚠️ Firebase initialization failed, falling back to JSON: {e}")
                self.use_firebase = False
                self.firebase_service = None
        else:
            self.firebase_service = None
        
    def load_universities(self) -> List[Dict[str, Any]]:
        """
        Load all universities from Firebase or JSON file.
        
        Returns:
            List[Dict[str, Any]]: List of university dictionaries
            
        Raises:
            FileNotFoundError: If universities.json file is not found (JSON mode)
            json.JSONDecodeError: If JSON file is malformed (JSON mode)
        """
        if self.use_firebase and self.firebase_service:
            try:
                return self.firebase_service.get_all_universities()
            except Exception as e:
                print(f"Firebase error, falling back to JSON: {e}")
                # Fall back to JSON
        
        # JSON fallback
        try:
            with open(self.universities_file, 'r', encoding='utf-8') as file:
                universities = json.load(file)
                return universities
        except FileNotFoundError:
            raise FileNotFoundError(f"Universities data file not found: {self.universities_file}")
        except json.JSONDecodeError as e:
            raise json.JSONDecodeError(f"Invalid JSON in universities file: {e}")
    
    def load_countries(self) -> List[Dict[str, str]]:
        """
        Load all available countries from Firebase or JSON file.
        
        Returns:
            List[Dict[str, str]]: List of country dictionaries with code and name
        """
        if self.use_firebase and self.firebase_service:
            try:
                return self.firebase_service.get_all_countries()
            except Exception as e:
                print(f"Firebase error, falling back to JSON: {e}")
                # Fall back to JSON
        
        # JSON fallback
        try:
            with open(self.countries_file, 'r', encoding='utf-8') as file:
                return json.load(file)
        except FileNotFoundError:
            return []
    
    def load_fields(self) -> List[Dict[str, Any]]:
        """
        Load all available fields of study from Firebase or JSON file.
        
        Returns:
            List[Dict[str, Any]]: List of field dictionaries with id and name
        """
        if self.use_firebase and self.firebase_service:
            try:
                return self.firebase_service.get_all_fields()
            except Exception as e:
                print(f"Firebase error, falling back to JSON: {e}")
                # Fall back to JSON
        
        # JSON fallback
        try:
            with open(self.fields_file, 'r', encoding='utf-8') as file:
                return json.load(file)
        except FileNotFoundError:
            return []
    
    def get_university_by_id(self, university_id: int) -> Optional[Dict[str, Any]]:
        """
        Get a specific university by its ID.
        
        Args:
            university_id (int): The ID of the university to retrieve
            
        Returns:
            Optional[Dict[str, Any]]: University dictionary if found, None otherwise
        """
        if self.use_firebase and self.firebase_service:
            try:
                return self.firebase_service.get_university_by_id(str(university_id))
            except Exception as e:
                print(f"Firebase error, falling back to JSON: {e}")
                # Fall back to JSON
        
        # JSON fallback
        universities = self.load_universities()
        for university in universities:
            if university.get('id') == university_id:
                return university
        return None
    
    def filter_universities(self, filters: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Filter universities based on various criteria.
        
        Args:
            filters (Dict[str, Any]): Dictionary containing filter criteria:
                - country: str or List[str] - Filter by country code(s)
                - field: str or List[str] - Filter by field(s) of study
                - min_tuition: float - Minimum tuition fee
                - max_tuition: float - Maximum tuition fee
                - min_cgpa: float - Minimum CGPA requirement
                - max_cgpa: float - Maximum CGPA requirement
                - min_gre: int - Minimum GRE score requirement
                - max_gre: int - Maximum GRE score requirement
                - min_ielts: float - Minimum IELTS score requirement
                - max_ielts: float - Maximum IELTS score requirement
                - min_toefl: int - Minimum TOEFL score requirement
                - max_toefl: int - Maximum TOEFL score requirement
                - university_type: str - Filter by university type (Public/Private)
                - min_ranking: int - Minimum ranking (lower number = better ranking)
                - max_ranking: int - Maximum ranking
                - min_acceptance_rate: float - Minimum acceptance rate
                - max_acceptance_rate: float - Maximum acceptance rate
                
        Returns:
            List[Dict[str, Any]]: Filtered list of universities
        """
        if self.use_firebase and self.firebase_service:
            try:
                return self.firebase_service.filter_universities(filters)
            except Exception as e:
                print(f"Firebase error, falling back to JSON: {e}")
                # Fall back to JSON
        
        # JSON fallback
        universities = self.load_universities()
        filtered_universities = []
        
        for university in universities:
            if self._matches_filters(university, filters):
                filtered_universities.append(university)
        
        return filtered_universities
    
    def _matches_filters(self, university: Dict[str, Any], filters: Dict[str, Any]) -> bool:
        """
        Check if a university matches the given filters.
        
        Args:
            university (Dict[str, Any]): University dictionary to check
            filters (Dict[str, Any]): Filter criteria
            
        Returns:
            bool: True if university matches all filters, False otherwise
        """
        # Country filter
        if 'country' in filters:
            countries = filters['country']
            if isinstance(countries, str):
                countries = [countries]
            if university.get('country') not in countries:
                return False
        
        # Field of study filter
        if 'field' in filters:
            fields = filters['field']
            if isinstance(fields, str):
                fields = [fields]
            university_fields = university.get('fields', [])
            if not any(field in university_fields for field in fields):
                return False
        
        # Tuition fee filters
        if 'min_tuition' in filters:
            if university.get('tuition_fee', 0) < filters['min_tuition']:
                return False
        
        if 'max_tuition' in filters:
            if university.get('tuition_fee', float('inf')) > filters['max_tuition']:
                return False
        
        # CGPA requirement filters
        if 'min_cgpa' in filters:
            if university.get('min_cgpa', 0) < filters['min_cgpa']:
                return False
        
        if 'max_cgpa' in filters:
            if university.get('min_cgpa', float('inf')) > filters['max_cgpa']:
                return False
        
        # GRE score filters
        if 'min_gre' in filters:
            if university.get('min_gre', 0) < filters['min_gre']:
                return False
        
        if 'max_gre' in filters:
            if university.get('min_gre', float('inf')) > filters['max_gre']:
                return False
        
        # IELTS score filters
        if 'min_ielts' in filters:
            if university.get('min_ielts', 0) < filters['min_ielts']:
                return False
        
        if 'max_ielts' in filters:
            if university.get('min_ielts', float('inf')) > filters['max_ielts']:
                return False
        
        # TOEFL score filters
        if 'min_toefl' in filters:
            if university.get('min_toefl', 0) < filters['min_toefl']:
                return False
        
        if 'max_toefl' in filters:
            if university.get('min_toefl', float('inf')) > filters['max_toefl']:
                return False
        
        # University type filter
        if 'university_type' in filters:
            if university.get('type') != filters['university_type']:
                return False
        
        # Ranking filters
        if 'min_ranking' in filters:
            if university.get('ranking', float('inf')) < filters['min_ranking']:
                return False
        
        if 'max_ranking' in filters:
            if university.get('ranking', 0) > filters['max_ranking']:
                return False
        
        # Acceptance rate filters
        if 'min_acceptance_rate' in filters:
            if university.get('acceptance_rate', 0) < filters['min_acceptance_rate']:
                return False
        
        if 'max_acceptance_rate' in filters:
            if university.get('acceptance_rate', 1) > filters['max_acceptance_rate']:
                return False
        
        return True
    
    def search_universities(self, query: str) -> List[Dict[str, Any]]:
        """
        Search universities by name or city.
        
        Args:
            query (str): Search query string
            
        Returns:
            List[Dict[str, Any]]: List of universities matching the search query
        """
        if self.use_firebase and self.firebase_service:
            try:
                return self.firebase_service.search_universities(query)
            except Exception as e:
                print(f"Firebase error, falling back to JSON: {e}")
                # Fall back to JSON
        
        # JSON fallback
        universities = self.load_universities()
        query_lower = query.lower()
        
        matching_universities = []
        for university in universities:
            name = university.get('name', '').lower()
            city = university.get('city', '').lower()
            
            if query_lower in name or query_lower in city:
                matching_universities.append(university)
        
        return matching_universities
    
    def sort_universities(self, universities: List[Dict[str, Any]], 
                         sort_by: str = 'ranking', 
                         ascending: bool = True) -> List[Dict[str, Any]]:
        """
        Sort universities by a specified field.
        
        Args:
            universities (List[Dict[str, Any]]): List of universities to sort
            sort_by (str): Field to sort by ('ranking', 'tuition_fee', 'acceptance_rate', 'name')
            ascending (bool): Sort in ascending order if True, descending if False
            
        Returns:
            List[Dict[str, Any]]: Sorted list of universities
        """
        def get_sort_key(university):
            value = university.get(sort_by)
            if value is None:
                # Handle None values by putting them at the end
                return float('inf') if ascending else float('-inf')
            return value
        
        return sorted(universities, key=get_sort_key, reverse=not ascending)
    
    def get_statistics(self) -> Dict[str, Any]:
        """
        Get statistics about the university database.
        
        Returns:
            Dict[str, Any]: Dictionary containing various statistics
        """
        if self.use_firebase and self.firebase_service:
            try:
                return self.firebase_service.get_statistics()
            except Exception as e:
                print(f"Firebase error, falling back to JSON: {e}")
                # Fall back to JSON
        
        # JSON fallback
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
        tuition_fees = [u.get('tuition_fee', 0) for u in universities if u.get('tuition_fee')]
        acceptance_rates = [u.get('acceptance_rate', 0) for u in universities if u.get('acceptance_rate')]
        
        country_counts = {}
        type_counts = {'Public': 0, 'Private': 0}
        
        for university in universities:
            country = university.get('country')
            if country:
                country_counts[country] = country_counts.get(country, 0) + 1
            
            uni_type = university.get('type')
            if uni_type in type_counts:
                type_counts[uni_type] += 1
        
        return {
            'total_universities': len(universities),
            'countries_count': len(countries),
            'fields_count': len(fields),
            'universities_by_country': country_counts,
            'universities_by_type': type_counts,
            'tuition_fee_stats': {
                'min': min(tuition_fees) if tuition_fees else 0,
                'max': max(tuition_fees) if tuition_fees else 0,
                'avg': sum(tuition_fees) / len(tuition_fees) if tuition_fees else 0
            },
            'acceptance_rate_stats': {
                'min': min(acceptance_rates) if acceptance_rates else 0,
                'max': max(acceptance_rates) if acceptance_rates else 0,
                'avg': sum(acceptance_rates) / len(acceptance_rates) if acceptance_rates else 0
            }
        }


# Convenience functions for direct usage
def load_universities() -> List[Dict[str, Any]]:
    """Load all universities from the JSON file."""
    service = UniversityService()
    return service.load_universities()


def filter_universities(filters: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Filter universities based on criteria."""
    service = UniversityService()
    return service.filter_universities(filters)


def search_universities(query: str) -> List[Dict[str, Any]]:
    """Search universities by name or city."""
    service = UniversityService()
    return service.search_universities(query)


def get_university_by_id(university_id: int) -> Optional[Dict[str, Any]]:
    """Get a university by its ID."""
    service = UniversityService()
    return service.get_university_by_id(university_id)