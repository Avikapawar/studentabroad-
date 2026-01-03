import React, { useState, useEffect } from 'react';
import recommendationService from '../../services/recommendationService';
import LoadingSpinner from '../common/LoadingSpinner';
import './RecommendationExplanation.css';

const RecommendationExplanation = ({ 
  universityId, 
  universityName, 
  userProfile, 
  onClose 
}) => {
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadExplanation();
  }, [universityId]);

  const loadExplanation = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await recommendationService.getRecommendationExplanation(universityId);
      
      if (response.success) {
        setExplanation(response.explanation);
      } else {
        setError('Failed to load explanation');
      }
    } catch (error) {
      console.error('Error loading explanation:', error);
      setError('Failed to load explanation');
    } finally {
      setLoading(false);
    }
  };

  const renderFactorAnalysis = (factors) => {
    if (!factors || !Array.isArray(factors)) return null;

    return (
      <div className="factor-analysis">
        <h4>Factor Analysis</h4>
        <div className="factors-grid">
          {factors.map((factor, index) => (
            <div key={index} className={`factor-item ${factor.impact?.toLowerCase() || 'neutral'}`}>
              <div className="factor-header">
                <span className="factor-name">{factor.factor}</span>
                <span className={`factor-impact ${factor.impact?.toLowerCase() || 'neutral'}`}>
                  {factor.impact === 'positive' && '✓'}
                  {factor.impact === 'negative' && '✗'}
                  {factor.impact === 'neutral' && '○'}
                  {factor.impact || 'Neutral'}
                </span>
              </div>
              <div className="factor-description">{factor.description}</div>
              {factor.score !== undefined && (
                <div className="factor-score">
                  Score: {(factor.score * 100).toFixed(0)}%
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderRecommendations = (recommendations) => {
    if (!recommendations || !Array.isArray(recommendations)) return null;

    return (
      <div className="improvement-recommendations">
        <h4>Recommendations for Improvement</h4>
        <ul className="recommendations-list">
          {recommendations.map((rec, index) => (
            <li key={index} className="recommendation-item">
              <span className="recommendation-icon">💡</span>
              {rec}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderScoreBreakdown = (breakdown) => {
    if (!breakdown) return null;

    return (
      <div className="score-breakdown">
        <h4>Score Breakdown</h4>
        <div className="breakdown-items">
          {Object.entries(breakdown).map(([key, value]) => (
            <div key={key} className="breakdown-item">
              <span className="breakdown-label">
                {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
              </span>
              <div className="breakdown-bar">
                <div 
                  className="breakdown-fill" 
                  style={{ width: `${(value || 0) * 100}%` }}
                ></div>
                <span className="breakdown-value">{((value || 0) * 100).toFixed(0)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="recommendation-explanation">
        <div className="explanation-header">
          <h3>Loading Explanation...</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="explanation-content">
          <LoadingSpinner size="small" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recommendation-explanation">
        <div className="explanation-header">
          <h3>Explanation for {universityName}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="explanation-content">
          <div className="error-message">
            <span>⚠️ {error}</span>
            <button className="btn btn-small" onClick={loadExplanation}>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="recommendation-explanation">
      <div className="explanation-header">
        <h3>Why {universityName} was recommended</h3>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="explanation-content">
        {explanation?.summary && (
          <div className="explanation-summary">
            <p>{explanation.summary}</p>
          </div>
        )}

        {explanation?.overall_score !== undefined && (
          <div className="overall-score-display">
            <div className="score-circle">
              <span className="score-value">{(explanation.overall_score * 100).toFixed(0)}%</span>
              <span className="score-label">Overall Match</span>
            </div>
          </div>
        )}

        {explanation?.factors && renderFactorAnalysis(explanation.factors)}

        {explanation?.score_breakdown && renderScoreBreakdown(explanation.score_breakdown)}

        {explanation?.strengths && explanation.strengths.length > 0 && (
          <div className="strengths-section">
            <h4>Your Strengths for this University</h4>
            <ul className="strengths-list">
              {explanation.strengths.map((strength, index) => (
                <li key={index} className="strength-item">
                  <span className="strength-icon">✓</span>
                  {strength}
                </li>
              ))}
            </ul>
          </div>
        )}

        {explanation?.concerns && explanation.concerns.length > 0 && (
          <div className="concerns-section">
            <h4>Areas of Concern</h4>
            <ul className="concerns-list">
              {explanation.concerns.map((concern, index) => (
                <li key={index} className="concern-item">
                  <span className="concern-icon">⚠️</span>
                  {concern}
                </li>
              ))}
            </ul>
          </div>
        )}

        {explanation?.recommendations && renderRecommendations(explanation.recommendations)}

        {explanation?.comparison_with_requirements && (
          <div className="requirements-comparison">
            <h4>How You Compare to Requirements</h4>
            <div className="comparison-grid">
              {Object.entries(explanation.comparison_with_requirements).map(([req, comparison]) => (
                <div key={req} className={`comparison-item ${comparison.status?.toLowerCase() || 'unknown'}`}>
                  <div className="comparison-header">
                    <span className="requirement-name">
                      {req.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                    <span className={`status-badge ${comparison.status?.toLowerCase() || 'unknown'}`}>
                      {comparison.status || 'Unknown'}
                    </span>
                  </div>
                  <div className="comparison-details">
                    <div className="your-value">Your: {comparison.your_value || 'N/A'}</div>
                    <div className="required-value">Required: {comparison.required_value || 'N/A'}</div>
                  </div>
                  {comparison.note && (
                    <div className="comparison-note">{comparison.note}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationExplanation;