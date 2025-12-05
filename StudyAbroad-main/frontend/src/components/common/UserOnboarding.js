import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const UserOnboarding = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const onboardingSteps = [
    {
      id: 'welcome',
      title: 'Welcome to StudyAbroad! 🎓',
      content: 'We\'re excited to help you find your perfect university. Let\'s get you started with a quick tour.',
      icon: '👋',
      action: 'Get Started',
      position: 'center'
    },
    {
      id: 'profile',
      title: 'Complete Your Profile',
      content: 'Add your academic information (CGPA, test scores) to get personalized university recommendations.',
      icon: '📝',
      action: 'Go to Profile',
      position: 'center',
      actionCallback: () => navigate('/profile')
    },
    {
      id: 'search',
      title: 'Explore Universities',
      content: 'Use our advanced search to find universities that match your preferences and requirements.',
      icon: '🔍',
      action: 'Start Searching',
      position: 'top-right',
      target: '.nav-link[href="/search"]',
      actionCallback: () => navigate('/search')
    },
    {
      id: 'recommendations',
      title: 'Get AI Recommendations',
      content: 'Our AI analyzes your profile to suggest universities where you have the best chances of admission.',
      icon: '⭐',
      action: 'View Recommendations',
      position: 'top-right',
      target: '.nav-link[href="/recommendations"]',
      actionCallback: () => navigate('/recommendations')
    },
    {
      id: 'bookmarks',
      title: 'Save Your Favorites',
      content: 'Bookmark universities you\'re interested in and compare them side by side.',
      icon: '📚',
      action: 'See Bookmarks',
      position: 'top-right',
      target: '.nav-link[href="/bookmarks"]',
      actionCallback: () => navigate('/bookmarks')
    },
    {
      id: 'complete',
      title: 'You\'re All Set! 🚀',
      content: 'You now know the basics. Start exploring and find your dream university!',
      icon: '✅',
      action: 'Start Exploring',
      position: 'center'
    }
  ];

  useEffect(() => {
    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem('onboarding_completed');
    const isNewUser = user && !hasCompletedOnboarding;
    
    if (isNewUser) {
      setIsVisible(true);
    }
  }, [user]);

  const handleNext = () => {
    const step = onboardingSteps[currentStep];
    
    if (step.actionCallback) {
      step.actionCallback();
    }
    
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('onboarding_completed', 'true');
    setIsVisible(false);
    if (onComplete) {
      onComplete();
    }
  };

  const handleSkip = () => {
    localStorage.setItem('onboarding_completed', 'true');
    setIsVisible(false);
    if (onSkip) {
      onSkip();
    }
  };

  const getTooltipPosition = (position, target) => {
    if (!target || position === 'center') {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10001
      };
    }

    const element = document.querySelector(target);
    if (!element) {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10001
      };
    }

    const rect = element.getBoundingClientRect();
    const tooltipWidth = 320;
    const tooltipHeight = 200;

    switch (position) {
      case 'top-right':
        return {
          position: 'fixed',
          top: rect.bottom + 10,
          left: Math.min(rect.left, window.innerWidth - tooltipWidth - 20),
          zIndex: 10001
        };
      case 'top-left':
        return {
          position: 'fixed',
          top: rect.bottom + 10,
          right: window.innerWidth - rect.right,
          zIndex: 10001
        };
      case 'bottom-right':
        return {
          position: 'fixed',
          bottom: window.innerHeight - rect.top + 10,
          left: Math.min(rect.left, window.innerWidth - tooltipWidth - 20),
          zIndex: 10001
        };
      default:
        return {
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10001
        };
    }
  };

  if (!isVisible) return null;

  const currentStepData = onboardingSteps[currentStep];
  const tooltipStyle = getTooltipPosition(currentStepData.position, currentStepData.target);

  return (
    <>
      {/* Overlay */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 10000,
          animation: 'fadeIn 0.3s ease-out'
        }}
        onClick={handleSkip}
      />

      {/* Spotlight effect for targeted elements */}
      {currentStepData.target && (
        <style>
          {`
            ${currentStepData.target} {
              position: relative;
              z-index: 10001;
              box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.7);
              border-radius: 8px;
            }
          `}
        </style>
      )}

      {/* Onboarding Tooltip */}
      <div
        style={{
          ...tooltipStyle,
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '320px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
          animation: 'slideIn 0.3s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <div style={{
            fontSize: '2rem',
            marginRight: '12px'
          }}>
            {currentStepData.icon}
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{
              margin: 0,
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#1f2937'
            }}>
              {currentStepData.title}
            </h3>
          </div>
          <button
            onClick={handleSkip}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '4px'
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <p style={{
          margin: '0 0 20px 0',
          color: '#4b5563',
          lineHeight: '1.5',
          fontSize: '0.95rem'
        }}>
          {currentStepData.content}
        </p>

        {/* Progress */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <div style={{
            flex: 1,
            height: '4px',
            backgroundColor: '#e5e7eb',
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              backgroundColor: '#3b82f6',
              width: `${((currentStep + 1) / onboardingSteps.length) * 100}%`,
              transition: 'width 0.3s ease'
            }} />
          </div>
          <span style={{
            marginLeft: '12px',
            fontSize: '0.875rem',
            color: '#6b7280'
          }}>
            {currentStep + 1} of {onboardingSteps.length}
          </span>
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                style={{
                  background: 'none',
                  border: '1px solid #d1d5db',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  color: '#374151'
                }}
              >
                Previous
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleSkip}
              style={{
                background: 'none',
                border: 'none',
                padding: '8px 16px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                color: '#6b7280'
              }}
            >
              Skip Tour
            </button>
            
            <button
              onClick={handleNext}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              {currentStep === onboardingSteps.length - 1 ? 'Finish' : currentStepData.action}
            </button>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes slideIn {
            from { 
              opacity: 0; 
              transform: translate(-50%, -50%) scale(0.9);
            }
            to { 
              opacity: 1; 
              transform: translate(-50%, -50%) scale(1);
            }
          }
        `}
      </style>
    </>
  );
};

// Hook for managing onboarding state
export const useOnboarding = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem('onboarding_completed');
    const isNewUser = user && !hasCompletedOnboarding;
    
    if (isNewUser) {
      // Delay showing onboarding to let the page load
      setTimeout(() => setShowOnboarding(true), 1000);
    }
  }, [user]);

  const startOnboarding = () => {
    localStorage.removeItem('onboarding_completed');
    setShowOnboarding(true);
  };

  const completeOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('onboarding_completed', 'true');
  };

  return {
    showOnboarding,
    startOnboarding,
    completeOnboarding,
    setShowOnboarding
  };
};

// Onboarding trigger component for help menu
export const OnboardingTrigger = () => {
  const { startOnboarding } = useOnboarding();

  return (
    <button
      onClick={startOnboarding}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: 'none',
        border: 'none',
        padding: '8px 12px',
        cursor: 'pointer',
        fontSize: '0.875rem',
        color: '#374151',
        borderRadius: '6px',
        transition: 'background-color 0.2s'
      }}
      onMouseEnter={(e) => {
        e.target.style.backgroundColor = '#f3f4f6';
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = 'transparent';
      }}
    >
      <span>🎯</span>
      Take Product Tour
    </button>
  );
};

export default UserOnboarding;