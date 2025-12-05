import React, { useEffect, useRef } from 'react';
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
} from 'chart.js';
import { Radar, Bar, Doughnut, PolarArea } from 'react-chartjs-2';
import './ComparisonAnalyticsChart.css';

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

const ComparisonAnalyticsChart = ({ 
  recommendations, 
  userProfile, 
  selectedUniversities = null,
  chartType = 'radar_comparison',
  maxUniversities = 5 
}) => {
  const chartRef = useRef();

  // Filter and limit universities for comparison
  const universitiesToCompare = selectedUniversities 
    ? recommendations.filter(rec => selectedUniversities.includes(rec.university_id)).slice(0, maxUniversities)
    : recommendations.slice(0, maxUniversities);

  const colors = [
    'rgba(255, 99, 132, 0.8)',
    'rgba(54, 162, 235, 0.8)',
    'rgba(255, 205, 86, 0.8)',
    'rgba(75, 192, 192, 0.8)',
    'rgba(153, 102, 255, 0.8)',
    'rgba(255, 159, 64, 0.8)'
  ];

  const borderColors = [
    'rgba(255, 99, 132, 1)',
    'rgba(54, 162, 235, 1)',
    'rgba(255, 205, 86, 1)',
    'rgba(75, 192, 192, 1)',
    'rgba(153, 102, 255, 1)',
    'rgba(255, 159, 64, 1)'
  ];

  const getChartOptions = (type) => {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 15,
            font: {
              size: 11
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: 'white',
          bodyColor: 'white',
          borderColor: 'rgba(255, 255, 255, 0.2)',
          borderWidth: 1,
          cornerRadius: 6,
          displayColors: true
        }
      }
    };

    if (type === 'radar_comparison') {
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
                size: 10
              }
            },
            pointLabels: {
              font: {
                size: 11
              }
            }
          }
        }
      };
    } else if (type === 'metrics_comparison') {
      return {
        ...baseOptions,
        indexAxis: 'y',
        scales: {
          x: {
            beginAtZero: true,
            max: 1,
            ticks: {
              callback: function(value) {
                return `${(value * 100).toFixed(0)}%`;
              }
            }
          },
          y: {
            ticks: {
              font: {
                size: 10
              }
            }
          }
        }
      };
    } else if (type === 'ranking_distribution' || type === 'cost_distribution') {
      return {
        ...baseOptions,
        plugins: {
          ...baseOptions.plugins,
          tooltip: {
            ...baseOptions.plugins.tooltip,
            callbacks: {
              label: function(context) {
                if (type === 'cost_distribution') {
                  return `${context.label}: $${context.parsed.toLocaleString()}`;
                }
                return `${context.label}: Rank ${context.parsed}`;
              }
            }
          }
        }
      };
    }

    return baseOptions;
  };

  const generateRadarComparisonChart = () => {
    if (!universitiesToCompare.length) return null;

    const metrics = [
      'Admission Probability',
      'Overall Score',
      'Cost Fit',
      'Ranking Score',
      'Requirements Match'
    ];

    const datasets = universitiesToCompare.map((rec, index) => {
      // Normalize ranking to 0-1 scale (lower rank = higher score)
      const rankingScore = rec.ranking ? Math.max(0, 1 - (rec.ranking / 500)) : 0.5;
      
      // Calculate cost fit (lower cost relative to budget = higher score)
      let costFit = 0.5;
      if (userProfile?.budget_max && rec.cost_breakdown?.total_annual_cost) {
        const costRatio = rec.cost_breakdown.total_annual_cost / userProfile.budget_max;
        costFit = Math.max(0, Math.min(1, 2 - costRatio)); // Inverted scale
      }

      // Mock requirements match score based on available data
      const requirementsMatch = rec.admission_probability || 0.5;

      const data = [
        rec.admission_probability || 0,
        rec.overall_score || 0,
        costFit,
        rankingScore,
        requirementsMatch
      ];

      return {
        label: rec.university_name.length > 15 
          ? rec.university_name.substring(0, 15) + '...'
          : rec.university_name,
        data,
        backgroundColor: colors[index % colors.length],
        borderColor: borderColors[index % borderColors.length],
        borderWidth: 2,
        pointBackgroundColor: borderColors[index % borderColors.length],
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: borderColors[index % borderColors.length]
      };
    });

    const data = {
      labels: metrics,
      datasets
    };

    return <Radar ref={chartRef} data={data} options={getChartOptions('radar_comparison')} />;
  };

  const generateMetricsComparisonChart = () => {
    if (!universitiesToCompare.length) return null;

    const labels = universitiesToCompare.map(rec => 
      rec.university_name.length > 20 
        ? rec.university_name.substring(0, 20) + '...'
        : rec.university_name
    );

    const datasets = [
      {
        label: 'Admission Probability',
        data: universitiesToCompare.map(rec => rec.admission_probability || 0),
        backgroundColor: 'rgba(255, 99, 132, 0.8)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      },
      {
        label: 'Overall Score',
        data: universitiesToCompare.map(rec => rec.overall_score || 0),
        backgroundColor: 'rgba(54, 162, 235, 0.8)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }
    ];

    const data = { labels, datasets };

    return <Bar ref={chartRef} data={data} options={getChartOptions('metrics_comparison')} />;
  };

  const generateRankingDistributionChart = () => {
    if (!universitiesToCompare.length) return null;

    const rankingData = universitiesToCompare
      .filter(rec => rec.ranking)
      .map(rec => ({
        name: rec.university_name.length > 15 
          ? rec.university_name.substring(0, 15) + '...'
          : rec.university_name,
        ranking: rec.ranking
      }));

    if (!rankingData.length) return null;

    const data = {
      labels: rankingData.map(item => item.name),
      datasets: [
        {
          data: rankingData.map(item => item.ranking),
          backgroundColor: rankingData.map((_, index) => colors[index % colors.length]),
          borderColor: rankingData.map((_, index) => borderColors[index % borderColors.length]),
          borderWidth: 2
        }
      ]
    };

    return <PolarArea ref={chartRef} data={data} options={getChartOptions('ranking_distribution')} />;
  };

  const generateCostDistributionChart = () => {
    if (!universitiesToCompare.length) return null;

    const costData = universitiesToCompare
      .filter(rec => rec.cost_breakdown?.total_annual_cost)
      .map(rec => ({
        name: rec.university_name.length > 15 
          ? rec.university_name.substring(0, 15) + '...'
          : rec.university_name,
        cost: rec.cost_breakdown.total_annual_cost
      }));

    if (!costData.length) return null;

    const data = {
      labels: costData.map(item => item.name),
      datasets: [
        {
          data: costData.map(item => item.cost),
          backgroundColor: costData.map((item, index) => {
            if (userProfile?.budget_max) {
              return item.cost <= userProfile.budget_max 
                ? 'rgba(40, 167, 69, 0.8)' 
                : 'rgba(220, 53, 69, 0.8)';
            }
            return colors[index % colors.length];
          }),
          borderColor: costData.map((item, index) => {
            if (userProfile?.budget_max) {
              return item.cost <= userProfile.budget_max 
                ? 'rgba(40, 167, 69, 1)' 
                : 'rgba(220, 53, 69, 1)';
            }
            return borderColors[index % borderColors.length];
          }),
          borderWidth: 2
        }
      ]
    };

    return <Doughnut ref={chartRef} data={data} options={getChartOptions('cost_distribution')} />;
  };

  const renderChart = () => {
    switch (chartType) {
      case 'radar_comparison':
        return generateRadarComparisonChart();
      case 'metrics_comparison':
        return generateMetricsComparisonChart();
      case 'ranking_distribution':
        return generateRankingDistributionChart();
      case 'cost_distribution':
        return generateCostDistributionChart();
      default:
        return generateRadarComparisonChart();
    }
  };

  const getChartTitle = () => {
    switch (chartType) {
      case 'radar_comparison':
        return 'Multi-Metric University Comparison';
      case 'metrics_comparison':
        return 'Key Metrics Comparison';
      case 'ranking_distribution':
        return 'University Rankings Distribution';
      case 'cost_distribution':
        return 'Cost Distribution Analysis';
      default:
        return 'University Comparison';
    }
  };

  const getChartDescription = () => {
    switch (chartType) {
      case 'radar_comparison':
        return 'Compare universities across multiple dimensions on a normalized scale';
      case 'metrics_comparison':
        return 'Side-by-side comparison of admission probability and overall scores';
      case 'ranking_distribution':
        return 'Visual representation of university rankings';
      case 'cost_distribution':
        return 'Distribution of total annual costs across selected universities';
      default:
        return '';
    }
  };

  if (!universitiesToCompare.length) {
    return (
      <div className="comparison-analytics-chart">
        <div className="chart-header">
          <div className="chart-title-section">
            <h3>{getChartTitle()}</h3>
            <p className="chart-description">{getChartDescription()}</p>
          </div>
        </div>
        <div className="no-data">
          <p>No universities available for comparison</p>
        </div>
      </div>
    );
  }

  return (
    <div className="comparison-analytics-chart">
      <div className="chart-header">
        <div className="chart-title-section">
          <h3>{getChartTitle()}</h3>
          <p className="chart-description">{getChartDescription()}</p>
        </div>
        <div className="chart-info">
          <span className="universities-count">
            {universitiesToCompare.length} universities compared
          </span>
        </div>
      </div>
      <div className="chart-container">
        {renderChart()}
      </div>
      {chartType === 'radar_comparison' && (
        <div className="chart-notes">
          <div className="note-item">
            <strong>Note:</strong> All metrics are normalized to a 0-100% scale for comparison
          </div>
          <div className="metric-explanations">
            <div className="metric-explanation">
              <strong>Cost Fit:</strong> How well the cost aligns with your budget (higher = more affordable)
            </div>
            <div className="metric-explanation">
              <strong>Ranking Score:</strong> University ranking converted to score (higher = better ranking)
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparisonAnalyticsChart;