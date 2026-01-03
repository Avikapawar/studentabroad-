// Helper utility functions

/**
 * Format currency values
 */
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

/**
 * Format percentage values
 */
export const formatPercentage = (value, decimals = 1) => {
  return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate CGPA range
 */
export const isValidCGPA = (cgpa) => {
  const numCgpa = parseFloat(cgpa);
  return !isNaN(numCgpa) && numCgpa >= 0 && numCgpa <= 4;
};

/**
 * Validate GRE score range
 */
export const isValidGRE = (score) => {
  const numScore = parseInt(score);
  return !isNaN(numScore) && numScore >= 260 && numScore <= 340;
};

/**
 * Validate IELTS score range
 */
export const isValidIELTS = (score) => {
  const numScore = parseFloat(score);
  return !isNaN(numScore) && numScore >= 0 && numScore <= 9;
};

/**
 * Validate TOEFL score range
 */
export const isValidTOEFL = (score) => {
  const numScore = parseInt(score);
  return !isNaN(numScore) && numScore >= 0 && numScore <= 120;
};

/**
 * Debounce function for search inputs
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Generate random ID for components
 */
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

/**
 * Calculate admission probability color
 */
export const getProbabilityColor = (probability) => {
  if (probability >= 0.7) return '#28a745'; // Green
  if (probability >= 0.4) return '#ffc107'; // Yellow
  return '#dc3545'; // Red
};