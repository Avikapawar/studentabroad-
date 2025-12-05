/**
 * Comprehensive error handling utilities
 */

export class AppError extends Error {
  constructor(message, code, details = null, isRetryable = false) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
    this.isRetryable = isRetryable;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Parse API error response and return standardized error object
 */
export const parseApiError = (error) => {
  // Network error
  if (error.isNetworkError) {
    return new AppError(
      'Unable to connect to the server. Please check your internet connection.',
      'NETWORK_ERROR',
      null,
      true
    );
  }

  // Rate limiting error
  if (error.isRateLimited) {
    return new AppError(
      `Too many requests. Please wait ${error.retryAfter} seconds before trying again.`,
      'RATE_LIMITED',
      { retryAfter: error.retryAfter },
      true
    );
  }

  // Server error
  if (error.isServerError) {
    return new AppError(
      'Server is temporarily unavailable. Please try again later.',
      'SERVER_ERROR',
      null,
      true
    );
  }

  // Validation error
  if (error.isValidationError) {
    return new AppError(
      error.message || 'Please check your input and try again.',
      error.code || 'VALIDATION_ERROR',
      error.details,
      false
    );
  }

  // API response error
  if (error.response) {
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return new AppError(
          data?.error || 'Invalid request. Please check your input.',
          data?.code || 'BAD_REQUEST',
          data?.details,
          false
        );
      
      case 401:
        return new AppError(
          'Authentication required. Please log in again.',
          'UNAUTHORIZED',
          null,
          false
        );
      
      case 403:
        return new AppError(
          'You do not have permission to perform this action.',
          'FORBIDDEN',
          null,
          false
        );
      
      case 404:
        return new AppError(
          data?.error || 'The requested resource was not found.',
          data?.code || 'NOT_FOUND',
          null,
          false
        );
      
      case 409:
        return new AppError(
          data?.error || 'A conflict occurred. The resource may already exist.',
          data?.code || 'CONFLICT',
          data?.details,
          false
        );
      
      case 422:
        return new AppError(
          data?.error || 'The provided data is invalid.',
          data?.code || 'UNPROCESSABLE_ENTITY',
          data?.details,
          false
        );
      
      default:
        return new AppError(
          data?.error || 'An unexpected error occurred.',
          data?.code || 'UNKNOWN_ERROR',
          data?.details,
          status >= 500
        );
    }
  }

  // Generic error
  return new AppError(
    error.message || 'An unexpected error occurred.',
    'UNKNOWN_ERROR',
    null,
    false
  );
};

/**
 * Get user-friendly error message based on error code
 */
export const getErrorMessage = (error) => {
  if (error instanceof AppError) {
    return error.message;
  }

  const errorCode = error.code || error.response?.data?.code;
  
  const errorMessages = {
    // Authentication errors
    'INVALID_CREDENTIALS': 'Invalid email or password. Please try again.',
    'USER_EXISTS': 'An account with this email already exists.',
    'WEAK_PASSWORD': 'Password must be at least 8 characters with uppercase, lowercase, and numbers.',
    'TOKEN_EXPIRED': 'Your session has expired. Please log in again.',
    'UNAUTHORIZED': 'Please log in to access this feature.',
    
    // Validation errors
    'MISSING_FIELDS': 'Please fill in all required fields.',
    'INVALID_EMAIL': 'Please enter a valid email address.',
    'INVALID_CGPA': 'CGPA must be between 0.0 and 4.0.',
    'INVALID_GRE': 'GRE score must be between 260 and 340.',
    'INVALID_IELTS': 'IELTS score must be between 0.0 and 9.0.',
    'INVALID_TOEFL': 'TOEFL score must be between 0 and 120.',
    
    // University search errors
    'UNIVERSITY_NOT_FOUND': 'University not found. Please try a different search.',
    'SEARCH_ERROR': 'Search failed. Please try again.',
    'FILTER_ERROR': 'Unable to apply filters. Please try again.',
    
    // Recommendation errors
    'INCOMPLETE_PROFILE': 'Please complete your profile to get recommendations.',
    'RECOMMENDATION_ERROR': 'Unable to generate recommendations. Please try again.',
    'PREDICTION_ERROR': 'Unable to calculate admission probability. Please try again.',
    
    // Bookmark errors
    'BOOKMARK_ERROR': 'Unable to save bookmark. Please try again.',
    'BOOKMARK_NOT_FOUND': 'Bookmark not found.',
    
    // Network errors
    'NETWORK_ERROR': 'Connection failed. Please check your internet connection.',
    'TIMEOUT_ERROR': 'Request timed out. Please try again.',
    'RATE_LIMITED': 'Too many requests. Please wait before trying again.',
    
    // Server errors
    'SERVER_ERROR': 'Server error. Please try again later.',
    'SERVICE_UNAVAILABLE': 'Service is temporarily unavailable.',
    
    // Default
    'UNKNOWN_ERROR': 'Something went wrong. Please try again.'
  };

  return errorMessages[errorCode] || error.message || errorMessages['UNKNOWN_ERROR'];
};

/**
 * Log error for debugging and monitoring
 */
export const logError = (error, context = {}) => {
  const errorInfo = {
    message: error.message,
    code: error.code,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    context
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Application Error:', errorInfo);
  }

  // In production, you would send this to your error tracking service
  // Example: Sentry, LogRocket, etc.
  if (process.env.NODE_ENV === 'production') {
    // sendToErrorTrackingService(errorInfo);
  }
};

/**
 * Retry function with exponential backoff
 */
export const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      const parsedError = parseApiError(error);
      
      // Don't retry if error is not retryable
      if (!parsedError.isRetryable) {
        throw parsedError;
      }
      
      // Don't retry on last attempt
      if (attempt === maxRetries - 1) {
        break;
      }
      
      // Calculate delay with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw parseApiError(lastError);
};

/**
 * Create error boundary handler
 */
export const createErrorBoundaryHandler = (onError) => {
  return (error, errorInfo) => {
    logError(error, { errorInfo });
    if (onError) {
      onError(error, errorInfo);
    }
  };
};

/**
 * Validate form data and return errors
 */
export const validateFormData = (data, validationRules) => {
  const errors = {};
  
  Object.keys(validationRules).forEach(field => {
    const rules = validationRules[field];
    const value = data[field];
    
    for (const rule of rules) {
      const error = rule(value, data);
      if (error) {
        errors[field] = error;
        break; // Stop at first error for this field
      }
    }
  });
  
  return errors;
};

/**
 * Sanitize user input to prevent XSS
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Debounce function for API calls
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