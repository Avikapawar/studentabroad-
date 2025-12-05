import React, { useState, useEffect } from 'react';
import './CostCalculator.css';

const CostCalculator = ({ 
  recommendation, 
  userProfile, 
  onCalculationUpdate 
}) => {
  const [calculatorData, setCalculatorData] = useState({
    studyDuration: 2, // years
    currency: 'USD',
    exchangeRate: 1,
    includeInflation: true,
    inflationRate: 3, // percentage
    personalExpenses: 0,
    scholarshipAmount: 0,
    workIncome: 0,
    additionalFees: 0
  });

  const [totalCosts, setTotalCosts] = useState({});
  const [currencies] = useState([
    { code: 'USD', symbol: '$', rate: 1 },
    { code: 'EUR', symbol: '€', rate: 0.85 },
    { code: 'GBP', symbol: '£', rate: 0.73 },
    { code: 'CAD', symbol: 'C$', rate: 1.25 },
    { code: 'AUD', symbol: 'A$', rate: 1.35 },
    { code: 'INR', symbol: '₹', rate: 83 }
  ]);

  useEffect(() => {
    calculateTotalCosts();
  }, [calculatorData, recommendation]);

  const calculateTotalCosts = () => {
    if (!recommendation?.cost_breakdown) return;

    const { cost_breakdown } = recommendation;
    const { studyDuration, includeInflation, inflationRate, personalExpenses, scholarshipAmount, workIncome, additionalFees } = calculatorData;

    // Base annual costs
    const annualTuition = cost_breakdown.tuition_fee || 0;
    const annualLiving = cost_breakdown.living_cost || 0;
    const applicationFee = cost_breakdown.application_fee || 0;
    const otherFees = cost_breakdown.other_fees || 0;

    let totalCosts = {
      tuition: 0,
      living: 0,
      personal: 0,
      additional: 0,
      application: applicationFee,
      other: otherFees,
      subtotal: 0,
      scholarship: 0,
      workIncome: 0,
      grandTotal: 0
    };

    // Calculate costs for each year with inflation
    for (let year = 1; year <= studyDuration; year++) {
      const inflationMultiplier = includeInflation 
        ? Math.pow(1 + (inflationRate / 100), year - 1)
        : 1;

      totalCosts.tuition += annualTuition * inflationMultiplier;
      totalCosts.living += annualLiving * inflationMultiplier;
      totalCosts.personal += personalExpenses * inflationMultiplier;
      totalCosts.additional += additionalFees * inflationMultiplier;
    }

    // Calculate total income/savings
    totalCosts.scholarship = scholarshipAmount * studyDuration;
    totalCosts.workIncome = workIncome * studyDuration;

    // Calculate subtotal and grand total
    totalCosts.subtotal = totalCosts.tuition + totalCosts.living + totalCosts.personal + 
                         totalCosts.additional + totalCosts.application + totalCosts.other;
    
    totalCosts.grandTotal = totalCosts.subtotal - totalCosts.scholarship - totalCosts.workIncome;

    setTotalCosts(totalCosts);

    // Notify parent component
    if (onCalculationUpdate) {
      onCalculationUpdate({
        ...totalCosts,
        studyDuration,
        currency: calculatorData.currency
      });
    }
  };

  const handleInputChange = (field, value) => {
    setCalculatorData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatCurrency = (amount, showSymbol = true) => {
    const selectedCurrency = currencies.find(c => c.code === calculatorData.currency);
    const convertedAmount = amount * (selectedCurrency?.rate || 1);
    
    if (showSymbol) {
      return `${selectedCurrency?.symbol || '$'}${convertedAmount.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      })}`;
    }
    
    return convertedAmount.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  const getAffordabilityStatus = () => {
    if (!userProfile?.budget_max || !totalCosts.grandTotal) return null;

    const annualCost = totalCosts.grandTotal / calculatorData.studyDuration;
    const budgetRatio = annualCost / userProfile.budget_max;

    if (budgetRatio <= 1) {
      return { status: 'affordable', message: 'Within your budget', color: '#28a745' };
    } else if (budgetRatio <= 1.2) {
      return { status: 'stretch', message: 'Slightly over budget', color: '#ffc107' };
    } else {
      return { status: 'expensive', message: 'Significantly over budget', color: '#dc3545' };
    }
  };

  const affordability = getAffordabilityStatus();

  return (
    <div className="cost-calculator">
      <div className="calculator-header">
        <h3>Cost Calculator</h3>
        <div className="currency-selector">
          <label>Currency:</label>
          <select 
            value={calculatorData.currency}
            onChange={(e) => handleInputChange('currency', e.target.value)}
          >
            {currencies.map(currency => (
              <option key={currency.code} value={currency.code}>
                {currency.code} ({currency.symbol})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="calculator-content">
        <div className="input-section">
          <h4>Study Parameters</h4>
          
          <div className="input-group">
            <label>Study Duration (years):</label>
            <input
              type="number"
              min="1"
              max="6"
              value={calculatorData.studyDuration}
              onChange={(e) => handleInputChange('studyDuration', parseInt(e.target.value) || 1)}
            />
          </div>

          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={calculatorData.includeInflation}
                onChange={(e) => handleInputChange('includeInflation', e.target.checked)}
              />
              Include inflation ({calculatorData.inflationRate}% annually)
            </label>
            {calculatorData.includeInflation && (
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={calculatorData.inflationRate}
                onChange={(e) => handleInputChange('inflationRate', parseFloat(e.target.value) || 0)}
                className="inflation-input"
              />
            )}
          </div>
        </div>

        <div className="input-section">
          <h4>Additional Costs & Income</h4>
          
          <div className="input-group">
            <label>Personal Expenses (annual):</label>
            <input
              type="number"
              min="0"
              value={calculatorData.personalExpenses}
              onChange={(e) => handleInputChange('personalExpenses', parseInt(e.target.value) || 0)}
              placeholder="Books, travel, entertainment..."
            />
          </div>

          <div className="input-group">
            <label>Additional Fees (annual):</label>
            <input
              type="number"
              min="0"
              value={calculatorData.additionalFees}
              onChange={(e) => handleInputChange('additionalFees', parseInt(e.target.value) || 0)}
              placeholder="Lab fees, technology fees..."
            />
          </div>

          <div className="input-group">
            <label>Scholarship Amount (annual):</label>
            <input
              type="number"
              min="0"
              value={calculatorData.scholarshipAmount}
              onChange={(e) => handleInputChange('scholarshipAmount', parseInt(e.target.value) || 0)}
              placeholder="Scholarship or financial aid"
            />
          </div>

          <div className="input-group">
            <label>Work Income (annual):</label>
            <input
              type="number"
              min="0"
              value={calculatorData.workIncome}
              onChange={(e) => handleInputChange('workIncome', parseInt(e.target.value) || 0)}
              placeholder="Part-time work, assistantships"
            />
          </div>
        </div>

        <div className="results-section">
          <h4>Cost Breakdown</h4>
          
          <div className="cost-breakdown">
            <div className="cost-item">
              <span className="cost-label">Tuition ({calculatorData.studyDuration} years):</span>
              <span className="cost-value">{formatCurrency(totalCosts.tuition)}</span>
            </div>
            
            <div className="cost-item">
              <span className="cost-label">Living Expenses ({calculatorData.studyDuration} years):</span>
              <span className="cost-value">{formatCurrency(totalCosts.living)}</span>
            </div>
            
            {totalCosts.personal > 0 && (
              <div className="cost-item">
                <span className="cost-label">Personal Expenses ({calculatorData.studyDuration} years):</span>
                <span className="cost-value">{formatCurrency(totalCosts.personal)}</span>
              </div>
            )}
            
            {totalCosts.additional > 0 && (
              <div className="cost-item">
                <span className="cost-label">Additional Fees ({calculatorData.studyDuration} years):</span>
                <span className="cost-value">{formatCurrency(totalCosts.additional)}</span>
              </div>
            )}
            
            <div className="cost-item">
              <span className="cost-label">Application Fee:</span>
              <span className="cost-value">{formatCurrency(totalCosts.application)}</span>
            </div>
            
            {totalCosts.other > 0 && (
              <div className="cost-item">
                <span className="cost-label">Other Fees:</span>
                <span className="cost-value">{formatCurrency(totalCosts.other)}</span>
              </div>
            )}
            
            <div className="cost-item subtotal">
              <span className="cost-label">Subtotal:</span>
              <span className="cost-value">{formatCurrency(totalCosts.subtotal)}</span>
            </div>
            
            {totalCosts.scholarship > 0 && (
              <div className="cost-item income">
                <span className="cost-label">Scholarship ({calculatorData.studyDuration} years):</span>
                <span className="cost-value">-{formatCurrency(totalCosts.scholarship)}</span>
              </div>
            )}
            
            {totalCosts.workIncome > 0 && (
              <div className="cost-item income">
                <span className="cost-label">Work Income ({calculatorData.studyDuration} years):</span>
                <span className="cost-value">-{formatCurrency(totalCosts.workIncome)}</span>
              </div>
            )}
            
            <div className="cost-item total">
              <span className="cost-label">Total Cost:</span>
              <span className="cost-value">{formatCurrency(totalCosts.grandTotal)}</span>
            </div>
            
            <div className="cost-item annual">
              <span className="cost-label">Average Annual Cost:</span>
              <span className="cost-value">
                {formatCurrency(totalCosts.grandTotal / calculatorData.studyDuration)}
              </span>
            </div>
          </div>

          {affordability && (
            <div className={`affordability-indicator ${affordability.status}`}>
              <div className="affordability-icon" style={{ color: affordability.color }}>
                {affordability.status === 'affordable' && '✓'}
                {affordability.status === 'stretch' && '⚠️'}
                {affordability.status === 'expensive' && '⚠️'}
              </div>
              <div className="affordability-text">
                <div className="affordability-status" style={{ color: affordability.color }}>
                  {affordability.message}
                </div>
                {userProfile?.budget_max && (
                  <div className="budget-comparison">
                    Your budget: {formatCurrency(userProfile.budget_max)} annually
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CostCalculator;