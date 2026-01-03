from sqlalchemy.orm import Session
from sqlalchemy import desc, and_, or_
from typing import List, Optional, Dict, Any
import json
from datetime import datetime

from .user import User
from .bookmark import Bookmark, UserPreference, SearchHistory
from .recommendation import RecommendationResult, AdmissionPrediction, RecommendationSession

class BookmarkRepository:
    """Repository for bookmark operations"""
    
    @staticmethod
    def create_bookmark(session: Session, user_id: int, university_id: int, 
                       university_name: str, university_country: str = None, 
                       notes: str = None) -> Bookmark:
        """Create a new bookmark"""
        bookmark = Bookmark(
            user_id=user_id,
            university_id=university_id,
            university_name=university_name,
            university_country=university_country,
            notes=notes
        )
        session.add(bookmark)
        session.commit()
        session.refresh(bookmark)
        return bookmark
    
    @staticmethod
    def get_user_bookmarks(session: Session, user_id: int) -> List[Bookmark]:
        """Get all bookmarks for a user"""
        return session.query(Bookmark).filter(Bookmark.user_id == user_id).order_by(desc(Bookmark.created_at)).all()
    
    @staticmethod
    def delete_bookmark(session: Session, user_id: int, bookmark_id: int) -> bool:
        """Delete a bookmark"""
        bookmark = session.query(Bookmark).filter(
            and_(Bookmark.id == bookmark_id, Bookmark.user_id == user_id)
        ).first()
        if bookmark:
            session.delete(bookmark)
            session.commit()
            return True
        return False
    
    @staticmethod
    def is_bookmarked(session: Session, user_id: int, university_id: int) -> bool:
        """Check if a university is bookmarked by user"""
        return session.query(Bookmark).filter(
            and_(Bookmark.user_id == user_id, Bookmark.university_id == university_id)
        ).first() is not None

class UserPreferenceRepository:
    """Repository for user preference operations"""
    
    @staticmethod
    def create_preference(session: Session, user_id: int, preference_type: str, 
                         preference_value: str, weight: int = 1) -> UserPreference:
        """Create or update a user preference"""
        # Check if preference already exists
        existing = session.query(UserPreference).filter(
            and_(
                UserPreference.user_id == user_id,
                UserPreference.preference_type == preference_type,
                UserPreference.preference_value == preference_value
            )
        ).first()
        
        if existing:
            existing.weight = weight
            existing.updated_at = datetime.utcnow()
            session.commit()
            return existing
        else:
            preference = UserPreference(
                user_id=user_id,
                preference_type=preference_type,
                preference_value=preference_value,
                weight=weight
            )
            session.add(preference)
            session.commit()
            session.refresh(preference)
            return preference
    
    @staticmethod
    def get_user_preferences(session: Session, user_id: int, 
                           preference_type: str = None) -> List[UserPreference]:
        """Get user preferences, optionally filtered by type"""
        query = session.query(UserPreference).filter(UserPreference.user_id == user_id)
        if preference_type:
            query = query.filter(UserPreference.preference_type == preference_type)
        return query.order_by(desc(UserPreference.weight)).all()
    
    @staticmethod
    def delete_preference(session: Session, user_id: int, preference_id: int) -> bool:
        """Delete a user preference"""
        preference = session.query(UserPreference).filter(
            and_(UserPreference.id == preference_id, UserPreference.user_id == user_id)
        ).first()
        if preference:
            session.delete(preference)
            session.commit()
            return True
        return False

class RecommendationRepository:
    """Repository for recommendation operations"""
    
    @staticmethod
    def create_recommendation_session(session: Session, user_id: int, session_type: str,
                                    user_profile_snapshot: Dict[str, Any],
                                    filters_applied: Dict[str, Any] = None) -> RecommendationSession:
        """Create a new recommendation session"""
        rec_session = RecommendationSession(
            user_id=user_id,
            session_type=session_type,
            user_profile_snapshot=json.dumps(user_profile_snapshot),
            filters_applied=json.dumps(filters_applied) if filters_applied else None
        )
        session.add(rec_session)
        session.commit()
        session.refresh(rec_session)
        return rec_session
    
    @staticmethod
    def create_recommendation_result(session: Session, user_id: int, university_id: int,
                                   university_name: str, university_country: str,
                                   admission_probability: float, cost_fit_score: float,
                                   overall_score: float, ranking_position: int,
                                   reasons: List[str], confidence_level: str) -> RecommendationResult:
        """Create a recommendation result"""
        result = RecommendationResult(
            user_id=user_id,
            university_id=university_id,
            university_name=university_name,
            university_country=university_country,
            admission_probability=admission_probability,
            cost_fit_score=cost_fit_score,
            overall_score=overall_score,
            ranking_position=ranking_position,
            reasons=json.dumps(reasons),
            confidence_level=confidence_level
        )
        session.add(result)
        session.commit()
        session.refresh(result)
        return result
    
    @staticmethod
    def get_user_recommendations(session: Session, user_id: int, 
                               limit: int = 20) -> List[RecommendationResult]:
        """Get recent recommendations for a user"""
        return session.query(RecommendationResult).filter(
            RecommendationResult.user_id == user_id
        ).order_by(desc(RecommendationResult.created_at)).limit(limit).all()
    
    @staticmethod
    def create_admission_prediction(session: Session, user_id: int, university_id: int,
                                  university_name: str, predicted_probability: float,
                                  confidence_score: float, factors_analyzed: Dict[str, Any],
                                  model_version: str) -> AdmissionPrediction:
        """Create an admission prediction record"""
        prediction = AdmissionPrediction(
            user_id=user_id,
            university_id=university_id,
            university_name=university_name,
            predicted_probability=predicted_probability,
            confidence_score=confidence_score,
            factors_analyzed=json.dumps(factors_analyzed),
            model_version=model_version
        )
        session.add(prediction)
        session.commit()
        session.refresh(prediction)
        return prediction

class SearchHistoryRepository:
    """Repository for search history operations"""
    
    @staticmethod
    def create_search_record(session: Session, user_id: int, search_query: Dict[str, Any],
                           search_type: str, results_count: int) -> SearchHistory:
        """Create a search history record"""
        search_record = SearchHistory(
            user_id=user_id,
            search_query=json.dumps(search_query),
            search_type=search_type,
            results_count=results_count
        )
        session.add(search_record)
        session.commit()
        session.refresh(search_record)
        return search_record
    
    @staticmethod
    def get_user_search_history(session: Session, user_id: int, 
                              search_type: str = None, limit: int = 50) -> List[SearchHistory]:
        """Get user's search history"""
        query = session.query(SearchHistory).filter(SearchHistory.user_id == user_id)
        if search_type:
            query = query.filter(SearchHistory.search_type == search_type)
        return query.order_by(desc(SearchHistory.created_at)).limit(limit).all()