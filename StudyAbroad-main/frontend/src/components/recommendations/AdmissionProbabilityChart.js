import React, { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line, Scatter } from 'react-chartjs-2';
import './AdmissionProbabilityChart.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AdmissionProbabilityChart = ({ 
  recommendations, 
  userProfile, 
  chartType = 'probability_bars',
  showConfidenceIntervals = true 
}) => {
  const chartRef = useRef();

  const getChartOptions = (type) => {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index',
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 20,
            font: {
              size: 12
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
          displayColors: true,
          callbacks: {
            label: function(context) {
              if (type === 'probability_bars' || type === 'confidence_bands') {
                return `${context.dataset.label}: ${(context.parsed.y * 100).toFixed(1)}%`;
              } else if (type === 'scatter_analysis') {
                return `${context.raw.university}: ${(context.parsed.y * 100).toFixed(1)}% probability`;
              } else if (type === 'profile_strength') {
                return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}`;
              }
              return `${context.dataset.label}: ${context.parsed.y}`;
            },
            afterLabel: function(context) {
              if (type === 'scatter_analysis') {
                return `Cost: $${context.raw.cost?.toLocaleString() || 'N/A'}`;
              }
              return '';
            }
          }
        }
      }
    };

    if (type === 'probability_bars' || type === 'confidence_bands') {
      return {
        ...baseOptions,
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              maxRotation: 45,
              font: {
                size: 11
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
                size: 11
              }
            }
          }
        }
      };
    } else if (type === 'scatter_analysis') {
      return {
        ...baseOptions,
        scales: {
          x: {
            type: 'linear',
            position: 'bottom',
            title: {
              display: true,
              text: 'Total Annual Cost (USD)',
              font: {
                size: 12,
                weight: 'bold'
              }
            },
            ticks: {
              callback: function(value) {
                return `$${(value / 1000).toFixed(0)}k`;
              }
            }
          },
          y: {
            beginAtZero: true,
            max: 1,
            title: {
              display: true,
              text: 'Admission Probability',
              font: {
                size: 12,
                weight: 'bold'
              }
            },
            ticks: {
              callback: function(value) {
                return `${(value * 100).toFixed(0)}%`;
              }
            }
          }
        }
      };
    } else if (type === 'profile_strength') {
      return {
        ...baseOptions,
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                size: 11
              }
            }
          },
          y: {
            beginAtZero: true,
            max: 5,
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            },
            ticks: {
              stepSize: 1,
              font: {
                size: 11
              }
            }
          }
        }
      };
    }

    return baseOptions;
  };

  const generateProbabilityBarsChart = () => {
    if (!recommendations.length) return null;

    const sortedRecs = [...recommendations]
      .sort((a, b) => (b.admission_probability || 0) - (a.admission_probability || 0))
      .slice(0, 10);

    const labels = sortedRecs.map(rec => 
      rec.university_name.length > 20 
        ? rec.university_name.substring(0, 20) + '...'
        : rec.university_name
    );

    const probabilities = sortedRecs.map(rec => rec.admission_probability || 0);
    
    // Generate confidence intervals (mock data based on confidence level)
    const confidenceIntervals = sortedRecs.map(rec => {
      const prob = rec.admission_probability || 0;
      const confidence = rec.confidence_level;
      let margin = 0.1; // default margin
      
      if (confidence === 'high') margin = 0.05;
      else if (confidence === 'medium') margin = 0.1;
      else if (confidence === 'low') margin = 0.15;
      
      return {
        lower: Math.max(0, prob - margin),
        upper: Math.min(1, prob + margin)
      };
    });

    const datasets = [
      {
        label: 'Admission Probability',
        data: probabilities,
        backgroundColor: probabilities.map(prob => {
          if (prob >= 0.7) return 'rgba(40, 167, 69, 0.8)';
          if (prob >= 0.4) return 'rgba(255, 193, 7, 0.8)';
          return 'rgba(220, 53, 69, 0.8)';
        }),
        borderColor: probabilities.map(prob => {
          if (prob >= 0.7) return 'rgba(40, 167, 69, 1)';
          if (prob >= 0.4) return 'rgba(255, 193, 7, 1)';
          return 'rgba(220, 53, 69, 1)';
        }),
        borderWidth: 2
      }
    ];

    if (showConfidenceIntervals) {
      datasets.push({
        label: 'Confidence Range (Upper)',
        data: confidenceIntervals.map(ci => ci.upper),
        type: 'line',
        borderColor: 'rgba(54, 162, 235, 0.6)',
        backgroundColor: 'rgba(54, 162, 235, 0.1)',
        borderWidth: 1,
        borderDash: [5, 5],
        pointRadius: 3,
        fill: '+1'
      });

      datasets.push({
        label: 'Confidence Range (Lower)',
        data: confidenceIntervals.map(ci => ci.lower),
        type: 'line',
        borderColor: 'rgba(54, 162, 235, 0.6)',
        backgroundColor: 'rgba(54, 162, 235, 0.1)',
        borderWidth: 1,
        borderDash: [5, 5],
        pointRadius: 3,
        fill: false
      });
    }

    const data = { labels, datasets };

    return <Bar ref={chartRef} data={data} options={getChartOptions('probability_bars')} />;
  };

  const generateScatterAnalysisChart = () => {
    if (!recommendations.length) return null;

    const scatterData = recommendations
      .filter(rec => rec.cost_breakdown?.total_annual_cost && rec.admission_probability)
      .map(rec => ({
        x: rec.cost_breakdown.total_annual_cost,
        y: rec.admission_probability,
        university: rec.university_name,
        cost: rec.cost_breakdown.total_annual_cost,
        ranking: rec.ranking
      }));

    const data = {
      datasets: [
        {
          label: 'Universities',
          data: scatterData,
          backgroundColor: scatterData.map(point => {
            if (point.y >= 0.7) return 'rgba(40, 167, 69, 0.7)';
            if (point.y >= 0.4) return 'rgba(255, 193, 7, 0.7)';
            return 'rgba(220, 53, 69, 0.7)';
          }),
          borderColor: scatterData.map(point => {
            if (point.y >= 0.7) return 'rgba(40, 167, 69, 1)';
            if (point.y >= 0.4) return 'rgba(255, 193, 7, 1)';
            return 'rgba(220, 53, 69, 1)';
          }),
          borderWidth: 2,
          pointRadius: 8,
          pointHoverRadius: 10
        }
      ]
    };

    // Add budget line if available
    if (userProfile?.budget_max) {
      data.datasets.push({
        label: 'Your Budget',
        data: [
          { x: userProfile.budget_max, y: 0 },
          { x: userProfile.budget_max, y: 1 }
        ],
        type: 'line',
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        borderWidth: 3,
        borderDash: [10, 5],
        pointRadius: 0,
        fill: false
      });
    }

    return <Scatter ref={chartRef} data={data} options={getChartOptions('scatter_analysis')} />;
  };

  const generateProfileStrengthChart = () => {
    if (!userProfile) return null;

    const profileMetrics = [
      { label: 'CGPA', value: userProfile.cgpa || 0, max: 4.0 },
      { label: 'GRE', value: (userProfile.gre_score || 0) / 80, max: 5 }, // Normalize to 5-point scale
      { label: 'IELTS', value: (userProfile.ielts_score || 0) / 2, max: 5 }, // Normalize to 5-point scale
      { label: 'TOEFL', value: (userProfile.toefl_score || 0) / 24, max: 5 }, // Normalize to 5-point scale
    ].filter(metric => metric.value > 0);

    if (!profileMetrics.length) return null;

    const labels = profileMetrics.map(m => m.label);
    const values = profileMetrics.map(m => Math.min(m.value, 5));
    const maxValues = profileMetrics.map(m => m.max);

    const data = {
      labels,
      datasets: [
        {
          label: 'Your Score',
          data: values,
          backgroundColor: 'rgba(54, 162, 235, 0.8)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2
        },
        {
          label: 'Maximum Score',
          data: maxValues,
          backgroundColor: 'rgba(201, 203, 207, 0.3)',
          borderColor: 'rgba(201, 203, 207, 1)',
          borderWidth: 1
        }
      ]
    };

    return <Bar ref={chartRef} data={data} options={getChartOptions('profile_strength')} />;
  };

  const generateConfidenceBandsChart = () => {
    if (!recommendations.length) return null;

    const sortedRecs = [...recommendations]
      .sort((a, b) => (a.cost_breakdown?.total_annual_cost || 0) - (b.cost_breakdown?.total_annual_cost || 0))
      .slice(0, 8);

    const labels = sortedRecs.map((rec, index) => `Option ${index + 1}`);
    const probabilities = sortedRecs.map(rec => rec.admission_probability || 0);
    
    // Generate confidence bands
    const upperBand = sortedRecs.map(rec => {
      const prob = rec.admission_probability || 0;
      const confidence = rec.confidence_level;
      let margin = 0.1;
      
      if (confidence === 'high') margin = 0.05;
      else if (confidence === 'medium') margin = 0.1;
      else if (confidence === 'low') margin = 0.15;
      
      return Math.min(1, prob + margin);
    });

    const lowerBand = sortedRecs.map(rec => {
      const prob = rec.admission_probability || 0;
      const confidence = rec.confidence_level;
      let margin = 0.1;
      
      if (confidence === 'high') margin = 0.05;
      else if (confidence === 'medium') margin = 0.1;
      else if (confidence === 'low') margin = 0.15;
      
      return Math.max(0, prob - margin);
    });

    const data = {
      labels,
      datasets: [
        {
          label: 'Upper Confidence',
          data: upperBand,
          borderColor: 'rgba(54, 162, 235, 0.6)',
          backgroundColor: 'rgba(54, 162, 235, 0.1)',
          fill: '+1',
          tension: 0.4
        },
        {
          label: 'Admission Probability',
          data: probabilities,
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderWidth: 3,
          tension: 0.4,
          pointRadius: 6,
          pointHoverRadius: 8
        },
        {
          label: 'Lower Confidence',
          data: lowerBand,
          borderColor: 'rgba(54, 162, 235, 0.6)',
          backgroundColor: 'rgba(54, 162, 235, 0.1)',
          fill: false,
          tension: 0.4
        }
      ]
    };

    return <Line ref={chartRef} data={data} options={getChartOptions('confidence_bands')} />;
  };

  const renderChart = () => {
    switch (chartType) {
      case 'probability_bars':
        return generateProbabilityBarsChart();
      case 'scatter_analysis':
        return generateScatterAnalysisChart();
      case 'profile_strength':
        return generateProfileStrengthChart();
      case 'confidence_bands':
        return generateConfidenceBandsChart();
      default:
        return generateProbabilityBarsChart();
    }
  };

  const getChartTitle = () => {
    switch (chartType) {
      case 'probability_bars':
        return 'Admission Probability by University';
      case 'scatter_analysis':
        return 'Cost vs Admission Probability Analysis';
      case 'profile_strength':
        return 'Your Academic Profile Strength';
      case 'confidence_bands':
        return 'Admission Probability with Confidence Intervals';
      default:
        return 'Admission Probability Analysis';
    }
  };

  if (!recommendations.length && chartType !== 'profile_strength') {
    return (
      <div className="admission-probability-chart">
        <div className="chart-header">
          <h3>{getChartTitle()}</h3>
        </div>
        <div className="no-data">
          <p>No admission probability data available</p>
        </div>
      </div>
    );
  }

  if (chartType === 'profile_strength' && !userProfile) {
    return (
      <div className="admission-probability-chart">
        <div className="chart-header">
          <h3>{getChartTitle()}</h3>
        </div>
        <div className="no-data">
          <p>Profile data not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admission-probability-chart">
      <div className="chart-header">
        <h3>{getChartTitle()}</h3>
        {chartType === 'scatter_analysis' && (
          <div className="chart-legend">
            <div className="legend-item">
              <div className="legend-color high"></div>
              <span>High Probability (70%+)</span>
            </div>
            <div className="legend-item">
              <div className="legend-color medium"></div>
              <span>Medium Probability (40-70%)</span>
            </div>
            <div className="legend-item">
              <div className="legend-color low"></div>
              <span>Low Probability (&lt;40%)</span>
            </div>
          </div>
        )}
      </div>
      <div className="chart-container">
        {renderChart()}
      </div>
    </div>
  );
};

export default AdmissionProbabilityChart;