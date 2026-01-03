/**
 * Performance monitoring and optimization utilities
 */
import React from 'react';

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = new Map();
    this.thresholds = {
      LCP: 2500, // Largest Contentful Paint
      FID: 100,  // First Input Delay
      CLS: 0.1,  // Cumulative Layout Shift
      FCP: 1800, // First Contentful Paint
      TTFB: 800  // Time to First Byte
    };
    this.initialize();
  }

  initialize() {
    if (typeof window !== 'undefined') {
      this.setupWebVitals();
      this.setupResourceObserver();
      this.setupNavigationObserver();
      this.setupLongTaskObserver();
    }
  }

  // Setup Web Vitals monitoring
  setupWebVitals() {
    // Largest Contentful Paint
    this.observeMetric('largest-contentful-paint', (entries) => {
      const lastEntry = entries[entries.length - 1];
      this.recordMetric('LCP', lastEntry.startTime, {
        element: lastEntry.element,
        url: lastEntry.url
      });
    });

    // First Input Delay
    this.observeMetric('first-input', (entries) => {
      const firstEntry = entries[0];
      this.recordMetric('FID', firstEntry.processingStart - firstEntry.startTime, {
        eventType: firstEntry.name,
        target: firstEntry.target
      });
    });

    // Cumulative Layout Shift
    this.observeMetric('layout-shift', (entries) => {
      let clsValue = 0;
      for (const entry of entries) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      this.recordMetric('CLS', clsValue);
    });

    // First Contentful Paint
    this.observeMetric('paint', (entries) => {
      for (const entry of entries) {
        if (entry.name === 'first-contentful-paint') {
          this.recordMetric('FCP', entry.startTime);
        }
      }
    });
  }

  // Setup resource loading observer
  setupResourceObserver() {
    this.observeMetric('resource', (entries) => {
      for (const entry of entries) {
        this.recordResourceMetric(entry);
      }
    });
  }

  // Setup navigation timing observer
  setupNavigationObserver() {
    this.observeMetric('navigation', (entries) => {
      for (const entry of entries) {
        this.recordNavigationMetric(entry);
      }
    });
  }

  // Setup long task observer
  setupLongTaskObserver() {
    this.observeMetric('longtask', (entries) => {
      for (const entry of entries) {
        this.recordMetric('LongTask', entry.duration, {
          startTime: entry.startTime,
          attribution: entry.attribution
        });
      }
    });
  }

  // Generic metric observer
  observeMetric(type, callback) {
    try {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries());
      });
      observer.observe({ type, buffered: true });
      this.observers.set(type, observer);
    } catch (error) {
      console.warn(`Failed to observe ${type}:`, error);
    }
  }

  // Record a performance metric
  recordMetric(name, value, metadata = {}) {
    const metric = {
      name,
      value,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      connection: this.getConnectionInfo(),
      ...metadata
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name).push(metric);

    // Check against thresholds
    this.checkThreshold(name, value);

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance Metric - ${name}:`, value, metadata);
    }

    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(metric);
    }
  }

  // Record resource loading metrics
  recordResourceMetric(entry) {
    const resourceMetric = {
      name: entry.name,
      type: entry.initiatorType,
      size: entry.transferSize,
      duration: entry.duration,
      startTime: entry.startTime,
      dns: entry.domainLookupEnd - entry.domainLookupStart,
      tcp: entry.connectEnd - entry.connectStart,
      ssl: entry.secureConnectionStart > 0 ? entry.connectEnd - entry.secureConnectionStart : 0,
      ttfb: entry.responseStart - entry.requestStart,
      download: entry.responseEnd - entry.responseStart
    };

    this.recordMetric('Resource', resourceMetric.duration, resourceMetric);
  }

  // Record navigation timing metrics
  recordNavigationMetric(entry) {
    const navigationMetric = {
      dns: entry.domainLookupEnd - entry.domainLookupStart,
      tcp: entry.connectEnd - entry.connectStart,
      ssl: entry.secureConnectionStart > 0 ? entry.connectEnd - entry.secureConnectionStart : 0,
      ttfb: entry.responseStart - entry.requestStart,
      download: entry.responseEnd - entry.responseStart,
      domParsing: entry.domContentLoadedEventStart - entry.responseEnd,
      domReady: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
      windowLoad: entry.loadEventEnd - entry.loadEventStart,
      totalTime: entry.loadEventEnd - entry.navigationStart
    };

    this.recordMetric('Navigation', navigationMetric.totalTime, navigationMetric);
    this.recordMetric('TTFB', navigationMetric.ttfb);
  }

  // Check if metric exceeds threshold
  checkThreshold(name, value) {
    const threshold = this.thresholds[name];
    if (threshold && value > threshold) {
      console.warn(`Performance threshold exceeded for ${name}: ${value} > ${threshold}`);
      
      // Trigger performance warning event
      window.dispatchEvent(new CustomEvent('performanceWarning', {
        detail: { metric: name, value, threshold }
      }));
    }
  }

  // Get connection information
  getConnectionInfo() {
    if ('connection' in navigator) {
      const conn = navigator.connection;
      return {
        effectiveType: conn.effectiveType,
        downlink: conn.downlink,
        rtt: conn.rtt,
        saveData: conn.saveData
      };
    }
    return null;
  }

  // Send metrics to analytics service
  sendToAnalytics(metric) {
    // In a real application, you would send this to your analytics service
    // Example: Google Analytics, DataDog, New Relic, etc.
    if (window.gtag) {
      window.gtag('event', 'performance_metric', {
        metric_name: metric.name,
        metric_value: metric.value,
        custom_map: { metric_name: 'metric_name' }
      });
    }
  }

  // Get all recorded metrics
  getMetrics(name = null) {
    if (name) {
      return this.metrics.get(name) || [];
    }
    return Object.fromEntries(this.metrics);
  }

  // Get metric statistics
  getMetricStats(name) {
    const metrics = this.metrics.get(name);
    if (!metrics || metrics.length === 0) {
      return null;
    }

    const values = metrics.map(m => m.value);
    values.sort((a, b) => a - b);

    return {
      count: values.length,
      min: values[0],
      max: values[values.length - 1],
      mean: values.reduce((sum, val) => sum + val, 0) / values.length,
      median: values[Math.floor(values.length / 2)],
      p75: values[Math.floor(values.length * 0.75)],
      p90: values[Math.floor(values.length * 0.90)],
      p95: values[Math.floor(values.length * 0.95)]
    };
  }

  // Clear metrics
  clearMetrics(name = null) {
    if (name) {
      this.metrics.delete(name);
    } else {
      this.metrics.clear();
    }
  }

  // Measure function execution time
  measureFunction(name, fn) {
    return (...args) => {
      const startTime = performance.now();
      const result = fn.apply(this, args);
      const endTime = performance.now();
      
      this.recordMetric(`Function_${name}`, endTime - startTime);
      
      return result;
    };
  }

  // Measure async function execution time
  measureAsyncFunction(name, fn) {
    return async (...args) => {
      const startTime = performance.now();
      const result = await fn.apply(this, args);
      const endTime = performance.now();
      
      this.recordMetric(`AsyncFunction_${name}`, endTime - startTime);
      
      return result;
    };
  }

  // Start a custom timer
  startTimer(name) {
    const startTime = performance.now();
    return {
      end: () => {
        const endTime = performance.now();
        this.recordMetric(`Timer_${name}`, endTime - startTime);
        return endTime - startTime;
      }
    };
  }

  // Mark a custom event
  mark(name, metadata = {}) {
    performance.mark(name);
    this.recordMetric(`Mark_${name}`, performance.now(), metadata);
  }

  // Measure between two marks
  measure(name, startMark, endMark) {
    performance.measure(name, startMark, endMark);
    const measure = performance.getEntriesByName(name, 'measure')[0];
    this.recordMetric(`Measure_${name}`, measure.duration);
  }

  // Get performance report
  getPerformanceReport() {
    const report = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      connection: this.getConnectionInfo(),
      metrics: {}
    };

    for (const [name, metrics] of this.metrics.entries()) {
      report.metrics[name] = this.getMetricStats(name);
    }

    return report;
  }

  // Disconnect all observers
  disconnect() {
    for (const observer of this.observers.values()) {
      observer.disconnect();
    }
    this.observers.clear();
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

// React hook for performance monitoring
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = React.useState({});

  React.useEffect(() => {
    const updateMetrics = () => {
      setMetrics(performanceMonitor.getMetrics());
    };

    // Update metrics periodically
    const interval = setInterval(updateMetrics, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const measureFunction = React.useCallback((name, fn) => {
    return performanceMonitor.measureFunction(name, fn);
  }, []);

  const measureAsyncFunction = React.useCallback((name, fn) => {
    return performanceMonitor.measureAsyncFunction(name, fn);
  }, []);

  const startTimer = React.useCallback((name) => {
    return performanceMonitor.startTimer(name);
  }, []);

  const mark = React.useCallback((name, metadata) => {
    performanceMonitor.mark(name, metadata);
  }, []);

  return {
    metrics,
    measureFunction,
    measureAsyncFunction,
    startTimer,
    mark,
    getReport: () => performanceMonitor.getPerformanceReport()
  };
}

// Performance optimization utilities
export const performanceUtils = {
  // Debounce function calls
  debounce(func, wait, immediate = false) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        timeout = null;
        if (!immediate) func(...args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func(...args);
    };
  },

  // Throttle function calls
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Lazy load images
  lazyLoadImage(img, src) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.src = src;
          observer.unobserve(entry.target);
        }
      });
    });
    observer.observe(img);
  },

  // Preload critical resources
  preloadResource(href, as, type = null) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    if (type) link.type = type;
    document.head.appendChild(link);
  },

  // Prefetch resources
  prefetchResource(href) {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
  }
};

export default performanceMonitor;