import { useEffect, useCallback, useRef, useMemo, useState } from 'react';
import { usePrefetch, useCriticalDataPrefetch } from './usePrefetch';
import { useServiceWorker } from '../utils/serviceWorker';
import performanceMonitor from '../utils/performanceMonitor';

/**
 * Main performance optimization hook
 */
export const usePerformanceOptimization = (options = {}) => {
  const {
    enablePrefetch = true,
    enableServiceWorker = true,
    enablePerformanceMonitoring = true,
    prefetchRoutes = [],
    criticalData = true
  } = options;

  const { prefetch } = usePrefetch();
  const { isOnline, preloadRoutes } = useServiceWorker();
  
  // Initialize critical data prefetching
  if (criticalData) {
    useCriticalDataPrefetch();
  }

  // Preload routes when online
  useEffect(() => {
    if (enableServiceWorker && isOnline && prefetchRoutes.length > 0) {
      preloadRoutes(prefetchRoutes);
    }
  }, [enableServiceWorker, isOnline, prefetchRoutes, preloadRoutes]);

  // Performance monitoring
  useEffect(() => {
    if (!enablePerformanceMonitoring) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        performanceMonitor.mark('page-visible');
      } else {
        performanceMonitor.mark('page-hidden');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [enablePerformanceMonitoring]);

  return {
    isOnline,
    prefetch: enablePrefetch ? prefetch : () => {},
    performanceMonitor: enablePerformanceMonitoring ? performanceMonitor : null
  };
};

/**
 * Hook for optimizing component rendering
 */
export const useRenderOptimization = (componentName) => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());

  useEffect(() => {
    renderCount.current++;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTime.current;
    lastRenderTime.current = now;

    performanceMonitor.recordMetric(`Component_${componentName}_Render`, timeSinceLastRender, {
      renderCount: renderCount.current
    });
  });

  const measureRender = useCallback((fn) => {
    return performanceMonitor.measureFunction(`${componentName}_Function`, fn);
  }, [componentName]);

  return { measureRender, renderCount: renderCount.current };
};

/**
 * Hook for optimizing expensive calculations
 */
export const useExpensiveCalculation = (calculation, dependencies, componentName) => {
  const calculationTime = useRef(0);

  const memoizedValue = useMemo(() => {
    const startTime = performance.now();
    const result = calculation();
    const endTime = performance.now();
    
    calculationTime.current = endTime - startTime;
    performanceMonitor.recordMetric(`Calculation_${componentName}`, calculationTime.current);
    
    return result;
  }, dependencies);

  return memoizedValue;
};

/**
 * Hook for optimizing API calls with caching and batching
 */
export const useOptimizedAPI = () => {
  const requestCache = useRef(new Map());
  const batchQueue = useRef(new Map());
  const batchTimeout = useRef(null);

  const makeRequest = useCallback(async (url, options = {}) => {
    const cacheKey = `${url}:${JSON.stringify(options)}`;
    
    // Return cached result if available
    if (requestCache.current.has(cacheKey)) {
      const cached = requestCache.current.get(cacheKey);
      if (Date.now() - cached.timestamp < (options.cacheTime || 300000)) { // 5 min default
        return cached.data;
      }
    }

    // Add to batch queue if batching is enabled
    if (options.batch) {
      return new Promise((resolve, reject) => {
        if (!batchQueue.current.has(url)) {
          batchQueue.current.set(url, []);
        }
        
        batchQueue.current.get(url).push({ options, resolve, reject });
        
        // Process batch after short delay
        if (batchTimeout.current) {
          clearTimeout(batchTimeout.current);
        }
        
        batchTimeout.current = setTimeout(() => {
          processBatch(url);
        }, 50);
      });
    }

    // Make individual request
    const timer = performanceMonitor.startTimer(`API_${url}`);
    try {
      const response = await fetch(url, options);
      const data = await response.json();
      
      // Cache successful responses
      requestCache.current.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      
      timer.end();
      return data;
    } catch (error) {
      timer.end();
      throw error;
    }
  }, []);

  const processBatch = useCallback(async (url) => {
    const requests = batchQueue.current.get(url) || [];
    batchQueue.current.delete(url);
    
    if (requests.length === 0) return;

    try {
      // Combine all requests into a single batch request
      const batchOptions = requests.map(req => req.options);
      const response = await fetch(`${url}/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requests: batchOptions })
      });
      
      const results = await response.json();
      
      // Resolve individual promises
      requests.forEach((req, index) => {
        req.resolve(results[index]);
      });
    } catch (error) {
      // Reject all promises
      requests.forEach(req => req.reject(error));
    }
  }, []);

  const clearCache = useCallback(() => {
    requestCache.current.clear();
  }, []);

  return { makeRequest, clearCache };
};

/**
 * Hook for optimizing list rendering with virtualization
 */
export const useVirtualizedList = (items, itemHeight = 50, containerHeight = 400) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(start + visibleCount + 5, items.length); // +5 for buffer
    
    return { start: Math.max(0, start - 5), end }; // -5 for buffer
  }, [scrollTop, itemHeight, containerHeight, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end).map((item, index) => ({
      ...item,
      index: visibleRange.start + index
    }));
  }, [items, visibleRange]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;

  const handleScroll = useCallback((event) => {
    setScrollTop(event.target.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    visibleRange
  };
};

/**
 * Hook for optimizing image loading
 */
export const useImageOptimization = () => {
  const imageCache = useRef(new Map());
  const loadingImages = useRef(new Set());

  const preloadImage = useCallback((src) => {
    if (imageCache.current.has(src) || loadingImages.current.has(src)) {
      return Promise.resolve();
    }

    loadingImages.current.add(src);

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        imageCache.current.set(src, true);
        loadingImages.current.delete(src);
        resolve();
      };
      img.onerror = () => {
        loadingImages.current.delete(src);
        reject(new Error(`Failed to load image: ${src}`));
      };
      img.src = src;
    });
  }, []);

  const preloadImages = useCallback(async (sources) => {
    const promises = sources.map(src => preloadImage(src));
    return Promise.allSettled(promises);
  }, [preloadImage]);

  const isImageCached = useCallback((src) => {
    return imageCache.current.has(src);
  }, []);

  return { preloadImage, preloadImages, isImageCached };
};

/**
 * Hook for debouncing expensive operations
 */
export const useDebounce = (value, delay, callback) => {
  const timeoutRef = useRef(null);
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callbackRef.current(value);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  return value;
};

/**
 * Hook for throttling frequent operations
 */
export const useThrottle = (callback, delay) => {
  const lastRun = useRef(Date.now());
  const timeoutRef = useRef(null);

  const throttledCallback = useCallback((...args) => {
    const now = Date.now();
    
    if (now - lastRun.current >= delay) {
      callback(...args);
      lastRun.current = now;
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args);
        lastRun.current = Date.now();
      }, delay - (now - lastRun.current));
    }
  }, [callback, delay]);

  return throttledCallback;
};

export default usePerformanceOptimization;