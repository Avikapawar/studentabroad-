import React, { useState } from 'react';
import AdmissionProbabilityChart from './AdmissionProbabilityChart';
import ComparisonAnalyticsChart from './ComparisonAnalyticsChart';
import EnhancedVisualizationDashboard from './EnhancedVisualizationDashboard';
import InteractiveAnalyticsChart from './InteractiveAnalyticsChart';
import './InteractiveVisualizationDashboard.css';

const InteractiveVisualizationDashboard = ({ 
  recommendations, 
  userProfile, 
  selectedUniversities = null 
}) => {
  const [activeSection, setActiveSection] = useState('enhanced');
  const [admissionChartType, setAdmissionChartType] = useState('probability_bars');
  const [comparisonChartType, setComparisonChartType] = useState('radar_comparison');
  const [showConfidenceIntervals, setShowConfidenceIntervals] = useState(true);
  const [maxUniversitiesForComparison, setMaxUniversitiesForComparison] = useState(5);

  const getVisualizationStats = () => {
    if (!recommendations.length) return {};

    const highProbability = recommendations.filter(rec => (rec.admission_probability || 0) >= 0.7).length;
    const mediumProbability = recommendations.filter(rec => {
      const prob = rec.admission_probability || 0;
      return prob >= 0.4 && prob < 0.7;
    }).length;
    const lowProbability = recommendations.filter(rec => (rec.admission_probability || 0) < 0.4).length;

    const avgProbability = recommendations.reduce((sum, rec) => sum + (rec.admission_probability || 0), 0) / recommendations.length;
    const avgScore = recommendations.reduce((sum, rec) => sum + (rec.overall_score || 0), 0) / recommendations.length;

    return {
      total: recommendations.length,
      highProbability,
      mediumProbability,
      lowProbability,
      avgProbability,
      avgScore
    };
  };

  const stats = getVisualizationStats();

  const renderAdmissionSection = () => (
    <div className="visualization-section">
      <div className="section-header">
        <div className="section-title">
          <h3>Admission Probability Analysis</h3>
          <p>Analyze your chances of admission across different universities</p>
        </div>
        <div className="section-controls">
          <div className="control-group">
            <label>Chart Type:</label>
            <select 
              value={admissionChartType}
              onChange={(e) => setAdmissionChartType(e.target.value)}
            >
              <option value="probability_bars">Probability Bars</option>
              <option value="scatter_analysis">Cost vs Probability</option>
              <option value="confidence_bands">Confidence Bands</option>
              <option value="profile_strength">Profile Strength</option>
            </select>
          </div>
          {(admissionChartType === 'probability_bars' || admissionChartType === 'confidence_bands') && (
            <div className="control-group">
              <label>
                <input
                  type="checkbox"
                  checked={showConfidenceIntervals}
                  onChange={(e) => setShowConfidenceIntervals(e.target.checked)}
                />
                Show Confidence Intervals
              </label>
            </div>
          )}
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-wrapper">
          <AdmissionProbabilityChart
            recommendations={recommendations}
            userProfile={userProfile}
            chartType={admissionChartType}
            showConfidenceIntervals={showConfidenceIntervals}
          />
        </div>
      </div>

      <div className="insights-panel">
        <h4>Key Insights</h4>
        <div className="insights-grid">
          <div className="insight-card">
            <div className="insight-value">{stats.highProbability}</div>
            <div className="insight-label">High Probability (70%+)</div>
            <div className="insight-description">Universities where you have strong admission chances</div>
          </div>
          <div className="insight-card">
            <div className="insight-value">{stats.mediumProbability}</div>
            <div className="insight-label">Medium Probability (40-70%)</div>
            <div className="insight-description">Universities with moderate admission chances</div>
          </div>
          <div className="insight-card">
            <div className="insight-value">{stats.lowProbability}</div>
            <div className="insight-label">Low Probability (&lt;40%)</div>
            <div className="insight-description">Reach universities with lower admission chances</div>
          </div>
          <div className="insight-card">
            <div className="insight-value">{(stats.avgProbability * 100).toFixed(1)}%</div>
            <div className="insight-label">Average Probability</div>
            <div className="insight-description">Your overall average admission probability</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderComparisonSection = () => (
    <div className="visualization-section">
      <div className="section-header">
        <div className="section-title">
          <h3>Comparative Analysis</h3>
          <p>Compare universities across multiple dimensions and metrics</p>
        </div>
        <div className="section-controls">
          <div className="control-group">
            <label>Chart Type:</label>
            <select 
              value={comparisonChartType}
              onChange={(e) => setComparisonChartType(e.target.value)}
            >
              <option value="radar_comparison">Multi-Metric Radar</option>
              <option value="metrics_comparison">Metrics Comparison</option>
              <option value="ranking_distribution">Rankings Distribution</option>
              <option value="cost_distribution">Cost Distribution</option>
            </select>
          </div>
          <div className="control-group">
            <label>Max Universities:</label>
            <select 
              value={maxUniversitiesForComparison}
              onChange={(e) => setMaxUniversitiesForComparison(parseInt(e.target.value))}
            >
              <option value={3}>3 Universities</option>
              <option value={5}>5 Universities</option>
              <option value={8}>8 Universities</option>
              <option value={10}>10 Universities</option>
            </select>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-wrapper">
          <ComparisonAnalyticsChart
            recommendations={recommendations}
            userProfile={userProfile}
            selectedUniversities={selectedUniversities}
            chartType={comparisonChartType}
            maxUniversities={maxUniversitiesForComparison}
          />
        </div>
      </div>

      <div className="comparison-tips">
        <h4>Comparison Tips</h4>
        <div className="tips-grid">
          <div className="tip-card">
            <div className="tip-icon">🎯</div>
            <div className="tip-content">
              <strong>Radar Chart:</strong> Best for comparing multiple metrics simultaneously. Look for universities with larger, more balanced shapes.
            </div>
          </div>
          <div className="tip-card">
            <div className="tip-icon">📊</div>
            <div className="tip-content">
              <strong>Bar Charts:</strong> Ideal for direct metric comparisons. Longer bars indicate better performance in that metric.
            </div>
          </div>
          <div className="tip-card">
            <div className="tip-icon">🏆</div>
            <div className="tip-content">
              <strong>Rankings:</strong> Lower numbers are better. Consider both ranking and your admission probability.
            </div>
          </div>
          <div className="tip-card">
            <div className="tip-icon">💰</div>
            <div className="tip-content">
              <strong>Costs:</strong> Green indicates within budget, red indicates over budget. Balance cost with other factors.
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEnhancedSection = () => (
    <div className="visualization-section">
      <EnhancedVisualizationDashboard
        recommendations={recommendations}
        userProfile={userProfile}
        selectedUniversities={selectedUniversities}
      />
    </div>
  );

  const renderOverviewSection = () => (
    <div className="visualization-section">
      <div className="section-header">
        <div className="section-title">
          <h3>Visualization Overview</h3>
          <p>Interactive charts and analytics for your university recommendations</p>
        </div>
      </div>

      <div className="overview-stats">
        <div className="stats-row">
          <div className="stat-card large">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Universities</div>
            <div className="stat-description">Universities in your recommendation list</div>
          </div>
          <div className="stat-card large">
            <div className="stat-value">{(stats.avgScore * 100).toFixed(0)}%</div>
            <div className="stat-label">Average Match Score</div>
            <div className="stat-description">Overall compatibility with your profile</div>
          </div>
          <div className="stat-card large">
            <div className="stat-value">{(stats.avgProbability * 100).toFixed(0)}%</div>
            <div className="stat-label">Average Admission Chance</div>
            <div className="stat-description">Your average probability of admission</div>
          </div>
        </div>
      </div>

      <div className="charts-preview">
        <div className="preview-grid">
          <div className="preview-chart">
            <InteractiveAnalyticsChart
              recommendations={recommendations.slice(0, 6)}
              userProfile={userProfile}
              chartType="admission_probability_with_confidence"
              enableDrillDown={false}
            />
          </div>
          <div className="preview-chart">
            <InteractiveAnalyticsChart
              recommendations={recommendations}
              userProfile={userProfile}
              selectedUniversities={selectedUniversities}
              chartType="multi_university_comparison"
              enableDrillDown={false}
            />
          </div>
        </div>
      </div>

      <div className="feature-highlights">
        <h4>Available Visualizations</h4>
        <div className="features-grid">
          <div className="feature-card" onClick={() => setActiveSection('enhanced')}>
            <div className="feature-icon">🚀</div>
            <div className="feature-title">Enhanced Interactive Charts</div>
            <div className="feature-description">
              Advanced interactive visualizations with drill-down capabilities and mobile optimization
            </div>
          </div>
          <div className="feature-card" onClick={() => setActiveSection('admission')}>
            <div className="feature-icon">📈</div>
            <div className="feature-title">Admission Analysis</div>
            <div className="feature-description">
              Probability charts, confidence intervals, and profile strength analysis
            </div>
          </div>
          <div className="feature-card" onClick={() => setActiveSection('comparison')}>
            <div className="feature-icon">⚖️</div>
            <div className="feature-title">Comparative Analytics</div>
            <div className="feature-description">
              Multi-dimensional comparisons, rankings, and cost distributions
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="interactive-visualization-dashboard">
        <div className="no-data-state">
          <div className="no-data-icon">📊</div>
          <h3>No Data for Visualization</h3>
          <p>Interactive charts and analytics will be available once you have university recommendations.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="interactive-visualization-dashboard">
      <div className="dashboard-header">
        <h2>Interactive Analytics Dashboard</h2>
        <div className="dashboard-nav">
          <button 
            className={`nav-btn ${activeSection === 'enhanced' ? 'active' : ''}`}
            onClick={() => setActiveSection('enhanced')}
          >
            🚀 Enhanced Interactive
          </button>
          <button 
            className={`nav-btn ${activeSection === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveSection('overview')}
          >
            📊 Overview
          </button>
          <button 
            className={`nav-btn ${activeSection === 'admission' ? 'active' : ''}`}
            onClick={() => setActiveSection('admission')}
          >
            📈 Admission Analysis
          </button>
          <button 
            className={`nav-btn ${activeSection === 'comparison' ? 'active' : ''}`}
            onClick={() => setActiveSection('comparison')}
          >
            ⚖️ Comparative Analytics
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        {activeSection === 'enhanced' && renderEnhancedSection()}
        {activeSection === 'overview' && renderOverviewSection()}
        {activeSection === 'admission' && renderAdmissionSection()}
        {activeSection === 'comparison' && renderComparisonSection()}
      </div>
    </div>
  );
};

export default InteractiveVisualizationDashboard;