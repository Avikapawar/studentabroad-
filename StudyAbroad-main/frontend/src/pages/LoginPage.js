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

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            backgroundColor: '#007bff',
            borderRadius: '16px',
            marginBottom: '1rem'
          }}>
            <span style={{ fontSize: '2rem' }}>🎓</span>
          </div>
          <h2 className="auth-title">Welcome Back</h2>
          <p style={{ color: '#666', marginBottom: '0' }}>Sign in to continue your journey</p>
        </div>

        {errors.general && (
          <div className="error-message general-error">
            {errors.general}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Email Address</label>
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '1.2rem'
            }}>📧</span>
            <input
              type="email"
              name="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              style={{ paddingLeft: '2.5rem' }}
              placeholder="your.email@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
          </div>
          {errors.email && (
            <div className="error-message">{errors.email}</div>
          )}
        </div>

        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label className="form-label">Password</label>
            <button
              type="button"
              style={{
                background: 'none',
                border: 'none',
                color: '#007bff',
                fontSize: '0.875rem',
                cursor: 'pointer',
                textDecoration: 'none'
              }}
              onClick={() => alert('Password reset feature')}
            >
              Forgot?
            </button>
          </div>
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '1.2rem'
            }}>🔒</span>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              className={`form-input ${errors.password ? 'error' : ''}`}
              style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.2rem'
              }}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          {errors.password && (
            <div className="error-message">{errors.password}</div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
          <input
            type="checkbox"
            id="remember"
            style={{ marginRight: '0.5rem' }}
          />
          <label htmlFor="remember" style={{ fontSize: '0.875rem', color: '#666' }}>
            Remember me for 30 days
          </label>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
          style={{ width: '100%', marginBottom: '1.5rem' }}
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

        <div style={{
          position: 'relative',
          margin: '1.5rem 0',
          textAlign: 'center',
          borderTop: '1px solid #dee2e6',
          paddingTop: '1.5rem'
        }}>
          <span style={{
            position: 'absolute',
            top: '-10px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'white',
            padding: '0 1rem',
            fontSize: '0.875rem',
            color: '#666'
          }}>
            Or continue with
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <button
            type="button"
            className="btn btn-outline"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            <span style={{ fontSize: '1.2rem' }}>🔍</span>
            <span>Google</span>
          </button>
          <button
            type="button"
            className="btn btn-outline"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            <span style={{ fontSize: '1.2rem' }}>📘</span>
            <span>Facebook</span>
          </button>
        </div>

        <div className="auth-link">
          <p>
            Don't have an account?{' '}
            <Link to="/register">Create Account</Link>
          </p>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <p style={{ fontSize: '0.875rem', color: '#666' }}>
            By signing in, you agree to our{' '}
            <button
              style={{
                background: 'none',
                border: 'none',
                color: '#007bff',
                textDecoration: 'underline',
                cursor: 'pointer'
              }}
            >
              Terms of Service
            </button>
            {' '}and{' '}
            <button
              style={{
                background: 'none',
                border: 'none',
                color: '#007bff',
                textDecoration: 'underline',
                cursor: 'pointer'
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