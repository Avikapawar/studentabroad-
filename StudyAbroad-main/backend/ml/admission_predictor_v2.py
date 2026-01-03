"""
Admission Probability Prediction Model - Rule-based version

This module implements a rule-based admission prediction model that provides
realistic admission probabilities based on student credentials vs university requirements.
"""

import numpy as np
import json
import os
from typing import Dict, List, Tuple, Optional


class RealisticAdmissionPredictor:
    """
    Rule-based admission prediction model that provides realistic probabilities
    """
    
    def __init__(self):
        self.is_trained = True  # Rule-based, always ready
        self.competition_multipliers = {
            'top_10': 0.3,      # Ivy League, MIT, Stanford
            'top_50': 0.6,      # Top 50 universities
            'top_100': 0.8,     # Top 100 universities
            'other': 1.0        # Other universities
        }
    
    def predict(self, student_data: Dict, university_data: Dict) -> Dict:
        """
        Predict admission probability using realistic rule-based approach
        
        Args:
            student_data: Dictionary containing student academic data
            university_data: Dictionary containing university data
            
        Returns:
            Dictionary with prediction results
        """
        # Extract student scores
        student_cgpa = student_data.get('cgpa', 0)
        student_gre = student_data.get('gre_score', 0)
        student_ielts = student_data.get('ielts_score', 0)
        student_toefl = student_data.get('toefl_score', 0)
        
        # Convert TOEFL to IELTS equivalent if needed
        if student_toefl > 0 and student_ielts == 0:
            student_ielts = self._toefl_to_ielts(student_toefl)
        
        # Extract university requirements
        min_cgpa = university_data.get('min_cgpa', 0)
        min_gre = university_data.get('min_gre', 0)
        min_ielts = university_data.get('min_ielts', 0)
        min_toefl = university_data.get('min_toefl', 0)
        
        # Convert TOEFL requirement to IELTS equivalent if needed
        if min_toefl > 0 and min_ielts == 0:
            min_ielts = self._toefl_to_ielts(min_toefl)
        
        # Get university ranking and acceptance rate
        ranking = university_data.get('ranking', 1000)
        acceptance_rate = university_data.get('acceptanceRate', 0.5)
        
        # Calculate admission probability using realistic rules
        admission_prob = self._calculate_admission_probability(
            student_cgpa, student_gre, student_ielts,
            min_cgpa, min_gre, min_ielts,
            ranking, acceptance_rate
        )
        
        # Calculate confidence based on data completeness
        confidence = self._calculate_confidence(student_data, university_data)
        
        return {
            'admission_probability': round(admission_prob, 3),
            'confidence': round(confidence, 3),
            'probability_category': self._categorize_probability(admission_prob),
            'meets_minimum_requirements': self._check_minimum_requirements(
                student_cgpa, student_gre, student_ielts,
                min_cgpa, min_gre, min_ielts
            )
        }
    
    def _toefl_to_ielts(self, toefl_score: float) -> float:
        """Convert TOEFL score to IELTS equivalent"""
        if toefl_score >= 118: return 9.0
        elif toefl_score >= 115: return 8.5
        elif toefl_score >= 110: return 8.0
        elif toefl_score >= 102: return 7.5
        elif toefl_score >= 94: return 7.0
        elif toefl_score >= 79: return 6.5
        elif toefl_score >= 60: return 6.0
        elif toefl_score >= 46: return 5.5
        else: return 5.0
    
    def _check_minimum_requirements(self, student_cgpa: float, student_gre: float, student_ielts: float,
                                   min_cgpa: float, min_gre: float, min_ielts: float) -> Dict:
        """Check which minimum requirements are met"""
        return {
            'cgpa': student_cgpa >= min_cgpa if min_cgpa > 0 else True,
            'gre': student_gre >= min_gre if min_gre > 0 else True,
            'ielts': student_ielts >= min_ielts if min_ielts > 0 else True,
            'all': (student_cgpa >= min_cgpa if min_cgpa > 0 else True) and
                   (student_gre >= min_gre if min_gre > 0 else True) and
                   (student_ielts >= min_ielts if min_ielts > 0 else True)
        }
    
    def _calculate_admission_probability(self, student_cgpa: float, student_gre: float, student_ielts: float,
                                       min_cgpa: float, min_gre: float, min_ielts: float,
                                       ranking: int, acceptance_rate: float) -> float:
        """Calculate realistic admission probability using rule-based approach"""
        
        # Base probability from university acceptance rate
        base_prob = acceptance_rate
        
        # Competition factor based on ranking
        if ranking <= 10:
            competition_factor = 0.3  # Extremely competitive
        elif ranking <= 50:
            competition_factor = 0.6  # Very competitive
        elif ranking <= 100:
            competition_factor = 0.8  # Competitive
        else:
            competition_factor = 1.0  # Less competitive
        
        # Check minimum requirements
        meets_reqs = self._check_minimum_requirements(
            student_cgpa, student_gre, student_ielts,
            min_cgpa, min_gre, min_ielts
        )
        
        # Calculate requirement-based probability
        if meets_reqs['all']:
            # Student meets all minimum requirements
            req_prob = base_prob
        elif meets_reqs['cgpa'] and meets_reqs['gre']:
            # Missing only English requirement
            req_prob = base_prob * 0.7
        elif meets_reqs['cgpa'] or meets_reqs['gre']:
            # Missing one major requirement
            req_prob = base_prob * 0.4
        else:
            # Missing multiple major requirements - very low probability
            req_prob = base_prob * 0.02  # 2% of base probability for missing multiple requirements
        
        # Calculate performance-based bonuses/penalties
        performance_bonus = 0
        
        # CGPA performance
        if min_cgpa > 0:
            if student_cgpa >= min_cgpa + 0.4:  # Significantly exceeds
                performance_bonus += 0.15
            elif student_cgpa >= min_cgpa + 0.2:  # Exceeds
                performance_bonus += 0.08
            elif student_cgpa >= min_cgpa:  # Meets
                performance_bonus += 0.0
            elif student_cgpa >= min_cgpa - 0.2:  # Slightly below
                performance_bonus -= 0.1
            else:  # Well below
                performance_bonus -= 0.2
        
        # GRE performance
        if min_gre > 0:
            if student_gre >= min_gre + 25:  # Significantly exceeds
                performance_bonus += 0.1
            elif student_gre >= min_gre + 10:  # Exceeds
                performance_bonus += 0.05
            elif student_gre >= min_gre:  # Meets
                performance_bonus += 0.0
            elif student_gre >= min_gre - 15:  # Slightly below
                performance_bonus -= 0.08
            else:  # Well below
                performance_bonus -= 0.15
        
        # IELTS performance
        if min_ielts > 0:
            if student_ielts >= min_ielts + 1.0:  # Significantly exceeds
                performance_bonus += 0.05
            elif student_ielts >= min_ielts + 0.5:  # Exceeds
                performance_bonus += 0.02
            elif student_ielts >= min_ielts:  # Meets
                performance_bonus += 0.0
            else:  # Below
                performance_bonus -= 0.1
        
        # Calculate final probability
        final_prob = req_prob * competition_factor + performance_bonus
        
        # Add some realistic randomness (element of chance)
        random_factor = np.random.normal(0, 0.05)  # Small randomness
        final_prob += random_factor
        
        # Ensure probability is within realistic bounds
        return max(0.01, min(0.99, final_prob))  # 1% to 99% range
    
    def _calculate_confidence(self, student_data: Dict, university_data: Dict) -> float:
        """Calculate prediction confidence based on data completeness"""
        confidence = 0.8  # Base confidence
        
        # Reduce confidence if key data is missing
        if not student_data.get('cgpa', 0):
            confidence -= 0.1
        if not student_data.get('gre_score', 0):
            confidence -= 0.1
        if not student_data.get('ielts_score', 0) and not student_data.get('toefl_score', 0):
            confidence -= 0.1
        
        if not university_data.get('min_cgpa', 0):
            confidence -= 0.05
        if not university_data.get('min_gre', 0):
            confidence -= 0.05
        if not university_data.get('min_ielts', 0) and not university_data.get('min_toefl', 0):
            confidence -= 0.05
        
        return max(0.5, confidence)  # Minimum 50% confidence
    
    def _categorize_probability(self, probability: float) -> str:
        """Categorize admission probability into descriptive categories"""
        if probability >= 0.8:
            return "Very High"
        elif probability >= 0.6:
            return "High"
        elif probability >= 0.4:
            return "Moderate"
        elif probability >= 0.2:
            return "Low"
        else:
            return "Very Low"


def load_universities_data(file_path: str = None) -> List[Dict]:
    """Load universities data from JSON file"""
    if file_path is None:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        file_path = os.path.join(current_dir, '..', 'data', 'universities.json')
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Universities data file not found at {file_path}")
        return []
    except json.JSONDecodeError:
        print(f"Error parsing JSON file at {file_path}")
        return []


# Global predictor instance
_predictor_instance = None

def get_realistic_predictor() -> RealisticAdmissionPredictor:
    """Get or create the global predictor instance"""
    global _predictor_instance
    if _predictor_instance is None:
        _predictor_instance = RealisticAdmissionPredictor()
        print("Realistic admission predictor initialized")
    return _predictor_instance