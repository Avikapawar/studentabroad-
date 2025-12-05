import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate('/');
    }
  }, [isAuthenticated, loading, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validatePassword = (password) => {
    const errors = [];
    
    if (password.length < 8) {
      errors.push('at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('at least one lowercase letter');
    }
    if (!/\d/.test(password)) {
      errors.push('at least one number');
    }
    
    return errors;
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordErrors = validatePassword(formData.password);
      if (passwordErrors.length > 0) {
        newErrors.password = `Password must contain ${passwordErrors.join(', ')}`;
      }
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      const result = await register({
        email: formData.email.toLowerCase().trim(),
        password: formData.password
      });
      
      if (result.success) {
        navigate('/');
      } else {
        // Handle specific error codes
        if (result.code === 'USER_EXISTS') {
          setErrors({ email: 'An account with this email already exists' });
        } else if (result.code === 'WEAK_PASSWORD') {
          setErrors({ password: result.error });
        } else if (result.code === 'INVALID_EMAIL') {
          setErrors({ email: 'Please enter a valid email address' });
        } else {
          setErrors({ general: result.error || 'Registration failed. Please try again.' });
        }
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="auth-page">
        <div className="auth-form">
          <div className="loading-spinner">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2 className="auth-title">Register</h2>
        
        {errors.general && (
          <div className="error-message general-error">
            {errors.general}
          </div>
        )}
        
        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="email"
            name="email"
            className={`form-input ${errors.email ? 'error' : ''}`}
            value={formData.email}
            onChange={handleChange}
            disabled={isSubmitting}
            required
          />
          {errors.email && (
            <div className="error-message">{errors.email}</div>
          )}
        </div>
        
        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            type="password"
            name="password"
            className={`form-input ${errors.password ? 'error' : ''}`}
            value={formData.password}
            onChange={handleChange}
            disabled={isSubmitting}
            required
          />
          {errors.password && (
            <div className="error-message">{errors.password}</div>
          )}
          <div className="password-requirements">
            Password must contain at least 8 characters, one uppercase letter, one lowercase letter, and one number.
          </div>
        </div>
        
        <div className="form-group">
          <label className="form-label">Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={isSubmitting}
            required
          />
          {errors.confirmPassword && (
            <div className="error-message">{errors.confirmPassword}</div>
          )}
        </div>
        
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating Account...' : 'Register'}
        </button>
        
        <div className="auth-link">
          <Link to="/login">Already have an account? Login here</Link>
        </div>
      </form>
    </div>
  );
}

export default RegisterPage;