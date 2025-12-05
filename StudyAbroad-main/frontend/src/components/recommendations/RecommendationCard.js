import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdmissionProbabilityIndicator from './AdmissionProbabilityIndicator';
import RecommendationExplanation from './RecommendationExplanation';
import bookmarkService from '../../services/bookmarkService';
import { getUniversityLogo, getPlaceholderLogo } from '../../utils/logoUtils';
import './RecommendationCard.css';

const RecommendationCard = ({ 
  recommendation, 
  userProfile, 
  rank, 
  isSelected, 
  onComparisonToggle 
}) => {
  const navigate = useNavigate();
  const [isBookmarked, setIsBookmarked] = useState(recommendation.is_bookmarked || false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [logoLoading, setLogoLoading] = useState(true);

  const {
    university_id,
    university_name,
    country,
    city,
    ranking,
    field,
    admission_probability,
    confidence_level,
    overall_score,
    cost_breakdown,
    reasons,
    university_details
  } = recommendation;

  const handleBookmarkToggle = async (e) => {
    e.stopPropagation();
    setBookmarkLoading(true);

    try {
      if (isBookmarked) {
        await bookmarkService.removeBookmark(university_id);
        setIsBookmarked(false);
      } else {
        await bookmarkService.addBookmark(university_id);
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    } finally {
      setBookmarkLoading(false);
    }
  };

  const handleCardClick = () => {
    navigate(`/universities/${university_id}`);
  };

  const handleComparisonClick = (e) => {
    e.stopPropagation();
    onComparisonToggle(university_id);
  };

  const handleExplanationToggle = (e) => {
    e.stopPropagation();
    setShowExplanation(!showExplanation);
  };

  const getScoreColor = (score) => {
    if (score >= 0.8) return 'excellent';
    if (score >= 0.6) return 'good';
    if (score >= 0.4) return 'fair';
    return 'poor';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Handle logo loading
  const handleLogoLoad = () => {
    setLogoLoading(false);
  };

  // Handle logo error
  const handleLogoError = () => {
    setLogoError(true);
    setLogoLoading(false);
  };

  // Create university object for logo utils
  const universityForLogo = {
    name: university_name,
    logo: university_details?.logo
  };

  // Get logo URL
  const logoUrl = logoError ? getPlaceholderLogo(universityForLogo) : getUniversityLogo(universityForLogo);

  return (
    <div className={`recommendation-card ${isSelected ? 'selected' : ''}`}>
      <div className="card-header">
        <div className="rank-badge">#{rank}</div>
        <div className="card-actions">
          <button
            className={`comparison-btn ${isSelected ? 'active' : ''}`}
            onClick={handleComparisonClick}
            title={isSelected ? 'Remove from comparison' : 'Add to comparison'}
          >
            {isSelected ? '✓' : '+'}
          </button>
          <button
            className={`bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`}
            onClick={handleBookmarkToggle}
            disabled={bookmarkLoading}
            title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
          >
            {bookmarkLoading ? '⏳' : isBookmarked ? '★' : '☆'}
          </button>
        </div>
      </div>

      <div className="card-content" onClick={handleCardClick}>
        <div className="university-info">
          <div className="university-header">
            <div className="university-logo-container">
              {logoLoading && (
                <div className="logo-skeleton">
                  <div className="skeleton-loader"></div>
                </div>
              )}
              <img
                src={logoUrl}
                alt={`${university_name} logo`}
                className={`university-logo ${logoLoading ? 'loading' : ''}`}
                onLoad={handleLogoLoad}
                onError={handleLogoError}
                loading="lazy"
              />
            </div>
            <div className="university-text">
              <h3 className="university-name">{university_name}</h3>
              <div className="university-location">
                <span className="location">📍 {city}, {country}</span>
                {ranking && <span className="ranking">🏆 Rank #{ranking}</span>}
              </div>
              {field && <div className="field">📚 {field}</div>}
            </div>
          </div>
        </div>

        <div className="recommendation-metrics">
          <div className="overall-score">
            <div className="score-label">Overall Match</div>
            <div className={`score-value ${getScoreColor(overall_score)}`}>
              {(overall_score * 100).toFixed(0)}%
            </div>
          </div>

          <AdmissionProbabilityIndicator
            probability={admission_probability}
            confidenceLevel={confidence_level}
            size="medium"
          />
        </div>

        {cost_breakdown && (
          <div className="cost-info">
            <div className="cost-item">
              <span className="cost-label">Tuition:</span>
              <span className="cost-value">{formatCurrency(cost_breakdown.tuition_fee || 0)}</span>
            </div>
            <div className="cost-item">
              <span className="cost-label">Living:</span>
              <span className="cost-value">{formatCurrency(cost_breakdown.living_cost || 0)}</span>
            </div>
            <div className="cost-item total">
              <span className="cost-label">Total/Year:</span>
              <span className="cost-value">{formatCurrency(cost_breakdown.total_annual_cost || 0)}</span>
            </div>
          </div>
        )}

        {reasons && reasons.length > 0 && (
          <div className="recommendation-reasons">
            <div className="reasons-header">
              <span>Why recommended:</span>
              <button 
                className="explanation-btn"
                onClick={handleExplanationToggle}
              >
                {showExplanation ? 'Hide details' : 'Show details'}
              </button>
            </div>
            <div className="reasons-preview">
              {reasons.slice(0, 2).map((reason, index) => (
                <div key={index} className="reason-item">
                  • {reason}
                </div>
              ))}
              {reasons.length > 2 && !showExplanation && (
                <div className="more-reasons">
                  +{reasons.length - 2} more reasons
                </div>
              )}
            </div>
          </div>
        )}

        {university_details && (
          <div className="university-highlights">
            {university_details.acceptance_rate && (
              <div className="highlight">
                <span className="highlight-label">Acceptance Rate:</span>
                <span className="highlight-value">{(university_details.acceptance_rate * 100).toFixed(1)}%</span>
              </div>
            )}
            {university_details.min_gre && (
              <div className="highlight">
                <span className="highlight-label">Min GRE:</span>
                <span className="highlight-value">{university_details.min_gre}</span>
              </div>
            )}
            {university_details.min_ielts && (
              <div className="highlight">
                <span className="highlight-label">Min IELTS:</span>
                <span className="highlight-value">{university_details.min_ielts}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {showExplanation && (
        <RecommendationExplanation
          universityId={university_id}
          universityName={university_name}
          userProfile={userProfile}
          onClose={() => setShowExplanation(false)}
        />
      )}

      <div className="card-footer">
        <button className="btn btn-primary btn-small" onClick={handleCardClick}>
          View Details
        </button>
        <div className="card-meta">
          <span className="confidence">
            {confidence_level} confidence
          </span>
        </div>
      </div>
    </div>
  );
};

export default RecommendationCard;