import React from 'react';

const LoadingSpinner = ({ 
  size = 'medium', 
  color = '#007bff', 
  message = 'Loading...', 
  showMessage = true,
  overlay = false,
  className = ''
}) => {
  const sizeMap = {
    small: '20px',
    medium: '40px',
    large: '60px'
  };

  const spinnerSize = sizeMap[size] || sizeMap.medium;

  const spinnerStyle = {
    width: spinnerSize,
    height: spinnerSize,
    border: `3px solid rgba(${hexToRgb(color)}, 0.1)`,
    borderTop: `3px solid ${color}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  };

  const overlayStyle = overlay ? {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    backdropFilter: 'blur(2px)'
  } : {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '2rem'
  };

  return (
    <div className={`loading-spinner ${className}`} style={overlayStyle}>
      <div style={spinnerStyle}></div>
      {showMessage && (
        <p style={{
          marginTop: '1rem',
          color: '#6c757d',
          fontSize: '0.9rem',
          fontWeight: '500'
        }}>
          {message}
        </p>
      )}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// Helper function to convert hex to rgb
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result 
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '0, 123, 255';
}

export default LoadingSpinner;