import React, { memo, Suspense, lazy } from 'react';
import ErrorBoundary from './ErrorBoundary';
import LoadingSpinner from './LoadingSpinner';
import { useRenderOptimization } from '../../hooks/usePerformanceOptimization';

/**
 * Higher-order component for performance optimization
 */
export const withPerformanceOptimization = (Component, options = {}) => {
  const {
    displayName,
    memoize = true,
    errorBoundary = true,
    suspense = false,
    loadingComponent = null,
    errorFallback = null
  } = options;

  const OptimizedComponent = memo((props) => {
    const { measureRender } = useRenderOptimization(displayName || Component.name);

    const renderComponent = measureRender(() => (
      <Component {...props} />
    ));

    if (suspense) {
      return (
        <Suspense fallback={loadingComponent || <LoadingSpinner />}>
          {renderComponent}
        </Suspense>
      );
    }

    return renderComponent;
  });

  OptimizedComponent.displayName = `withPerformanceOptimization(${displayName || Component.displayName || Component.name})`;

  if (errorBoundary) {
    return (props) => (
      <ErrorBoundary fallback={errorFallback}>
        <OptimizedComponent {...props} />
      </ErrorBoundary>
    );
  }

  return memoize ? OptimizedComponent : (props) => <OptimizedComponent {...props} />;
};

/**
 * Performance wrapper component
 */
const PerformanceWrapper = ({
  children,
  name = 'Component',
  enableErrorBoundary = true,
  enableSuspense = false,
  loadingComponent = null,
  errorFallback = null,
  memoize = false,
  ...props
}) => {
  const { measureRender } = useRenderOptimization(name);

  const renderChildren = measureRender(() => children);

  let wrappedChildren = renderChildren;

  if (enableSuspense) {
    wrappedChildren = (
      <Suspense fallback={loadingComponent || <LoadingSpinner />}>
        {wrappedChildren}
      </Suspense>
    );
  }

  if (enableErrorBoundary) {
    wrappedChildren = (
      <ErrorBoundary fallback={errorFallback} name={name}>
        {wrappedChildren}
      </ErrorBoundary>
    );
  }

  return wrappedChildren;
};

/**
 * Lazy loading wrapper with performance optimization
 */
export const LazyComponent = ({ 
  importFunc, 
  fallback = <LoadingSpinner />,
  errorFallback = null,
  ...props 
}) => {
  const Component = lazy(importFunc);
  
  return (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={fallback}>
        <Component {...props} />
      </Suspense>
    </ErrorBoundary>
  );
};

/**
 * Intersection observer wrapper for lazy loading components
 */
export const LazyLoadOnVisible = ({
  children,
  fallback = <div style={{ height: '200px' }} />,
  rootMargin = '50px',
  threshold = 0.1,
  triggerOnce = true
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [hasBeenVisible, setHasBeenVisible] = React.useState(false);
  const elementRef = React.useRef(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting;
        setIsVisible(visible);
        
        if (visible && !hasBeenVisible) {
          setHasBeenVisible(true);
        }
      },
      { rootMargin, threshold }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [rootMargin, threshold, hasBeenVisible]);

  const shouldRender = triggerOnce ? hasBeenVisible : isVisible;

  return (
    <div ref={elementRef}>
      {shouldRender ? children : fallback}
    </div>
  );
};

/**
 * Component for measuring and displaying performance metrics
 */
export const PerformanceMonitor = ({ 
  showInDevelopment = true,
  position = 'bottom-right',
  style = {}
}) => {
  const [metrics, setMetrics] = React.useState({});
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    if (process.env.NODE_ENV !== 'development' && showInDevelopment) {
      return;
    }

    const updateMetrics = () => {
      // Get performance metrics from the performance monitor
      const performanceEntries = performance.getEntriesByType('measure');
      const newMetrics = {};
      
      performanceEntries.forEach(entry => {
        newMetrics[entry.name] = {
          duration: Math.round(entry.duration * 100) / 100,
          startTime: Math.round(entry.startTime * 100) / 100
        };
      });
      
      setMetrics(newMetrics);
    };

    const interval = setInterval(updateMetrics, 2000);
    updateMetrics();

    return () => clearInterval(interval);
  }, [showInDevelopment]);

  if (process.env.NODE_ENV !== 'development' && showInDevelopment) {
    return null;
  }

  const positionStyles = {
    'top-left': { top: '20px', left: '20px' },
    'top-right': { top: '20px', right: '20px' },
    'bottom-left': { bottom: '20px', left: '20px' },
    'bottom-right': { bottom: '20px', right: '20px' }
  };

  return (
    <div
      style={{
        position: 'fixed',
        ...positionStyles[position],
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '8px',
        fontSize: '12px',
        fontFamily: 'monospace',
        zIndex: 9999,
        maxWidth: '300px',
        maxHeight: isVisible ? '400px' : '30px',
        overflow: 'hidden',
        transition: 'max-height 0.3s ease',
        cursor: 'pointer',
        ...style
      }}
      onClick={() => setIsVisible(!isVisible)}
    >
      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
        Performance Monitor {isVisible ? '▼' : '▶'}
      </div>
      
      {isVisible && (
        <div>
          {Object.entries(metrics).map(([name, data]) => (
            <div key={name} style={{ marginBottom: '3px' }}>
              <strong>{name}:</strong> {data.duration}ms
            </div>
          ))}
          
          {Object.keys(metrics).length === 0 && (
            <div style={{ opacity: 0.7 }}>No metrics available</div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Bundle size analyzer component (development only)
 */
export const BundleAnalyzer = () => {
  const [bundleInfo, setBundleInfo] = React.useState(null);

  React.useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    // Estimate bundle size based on loaded resources
    const resources = performance.getEntriesByType('resource');
    const jsResources = resources.filter(r => r.name.includes('.js'));
    const cssResources = resources.filter(r => r.name.includes('.css'));
    
    const totalJSSize = jsResources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
    const totalCSSSize = cssResources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
    
    setBundleInfo({
      jsSize: Math.round(totalJSSize / 1024),
      cssSize: Math.round(totalCSSSize / 1024),
      jsFiles: jsResources.length,
      cssFiles: cssResources.length
    });
  }, []);

  if (process.env.NODE_ENV !== 'development' || !bundleInfo) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: 'rgba(0, 123, 255, 0.9)',
      color: 'white',
      padding: '8px 16px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 'bold',
      zIndex: 9999
    }}>
      Bundle: {bundleInfo.jsSize}KB JS ({bundleInfo.jsFiles} files) + {bundleInfo.cssSize}KB CSS ({bundleInfo.cssFiles} files)
    </div>
  );
};

export default PerformanceWrapper;