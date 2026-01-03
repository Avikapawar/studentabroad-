import React, { useState, useEffect } from 'react';
import universityService from '../../services/universityService';
import './RecommendationFilters.css';

const RecommendationFilters = ({ filters, onFiltersChange, userProfile }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [availableCountries, setAvailableCountries] = useState([]);
  const [availableFields, setAvailableFields] = useState([]);
  const [localFilters, setLocalFilters] = useState({
    countries: [],
    fields: [],
    max_budget: '',
    min_admission_probability: '',
    max_ranking: '',
    min_acceptance_rate: '',
    max_acceptance_rate: '',
    ...filters
  });

  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    setLocalFilters(prev => ({ ...prev, ...filters }));
  }, [filters]);

  const loadFilterOptions = async () => {
    try {
      const [countriesResponse, fieldsResponse] = await Promise.all([
        universityService.getCountries(),
        universityService.getFields()
      ]);

      if (countriesResponse.success) {
        setAvailableCountries(countriesResponse.data || []);
      }

      if (fieldsResponse.success) {
        setAvailableFields(fieldsResponse.data || []);
      }
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    
    // Remove empty values before sending to parent
    const cleanFilters = Object.entries(newFilters).reduce((acc, [k, v]) => {
      if (v !== '' && v !== null && v !== undefined && 
          !(Array.isArray(v) && v.length === 0)) {
        acc[k] = v;
      }
      return acc;
    }, {});

    onFiltersChange(cleanFilters);
  };

  const handleCountryChange = (country) => {
    const currentCountries = localFilters.countries || [];
    const newCountries = currentCountries.includes(country)
      ? currentCountries.filter(c => c !== country)
      : [...currentCountries, country];
    
    handleFilterChange('countries', newCountries);
  };

  const handleFieldChange = (field) => {
    const currentFields = localFilters.fields || [];
    const newFields = currentFields.includes(field)
      ? currentFields.filter(f => f !== field)
      : [...currentFields, field];
    
    handleFilterChange('fields', newFields);
  };

  const clearAllFilters = () => {
    const emptyFilters = {
      countries: [],
      fields: [],
      max_budget: '',
      min_admission_probability: '',
      max_ranking: '',
      min_acceptance_rate: '',
      max_acceptance_rate: ''
    };
    setLocalFilters(emptyFilters);
    onFiltersChange({});
  };

  const hasActiveFilters = () => {
    return Object.values(localFilters).some(value => 
      (Array.isArray(value) && value.length > 0) || 
      (typeof value === 'string' && value !== '') ||
      (typeof value === 'number' && value > 0)
    );
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (localFilters.countries?.length > 0) count++;
    if (localFilters.fields?.length > 0) count++;
    if (localFilters.max_budget) count++;
    if (localFilters.min_admission_probability) count++;
    if (localFilters.max_ranking) count++;
    if (localFilters.min_acceptance_rate || localFilters.max_acceptance_rate) count++;
    return count;
  };

  return (
    <div className="recommendation-filters">
      <div className="filters-header">
        <button 
          className="filters-toggle"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span className="toggle-icon">{isExpanded ? '▼' : '▶'}</span>
          <span>Filters</span>
          {hasActiveFilters() && (
            <span className="active-filters-badge">{getActiveFilterCount()}</span>
          )}
        </button>
        
        {hasActiveFilters() && (
          <button className="clear-filters-btn" onClick={clearAllFilters}>
            Clear All
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="filters-content">
          {/* Countries Filter */}
          <div className="filter-group">
            <label className="filter-label">Countries</label>
            <div className="filter-options">
              {availableCountries.slice(0, 8).map(country => (
                <label key={country} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={localFilters.countries?.includes(country) || false}
                    onChange={() => handleCountryChange(country)}
                  />
                  <span className="checkbox-text">{country}</span>
                </label>
              ))}
              {availableCountries.length > 8 && (
                <div className="more-options">
                  <select 
                    value=""
                    onChange={(e) => e.target.value && handleCountryChange(e.target.value)}
                  >
                    <option value="">More countries...</option>
                    {availableCountries.slice(8).map(country => (
                      <option key={country} value={country}>
                        {country} {localFilters.countries?.includes(country) ? '✓' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            {localFilters.countries?.length > 0 && (
              <div className="selected-items">
                {localFilters.countries.map(country => (
                  <span key={country} className="selected-item">
                    {country}
                    <button onClick={() => handleCountryChange(country)}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Fields of Study Filter */}
          <div className="filter-group">
            <label className="filter-label">Fields of Study</label>
            <div className="filter-options">
              {availableFields.slice(0, 6).map(field => (
                <label key={field} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={localFilters.fields?.includes(field) || false}
                    onChange={() => handleFieldChange(field)}
                  />
                  <span className="checkbox-text">{field}</span>
                </label>
              ))}
              {availableFields.length > 6 && (
                <div className="more-options">
                  <select 
                    value=""
                    onChange={(e) => e.target.value && handleFieldChange(e.target.value)}
                  >
                    <option value="">More fields...</option>
                    {availableFields.slice(6).map(field => (
                      <option key={field} value={field}>
                        {field} {localFilters.fields?.includes(field) ? '✓' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            {localFilters.fields?.length > 0 && (
              <div className="selected-items">
                {localFilters.fields.map(field => (
                  <span key={field} className="selected-item">
                    {field}
                    <button onClick={() => handleFieldChange(field)}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Budget Filter */}
          <div className="filter-group">
            <label className="filter-label">
              Maximum Annual Budget
              {userProfile?.budget_max && (
                <span className="profile-hint">
                  (Your profile: ${userProfile.budget_max.toLocaleString()})
                </span>
              )}
            </label>
            <div className="range-input">
              <input
                type="number"
                placeholder="Max budget (USD)"
                value={localFilters.max_budget}
                onChange={(e) => handleFilterChange('max_budget', e.target.value ? parseInt(e.target.value) : '')}
                min="0"
                step="1000"
              />
              <span className="input-suffix">USD/year</span>
            </div>
          </div>

          {/* Admission Probability Filter */}
          <div className="filter-group">
            <label className="filter-label">Minimum Admission Probability</label>
            <div className="range-input">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={localFilters.min_admission_probability || 0}
                onChange={(e) => handleFilterChange('min_admission_probability', parseFloat(e.target.value))}
              />
              <span className="range-value">
                {localFilters.min_admission_probability ? 
                  `${(localFilters.min_admission_probability * 100).toFixed(0)}%` : 
                  '0%'
                }
              </span>
            </div>
          </div>

          {/* University Ranking Filter */}
          <div className="filter-group">
            <label className="filter-label">Maximum University Ranking</label>
            <div className="range-input">
              <select
                value={localFilters.max_ranking || ''}
                onChange={(e) => handleFilterChange('max_ranking', e.target.value ? parseInt(e.target.value) : '')}
              >
                <option value="">Any ranking</option>
                <option value="10">Top 10</option>
                <option value="25">Top 25</option>
                <option value="50">Top 50</option>
                <option value="100">Top 100</option>
                <option value="200">Top 200</option>
                <option value="500">Top 500</option>
              </select>
            </div>
          </div>

          {/* Acceptance Rate Filter */}
          <div className="filter-group">
            <label className="filter-label">Acceptance Rate Range</label>
            <div className="dual-range">
              <div className="range-input">
                <input
                  type="number"
                  placeholder="Min %"
                  value={localFilters.min_acceptance_rate ? (localFilters.min_acceptance_rate * 100).toFixed(0) : ''}
                  onChange={(e) => handleFilterChange('min_acceptance_rate', e.target.value ? parseFloat(e.target.value) / 100 : '')}
                  min="0"
                  max="100"
                  step="1"
                />
                <span className="input-suffix">%</span>
              </div>
              <span className="range-separator">to</span>
              <div className="range-input">
                <input
                  type="number"
                  placeholder="Max %"
                  value={localFilters.max_acceptance_rate ? (localFilters.max_acceptance_rate * 100).toFixed(0) : ''}
                  onChange={(e) => handleFilterChange('max_acceptance_rate', e.target.value ? parseFloat(e.target.value) / 100 : '')}
                  min="0"
                  max="100"
                  step="1"
                />
                <span className="input-suffix">%</span>
              </div>
            </div>
          </div>

          {/* Quick Filter Presets */}
          <div className="filter-group">
            <label className="filter-label">Quick Filters</label>
            <div className="quick-filters">
              <button 
                className="quick-filter-btn"
                onClick={() => handleFilterChange('min_admission_probability', 0.6)}
              >
                High Probability (60%+)
              </button>
              <button 
                className="quick-filter-btn"
                onClick={() => handleFilterChange('max_ranking', 100)}
              >
                Top 100 Universities
              </button>
              {userProfile?.budget_max && (
                <button 
                  className="quick-filter-btn"
                  onClick={() => handleFilterChange('max_budget', userProfile.budget_max)}
                >
                  Within My Budget
                </button>
              )}
              {userProfile?.preferred_countries && (
                <button 
                  className="quick-filter-btn"
                  onClick={() => handleFilterChange('countries', userProfile.preferred_countries.split(',').map(c => c.trim()))}
                >
                  My Preferred Countries
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendationFilters;