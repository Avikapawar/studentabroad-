// Application constants

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    PROFILE: '/auth/profile',
  },
  UNIVERSITIES: {
    SEARCH: '/universities',
    DETAIL: '/universities',
    COUNTRIES: '/countries',
    FIELDS: '/fields',
  },
  RECOMMENDATIONS: {
    GET: '/recommendations',
    PREDICT: '/predict',
    COMPARE: '/compare',
  },
};

export const FORM_VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 6,
  CGPA_MIN: 0,
  CGPA_MAX: 4,
  GRE_MIN: 260,
  GRE_MAX: 340,
  IELTS_MIN: 0,
  IELTS_MAX: 9,
  TOEFL_MIN: 0,
  TOEFL_MAX: 120,
};

export const COUNTRIES = [
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Germany',
  'Netherlands',
  'France',
  'Sweden',
  'Switzerland',
  'Singapore',
];

export const FIELDS_OF_STUDY = [
  'Computer Science',
  'Engineering',
  'Business Administration',
  'Medicine',
  'Law',
  'Psychology',
  'Economics',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Arts and Humanities',
];

export const BUDGET_RANGES = [
  { label: 'Under $20,000', min: 0, max: 20000 },
  { label: '$20,000 - $40,000', min: 20000, max: 40000 },
  { label: '$40,000 - $60,000', min: 40000, max: 60000 },
  { label: '$60,000 - $80,000', min: 60000, max: 80000 },
  { label: 'Above $80,000', min: 80000, max: 999999 },
];