import React from 'react';

const ErrorMessage = ({ 
  message, 
  onRetry, 
  showRetry = true, 
  type = 'error',
  className = '' 
}) => {
  const typeClasses = {
    error: 'error-message-error',
    warning: 'error-message-warning',
    info: 'error-message-info'
  };

  const typeIcons = {
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  return (
    <div className={`error-message ${typeClasses[type]} ${className}`}>
      <div className="error-content">
        <span className="error-icon">{typeIcons[type]}</span>
        <div className="error-text">
          <div className="error-title">
            {type === 'error' ? 'Error' : type === 'warning' ? 'Warning' : 'Information'}
          </div>
          <div className="error-description">{message}</div>
        </div>
      </div>
      
      {showRetry && onRetry && (
        <div className="error-actions">
          <button className="retry-btn" onClick={onRetry}>
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default ErrorMessage;