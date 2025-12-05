import React, { useState } from 'react';
import AdmissionProbabilityIndicator from './AdmissionProbabilityIndicator';
import './UniversityComparison.css';

const UniversityComparison = ({ 
  universityIds, 
  recommendations, 
  userProfile, 
  onClose 
}) => {
  const [comparisonView, setComparisonView] = useState('overview');

  // Get the recommendations for the selected universities
  const selectedRecommendations = recommendations.filter(rec => 
    universityIds.includes(rec.university_id)
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const getScoreColor = (score) => {
    if (score >= 0.8) return 'excellent';
    if (score >= 0.6) return 'good';
    if (score >= 0.4) return 'fair';
    return 'poor';
  };

  const renderOverviewComparison = () => (
    <div className="comparison-overview">
      <div className="comparison-table">
        <div className="comparison-header">
          <div className="header-cell metric-header">Metric</div>
          {selectedRecommendations.map(rec => (
            <div key={rec.university_id} className="header-cell university-header">
              <div className="university-name">{rec.university_name}</div>
              <div className="university-location">{rec.city}, {rec.country}</div>
            </div>
          ))}
        </div>

        <div className="comparison-row">
          <div className="metric-cell">Overall Match</div>
          {selectedRecommendations.map(rec => (
            <div key={rec.university_id} className="value-cell">
              <div className={`score-badge ${getScoreColor(rec.overall_score)}`}>
                {(rec.overall_score * 100).toFixed(0)}%
              </div>
            </div>
          ))}
        </div>

        <div className="comparison-row">
          <div className="metric-cell">Admission Probability</div>
          {selectedRecommendations.map(rec => (
            <div key={rec.university_id} className="value-cell">
              <AdmissionProbabilityIndicator
                probability={rec.admission_probability}
                confidenceLevel={rec.confidence_level}
                size="small"
                showLabel={false}
              />
            </div>
          ))}
        </div>

        <div className="comparison-row">
          <div className="metric-cell">University Ranking</div>
          {selectedRecommendations.map(rec => (
            <div key={rec.university_id} className="value-cell">
              {rec.ranking ? `#${rec.ranking}` : 'N/A'}
            </div>
          ))}
        </div>

        <div className="comparison-row">
          <div className="metric-cell">Annual Tuition</div>
          {selectedRecommendations.map(rec => (
            <div key={rec.university_id} className="value-cell">
              {formatCurrency(rec.cost_breakdown?.tuition_fee)}
            </div>
          ))}
        </div>

        <div className="comparison-row">
          <div className="metric-cell">Living Costs</div>
          {selectedRecommendations.map(rec => (
            <div key={rec.university_id} className="value-cell">
              {formatCurrency(rec.cost_breakdown?.living_cost)}
            </div>
          ))}
        </div>

        <div className="comparison-row total-row">
          <div className="metric-cell">Total Annual Cost</div>
          {selectedRecommendations.map(rec => (
            <div key={rec.university_id} className="value-cell">
              <strong>{formatCurrency(rec.cost_breakdown?.total_annual_cost)}</strong>
            </div>
          ))}
        </div>

        {selectedRecommendations.some(rec => rec.university_details?.acceptance_rate) && (
          <div className="comparison-row">
            <div className="metric-cell">Acceptance Rate</div>
            {selectedRecommendations.map(rec => (
              <div key={rec.university_id} className="value-cell">
                {rec.university_details?.acceptance_rate ? 
                  `${(rec.university_details.acceptance_rate * 100).toFixed(1)}%` : 
                  'N/A'
                }
              </div>
            ))}
          </div>
        )}

        {selectedRecommendations.some(rec => rec.university_details?.min_gre) && (
          <div className="comparison-row">
            <div className="metric-cell">Min GRE Score</div>
            {selectedRecommendations.map(rec => (
              <div key={rec.university_id} className="value-cell">
                {rec.university_details?.min_gre || 'N/A'}
              </div>
            ))}
          </div>
        )}

        {selectedRecommendations.some(rec => rec.university_details?.min_ielts) && (
          <div className="comparison-row">
            <div className="metric-cell">Min IELTS Score</div>
            {selectedRecommendations.map(rec => (
              <div key={rec.university_id} className="value-cell">
                {rec.university_details?.min_ielts || 'N/A'}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderDetailedComparison = () => (
    <div className="detailed-comparison">
      <div className="universities-grid">
        {selectedRecommendations.map(rec => (
          <div key={rec.university_id} className="university-detail-card">
            <div className="card-header">
              <h3>{rec.university_name}</h3>
              <div className="location">{rec.city}, {rec.country}</div>
            </div>

            <div className="metrics-section">
              <div className="metric-item">
                <span className="metric-label">Overall Match:</span>
                <div className={`score-badge ${getScoreColor(rec.overall_score)}`}>
                  {(rec.overall_score * 100).toFixed(0)}%
                </div>
              </div>

              <div className="metric-item">
                <span className="metric-label">Admission Probability:</span>
                <AdmissionProbabilityIndicator
                  probability={rec.admission_probability}
                  confidenceLevel={rec.confidence_level}
                  size="small"
                  showLabel={false}
                />
              </div>
            </div>

            <div className="costs-section">
              <h4>Cost Breakdown</h4>
              {rec.cost_breakdown && (
                <div className="cost-items">
                  <div className="cost-item">
                    <span>Tuition:</span>
                    <span>{formatCurrency(rec.cost_breakdown.tuition_fee)}</span>
                  </div>
                  <div className="cost-item">
                    <span>Living:</span>
                    <span>{formatCurrency(rec.cost_breakdown.living_cost)}</span>
                  </div>
                  <div className="cost-item">
                    <span>Application:</span>
                    <span>{formatCurrency(rec.cost_breakdown.application_fee)}</span>
                  </div>
                  <div className="cost-item total">
                    <span>Total/Year:</span>
                    <span><strong>{formatCurrency(rec.cost_breakdown.total_annual_cost)}</strong></span>
                  </div>
                </div>
              )}
            </div>

            {rec.reasons && rec.reasons.length > 0 && (
              <div className="reasons-section">
                <h4>Why Recommended</h4>
                <ul className="reasons-list">
                  {rec.reasons.slice(0, 3).map((reason, index) => (
                    <li key={index}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}

            {rec.university_details && (
              <div className="requirements-section">
                <h4>Requirements</h4>
                <div className="requirements-grid">
                  {rec.university_details.min_gre && (
                    <div className="requirement-item">
                      <span className="req-label">Min GRE:</span>
                      <span className="req-value">{rec.university_details.min_gre}</span>
                    </div>
                  )}
                  {rec.university_details.min_ielts && (
                    <div className="requirement-item">
                      <span className="req-label">Min IELTS:</span>
                      <span className="req-value">{rec.university_details.min_ielts}</span>
                    </div>
                  )}
                  {rec.university_details.min_cgpa && (
                    <div className="requirement-item">
                      <span className="req-label">Min CGPA:</span>
                      <span className="req-value">{rec.university_details.min_cgpa}</span>
                    </div>
                  )}
                  {rec.university_details.acceptance_rate && (
                    <div className="requirement-item">
                      <span className="req-label">Acceptance Rate:</span>
                      <span className="req-value">{(rec.university_details.acceptance_rate * 100).toFixed(1)}%</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderCostComparison = () => (
    <div className="cost-comparison">
      <div className="cost-chart-container">
        <h3>Cost Comparison</h3>
        <div className="cost-bars">
          {selectedRecommendations.map(rec => {
            const totalCost = rec.cost_breakdown?.total_annual_cost || 0;
            const maxCost = Math.max(...selectedRecommendations.map(r => r.cost_breakdown?.total_annual_cost || 0));
            const percentage = maxCost > 0 ? (totalCost / maxCost) * 100 : 0;

            return (
              <div key={rec.university_id} className="cost-bar-item">
                <div className="university-info">
                  <span className="university-name">{rec.university_name}</span>
                  <span className="cost-value">{formatCurrency(totalCost)}</span>
                </div>
                <div className="cost-bar">
                  <div 
                    className="cost-fill" 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="cost-breakdown-mini">
                  <span>Tuition: {formatCurrency(rec.cost_breakdown?.tuition_fee)}</span>
                  <span>Living: {formatCurrency(rec.cost_breakdown?.living_cost)}</span>
                </div>
              </div>
            );
          })}
        </div>

        {userProfile?.budget_max && (
          <div className="budget-line">
            <div className="budget-indicator">
              <span>Your Budget: {formatCurrency(userProfile.budget_max)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="university-comparison-modal">
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal-content">
        <div className="modal-header">
          <h2>University Comparison ({selectedRecommendations.length})</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="comparison-tabs">
          <button 
            className={`tab-btn ${comparisonView === 'overview' ? 'active' : ''}`}
            onClick={() => setComparisonView('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab-btn ${comparisonView === 'detailed' ? 'active' : ''}`}
            onClick={() => setComparisonView('detailed')}
          >
            Detailed
          </button>
          <button 
            className={`tab-btn ${comparisonView === 'costs' ? 'active' : ''}`}
            onClick={() => setComparisonView('costs')}
          >
            Cost Analysis
          </button>
        </div>

        <div className="comparison-content">
          {comparisonView === 'overview' && renderOverviewComparison()}
          {comparisonView === 'detailed' && renderDetailedComparison()}
          {comparisonView === 'costs' && renderCostComparison()}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};

export default UniversityComparison;