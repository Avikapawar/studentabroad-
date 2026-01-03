import { FORM_VALIDATION } from './constants';
import { sanitizeInput } from './errorHandler';

/**
 * Enhanced validation functions for form inputs
 */

// Basic validation rules
export const validationRules = {
  required: (value, fieldName = 'Field') => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return `${fieldName} is required`;
    }
    return null;
  },

  email: (email) => {
    if (!email) return 'Email is required';
    const sanitized = sanitizeInput(email.trim().toLowerCase());
    if (!FORM_VALIDATION.EMAIL_REGEX.test(sanitized)) return 'Invalid email format';
    if (sanitized.length > 254) return 'Email is too long';
    return null;
  },

  password: (password) => {
    if (!password) return 'Password is required';
    if (password.length < FORM_VALIDATION.PASSWORD_MIN_LENGTH) {
      return `Password must be at least ${FORM_VALIDATION.PASSWORD_MIN_LENGTH} characters`;
    }
    if (password.length > 128) return 'Password is too long';
    
    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    
    // Check for at least one lowercase letter
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    
    // Check for at least one number
    if (!/\d/.test(password)) {
      return 'Password must contain at least one number';
    }
    
    // Check for at least one special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return 'Password must contain at least one special character';
    }
    
    return null;
  },

  confirmPassword: (confirmPassword, formData) => {
    if (!confirmPassword) return 'Please confirm your password';
    if (formData.password !== confirmPassword) return 'Passwords do not match';
    return null;
  },

  cgpa: (cgpa) => {
    if (!cgpa) return 'CGPA is required';
    const numCgpa = parseFloat(cgpa);
    if (isNaN(numCgpa)) return 'CGPA must be a valid number';
    if (numCgpa < FORM_VALIDATION.CGPA_MIN || numCgpa > FORM_VALIDATION.CGPA_MAX) {
      return `CGPA must be between ${FORM_VALIDATION.CGPA_MIN} and ${FORM_VALIDATION.CGPA_MAX}`;
    }
    return null;
  },

  gre: (score) => {
    if (!score) return null; // GRE is optional
    const numScore = parseInt(score);
    if (isNaN(numScore)) return 'GRE score must be a valid number';
    if (numScore < FORM_VALIDATION.GRE_MIN || numScore > FORM_VALIDATION.GRE_MAX) {
      return `GRE score must be between ${FORM_VALIDATION.GRE_MIN} and ${FORM_VALIDATION.GRE_MAX}`;
    }
    return null;
  },

  ielts: (score) => {
    if (!score) return null; // IELTS is optional
    const numScore = parseFloat(score);
    if (isNaN(numScore)) return 'IELTS score must be a valid number';
    if (numScore < FORM_VALIDATION.IELTS_MIN || numScore > FORM_VALIDATION.IELTS_MAX) {
      return `IELTS score must be between ${FORM_VALIDATION.IELTS_MIN} and ${FORM_VALIDATION.IELTS_MAX}`;
    }
    // IELTS scores are in 0.5 increments
    if ((numScore * 2) % 1 !== 0) {
      return 'IELTS score must be in 0.5 increments (e.g., 6.0, 6.5, 7.0)';
    }
    return null;
  },

  toefl: (score) => {
    if (!score) return null; // TOEFL is optional
    const numScore = parseInt(score);
    if (isNaN(numScore)) return 'TOEFL score must be a valid number';
    if (numScore < FORM_VALIDATION.TOEFL_MIN || numScore > FORM_VALIDATION.TOEFL_MAX) {
      return `TOEFL score must be between ${FORM_VALIDATION.TOEFL_MIN} and ${FORM_VALIDATION.TOEFL_MAX}`;
    }
    return null;
  },

  budget: (value, formData) => {
    const min = parseFloat(formData.budgetMin);
    const max = parseFloat(formData.budgetMax);
    
    if (!formData.budgetMin || !formData.budgetMax) {
      return 'Budget range is required';
    }
    
    if (isNaN(min) || isNaN(max)) {
      return 'Budget values must be valid numbers';
    }
    
    if (min < 0 || max < 0) {
      return 'Budget values must be positive';
    }
    
    if (min >= max) {
      return 'Maximum budget must be greater than minimum';
    }
    
    if (max > 1000000) {
      return 'Budget seems unreasonably high';
    }
    
    return null;
  },

  phone: (phone) => {
    if (!phone) return null; // Phone is optional
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(phone)) {
      return 'Please enter a valid phone number';
    }
    return null;
  },

  url: (url) => {
    if (!url) return null; // URL is optional
    try {
      new URL(url);
      return null;
    } catch {
      return 'Please enter a valid URL';
    }
  }
};

// Legacy functions for backward compatibility
export const validateEmail = validationRules.email;
export const validatePassword = validationRules.password;
export const validateConfirmPassword = validationRules.confirmPassword;
export const validateCGPA = validationRules.cgpa;
export const validateGRE = validationRules.gre;
export const validateIELTS = validationRules.ielts;
export const validateTOEFL = validationRules.toefl;
export const validateBudget = validationRules.budget;
export const validateRequired = validationRules.required;

/**
 * Validate entire form data
 */
export const validateForm = (formData, validationSchema) => {
  const errors = {};
  
  Object.keys(validationSchema).forEach(field => {
    const rules = validationSchema[field];
    const value = formData[field];
    
    for (const rule of rules) {
      let error;
      
      if (typeof rule === 'function') {
        error = rule(value, formData);
      } else if (typeof rule === 'string' && validationRules[rule]) {
        error = validationRules[rule](value, formData);
      }
      
      if (error) {
        errors[field] = error;
        break; // Stop at first error for this field
      }
    }
  });
  
  return errors;
};

/**
 * Real-time validation hook
 */
export const useFormValidation = (initialData = {}, validationSchema = {}) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = useCallback((field, value) => {
    const rules = validationSchema[field];
    if (!rules) return null;

    const tempFormData = { ...formData, [field]: value };
    
    for (const rule of rules) {
      let error;
      
      if (typeof rule === 'function') {
        error = rule(value, tempFormData);
      } else if (typeof rule === 'string' && validationRules[rule]) {
        error = validationRules[rule](value, tempFormData);
      }
      
      if (error) {
        return error;
      }
    }
    
    return null;
  }, [formData, validationSchema]);

  const handleChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  const handleBlur = useCallback((field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    const error = validateField(field, formData[field]);
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  }, [formData, validateField]);

  const validateAll = useCallback(() => {
    const allErrors = validateForm(formData, validationSchema);
    setErrors(allErrors);
    setTouched(
      Object.keys(validationSchema).reduce((acc, field) => {
        acc[field] = true;
        return acc;
      }, {})
    );
    return Object.keys(allErrors).length === 0;
  }, [formData, validationSchema]);

  const reset = useCallback(() => {
    setFormData(initialData);
    setErrors({});
    setTouched({});
  }, [initialData]);

  return {
    formData,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    reset,
    isValid: Object.keys(errors).length === 0,
    hasErrors: Object.keys(errors).length > 0
  };
};

/**
 * Validation schemas for common forms
 */
export const validationSchemas = {
  login: {
    email: ['email'],
    password: ['required']
  },
  
  register: {
    email: ['email'],
    password: ['password'],
    confirmPassword: ['confirmPassword']
  },
  
  profile: {
    email: ['email'],
    cgpa: ['cgpa'],
    gre: ['gre'],
    ielts: ['ielts'],
    toefl: ['toefl'],
    budgetMin: ['required'],
    budgetMax: ['required'],
    budget: ['budget']
  },
  
  search: {
    query: [(value) => {
      if (value && value.length < 2) {
        return 'Search query must be at least 2 characters';
      }
      return null;
    }]
  }
};

/**
 * Custom validation rules
 */
export const createCustomRule = (validator, message) => {
  return (value, formData) => {
    const isValid = validator(value, formData);
    return isValid ? null : message;
  };
};

/**
 * Async validation support
 */
export const createAsyncValidator = (asyncValidator, debounceMs = 500) => {
  let timeoutId;
  
  return (value, formData) => {
    return new Promise((resolve) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        try {
          const result = await asyncValidator(value, formData);
          resolve(result);
        } catch (error) {
          resolve(error.message || 'Validation failed');
        }
      }, debounceMs);
    });
  };
};