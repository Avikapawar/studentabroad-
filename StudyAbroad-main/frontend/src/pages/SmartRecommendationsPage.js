import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import './SmartRecommendationsPage.css';

const SmartRecommendationsPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  
  // Load saved profile from localStorage or use defaults
  const getInitialProfile = () => {
    const savedProfile = localStorage.getItem('academicProfile');
    if (savedProfile) {
      try {
        return JSON.parse(savedProfile);
      } catch (e) {
        console.error('Error loading saved profile:', e);
      }
    }
    return {
      cgpa: 3.5,
      gre_score: 315,
      ielts_score: 7.0,
      toefl_score: 95,
      field_of_study: 'Computer Science',
      preferred_countries: 'US,UK,CA',
      budget_max: 60000
    };
  };

  const [userProfile, setUserProfile] = useState(getInitialProfile);

  // Load profile from backend if authenticated, otherwise use localStorage
  useEffect(() => {
    const loadProfile = async () => {
      if (isAuthenticated) {
        try {
          const result = await userService.getProfile();
          if (result.success && result.profile) {
            const backendProfile = {
              cgpa: result.profile.cgpa || 3.5,
              gre_score: result.profile.gre_score || 315,
              ielts_score: result.profile.ielts_score || 7.0,
              toefl_score: result.profile.toefl_score || 95,
              field_of_study: result.profile.field_of_study || 'Computer Science',
              preferred_countries: result.profile.preferred_countries ? 
                (Array.isArray(result.profile.preferred_countries) ? 
                  result.profile.preferred_countries.join(',') : 
                  JSON.parse(result.profile.preferred_countries).join(',')) : 
                'US,UK,CA',
              budget_max: result.profile.budget_max || 60000
            };
            setUserProfile(backendProfile);
            // Also save to localStorage for offline access
            localStorage.setItem('academicProfile', JSON.stringify(backendProfile));
          }
        } catch (error) {
          console.error('Error loading profile from backend:', error);
          // Fall back to localStorage
        }
      }
      setProfileLoading(false);
    };

    loadProfile();
  }, [isAuthenticated]);

  // Save profile to localStorage whenever it changes (for non-authenticated users)
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('academicProfile', JSON.stringify(userProfile));
    }
  }, [userProfile, isAuthenticated]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearProfile = () => {
    const defaultProfile = {
      cgpa: 3.5,
      gre_score: 315,
      ielts_score: 7.0,
      toefl_score: 95,
      field_of_study: 'Computer Science',
      preferred_countries: 'US,UK,CA',
      budget_max: 60000
    };
    setUserProfile(defaultProfile);
    localStorage.removeItem('academicProfile');
  };

  const generateRecommendations = async () => {
    setLoading(true);
    setError(null);
    setHasGenerated(true);

    try {
      console.log('Calling API with profile:', userProfile);
      
      const response = await fetch('http://localhost:5000/api/recommendations/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          max_recommendations: 20,
          filters: {},
          user_profile: {
            cgpa: parseFloat(userProfile.cgpa),
            gre_score: parseInt(userProfile.gre_score),
            ielts_score: parseFloat(userProfile.ielts_score),
            toefl_score: parseInt(userProfile.toefl_score),
            field_of_study: userProfile.field_of_study,
            preferred_countries: userProfile.preferred_countries,
            budget_min: 0,
            budget_max: parseInt(userProfile.budget_max)
          }
        })
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response data:', data);

      if (data.success && data.recommendations) {
        setRecommendations(data.recommendations);
        console.log('Set recommendations:', data.recommendations.length);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Error generating recommendations:', err);
      setError(err.message || 'Failed to generate recommendations. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="smart-recommendations-page">
      <div className="container">
        <div className="header">
          <h1>🎯 AI-Powered University Recommendations</h1>
          <p>Get personalized university matches using machine learning</p>
        </div>

        {/* User Profile Form */}
        <div className="profile-form">
          <div className="profile-header">
            <h2>Your Academic Profile</h2>
            <div className="profile-actions">
              {isAuthenticated && (
                <button 
                  className="edit-profile-btn" 
                  onClick={() => navigate('/profile')}
                  title="Edit your profile settings"
                >
                  ⚙️ Edit Profile
                </button>
              )}
              <button className="clear-btn" onClick={clearProfile} title="Reset to defaults">
                🔄 Reset
              </button>
            </div>
          </div>
          {isAuthenticated && (
            <div className="profile-info-banner">
              <span className="info-icon">ℹ️</span>
              <span>Profile loaded from your account settings. <a href="/profile">Edit in Profile Settings</a> to save permanently.</span>
            </div>
          )}
          <div className="form-grid">
            <div className="form-group">
              <label>CGPA (out of 4.0)</label>
              <input
                type="number"
                name="cgpa"
                value={userProfile.cgpa}
                onChange={handleInputChange}
                min="0"
                max="4"
                step="0.1"
              />
            </div>

            <div className="form-group">
              <label>GRE Score</label>
              <input
                type="number"
                name="gre_score"
                value={userProfile.gre_score}
                onChange={handleInputChange}
                min="260"
                max="340"
              />
            </div>

            <div className="form-group">
              <label>IELTS Score</label>
              <input
                type="number"
                name="ielts_score"
                value={userProfile.ielts_score}
                onChange={handleInputChange}
                min="0"
                max="9"
                step="0.5"
              />
            </div>

            <div className="form-group">
              <label>TOEFL Score</label>
              <input
                type="number"
                name="toefl_score"
                value={userProfile.toefl_score}
                onChange={handleInputChange}
                min="0"
                max="120"
              />
            </div>

            <div className="form-group">
              <label>Field of Study</label>
              <select
                name="field_of_study"
                value={userProfile.field_of_study}
                onChange={handleInputChange}
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Engineering">Engineering</option>
                <option value="Business Administration">Business Administration</option>
                <option value="Medicine">Medicine</option>
                <option value="Law">Law</option>
                <option value="Arts">Arts</option>
                <option value="Science">Science</option>
              </select>
            </div>

            <div className="form-group">
              <label>Preferred Countries (comma-separated)</label>
              <input
                type="text"
                name="preferred_countries"
                value={userProfile.preferred_countries}
                onChange={handleInputChange}
                placeholder="US,UK,CA"
              />
            </div>

            <div className="form-group">
              <label>Maximum Budget (USD/year)</label>
              <input
                type="number"
                name="budget_max"
                value={userProfile.budget_max}
                onChange={handleInputChange}
                min="0"
                step="1000"
              />
            </div>
          </div>

          <button 
            className="generate-btn"
            onClick={generateRecommendations}
            disabled={loading}
          >
            {loading ? '🔄 Analyzing 344 Universities...' : '🎯 Generate Recommendations'}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <p>⚠️ {error}</p>
            <button onClick={generateRecommendations}>Try Again</button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Analyzing 344 universities with AI...</p>
            <p className="loading-detail">Using Random Forest ML model to find your best matches</p>
          </div>
        )}

        {/* Recommendations Results */}
        {!loading && hasGenerated && recommendations.length > 0 && (
          <div className="recommendations-results">
            <div className="results-header">
              <h2>🎓 Your Top {recommendations.length} University Matches</h2>
              <p>Ranked by AI match score and admission probability</p>
            </div>

            <div className="recommendations-grid">
              {recommendations.map((rec, index) => {
                // Extract university data
                const uni = rec.university_data || rec;
                const name = rec.university_name || uni.name || 'Unknown University';
                const matchScore = rec.overall_score || rec.match_score || 0;
                const admissionProb = rec.admission_probability || 0;
                
                return (
                  <div key={uni.id || rec.university_id || index} className="recommendation-card">
                    <div className="card-header">
                      <div className="rank">#{index + 1}</div>
                      <div className="university-info">
                        <h3>{name}</h3>
                        <p className="location">📍 {rec.city || uni.city}, {rec.country || uni.country}</p>
                      </div>
                    </div>

                    <div className="scores">
                      <div className="score-item">
                        <div className="score-label">Match Score</div>
                        <div className="score-value match-score">
                          {(matchScore * 100).toFixed(0)}%
                        </div>
                      </div>
                      <div className="score-item">
                        <div className="score-label">Admission Chance</div>
                        <div className="score-value admission-score">
                          {(admissionProb * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>

                    <div className="university-details">
                      <div className="detail-row">
                        <span className="label">🏆 Ranking:</span>
                        <span className="value">#{uni.ranking || 'N/A'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">💰 Tuition:</span>
                        <span className="value">${(uni.tuition_fee || 0).toLocaleString()}/year</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">📊 CGPA Required:</span>
                        <span className="value">{uni.min_cgpa || 'N/A'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">📝 GRE Required:</span>
                        <span className="value">{uni.min_gre || 'N/A'}</span>
                      </div>
                    </div>

                    {rec.explanation && rec.explanation.reasons && rec.explanation.reasons.length > 0 && (
                      <div className="reasons">
                        <div className="reasons-title">Why this university?</div>
                        <ul>
                          {rec.explanation.reasons.map((reason, idx) => (
                            <li key={idx}>✓ {reason}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="card-actions">
                      <button 
                        className="btn-primary"
                        onClick={() => navigate(`/universities/${uni.id || rec.university_id}`)}
                      >
                        View Details
                      </button>
                      <button 
                        className="btn-secondary"
                        onClick={() => window.open(uni.website, '_blank')}
                      >
                        Visit Website
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* No Results */}
        {!loading && hasGenerated && recommendations.length === 0 && !error && (
          <div className="no-results">
            <p>😕 No recommendations found matching your criteria.</p>
            <p>Try adjusting your profile or budget constraints.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartRecommendationsPage;