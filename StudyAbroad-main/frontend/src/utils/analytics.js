/**
 * Privacy-compliant analytics and user behavior tracking
 */

class AnalyticsManager {
  constructor() {
    this.isEnabled = this.checkAnalyticsConsent();
    this.sessionId = this.generateSessionId();
    this.userId = null;
    this.events = [];
    this.pageViews = [];
    this.userProperties = {};
    
    // Initialize session tracking
    this.initializeSession();
  }

  /**
   * Check if user has consented to analytics
   */
  checkAnalyticsConsent() {
    const consent = localStorage.getItem('analytics_consent');
    return consent === 'granted';
  }

  /**
   * Request analytics consent from user
   */
  requestConsent() {
    return new Promise((resolve) => {
      // In a real implementation, this would show a consent banner
      const consent = window.confirm(
        'We use analytics to improve your experience. ' +
        'No personal data is collected. Allow analytics?'
      );
      
      const consentValue = consent ? 'granted' : 'denied';
      localStorage.setItem('analytics_consent', consentValue);
      this.isEnabled = consent;
      
      resolve(consent);
    });
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Initialize session tracking
   */
  initializeSession() {
    if (!this.isEnabled) return;

    this.sessionStart = new Date();
    this.trackEvent('session_start', {
      session_id: this.sessionId,
      user_agent: navigator.userAgent,
      screen_resolution: `${screen.width}x${screen.height}`,
      viewport_size: `${window.innerWidth}x${window.innerHeight}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language
    });

    // Track session end on page unload
    window.addEventListener('beforeunload', () => {
      this.endSession();
    });

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackEvent('page_hidden');
      } else {
        this.trackEvent('page_visible');
      }
    });
  }

  /**
   * Set user ID for tracking
   */
  setUserId(userId) {
    if (!this.isEnabled) return;
    
    this.userId = userId;
    this.trackEvent('user_identified', { user_id: userId });
  }

  /**
   * Set user properties
   */
  setUserProperties(properties) {
    if (!this.isEnabled) return;
    
    this.userProperties = { ...this.userProperties, ...properties };
    this.trackEvent('user_properties_updated', properties);
  }

  /**
   * Track page view
   */
  trackPageView(path, title = null) {
    if (!this.isEnabled) return;

    const pageView = {
      timestamp: new Date().toISOString(),
      session_id: this.sessionId,
      user_id: this.userId,
      path: path,
      title: title || document.title,
      referrer: document.referrer,
      url: window.location.href
    };

    this.pageViews.push(pageView);
    this.sendEvent('page_view', pageView);
  }

  /**
   * Track custom event
   */
  trackEvent(eventName, properties = {}) {
    if (!this.isEnabled) return;

    const event = {
      timestamp: new Date().toISOString(),
      session_id: this.sessionId,
      user_id: this.userId,
      event_name: eventName,
      properties: {
        ...properties,
        ...this.userProperties
      }
    };

    this.events.push(event);
    this.sendEvent('custom_event', event);
  }

  /**
   * Track user interaction
   */
  trackInteraction(element, action, properties = {}) {
    if (!this.isEnabled) return;

    const interactionData = {
      element_type: element.tagName?.toLowerCase(),
      element_id: element.id,
      element_class: element.className,
      element_text: element.textContent?.substring(0, 100),
      action: action,
      ...properties
    };

    this.trackEvent('user_interaction', interactionData);
  }

  /**
   * Track form submission
   */
  trackFormSubmission(formName, success = true, errors = []) {
    if (!this.isEnabled) return;

    this.trackEvent('form_submission', {
      form_name: formName,
      success: success,
      error_count: errors.length,
      errors: errors
    });
  }

  /**
   * Track search query
   */
  trackSearch(query, results_count = null, filters = {}) {
    if (!this.isEnabled) return;

    this.trackEvent('search', {
      query: query,
      results_count: results_count,
      filters: filters,
      query_length: query.length
    });
  }

  /**
   * Track university interaction
   */
  trackUniversityInteraction(universityId, action, properties = {}) {
    if (!this.isEnabled) return;

    this.trackEvent('university_interaction', {
      university_id: universityId,
      action: action, // view, bookmark, compare, etc.
      ...properties
    });
  }

  /**
   * Track recommendation interaction
   */
  trackRecommendationInteraction(recommendationId, action, properties = {}) {
    if (!this.isEnabled) return;

    this.trackEvent('recommendation_interaction', {
      recommendation_id: recommendationId,
      action: action, // view, click, dismiss, etc.
      ...properties
    });
  }

  /**
   * Track performance metrics
   */
  trackPerformance(metricName, value, unit = 'ms') {
    if (!this.isEnabled) return;

    this.trackEvent('performance_metric', {
      metric_name: metricName,
      value: value,
      unit: unit
    });
  }

  /**
   * Track error
   */
  trackError(error, context = {}) {
    if (!this.isEnabled) return;

    this.trackEvent('error', {
      error_message: error.message,
      error_stack: error.stack,
      error_name: error.name,
      context: context
    });
  }

  /**
   * Track feature usage
   */
  trackFeatureUsage(featureName, properties = {}) {
    if (!this.isEnabled) return;

    this.trackEvent('feature_usage', {
      feature_name: featureName,
      ...properties
    });
  }

  /**
   * End session tracking
   */
  endSession() {
    if (!this.isEnabled) return;

    const sessionDuration = new Date() - this.sessionStart;
    
    this.trackEvent('session_end', {
      session_id: this.sessionId,
      session_duration: sessionDuration,
      page_views: this.pageViews.length,
      events_count: this.events.length
    });

    // Send any remaining events
    this.flush();
  }

  /**
   * Send event to analytics service
   */
  sendEvent(eventType, data) {
    if (!this.isEnabled) return;

    // In a real implementation, this would send to your analytics service
    // For now, we'll just log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics] ${eventType}:`, data);
    }

    // Example of sending to a real analytics service:
    /*
    fetch('/api/analytics/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: eventType,
        data: data
      })
    }).catch(error => {
      console.error('Analytics error:', error);
    });
    */
  }

  /**
   * Flush all pending events
   */
  flush() {
    if (!this.isEnabled) return;

    // Send all pending events
    [...this.events, ...this.pageViews].forEach(event => {
      this.sendEvent(event.event_name || 'page_view', event);
    });

    // Clear local storage
    this.events = [];
    this.pageViews = [];
  }

  /**
   * Get analytics summary
   */
  getAnalyticsSummary() {
    if (!this.isEnabled) return null;

    return {
      session_id: this.sessionId,
      user_id: this.userId,
      session_duration: new Date() - this.sessionStart,
      page_views: this.pageViews.length,
      events_count: this.events.length,
      user_properties: this.userProperties
    };
  }

  /**
   * Disable analytics
   */
  disable() {
    this.isEnabled = false;
    localStorage.setItem('analytics_consent', 'denied');
    this.events = [];
    this.pageViews = [];
  }

  /**
   * Enable analytics
   */
  enable() {
    this.isEnabled = true;
    localStorage.setItem('analytics_consent', 'granted');
    this.initializeSession();
  }
}

// Create global analytics instance
const analytics = new AnalyticsManager();

// React hook for analytics
export const useAnalytics = () => {
  const trackPageView = (path, title) => {
    analytics.trackPageView(path, title);
  };

  const trackEvent = (eventName, properties) => {
    analytics.trackEvent(eventName, properties);
  };

  const trackInteraction = (element, action, properties) => {
    analytics.trackInteraction(element, action, properties);
  };

  const trackFormSubmission = (formName, success, errors) => {
    analytics.trackFormSubmission(formName, success, errors);
  };

  const trackSearch = (query, resultsCount, filters) => {
    analytics.trackSearch(query, resultsCount, filters);
  };

  const trackUniversityInteraction = (universityId, action, properties) => {
    analytics.trackUniversityInteraction(universityId, action, properties);
  };

  const trackRecommendationInteraction = (recommendationId, action, properties) => {
    analytics.trackRecommendationInteraction(recommendationId, action, properties);
  };

  const trackFeatureUsage = (featureName, properties) => {
    analytics.trackFeatureUsage(featureName, properties);
  };

  const trackError = (error, context) => {
    analytics.trackError(error, context);
  };

  const setUserId = (userId) => {
    analytics.setUserId(userId);
  };

  const setUserProperties = (properties) => {
    analytics.setUserProperties(properties);
  };

  return {
    trackPageView,
    trackEvent,
    trackInteraction,
    trackFormSubmission,
    trackSearch,
    trackUniversityInteraction,
    trackRecommendationInteraction,
    trackFeatureUsage,
    trackError,
    setUserId,
    setUserProperties,
    isEnabled: analytics.isEnabled
  };
};

// Auto-track page views for React Router
export const AnalyticsPageTracker = ({ children }) => {
  const { trackPageView } = useAnalytics();
  const location = useLocation();

  React.useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location, trackPageView]);

  return children;
};

// Higher-order component for tracking interactions
export const withAnalytics = (Component, eventName) => {
  return React.forwardRef((props, ref) => {
    const { trackEvent } = useAnalytics();

    const handleInteraction = (originalHandler) => {
      return (...args) => {
        trackEvent(eventName, { component: Component.name });
        if (originalHandler) {
          originalHandler(...args);
        }
      };
    };

    const enhancedProps = {
      ...props,
      onClick: handleInteraction(props.onClick),
      onSubmit: handleInteraction(props.onSubmit),
      onChange: handleInteraction(props.onChange)
    };

    return <Component {...enhancedProps} ref={ref} />;
  });
};

// Performance tracking utilities
export const trackPageLoadTime = () => {
  if (window.performance && window.performance.timing) {
    const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
    analytics.trackPerformance('page_load_time', loadTime);
  }
};

export const trackAPICallTime = (apiName, startTime) => {
  const endTime = performance.now();
  const duration = endTime - startTime;
  analytics.trackPerformance(`api_call_${apiName}`, duration);
};

// Consent management
export const requestAnalyticsConsent = () => {
  return analytics.requestConsent();
};

export const hasAnalyticsConsent = () => {
  return analytics.isEnabled;
};

export const revokeAnalyticsConsent = () => {
  analytics.disable();
};

export default analytics;