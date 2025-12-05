import React, { useState, useEffect } from 'react';
import CostAnalysisChart from './CostAnalysisChart';
import CostCalculator from './CostCalculator';
import costAnalysisService from '../../services/costAnalysisService';
import LoadingSpinner from '../common/LoadingSpinner';
import './CostVisualizationDashboard.css';

const CostVisualizationDashboard = ({ 
  recommendations, 
  userProfile, 
  selectedUniversities = null 
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedChartType, setSelectedChartType] = useState('breakdown');
  const [selectedUniversityForCalculator, setSelectedUniversityForCalculator] = useState(null);
  const [calculatorResults, setCalculatorResults] = useState({});
  const [costAnalysis, setCostAnalysis] = useState(null);
  const [costTrends, setCostTrends] = useState({});
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [inflationRate, setInflationRate] = useState(3.0);
  const [studyDuration, setStudyDuration] = useState(2);

  useEffect(() => {
    if (recommendations && recommendations.length > 0) {
      loadCostAnalysis();
    }
  }, [recommendations, userProfile]);

  const loadCostAnalysis = async () => {
    if (!recommendations || recommendations.length === 0) return;

    setLoadingAnalysis(true);
    try {
      const universityIds = recommendations.map(rec => rec.university_id);
      
      // Load comparative cost analysis
      const analysisResponse = await costAnalysisService.getComparativeCostAnalysis(
        universityIds, 
        userProfile
      );
      
      if (analysisResponse.success) {
        setCostAnalysis(analysisResponse.cost_analysis);
      }
    } catch (error) {
      console.error('Error loading cost analysis:', error);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const loadCostTrends = async (universityId) => {
    if (costTrends[universityId]) return; // Already loaded

    try {
      const trendsResponse = await costAnalysisService.getCostTrends(
        universityId, 
        studyDuration, 
        inflationRate, 
        userProfile
      );
      
      if (trendsResponse.success) {
        setCostTrends(prev => ({
          ...prev,
          [universityId]: trendsResponse.cost_trends
        }));
      }
    } catch (error) {
      console.error('Error loading cost trends:', error);
    }
  };

  const handleCalculatorUpdate = (universityId, results) => {
    setCalculatorResults(prev => ({
      ...prev,
      [universityId]: results
    }));
  };

  const getAffordableRecommendations = () => {
    if (!userProfile?.budget_max) return recommendations;
    
    return recommendations.filter(rec => 
      (rec.cost_breakdown?.total_annual_cost || 0) <= userProfile.budget_max
    );
  };

  const getCostStatistics = () => {
    if (!recommendations.length) return {};

    const costs = recommendations
      .map(rec => rec.cost_breakdown?.total_annual_cost || 0)
      .filter(cost => cost > 0);

    if (!costs.length) return {};

    const sortedCosts = [...costs].sort((a, b) => a - b);
    const total = costs.reduce((sum, cost) => sum + cost, 0);

    return {
      min: Math.min(...costs),
      max: Math.max(...costs),
      average: total / costs.length,
      median: sortedCosts[Math.floor(sortedCosts.length / 2)],
      affordable: getAffordableRecommendations().length,
      total: recommendations.length
    };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const statistics = getCostStatistics();

  const renderOverviewTab = () => (
    <div className="overview-tab">
      <div className="cost-controls">
        <div className="control-group">
          <label>Currency:</label>
          <select 
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value)}
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="CAD">CAD (C$)</option>
            <option value="AUD">AUD (A$)</option>
            <option value="INR">INR (₹)</option>
          </select>
        </div>
        <div className="control-group">
          <label>Study Duration:</label>
          <select 
            value={studyDuration}
            onChange={(e) => setStudyDuration(parseInt(e.target.value))}
          >
            <option value={1}>1 Year</option>
            <option value={2}>2 Years</option>
            <option value={3}>3 Years</option>
            <option value={4}>4 Years</option>
          </select>
        </div>
        <div className="control-group">
          <label>Inflation Rate:</label>
          <input 
            type="number" 
            min="0" 
            max="10" 
            step="0.1"
            value={inflationRate}
            onChange={(e) => setInflationRate(parseFloat(e.target.value) || 0)}
          />
          <span>%</span>
        </div>
      </div>

      <div className="cost-statistics">
        <h3>Cost Statistics</h3>
        {loadingAnalysis ? (
          <div className="loading-stats">
            <LoadingSpinner size="small" />
            <span>Loading enhanced cost analysis...</span>
          </div>
        ) : (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">
                {costAnalysisService.formatCurrency(
                  costAnalysisService.convertCurrency(statistics.min, 'USD', selectedCurrency), 
                  selectedCurrency
                )}
              </div>
              <div className="stat-label">Lowest Cost</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {costAnalysisService.formatCurrency(
                  costAnalysisService.convertCurrency(statistics.max, 'USD', selectedCurrency), 
                  selectedCurrency
                )}
              </div>
              <div className="stat-label">Highest Cost</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {costAnalysisService.formatCurrency(
                  costAnalysisService.convertCurrency(statistics.average, 'USD', selectedCurrency), 
                  selectedCurrency
                )}
              </div>
              <div className="stat-label">Average Cost</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {costAnalysisService.formatCurrency(
                  costAnalysisService.convertCurrency(statistics.median, 'USD', selectedCurrency), 
                  selectedCurrency
                )}
              </div>
              <div className="stat-label">Median Cost</div>
            </div>
            {userProfile?.budget_max && (
              <>
                <div className="stat-card affordable">
                  <div className="stat-value">{statistics.affordable}</div>
                  <div className="stat-label">Within Budget</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{statistics.total - statistics.affordable}</div>
                  <div className="stat-label">Over Budget</div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {costAnalysis && (
        <div className="enhanced-cost-analysis">
          <h3>Cost Distribution Analysis</h3>
          <div className="distribution-stats">
            <div className="quartile-info">
              <h4>Cost Quartiles</h4>
              <div className="quartile-grid">
                <div className="quartile-item">
                  <span className="quartile-label">Q1 (25th percentile):</span>
                  <span className="quartile-value">
                    {costAnalysisService.formatCurrency(
                      costAnalysisService.convertCurrency(costAnalysis.cost_distribution.quartiles.q1, 'USD', selectedCurrency), 
                      selectedCurrency
                    )}
                  </span>
                </div>
                <div className="quartile-item">
                  <span className="quartile-label">Q3 (75th percentile):</span>
                  <span className="quartile-value">
                    {costAnalysisService.formatCurrency(
                      costAnalysisService.convertCurrency(costAnalysis.cost_distribution.quartiles.q3, 'USD', selectedCurrency), 
                      selectedCurrency
                    )}
                  </span>
                </div>
              </div>
            </div>
            
            {costAnalysis.budget_analysis && userProfile?.budget_max && (
              <div className="budget-utilization">
                <h4>Budget Utilization</h4>
                <div className="utilization-stats">
                  <div className="utilization-item">
                    <span className="utilization-label">Average utilization:</span>
                    <span className="utilization-value">
                      {costAnalysis.budget_analysis.budget_utilization.average.toFixed(1)}%
                    </span>
                  </div>
                  <div className="utilization-item">
                    <span className="utilization-label">Range:</span>
                    <span className="utilization-value">
                      {costAnalysis.budget_analysis.budget_utilization.range.min.toFixed(1)}% - 
                      {costAnalysis.budget_analysis.budget_utilization.range.max.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="chart-controls">
        <h3>Cost Visualization</h3>
        <div className="chart-type-selector">
          <label>Chart Type:</label>
          <select 
            value={selectedChartType}
            onChange={(e) => setSelectedChartType(e.target.value)}
          >
            <option value="breakdown">Cost Breakdown</option>
            <option value="comparison">Total Cost Comparison</option>
            <option value="budget">Budget Analysis</option>
            <option value="trend">Cost vs Admission Trend</option>
          </select>
        </div>
      </div>

      <CostAnalysisChart
        recommendations={recommendations}
        userProfile={userProfile}
        chartType={selectedChartType}
        selectedUniversities={selectedUniversities}
      />
    </div>
  );

  const renderCalculatorTab = () => (
    <div className="calculator-tab">
      <div className="calculator-header">
        <h3>Detailed Cost Calculator</h3>
        <div className="university-selector">
          <label>Select University:</label>
          <select 
            value={selectedUniversityForCalculator || ''}
            onChange={(e) => setSelectedUniversityForCalculator(e.target.value || null)}
          >
            <option value="">Choose a university...</option>
            {recommendations.map(rec => (
              <option key={rec.university_id} value={rec.university_id}>
                {rec.university_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedUniversityForCalculator ? (
        <CostCalculator
          recommendation={recommendations.find(r => r.university_id == selectedUniversityForCalculator)}
          userProfile={userProfile}
          onCalculationUpdate={(results) => 
            handleCalculatorUpdate(selectedUniversityForCalculator, results)
          }
        />
      ) : (
        <div className="calculator-placeholder">
          <div className="placeholder-content">
            <div className="placeholder-icon">🧮</div>
            <h4>Select a University</h4>
            <p>Choose a university from the dropdown above to calculate detailed costs including inflation, scholarships, and personal expenses.</p>
          </div>
        </div>
      )}
    </div>
  );

  const renderTrendsTab = () => (
    <div className="trends-tab">
      <h3>Cost Trends & Projections</h3>
      
      <div className="trends-controls">
        <div className="control-group">
          <label>Select University for Detailed Trends:</label>
          <select 
            value={selectedUniversityForCalculator || ''}
            onChange={(e) => {
              const universityId = e.target.value;
              setSelectedUniversityForCalculator(universityId || null);
              if (universityId) {
                loadCostTrends(parseInt(universityId));
              }
            }}
          >
            <option value="">Choose a university...</option>
            {recommendations.map(rec => (
              <option key={rec.university_id} value={rec.university_id}>
                {rec.university_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedUniversityForCalculator && costTrends[selectedUniversityForCalculator] && (
        <div className="cost-trends-analysis">
          <div className="trends-summary">
            <h4>{costTrends[selectedUniversityForCalculator].university_name} - Cost Projections</h4>
            <div className="projection-stats">
              <div className="projection-stat">
                <span className="stat-label">Total Program Cost:</span>
                <span className="stat-value">
                  {costAnalysisService.formatCurrency(
                    costAnalysisService.convertCurrency(
                      costTrends[selectedUniversityForCalculator].total_program_cost, 
                      'USD', 
                      selectedCurrency
                    ), 
                    selectedCurrency
                  )}
                </span>
              </div>
              <div className="projection-stat">
                <span className="stat-label">Inflation Impact:</span>
                <span className="stat-value">
                  {costAnalysisService.formatCurrency(
                    costAnalysisService.convertCurrency(
                      costTrends[selectedUniversityForCalculator].inflation_impact, 
                      'USD', 
                      selectedCurrency
                    ), 
                    selectedCurrency
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="year-by-year-projections">
            <h4>Year-by-Year Cost Projections</h4>
            <div className="projections-table">
              <div className="table-header">
                <span>Year</span>
                <span>Annual Cost</span>
                <span>Cumulative Cost</span>
                <span>Inflation Impact</span>
              </div>
              {costTrends[selectedUniversityForCalculator].projections.map(projection => (
                <div key={projection.year} className="table-row">
                  <span>Year {projection.year}</span>
                  <span>
                    {costAnalysisService.formatCurrency(
                      costAnalysisService.convertCurrency(projection.annual_cost, 'USD', selectedCurrency), 
                      selectedCurrency
                    )}
                  </span>
                  <span>
                    {costAnalysisService.formatCurrency(
                      costAnalysisService.convertCurrency(projection.cumulative_cost, 'USD', selectedCurrency), 
                      selectedCurrency
                    )}
                  </span>
                  <span>{((projection.inflation_multiplier - 1) * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>

          {costTrends[selectedUniversityForCalculator].budget_analysis && 
           costTrends[selectedUniversityForCalculator].budget_analysis.length > 0 && (
            <div className="budget-trends">
              <h4>Budget Analysis Over Time</h4>
              <div className="budget-trends-grid">
                {costTrends[selectedUniversityForCalculator].budget_analysis.map(analysis => (
                  <div key={analysis.year} className={`budget-trend-item ${analysis.affordability_status}`}>
                    <div className="trend-year">Year {analysis.year}</div>
                    <div className="trend-status">{analysis.affordability_status.replace('_', ' ')}</div>
                    <div className="trend-utilization">{analysis.budget_utilization}% of budget</div>
                    {analysis.budget_gap > 0 && (
                      <div className="trend-gap">
                        Over by {costAnalysisService.formatCurrency(
                          costAnalysisService.convertCurrency(analysis.budget_gap, 'USD', selectedCurrency), 
                          selectedCurrency
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!selectedUniversityForCalculator && (
        <div className="trends-placeholder">
          <div className="placeholder-content">
            <div className="placeholder-icon">📈</div>
            <h4>Select a University</h4>
            <p>Choose a university from the dropdown above to see detailed cost trends and projections over time.</p>
          </div>
        </div>
      )}
    </div>
  );

  const renderComparisonTab = () => (
    <div className="comparison-tab">
      <h3>Cost Comparison Analysis</h3>
      
      <div className="comparison-charts">
        <div className="chart-section">
          <CostAnalysisChart
            recommendations={recommendations}
            userProfile={userProfile}
            chartType="breakdown"
            selectedUniversities={selectedUniversities}
          />
        </div>
        
        <div className="chart-section">
          <CostAnalysisChart
            recommendations={recommendations}
            userProfile={userProfile}
            chartType="comparison"
            selectedUniversities={selectedUniversities}
          />
        </div>
      </div>

      {userProfile?.budget_max && (
        <div className="budget-analysis">
          <h4>Budget Analysis</h4>
          <div className="budget-breakdown">
            <div className="budget-item">
              <span className="budget-label">Your Annual Budget:</span>
              <span className="budget-value">{formatCurrency(userProfile.budget_max)}</span>
            </div>
            <div className="budget-item">
              <span className="budget-label">Universities Within Budget:</span>
              <span className="budget-value">{statistics.affordable} of {statistics.total}</span>
            </div>
            <div className="budget-item">
              <span className="budget-label">Average Cost vs Budget:</span>
              <span className={`budget-value ${statistics.average <= userProfile.budget_max ? 'positive' : 'negative'}`}>
                {statistics.average <= userProfile.budget_max ? 'Under' : 'Over'} by {formatCurrency(Math.abs(statistics.average - userProfile.budget_max))}
              </span>
            </div>
          </div>
        </div>
      )}

      {costAnalysis && costAnalysis.universities && (
        <div className="detailed-comparison">
          <h4>Detailed University Comparison</h4>
          <div className="comparison-table">
            <div className="table-header">
              <span>University</span>
              <span>Total Cost</span>
              <span>Cost Percentile</span>
              <span>Affordability</span>
              <span>Budget Difference</span>
            </div>
            {costAnalysis.universities.map(uni => (
              <div key={uni.university_id} className="table-row">
                <span className="university-name">{uni.university_name}</span>
                <span>
                  {costAnalysisService.formatCurrency(
                    costAnalysisService.convertCurrency(uni.total_annual_cost, 'USD', selectedCurrency), 
                    selectedCurrency
                  )}
                </span>
                <span>{uni.cost_percentile}th percentile</span>
                <span className={`affordability-status ${uni.affordability_status}`}>
                  {uni.affordability_status.replace('_', ' ')}
                </span>
                <span className={uni.budget_difference > 0 ? 'over-budget' : 'within-budget'}>
                  {uni.budget_difference > 0 ? '+' : ''}
                  {costAnalysisService.formatCurrency(
                    costAnalysisService.convertCurrency(uni.budget_difference, 'USD', selectedCurrency), 
                    selectedCurrency
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="cost-visualization-dashboard">
        <div className="no-data">
          <div className="no-data-icon">💰</div>
          <h3>No Cost Data Available</h3>
          <p>Cost analysis will be available once you have university recommendations.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cost-visualization-dashboard">
      <div className="dashboard-header">
        <h2>Cost Analysis & Visualization</h2>
        <div className="dashboard-info">
          <span>{recommendations.length} universities analyzed</span>
          {selectedUniversities && (
            <span>{selectedUniversities.length} selected for comparison</span>
          )}
        </div>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'trends' ? 'active' : ''}`}
          onClick={() => setActiveTab('trends')}
        >
          📈 Trends
        </button>
        <button 
          className={`tab-btn ${activeTab === 'calculator' ? 'active' : ''}`}
          onClick={() => setActiveTab('calculator')}
        >
          🧮 Calculator
        </button>
        <button 
          className={`tab-btn ${activeTab === 'comparison' ? 'active' : ''}`}
          onClick={() => setActiveTab('comparison')}
        >
          📋 Comparison
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'trends' && renderTrendsTab()}
        {activeTab === 'calculator' && renderCalculatorTab()}
        {activeTab === 'comparison' && renderComparisonTab()}
      </div>
    </div>
  );
};

export default CostVisualizationDashboard;