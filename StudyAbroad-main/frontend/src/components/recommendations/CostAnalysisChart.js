import React, { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import './CostAnalysisChart.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const CostAnalysisChart = ({ 
  recommendations, 
  userProfile, 
  chartType = 'breakdown',
  selectedUniversities = null 
}) => {
  const chartRef = useRef();

  // Filter recommendations if specific universities are selected
  const dataToUse = selectedUniversities 
    ? recommendations.filter(rec => selectedUniversities.includes(rec.university_id))
    : recommendations.slice(0, 8); // Limit to 8 for readability

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const getChartOptions = (type) => {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
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
              if (type === 'breakdown' || type === 'comparison') {
                return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
              } else if (type === 'budget') {
                return `${context.label}: ${formatCurrency(context.parsed)}`;
              }
              return `${context.label}: ${formatCurrency(context.parsed)}`;
            }
          }
        }
      }
    };

    if (type === 'breakdown' || type === 'comparison') {
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
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            },
            ticks: {
              callback: function(value) {
                return formatCurrency(value);
              },
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

  const generateBreakdownChart = () => {
    if (!dataToUse.length) return null;

    const labels = dataToUse.map(rec => 
      rec.university_name.length > 20 
        ? rec.university_name.substring(0, 20) + '...'
        : rec.university_name
    );

    const tuitionData = dataToUse.map(rec => rec.cost_breakdown?.tuition_fee || 0);
    const livingData = dataToUse.map(rec => rec.cost_breakdown?.living_cost || 0);
    const applicationData = dataToUse.map(rec => rec.cost_breakdown?.application_fee || 0);
    const otherData = dataToUse.map(rec => rec.cost_breakdown?.other_fees || 0);

    const data = {
      labels,
      datasets: [
        {
          label: 'Tuition Fee',
          data: tuitionData,
          backgroundColor: 'rgba(54, 162, 235, 0.8)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        },
        {
          label: 'Living Cost',
          data: livingData,
          backgroundColor: 'rgba(255, 99, 132, 0.8)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        },
        {
          label: 'Application Fee',
          data: applicationData,
          backgroundColor: 'rgba(255, 206, 86, 0.8)',
          borderColor: 'rgba(255, 206, 86, 1)',
          borderWidth: 1
        },
        {
          label: 'Other Fees',
          data: otherData,
          backgroundColor: 'rgba(75, 192, 192, 0.8)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }
      ]
    };

    return <Bar ref={chartRef} data={data} options={getChartOptions('breakdown')} />;
  };

  const generateComparisonChart = () => {
    if (!dataToUse.length) return null;

    const labels = dataToUse.map(rec => 
      rec.university_name.length > 15 
        ? rec.university_name.substring(0, 15) + '...'
        : rec.university_name
    );

    const totalCosts = dataToUse.map(rec => rec.cost_breakdown?.total_annual_cost || 0);
    const budgetLine = userProfile?.budget_max ? Array(labels.length).fill(userProfile.budget_max) : null;

    const datasets = [
      {
        label: 'Total Annual Cost',
        data: totalCosts,
        backgroundColor: totalCosts.map(cost => {
          if (userProfile?.budget_max) {
            return cost <= userProfile.budget_max 
              ? 'rgba(40, 167, 69, 0.8)' 
              : 'rgba(220, 53, 69, 0.8)';
          }
          return 'rgba(54, 162, 235, 0.8)';
        }),
        borderColor: totalCosts.map(cost => {
          if (userProfile?.budget_max) {
            return cost <= userProfile.budget_max 
              ? 'rgba(40, 167, 69, 1)' 
              : 'rgba(220, 53, 69, 1)';
          }
          return 'rgba(54, 162, 235, 1)';
        }),
        borderWidth: 2
      }
    ];

    if (budgetLine) {
      datasets.push({
        label: 'Your Budget',
        data: budgetLine,
        type: 'line',
        borderColor: 'rgba(255, 193, 7, 1)',
        backgroundColor: 'rgba(255, 193, 7, 0.2)',
        borderWidth: 3,
        borderDash: [5, 5],
        pointBackgroundColor: 'rgba(255, 193, 7, 1)',
        pointBorderColor: 'rgba(255, 193, 7, 1)',
        pointRadius: 4,
        fill: false
      });
    }

    const data = {
      labels,
      datasets
    };

    return <Bar ref={chartRef} data={data} options={getChartOptions('comparison')} />;
  };

  const generateBudgetChart = () => {
    if (!dataToUse.length || !userProfile?.budget_max) return null;

    const withinBudget = dataToUse.filter(rec => 
      (rec.cost_breakdown?.total_annual_cost || 0) <= userProfile.budget_max
    ).length;
    
    const overBudget = dataToUse.length - withinBudget;

    const data = {
      labels: ['Within Budget', 'Over Budget'],
      datasets: [
        {
          data: [withinBudget, overBudget],
          backgroundColor: [
            'rgba(40, 167, 69, 0.8)',
            'rgba(220, 53, 69, 0.8)'
          ],
          borderColor: [
            'rgba(40, 167, 69, 1)',
            'rgba(220, 53, 69, 1)'
          ],
          borderWidth: 2
        }
      ]
    };

    return <Doughnut ref={chartRef} data={data} options={getChartOptions('budget')} />;
  };

  const generateTrendChart = () => {
    if (!dataToUse.length) return null;

    // Sort by total cost for trend visualization
    const sortedData = [...dataToUse].sort((a, b) => 
      (a.cost_breakdown?.total_annual_cost || 0) - (b.cost_breakdown?.total_annual_cost || 0)
    );

    const labels = sortedData.map((rec, index) => `Option ${index + 1}`);
    const costs = sortedData.map(rec => rec.cost_breakdown?.total_annual_cost || 0);
    const admissionProbs = sortedData.map(rec => (rec.admission_probability || 0) * 100000); // Scale for visibility

    const data = {
      labels,
      datasets: [
        {
          label: 'Total Cost (USD)',
          data: costs,
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          yAxisID: 'y',
          tension: 0.4
        },
        {
          label: 'Admission Probability (scaled)',
          data: admissionProbs,
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          yAxisID: 'y1',
          tension: 0.4
        }
      ]
    };

    const options = {
      ...getChartOptions('trend'),
      scales: {
        x: {
          grid: {
            display: false
          }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return formatCurrency(value);
            }
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          beginAtZero: true,
          grid: {
            drawOnChartArea: false,
          },
          ticks: {
            callback: function(value) {
              return `${(value / 1000).toFixed(0)}%`;
            }
          }
        }
      }
    };

    return <Line ref={chartRef} data={data} options={options} />;
  };

  const renderChart = () => {
    switch (chartType) {
      case 'breakdown':
        return generateBreakdownChart();
      case 'comparison':
        return generateComparisonChart();
      case 'budget':
        return generateBudgetChart();
      case 'trend':
        return generateTrendChart();
      default:
        return generateBreakdownChart();
    }
  };

  const getChartTitle = () => {
    switch (chartType) {
      case 'breakdown':
        return 'Cost Breakdown by University';
      case 'comparison':
        return 'Total Cost Comparison';
      case 'budget':
        return 'Budget Analysis';
      case 'trend':
        return 'Cost vs Admission Probability Trend';
      default:
        return 'Cost Analysis';
    }
  };

  if (!dataToUse.length) {
    return (
      <div className="cost-analysis-chart">
        <div className="chart-header">
          <h3>{getChartTitle()}</h3>
        </div>
        <div className="no-data">
          <p>No cost data available for visualization</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cost-analysis-chart">
      <div className="chart-header">
        <h3>{getChartTitle()}</h3>
        {userProfile?.budget_max && chartType === 'comparison' && (
          <div className="budget-info">
            <span className="budget-label">Your Budget:</span>
            <span className="budget-value">{formatCurrency(userProfile.budget_max)}</span>
          </div>
        )}
      </div>
      <div className="chart-container">
        {renderChart()}
      </div>
      {chartType === 'budget' && userProfile?.budget_max && (
        <div className="chart-summary">
          <div className="summary-stats">
            <div className="stat">
              <span className="stat-value">
                {dataToUse.filter(rec => 
                  (rec.cost_breakdown?.total_annual_cost || 0) <= userProfile.budget_max
                ).length}
              </span>
              <span className="stat-label">Within Budget</span>
            </div>
            <div className="stat">
              <span className="stat-value">
                {dataToUse.filter(rec => 
                  (rec.cost_breakdown?.total_annual_cost || 0) > userProfile.budget_max
                ).length}
              </span>
              <span className="stat-label">Over Budget</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CostAnalysisChart;