import { useEffect, useCallback, useRef } from 'react';
import { apiWithCache } from '../services/api';
import { CACHE_CONFIGS } from '../services/cacheService';

/**
 * Hook for prefetching data to improve perceived performance
 */
export const usePrefetch = () => {
  const prefetchedRef = useRef(new Set());

  const prefetch = useCallback(async (url, options = {}) => {
    const key = `${url}:${JSON.stringify(options.params || {})}`;
    
    // Avoid duplicate prefetch requests
    if (prefetchedRef.current.has(key)) {
      return;
    }

    prefetchedRef.current.add(key);

    try {
      await apiWithCache.get(url, {
        ...options,
        cache: true,
        cacheConfig: options.cacheConfig || CACHE_CONFIGS.STATIC_DATA
      });
    } catch (error) {
      console.warn('Prefetch failed:', url, error);
      prefetchedRef.current.delete(key);
    }
  }, []);

  const prefetchMultiple = useCallback(async (requests) => {
    const promises = requests.map(({ url, options }) => 
      prefetch(url, options)
    );
    
    return Promise.allSettled(promises);
  }, [prefetch]);

  return { prefetch, prefetchMultiple };
};

/**
 * Hook for prefetching data on hover (for better UX)
 */
export const usePrefetchOnHover = (url, options = {}) => {
  const { prefetch } = usePrefetch();
  const timeoutRef = useRef(null);

  const handleMouseEnter = useCallback(() => {
    // Delay prefetch slightly to avoid unnecessary requests
    timeoutRef.current = setTimeout(() => {
      prefetch(url, options);
    }, 100);
  }, [prefetch, url, options]);

  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { handleMouseEnter, handleMouseLeave };
};

/**
 * Hook for prefetching data based on user behavior patterns
 */
export const useSmartPrefetch = () => {
  const { prefetch } = usePrefetch();
  const behaviorRef = useRef({
    pageViews: new Map(),
    searchQueries: new Map(),
    clickPatterns: new Map()
  });

  // Track page views
  const trackPageView = useCallback((path) => {
    const views = behaviorRef.current.pageViews.get(path) || 0;
    behaviorRef.current.pageViews.set(path, views + 1);
  }, []);

  // Track search queries
  const trackSearch = useCallback((query) => {
    const searches = behaviorRef.current.searchQueries.get(query) || 0;
    behaviorRef.current.searchQueries.set(query, searches + 1);
  }, []);

  // Track click patterns
  const trackClick = useCallback((element, context) => {
    const key = `${element}:${context}`;
    const clicks = behaviorRef.current.clickPatterns.get(key) || 0;
    behaviorRef.current.clickPatterns.set(key, clicks + 1);
  }, []);

  // Predict and prefetch likely next actions
  const predictAndPrefetch = useCallback(() => {
    const { pageViews, searchQueries, clickPatterns } = behaviorRef.current;

    // Prefetch popular pages
    const popularPages = Array.from(pageViews.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([path]) => path);

    popularPages.forEach(path => {
      if (path !== window.location.pathname) {
        prefetch(path);
      }
    });

    // Prefetch related search results
    const popularSearches = Array.from(searchQueries.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([query]) => query);

    popularSearches.forEach(query => {
      prefetch('/api/universities', {
        params: { search: query },
        cacheConfig: CACHE_CONFIGS.SEARCH_RESULTS
      });
    });
  }, [prefetch]);

  return {
    trackPageView,
    trackSearch,
    trackClick,
    predictAndPrefetch
  };
};

/**
 * Hook for prefetching critical data on app initialization
 */
export const useCriticalDataPrefetch = () => {
  const { prefetchMultiple } = usePrefetch();

  useEffect(() => {
    const criticalRequests = [
      {
        url: '/api/countries',
        options: { cacheConfig: CACHE_CONFIGS.STATIC_DATA }
      },
      {
        url: '/api/fields',
        options: { cacheConfig: CACHE_CONFIGS.STATIC_DATA }
      },
      {
        url: '/api/universities',
        options: { 
          params: { limit: 20, featured: true },
          cacheConfig: CACHE_CONFIGS.UNIVERSITIES 
        }
      }
    ];

    // Prefetch after a short delay to not block initial render
    const timer = setTimeout(() => {
      prefetchMultiple(criticalRequests);
    }, 1000);

    return () => clearTimeout(timer);
  }, [prefetchMultiple]);
};

/**
 * Hook for prefetching data based on route changes
 */
export const useRoutePrefetch = () => {
  const { prefetch } = usePrefetch();

  const prefetchForRoute = useCallback((route) => {
    const routePrefetchMap = {
      '/search': [
        { url: '/api/universities', options: { params: { limit: 50 } } },
        { url: '/api/countries', options: {} },
        { url: '/api/fields', options: {} }
      ],
      '/recommendations': [
        { url: '/api/recommendations', options: {} },
        { url: '/api/user/profile', options: {} }
      ],
      '/bookmarks': [
        { url: '/api/bookmarks', options: {} }
      ],
      '/profile': [
        { url: '/api/user/profile', options: {} }
      ]
    };

    const requests = routePrefetchMap[route];
    if (requests) {
      requests.forEach(({ url, options }) => {
        prefetch(url, options);
      });
    }
  }, [prefetch]);

  return { prefetchForRoute };
};

/**
 * Hook for intelligent background data refresh
 */
export const useBackgroundRefresh = (url, options = {}) => {
  const { prefetch } = usePrefetch();
  const {
    interval = 5 * 60 * 1000, // 5 minutes default
    enabled = true,
    conditions = []
  } = options;

  useEffect(() => {
    if (!enabled) return;

    const refreshData = async () => {
      // Check conditions before refreshing
      const shouldRefresh = conditions.length === 0 || 
        conditions.every(condition => condition());

      if (shouldRefresh) {
        await prefetch(url, { 
          ...options, 
          forceRefresh: true 
        });
      }
    };

    const intervalId = setInterval(refreshData, interval);

    return () => clearInterval(intervalId);
  }, [url, interval, enabled, conditions, prefetch, options]);
};

export default usePrefetch;