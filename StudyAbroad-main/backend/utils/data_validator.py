"""
Data Validator Module

This module provides functions to validate the structure and integrity
of university data in JSON files.
"""

import json
from typing import List, Dict, Any, Set


def validate_university_data(universities: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Validate the structure and integrity of university data.
    
    Args:
        universities (List[Dict[str, Any]]): List of university dictionaries
        
    Returns:
        Dict[str, Any]: Validation results with errors and warnings
    """
    errors = []
    warnings = []
    
    required_fields = [
        'id', 'name', 'country', 'city', 'ranking', 'fields',
        'tuition_fee', 'living_cost', 'application_fee', 'min_cgpa',
        'min_gre', 'min_ielts', 'min_toefl', 'acceptance_rate',
        'website', 'established', 'type', 'student_population',
        'international_students'
    ]
    
    seen_ids = set()
    seen_names = set()
    
    for i, university in enumerate(universities):
        # Check required fields
        for field in required_fields:
            if field not in university:
                errors.append(f"University {i}: Missing required field '{field}'")
            elif university[field] is None:
                warnings.append(f"University {i} ({university.get('name', 'Unknown')}): Field '{field}' is None")
        
        # Check for duplicate IDs
        uni_id = university.get('id')
        if uni_id in seen_ids:
            errors.append(f"University {i}: Duplicate ID {uni_id}")
        else:
            seen_ids.add(uni_id)
        
        # Check for duplicate names
        uni_name = university.get('name')
        if uni_name in seen_names:
            warnings.append(f"University {i}: Duplicate name '{uni_name}'")
        else:
            seen_names.add(uni_name)
        
        # Validate data types and ranges
        if 'tuition_fee' in university:
            if not isinstance(university['tuition_fee'], (int, float)) or university['tuition_fee'] < 0:
                errors.append(f"University {i} ({uni_name}): Invalid tuition_fee")
        
        if 'acceptance_rate' in university:
            rate = university['acceptance_rate']
            if not isinstance(rate, (int, float)) or rate < 0 or rate > 1:
                errors.append(f"University {i} ({uni_name}): Invalid acceptance_rate (should be 0-1)")
        
        if 'min_cgpa' in university:
            cgpa = university['min_cgpa']
            if not isinstance(cgpa, (int, float)) or cgpa < 0 or cgpa > 4.0:
                warnings.append(f"University {i} ({uni_name}): Unusual min_cgpa value: {cgpa}")
        
        if 'fields' in university:
            if not isinstance(university['fields'], list):
                errors.append(f"University {i} ({uni_name}): 'fields' should be a list")
    
    return {
        'total_universities': len(universities),
        'errors': errors,
        'warnings': warnings,
        'is_valid': len(errors) == 0
    }


def validate_university_json_file(file_path: str) -> Dict[str, Any]:
    """
    Validate a university JSON file.
    
    Args:
        file_path (str): Path to the JSON file
        
    Returns:
        Dict[str, Any]: Validation results
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            universities = json.load(file)
        
        if not isinstance(universities, list):
            return {
                'total_universities': 0,
                'errors': ['Root element should be a list'],
                'warnings': [],
                'is_valid': False
            }
        
        return validate_university_data(universities)
    
    except FileNotFoundError:
        return {
            'total_universities': 0,
            'errors': [f'File not found: {file_path}'],
            'warnings': [],
            'is_valid': False
        }
    except json.JSONDecodeError as e:
        return {
            'total_universities': 0,
            'errors': [f'Invalid JSON: {e}'],
            'warnings': [],
            'is_valid': False
        }


def validate_user_profile_data(profile: Dict[str, Any]) -> Dict[str, Any]:
    """
    Validate user profile data for ML predictions and recommendations.
    
    Args:
        profile (Dict[str, Any]): User profile dictionary
        
    Returns:
        Dict[str, Any]: Validation results with errors and valid flag
    """
    errors = []
    warnings = []
    
    # Check CGPA
    if 'cgpa' in profile:
        cgpa = profile['cgpa']
        if not isinstance(cgpa, (int, float)):
            errors.append("CGPA must be a number")
        elif cgpa < 0 or cgpa > 4.0:
            errors.append("CGPA must be between 0.0 and 4.0")
    
    # Check GRE score
    if 'gre_score' in profile:
        gre = profile['gre_score']
        if not isinstance(gre, (int, float)):
            errors.append("GRE score must be a number")
        elif gre < 260 or gre > 340:
            warnings.append("GRE score should typically be between 260 and 340")
    
    # Check IELTS score
    if 'ielts_score' in profile:
        ielts = profile['ielts_score']
        if not isinstance(ielts, (int, float)):
            errors.append("IELTS score must be a number")
        elif ielts < 0 or ielts > 9.0:
            errors.append("IELTS score must be between 0.0 and 9.0")
    
    # Check TOEFL score
    if 'toefl_score' in profile:
        toefl = profile['toefl_score']
        if not isinstance(toefl, (int, float)):
            errors.append("TOEFL score must be a number")
        elif toefl < 0 or toefl > 120:
            warnings.append("TOEFL score should typically be between 0 and 120")
    
    # Check budget values
    if 'budget_min' in profile:
        budget_min = profile['budget_min']
        if not isinstance(budget_min, (int, float)):
            errors.append("Minimum budget must be a number")
        elif budget_min < 0:
            errors.append("Minimum budget cannot be negative")
    
    if 'budget_max' in profile:
        budget_max = profile['budget_max']
        if not isinstance(budget_max, (int, float)):
            errors.append("Maximum budget must be a number")
        elif budget_max < 0:
            errors.append("Maximum budget cannot be negative")
    
    # Check budget consistency
    if 'budget_min' in profile and 'budget_max' in profile:
        if (isinstance(profile['budget_min'], (int, float)) and 
            isinstance(profile['budget_max'], (int, float)) and
            profile['budget_min'] > profile['budget_max']):
            errors.append("Minimum budget cannot be greater than maximum budget")
    
    # Check field of study
    if 'field_of_study' in profile:
        field = profile['field_of_study']
        if not isinstance(field, str):
            errors.append("Field of study must be a string")
        elif len(field.strip()) == 0:
            warnings.append("Field of study is empty")
    
    # Check preferred countries
    if 'preferred_countries' in profile:
        countries = profile['preferred_countries']
        if not isinstance(countries, str):
            errors.append("Preferred countries must be a string")
    
    return {
        'valid': len(errors) == 0,
        'errors': errors,
        'warnings': warnings
    }


if __name__ == "__main__":
    # Validate the universities.json file
    import os
    
    data_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'universities.json')
    results = validate_university_json_file(data_path)
    
    print("University Data Validation Results")
    print("=" * 40)
    print(f"Total universities: {results['total_universities']}")
    print(f"Valid: {results['is_valid']}")
    
    if results['errors']:
        print(f"\nErrors ({len(results['errors'])}):")
        for error in results['errors']:
            print(f"  - {error}")
    
    if results['warnings']:
        print(f"\nWarnings ({len(results['warnings'])}):")
        for warning in results['warnings']:
            print(f"  - {warning}")
    
    if results['is_valid']:
        print("\n✓ University data is valid!")
    else:
        print("\n✗ University data has errors that need to be fixed.")