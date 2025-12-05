import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import userService from '../services/userService';
import './ProfilePage.css';

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    cgpa: '',
    gre_score: '',
    ielts_score: '',
    toefl_score: '',
    field_of_study: '',
    preferred_countries: [],
    budget_min: '',
    budget_max: ''
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [currentResume, setCurrentResume] = useState(null);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  
  const { isAuthenticated, user, updateUser } = useAuth();
  const navigate = useNavigate();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (isAuthenticated) {
        try {
          const result = await userService.getProfile();
          if (result.success) {
            setProfile(result.profile);
            setFormData({
              cgpa: result.profile.cgpa || '',
              gre_score: result.profile.gre_score || '',
              ielts_score: result.profile.ielts_score || '',
              toefl_score: result.profile.toefl_score || '',
              field_of_study: result.profile.field_of_study || '',
              preferred_countries: result.profile.preferred_countries ? 
                JSON.parse(result.profile.preferred_countries) : [],
              budget_min: result.profile.budget_min || '',
              budget_max: result.profile.budget_max || ''
            });
            // Set current resume if exists
            setCurrentResume(result.profile.resume_url || null);
          } else {
            console.error('Failed to load profile:', result.error);
          }
        } catch (error) {
          console.error('Error loading profile:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadProfile();
  }, [isAuthenticated]);

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

  const handleCountryChange = (e) => {
    const value = e.target.value;
    const countries = value.split(',').map(country => country.trim()).filter(country => country);
    setFormData(prev => ({
      ...prev,
      preferred_countries: countries
    }));
    
    if (errors.preferred_countries) {
      setErrors(prev => ({
        ...prev,
        preferred_countries: ''
      }));
    }
  };

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          resume: 'Please upload a PDF or Word document'
        }));
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          resume: 'File size must be less than 5MB'
        }));
        return;
      }
      
      setResumeFile(file);
      setErrors(prev => ({
        ...prev,
        resume: ''
      }));
    }
  };

  const handleResumeUpload = async () => {
    if (!resumeFile) return;
    
    setResumeUploading(true);
    try {
      const result = await userService.uploadResume(resumeFile);
      
      if (result.success) {
        setCurrentResume(result.resumeUrl);
        setResumeFile(null);
        setSuccessMessage('Resume uploaded successfully!');
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrors(prev => ({
          ...prev,
          resume: result.error || 'Failed to upload resume. Please try again.'
        }));
      }
    } catch (error) {
      console.error('Error uploading resume:', error);
      setErrors(prev => ({
        ...prev,
        resume: 'Failed to upload resume. Please try again.'
      }));
    } finally {
      setResumeUploading(false);
    }
  };

  const handleResumeDelete = async () => {
    try {
      const result = await userService.deleteResume();
      
      if (result.success) {
        setCurrentResume(null);
        setSuccessMessage('Resume deleted successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrors(prev => ({
          ...prev,
          resume: result.error || 'Failed to delete resume. Please try again.'
        }));
      }
    } catch (error) {
      console.error('Error deleting resume:', error);
      setErrors(prev => ({
        ...prev,
        resume: 'Failed to delete resume. Please try again.'
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate CGPA
    if (formData.cgpa) {
      const cgpaValidation = userService.validateCGPA(formData.cgpa);
      if (!cgpaValidation.isValid) {
        newErrors.cgpa = cgpaValidation.message;
      }
    }
    
    // Validate GRE score
    if (formData.gre_score) {
      const greValidation = userService.validateGREScore(formData.gre_score);
      if (!greValidation.isValid) {
        newErrors.gre_score = greValidation.message;
      }
    }
    
    // Validate IELTS score
    if (formData.ielts_score) {
      const ieltsValidation = userService.validateIELTSScore(formData.ielts_score);
      if (!ieltsValidation.isValid) {
        newErrors.ielts_score = ieltsValidation.message;
      }
    }
    
    // Validate TOEFL score
    if (formData.toefl_score) {
      const toeflValidation = userService.validateTOEFLScore(formData.toefl_score);
      if (!toeflValidation.isValid) {
        newErrors.toefl_score = toeflValidation.message;
      }
    }
    
    // Validate budget
    const budgetValidation = userService.validateBudget(formData.budget_min, formData.budget_max);
    if (!budgetValidation.isValid) {
      newErrors.budget = budgetValidation.message;
    }
    
    // Validate countries
    const countriesValidation = userService.validateCountries(formData.preferred_countries);
    if (!countriesValidation.isValid) {
      newErrors.preferred_countries = countriesValidation.message;
    }
    
    // Validate field of study
    if (formData.field_of_study && formData.field_of_study.length > 255) {
      newErrors.field_of_study = 'Field of study is too long (max 255 characters)';
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
    setSuccessMessage('');
    
    try {
      const updateData = {
        ...formData,
        cgpa: formData.cgpa ? parseFloat(formData.cgpa) : null,
        gre_score: formData.gre_score ? parseInt(formData.gre_score) : null,
        ielts_score: formData.ielts_score ? parseFloat(formData.ielts_score) : null,
        toefl_score: formData.toefl_score ? parseInt(formData.toefl_score) : null,
        budget_min: formData.budget_min ? parseFloat(formData.budget_min) : null,
        budget_max: formData.budget_max ? parseFloat(formData.budget_max) : null,
        preferred_countries: formData.preferred_countries
      };
      
      const result = await userService.updateProfile(updateData);
      
      if (result.success) {
        setProfile(result.profile);
        updateUser(result.profile);
        setIsEditing(false);
        setSuccessMessage('Profile updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        if (result.details && Array.isArray(result.details)) {
          const fieldErrors = {};
          result.details.forEach(detail => {
            const [field, message] = detail.split(': ');
            fieldErrors[field.toLowerCase()] = message;
          });
          setErrors(fieldErrors);
        } else {
          setErrors({ general: result.error || 'Failed to update profile' });
        }
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        cgpa: profile.cgpa || '',
        gre_score: profile.gre_score || '',
        ielts_score: profile.ielts_score || '',
        toefl_score: profile.toefl_score || '',
        field_of_study: profile.field_of_study || '',
        preferred_countries: profile.preferred_countries ? 
          JSON.parse(profile.preferred_countries) : [],
        budget_min: profile.budget_min || '',
        budget_max: profile.budget_max || ''
      });
    }
    setIsEditing(false);
    setErrors({});
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="loading-spinner">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-page">
        <div className="error-message">Failed to load profile</div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h1>My Profile</h1>
          {!isEditing && (
            <button 
              className="btn btn-secondary"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>
          )}
        </div>

        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}

        {errors.general && (
          <div className="error-message general-error">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="profile-form">
          {/* Basic Information */}
          <div className="form-section">
            <h3>Basic Information</h3>
            
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                value={user?.email || ''}
                disabled
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Field of Study</label>
              <input
                type="text"
                name="field_of_study"
                className={`form-input ${errors.field_of_study ? 'error' : ''}`}
                value={formData.field_of_study}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="e.g., Computer Science, Engineering, Business"
              />
              {errors.field_of_study && (
                <div className="error-message">{errors.field_of_study}</div>
              )}
            </div>
          </div>

          {/* Academic Credentials */}
          <div className="form-section">
            <h3>Academic Credentials</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">CGPA (0.0 - 4.0)</label>
                <input
                  type="number"
                  name="cgpa"
                  step="0.01"
                  min="0"
                  max="4"
                  className={`form-input ${errors.cgpa ? 'error' : ''}`}
                  value={formData.cgpa}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="e.g., 3.75"
                />
                {errors.cgpa && (
                  <div className="error-message">{errors.cgpa}</div>
                )}
              </div>
              
              <div className="form-group">
                <label className="form-label">GRE Score (260 - 340)</label>
                <input
                  type="number"
                  name="gre_score"
                  min="260"
                  max="340"
                  className={`form-input ${errors.gre_score ? 'error' : ''}`}
                  value={formData.gre_score}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="e.g., 320"
                />
                {errors.gre_score && (
                  <div className="error-message">{errors.gre_score}</div>
                )}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">IELTS Score (0.0 - 9.0)</label>
                <input
                  type="number"
                  name="ielts_score"
                  step="0.5"
                  min="0"
                  max="9"
                  className={`form-input ${errors.ielts_score ? 'error' : ''}`}
                  value={formData.ielts_score}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="e.g., 7.5"
                />
                {errors.ielts_score && (
                  <div className="error-message">{errors.ielts_score}</div>
                )}
              </div>
              
              <div className="form-group">
                <label className="form-label">TOEFL Score (0 - 120)</label>
                <input
                  type="number"
                  name="toefl_score"
                  min="0"
                  max="120"
                  className={`form-input ${errors.toefl_score ? 'error' : ''}`}
                  value={formData.toefl_score}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="e.g., 100"
                />
                {errors.toefl_score && (
                  <div className="error-message">{errors.toefl_score}</div>
                )}
              </div>
            </div>
          </div>

          {/* Resume Section */}
          <div className="form-section">
            <h3>Resume/CV</h3>
            
            {currentResume ? (
              <div className="resume-current">
                <div className="resume-info">
                  <div className="resume-icon">📄</div>
                  <div className="resume-details">
                    <div className="resume-name">Current Resume</div>
                    <div className="resume-actions">
                      <a 
                        href={currentResume} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-outline"
                      >
                        📥 Download
                      </a>
                      <button 
                        type="button"
                        onClick={() => window.open(currentResume, '_blank')}
                        className="btn btn-sm btn-outline"
                      >
                        👁️ Preview
                      </button>
                      {isEditing && (
                        <button 
                          type="button"
                          onClick={handleResumeDelete}
                          className="btn btn-sm btn-danger"
                        >
                          🗑️ Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="resume-empty">
                <div className="resume-empty-icon">📄</div>
                <p>No resume uploaded yet</p>
              </div>
            )}

            {isEditing && (
              <div className="resume-upload">
                <div className="form-group">
                  <label className="form-label">Upload New Resume</label>
                  <div className="file-upload-area">
                    <input
                      type="file"
                      id="resume-upload"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeChange}
                      className="file-input"
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="resume-upload" className="file-upload-label">
                      <div className="file-upload-content">
                        <div className="file-upload-icon">📁</div>
                        <div className="file-upload-text">
                          <strong>Click to upload</strong> or drag and drop
                        </div>
                        <div className="file-upload-hint">
                          PDF, DOC, DOCX (Max 5MB)
                        </div>
                      </div>
                    </label>
                  </div>
                  
                  {resumeFile && (
                    <div className="file-selected">
                      <div className="file-info">
                        <span className="file-name">📄 {resumeFile.name}</span>
                        <span className="file-size">({(resumeFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleResumeUpload}
                        disabled={resumeUploading}
                        className="btn btn-primary btn-sm"
                      >
                        {resumeUploading ? '⏳ Uploading...' : '⬆️ Upload'}
                      </button>
                    </div>
                  )}
                  
                  {errors.resume && (
                    <div className="error-message">{errors.resume}</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Preferences */}
          <div className="form-section">
            <h3>Preferences</h3>
            
            <div className="form-group">
              <label className="form-label">Preferred Countries</label>
              <input
                type="text"
                className={`form-input ${errors.preferred_countries ? 'error' : ''}`}
                value={formData.preferred_countries.join(', ')}
                onChange={handleCountryChange}
                disabled={!isEditing}
                placeholder="e.g., USA, Canada, UK, Germany (comma-separated)"
              />
              {errors.preferred_countries && (
                <div className="error-message">{errors.preferred_countries}</div>
              )}
              <div className="form-help">
                Enter up to 10 countries, separated by commas
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Minimum Budget (USD)</label>
                <input
                  type="number"
                  name="budget_min"
                  min="0"
                  className={`form-input ${errors.budget ? 'error' : ''}`}
                  value={formData.budget_min}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="e.g., 20000"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Maximum Budget (USD)</label>
                <input
                  type="number"
                  name="budget_max"
                  min="0"
                  className={`form-input ${errors.budget ? 'error' : ''}`}
                  value={formData.budget_max}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="e.g., 50000"
                />
              </div>
            </div>
            {errors.budget && (
              <div className="error-message">{errors.budget}</div>
            )}
          </div>

          {isEditing && (
            <div className="form-actions">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default ProfilePage;