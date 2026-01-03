import React from 'react';
import './AdmissionProbabilityIndicator.css';

const AdmissionProbabilityIndicator = ({ 
  probability, 
  confidenceLevel = 'medium', 
  size = 'medium',
  showLabel = true,
  showPercentage = true 
}) => {
  const probabilityPercent = Math.round((probability || 0) * 100);
  
  const getProbabilityLevel = (prob) => {
    if (prob >= 0.7) return 'high';
    if (prob >= 0.4) return 'medium';
    return 'low';
  };

  const getProbabilityText = (prob) => {
    if (prob >= 0.8) return 'Excellent';
    if (prob >= 0.6) return 'Good';
    if (prob >= 0.4) return 'Fair';
    if (prob >= 0.2) return 'Low';
    return 'Very Low';
  };

  const getConfidenceIcon = (confidence) => {
    switch (confidence?.toLowerCase()) {
      case 'high': return '🎯';
      case 'medium': return '📊';
      case 'low': return '📈';
      default: return '📊';
    }
  };

  const level = getProbabilityLevel(probability);
  const text = getProbabilityText(probability);

  return (
    <div className={`admission-probability-indicator ${size} ${level}`}>
      {showLabel && (
        <div className="probability-label">
          Admission Chance
        </div>
      )}
      
      <div className="probability-display">
        <div className="probability-circle">
          <svg className="probability-svg" viewBox="0 0 36 36">
            <path
              className="circle-bg"
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="circle-progress"
              strokeDasharray={`${probabilityPercent}, 100`}
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="probability-text">
            {showPercentage && (
              <div className="probability-percentage">
                {probabilityPercent}%
              </div>
            )}
            <div className="probability-level">
              {text}
            </div>
          </div>
        </div>
      </div>

      <div className="confidence-indicator">
        <span className="confidence-icon">{getConfidenceIcon(confidenceLevel)}</span>
        <span className="confidence-text">{confidenceLevel} confidence</span>
      </div>
    </div>
  );
};

export default AdmissionProbabilityIndicator;