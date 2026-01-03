import React from 'react';
import ReactDOM from 'react-dom/client';
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';
import './styles/index.css';
import App from './App';
import performanceMonitor from './utils/performanceMonitor';

// Initialize performance monitoring
performanceMonitor.mark('app-start');

// Measure Web Vitals
function sendToAnalytics(metric) {
  // In production, send to your analytics service
  if (process.env.NODE_ENV === 'development') {
    console.log('Web Vital:', metric);
  }
  
  // Record in our performance monitor
  performanceMonitor.recordMetric(metric.name, metric.value, {
    id: metric.id,
    delta: metric.delta,
    rating: metric.rating
  });
}

// Register Web Vitals
getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);

// Preload critical resources
const preloadCriticalResources = () => {
  // Preload fonts
  const fontLink = document.createElement('link');
  fontLink.rel = 'preload';
  fontLink.href = '/fonts/main.woff2';
  fontLink.as = 'font';
  fontLink.type = 'font/woff2';
  fontLink.crossOrigin = 'anonymous';
  document.head.appendChild(fontLink);

  // Preload critical API endpoints
  const apiLink = document.createElement('link');
  apiLink.rel = 'dns-prefetch';
  apiLink.href = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  document.head.appendChild(apiLink);
};

// Initialize app
const initializeApp = () => {
  performanceMonitor.mark('react-render-start');
  
  const root = ReactDOM.createRoot(document.getElementById('root'));
  
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  
  performanceMonitor.mark('react-render-end');
  performanceMonitor.measure('react-render-time', 'react-render-start', 'react-render-end');
};

// Optimize initial loading
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    preloadCriticalResources();
    initializeApp();
  });
} else {
  preloadCriticalResources();
  initializeApp();
}

// Handle performance warnings
window.addEventListener('performanceWarning', (event) => {
  const { metric, value, threshold } = event.detail;
  console.warn(`Performance Warning: ${metric} (${value}ms) exceeded threshold (${threshold}ms)`);
  
  // In production, you might want to send this to your monitoring service
  if (process.env.NODE_ENV === 'production') {
    // sendToMonitoringService({ type: 'performance_warning', metric, value, threshold });
  }
});

// Report final performance metrics when page is fully loaded
window.addEventListener('load', () => {
  performanceMonitor.mark('page-load-complete');
  
  // Generate performance report after a short delay to capture all metrics
  setTimeout(() => {
    const report = performanceMonitor.getPerformanceReport();
    console.log('Performance Report:', report);
    
    // In production, send report to analytics
    if (process.env.NODE_ENV === 'production') {
      // sendPerformanceReport(report);
    }
  }, 1000);
});