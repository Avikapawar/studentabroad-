import React, { useState } from 'react';
import RecommendationCard from './RecommendationCard';
import UniversityComparison from './UniversityComparison';
import './RecommendationList.css';

const RecommendationList = ({ recommendations, userProfile, loading }) => {
  const [sortBy, setSortBy] = useState('overall_score');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedForComparison, setSelectedForComparison] = useState([]);
  const [showComparison, setShowComparison] = useState(false);

  // Sort recommendations
  const sortedRecommendations = [...recommendations].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    // Handle special cases
    if (sortBy === 'university_name') {
      aValue = a.university_name || '';
      bValue = b.university_name || '';
    } else if (sortBy === 'cost_total') {
      aValue = (a.cost_breakdown?.total_annual_cost || 0);
      bValue = (b.cost_breakdown?.total_annual_cost || 0);
    }

    // Convert to numbers if needed
    if (typeof aValue === 'string' && !isNaN(aValue)) {
      aValue = parseFloat(aValue);
      bValue = parseFloat(bValue);
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  const handleComparisonToggle = (universityId) => {
    setSelectedForComparison(prev => {
      if (prev.includes(universityId)) {
        return prev.filter(id => id !== universityId);
      } else if (prev.length < 4) { // Limit to 4 universities for comparison
        return [...prev, universityId];
      } else {
        // Replace the first one if at limit
        return [...prev.slice(1), universityId];
      }
    });
  };

  const handleShowComparison = () => {
    if (selectedForComparison.length >= 2) {
      setShowComparison(true);
    }
  };

  const handleCloseComparison = () => {
    setShowComparison(false);
  };

  const clearComparison = () => {
    setSelectedForComparison([]);
    setShowComparison(false);
  };

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="recommendation-list-empty">
        <div className="empty-state">
          <div className="empty-icon">🎯</div>
          <h3>No Recommendations Found</h3>
          <p>Try adjusting your filters or updating your profile to get personalized recommendations.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="recommendation-list">
      <div className="list-header">
        <div className="list-controls">
          <div className="sort-controls">
            <label>Sort by:</label>
            <select 
              value={sortBy} 
              onChange={(e) => handleSortChange(e.target.value)}
            >
              <option value="overall_score">Overall Score</option>
              <option value="admission_probability">Admission Probability</option>
              <option value="cost_total">Total Cost</option>
              <option value="university_name">University Name</option>
              <option value="ranking">Ranking</option>
            </select>
            <button 
              className={`sort-order-btn ${sortOrder}`}
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>

          {selectedForComparison.length > 0 && (
            <div className="comparison-controls">
              <span className="comparison-count">
                {selectedForComparison.length} selected for comparison
              </span>
              {selectedForComparison.length >= 2 && (
                <button 
                  className="btn btn-primary btn-small"
                  onClick={handleShowComparison}
                >
                  Compare ({selectedForComparison.length})
                </button>
              )}
              <button 
                className="btn btn-secondary btn-small"
                onClick={clearComparison}
              >
                Clear
              </button>
            </div>
          )}
        </div>

        <div className="list-info">
          <span>{sortedRecommendations.length} recommendations</span>
          {loading && <span className="loading-indicator">Updating...</span>}
        </div>
      </div>

      <div className="recommendations-grid">
        {sortedRecommendations.map((recommendation, index) => (
          <RecommendationCard
            key={recommendation.university_id || index}
            recommendation={recommendation}
            userProfile={userProfile}
            rank={index + 1}
            isSelected={selectedForComparison.includes(recommendation.university_id)}
            onComparisonToggle={handleComparisonToggle}
          />
        ))}
      </div>

      {showComparison && selectedForComparison.length >= 2 && (
        <UniversityComparison
          universityIds={selectedForComparison}
          recommendations={recommendations.filter(r => selectedForComparison.includes(r.university_id))}
          userProfile={userProfile}
          onClose={handleCloseComparison}
        />
      )}
    </div>
  );
};

export default RecommendationList;