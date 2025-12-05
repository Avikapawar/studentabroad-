"""
Admission Probability Prediction Model

This module implements a machine learning model to predict admission probability
based on student academic credentials and university requirements.
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
import json
import os
from typing import Dict, List, Tuple, Optional


class AdmissionPredictor:
    """
    Machine Learning model for predicting admission probability
    """
    
    def __init__(self):
        self.model = RandomForestRegressor(
            n_estimators=100,
            random_state=42,
            max_depth=10,
            min_samples_split=5
        )
        self.scaler = StandardScaler()
        self.is_trained = False
        self.feature_names = [
            'cgpa_score', 'gre_score', 'english_score', 'cgpa_diff', 
            'gre_diff', 'english_diff', 'acceptance_rate', 'ranking_score'
        ]
    
    def _engineer_features(self, student_data: Dict, university_data: Dict) -> np.ndarray:
        """
        Engineer features from student and university data
        
        Args:
            student_data: Dictionary containing student academic data
            university_data: Dictionary containing university requirements
            
        Returns:
            Numpy array of engineered features
        """
        # Student scores (normalized)
        cgpa_score = student_data.get('cgpa', 0) / 4.0  # Normalize to 0-1
        gre_score = student_data.get('gre_score', 0) / 340.0  # Normalize to 0-1
        
        # Handle English scores (IELTS or TOEFL)
        ielts_score = student_data.get('ielts_score', 0)
        toefl_score = student_data.get('toefl_score', 0)
        
        # Convert TOEFL to IELTS equivalent for consistency
        if toefl_score > 0:
            english_score = self._toefl_to_ielts(toefl_score) / 9.0
        else:
            english_score = ielts_score / 9.0
        
        # University requirements
        min_cgpa = university_data.get('min_cgpa', 0) / 4.0
        min_gre = university_data.get('min_gre', 0) / 340.0
        min_ielts = university_data.get('min_ielts', 0) / 9.0
        min_toefl = university_data.get('min_toefl', 0)
        
        # Convert TOEFL requirement to IELTS equivalent
        if min_toefl > 0:
            min_english = self._toefl_to_ielts(min_toefl) / 9.0
        else:
            min_english = min_ielts
        
        # Feature engineering: differences between student scores and requirements
        cgpa_diff = cgpa_score - min_cgpa
        gre_diff = gre_score - min_gre
        english_diff = english_score - min_english
        
        # University characteristics
        acceptance_rate = university_data.get('acceptance_rate', 0.5)
        ranking = university_data.get('ranking', 100)
        ranking_score = 1.0 / (ranking + 1)  # Higher rank = higher score
        
        features = np.array([
            cgpa_score, gre_score, english_score, cgpa_diff,
            gre_diff, english_diff, acceptance_rate, ranking_score
        ])
        
        return features.reshape(1, -1)
    
    def _toefl_to_ielts(self, toefl_score: float) -> float:
        """
        Convert TOEFL score to IELTS equivalent
        Based on standard conversion tables
        """
        if toefl_score >= 118:
            return 9.0
        elif toefl_score >= 115:
            return 8.5
        elif toefl_score >= 110:
            return 8.0
        elif toefl_score >= 102:
            return 7.5
        elif toefl_score >= 94:
            return 7.0
        elif toefl_score >= 79:
            return 6.5
        elif toefl_score >= 60:
            return 6.0
        elif toefl_score >= 46:
            return 5.5
        else:
            return 5.0
    
    def generate_synthetic_data(self, universities_data: List[Dict], num_samples: int = 1000) -> Tuple[np.ndarray, np.ndarray]:
        """
        Generate synthetic training data based on university requirements
        
        Args:
            universities_data: List of university data dictionaries
            num_samples: Number of synthetic samples to generate
            
        Returns:
            Tuple of (features, labels) for training
        """
        features_list = []
        labels_list = []
        
        for _ in range(num_samples):
            # Randomly select a university
            university = np.random.choice(universities_data)
            
            # Generate synthetic student data around university requirements
            min_cgpa = university.get('min_cgpa', 3.0)
            min_gre = university.get('min_gre', 300)
            min_ielts = university.get('min_ielts', 6.0)
            acceptance_rate = university.get('acceptance_rate', 0.5)
            
            # Generate student scores with some variation
            cgpa_variation = np.random.normal(0, 0.3)
            gre_variation = np.random.normal(0, 20)
            ielts_variation = np.random.normal(0, 0.5)
            
            student_cgpa = max(0, min(4.0, min_cgpa + cgpa_variation))
            student_gre = max(260, min(340, min_gre + gre_variation))
            student_ielts = max(0, min(9.0, min_ielts + ielts_variation))
            
            student_data = {
                'cgpa': student_cgpa,
                'gre_score': student_gre,
                'ielts_score': student_ielts,
                'toefl_score': 0
            }
            
            # Engineer features
            features = self._engineer_features(student_data, university)
            features_list.append(features.flatten())
            
            # Calculate admission probability based on how well student meets requirements
            cgpa_factor = min(1.0, student_cgpa / min_cgpa) if min_cgpa > 0 else 1.0
            gre_factor = min(1.0, student_gre / min_gre) if min_gre > 0 else 1.0
            ielts_factor = min(1.0, student_ielts / min_ielts) if min_ielts > 0 else 1.0
            
            # Base probability influenced by acceptance rate and student performance
            base_prob = acceptance_rate
            performance_multiplier = (cgpa_factor + gre_factor + ielts_factor) / 3.0
            
            # Add some randomness and ensure probability is between 0 and 1
            admission_prob = min(1.0, max(0.0, base_prob * performance_multiplier + np.random.normal(0, 0.1)))
            labels_list.append(admission_prob)
        
        return np.array(features_list), np.array(labels_list)
    
    def train(self, universities_data: List[Dict], num_samples: int = 1000) -> Dict:
        """
        Train the admission prediction model
        
        Args:
            universities_data: List of university data
            num_samples: Number of synthetic samples to generate
            
        Returns:
            Dictionary with training metrics
        """
        # Generate synthetic training data
        X, y = self.generate_synthetic_data(universities_data, num_samples)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train model
        self.model.fit(X_train_scaled, y_train)
        
        # Evaluate model
        y_pred = self.model.predict(X_test_scaled)
        mse = mean_squared_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)
        
        self.is_trained = True
        
        return {
            'mse': mse,
            'r2_score': r2,
            'training_samples': len(X_train),
            'test_samples': len(X_test)
        }
    
    def predict(self, student_data: Dict, university_data: Dict) -> Dict:
        """
        Predict admission probability for a student-university pair
        
        Args:
            student_data: Dictionary containing student academic data
            university_data: Dictionary containing university data
            
        Returns:
            Dictionary with prediction results
        """
        if not self.is_trained:
            raise ValueError("Model must be trained before making predictions")
        
        # Engineer features
        features = self._engineer_features(student_data, university_data)
        features_scaled = self.scaler.transform(features)
        
        # Make prediction
        probability = self.model.predict(features_scaled)[0]
        probability = max(0.0, min(1.0, probability))  # Ensure valid probability
        
        # Calculate confidence based on feature importance and variance
        feature_importance = self.model.feature_importances_
        confidence = self._calculate_confidence(features.flatten(), feature_importance)
        
        return {
            'admission_probability': round(probability, 3),
            'confidence': round(confidence, 3),
            'probability_category': self._categorize_probability(probability)
        }
    
    def _calculate_confidence(self, features: np.ndarray, importance: np.ndarray) -> float:
        """
        Calculate prediction confidence based on feature quality
        """
        # Simple confidence calculation based on feature completeness
        non_zero_features = np.count_nonzero(features)
        feature_completeness = non_zero_features / len(features)
        
        # Base confidence on feature completeness and importance
        confidence = feature_completeness * 0.8 + 0.2
        return min(1.0, confidence)
    
    def _categorize_probability(self, probability: float) -> str:
        """
        Categorize admission probability into descriptive categories
        """
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
    
    def get_feature_importance(self) -> Dict:
        """
        Get feature importance from the trained model
        """
        if not self.is_trained:
            raise ValueError("Model must be trained before getting feature importance")
        
        importance_dict = {}
        for i, feature_name in enumerate(self.feature_names):
            importance_dict[feature_name] = round(self.model.feature_importances_[i], 3)
        
        return importance_dict


def load_universities_data(file_path: str = None) -> List[Dict]:
    """
    Load universities data from JSON file
    """
    if file_path is None:
        # Default path relative to this file
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

def get_predictor() -> AdmissionPredictor:
    """
    Get or create the global predictor instance
    """
    global _predictor_instance
    if _predictor_instance is None:
        _predictor_instance = AdmissionPredictor()
        
        # Load universities data and train the model
        universities_data = load_universities_data()
        if universities_data:
            print("Training admission prediction model...")
            metrics = _predictor_instance.train(universities_data)
            print(f"Model trained successfully. R² Score: {metrics['r2_score']:.3f}")
        else:
            print("Warning: No universities data found. Model not trained.")
    
    return _predictor_instance