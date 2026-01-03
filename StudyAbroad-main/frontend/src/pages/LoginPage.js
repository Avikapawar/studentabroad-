import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const result = await login(formData);
      if (result.success) {
        navigate('/recommendations');
      } else {
        setErrors({
          general: result.error || 'Login failed. Please check your credentials and try again.'
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({
        general: error.response?.data?.message || 'Login failed. Please check your credentials and try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const styles = {
    authPage: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'linear-gradient(135deg, #ffffffff)',
      position: 'relative',
      overflow: 'hidden'
    },
    backgroundBlob1: {
      position: 'absolute',
      top: '-10%',
      right: '-5%',
      width: '500px',
      height: '500px',
      background: 'rgba(29, 25, 25, 0.1)',
      borderRadius: '50%',
      filter: 'blur(80px)',
      animation: 'float 6s ease-in-out infinite'
    },
    backgroundBlob2: {
      position: 'absolute',
      bottom: '-10%',
      left: '-5%',
      width: '400px',
      height: '400px',
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '50%',
      filter: 'blur(80px)',
      animation: 'float 8s ease-in-out infinite reverse'
    },
    authForm: {
      backgroundColor: 'white',
      borderRadius: '24px',
      padding: '3rem',
      maxWidth: '480px',
      width: '100%',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      position: 'relative',
      zIndex: 1,
      transition: 'transform 0.3s ease, box-shadow 0.3s ease'
    },
    iconContainer: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '64px',
      height: '64px',
      background: 'linear-gradient(135deg, #ffffffff 0%)',
      borderRadius: '16px',
      marginBottom: '1rem',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      cursor: 'pointer',
      // boxShadow: '0 8px 16px rgba(102, 126, 234, 0.3)'
    },
    formInput: {
      width: '100%',
      padding: '0.875rem',
      border: '2px solid #e9ecef',
      borderRadius: '12px',
      fontSize: '1rem',
      transition: 'all 0.3s ease',
      outline: 'none',
      backgroundColor: '#f8f9fa'
    },
    inputIcon: {
      position: 'absolute',
      left: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      fontSize: '1.2rem',
      transition: 'transform 0.3s ease'
    },
    toggleButton: {
      position: 'absolute',
      right: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: '1.2rem',
      transition: 'transform 0.2s ease',
      opacity: 0.6
    },
    forgotButton: {
      background: 'none',
      border: 'none',
      color: '#0a0b0cff',
      fontSize: '0.875rem',
      cursor: 'pointer',
      textDecoration: 'none',
      transition: 'all 0.3s ease',
      fontWeight: 500
    },
    checkbox: {
      width: '18px',
      height: '18px',
      marginRight: '0.5rem',
      cursor: 'pointer',
      accentColor: '#e3e5efff',
      transition: 'transform 0.2s ease'
    },
    primaryButton: {
      width: '100%',
      padding: '1rem',
      background: 'linear-gradient(135deg, #667eea )',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontSize: '1rem',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      // boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
      marginBottom: '1.5rem'
    },
    outlineButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      padding: '0.875rem',
      backgroundColor: 'white',
      border: '2px solid #e9ecef',
      borderRadius: '12px',
      fontSize: '0.95rem',
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      color: '#495057'
    },
    divider: {
      position: 'relative',
      margin: '1.5rem 0',
      textAlign: 'center',
      borderTop: '1px solid #dee2e6',
      paddingTop: '1.5rem'
    },
    dividerText: {
      position: 'absolute',
      top: '-10px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: 'white',
      padding: '0 1rem',
      fontSize: '0.875rem',
      color: '#666'
    },
    link: {
      color: '#667eea',
      textDecoration: 'none',
      fontWeight: 600,
      transition: 'all 0.3s ease'
    },
    termsButton: {
      background: 'none',
      border: 'none',
      color: '#667eea',
      textDecoration: 'underline',
      cursor: 'pointer',
      transition: 'color 0.3s ease',
      fontWeight: 500
    }
  };

  return (
    <div style={styles.authPage}>
      {/* Animated Background Blobs */}
      <div style={styles.backgroundBlob1}></div>
      <div style={styles.backgroundBlob2}></div>

      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>

      <form 
        style={styles.authForm} 
        onSubmit={handleSubmit}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.boxShadow = '0 25px 70px rgba(0, 0, 0, 0.35)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.3)';
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div 
            style={styles.iconContainer}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)';
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(102, 126, 234, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(102, 126, 234, 0.3)';
            }}
          >
            <span style={{ fontSize: '2rem' }}>🎓</span>
          </div>
          <h2 style={{ 
            fontSize: '2rem', 
            fontWeight: 700, 
            marginBottom: '0.5rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Welcome Back
          </h2>
          <p style={{ color: '#666', marginBottom: '0' }}>Sign in to continue your journey</p>
        </div>

        {errors.general && (
          <div style={{
            padding: '1rem',
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '12px',
            color: '#c33',
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
            animation: 'shake 0.5s'
          }}>
            {errors.general}
          </div>
        )}

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            fontWeight: 600, 
            color: '#212529',
            fontSize: '0.95rem'
          }}>
            Email Address
          </label>
          <div style={{ position: 'relative' }}>
            <span style={styles.inputIcon}>📧</span>
            <input
              type="email"
              name="email"
              style={{
                ...styles.formInput,
                paddingLeft: '2.5rem',
                border: errors.email ? '2px solid #dc3545' : '2px solid #e9ecef'
              }}
              placeholder="your.email@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={isSubmitting}
              required
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.backgroundColor = 'white';
                e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.1)';
                e.target.previousSibling.style.transform = 'translateY(-50%) scale(1.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errors.email ? '#dc3545' : '#e9ecef';
                e.target.style.backgroundColor = '#f8f9fa';
                e.target.style.boxShadow = 'none';
                e.target.previousSibling.style.transform = 'translateY(-50%) scale(1)';
              }}
            />
          </div>
          {errors.email && (
            <div style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '0.5rem' }}>
              {errors.email}
            </div>
          )}
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ 
              fontWeight: 600, 
              color: '#212529',
              fontSize: '0.95rem'
            }}>
              Password
            </label>
            <button
              type="button"
              style={styles.forgotButton}
              onClick={() => alert('Password reset feature')}
              onMouseEnter={(e) => {
                e.target.style.color = '#764ba2';
                e.target.style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = '#667eea';
                e.target.style.textDecoration = 'none';
              }}
            >
              Forgot?
            </button>
          </div>
          <div style={{ position: 'relative' }}>
            <span style={styles.inputIcon}>🔒</span>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              style={{
                ...styles.formInput,
                paddingLeft: '2.5rem',
                paddingRight: '2.5rem',
                border: errors.password ? '2px solid #dc3545' : '2px solid #e9ecef'
              }}
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              disabled={isSubmitting}
              required
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.backgroundColor = 'white';
                e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.1)';
                e.target.previousSibling.style.transform = 'translateY(-50%) scale(1.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errors.password ? '#dc3545' : '#e9ecef';
                e.target.style.backgroundColor = '#f8f9fa';
                e.target.style.boxShadow = 'none';
                e.target.previousSibling.style.transform = 'translateY(-50%) scale(1)';
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={styles.toggleButton}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-50%) scale(1.2)';
                e.target.style.opacity = '1';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(-50%) scale(1)';
                e.target.style.opacity = '0.6';
              }}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          {errors.password && (
            <div style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '0.5rem' }}>
              {errors.password}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
          <input
            type="checkbox"
            id="remember"
            style={styles.checkbox}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
            }}
          />
          <label htmlFor="remember" style={{ fontSize: '0.875rem', color: '#666', cursor: 'pointer' }}>
            Remember me for 30 days
          </label>
        </div>

        <button
          type="submit"
          style={styles.primaryButton}
          disabled={isSubmitting}
          onMouseEnter={(e) => {
            if (!isSubmitting) {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
          }}
        >
          {isSubmitting ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⏳</span>
              Signing in...
            </span>
          ) : (
            'Sign In'
          )}
        </button>

        <div style={styles.divider}>
          <span style={styles.dividerText}>
            Or continue with
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <button
            type="button"
            style={styles.outlineButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#667eea';
              e.currentTarget.style.backgroundColor = '#f8f9ff';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e9ecef';
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>🔍</span>
            <span>Google</span>
          </button>
          <button
            type="button"
            style={styles.outlineButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#667eea';
              e.currentTarget.style.backgroundColor = '#f8f9ff';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e9ecef';
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>📘</span>
            <span>Facebook</span>
          </button>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <p style={{ margin: 0, color: '#666' }}>
            Don't have an account?{' '}
            <Link 
              to="/register" 
              style={styles.link}
              onMouseEnter={(e) => {
                e.target.style.color = '#764ba2';
                e.target.style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = '#667eea';
                e.target.style.textDecoration = 'none';
              }}
            >
              Create Account
            </Link>
          </p>
        </div>

        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.875rem', color: '#666', margin: 0 }}>
            By signing in, you agree to our{' '}
            <button
              style={styles.termsButton}
              onMouseEnter={(e) => {
                e.target.style.color = '#764ba2';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = '#667eea';
              }}
            >
              Terms of Service
            </button>
            {' '}and{' '}
            <button
              style={styles.termsButton}
              onMouseEnter={(e) => {
                e.target.style.color = '#764ba2';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = '#667eea';
              }}
            >
              Privacy Policy
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}

export default LoginPage;