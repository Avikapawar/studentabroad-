"""
ML Service Module

This module provides a unified interface for all machine learning services
including admission prediction and university recommendations.
"""

import json
import os
from typing import Dict, List, Optional
from .admission_predictor import get_predictor
from .recommendation_engine import get_recommendation_engine


class MLService:
    """
    Unified ML service for admission prediction and recommendations
    """
    
    def __init__(self):
        self.predictor = get_predictor()
        self.recommendation_engine = get_recommendation_engine()
        self._universities_cache = None
    
    def _load_universities(self) -> List[Dict]:
        """
        Load universities data with caching
        """
        if self._universities_cache is None:
            current_dir = os.path.dirname(os.path.abspath(__file__))
            file_path = os.path.join(current_dir, '..', 'data', 'universities.json')
            
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    self._universities_cache = json.load(f)
            except (FileNotFoundError, json.JSONDecodeError) as e:
                print(f"Error loading universities data: {str(e)}")
                self._universities_cache = []
        
        return self._universities_cache
    
    def predict_admission_probability(self, user_profile: Dict, university_id: int) -> Dict:
        """
        Predict admission probability for a specific university
        
        Args:
            user_profile: User's academic profile
            university_id: ID of the target university
            
        Returns:
            Dictionary with prediction results
        """
        universities = self._load_universities()
        university = next((u for u in universities if u['id'] == university_id), None)
        
        if not university:
            return {
                'error': f'University with ID {university_id} not found',
                'admission_probability': 0.0,
                'confidence': 0.0
            }
        
        try:
            prediction = self.predictor.predict(user_profile, university)
            prediction['university_name'] = university['name']
            prediction['university_country'] = university['country']
            return prediction
        except Exception as e:
            return {
                'error': f'Prediction failed: {str(e)}',
                'admission_probability': 0.0,
                'confidence': 0.0
            }
    
    def predict_batch_admission(self, user_profile: Dict, university_ids: List[int]) -> List[Dict]:
        """
        Predict admission probability for multiple universities
        
        Args:
            user_profile: User's academic profile
            university_ids: List of university IDs
            
        Returns:
            List of prediction results
        """
        results = []
        universities = self._load_universities()
        
        for university_id in university_ids:
            university = next((u for u in universities if u['id'] == university_id), None)
            
            if not university:
                results.append({
                    'university_id': university_id,
                    'error': f'University with ID {university_id} not found',
                    'admission_probability': 0.0,
                    'confidence': 0.0
                })
                continue
            
            try:
                prediction = self.predictor.predict(user_profile, university)
                prediction['university_id'] = university_id
                prediction['university_name'] = university['name']
                prediction['university_country'] = university['country']
                results.append(prediction)
            except Exception as e:
                results.append({
                    'university_id': university_id,
                    'error': f'Prediction failed: {str(e)}',
                    'admission_probability': 0.0,
                    'confidence': 0.0
                })
        
        return results
    
    def generate_recommendations(self, user_profile: Dict, filters: Optional[Dict] = None, 
                               max_recommendations: int = 10) -> Dict:
        """
        Generate personalized university recommendations
        
        Args:
            user_profile: User's academic profile and preferences
            filters: Optional filters to apply (country, field, budget, etc.)
            max_recommendations: Maximum number of recommendations
            
        Returns:
            Dictionary with recommendations and summary
        """
        universities = self._load_universities()
        
        # Apply filters if provided
        if filters:
            universities = self._apply_filters(universities, filters)
        
        if not universities:
            return {
                'recommendations': [],
                'summary': {},
                'message': 'No universities match the specified criteria'
            }
        
        try:
            recommendations = self.recommendation_engine.generate_recommendations(
                user_profile, universities, max_recommendations
            )
            
            summary = self.recommendation_engine.get_recommendation_summary(recommendations)
            
            return {
                'recommendations': recommendations,
                'summary': summary,
                'total_universities_considered': len(universities)
            }
        except Exception as e:
            return {
                'error': f'Recommendation generation failed: {str(e)}',
                'recommendations': [],
                'summary': {}
            }
    
    def _apply_filters(self, universities: List[Dict], filters: Dict) -> List[Dict]:
        """
        Apply filters to university list
        """
        filtered = universities.copy()
        
        # Country filter
        if 'countries' in filters and filters['countries']:
            country_list = [c.strip().lower() for c in filters['countries']]
            filtered = [u for u in filtered if u.get('country', '').lower() in country_list]
        
        # Field filter
        if 'fields' in filters and filters['fields']:
            field_list = [f.strip().lower() for f in filters['fields']]
            filtered = [u for u in filtered 
                       if any(field.lower() in [uf.lower() for uf in u.get('fields', [])] 
                             for field in field_list)]
        
        # Budget filter
        if 'max_budget' in filters and filters['max_budget']:
            max_budget = float(filters['max_budget'])
            filtered = [u for u in filtered 
                       if (u.get('tuition_fee', 0) + u.get('living_cost', 0)) <= max_budget]
        
        # Ranking filter
        if 'max_ranking' in filters and filters['max_ranking']:
            max_ranking = int(filters['max_ranking'])
            filtered = [u for u in filtered 
                       if u.get('ranking', 1000) <= max_ranking]
        
        # Minimum acceptance rate filter
        if 'min_acceptance_rate' in filters and filters['min_acceptance_rate']:
            min_rate = float(filters['min_acceptance_rate'])
            filtered = [u for u in filtered 
                       if u.get('acceptance_rate', 0) >= min_rate]
        
        return filtered
    
    def get_recommendation_explanation(self, user_profile: Dict, university_id: int) -> Dict:
        """
        Get detailed explanation for why a university was recommended
        
        Args:
            user_profile: User's academic profile
            university_id: ID of the university
            
        Returns:
            Dictionary with detailed explanation
        """
        universities = self._load_universities()
        university = next((u for u in universities if u['id'] == university_id), None)
        
        if not university:
            return {
                'error': f'University with ID {university_id} not found'
            }
        
        try:
            # Generate a single recommendation to get detailed scores
            recommendations = self.recommendation_engine.generate_recommendations(
                user_profile, [university], 1
            )
            
            if not recommendations:
                return {
                    'error': 'Unable to generate recommendation explanation'
                }
            
            recommendation = recommendations[0]
            
            return {
                'university_name': university['name'],
                'overall_score': recommendation['overall_score'],
                'detailed_scores': recommendation['scores'],
                'explanation': recommendation['explanation'],
                'recommendation_factors': {
                    'admission_probability': {
                        'score': recommendation['scores']['admission_probability'],
                        'weight': self.recommendation_engine.weight_config['admission_probability'],
                        'description': 'Likelihood of admission based on your academic profile'
                    },
                    'cost_fit': {
                        'score': recommendation['scores']['cost_fit'],
                        'weight': self.recommendation_engine.weight_config['cost_fit'],
                        'description': 'How well the costs align with your budget'
                    },
                    'field_match': {
                        'score': recommendation['scores']['field_match'],
                        'weight': self.recommendation_engine.weight_config['field_match'],
                        'description': 'Alignment with your field of study'
                    },
                    'country_preference': {
                        'score': recommendation['scores']['country_preference'],
                        'weight': self.recommendation_engine.weight_config['country_preference'],
                        'description': 'Match with your preferred countries'
                    },
                    'ranking': {
                        'score': recommendation['scores']['ranking'],
                        'weight': self.recommendation_engine.weight_config['ranking'],
                        'description': 'University global ranking and reputation'
                    }
                }
            }
        except Exception as e:
            return {
                'error': f'Explanation generation failed: {str(e)}'
            }
    
    def generate_cost_analysis(self, user_profile: Dict, university_ids: List[int], 
                             analysis_type: str = 'comparison') -> Dict:
        """
        Generate comprehensive cost analysis for multiple universities
        
        Args:
            user_profile: User's profile including budget information
            university_ids: List of university IDs to analyze
            analysis_type: Type of analysis ('comparison', 'trends', 'affordability')
            
        Returns:
            Dictionary with detailed cost analysis
        """
        universities = self._load_universities()
        selected_universities = [u for u in universities if u['id'] in university_ids]
        
        if not selected_universities:
            return {'error': 'No valid universities found for analysis'}
        
        try:
            # Generate recommendations to get cost breakdowns
            recommendations = self.recommendation_engine.generate_recommendations(
                user_profile, selected_universities, len(selected_universities)
            )
            
            if analysis_type == 'comparison':
                return self._generate_cost_comparison_analysis(recommendations, user_profile)
            elif analysis_type == 'trends':
                return self._generate_cost_trends_analysis(recommendations, user_profile)
            elif analysis_type == 'affordability':
                return self._generate_affordability_analysis(recommendations, user_profile)
            else:
                return self._generate_cost_comparison_analysis(recommendations, user_profile)
                
        except Exception as e:
            return {'error': f'Cost analysis failed: {str(e)}'}
    
    def generate_cost_trends(self, user_profile: Dict, university_id: int, 
                           years: int = 4, inflation_rate: float = 3.0) -> Dict:
        """
        Generate cost trends and projections for a specific university
        
        Args:
            user_profile: User's profile
            university_id: ID of the university
            years: Number of years to project
            inflation_rate: Annual inflation rate percentage
            
        Returns:
            Dictionary with cost trends and projections
        """
        universities = self._load_universities()
        university = next((u for u in universities if u['id'] == university_id), None)
        
        if not university:
            return {'error': f'University with ID {university_id} not found'}
        
        try:
            # Generate recommendation to get cost breakdown
            recommendations = self.recommendation_engine.generate_recommendations(
                user_profile, [university], 1
            )
            
            if not recommendations:
                return {'error': 'Unable to generate cost analysis for university'}
            
            cost_breakdown = recommendations[0]['cost_breakdown']
            
            # Generate year-by-year projections
            projections = []
            cumulative_cost = cost_breakdown['one_time_costs']
            
            for year in range(1, years + 1):
                inflation_multiplier = (1 + inflation_rate / 100) ** (year - 1)
                annual_cost = cost_breakdown['total_annual_cost'] * inflation_multiplier
                cumulative_cost += annual_cost
                
                projections.append({
                    'year': year,
                    'annual_cost': round(annual_cost, 2),
                    'cumulative_cost': round(cumulative_cost, 2),
                    'inflation_multiplier': round(inflation_multiplier, 3),
                    'cost_breakdown': {
                        'tuition': round(cost_breakdown['tuition_fee'] * inflation_multiplier, 2),
                        'living': round(cost_breakdown['living_cost'] * inflation_multiplier, 2),
                        'other': round((cost_breakdown['other_fees'] + 
                                      cost_breakdown['books_supplies'] + 
                                      cost_breakdown['personal_expenses'] + 
                                      cost_breakdown['health_insurance']) * inflation_multiplier, 2)
                    }
                })
            
            # Calculate affordability over time
            budget_analysis = []
            if user_profile.get('budget_max'):
                for projection in projections:
                    budget_gap = projection['annual_cost'] - user_profile['budget_max']
                    budget_analysis.append({
                        'year': projection['year'],
                        'budget_gap': round(budget_gap, 2),
                        'affordability_status': 'affordable' if budget_gap <= 0 else 'over_budget',
                        'budget_utilization': round((projection['annual_cost'] / user_profile['budget_max']) * 100, 1)
                    })
            
            return {
                'university_name': university['name'],
                'base_costs': cost_breakdown,
                'projections': projections,
                'budget_analysis': budget_analysis,
                'total_program_cost': round(cumulative_cost, 2),
                'average_annual_cost': round(cumulative_cost / years, 2),
                'inflation_impact': round(cumulative_cost - (cost_breakdown['total_annual_cost'] * years + cost_breakdown['one_time_costs']), 2)
            }
            
        except Exception as e:
            return {'error': f'Cost trends analysis failed: {str(e)}'}
    
    def _generate_cost_comparison_analysis(self, recommendations: List[Dict], user_profile: Dict) -> Dict:
        """Generate comparative cost analysis"""
        if not recommendations:
            return {'error': 'No recommendations available for analysis'}
        
        costs = [rec['cost_breakdown']['total_annual_cost'] for rec in recommendations]
        
        analysis = {
            'summary': {
                'total_universities': len(recommendations),
                'cost_range': {
                    'min': min(costs),
                    'max': max(costs),
                    'average': sum(costs) / len(costs),
                    'median': sorted(costs)[len(costs) // 2]
                }
            },
            'universities': [],
            'cost_distribution': self._calculate_cost_distribution(costs),
            'budget_analysis': self._analyze_budget_fit(recommendations, user_profile)
        }
        
        for rec in recommendations:
            cost_data = rec['cost_breakdown']
            analysis['universities'].append({
                'university_id': rec['university_id'],
                'university_name': rec['university_name'],
                'country': rec['country'],
                'total_annual_cost': cost_data['total_annual_cost'],
                'cost_percentile': cost_data['cost_efficiency']['total_cost_percentile'],
                'affordability_status': cost_data['affordability_status'],
                'budget_difference': cost_data['budget_difference'],
                'cost_breakdown': {
                    'tuition_percentage': cost_data['cost_analysis']['tuition_percentage'],
                    'living_percentage': cost_data['cost_analysis']['living_percentage'],
                    'other_percentage': cost_data['cost_analysis']['other_percentage']
                }
            })
        
        return analysis
    
    def _generate_cost_trends_analysis(self, recommendations: List[Dict], user_profile: Dict) -> Dict:
        """Generate cost trends analysis across multiple universities"""
        trends = {
            'universities': [],
            'comparative_trends': {
                'inflation_impact_2_years': [],
                'inflation_impact_4_years': [],
                'cost_growth_rates': []
            }
        }
        
        for rec in recommendations:
            cost_data = rec['cost_breakdown']
            university_trends = {
                'university_id': rec['university_id'],
                'university_name': rec['university_name'],
                'base_cost': cost_data['total_annual_cost'],
                'projected_costs': cost_data['cost_trends'],
                'inflation_impact': {
                    '2_years': cost_data['cost_trends']['inflation_adjusted_2_years'] - (cost_data['total_annual_cost'] * 2),
                    '4_years': cost_data['cost_trends']['inflation_adjusted_4_years'] - (cost_data['total_annual_cost'] * 4)
                }
            }
            trends['universities'].append(university_trends)
            
            # Add to comparative analysis
            trends['comparative_trends']['inflation_impact_2_years'].append(university_trends['inflation_impact']['2_years'])
            trends['comparative_trends']['inflation_impact_4_years'].append(university_trends['inflation_impact']['4_years'])
        
        return trends
    
    def _generate_affordability_analysis(self, recommendations: List[Dict], user_profile: Dict) -> Dict:
        """Generate affordability analysis"""
        budget_max = user_profile.get('budget_max', 0)
        
        if not budget_max:
            return {'error': 'User budget information required for affordability analysis'}
        
        affordability = {
            'budget_info': {
                'max_budget': budget_max,
                'min_budget': user_profile.get('budget_min', 0)
            },
            'affordability_summary': {
                'affordable': 0,
                'slightly_over': 0,
                'over_budget': 0,
                'very_affordable': 0
            },
            'universities': []
        }
        
        for rec in recommendations:
            cost_data = rec['cost_breakdown']
            status = cost_data['affordability_status']
            
            affordability['affordability_summary'][status] = affordability['affordability_summary'].get(status, 0) + 1
            
            affordability['universities'].append({
                'university_id': rec['university_id'],
                'university_name': rec['university_name'],
                'total_cost': cost_data['total_annual_cost'],
                'affordability_status': status,
                'budget_difference': cost_data['budget_difference'],
                'financial_aid_potential': cost_data['financial_aid_potential'],
                'cost_after_aid': round(cost_data['total_annual_cost'] - cost_data['financial_aid_potential']['estimated_aid_amount'], 2)
            })
        
        return affordability
    
    def _calculate_cost_distribution(self, costs: List[float]) -> Dict:
        """Calculate cost distribution statistics"""
        sorted_costs = sorted(costs)
        n = len(costs)
        
        return {
            'quartiles': {
                'q1': sorted_costs[n // 4],
                'q2': sorted_costs[n // 2],
                'q3': sorted_costs[3 * n // 4]
            },
            'percentiles': {
                'p10': sorted_costs[n // 10],
                'p25': sorted_costs[n // 4],
                'p75': sorted_costs[3 * n // 4],
                'p90': sorted_costs[9 * n // 10]
            }
        }
    
    def _analyze_budget_fit(self, recommendations: List[Dict], user_profile: Dict) -> Dict:
        """Analyze how well universities fit user's budget"""
        budget_max = user_profile.get('budget_max', 0)
        
        if not budget_max:
            return {'message': 'No budget information available'}
        
        within_budget = sum(1 for rec in recommendations 
                          if rec['cost_breakdown']['total_annual_cost'] <= budget_max)
        
        return {
            'total_universities': len(recommendations),
            'within_budget': within_budget,
            'over_budget': len(recommendations) - within_budget,
            'budget_utilization': {
                'average': sum(rec['cost_breakdown']['total_annual_cost'] for rec in recommendations) / len(recommendations) / budget_max * 100,
                'range': {
                    'min': min(rec['cost_breakdown']['total_annual_cost'] for rec in recommendations) / budget_max * 100,
                    'max': max(rec['cost_breakdown']['total_annual_cost'] for rec in recommendations) / budget_max * 100
                }
            }
        }
    
    def get_model_info(self) -> Dict:
        """
        Get information about the ML models
        """
        try:
            feature_importance = self.predictor.get_feature_importance()
            return {
                'admission_predictor': {
                    'is_trained': self.predictor.is_trained,
                    'feature_importance': feature_importance,
                    'model_type': 'Random Forest Regressor'
                },
                'recommendation_engine': {
                    'scoring_weights': self.recommendation_engine.weight_config,
                    'components': ['admission_probability', 'cost_fit', 'field_match', 
                                 'country_preference', 'ranking']
                }
            }
        except Exception as e:
            return {
                'error': f'Unable to retrieve model info: {str(e)}'
            }


# Global ML service instance
_ml_service_instance = None

def get_ml_service() -> MLService:
    """
    Get or create the global ML service instance
    """
    global _ml_service_instance
    if _ml_service_instance is None:
        _ml_service_instance = MLService()
    return _ml_service_instance