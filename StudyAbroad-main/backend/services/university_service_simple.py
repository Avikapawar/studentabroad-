"""
University Service Module - Simplified Version
Works with JSON files and has Firebase integration ready for when needed
"""

import json
import os
from typing import List, Dict, Any, Optional


class UniversityService:
    """Service class for managing university data operations."""
    
    def __init__(self, data_path: str = "data"):
        """
        Initialize the UniversityService.
        
        Args:
            data_path (str): Path to the data directory containing JSON files
        """
        self.data_path = data_path
        self.universities_file = os.path.join(data_path, "universities.json")
        self.countries_file = os.path.join(data_path, "countries.json")
        self.fields_file = os.path.join(data_path, "fields.json")
        
        print("✅ University Service initialized (JSON mode)")
        
    def load_universities(self) -> List[Dict[str, Any]]:
        """
        Load all universities from the JSON file.
        
        Returns:
            List[Dict[str, Any]]: List of university dictionaries
        """
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
        Load all available countries from the JSON file.
        
        Returns:
            List[Dict[str, str]]: List of country dictionaries with code and name
        """
        try:
            with open(self.countries_file, 'r', encoding='utf-8') as file:
                return json.load(file)
        except FileNotFoundError:
            return []
    
    def load_fields(self) -> List[Dict[str, Any]]:
        """
        Load all available fields of study from the JSON file.
        
        Returns:
            List[Dict[str, Any]]: List of field dictionaries with id and name
        """
        try:
            with open(self.fields_file, 'r', encoding='utf-8') as file:
                return json.load(file)
        except FileNotFoundError:
            # Extract fields from universities if fields.json doesn't exist
            universities = self.load_universities()
            all_fields = set()
            for uni in universities:
                if uni.get('fields'):
                    all_fields.update(uni['fields'])
            
            fields_data = []
            for i, field_name in enumerate(sorted(all_fields), 1):
                fields_data.append({
                    'id': i,
                    'name': field_name
                })
            return fields_data
    
    def get_university_by_id(self, university_id: int) -> Optional[Dict[str, Any]]:
        """
        Get a specific university by its ID.
        
        Args:
            university_id (int): The ID of the university to retrieve
            
        Returns:
            Optional[Dict[str, Any]]: University dictionary if found, None otherwise
        """
        universities = self.load_universities()
        for university in universities:
            if university.get('id') == university_id:
                return university
        return None
    
    def filter_universities(self, filters: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Filter universities based on various criteria.
        
        Args:
            filters (Dict[str, Any]): Dictionary containing filter criteria
                
        Returns:
            List[Dict[str, Any]]: Filtered list of universities
        """
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
        # Country filter - handle both country codes and full names
        if 'country' in filters:
            countries = filters['country']
            if isinstance(countries, str):
                countries = [countries]
            
            uni_country = university.get('country', '')
            
            # Country code to name mapping
            country_mapping = {
                'US': 'United States', 'UK': 'United Kingdom', 'CA': 'Canada',
                'AU': 'Australia', 'DE': 'Germany', 'FR': 'France', 'NL': 'Netherlands',
                'SE': 'Sweden', 'NO': 'Norway', 'DK': 'Denmark', 'FI': 'Finland',
                'CH': 'Switzerland', 'AT': 'Austria', 'BE': 'Belgium', 'IE': 'Ireland',
                'ES': 'Spain', 'IT': 'Italy', 'PT': 'Portugal', 'PL': 'Poland',
                'CZ': 'Czech Republic', 'HU': 'Hungary', 'GR': 'Greece', 'RO': 'Romania',
                'BG': 'Bulgaria', 'CN': 'China', 'JP': 'Japan', 'KR': 'South Korea',
                'IN': 'India', 'SG': 'Singapore', 'HK': 'Hong Kong', 'TW': 'Taiwan',
                'MY': 'Malaysia', 'TH': 'Thailand', 'ID': 'Indonesia', 'PH': 'Philippines',
                'VN': 'Vietnam', 'NZ': 'New Zealand', 'ZA': 'South Africa',
                'BR': 'Brazil', 'AR': 'Argentina', 'CL': 'Chile', 'MX': 'Mexico',
                'CO': 'Colombia', 'PE': 'Peru', 'CR': 'Costa Rica',
                'AE': 'United Arab Emirates', 'SA': 'Saudi Arabia', 'IL': 'Israel',
                'TR': 'Turkey', 'EG': 'Egypt', 'JO': 'Jordan', 'LB': 'Lebanon',
                'QA': 'Qatar', 'RU': 'Russia', 'IS': 'Iceland', 'LU': 'Luxembourg',
                'MT': 'Malta', 'CY': 'Cyprus'
            }
            
            # Create reverse mapping (name to code)
            name_to_code = {v: k for k, v in country_mapping.items()}
            
            # Check if university country matches any filter (code or name)
            match_found = False
            for filter_country in countries:
                # Direct match
                if uni_country == filter_country:
                    match_found = True
                    break
                # Check if filter is a code and uni has full name
                elif filter_country in country_mapping and country_mapping[filter_country] == uni_country:
                    match_found = True
                    break
                # Check if filter is a name and uni has code
                elif filter_country in name_to_code and name_to_code[filter_country] == uni_country:
                    match_found = True
                    break
            
            if not match_found:
                return False
        
        # Field filter
        if 'field' in filters:
            fields = filters['field']
            if isinstance(fields, str):
                fields = [fields]
            university_fields = university.get('fields', [])
            if not any(field in university_fields for field in fields):
                return False
        
        # Tuition fee filters
        if 'min_tuition' in filters and filters['min_tuition']:
            if university.get('tuition_fee', 0) < float(filters['min_tuition']):
                return False
        
        if 'max_tuition' in filters and filters['max_tuition']:
            if university.get('tuition_fee', float('inf')) > float(filters['max_tuition']):
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
        
        # University type filter (case-insensitive)
        if 'type' in filters and filters['type']:
            filter_type = filters['type'].strip().lower()
            uni_type = university.get('type', '').strip().lower()
            if uni_type != filter_type:
                return False
        
        # Ranking filters
        if 'min_ranking' in filters and filters['min_ranking']:
            if university.get('ranking', float('inf')) < int(filters['min_ranking']):
                return False
        
        if 'max_ranking' in filters and filters['max_ranking']:
            if university.get('ranking', 0) > int(filters['max_ranking']):
                return False
        
        # Acceptance rate filters
        if 'min_acceptance_rate' in filters and filters['min_acceptance_rate']:
            if university.get('acceptance_rate', 0) < float(filters['min_acceptance_rate']):
                return False
        
        if 'max_acceptance_rate' in filters and filters['max_acceptance_rate']:
            if university.get('acceptance_rate', 1.0) > float(filters['max_acceptance_rate']):
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
        universities = self.load_universities()
        query_lower = query.lower()
        
        matching_universities = []
        for university in universities:
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
        tuition_fees = [u.get('tuition_fee', 0) for u in universities if u.get('tuition_fee') is not None]
        acceptance_rates = [u.get('acceptance_rate', 0) for u in universities if u.get('acceptance_rate') is not None]
        
        country_counts = {}
        type_counts = {'Public': 0, 'Private': 0}
        field_counts = {}
        
        for university in universities:
            # Count by country
            country = university.get('country')
            if country:
                country_counts[country] = country_counts.get(country, 0) + 1
            
            # Count by type
            uni_type = university.get('type', 'Unknown')
            if uni_type in type_counts:
                type_counts[uni_type] += 1
            
            # Count by fields
            for field in university.get('fields', []):
                field_counts[field] = field_counts.get(field, 0) + 1
        
        return {
            'total_universities': len(universities),
            'countries_count': len(countries),
            'fields_count': len(fields),
            'universities_by_country': country_counts,
            'universities_by_type': type_counts,
            'universities_by_field': field_counts,
            'tuition_stats': {
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