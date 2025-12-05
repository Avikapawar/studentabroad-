import React, { useState, useEffect, useCallback } from 'react';
import InteractiveAnalyticsChart from './InteractiveAnalyticsChart';
import AdmissionProbabilityChart from './AdmissionProbabilityChart';
import ComparisonAnalyticsChart from './ComparisonAnalyticsChart';
import CostAnalysisChart from './CostAnalysisChart';
import './EnhancedVisualizationDashboard.css';

const EnhancedVisualizationDashboard = ({ 
  recommendations, 
  userProfile, 
  selectedUniversities = null 
}) => {
  const [activeTab, setActiveTab] = useState('interactive');
  const [selectedChartType, setSelectedChartType] = useState('admission_probability_with_confidence');
  const [drillDownUniversity, setDrillDownUniversity] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [chartFilters, setChartFilters] = useState({
    probabilityRange: [0, 1],
    costRange: [0, 200000],
    showConfidenceIntervals: true,
    maxUniversities: 10
  });

  // Responsive detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Filter recommendations based on current filters
  const filteredRecommendations = recommendations.filter(rec => {
    const probability = rec.admission_probability || 0;
    const cost = rec.cost_breakdown?.total_annual_cost || 0;
    
    return probability >= chartFilters.probabilityRange[0] &&
           probability <= chartFilters.probabilityRange[1] &&
           cost >= chartFilters.costRange[0] &&
           cost <= chartFilters.costRange[1];
  }).slice(0, chartFilters.maxUniversities);

  // Handle drill-down events
  const handleDrillDown = useCallback((drillDownData) => {
    setDrillDownUniversity(drillDownData);
  }, []);

  const handleUniversityClick = useCallback((university) => {
    console.log('University clicked:', university.university_name);
    // Could trigger navigation to university detail page
  }, []);

  // Chart type configurations
  const chartTypes = {
    interactive: [
      {
        id: 'admission_probability_with_confidence',
        name: 'Admission Probability + Confidence',
        description: 'Interactive bars with confidence intervals',
        icon: '📊'
      },
      {
        id: 'multi_university_comparison',
        name: 'Multi-Dimensional Comparison',
        description: 'Radar chart comparing multiple metrics',
        icon: '🎯'
      },
      {
        id: 'profile_strength_analysis',
        name: 'Profile Strength Analysis',
        description: 'Your academic credentials analysis',
        icon: '💪'
      }
    ],
    traditional: [
      {
        id: 'probability_bars',
        name: 'Probability Bars',
        description: 'Simple admission probability bars',
        icon: '📈'
      },
      {
        id: 'scatter_analysis',
        name: 'Cost vs Probability',
        description: 'Scatter plot analysis',
        icon: '💰'
      },
      {
        id: 'radar_comparison',
        name: 'Radar Comparison',
        description: 'Multi-metric radar chart',
        icon: '🔍'
      }
    ]
  };

  // Get dashboard statistics
  const getDashboardStats = () => {
    if (!filteredRecommendations.length) return {};

    const highProb = filteredRecommendations.filter(r => (r.admission_probability || 0) >= 0.7).length;
    const mediumProb = filteredRecommendations.filter(r => {
      const prob = r.admission_probability || 0;
      return prob >= 0.4 && prob < 0.7;
    }).length;
    const lowProb = filteredRecommendations.filter(r => (r.admission_probability || 0) < 0.4).length;

    const avgProb = filteredRecommendations.reduce((sum, r) => sum + (r.admission_probability || 0), 0) / filteredRecommendations.length;
    const avgCost = filteredRecommendations.reduce((sum, r) => sum + (r.cost_breakdown?.total_annual_cost || 0), 0) / filteredRecommendations.length;

    const withinBudget = userProfile?.budget_max 
      ? filteredRecommendations.filter(r => (r.cost_breakdown?.total_annual_cost || 0) <= userProfile.budget_max).length
      : 0;

    return {
      total: filteredRecommendations.length,
      highProb,
      mediumProb,
      lowProb,
      avgProb,
      avgCost,
      withinBudget
    };
  };

  const stats = getDashboardStats();

  // Render filter panel
  const renderFilterPanel = () => (
    <div className={`filter-panel ${showFilters ? 'expanded' : ''}`}>
      <div className="filter-header">
        <h4>📊 Chart Filters</h4>
        <button 
          className="toggle-filters"
          onClick={() => setShowFilters(!showFilters)}
          aria-label={showFilters ? 'Hide filters' : 'Show filters'}
        >
          {showFilters ? '▲' : '▼'}
        </button>
      </div>
      
      {showFilters && (
        <div className="filter-content">
          <div className="filter-group">
            <label>Admission Probability Range</label>
            <div className="range-inputs">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={chartFilters.probabilityRange[0]}
                onChange={(e) => setChartFilters(prev => ({
                  ...prev,
                  probabilityRange: [parseFloat(e.target.value), prev.probabilityRange[1]]
                }))}
              />
              <span>{(chartFilters.probabilityRange[0] * 100).toFixed(0)}% - {(chartFilters.probabilityRange[1] * 100).toFixed(0)}%</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={chartFilters.probabilityRange[1]}
                onChange={(e) => setChartFilters(prev => ({
                  ...prev,
                  probabilityRange: [prev.probabilityRange[0], parseFloat(e.target.value)]
                }))}
              />
            </div>
          </div>

          <div className="filter-group">
            <label>Maximum Universities to Show</label>
            <select
              value={chartFilters.maxUniversities}
              onChange={(e) => setChartFilters(prev => ({
                ...prev,
                maxUniversities: parseInt(e.target.value)
              }))}
            >
              <option value={5}>5 Universities</option>
              <option value={10}>10 Universities</option>
              <option value={15}>15 Universities</option>
              <option value={20}>20 Universities</option>
            </select>
          </div>

          <div className="filter-group">
            <label>
              <input
                type="checkbox"
                checked={chartFilters.showConfidenceIntervals}
                onChange={(e) => setChartFilters(prev => ({
                  ...prev,
                  showConfidenceIntervals: e.target.checked
                }))}
              />
              Show Confidence Intervals
            </label>
          </div>
        </div>
      )}
    </div>
  );

  // Render dashboard statistics
  const renderDashboardStats = () => (
    <div className="dashboard-stats">
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Universities</div>
          </div>
        </div>
        
        <div className="stat-card success">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">{stats.highProb}</div>
            <div className="stat-label">High Probability</div>
          </div>
        </div>
        
        <div className="stat-card warning">
          <div className="stat-icon">⚡</div>
          <div className="stat-content">
            <div className="stat-value">{(stats.avgProb * 100).toFixed(0)}%</div>
            <div className="stat-label">Avg. Probability</div>
          </div>
        </div>
        
        {userProfile?.budget_max && (
          <div className="stat-card info">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <div className="stat-value">{stats.withinBudget}</div>
              <div className="stat-label">Within Budget</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Render chart type selector
  const renderChartTypeSelector = () => {
    const currentTypes = chartTypes[activeTab] || [];
    
    return (
      <div className="chart-type-selector">
        <div className="selector-header">
          <h4>📈 Chart Types</h4>
        </div>
        <div className="chart-types-grid">
          {currentTypes.map(type => (
            <button
              key={type.id}
              className={`chart-type-card ${selectedChartType === type.id ? 'active' : ''}`}
              onClick={() => setSelectedChartType(type.id)}
            >
              <div className="chart-type-icon">{type.icon}</div>
              <div className="chart-type-content">
                <div className="chart-type-name">{type.name}</div>
                <div className="chart-type-description">{type.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Render main chart area
  const renderMainChart = () => {
    if (activeTab === 'interactive') {
      return (
        <InteractiveAnalyticsChart
          recommendations={filteredRecommendations}
          userProfile={userProfile}
          chartType={selectedChartType}
          selectedUniversities={selectedUniversities}
          onUniversityClick={handleUniversityClick}
          onDrillDown={handleDrillDown}
          showInteractiveTooltips={true}
          enableDrillDown={true}
        />
      );
    } else {
      // Traditional charts
      switch (selectedChartType) {
        case 'probability_bars':
        case 'scatter_analysis':
        case 'confidence_bands':
        case 'profile_strength':
          return (
            <AdmissionProbabilityChart
              recommendations={filteredRecommendations}
              userProfile={userProfile}
              chartType={selectedChartType}
              showConfidenceIntervals={chartFilters.showConfidenceIntervals}
            />
          );
        case 'radar_comparison':
        case 'metrics_comparison':
        case 'ranking_distribution':
        case 'cost_distribution':
          return (
            <ComparisonAnalyticsChart
              recommendations={filteredRecommendations}
              userProfile={userProfile}
              selectedUniversities={selectedUniversities}
              chartType={selectedChartType}
              maxUniversities={chartFilters.maxUniversities}
            />
          );
        default:
          return (
            <AdmissionProbabilityChart
              recommendations={filteredRecommendations}
              userProfile={userProfile}
              chartType="probability_bars"
              showConfidenceIntervals={chartFilters.showConfidenceIntervals}
            />
          );
      }
    }
  };

  // Render drill-down details
  const renderDrillDownDetails = () => {
    if (!drillDownUniversity) return null;

    return (
      <div className="drill-down-details">
        <div className="drill-down-header">
          <h3>🔍 Detailed Analysis</h3>
          <button 
            className="close-drill-down"
            onClick={() => setDrillDownUniversity(null)}
          >
            ✕
          </button>
        </div>
        <div className="drill-down-content">
          <div className="university-info">
            <h4>{drillDownUniversity.university.university_name}</h4>
            <div className="university-details">
              <div className="detail-item">
                <span className="detail-label">Country:</span>
                <span className="detail-value">{drillDownUniversity.university.country}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Ranking:</span>
                <span className="detail-value">#{drillDownUniversity.university.ranking}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Field:</span>
                <span className="detail-value">{drillDownUniversity.university.field}</span>
              </div>
            </div>
          </div>
          
          <div className="detailed-metrics">
            <h5>📊 Detailed Metrics</h5>
            <div className="metrics-grid">
              {Object.entries(drillDownUniversity.detailedMetrics).map(([key, value]) => (
                <div key={key} className="metric-item">
                  <div className="metric-name">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</div>
                  <div className="metric-value">{(value * 100).toFixed(1)}%</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="recommendations">
            <h5>💡 Recommendations</h5>
            <ul>
              {drillDownUniversity.recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="enhanced-visualization-dashboard">
        <div className="no-data-state">
          <div className="no-data-icon">📊</div>
          <h3>No Visualization Data Available</h3>
          <p>Interactive charts and analytics will appear once you have university recommendations.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="enhanced-visualization-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h2>🚀 Enhanced Analytics Dashboard</h2>
          <p>Interactive visualizations with drill-down capabilities and mobile-optimized design</p>
        </div>
        
        <div className="dashboard-tabs">
          <button 
            className={`tab-button ${activeTab === 'interactive' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('interactive');
              setSelectedChartType('admission_probability_with_confidence');
            }}
          >
            🎯 Interactive Charts
          </button>
          <button 
            className={`tab-button ${activeTab === 'traditional' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('traditional');
              setSelectedChartType('probability_bars');
            }}
          >
            📊 Traditional Charts
          </button>
        </div>
      </div>

      {renderDashboardStats()}

      <div className="dashboard-content">
        <div className="sidebar">
          {renderFilterPanel()}
          {renderChartTypeSelector()}
        </div>

        <div className="main-content">
          <div className="chart-area">
            {renderMainChart()}
          </div>
        </div>
      </div>

      {drillDownUniversity && renderDrillDownDetails()}

      {/* Mobile-specific quick actions */}
      {isMobile && (
        <div className="mobile-quick-actions">
          <button 
            className="quick-action-btn"
            onClick={() => setShowFilters(!showFilters)}
          >
            🔧 Filters
          </button>
          <button 
            className="quick-action-btn"
            onClick={() => {
              const element = document.querySelector('.chart-area');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            📊 Chart
          </button>
          {drillDownUniversity && (
            <button 
              className="quick-action-btn"
              onClick={() => setDrillDownUniversity(null)}
            >
              ✕ Close Details
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedVisualizationDashboard;