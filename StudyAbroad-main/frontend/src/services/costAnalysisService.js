import api from './api';

const costAnalysisService = {
  /**
   * Get detailed cost analysis for multiple universities
   */
  getCostAnalysis: async (universityIds, analysisType = 'comparison', userProfile = null) => {
    try {
      const response = await api.post('/recommendations/cost-analysis', {
        university_ids: universityIds,
        analysis_type: analysisType,
        user_profile: userProfile
      });
      return response.data;
    } catch (error) {
      console.error('Error getting cost analysis:', error);
      throw error;
    }
  },

  /**
   * Get cost trends and projections for a specific university
   */
  getCostTrends: async (universityId, years = 4, inflationRate = 3.0, userProfile = null) => {
    try {
      const response = await api.post(`/recommendations/cost-trends/${universityId}`, {
        years,
        inflation_rate: inflationRate,
        user_profile: userProfile
      });
      return response.data;
    } catch (error) {
      console.error('Error getting cost trends:', error);
      throw error;
    }
  },

  /**
   * Get comparative cost analysis for selected universities
   */
  getComparativeCostAnalysis: async (universityIds, userProfile = null) => {
    return costAnalysisService.getCostAnalysis(universityIds, 'comparison', userProfile);
  },

  /**
   * Get affordability analysis for universities
   */
  getAffordabilityAnalysis: async (universityIds, userProfile = null) => {
    return costAnalysisService.getCostAnalysis(universityIds, 'affordability', userProfile);
  },

  /**
   * Get cost trends analysis for multiple universities
   */
  getCostTrendsAnalysis: async (universityIds, userProfile = null) => {
    return costAnalysisService.getCostAnalysis(universityIds, 'trends', userProfile);
  },

  /**
   * Calculate total cost of education with custom parameters
   */
  calculateTotalCost: (costBreakdown, studyDuration = 2, inflationRate = 3, scholarshipAmount = 0, workIncome = 0) => {
    if (!costBreakdown) return null;

    let totalCosts = {
      tuition: 0,
      living: 0,
      other: 0,
      subtotal: 0,
      scholarship: scholarshipAmount * studyDuration,
      workIncome: workIncome * studyDuration,
      grandTotal: 0
    };

    // Calculate costs for each year with inflation
    for (let year = 1; year <= studyDuration; year++) {
      const inflationMultiplier = Math.pow(1 + (inflationRate / 100), year - 1);
      
      totalCosts.tuition += (costBreakdown.tuition_fee || 0) * inflationMultiplier;
      totalCosts.living += (costBreakdown.living_cost || 0) * inflationMultiplier;
      totalCosts.other += ((costBreakdown.other_fees || 0) + 
                          (costBreakdown.books_supplies || 0) + 
                          (costBreakdown.personal_expenses || 0) + 
                          (costBreakdown.health_insurance || 0)) * inflationMultiplier;
    }

    totalCosts.subtotal = totalCosts.tuition + totalCosts.living + totalCosts.other + 
                         (costBreakdown.application_fee || 0) + (costBreakdown.visa_fees || 0);
    
    totalCosts.grandTotal = totalCosts.subtotal - totalCosts.scholarship - totalCosts.workIncome;

    return totalCosts;
  },

  /**
   * Convert cost to different currency
   */
  convertCurrency: (amount, fromCurrency = 'USD', toCurrency = 'USD') => {
    const exchangeRates = {
      'USD': 1.0,
      'EUR': 0.85,
      'GBP': 0.73,
      'CAD': 1.25,
      'AUD': 1.35,
      'INR': 83.0,
      'JPY': 110.0,
      'CNY': 6.5
    };

    const fromRate = exchangeRates[fromCurrency] || 1.0;
    const toRate = exchangeRates[toCurrency] || 1.0;
    
    return (amount / fromRate) * toRate;
  },

  /**
   * Get currency symbol
   */
  getCurrencySymbol: (currencyCode) => {
    const symbols = {
      'USD': '$', 'EUR': '€', 'GBP': '£', 'CAD': 'C$', 
      'AUD': 'A$', 'INR': '₹', 'JPY': '¥', 'CNY': '¥'
    };
    return symbols[currencyCode] || currencyCode;
  },

  /**
   * Format currency amount for display
   */
  formatCurrency: (amount, currency = 'USD', showSymbol = true) => {
    const symbol = costAnalysisService.getCurrencySymbol(currency);
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);

    return showSymbol ? `${symbol}${formatted}` : formatted;
  },

  /**
   * Get affordability status based on budget
   */
  getAffordabilityStatus: (totalCost, budgetMax, budgetMin = 0) => {
    if (!budgetMax || budgetMax <= 0) {
      return { status: 'unknown', message: 'No budget specified', color: '#6c757d' };
    }

    if (totalCost <= budgetMin) {
      return { status: 'very_affordable', message: 'Very affordable', color: '#28a745' };
    } else if (totalCost <= budgetMax) {
      return { status: 'affordable', message: 'Within budget', color: '#28a745' };
    } else if (totalCost <= budgetMax * 1.1) {
      return { status: 'slightly_over', message: 'Slightly over budget', color: '#ffc107' };
    } else {
      return { status: 'over_budget', message: 'Over budget', color: '#dc3545' };
    }
  },

  /**
   * Calculate cost efficiency metrics
   */
  calculateCostEfficiency: (costBreakdown, universityRanking) => {
    if (!costBreakdown) return null;

    const totalCost = costBreakdown.total_annual_cost || 0;
    const tuitionFee = costBreakdown.tuition_fee || 0;
    const livingCost = costBreakdown.living_cost || 0;

    return {
      costPerRankingPoint: totalCost / Math.max(1, 1000 - (universityRanking || 500)),
      tuitionToLivingRatio: tuitionFee / Math.max(1, livingCost),
      costPerQualityScore: totalCost / Math.max(1, (1000 - (universityRanking || 500)) / 100),
      valueScore: Math.max(0, 100 - (totalCost / 1000) + ((1000 - (universityRanking || 500)) / 10))
    };
  }
};

export default costAnalysisService;