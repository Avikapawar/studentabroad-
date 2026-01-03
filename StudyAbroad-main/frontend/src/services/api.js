import axios from 'axios';
import cacheService, { CACHE_CONFIGS } from './cacheService';
import { retryWithBackoff } from '../utils/errorHandler';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 30000, // Increased timeout for better reliability
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request queue for batching similar requests
const requestQueue = new Map();
const batchTimeout = 50; // 50ms batch window

// Request interceptor for adding auth tokens
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors and token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
      return Promise.reject({
        ...error,
        isNetworkError: true,
        message: 'Network connection failed. Please check your internet connection.',
        code: 'NETWORK_ERROR'
      });
    }

    // Handle 401 unauthorized errors with token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Try to refresh token
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          // Create a new axios instance to avoid interceptor loops
          const refreshResponse = await axios.post(
            `${api.defaults.baseURL}/auth/refresh`,
            {},
            {
              headers: {
                'Authorization': `Bearer ${refreshToken}`,
                'Content-Type': 'application/json'
              }
            }
          );

          const newAccessToken = refreshResponse.data.access_token;
          localStorage.setItem('accessToken', newAccessToken);

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, clear auth data and redirect to login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userData');

          // Dispatch custom event for auth failure
          window.dispatchEvent(new CustomEvent('auth:logout', {
            detail: { reason: 'token_refresh_failed' }
          }));

          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
      } else {
        // No refresh token, clear auth data and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userData');

        window.dispatchEvent(new CustomEvent('auth:logout', {
          detail: { reason: 'no_refresh_token' }
        }));

        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }

    // Handle rate limiting
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'] || 60;
      return Promise.reject({
        ...error,
        isRateLimited: true,
        retryAfter,
        message: `Too many requests. Please try again in ${retryAfter} seconds.`,
        code: 'RATE_LIMITED'
      });
    }

    // Handle server errors
    if (error.response?.status >= 500) {
      return Promise.reject({
        ...error,
        isServerError: true,
        message: 'Server error occurred. Please try again later.',
        code: 'SERVER_ERROR'
      });
    }

    // Handle validation errors
    if (error.response?.status === 400) {
      return Promise.reject({
        ...error,
        isValidationError: true,
        message: error.response.data?.error || 'Invalid request data',
        code: error.response.data?.code || 'VALIDATION_ERROR',
        details: error.response.data?.details || null
      });
    }

    return Promise.reject(error);
  }
);

// Enhanced API methods with caching and performance optimizations
export const apiWithCache = {
  /**
   * GET request with caching support
   */
  async get(url, options = {}) {
    const {
      params = {},
      cache = true,
      cacheConfig = CACHE_CONFIGS.STATIC_DATA,
      forceRefresh = false,
      ...axiosOptions
    } = options;

    const cacheKey = cacheService.generateKey(url, params);

    // Return cached data if available and not forcing refresh
    if (cache && !forceRefresh) {
      const cachedData = cacheService.get(cacheKey);
      if (cachedData) {
        return { data: cachedData, fromCache: true };
      }
    }

    // Check if similar request is already in progress
    if (requestQueue.has(cacheKey)) {
      return requestQueue.get(cacheKey);
    }

    // Make the request with retry logic
    const requestPromise = retryWithBackoff(async () => {
      const response = await api.get(url, { params, ...axiosOptions });

      // Cache successful responses
      if (cache && response.data) {
        cacheService.set(cacheKey, response.data, cacheConfig.ttl, cacheConfig.strategy);
      }

      return { data: response.data, fromCache: false };
    }, 3, 1000);

    // Add to request queue
    requestQueue.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      // Remove from queue after completion
      setTimeout(() => requestQueue.delete(cacheKey), batchTimeout);
    }
  },

  /**
   * POST request with optimistic updates
   */
  async post(url, data, options = {}) {
    const {
      optimistic = false,
      invalidateCache = [],
      ...axiosOptions
    } = options;

    // Invalidate related cache entries
    invalidateCache.forEach(pattern => {
      cacheService.invalidatePattern(pattern);
    });

    const response = await retryWithBackoff(async () => {
      return api.post(url, data, axiosOptions);
    }, 2, 1000);

    return response;
  },

  /**
   * PUT request with cache invalidation
   */
  async put(url, data, options = {}) {
    const {
      invalidateCache = [],
      ...axiosOptions
    } = options;

    // Invalidate related cache entries
    invalidateCache.forEach(pattern => {
      cacheService.invalidatePattern(pattern);
    });

    const response = await retryWithBackoff(async () => {
      return api.put(url, data, axiosOptions);
    }, 2, 1000);

    return response;
  },

  /**
   * DELETE request with cache invalidation
   */
  async delete(url, options = {}) {
    const {
      invalidateCache = [],
      ...axiosOptions
    } = options;

    // Invalidate related cache entries
    invalidateCache.forEach(pattern => {
      cacheService.invalidatePattern(pattern);
    });

    const response = await retryWithBackoff(async () => {
      return api.delete(url, axiosOptions);
    }, 2, 1000);

    return response;
  },

  /**
   * Batch multiple requests
   */
  async batch(requests) {
    const promises = requests.map(({ method, url, data, options }) => {
      switch (method.toLowerCase()) {
        case 'get':
          return this.get(url, options);
        case 'post':
          return this.post(url, data, options);
        case 'put':
          return this.put(url, data, options);
        case 'delete':
          return this.delete(url, options);
        default:
          throw new Error(`Unsupported method: ${method}`);
      }
    });

    return Promise.allSettled(promises);
  },

  /**
   * Preload data for better performance
   */
  async preload(endpoints) {
    const requests = endpoints.map(({ url, params, cacheConfig }) => ({
      key: cacheService.generateKey(url, params),
      fetcher: () => api.get(url, { params }),
      ttl: cacheConfig?.ttl,
      strategy: cacheConfig?.strategy
    }));

    return cacheService.preload(requests);
  },

  /**
   * Clear cache
   */
  clearCache(pattern) {
    if (pattern) {
      cacheService.invalidatePattern(pattern);
    } else {
      cacheService.clear();
    }
  },

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return cacheService.getStats();
  }
};

// Progressive loading utility
export const createProgressiveLoader = (endpoint, options = {}) => {
  const {
    pageSize = 20,
    cacheConfig = CACHE_CONFIGS.SEARCH_RESULTS,
    transform = (data) => data
  } = options;

  let currentPage = 0;
  let hasMore = true;
  let loading = false;

  return {
    async loadMore() {
      if (loading || !hasMore) return null;

      loading = true;
      try {
        const response = await apiWithCache.get(endpoint, {
          params: { page: currentPage, limit: pageSize },
          cacheConfig
        });

        const data = transform(response.data);

        if (data.length < pageSize) {
          hasMore = false;
        }

        currentPage++;
        return data;
      } finally {
        loading = false;
      }
    },

    reset() {
      currentPage = 0;
      hasMore = true;
      loading = false;
    },

    get isLoading() {
      return loading;
    },

    get hasMoreData() {
      return hasMore;
    }
  };
};

export default api;