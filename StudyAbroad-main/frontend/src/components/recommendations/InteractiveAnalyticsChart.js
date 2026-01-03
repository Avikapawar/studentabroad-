import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  InteractionItem,
} from 'chart.js';
import { Bar, Line, Radar, Scatter, Doughnut } from 'react-chartjs-2';
import './InteractiveAnalyticsChart.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const InteractiveAnalyticsChart = ({ 
  recommendations, 
  userProfile, 
  chartType = 'admission_probability_with_confidence',
  selectedUniversities = null,
  onUniversityClick = null,
  onDrillDown = null,
  showInteractiveTooltips = true,
  enableDrillDown = true
}) => {
  const chartRef = useRef();
  const [hoveredDataPoint, setHoveredDataPoint] = useState(null);
  const [selectedDataPoint, setSelectedDataPoint] = useState(null);
  const [drillDownData, setDrillDownData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filter data based on selected universities
  const dataToUse = selectedUniversities 
    ? recommendations.filter(rec => selectedUniversities.includes(rec.university_id))
    : recommendations;

  // Enhanced color palette for better accessibility
  const colorPalette = {
    primary: 'rgba(54, 162, 235, 0.8)',
    primaryBorder: 'rgba(54, 162, 235, 1)',
    success: 'rgba(40, 167, 69, 0.8)',
    successBorder: 'rgba(40, 167, 69, 1)',
    warning: 'rgba(255, 193, 7, 0.8)',
    warningBorder: 'rgba(255, 193, 7, 1)',
    danger: 'rgba(220, 53, 69, 0.8)',
    dangerBorder: 'rgba(220, 53, 69, 1)',
    info: 'rgba(23, 162, 184, 0.8)',
    infoBorder: 'rgba(23, 162, 184, 1)',
    secondary: 'rgba(108, 117, 125, 0.8)',
    secondaryBorder: 'rgba(108, 117, 125, 1)'
  };

  // Enhanced responsive options
  const getResponsiveOptions = (type) => {
    const isMobile = window.innerWidth <= 768;
    const isTablet = window.innerWidth <= 1024;

    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index',
      },
      animation: {
        duration: 750,
        easing: 'easeInOutQuart'
      },
      plugins: {
        legend: {
          position: isMobile ? 'bottom' : 'top',
          labels: {
            usePointStyle: true,
            padding: isMobile ? 15 : 20,
            font: {
              size: isMobile ? 10 : 12
            },
            boxWidth: isMobile ? 12 : 15,
            boxHeight: isMobile ? 12 : 15
          }
        },
        tooltip: {
          enabled: showInteractiveTooltips,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          titleColor: 'white',
          bodyColor: 'white',
          borderColor: 'rgba(255, 255, 255, 0.3)',
          borderWidth: 1,
          cornerRadius: 8,
          displayColors: true,
          titleFont: {
            size: isMobile ? 12 : 14,
            weight: 'bold'
          },
          bodyFont: {
            size: isMobile ? 11 : 13
          },
          padding: isMobile ? 8 : 12,
          callbacks: {
            title: function(context) {
              if (type === 'admission_probability_with_confidence') {
                return context[0].label;
              }
              return context[0].label;
            },
            label: function(context) {
              return getTooltipLabel(context, type);
            },
            afterLabel: function(context) {
              return getTooltipAfterLabel(context, type);
            },
            footer: function(context) {
              if (enableDrillDown) {
                return 'Click for detailed analysis';
              }
              return '';
            }
          }
        }
      },
      onClick: (event, elements) => {
        if (elements.length > 0 && enableDrillDown) {
          handleChartClick(event, elements);
        }
      },
      onHover: (event, elements) => {
        if (elements.length > 0) {
          setHoveredDataPoint(elements[0]);
          event.native.target.style.cursor = enableDrillDown ? 'pointer' : 'default';
        } else {
          setHoveredDataPoint(null);
          event.native.target.style.cursor = 'default';
        }
      }
    };

    // Chart-specific options
    if (type === 'admission_probability_with_confidence') {
      return {
        ...baseOptions,
        scales: {
          x: {
            grid: {
              display: !isMobile,
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              maxRotation: isMobile ? 90 : 45,
              font: {
                size: isMobile ? 9 : 11
              }
            }
          },
          y: {
            beginAtZero: true,
            max: 1,
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            },
            ticks: {
              callback: function(value) {
                return `${(value * 100).toFixed(0)}%`;
              },
              font: {
                size: isMobile ? 9 : 11
              }
            },
            title: {
              display: !isMobile,
              text: 'Admission Probability',
              font: {
                size: 12,
                weight: 'bold'
              }
            }
          }
        }
      };
    } else if (type === 'multi_university_comparison') {
      return {
        ...baseOptions,
        scales: {
          r: {
            beginAtZero: true,
            max: 1,
            ticks: {
              stepSize: 0.2,
              callback: function(value) {
                return `${(value * 100).toFixed(0)}%`;
              },
              font: {
                size: isMobile ? 8 : 10
              }
            },
            pointLabels: {
              font: {
                size: isMobile ? 9 : 11
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          }
        }
      };
    } else if (type === 'profile_strength_analysis') {
      return {
        ...baseOptions,
        indexAxis: isTablet ? 'y' : 'x',
        scales: {
          x: {
            beginAtZero: true,
            max: 5,
            grid: {
              display: !isMobile
            },
            ticks: {
              stepSize: 1,
              font: {
                size: isMobile ? 9 : 11
              }
            },
            title: {
              display: !isMobile,
              text: 'Score (1-5 scale)',
              font: {
                size: 12,
                weight: 'bold'
              }
            }
          },
          y: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                size: isMobile ? 9 : 11
              }
            }
          }
        }
      };
    }

    return baseOptions;
  };

  // Enhanced tooltip functions
  const getTooltipLabel = (context, type) => {
    switch (type) {
      case 'admission_probability_with_confidence':
        if (context.dataset.label.includes('Confidence')) {
          return `${context.dataset.label}: ${(context.parsed.y * 100).toFixed(1)}%`;
        }
        return `${context.dataset.label}: ${(context.parsed.y * 100).toFixed(1)}%`;
      case 'multi_university_comparison':
        return `${context.dataset.label}: ${(context.parsed.y * 100).toFixed(1)}%`;
      case 'profile_strength_analysis':
        return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}/5.0`;
      default:
        return `${context.dataset.label}: ${context.parsed.y}`;
    }
  };

  const getTooltipAfterLabel = (context, type) => {
    if (type === 'admission_probability_with_confidence') {
      const universityIndex = context.dataIndex;
      const university = dataToUse[universityIndex];
      if (university) {
        const lines = [];
        if (university.cost_breakdown?.total_annual_cost) {
          lines.push(`Cost: ${formatCurrency(university.cost_breakdown.total_annual_cost)}`);
        }
        if (university.ranking) {
          lines.push(`Ranking: #${university.ranking}`);
        }
        if (university.confidence_level) {
          lines.push(`Confidence: ${university.confidence_level}`);
        }
        return lines;
      }
    }
    return [];
  };

  // Chart click handler for drill-down functionality
  const handleChartClick = useCallback((event, elements) => {
    if (elements.length > 0) {
      const element = elements[0];
      const dataIndex = element.index;
      const university = dataToUse[dataIndex];
      
      if (university) {
        setSelectedDataPoint(element);
        
        // Generate drill-down data
        const drillDown = {
          university: university,
          detailedMetrics: {
            admissionProbability: university.admission_probability || 0,
            overallScore: university.overall_score || 0,
            costFit: calculateCostFit(university),
            requirementsMatch: calculateRequirementsMatch(university),
            rankingScore: calculateRankingScore(university)
          },
          recommendations: generateRecommendations(university)
        };
        
        setDrillDownData(drillDown);
        
        // Call parent callback if provided
        if (onDrillDown) {
          onDrillDown(drillDown);
        }
        
        if (onUniversityClick) {
          onUniversityClick(university);
        }
      }
    }
  }, [dataToUse, onDrillDown, onUniversityClick]);

  // Helper functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const calculateCostFit = (university) => {
    if (!userProfile?.budget_max || !university.cost_breakdown?.total_annual_cost) {
      return 0.5;
    }
    const costRatio = university.cost_breakdown.total_annual_cost / userProfile.budget_max;
    return Math.max(0, Math.min(1, 2 - costRatio));
  };

  const calculateRequirementsMatch = (university) => {
    // Mock calculation based on available data
    let score = 0;
    let factors = 0;

    if (userProfile?.cgpa && university.min_cgpa) {
      score += userProfile.cgpa >= university.min_cgpa ? 1 : 0.5;
      factors++;
    }
    if (userProfile?.gre_score && university.min_gre) {
      score += userProfile.gre_score >= university.min_gre ? 1 : 0.5;
      factors++;
    }
    if (userProfile?.ielts_score && university.min_ielts) {
      score += userProfile.ielts_score >= university.min_ielts ? 1 : 0.5;
      factors++;
    }

    return factors > 0 ? score / factors : 0.5;
  };

  const calculateRankingScore = (university) => {
    if (!university.ranking) return 0.5;
    return Math.max(0, 1 - (university.ranking / 500));
  };

  const generateRecommendations = (university) => {
    const recommendations = [];
    
    if (university.admission_probability >= 0.7) {
      recommendations.push("Strong candidate - consider applying early");
    } else if (university.admission_probability >= 0.4) {
      recommendations.push("Good fit - strengthen your application");
    } else {
      recommendations.push("Reach school - consider as stretch option");
    }

    if (userProfile?.budget_max && university.cost_breakdown?.total_annual_cost) {
      if (university.cost_breakdown.total_annual_cost <= userProfile.budget_max) {
        recommendations.push("Within your budget range");
      } else {
        recommendations.push("Consider financial aid options");
      }
    }

    return recommendations;
  };

  // Chart generation functions
  const generateAdmissionProbabilityWithConfidence = () => {
    if (!dataToUse.length) return null;

    const sortedData = [...dataToUse]
      .sort((a, b) => (b.admission_probability || 0) - (a.admission_probability || 0))
      .slice(0, 10);

    const labels = sortedData.map(rec => 
      rec.university_name.length > 15 
        ? rec.university_name.substring(0, 15) + '...'
        : rec.university_name
    );

    const probabilities = sortedData.map(rec => rec.admission_probability || 0);
    
    // Enhanced confidence intervals with different levels
    const confidenceIntervals = sortedData.map(rec => {
      const prob = rec.admission_probability || 0;
      const confidence = rec.confidence_level || 'medium';
      let margin = 0.1;
      
      switch (confidence) {
        case 'high': margin = 0.05; break;
        case 'medium': margin = 0.1; break;
        case 'low': margin = 0.15; break;
        default: margin = 0.1;
      }
      
      return {
        lower: Math.max(0, prob - margin),
        upper: Math.min(1, prob + margin),
        confidence: confidence
      };
    });

    const datasets = [
      {
        label: 'Admission Probability',
        data: probabilities,
        backgroundColor: probabilities.map(prob => {
          if (prob >= 0.7) return colorPalette.success;
          if (prob >= 0.4) return colorPalette.warning;
          return colorPalette.danger;
        }),
        borderColor: probabilities.map(prob => {
          if (prob >= 0.7) return colorPalette.successBorder;
          if (prob >= 0.4) return colorPalette.warningBorder;
          return colorPalette.dangerBorder;
        }),
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      },
      {
        label: 'Upper Confidence Bound',
        data: confidenceIntervals.map(ci => ci.upper),
        type: 'line',
        borderColor: colorPalette.infoBorder,
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: false,
        tension: 0.4
      },
      {
        label: 'Lower Confidence Bound',
        data: confidenceIntervals.map(ci => ci.lower),
        type: 'line',
        borderColor: colorPalette.infoBorder,
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: false,
        tension: 0.4
      }
    ];

    return {
      labels,
      datasets
    };
  };

  const generateMultiUniversityComparison = () => {
    if (!dataToUse.length) return null;

    const universitiesToCompare = dataToUse.slice(0, 5);
    const metrics = [
      'Admission Probability',
      'Overall Score',
      'Cost Fit',
      'Ranking Score',
      'Requirements Match'
    ];

    const datasets = universitiesToCompare.map((rec, index) => {
      const colors = [
        colorPalette.primary,
        colorPalette.success,
        colorPalette.warning,
        colorPalette.danger,
        colorPalette.info
      ];
      const borderColors = [
        colorPalette.primaryBorder,
        colorPalette.successBorder,
        colorPalette.warningBorder,
        colorPalette.dangerBorder,
        colorPalette.infoBorder
      ];

      const data = [
        rec.admission_probability || 0,
        rec.overall_score || 0,
        calculateCostFit(rec),
        calculateRankingScore(rec),
        calculateRequirementsMatch(rec)
      ];

      return {
        label: rec.university_name.length > 12 
          ? rec.university_name.substring(0, 12) + '...'
          : rec.university_name,
        data,
        backgroundColor: colors[index % colors.length],
        borderColor: borderColors[index % borderColors.length],
        borderWidth: 2,
        pointBackgroundColor: borderColors[index % borderColors.length],
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: borderColors[index % borderColors.length],
        pointRadius: 4,
        pointHoverRadius: 6
      };
    });

    return {
      labels: metrics,
      datasets
    };
  };

  const generateProfileStrengthAnalysis = () => {
    if (!userProfile) return null;

    const profileMetrics = [];
    
    if (userProfile.cgpa) {
      profileMetrics.push({
        label: 'CGPA',
        value: (userProfile.cgpa / 4.0) * 5, // Normalize to 5-point scale
        max: 5,
        raw: userProfile.cgpa,
        unit: '/4.0'
      });
    }
    
    if (userProfile.gre_score) {
      profileMetrics.push({
        label: 'GRE',
        value: (userProfile.gre_score / 340) * 5, // Normalize to 5-point scale
        max: 5,
        raw: userProfile.gre_score,
        unit: '/340'
      });
    }
    
    if (userProfile.ielts_score) {
      profileMetrics.push({
        label: 'IELTS',
        value: (userProfile.ielts_score / 9) * 5, // Normalize to 5-point scale
        max: 5,
        raw: userProfile.ielts_score,
        unit: '/9.0'
      });
    }
    
    if (userProfile.toefl_score) {
      profileMetrics.push({
        label: 'TOEFL',
        value: (userProfile.toefl_score / 120) * 5, // Normalize to 5-point scale
        max: 5,
        raw: userProfile.toefl_score,
        unit: '/120'
      });
    }

    if (!profileMetrics.length) return null;

    const labels = profileMetrics.map(m => m.label);
    const values = profileMetrics.map(m => Math.min(m.value, 5));
    const maxValues = profileMetrics.map(m => m.max);

    const datasets = [
      {
        label: 'Your Score',
        data: values,
        backgroundColor: colorPalette.primary,
        borderColor: colorPalette.primaryBorder,
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      },
      {
        label: 'Maximum Possible',
        data: maxValues,
        backgroundColor: colorPalette.secondary,
        borderColor: colorPalette.secondaryBorder,
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      }
    ];

    return {
      labels,
      datasets,
      profileMetrics // Include raw data for tooltips
    };
  };

  // Main render function
  const renderChart = () => {
    let chartData;
    let ChartComponent;

    switch (chartType) {
      case 'admission_probability_with_confidence':
        chartData = generateAdmissionProbabilityWithConfidence();
        ChartComponent = Bar;
        break;
      case 'multi_university_comparison':
        chartData = generateMultiUniversityComparison();
        ChartComponent = Radar;
        break;
      case 'profile_strength_analysis':
        chartData = generateProfileStrengthAnalysis();
        ChartComponent = Bar;
        break;
      default:
        chartData = generateAdmissionProbabilityWithConfidence();
        ChartComponent = Bar;
    }

    if (!chartData) return null;

    return (
      <ChartComponent
        ref={chartRef}
        data={chartData}
        options={getResponsiveOptions(chartType)}
      />
    );
  };

  const getChartTitle = () => {
    switch (chartType) {
      case 'admission_probability_with_confidence':
        return 'Admission Probability with Confidence Intervals';
      case 'multi_university_comparison':
        return 'Multi-Dimensional University Comparison';
      case 'profile_strength_analysis':
        return 'Your Academic Profile Strength Analysis';
      default:
        return 'Interactive Analytics Chart';
    }
  };

  const getChartDescription = () => {
    switch (chartType) {
      case 'admission_probability_with_confidence':
        return 'Click on any university bar to see detailed analysis and recommendations';
      case 'multi_university_comparison':
        return 'Compare universities across multiple metrics - larger areas indicate better overall fit';
      case 'profile_strength_analysis':
        return 'Your academic credentials normalized to a 5-point scale for easy comparison';
      default:
        return 'Interactive chart with drill-down capabilities';
    }
  };

  if (!dataToUse.length && chartType !== 'profile_strength_analysis') {
    return (
      <div className="interactive-analytics-chart">
        <div className="chart-header">
          <div className="chart-title-section">
            <h3>{getChartTitle()}</h3>
            <p className="chart-description">{getChartDescription()}</p>
          </div>
        </div>
        <div className="no-data">
          <div className="no-data-icon">📊</div>
          <p>No data available for visualization</p>
        </div>
      </div>
    );
  }

  if (chartType === 'profile_strength_analysis' && !userProfile) {
    return (
      <div className="interactive-analytics-chart">
        <div className="chart-header">
          <div className="chart-title-section">
            <h3>{getChartTitle()}</h3>
            <p className="chart-description">{getChartDescription()}</p>
          </div>
        </div>
        <div className="no-data">
          <div className="no-data-icon">👤</div>
          <p>Complete your profile to see strength analysis</p>
        </div>
      </div>
    );
  }

  return (
    <div className="interactive-analytics-chart">
      <div className="chart-header">
        <div className="chart-title-section">
          <h3>{getChartTitle()}</h3>
          <p className="chart-description">{getChartDescription()}</p>
        </div>
        <div className="chart-controls">
          {enableDrillDown && (
            <div className="control-indicator">
              <span className="interactive-icon">🔍</span>
              <span className="control-text">Click to explore</span>
            </div>
          )}
        </div>
      </div>

      <div className="chart-container">
        {isLoading ? (
          <div className="chart-loading">
            <div className="loading-spinner"></div>
            <p>Loading chart data...</p>
          </div>
        ) : (
          renderChart()
        )}
      </div>

      {drillDownData && (
        <div className="drill-down-panel">
          <div className="drill-down-header">
            <h4>📊 Detailed Analysis: {drillDownData.university.university_name}</h4>
            <button 
              className="close-drill-down"
              onClick={() => setDrillDownData(null)}
              aria-label="Close detailed analysis"
            >
              ✕
            </button>
          </div>
          <div className="drill-down-content">
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-value">
                  {(drillDownData.detailedMetrics.admissionProbability * 100).toFixed(1)}%
                </div>
                <div className="metric-label">Admission Probability</div>
              </div>
              <div className="metric-card">
                <div className="metric-value">
                  {(drillDownData.detailedMetrics.overallScore * 100).toFixed(0)}%
                </div>
                <div className="metric-label">Overall Match</div>
              </div>
              <div className="metric-card">
                <div className="metric-value">
                  {(drillDownData.detailedMetrics.costFit * 100).toFixed(0)}%
                </div>
                <div className="metric-label">Cost Fit</div>
              </div>
              <div className="metric-card">
                <div className="metric-value">
                  {(drillDownData.detailedMetrics.requirementsMatch * 100).toFixed(0)}%
                </div>
                <div className="metric-label">Requirements Match</div>
              </div>
            </div>
            <div className="recommendations-section">
              <h5>💡 Recommendations</h5>
              <ul className="recommendations-list">
                {drillDownData.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {hoveredDataPoint && showInteractiveTooltips && (
        <div className="hover-info">
          <div className="hover-indicator">
            Hover over data points for detailed information
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveAnalyticsChart;