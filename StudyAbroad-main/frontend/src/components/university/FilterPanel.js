import React, { useState, useEffect } from 'react';
import universityService from '../../services/universityService';
import { BUDGET_RANGES } from '../../utils/constants';

const FilterPanel = ({ filters, onFilterChange, onClearFilters, isVisible, onClose }) => {
  const [countries, setCountries] = useState([]);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    location: true,
    academic: false,
    financial: false,
    requirements: false,
    university: false
  });
  
  // Search states for filtering options
  const [countrySearch, setCountrySearch] = useState('');
  const [fieldSearch, setFieldSearch] = useState('');

  // Load countries and fields on component mount
  useEffect(() => {
    const loadFilterData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [countriesResponse, fieldsResponse] = await Promise.all([
          universityService.getCountries(),
          universityService.getFields()
        ]);

        if (countriesResponse.success) {
          setCountries(countriesResponse.data);
        } else {
          throw new Error('Failed to load countries');
        }
        
        if (fieldsResponse.success) {
          setFields(fieldsResponse.data);
        } else {
          throw new Error('Failed to load fields');
        }
      } catch (error) {
        console.error('Error loading filter data:', error);
        setError(error.message);
        // Set fallback data with all available countries
        setCountries([
          { code: 'AR', name: 'Argentina' },
          { code: 'AT', name: 'Austria' },
          { code: 'AU', name: 'Australia' },
          { code: 'BE', name: 'Belgium' },
          { code: 'BR', name: 'Brazil' },
          { code: 'CA', name: 'Canada' },
          { code: 'CH', name: 'Switzerland' },
          { code: 'CL', name: 'Chile' },
          { code: 'CN', name: 'China' },
          { code: 'CZ', name: 'Czech Republic' },
          { code: 'DE', name: 'Germany' },
          { code: 'DK', name: 'Denmark' },
          { code: 'ES', name: 'Spain' },
          { code: 'FI', name: 'Finland' },
          { code: 'FR', name: 'France' },
          { code: 'HK', name: 'Hong Kong' },
          { code: 'IE', name: 'Ireland' },
          { code: 'IL', name: 'Israel' },
          { code: 'IN', name: 'India' },
          { code: 'IT', name: 'Italy' },
          { code: 'JP', name: 'Japan' },
          { code: 'KR', name: 'South Korea' },
          { code: 'MX', name: 'Mexico' },
          { code: 'MY', name: 'Malaysia' },
          { code: 'NL', name: 'Netherlands' },
          { code: 'NO', name: 'Norway' },
          { code: 'NZ', name: 'New Zealand' },
          { code: 'PL', name: 'Poland' },
          { code: 'PT', name: 'Portugal' },
          { code: 'RU', name: 'Russia' },
          { code: 'SE', name: 'Sweden' },
          { code: 'SG', name: 'Singapore' },
          { code: 'TH', name: 'Thailand' },
          { code: 'TR', name: 'Turkey' },
          { code: 'UK', name: 'United Kingdom' },
          { code: 'US', name: 'United States' },
          { code: 'ZA', name: 'South Africa' }
        ]);
        setFields([
          { id: 1, name: 'Computer Science' },
          { id: 2, name: 'Engineering' },
          { id: 3, name: 'Business Administration' },
          { id: 4, name: 'Medicine' },
          { id: 5, name: 'Law' },
          { id: 6, name: 'Psychology' },
          { id: 7, name: 'Economics' },
          { id: 8, name: 'Mathematics' },
          { id: 9, name: 'Physics' },
          { id: 10, name: 'Arts and Humanities' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadFilterData();
  }, []);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    onFilterChange({ [key]: value });
  };

  // Handle array filter changes (countries, fields)
  const handleArrayFilterChange = (key, value, checked) => {
    const currentValues = filters[key] || [];
    let newValues;
    
    if (checked) {
      newValues = [...currentValues, value];
    } else {
      newValues = currentValues.filter(v => v !== value);
    }
    
    onFilterChange({ [key]: newValues });
  };

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(value => 
    value && value !== '' && (!Array.isArray(value) || value.length > 0)
  );
  
  // Filter countries and fields based on search
  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(countrySearch.toLowerCase())
  );
  
  const filteredFields = fields.filter(field =>
    field.name.toLowerCase().includes(fieldSearch.toLowerCase())
  );
  
  // Handle preset filter combinations
  const handlePresetFilter = (preset) => {
    switch (preset) {
      case 'top-universities':
        onFilterChange({
          min_ranking: 1,
          max_ranking: 50
        });
        break;
      case 'affordable':
        onFilterChange({
          min_tuition: 0,
          max_tuition: 30000
        });
        break;
      case 'high-acceptance':
        onFilterChange({
          min_acceptance_rate: 0.3,
          max_acceptance_rate: 1.0
        });
        break;
      case 'english-speaking':
        onFilterChange({
          country: ['US', 'UK', 'CA', 'AU', 'IE', 'NZ', 'ZA', 'SG', 'HK']
        });
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <div className={`filter-panel ${isVisible ? 'visible' : ''}`}>
        <div className="filter-header">
          <h3>Filters</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="filter-loading">Loading filters...</div>
      </div>
    );
  }

  return (
    <div className={`filter-panel ${isVisible ? 'visible' : ''}`}>
      <div className="filter-header">
        <h3>Filters</h3>
        <div className="filter-actions">
          {hasActiveFilters && (
            <button className="clear-filters-btn" onClick={onClearFilters}>
              Clear All
            </button>
          )}
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
      </div>

      <div className="filter-content">
        {/* Quick Presets */}
        <div className="filter-section">
          <div className="section-header-static">
            <span>Quick Filters</span>
          </div>
          <div className="section-content">
            <div className="preset-filters">
              <button
                className="preset-btn"
                onClick={() => handlePresetFilter('top-universities')}
              >
                🏆 Top 50 Universities
              </button>
              <button
                className="preset-btn"
                onClick={() => handlePresetFilter('affordable')}
              >
                💰 Affordable Options
              </button>
              <button
                className="preset-btn"
                onClick={() => handlePresetFilter('high-acceptance')}
              >
                ✅ High Acceptance Rate
              </button>
              <button
                className="preset-btn"
                onClick={() => handlePresetFilter('english-speaking')}
              >
                🗣️ English Speaking
              </button>
            </div>
          </div>
        </div>

        {/* Location Filters */}
        <div className="filter-section">
          <button
            className="section-header"
            onClick={() => toggleSection('location')}
          >
            <span>Location</span>
            <span className={`expand-icon ${expandedSections.location ? 'expanded' : ''}`}>
              ▼
            </span>
          </button>
          
          {expandedSections.location && (
            <div className="section-content">
              <div className="filter-group">
                <label>Countries</label>
                {countries.length > 8 && (
                  <input
                    type="text"
                    placeholder="Search countries..."
                    value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)}
                    className="search-input"
                  />
                )}
                <div className="checkbox-group">
                  {filteredCountries.map((country) => (
                    <label key={country.code} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={(filters.country || []).includes(country.code)}
                        onChange={(e) => handleArrayFilterChange('country', country.code, e.target.checked)}
                      />
                      <span>{country.name}</span>
                    </label>
                  ))}
                  {filteredCountries.length === 0 && countrySearch && (
                    <div className="no-results-text">No countries found</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Academic Filters */}
        <div className="filter-section">
          <button
            className="section-header"
            onClick={() => toggleSection('academic')}
          >
            <span>Academic</span>
            <span className={`expand-icon ${expandedSections.academic ? 'expanded' : ''}`}>
              ▼
            </span>
          </button>
          
          {expandedSections.academic && (
            <div className="section-content">
              <div className="filter-group">
                <label>Fields of Study</label>
                {fields.length > 8 && (
                  <input
                    type="text"
                    placeholder="Search fields..."
                    value={fieldSearch}
                    onChange={(e) => setFieldSearch(e.target.value)}
                    className="search-input"
                  />
                )}
                <div className="checkbox-group">
                  {filteredFields.map((field) => (
                    <label key={field.id} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={(filters.field || []).includes(field.name)}
                        onChange={(e) => handleArrayFilterChange('field', field.name, e.target.checked)}
                      />
                      <span>{field.name}</span>
                    </label>
                  ))}
                  {filteredFields.length === 0 && fieldSearch && (
                    <div className="no-results-text">No fields found</div>
                  )}
                </div>
              </div>

              <div className="filter-group">
                <label>Ranking Range</label>
                <div className="range-inputs">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.min_ranking || ''}
                    onChange={(e) => handleFilterChange('min_ranking', e.target.value)}
                    min="1"
                  />
                  <span>to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.max_ranking || ''}
                    onChange={(e) => handleFilterChange('max_ranking', e.target.value)}
                    min="1"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Financial Filters */}
        <div className="filter-section">
          <button
            className="section-header"
            onClick={() => toggleSection('financial')}
          >
            <span>Financial</span>
            <span className={`expand-icon ${expandedSections.financial ? 'expanded' : ''}`}>
              ▼
            </span>
          </button>
          
          {expandedSections.financial && (
            <div className="section-content">
              <div className="filter-group">
                <label>Tuition Fee Range (USD)</label>
                <div className="range-inputs">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.min_tuition || ''}
                    onChange={(e) => handleFilterChange('min_tuition', e.target.value)}
                    min="0"
                  />
                  <span>to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.max_tuition || ''}
                    onChange={(e) => handleFilterChange('max_tuition', e.target.value)}
                    min="0"
                  />
                </div>
              </div>

              <div className="filter-group">
                <label>Quick Budget Ranges</label>
                <div className="budget-ranges">
                  {BUDGET_RANGES.map((range, index) => (
                    <button
                      key={index}
                      className={`budget-range-btn ${
                        filters.min_tuition == range.min && filters.max_tuition == range.max ? 'active' : ''
                      }`}
                      onClick={() => {
                        handleFilterChange('min_tuition', range.min);
                        handleFilterChange('max_tuition', range.max);
                      }}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Requirements Filters */}
        <div className="filter-section">
          <button
            className="section-header"
            onClick={() => toggleSection('requirements')}
          >
            <span>Requirements</span>
            <span className={`expand-icon ${expandedSections.requirements ? 'expanded' : ''}`}>
              ▼
            </span>
          </button>
          
          {expandedSections.requirements && (
            <div className="section-content">
              <div className="filter-group">
                <label>CGPA Range</label>
                <div className="range-inputs">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.min_cgpa || ''}
                    onChange={(e) => handleFilterChange('min_cgpa', e.target.value)}
                    min="0"
                    max="4"
                    step="0.1"
                  />
                  <span>to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.max_cgpa || ''}
                    onChange={(e) => handleFilterChange('max_cgpa', e.target.value)}
                    min="0"
                    max="4"
                    step="0.1"
                  />
                </div>
              </div>

              <div className="filter-group">
                <label>GRE Score Range</label>
                <div className="range-inputs">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.min_gre || ''}
                    onChange={(e) => handleFilterChange('min_gre', e.target.value)}
                    min="260"
                    max="340"
                  />
                  <span>to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.max_gre || ''}
                    onChange={(e) => handleFilterChange('max_gre', e.target.value)}
                    min="260"
                    max="340"
                  />
                </div>
              </div>

              <div className="filter-group">
                <label>IELTS Score Range</label>
                <div className="range-inputs">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.min_ielts || ''}
                    onChange={(e) => handleFilterChange('min_ielts', e.target.value)}
                    min="0"
                    max="9"
                    step="0.5"
                  />
                  <span>to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.max_ielts || ''}
                    onChange={(e) => handleFilterChange('max_ielts', e.target.value)}
                    min="0"
                    max="9"
                    step="0.5"
                  />
                </div>
              </div>

              <div className="filter-group">
                <label>TOEFL Score Range</label>
                <div className="range-inputs">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.min_toefl || ''}
                    onChange={(e) => handleFilterChange('min_toefl', e.target.value)}
                    min="0"
                    max="120"
                  />
                  <span>to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.max_toefl || ''}
                    onChange={(e) => handleFilterChange('max_toefl', e.target.value)}
                    min="0"
                    max="120"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* University Filters */}
        <div className="filter-section">
          <button
            className="section-header"
            onClick={() => toggleSection('university')}
          >
            <span>University</span>
            <span className={`expand-icon ${expandedSections.university ? 'expanded' : ''}`}>
              ▼
            </span>
          </button>
          
          {expandedSections.university && (
            <div className="section-content">
              <div className="filter-group">
                <label>University Type</label>
                <select
                  value={filters.type || ''}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="Public">Public</option>
                  <option value="Private">Private</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Acceptance Rate Range</label>
                <div className="range-inputs">
                  <input
                    type="number"
                    placeholder="Min %"
                    value={filters.min_acceptance_rate ? (filters.min_acceptance_rate * 100) : ''}
                    onChange={(e) => handleFilterChange('min_acceptance_rate', e.target.value ? e.target.value / 100 : '')}
                    min="0"
                    max="100"
                  />
                  <span>to</span>
                  <input
                    type="number"
                    placeholder="Max %"
                    value={filters.max_acceptance_rate ? (filters.max_acceptance_rate * 100) : ''}
                    onChange={(e) => handleFilterChange('max_acceptance_rate', e.target.value ? e.target.value / 100 : '')}
                    min="0"
                    max="100"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;