"""
Intelligent University Recommendation Engine

This module implements a comprehensive recommendation system that ranks universities
based on user profile matching, admission probability, cost fit, and preferences.
"""

import json
import os
from typing import Dict, List, Tuple, Optional
import numpy as np
from .admission_predictor import get_predictor


class RecommendationEngine:
    """
    Intelligent recommendation engine for university matching
    """
    
    def __init__(self):
        self.predictor = get_predictor()
        self.weight_config = {
            'admission_probability': 0.35,
            'cost_fit': 0.25,
            'field_match': 0.20,
            'country_preference': 0.15,
            'ranking': 0.05
        }
    
    def generate_recommendations(self, user_profile: Dict, universities: List[Dict], 
                               max_recommendations: int = 10) -> List[Dict]:
        """
        Generate personalized university recommendations
        
        Args:
            user_profile: User's academic profile and preferences
            universities: List of all available universities
            max_recommendations: Maximum number of recommendations to return
            
        Returns:
            List of recommended universities with scores and explanations
        """
        recommendations = []
        
        # Filter universities by preferred countries if specified
        filtered_universities = self._filter_by_country(user_profile, universities)
        
        for university in filtered_universities:
            try:
                # Calculate individual scores
                scores = self._calculate_scores(user_profile, university)
                
                # Calculate overall recommendation score
                overall_score = self._calculate_overall_score(scores)
                
                # Generate explanation
                explanation = self._generate_explanation(scores, user_profile, university)
                
                # Generate comprehensive cost breakdown
                cost_breakdown = self._generate_cost_breakdown(user_profile, university)
                
                recommendation = {
                    'university_id': university['id'],
                    'university_name': university['name'],
                    'country': university['country'],
                    'city': university['city'],
                    'overall_score': round(overall_score, 3),
                    'scores': scores,
                    'explanation': explanation,
                    'cost_breakdown': cost_breakdown,
                    'admission_probability': scores.get('admission_probability', 0),
                    'university_data': university
                }
                
                recommendations.append(recommendation)
                
            except Exception as e:
                print(f"Error processing university {university.get('name', 'Unknown')}: {str(e)}")
                continue
        
        # Calculate cost percentiles for all recommendations
        self._calculate_cost_percentiles(recommendations)
        
        # Sort by overall score (descending)
        recommendations.sort(key=lambda x: x['overall_score'], reverse=True)
        
        # Return top recommendations
        return recommendations[:max_recommendations]
    
    def _calculate_scores(self, user_profile: Dict, university: Dict) -> Dict:
        """
        Calculate individual scoring components
        """
        scores = {}
        
        # 1. Admission Probability Score
        try:
            prediction = self.predictor.predict(user_profile, university)
            scores['admission_probability'] = prediction['admission_probability']
            scores['admission_confidence'] = prediction['confidence']
            scores['admission_category'] = prediction['probability_category']
        except Exception as e:
            print(f"Error predicting admission probability: {str(e)}")
            scores['admission_probability'] = 0.5
            scores['admission_confidence'] = 0.5
            scores['admission_category'] = 'Moderate'
        
        # 2. Cost Fit Score
        scores['cost_fit'] = self._calculate_cost_fit(user_profile, university)
        
        # 3. Field Match Score
        scores['field_match'] = self._calculate_field_match(user_profile, university)
        
        # 4. Country Preference Score
        scores['country_preference'] = self._calculate_country_preference(user_profile, university)
        
        # 5. Ranking Score
        scores['ranking'] = self._calculate_ranking_score(university)
        
        return scores
    
    def _calculate_cost_fit(self, user_profile: Dict, university: Dict) -> float:
        """
        Calculate how well the university cost fits the user's budget
        """
        budget_min = user_profile.get('budget_min', 0)
        budget_max = user_profile.get('budget_max', 100000)
        
        tuition_fee = university.get('tuition_fee', 0)
        living_cost = university.get('living_cost', 0)
        total_cost = tuition_fee + living_cost
        
        if budget_max <= 0:
            return 0.5  # No budget specified, neutral score
        
        if total_cost <= budget_min:
            return 1.0  # Well within budget
        elif total_cost <= budget_max:
            # Linear scale between min and max budget
            fit_ratio = 1.0 - ((total_cost - budget_min) / (budget_max - budget_min))
            return max(0.3, fit_ratio)  # Minimum score of 0.3 if within max budget
        else:
            # Over budget - penalize based on how much over
            over_budget_ratio = (total_cost - budget_max) / budget_max
            penalty = min(0.7, over_budget_ratio)  # Maximum penalty of 0.7
            return max(0.0, 0.3 - penalty)
    
    def _calculate_field_match(self, user_profile: Dict, university: Dict) -> float:
        """
        Calculate field of study match score
        """
        user_field = user_profile.get('field_of_study', '').lower().strip()
        university_fields = university.get('fields', [])
        
        if not user_field or not university_fields:
            return 0.5  # Neutral score if no field specified
        
        # Check for exact match
        for field in university_fields:
            if user_field in field.lower() or field.lower() in user_field:
                return 1.0
        
        # Check for partial matches (keywords)
        user_keywords = user_field.split()
        for keyword in user_keywords:
            if len(keyword) > 2:  # Ignore very short words
                for field in university_fields:
                    if keyword in field.lower():
                        return 0.7  # Partial match
        
        return 0.2  # No match found
    
    def _filter_by_country(self, user_profile: Dict, universities: List[Dict]) -> List[Dict]:
        """
        Filter universities by preferred countries if specified
        """
        preferred_countries = user_profile.get('preferred_countries', '')
        
        if not preferred_countries or not preferred_countries.strip():
            return universities  # No filter, return all
        
        # Parse preferred countries (assuming comma-separated string)
        if isinstance(preferred_countries, str):
            preferred_list = [country.strip().lower() for country in preferred_countries.split(',') if country.strip()]
        else:
            preferred_list = [str(preferred_countries).lower()]
        
        if not preferred_list:
            return universities
        
        # Filter universities
        filtered = []
        for university in universities:
            university_country = university.get('country', '').lower()
            
            # Check for exact or partial match
            for pref_country in preferred_list:
                if (pref_country in university_country or 
                    university_country in pref_country or
                    self._country_code_match(pref_country, university_country)):
                    filtered.append(university)
                    break
        
        return filtered if filtered else universities  # Return all if no matches found
    
    def _country_code_match(self, pref: str, country: str) -> bool:
        """
        Match country codes and common abbreviations
        """
        country_mappings = {
            'us': ['usa', 'united states', 'america'],
            'usa': ['us', 'united states', 'america'],
            'uk': ['united kingdom', 'britain', 'england'],
            'ca': ['canada'],
            'au': ['australia'],
            'de': ['germany', 'deutschland'],
            'fr': ['france'],
            'in': ['india'],
            'cn': ['china'],
            'jp': ['japan'],
            'sg': ['singapore'],
            'nz': ['new zealand'],
            'nl': ['netherlands', 'holland'],
            'se': ['sweden'],
            'ch': ['switzerland'],
            'it': ['italy'],
            'es': ['spain'],
            'kr': ['south korea', 'korea']
        }
        
        # Check if preference matches any mapping
        if pref in country_mappings:
            return country in country_mappings[pref]
        
        # Check reverse - if country is a code
        if country in country_mappings:
            return pref in country_mappings[country]
        
        return False
    
    def _calculate_country_preference(self, user_profile: Dict, university: Dict) -> float:
        """
        Calculate country preference match score
        """
        preferred_countries = user_profile.get('preferred_countries', '')
        university_country = university.get('country', '')
        
        if not preferred_countries:
            return 0.5  # No preference specified, neutral score
        
        # Parse preferred countries (assuming comma-separated string)
        if isinstance(preferred_countries, str):
            preferred_list = [country.strip().lower() for country in preferred_countries.split(',')]
        else:
            preferred_list = [str(preferred_countries).lower()]
        
        university_country_lower = university_country.lower()
        
        # Check for exact match
        if university_country_lower in preferred_list:
            return 1.0
        
        # Check for partial matches (e.g., "US" matches "USA")
        for pref_country in preferred_list:
            if (pref_country in university_country_lower or 
                university_country_lower in pref_country or
                self._country_code_match(pref_country, university_country_lower)):
                return 1.0
        
        return 0.1  # No match
    
    def _calculate_ranking_score(self, university: Dict) -> float:
        """
        Calculate ranking-based score (higher rank = higher score)
        """
        ranking = university.get('ranking', 1000)
        
        if ranking <= 0:
            return 0.5  # Invalid ranking, neutral score
        
        # Logarithmic scale - top 10 get high scores, diminishing returns after
        if ranking <= 10:
            return 1.0
        elif ranking <= 50:
            return 0.8
        elif ranking <= 100:
            return 0.6
        elif ranking <= 200:
            return 0.4
        elif ranking <= 500:
            return 0.2
        else:
            return 0.1
    
    def _calculate_overall_score(self, scores: Dict) -> float:
        """
        Calculate weighted overall recommendation score
        """
        overall_score = 0.0
        
        for component, weight in self.weight_config.items():
            if component in scores:
                overall_score += scores[component] * weight
        
        return min(1.0, max(0.0, overall_score))
    
    def _generate_cost_breakdown(self, user_profile: Dict, university: Dict) -> Dict:
        """
        Generate comprehensive cost breakdown with multiple currency support and analysis
        """
        # Base costs from university data
        tuition_fee = university.get('tuition_fee', 0)
        living_cost = university.get('living_cost', 0)
        application_fee = university.get('application_fee', 100)  # Default application fee
        other_fees = university.get('other_fees', 0)
        
        # Calculate additional estimated costs
        books_supplies = tuition_fee * 0.02  # Estimate 2% of tuition for books/supplies
        personal_expenses = living_cost * 0.15  # Estimate 15% of living cost for personal expenses
        health_insurance = 2000 if university.get('country') == 'USA' else 1000  # Estimate health insurance
        visa_fees = 500 if university.get('country') != user_profile.get('home_country', '') else 0
        
        # Calculate total annual cost
        total_annual_cost = (tuition_fee + living_cost + other_fees + 
                           books_supplies + personal_expenses + health_insurance)
        
        # Calculate one-time costs
        one_time_costs = application_fee + visa_fees
        
        # Calculate affordability metrics
        user_budget_max = user_profile.get('budget_max', 0)
        user_budget_min = user_profile.get('budget_min', 0)
        
        affordability_status = 'unknown'
        budget_difference = 0
        
        if user_budget_max > 0:
            budget_difference = total_annual_cost - user_budget_max
            if total_annual_cost <= user_budget_min:
                affordability_status = 'very_affordable'
            elif total_annual_cost <= user_budget_max:
                affordability_status = 'affordable'
            elif total_annual_cost <= user_budget_max * 1.1:
                affordability_status = 'slightly_over_budget'
            else:
                affordability_status = 'over_budget'
        
        # Calculate cost per credit/year ratios for comparison
        cost_efficiency = {
            'cost_per_ranking_point': total_annual_cost / max(1, 1000 - university.get('ranking', 500)),
            'tuition_to_living_ratio': tuition_fee / max(1, living_cost),
            'total_cost_percentile': 0  # Will be calculated relative to other universities
        }
        
        # Multi-currency support
        exchange_rates = {
            'USD': 1.0,
            'EUR': 0.85,
            'GBP': 0.73,
            'CAD': 1.25,
            'AUD': 1.35,
            'INR': 83.0,
            'JPY': 110.0,
            'CNY': 6.5
        }
        
        currency_breakdown = {}
        for currency, rate in exchange_rates.items():
            currency_breakdown[currency] = {
                'tuition_fee': round(tuition_fee * rate, 2),
                'living_cost': round(living_cost * rate, 2),
                'total_annual_cost': round(total_annual_cost * rate, 2),
                'symbol': self._get_currency_symbol(currency)
            }
        
        return {
            'tuition_fee': tuition_fee,
            'living_cost': living_cost,
            'application_fee': application_fee,
            'other_fees': other_fees,
            'books_supplies': round(books_supplies, 2),
            'personal_expenses': round(personal_expenses, 2),
            'health_insurance': health_insurance,
            'visa_fees': visa_fees,
            'total_annual_cost': round(total_annual_cost, 2),
            'one_time_costs': round(one_time_costs, 2),
            'total_program_cost_2_years': round((total_annual_cost * 2) + one_time_costs, 2),
            'total_program_cost_4_years': round((total_annual_cost * 4) + one_time_costs, 2),
            'affordability_status': affordability_status,
            'budget_difference': round(budget_difference, 2),
            'cost_efficiency': cost_efficiency,
            'currency_breakdown': currency_breakdown,
            'cost_analysis': {
                'tuition_percentage': round((tuition_fee / total_annual_cost) * 100, 1),
                'living_percentage': round((living_cost / total_annual_cost) * 100, 1),
                'other_percentage': round(((other_fees + books_supplies + personal_expenses + health_insurance) / total_annual_cost) * 100, 1)
            },
            'financial_aid_potential': self._estimate_financial_aid_potential(user_profile, university),
            'cost_trends': {
                'inflation_adjusted_2_years': round(total_annual_cost * 2 * 1.06, 2),  # 3% annual inflation
                'inflation_adjusted_4_years': round(total_annual_cost * 4 * 1.125, 2)  # Compound inflation
            }
        }
    
    def _get_currency_symbol(self, currency_code: str) -> str:
        """Get currency symbol for display"""
        symbols = {
            'USD': '$', 'EUR': '€', 'GBP': '£', 'CAD': 'C$', 
            'AUD': 'A$', 'INR': '₹', 'JPY': '¥', 'CNY': '¥'
        }
        return symbols.get(currency_code, currency_code)
    
    def _estimate_financial_aid_potential(self, user_profile: Dict, university: Dict) -> Dict:
        """Estimate potential for financial aid based on user profile and university"""
        cgpa = user_profile.get('cgpa', 0)
        gre_score = user_profile.get('gre_score', 0)
        
        # Simple heuristic for financial aid potential
        academic_strength = 0
        if cgpa >= 3.7:
            academic_strength += 0.4
        elif cgpa >= 3.3:
            academic_strength += 0.2
        
        if gre_score >= 320:
            academic_strength += 0.3
        elif gre_score >= 300:
            academic_strength += 0.15
        
        # University-specific factors
        university_generosity = 0.3  # Default assumption
        if university.get('ranking', 1000) <= 50:
            university_generosity = 0.5  # Top universities often have better aid
        elif university.get('ranking', 1000) <= 200:
            university_generosity = 0.4
        
        aid_potential = min(1.0, academic_strength + university_generosity)
        
        estimated_aid_amount = university.get('tuition_fee', 0) * aid_potential * 0.3  # Conservative estimate
        
        return {
            'potential_score': round(aid_potential, 2),
            'estimated_aid_amount': round(estimated_aid_amount, 2),
            'aid_likelihood': 'high' if aid_potential >= 0.7 else 'moderate' if aid_potential >= 0.4 else 'low',
            'scholarship_types': self._get_potential_scholarships(user_profile, university)
        }
    
    def _get_potential_scholarships(self, user_profile: Dict, university: Dict) -> List[str]:
        """Get list of potential scholarship types based on profile"""
        scholarships = []
        
        cgpa = user_profile.get('cgpa', 0)
        gre_score = user_profile.get('gre_score', 0)
        
        if cgpa >= 3.8:
            scholarships.append('Academic Excellence Scholarship')
        if cgpa >= 3.5:
            scholarships.append('Merit-based Aid')
        
        if gre_score >= 325:
            scholarships.append('Graduate Research Assistantship')
        if gre_score >= 315:
            scholarships.append('Teaching Assistantship')
        
        # Field-specific scholarships
        field = user_profile.get('field_of_study', '').lower()
        if 'engineering' in field or 'computer' in field:
            scholarships.append('STEM Scholarship')
        if 'business' in field:
            scholarships.append('Business School Fellowship')
        
        # International student scholarships
        if user_profile.get('home_country', '').lower() != university.get('country', '').lower():
            scholarships.append('International Student Aid')
        
        return scholarships[:4]  # Limit to top 4 most relevant
    
    def _calculate_cost_percentiles(self, recommendations: List[Dict]) -> None:
        """Calculate cost percentiles for all recommendations"""
        if not recommendations:
            return
        
        # Extract all costs
        costs = [rec['cost_breakdown']['total_annual_cost'] for rec in recommendations]
        costs.sort()
        
        # Calculate percentiles for each recommendation
        for rec in recommendations:
            cost = rec['cost_breakdown']['total_annual_cost']
            percentile = (costs.index(cost) + 1) / len(costs) * 100
            rec['cost_breakdown']['cost_efficiency']['total_cost_percentile'] = round(percentile, 1)
    
    def _generate_explanation(self, scores: Dict, user_profile: Dict, university: Dict) -> List[str]:
        """
        Generate human-readable explanation for the recommendation
        """
        explanations = []
        
        # Admission probability explanation
        admission_prob = scores.get('admission_probability', 0)
        admission_category = scores.get('admission_category', 'Moderate')
        explanations.append(f"{admission_category} admission probability ({admission_prob:.1%})")
        
        # Cost fit explanation
        cost_fit = scores.get('cost_fit', 0)
        if cost_fit >= 0.8:
            explanations.append("Excellent cost fit within your budget")
        elif cost_fit >= 0.5:
            explanations.append("Good cost fit for your budget range")
        elif cost_fit >= 0.3:
            explanations.append("Moderate cost fit, slightly above preferred budget")
        else:
            explanations.append("High cost relative to your budget")
        
        # Field match explanation
        field_match = scores.get('field_match', 0)
        if field_match >= 0.8:
            explanations.append("Strong match with your field of study")
        elif field_match >= 0.5:
            explanations.append("Good academic program alignment")
        elif field_match >= 0.3:
            explanations.append("Some relevant programs available")
        
        # Country preference explanation
        country_pref = scores.get('country_preference', 0)
        if country_pref >= 0.8:
            explanations.append("Located in your preferred country")
        elif country_pref < 0.3:
            explanations.append("Different from your preferred countries")
        
        # Ranking explanation
        ranking = university.get('ranking', 1000)
        if ranking <= 50:
            explanations.append(f"Highly ranked institution (#{ranking} globally)")
        elif ranking <= 200:
            explanations.append(f"Well-regarded university (#{ranking} globally)")
        
        # Academic requirements comparison
        user_cgpa = user_profile.get('cgpa', 0)
        min_cgpa = university.get('min_cgpa', 0)
        if user_cgpa >= min_cgpa + 0.2:
            explanations.append("Your CGPA exceeds requirements")
        elif user_cgpa >= min_cgpa:
            explanations.append("Your CGPA meets requirements")
        elif min_cgpa > 0:
            explanations.append("CGPA below stated requirements")
        
        return explanations
    
    def get_recommendation_summary(self, recommendations: List[Dict]) -> Dict:
        """
        Generate summary statistics for recommendations
        """
        if not recommendations:
            return {}
        
        scores = [rec['overall_score'] for rec in recommendations]
        admission_probs = [rec['scores']['admission_probability'] for rec in recommendations]
        
        countries = {}
        fields = {}
        
        for rec in recommendations:
            country = rec['country']
            countries[country] = countries.get(country, 0) + 1
            
            university_fields = rec['university_data'].get('fields', [])
            for field in university_fields:
                fields[field] = fields.get(field, 0) + 1
        
        return {
            'total_recommendations': len(recommendations),
            'average_score': round(np.mean(scores), 3),
            'average_admission_probability': round(np.mean(admission_probs), 3),
            'score_range': {
                'min': round(min(scores), 3),
                'max': round(max(scores), 3)
            },
            'top_countries': sorted(countries.items(), key=lambda x: x[1], reverse=True)[:5],
            'top_fields': sorted(fields.items(), key=lambda x: x[1], reverse=True)[:5]
        }


# Global recommendation engine instance
_engine_instance = None

def get_recommendation_engine() -> RecommendationEngine:
    """
    Get or create the global recommendation engine instance
    """
    global _engine_instance
    if _engine_instance is None:
        _engine_instance = RecommendationEngine()
    return _engine_instance