import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './PreferencesPage.css';

const PreferencesPage = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState({
    // Notification Preferences
    emailNotifications: true,
    applicationDeadlines: true,
    newRecommendations: true,
    universityUpdates: false,
    newsletterSubscription: true,

    // Display Preferences
    theme: 'light',
    language: 'en',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',

    // Privacy Preferences
    profileVisibility: 'private',
    showEmail: false,
    allowDataCollection: true,

    // Search Preferences
    defaultSortBy: 'ranking',
    resultsPerPage: 12,
    autoSaveSearches: true
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem('userPreferences');
    if (savedPreferences) {
      try {
        setPreferences(JSON.parse(savedPreferences));
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    }
  }, []);

  const handleToggle = (key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSelectChange = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');

    try {
      // Save to localStorage
      localStorage.setItem('userPreferences', JSON.stringify(preferences));

      // In a real app, you would also save to backend
      // await fetch('/api/user/preferences', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(preferences)
      // });

      setSaveMessage('Preferences saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error saving preferences:', error);
      setSaveMessage('Failed to save preferences. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all preferences to default?')) {
      const defaultPreferences = {
        emailNotifications: true,
        applicationDeadlines: true,
        newRecommendations: true,
        universityUpdates: false,
        newsletterSubscription: true,
        theme: 'light',
        language: 'en',
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        profileVisibility: 'private',
        showEmail: false,
        allowDataCollection: true,
        defaultSortBy: 'ranking',
        resultsPerPage: 12,
        autoSaveSearches: true
      };
      setPreferences(defaultPreferences);
      localStorage.setItem('userPreferences', JSON.stringify(defaultPreferences));
      setSaveMessage('Preferences reset to default!');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  return (
    <div className="preferences-page">
      <div className="preferences-container">
        <div className="preferences-header">
          <h1>⚙️ Preferences</h1>
          <p>Customize your StudyAbroad experience</p>
        </div>

        {saveMessage && (
          <div className={`save-message ${saveMessage.includes('Failed') ? 'error' : 'success'}`}>
            {saveMessage}
          </div>
        )}

        {/* Notification Preferences */}
        <div className="preference-section">
          <h2>🔔 Notifications</h2>
          <p className="section-description">Manage how you receive updates and alerts</p>

          <div className="preference-item">
            <div className="preference-info">
              <label>Email Notifications</label>
              <span className="preference-description">Receive important updates via email</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={preferences.emailNotifications}
                onChange={() => handleToggle('emailNotifications')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="preference-item">
            <div className="preference-info">
              <label>Application Deadlines</label>
              <span className="preference-description">Get reminders for upcoming deadlines</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={preferences.applicationDeadlines}
                onChange={() => handleToggle('applicationDeadlines')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="preference-item">
            <div className="preference-info">
              <label>New Recommendations</label>
              <span className="preference-description">Notify when new universities match your profile</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={preferences.newRecommendations}
                onChange={() => handleToggle('newRecommendations')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="preference-item">
            <div className="preference-info">
              <label>University Updates</label>
              <span className="preference-description">Get updates from bookmarked universities</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={preferences.universityUpdates}
                onChange={() => handleToggle('universityUpdates')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="preference-item">
            <div className="preference-info">
              <label>Newsletter Subscription</label>
              <span className="preference-description">Receive our monthly newsletter</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={preferences.newsletterSubscription}
                onChange={() => handleToggle('newsletterSubscription')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        {/* Display Preferences */}
        <div className="preference-section">
          <h2>🎨 Display</h2>
          <p className="section-description">Customize how information is displayed</p>

          <div className="preference-item">
            <div className="preference-info">
              <label>Theme</label>
              <span className="preference-description">Choose your preferred color scheme</span>
            </div>
            <select
              value={preferences.theme}
              onChange={(e) => handleSelectChange('theme', e.target.value)}
              className="preference-select"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto (System)</option>
            </select>
          </div>

          <div className="preference-item">
            <div className="preference-info">
              <label>Language</label>
              <span className="preference-description">Select your preferred language</span>
            </div>
            <select
              value={preferences.language}
              onChange={(e) => handleSelectChange('language', e.target.value)}
              className="preference-select"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="zh">中文</option>
              <option value="ja">日本語</option>
              <option value="ko">한국어</option>
            </select>
          </div>

          <div className="preference-item">
            <div className="preference-info">
              <label>Currency</label>
              <span className="preference-description">Default currency for tuition fees</span>
            </div>
            <select
              value={preferences.currency}
              onChange={(e) => handleSelectChange('currency', e.target.value)}
              className="preference-select"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="CAD">CAD ($)</option>
              <option value="AUD">AUD ($)</option>
              <option value="JPY">JPY (¥)</option>
              <option value="CNY">CNY (¥)</option>
              <option value="INR">INR (₹)</option>
            </select>
          </div>

          <div className="preference-item">
            <div className="preference-info">
              <label>Date Format</label>
              <span className="preference-description">How dates are displayed</span>
            </div>
            <select
              value={preferences.dateFormat}
              onChange={(e) => handleSelectChange('dateFormat', e.target.value)}
              className="preference-select"
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
        </div>

        {/* Privacy Preferences */}
        <div className="preference-section">
          <h2>🔒 Privacy</h2>
          <p className="section-description">Control your privacy and data settings</p>

          <div className="preference-item">
            <div className="preference-info">
              <label>Profile Visibility</label>
              <span className="preference-description">Who can see your profile</span>
            </div>
            <select
              value={preferences.profileVisibility}
              onChange={(e) => handleSelectChange('profileVisibility', e.target.value)}
              className="preference-select"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="friends">Friends Only</option>
            </select>
          </div>

          <div className="preference-item">
            <div className="preference-info">
              <label>Show Email Address</label>
              <span className="preference-description">Display email on your profile</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={preferences.showEmail}
                onChange={() => handleToggle('showEmail')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="preference-item">
            <div className="preference-info">
              <label>Allow Data Collection</label>
              <span className="preference-description">Help us improve with anonymous usage data</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={preferences.allowDataCollection}
                onChange={() => handleToggle('allowDataCollection')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        {/* Search Preferences */}
        <div className="preference-section">
          <h2>🔍 Search</h2>
          <p className="section-description">Customize your search experience</p>

          <div className="preference-item">
            <div className="preference-info">
              <label>Default Sort By</label>
              <span className="preference-description">How search results are sorted by default</span>
            </div>
            <select
              value={preferences.defaultSortBy}
              onChange={(e) => handleSelectChange('defaultSortBy', e.target.value)}
              className="preference-select"
            >
              <option value="ranking">Ranking</option>
              <option value="tuition">Tuition Fee</option>
              <option value="acceptance">Acceptance Rate</option>
              <option value="name">Name</option>
            </select>
          </div>

          <div className="preference-item">
            <div className="preference-info">
              <label>Results Per Page</label>
              <span className="preference-description">Number of universities shown per page</span>
            </div>
            <select
              value={preferences.resultsPerPage}
              onChange={(e) => handleSelectChange('resultsPerPage', parseInt(e.target.value))}
              className="preference-select"
            >
              <option value="6">6</option>
              <option value="12">12</option>
              <option value="24">24</option>
              <option value="48">48</option>
            </select>
          </div>

          <div className="preference-item">
            <div className="preference-info">
              <label>Auto-Save Searches</label>
              <span className="preference-description">Automatically save your search history</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={preferences.autoSaveSearches}
                onChange={() => handleToggle('autoSaveSearches')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="preferences-actions">
          <button
            className="btn-reset"
            onClick={handleReset}
            disabled={isSaving}
          >
            Reset to Default
          </button>
          <button
            className="btn-save"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreferencesPage;
