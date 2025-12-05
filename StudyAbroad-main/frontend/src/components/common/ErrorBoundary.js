import React from 'react';
import { logError } from '../../utils/errorHandler';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error for monitoring
    logError(error, { 
      errorInfo,
      component: this.props.name || 'Unknown',
      props: this.props
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry);
      }

      // Default error UI
      return (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          margin: '1rem'
        }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: '1rem'
          }}>
            😵
          </div>
          <h2 style={{
            color: '#dc3545',
            marginBottom: '1rem',
            fontSize: '1.5rem'
          }}>
            Oops! Something went wrong
          </h2>
          <p style={{
            color: '#6c757d',
            marginBottom: '1.5rem',
            maxWidth: '500px',
            margin: '0 auto 1.5rem'
          }}>
            {this.props.message || 
             'We encountered an unexpected error. Please try again or refresh the page.'}
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              onClick={this.handleRetry}
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#0056b3'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#007bff'}
            >
              Try Again
            </button>
            
            <button
              onClick={this.handleReload}
              style={{
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#545b62'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#6c757d'}
            >
              Refresh Page
            </button>
          </div>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{
              marginTop: '2rem',
              textAlign: 'left',
              backgroundColor: '#fff',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              padding: '1rem'
            }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '1rem' }}>
                Error Details (Development Only)
              </summary>
              <pre style={{
                fontSize: '0.8rem',
                color: '#dc3545',
                overflow: 'auto',
                backgroundColor: '#f8f9fa',
                padding: '1rem',
                borderRadius: '4px',
                border: '1px solid #dee2e6'
              }}>
                {this.state.error.toString()}
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for wrapping components with error boundary
export const withErrorBoundary = (Component, errorBoundaryProps = {}) => {
  const WrappedComponent = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Hook for handling errors in functional components
export const useErrorHandler = () => {
  const [error, setError] = React.useState(null);

  const handleError = React.useCallback((error) => {
    logError(error);
    setError(error);
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  // Throw error to be caught by error boundary
  if (error) {
    throw error;
  }

  return { handleError, clearError };
};

export default ErrorBoundary;