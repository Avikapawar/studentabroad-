/**
 * Loading state management utilities
 */

import { useState, useCallback, useRef } from 'react';

/**
 * Custom hook for managing loading states
 */
export const useLoading = (initialState = false) => {
  const [isLoading, setIsLoading] = useState(initialState);
  const [error, setError] = useState(null);
  const loadingRef = useRef(false);

  const startLoading = useCallback(() => {
    setIsLoading(true);
    setError(null);
    loadingRef.current = true;
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
    loadingRef.current = false;
  }, []);

  const setLoadingError = useCallback((error) => {
    setError(error);
    setIsLoading(false);
    loadingRef.current = false;
  }, []);

  const executeWithLoading = useCallback(async (asyncFunction) => {
    startLoading();
    try {
      const result = await asyncFunction();
      stopLoading();
      return result;
    } catch (error) {
      setLoadingError(error);
      throw error;
    }
  }, [startLoading, stopLoading, setLoadingError]);

  return {
    isLoading,
    error,
    startLoading,
    stopLoading,
    setError: setLoadingError,
    executeWithLoading,
    isCurrentlyLoading: () => loadingRef.current
  };
};

/**
 * Custom hook for managing multiple loading states
 */
export const useMultipleLoading = () => {
  const [loadingStates, setLoadingStates] = useState({});
  const [errors, setErrors] = useState({});

  const setLoading = useCallback((key, isLoading) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: isLoading
    }));
    
    if (isLoading) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  }, []);

  const setError = useCallback((key, error) => {
    setErrors(prev => ({
      ...prev,
      [key]: error
    }));
    setLoadingStates(prev => ({
      ...prev,
      [key]: false
    }));
  }, []);

  const clearError = useCallback((key) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[key];
      return newErrors;
    });
  }, []);

  const executeWithLoading = useCallback(async (key, asyncFunction) => {
    setLoading(key, true);
    try {
      const result = await asyncFunction();
      setLoading(key, false);
      return result;
    } catch (error) {
      setError(key, error);
      throw error;
    }
  }, [setLoading, setError]);

  const isLoading = useCallback((key) => {
    return loadingStates[key] || false;
  }, [loadingStates]);

  const getError = useCallback((key) => {
    return errors[key] || null;
  }, [errors]);

  const isAnyLoading = useCallback(() => {
    return Object.values(loadingStates).some(loading => loading);
  }, [loadingStates]);

  return {
    setLoading,
    setError,
    clearError,
    executeWithLoading,
    isLoading,
    getError,
    isAnyLoading,
    loadingStates,
    errors
  };
};

/**
 * Loading state types
 */
export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
};

/**
 * Custom hook for async operations with comprehensive state management
 */
export const useAsyncOperation = (initialData = null) => {
  const [state, setState] = useState(LOADING_STATES.IDLE);
  const [data, setData] = useState(initialData);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  const execute = useCallback(async (asyncFunction, options = {}) => {
    const { 
      onProgress = null, 
      retries = 0, 
      retryDelay = 1000,
      timeout = 30000 
    } = options;

    setState(LOADING_STATES.LOADING);
    setError(null);
    setProgress(0);

    let attempt = 0;
    const maxAttempts = retries + 1;

    while (attempt < maxAttempts) {
      try {
        // Set up timeout
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Operation timed out')), timeout);
        });

        // Execute the async function with progress tracking
        const operationPromise = asyncFunction({
          onProgress: (progressValue) => {
            setProgress(progressValue);
            if (onProgress) onProgress(progressValue);
          }
        });

        const result = await Promise.race([operationPromise, timeoutPromise]);
        
        setData(result);
        setState(LOADING_STATES.SUCCESS);
        setProgress(100);
        return result;

      } catch (err) {
        attempt++;
        
        if (attempt >= maxAttempts) {
          setError(err);
          setState(LOADING_STATES.ERROR);
          setProgress(0);
          throw err;
        }

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
      }
    }
  }, []);

  const reset = useCallback(() => {
    setState(LOADING_STATES.IDLE);
    setData(initialData);
    setError(null);
    setProgress(0);
  }, [initialData]);

  return {
    state,
    data,
    error,
    progress,
    execute,
    reset,
    isLoading: state === LOADING_STATES.LOADING,
    isSuccess: state === LOADING_STATES.SUCCESS,
    isError: state === LOADING_STATES.ERROR,
    isIdle: state === LOADING_STATES.IDLE
  };
};

/**
 * Loading component props generator
 */
export const getLoadingProps = (isLoading, error = null, customMessages = {}) => {
  const defaultMessages = {
    loading: 'Loading...',
    error: 'Something went wrong',
    retry: 'Try Again',
    ...customMessages
  };

  return {
    isLoading,
    error,
    loadingMessage: defaultMessages.loading,
    errorMessage: error ? (error.message || defaultMessages.error) : null,
    retryLabel: defaultMessages.retry
  };
};

/**
 * Create loading skeleton props
 */
export const createSkeletonProps = (count = 1, height = '20px', width = '100%') => {
  return {
    count,
    height,
    width,
    baseColor: '#f3f4f6',
    highlightColor: '#e5e7eb',
    duration: 1.2
  };
};

/**
 * Progress tracking utilities
 */
export class ProgressTracker {
  constructor(totalSteps = 100) {
    this.totalSteps = totalSteps;
    this.currentStep = 0;
    this.callbacks = [];
  }

  onProgress(callback) {
    this.callbacks.push(callback);
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    };
  }

  setProgress(step) {
    this.currentStep = Math.min(step, this.totalSteps);
    const percentage = (this.currentStep / this.totalSteps) * 100;
    
    this.callbacks.forEach(callback => {
      callback(percentage, this.currentStep, this.totalSteps);
    });
  }

  increment(steps = 1) {
    this.setProgress(this.currentStep + steps);
  }

  complete() {
    this.setProgress(this.totalSteps);
  }

  reset() {
    this.setProgress(0);
  }

  getPercentage() {
    return (this.currentStep / this.totalSteps) * 100;
  }
}

/**
 * Batch operation manager
 */
export class BatchOperationManager {
  constructor(batchSize = 10, delayBetweenBatches = 100) {
    this.batchSize = batchSize;
    this.delayBetweenBatches = delayBetweenBatches;
  }

  async executeBatch(items, operation, onProgress = null) {
    const results = [];
    const totalBatches = Math.ceil(items.length / this.batchSize);
    
    for (let i = 0; i < totalBatches; i++) {
      const start = i * this.batchSize;
      const end = Math.min(start + this.batchSize, items.length);
      const batch = items.slice(start, end);
      
      // Execute batch operations in parallel
      const batchPromises = batch.map(item => operation(item));
      const batchResults = await Promise.allSettled(batchPromises);
      
      results.push(...batchResults);
      
      // Report progress
      if (onProgress) {
        const progress = ((i + 1) / totalBatches) * 100;
        onProgress(progress, i + 1, totalBatches);
      }
      
      // Delay between batches to avoid overwhelming the server
      if (i < totalBatches - 1) {
        await new Promise(resolve => setTimeout(resolve, this.delayBetweenBatches));
      }
    }
    
    return results;
  }
}

/**
 * Cache manager for loading states
 */
export class LoadingStateCache {
  constructor(maxSize = 100, ttl = 5 * 60 * 1000) { // 5 minutes TTL
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  set(key, state) {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      state,
      timestamp: Date.now()
    });
  }

  get(key) {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    // Check if entry has expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.state;
  }

  clear() {
    this.cache.clear();
  }

  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Global loading state cache instance
export const globalLoadingCache = new LoadingStateCache();