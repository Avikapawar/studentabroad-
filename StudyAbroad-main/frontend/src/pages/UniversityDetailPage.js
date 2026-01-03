import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import universityService from '../services/universityService';
import bookmarkService from '../services/bookmarkService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { formatCurrency, formatPercentage } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import './UniversityDetailPage.css';

const UniversityDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [university, setUniversity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Load university details
  useEffect(() => {
    const loadUniversity = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await universityService.getUniversityById(parseInt(id));
        
        if (response.success) {
          setUniversity(response.data);
          // TODO: Check if university is bookmarked
        } else {
          throw new Error('University not found');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadUniversity();
    }
  }, [id]);

  // Load user's bookmark status
  useEffect(() => {
    const loadBookmarkStatus = async () => {
      if (user && university) {
        try {
          const response = await bookmarkService.getUserBookmarks();
          if (response.success) {
            const bookmarkedIds = response.data.map(bookmark => bookmark.university.id);
            setIsBookmarked(bookmarkedIds.includes(parseInt(id)));
          }
        } catch (error) {
          console.error('Error loading bookmark status:', error);
        }
      }
    };

    loadBookmarkStatus();
  }, [user, university, id]);

  // Handle bookmark toggle
  const handleBookmarkToggle = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await bookmarkService.toggleBookmark(parseInt(id), isBookmarked);
      setIsBookmarked(!isBookmarked);
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    navigate(-1);
  };

  // Get currency information based on country
  const getCurrencyInfo = (countryCode) => {
    const currencies = {
      'US': { code: 'USD', symbol: '$', rate: 1 },
      'UK': { code: 'GBP', symbol: '£', rate: 0.79 },
      'CA': { code: 'CAD', symbol: 'C$', rate: 1.35 },
      'AU': { code: 'AUD', symbol: 'A$', rate: 1.52 },
      'DE': { code: 'EUR', symbol: '€', rate: 0.92 },
      'FR': { code: 'EUR', symbol: '€', rate: 0.92 },
      'NL': { code: 'EUR', symbol: '€', rate: 0.92 },
      'IT': { code: 'EUR', symbol: '€', rate: 0.92 },
      'ES': { code: 'EUR', symbol: '€', rate: 0.92 },
      'CH': { code: 'CHF', symbol: 'CHF', rate: 0.88 },
      'JP': { code: 'JPY', symbol: '¥', rate: 149.50 },
      'SG': { code: 'SGD', symbol: 'S$', rate: 1.34 },
      'IN': { code: 'INR', symbol: '₹', rate: 83.12 },
      'CN': { code: 'CNY', symbol: '¥', rate: 7.24 },
      'KR': { code: 'KRW', symbol: '₩', rate: 1320 },
      'NZ': { code: 'NZD', symbol: 'NZ$', rate: 1.64 },
      'SE': { code: 'SEK', symbol: 'kr', rate: 10.87 },
      'NO': { code: 'NOK', symbol: 'kr', rate: 10.95 },
      'DK': { code: 'DKK', symbol: 'kr', rate: 6.87 },
      'DEFAULT': { code: 'USD', symbol: '$', rate: 1 }
    };
    
    return currencies[countryCode] || currencies['DEFAULT'];
  };

  // Format currency based on country
  const formatCurrencyByCountry = (amount, countryCode) => {
    if (!amount) return 'N/A';
    
    const currencyInfo = getCurrencyInfo(countryCode);
    const convertedAmount = amount * currencyInfo.rate;
    
    // Format based on currency
    if (currencyInfo.code === 'JPY' || currencyInfo.code === 'KRW') {
      // No decimals for Yen and Won
      return `${currencyInfo.symbol}${Math.round(convertedAmount).toLocaleString()}`;
    } else if (currencyInfo.code === 'INR') {
      // Indian numbering system
      return `${currencyInfo.symbol}${convertedAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
    } else {
      // Standard formatting with 2 decimals
      return `${currencyInfo.symbol}${convertedAmount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }
  };

  // Get country flag emoji (expanded mapping)
  const getCountryFlag = (countryCode) => {
    const flags = {
      'US': '🇺🇸', 'USA': '🇺🇸', 'United States': '🇺🇸',
      'UK': '🇬🇧', 'GB': '🇬🇧', 'United Kingdom': '🇬🇧',
      'CA': '🇨🇦', 'Canada': '🇨🇦',
      'AU': '🇦🇺', 'Australia': '🇦🇺',
      'DE': '🇩🇪', 'Germany': '🇩🇪',
      'CH': '🇨🇭', 'Switzerland': '🇨🇭',
      'JP': '🇯🇵', 'Japan': '🇯🇵',
      'SG': '🇸🇬', 'Singapore': '🇸🇬',
      'FR': '🇫🇷', 'France': '🇫🇷',
      'NL': '🇳🇱', 'Netherlands': '🇳🇱',
      'SE': '🇸🇪', 'Sweden': '🇸🇪',
      'NO': '🇳🇴', 'Norway': '🇳🇴',
      'DK': '🇩🇰', 'Denmark': '🇩🇰',
      'FI': '🇫🇮', 'Finland': '🇫🇮',
      'IT': '🇮🇹', 'Italy': '🇮🇹',
      'ES': '🇪🇸', 'Spain': '🇪🇸',
      'IE': '🇮🇪', 'Ireland': '🇮🇪',
      'NZ': '🇳🇿', 'New Zealand': '🇳🇿',
      'IN': '🇮🇳', 'India': '🇮🇳'
    };
    return flags[countryCode] || flags[country] || '🌍';
  };

  // Get competitive exams and application portals based on country
  const getExamsAndPortals = (countryCode) => {
    const universityWebsite = university?.website || '#';
    const examsData = {
      'US': {
        exams: [
          {
            name: 'GRE (Graduate Record Examination)',
            icon: '📝',
            description: 'Required for most graduate programs',
            website: 'https://www.ets.org/gre',
            registrationPortal: 'https://www.ets.org/gre/test-takers/general-test/register.html',
            scoreRange: '260-340',
            validity: '5 years',
            cost: '$220'
          },
          {
            name: 'TOEFL (Test of English as a Foreign Language)',
            icon: '🗣️',
            description: 'English proficiency test for non-native speakers',
            website: 'https://www.ets.org/toefl',
            registrationPortal: 'https://www.ets.org/toefl/test-takers/ibt/register.html',
            scoreRange: '0-120',
            validity: '2 years',
            cost: '$190-$300'
          },
          {
            name: 'GMAT (Graduate Management Admission Test)',
            icon: '💼',
            description: 'Required for MBA and business programs',
            website: 'https://www.mba.com/exams/gmat-exam',
            registrationPortal: 'https://www.mba.com/exams/gmat-exam/register',
            scoreRange: '200-800',
            validity: '5 years',
            cost: '$275'
          },
          {
            name: 'SAT (Scholastic Assessment Test)',
            icon: '🎓',
            description: 'For undergraduate admissions',
            website: 'https://satsuite.collegeboard.org/sat',
            registrationPortal: 'https://satsuite.collegeboard.org/sat/registration',
            scoreRange: '400-1600',
            validity: '5 years',
            cost: '$60-$115'
          }
        ],
        applicationPortals: [
          {
            name: 'Common Application',
            icon: '📋',
            description: 'Apply to 900+ colleges with one application',
            website: 'https://www.commonapp.org',
            type: 'Undergraduate'
          },
          {
            name: 'Coalition Application',
            icon: '🎯',
            description: 'Alternative to Common App for 150+ schools',
            website: 'https://www.coalitionforcollegeaccess.org',
            type: 'Undergraduate'
          },
          {
            name: 'University-Specific Portals',
            icon: '🏛️',
            description: 'Direct application through university websites',
            website: universityWebsite,
            type: 'Graduate & Undergraduate'
          }
        ]
      },
      'UK': {
        exams: [
          {
            name: 'IELTS (International English Language Testing System)',
            icon: '🗣️',
            description: 'English proficiency test',
            website: 'https://www.ielts.org',
            registrationPortal: 'https://www.ielts.org/book-a-test',
            scoreRange: '0-9',
            validity: '2 years',
            cost: '£170-£200'
          },
          {
            name: 'GRE (Graduate Record Examination)',
            icon: '📝',
            description: 'For graduate programs',
            website: 'https://www.ets.org/gre',
            registrationPortal: 'https://www.ets.org/gre/test-takers/general-test/register.html',
            scoreRange: '260-340',
            validity: '5 years',
            cost: '$220'
          },
          {
            name: 'GMAT (Graduate Management Admission Test)',
            icon: '💼',
            description: 'For MBA programs',
            website: 'https://www.mba.com/exams/gmat-exam',
            registrationPortal: 'https://www.mba.com/exams/gmat-exam/register',
            scoreRange: '200-800',
            validity: '5 years',
            cost: '$275'
          }
        ],
        applicationPortals: [
          {
            name: 'UCAS (Universities and Colleges Admissions Service)',
            icon: '🎓',
            description: 'Central application system for UK universities',
            website: 'https://www.ucas.com',
            type: 'Undergraduate'
          },
          {
            name: 'University Direct Applications',
            icon: '🏛️',
            description: 'Apply directly for postgraduate programs',
            website: universityWebsite,
            type: 'Graduate'
          }
        ]
      },
      'CA': {
        exams: [
          {
            name: 'IELTS (International English Language Testing System)',
            icon: '🗣️',
            description: 'English proficiency test',
            website: 'https://www.ielts.org',
            registrationPortal: 'https://www.ielts.org/book-a-test',
            scoreRange: '0-9',
            validity: '2 years',
            cost: 'CAD $319'
          },
          {
            name: 'TOEFL (Test of English as a Foreign Language)',
            icon: '🎯',
            description: 'Alternative English proficiency test',
            website: 'https://www.ets.org/toefl',
            registrationPortal: 'https://www.ets.org/toefl/test-takers/ibt/register.html',
            scoreRange: '0-120',
            validity: '2 years',
            cost: '$190-$300'
          },
          {
            name: 'GRE (Graduate Record Examination)',
            icon: '📝',
            description: 'For graduate programs',
            website: 'https://www.ets.org/gre',
            registrationPortal: 'https://www.ets.org/gre/test-takers/general-test/register.html',
            scoreRange: '260-340',
            validity: '5 years',
            cost: '$220'
          }
        ],
        applicationPortals: [
          {
            name: 'OUAC (Ontario Universities\' Application Centre)',
            icon: '📋',
            description: 'For Ontario universities',
            website: 'https://www.ouac.on.ca',
            type: 'Undergraduate'
          },
          {
            name: 'University Direct Applications',
            icon: '🏛️',
            description: 'Apply directly through university portals',
            website: universityWebsite,
            type: 'Graduate & Undergraduate'
          }
        ]
      },
      'AU': {
        exams: [
          {
            name: 'IELTS (International English Language Testing System)',
            icon: '🗣️',
            description: 'English proficiency test',
            website: 'https://www.ielts.org',
            registrationPortal: 'https://www.ielts.org/book-a-test',
            scoreRange: '0-9',
            validity: '2 years',
            cost: 'AUD $385'
          },
          {
            name: 'PTE Academic',
            icon: '🎯',
            description: 'Pearson Test of English',
            website: 'https://www.pearsonpte.com',
            registrationPortal: 'https://www.pearsonpte.com/book-now',
            scoreRange: '10-90',
            validity: '2 years',
            cost: 'AUD $380'
          },
          {
            name: 'GRE (Graduate Record Examination)',
            icon: '📝',
            description: 'For graduate programs',
            website: 'https://www.ets.org/gre',
            registrationPortal: 'https://www.ets.org/gre/test-takers/general-test/register.html',
            scoreRange: '260-340',
            validity: '5 years',
            cost: '$220'
          }
        ],
        applicationPortals: [
          {
            name: 'UAC (Universities Admissions Centre)',
            icon: '📋',
            description: 'For NSW and ACT universities',
            website: 'https://www.uac.edu.au',
            type: 'Undergraduate'
          },
          {
            name: 'University Direct Applications',
            icon: '🏛️',
            description: 'Apply directly through university portals',
            website: universityWebsite,
            type: 'Graduate & Undergraduate'
          }
        ]
      },
      'IN': {
        exams: [
          {
            name: 'GRE (Graduate Record Examination)',
            icon: '📝',
            description: 'For graduate programs abroad',
            website: 'https://www.ets.org/gre',
            registrationPortal: 'https://www.ets.org/gre/test-takers/general-test/register.html',
            scoreRange: '260-340',
            validity: '5 years',
            cost: '₹22,550'
          },
          {
            name: 'GATE (Graduate Aptitude Test in Engineering)',
            icon: '⚙️',
            description: 'For M.Tech admissions in India',
            website: 'https://gate.iitk.ac.in',
            registrationPortal: 'https://gate.iitk.ac.in',
            scoreRange: '0-1000',
            validity: '3 years',
            cost: '₹1,800'
          },
          {
            name: 'CAT (Common Admission Test)',
            icon: '💼',
            description: 'For MBA admissions in IIMs',
            website: 'https://iimcat.ac.in',
            registrationPortal: 'https://iimcat.ac.in',
            scoreRange: '0-300',
            validity: '1 year',
            cost: '₹2,300'
          },
          {
            name: 'IELTS/TOEFL',
            icon: '🗣️',
            description: 'English proficiency for international programs',
            website: 'https://www.ielts.org',
            registrationPortal: 'https://www.ielts.org/book-a-test',
            scoreRange: '0-9 / 0-120',
            validity: '2 years',
            cost: '₹16,250'
          }
        ],
        applicationPortals: [
          {
            name: 'JOSAA (Joint Seat Allocation Authority)',
            icon: '🎓',
            description: 'For IITs, NITs, IIITs admissions',
            website: 'https://josaa.nic.in',
            type: 'Undergraduate'
          },
          {
            name: 'COAP (Common Offer Acceptance Portal)',
            icon: '📋',
            description: 'For IIT postgraduate admissions',
            website: 'https://coap.iitm.ac.in',
            type: 'Graduate'
          },
          {
            name: 'University Direct Applications',
            icon: '🏛️',
            description: 'Apply directly through university portals',
            website: universityWebsite,
            type: 'Graduate & Undergraduate'
          }
        ]
      },
      'DEFAULT': {
        exams: [
          {
            name: 'IELTS/TOEFL',
            icon: '🗣️',
            description: 'English proficiency test',
            website: 'https://www.ielts.org',
            registrationPortal: 'https://www.ielts.org/book-a-test',
            scoreRange: '0-9 / 0-120',
            validity: '2 years',
            cost: 'Varies by country'
          },
          {
            name: 'GRE (Graduate Record Examination)',
            icon: '📝',
            description: 'For graduate programs',
            website: 'https://www.ets.org/gre',
            registrationPortal: 'https://www.ets.org/gre/test-takers/general-test/register.html',
            scoreRange: '260-340',
            validity: '5 years',
            cost: '$220'
          }
        ],
        applicationPortals: [
          {
            name: 'University Direct Application',
            icon: '🏛️',
            description: 'Apply directly through university website',
            website: universityWebsite,
            type: 'All Programs'
          }
        ]
      }
    };

    return examsData[countryCode] || examsData['DEFAULT'];
  };

  // Handle tab switching
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  if (loading) {
    return (
      <div className="university-detail-page">
        <div className="container">
          <LoadingSpinner size="large" message="Loading university details..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="university-detail-page">
        <div className="container">
          <ErrorMessage
            message={error}
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    );
  }

  if (!university) {
    return (
      <div className="university-detail-page">
        <div className="container">
          <ErrorMessage
            message="University not found"
            showRetry={false}
          />
        </div>
      </div>
    );
  }

  const {
    name,
    country,
    city,
    state,
    ranking,
    fields,
    tuition_fee,
    living_cost,
    application_fee,
    min_cgpa,
    min_gre,
    min_ielts,
    min_toefl,
    acceptance_rate,
    type,
    student_population,
    international_students,
    established,
    website,
    description,
    campus_size,
    student_faculty_ratio
  } = university;

  const totalCost = (tuition_fee || 0) + (living_cost || 0);

  return (
    <div className="university-detail-page">
      <div className="container">
        {/* Header */}
        <div className="detail-header">
          <button className="back-btn" onClick={handleBack}>
            ← Back to Search
          </button>
          
          <div className="header-actions">
            <button
              className={`bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`}
              onClick={handleBookmarkToggle}
            >
              {isBookmarked ? '❤️ Bookmarked' : '🤍 Bookmark'}
            </button>
            
            <button className="compare-btn">
              📊 Compare
            </button>
          </div>
        </div>

        {/* University Header */}
        <div className="university-header">
          <div className="university-main-info">
            <div className="university-location">
              <span className="country-flag">{getCountryFlag(country)}</span>
              <span className="location-text">
                {city}{state && `, ${state}`}, {country}
              </span>
            </div>
            
            <h1 className="university-name">{name}</h1>
            
            <div className="university-meta">
              {ranking && (
                <div className="ranking-badge">
                  World Ranking: #{ranking}
                </div>
              )}
              
              <div className={`type-badge ${type?.toLowerCase()}`}>
                {type} University
              </div>
              
              {established && (
                <div className="established-badge">
                  Est. {established}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Tab Navigation */}
        <div className="mobile-tabs">
          <button
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => handleTabChange('overview')}
          >
            Overview
          </button>
          <button
            className={`tab-btn ${activeTab === 'requirements' ? 'active' : ''}`}
            onClick={() => handleTabChange('requirements')}
          >
            Requirements
          </button>
          <button
            className={`tab-btn ${activeTab === 'exams' ? 'active' : ''}`}
            onClick={() => handleTabChange('exams')}
          >
            Exams & Portals
          </button>
          <button
            className={`tab-btn ${activeTab === 'costs' ? 'active' : ''}`}
            onClick={() => handleTabChange('costs')}
          >
            Costs
          </button>
          <button
            className={`tab-btn ${activeTab === 'statistics' ? 'active' : ''}`}
            onClick={() => handleTabChange('statistics')}
          >
            Statistics
          </button>
        </div>

        {/* Main Content */}
        <div className="detail-content">
          <div className="detail-grid">
            {/* Left Column */}
            <div className="detail-main">
              {/* Overview Tab */}
              {(activeTab === 'overview' || window.innerWidth > 768) && (
                <>
                  {/* Description */}
                  {description && (
                    <div className="detail-section">
                      <h2>About {name}</h2>
                      <p className="university-description">{description}</p>
                    </div>
                  )}

                  {/* Fields of Study */}
                  {fields && fields.length > 0 && (
                    <div className="detail-section">
                      <h2>Fields of Study</h2>
                      <div className="fields-grid">
                        {fields.map((field, index) => (
                          <div key={index} className="field-item">
                            {field}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Campus Information */}
                  <div className="detail-section">
                    <h2>Campus Information</h2>
                    <div className="campus-info-grid">
                      <div className="info-card">
                        <div className="info-icon">🏛️</div>
                        <div className="info-content">
                          <div className="info-label">University Type</div>
                          <div className="info-value">{type || 'N/A'}</div>
                        </div>
                      </div>
                      
                      {established && (
                        <div className="info-card">
                          <div className="info-icon">📅</div>
                          <div className="info-content">
                            <div className="info-label">Established</div>
                            <div className="info-value">{established}</div>
                          </div>
                        </div>
                      )}
                      
                      {campus_size && (
                        <div className="info-card">
                          <div className="info-icon">🏞️</div>
                          <div className="info-content">
                            <div className="info-label">Campus Size</div>
                            <div className="info-value">{campus_size}</div>
                          </div>
                        </div>
                      )}
                      
                      {student_faculty_ratio && (
                        <div className="info-card">
                          <div className="info-icon">👥</div>
                          <div className="info-content">
                            <div className="info-label">Student-Faculty Ratio</div>
                            <div className="info-value">{student_faculty_ratio}:1</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Requirements Tab */}
              {(activeTab === 'requirements' || window.innerWidth > 768) && (
                <div className="detail-section">
                  <h2>Admission Requirements</h2>
                  <div className="requirements-grid">
                    {min_cgpa && (
                      <div className="requirement-card">
                        <div className="req-icon">📊</div>
                        <div className="req-content">
                          <div className="req-label">Minimum CGPA</div>
                          <div className="req-value">{min_cgpa}</div>
                          <div className="req-scale">Scale: 4.0</div>
                        </div>
                      </div>
                    )}
                    
                    {min_gre && (
                      <div className="requirement-card">
                        <div className="req-icon">📝</div>
                        <div className="req-content">
                          <div className="req-label">Minimum GRE</div>
                          <div className="req-value">{min_gre}</div>
                          <div className="req-scale">Scale: 340</div>
                        </div>
                      </div>
                    )}
                    
                    {min_ielts && (
                      <div className="requirement-card">
                        <div className="req-icon">🗣️</div>
                        <div className="req-content">
                          <div className="req-label">Minimum IELTS</div>
                          <div className="req-value">{min_ielts}</div>
                          <div className="req-scale">Scale: 9.0</div>
                        </div>
                      </div>
                    )}
                    
                    {min_toefl && (
                      <div className="requirement-card">
                        <div className="req-icon">🎯</div>
                        <div className="req-content">
                          <div className="req-label">Minimum TOEFL</div>
                          <div className="req-value">{min_toefl}</div>
                          <div className="req-scale">Scale: 120</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Exams & Portals Tab */}
              {(activeTab === 'exams' || window.innerWidth > 768) && (
                <div className="detail-section">
                  <h2>📝 Required Competitive Exams</h2>
                  <p className="section-description">
                    Standardized tests required for admission to {name}
                  </p>
                  <div className="exams-grid">
                    {getExamsAndPortals(country).exams.map((exam, index) => (
                      <div key={index} className="exam-card">
                        <div className="exam-header">
                          <span className="exam-icon">{exam.icon}</span>
                          <h3 className="exam-name">{exam.name}</h3>
                        </div>
                        <p className="exam-description">{exam.description}</p>
                        <div className="exam-details">
                          <div className="exam-detail-item">
                            <span className="detail-label">Score Range:</span>
                            <span className="detail-value">{exam.scoreRange}</span>
                          </div>
                          <div className="exam-detail-item">
                            <span className="detail-label">Validity:</span>
                            <span className="detail-value">{exam.validity}</span>
                          </div>
                          <div className="exam-detail-item">
                            <span className="detail-label">Cost:</span>
                            <span className="detail-value">{exam.cost}</span>
                          </div>
                        </div>
                        <div className="exam-actions">
                          <a
                            href={exam.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-outline"
                          >
                            ℹ️ Learn More
                          </a>
                          <a
                            href={exam.registrationPortal}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-primary"
                          >
                            📝 Register Now
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>

                  <h2 className="portals-heading">🌐 Application Portals</h2>
                  <p className="section-description">
                    Official portals to submit your application
                  </p>
                  <div className="portals-grid">
                    {getExamsAndPortals(country).applicationPortals.map((portal, index) => (
                      <div key={index} className="portal-card">
                        <div className="portal-header">
                          <span className="portal-icon">{portal.icon}</span>
                          <div className="portal-info">
                            <h3 className="portal-name">{portal.name}</h3>
                            <span className="portal-type">{portal.type}</span>
                          </div>
                        </div>
                        <p className="portal-description">{portal.description}</p>
                        <a
                          href={portal.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary btn-block"
                        >
                          🚀 Go to Portal
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Statistics Tab */}
              {(activeTab === 'statistics' || window.innerWidth > 768) && (
                <div className="detail-section">
                  <h2>University Statistics</h2>
                  <div className="stats-grid">
                    {acceptance_rate && (
                      <div className="stat-card">
                        <div className="stat-icon">✅</div>
                        <div className="stat-content">
                          <div className="stat-label">Acceptance Rate</div>
                          <div className={`stat-value acceptance-rate ${
                            acceptance_rate <= 0.1 ? 'very-low' :
                            acceptance_rate <= 0.3 ? 'low' :
                            acceptance_rate <= 0.6 ? 'moderate' : 'high'
                          }`}>
                            {formatPercentage(acceptance_rate)}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {student_population && (
                      <div className="stat-card">
                        <div className="stat-icon">👨‍🎓</div>
                        <div className="stat-content">
                          <div className="stat-label">Total Students</div>
                          <div className="stat-value">
                            {student_population.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {international_students && (
                      <div className="stat-card">
                        <div className="stat-icon">🌍</div>
                        <div className="stat-content">
                          <div className="stat-label">International Students</div>
                          <div className="stat-value">
                            {international_students}%
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {ranking && (
                      <div className="stat-card">
                        <div className="stat-icon">🏆</div>
                        <div className="stat-content">
                          <div className="stat-label">World Ranking</div>
                          <div className="stat-value">
                            #{ranking}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Sidebar */}
            <div className="detail-sidebar">
              {/* Cost Information */}
              {(activeTab === 'costs' || window.innerWidth > 768) && (
                <div className="sidebar-section cost-section">
                  <h3>💰 Cost Information</h3>
                  <div className="currency-indicator">
                    <span className="currency-label">Currency:</span>
                    <span className="currency-code">{getCurrencyInfo(country).code} ({getCurrencyInfo(country).symbol})</span>
                  </div>
                  <div className="cost-breakdown">
                    {tuition_fee && (
                      <div className="cost-item">
                        <div className="cost-icon">🎓</div>
                        <div className="cost-content">
                          <span className="cost-label">Tuition Fee</span>
                          <span className="cost-value">{formatCurrencyByCountry(tuition_fee, country)}</span>
                        </div>
                      </div>
                    )}
                    
                    {living_cost && (
                      <div className="cost-item">
                        <div className="cost-icon">🏠</div>
                        <div className="cost-content">
                          <span className="cost-label">Living Cost</span>
                          <span className="cost-value">{formatCurrencyByCountry(living_cost, country)}</span>
                        </div>
                      </div>
                    )}
                    
                    {application_fee && (
                      <div className="cost-item">
                        <div className="cost-icon">📄</div>
                        <div className="cost-content">
                          <span className="cost-label">Application Fee</span>
                          <span className="cost-value">{formatCurrencyByCountry(application_fee, country)}</span>
                        </div>
                      </div>
                    )}
                    
                    {totalCost > 0 && (
                      <div className="cost-item total">
                        <div className="cost-icon">💳</div>
                        <div className="cost-content">
                          <span className="cost-label">Total Annual Cost</span>
                          <span className="cost-value">{formatCurrencyByCountry(totalCost, country)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="sidebar-section actions-section">
                <h3>🚀 Quick Actions</h3>
                <div className="action-buttons">
                  {website && (
                    <a
                      href={website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary"
                    >
                      🌐 Visit Website
                    </a>
                  )}
                  
                  <button 
                    className="btn btn-secondary"
                    onClick={() => navigate('/recommendations')}
                  >
                    🎯 Get Recommendations
                  </button>
                  
                  <button 
                    className="btn btn-outline"
                    onClick={() => navigate('/search')}
                  >
                    📊 Compare Universities
                  </button>
                </div>
              </div>

              {/* University Info */}
              <div className="sidebar-section info-section">
                <h3>ℹ️ University Information</h3>
                <div className="info-list">
                  <div className="info-item">
                    <div className="info-icon">🏛️</div>
                    <div className="info-content">
                      <span className="info-label">Type</span>
                      <span className="info-value">{type || 'N/A'}</span>
                    </div>
                  </div>
                  
                  {established && (
                    <div className="info-item">
                      <div className="info-icon">📅</div>
                      <div className="info-content">
                        <span className="info-label">Established</span>
                        <span className="info-value">{established}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="info-item">
                    <div className="info-icon">📍</div>
                    <div className="info-content">
                      <span className="info-label">Location</span>
                      <span className="info-value">
                        {city}{state && `, ${state}`}, {country}
                      </span>
                    </div>
                  </div>
                  
                  {ranking && (
                    <div className="info-item">
                      <div className="info-icon">🏆</div>
                      <div className="info-content">
                        <span className="info-label">World Ranking</span>
                        <span className="info-value">#{ranking}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversityDetailPage;