import React, { useState, useCallback } from 'react';
import { sanitizeInput } from '../../utils/errorHandler';
import { validationRules } from '../../utils/validators';

const FormField = ({
  type = 'text',
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  touched,
  required = false,
  disabled = false,
  placeholder,
  className = '',
  validationRule = null,
  sanitize = true,
  maxLength = null,
  minLength = null,
  pattern = null,
  autoComplete = 'off',
  showPasswordToggle = false,
  icon = null,
  helpText = null,
  options = [], // For select fields
  rows = 3, // For textarea
  step = null, // For number inputs
  min = null,
  max = null,
  debounceMs = 300,
  onValidation = null,
  customValidator = null,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [localError, setLocalError] = useState(null);

  // Debounced validation
  const [validationTimeout, setValidationTimeout] = useState(null);

  const handleValidation = useCallback((inputValue) => {
    let validationError = null;

    // Required validation
    if (required && (!inputValue || inputValue.toString().trim() === '')) {
      validationError = `${label || name} is required`;
    }

    // Length validation
    if (!validationError && inputValue) {
      if (minLength && inputValue.length < minLength) {
        validationError = `${label || name} must be at least ${minLength} characters`;
      }
      if (maxLength && inputValue.length > maxLength) {
        validationError = `${label || name} must be no more than ${maxLength} characters`;
      }
    }

    // Pattern validation
    if (!validationError && pattern && inputValue) {
      const regex = new RegExp(pattern);
      if (!regex.test(inputValue)) {
        validationError = `${label || name} format is invalid`;
      }
    }

    // Built-in validation rules
    if (!validationError && validationRule && validationRules[validationRule]) {
      validationError = validationRules[validationRule](inputValue);
    }

    // Custom validator
    if (!validationError && customValidator) {
      validationError = customValidator(inputValue);
    }

    setLocalError(validationError);
    
    if (onValidation) {
      onValidation(name, validationError);
    }

    return validationError;
  }, [name, label, required, minLength, maxLength, pattern, validationRule, customValidator, onValidation]);

  const handleChange = useCallback((e) => {
    let inputValue = e.target.value;

    // Sanitize input if enabled
    if (sanitize && typeof inputValue === 'string') {
      inputValue = sanitizeInput(inputValue);
    }

    // Call parent onChange
    if (onChange) {
      onChange(name, inputValue);
    }

    // Debounced validation
    if (validationTimeout) {
      clearTimeout(validationTimeout);
    }

    const timeout = setTimeout(() => {
      handleValidation(inputValue);
    }, debounceMs);

    setValidationTimeout(timeout);
  }, [name, onChange, sanitize, debounceMs, handleValidation, validationTimeout]);

  const handleBlur = useCallback((e) => {
    setIsFocused(false);
    
    // Immediate validation on blur
    if (validationTimeout) {
      clearTimeout(validationTimeout);
    }
    handleValidation(e.target.value);

    if (onBlur) {
      onBlur(name);
    }
  }, [name, onBlur, handleValidation, validationTimeout]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    setLocalError(null);
  }, []);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  // Determine field type
  const fieldType = type === 'password' && showPassword ? 'text' : type;

  // Determine if field has error
  const hasError = error || localError;
  const displayError = touched ? hasError : localError;

  // Base field props
  const baseFieldProps = {
    id: name,
    name,
    value: value || '',
    onChange: handleChange,
    onBlur: handleBlur,
    onFocus: handleFocus,
    disabled,
    placeholder,
    autoComplete,
    required,
    className: `form-input ${hasError ? 'error' : ''} ${isFocused ? 'focused' : ''} ${className}`,
    ...props
  };

  // Number field specific props
  if (type === 'number') {
    if (step !== null) baseFieldProps.step = step;
    if (min !== null) baseFieldProps.min = min;
    if (max !== null) baseFieldProps.max = max;
  }

  // Text field specific props
  if (type === 'text' || type === 'email' || type === 'password') {
    if (maxLength) baseFieldProps.maxLength = maxLength;
    if (pattern) baseFieldProps.pattern = pattern;
  }

  const renderField = () => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            {...baseFieldProps}
            rows={rows}
          />
        );

      case 'select':
        return (
          <select {...baseFieldProps}>
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option 
                key={option.value || option} 
                value={option.value || option}
              >
                {option.label || option}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <label className="checkbox-container">
            <input
              {...baseFieldProps}
              type="checkbox"
              checked={value || false}
              onChange={(e) => onChange && onChange(name, e.target.checked)}
              className={`form-checkbox ${hasError ? 'error' : ''}`}
            />
            <span className="checkbox-label">{label}</span>
            {required && <span className="required-indicator">*</span>}
          </label>
        );

      case 'radio':
        return (
          <div className="radio-group">
            {options.map((option) => (
              <label key={option.value || option} className="radio-container">
                <input
                  type="radio"
                  name={name}
                  value={option.value || option}
                  checked={value === (option.value || option)}
                  onChange={(e) => onChange && onChange(name, e.target.value)}
                  disabled={disabled}
                  className="form-radio"
                />
                <span className="radio-label">{option.label || option}</span>
              </label>
            ))}
          </div>
        );

      default:
        return (
          <input
            {...baseFieldProps}
            type={fieldType}
          />
        );
    }
  };

  // Don't render label for checkbox (it's handled internally)
  if (type === 'checkbox') {
    return (
      <div className={`form-field ${className}`}>
        {renderField()}
        {displayError && (
          <div className="field-error">{displayError}</div>
        )}
        {helpText && !displayError && (
          <div className="field-help">{helpText}</div>
        )}
      </div>
    );
  }

  return (
    <div className={`form-field ${className}`}>
      {label && (
        <label htmlFor={name} className="form-label">
          {icon && <span className="label-icon">{icon}</span>}
          {label}
          {required && <span className="required-indicator">*</span>}
        </label>
      )}
      
      <div className="field-container">
        {renderField()}
        
        {type === 'password' && showPasswordToggle && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="password-toggle"
            tabIndex={-1}
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        )}
      </div>

      {displayError && (
        <div className="field-error">
          <span className="error-icon">⚠️</span>
          {displayError}
        </div>
      )}

      {helpText && !displayError && (
        <div className="field-help">{helpText}</div>
      )}
    </div>
  );
};

// Specialized form field components
export const EmailField = (props) => (
  <FormField
    type="email"
    validationRule="email"
    autoComplete="email"
    icon="📧"
    {...props}
  />
);

export const PasswordField = (props) => (
  <FormField
    type="password"
    validationRule="password"
    showPasswordToggle
    autoComplete="new-password"
    icon="🔒"
    {...props}
  />
);

export const NumberField = (props) => (
  <FormField
    type="number"
    {...props}
  />
);

export const TextAreaField = (props) => (
  <FormField
    type="textarea"
    {...props}
  />
);

export const SelectField = (props) => (
  <FormField
    type="select"
    {...props}
  />
);

export const CheckboxField = (props) => (
  <FormField
    type="checkbox"
    {...props}
  />
);

export const RadioField = (props) => (
  <FormField
    type="radio"
    {...props}
  />
);

// Form field group component
export const FormFieldGroup = ({ 
  title, 
  description, 
  children, 
  className = '',
  collapsible = false,
  defaultExpanded = true 
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={`form-field-group ${className}`}>
      {title && (
        <div className="field-group-header">
          {collapsible ? (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="field-group-toggle"
            >
              <span className={`toggle-icon ${isExpanded ? 'expanded' : ''}`}>
                ▶
              </span>
              <h3 className="field-group-title">{title}</h3>
            </button>
          ) : (
            <h3 className="field-group-title">{title}</h3>
          )}
          {description && (
            <p className="field-group-description">{description}</p>
          )}
        </div>
      )}
      
      {(!collapsible || isExpanded) && (
        <div className="field-group-content">
          {children}
        </div>
      )}
    </div>
  );
};

export default FormField;