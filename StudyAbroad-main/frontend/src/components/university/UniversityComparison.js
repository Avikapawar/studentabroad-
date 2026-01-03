import React, { useState, useEffect } from 'react';
import { formatCurrency, formatPercentage } from '../../utils/helpers';

const UniversityComparison = ({ 
  universities, 
  onClose, 
  onRemoveUniversity,
  maxUniversities = 4 
}) => {
  const [selectedFields, setSelectedFields] = useState({
    basic: true,
    costs: true,
    requirements: true,
    statistics: true
  });

  // Get country flag emoji
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
      'SE': '🇸🇪', 'Sweden': '🇸🇪'
    };
    return flags[countryCode] || '🌍';
  };

  // Find best values for highlighting
  const getBestValue = (field, universities) => {
    const values = universities
      .map(uni => uni[field])
      .filter(val => val !== null && val !== undefined && val !== '');
    
    if (values.length === 0) return null;
    
    switch (field) {
      case 'ranking':
        return Math.min(...values);
      case 'tuition_fee':
      case 'living_cost':
        return Math.min(...values);
      case 'acceptance_rate':
        return Math.max(...values);
      case 'min_cgpa':
      case 'min_gre':
      case 'min_ielts':
      case 'min_toefl':
        return Math.min(...values);
      default:
        return null;
    }
  };

  // Check if value is the best among compared universities
  const isBestValue = (field, value, universities) => {
    const bestValue = getBestValue(field, universities);
    return bestValue !== null && value === bestValue;
  };

  // Toggle field visibility
  const toggleField = (field) => {
    setSelectedFields(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!universities || universities.length === 0) {
    return null;
  }

  return (
    <div className="comparison-modal" onClick={onClose}>
      <div className="comparison-content" onClick={(e) => e.stopPropagation()}>
        <div className="comparison-header">
          <h2>University Comparison ({universities.length})</h2>
          <div className="comparison-controls">
            <div className="field-toggles">
              <label className="toggle-item">
                <input
                  type="checkbox"
                  checked={selectedFields.basic}
                  onChange={() => toggleField('basic')}
                />
                Basic Info
              </label>
              <label className="toggle-item">
                <input
                  type="checkbox"
                  checked={selectedFields.costs}
                  onChange={() => toggleField('costs')}
                />
                Costs
              </label>
              <label className="toggle-item">
                <input
                  type="checkbox"
                  checked={selectedFields.requirements}
                  onChange={() => toggleField('requirements')}
                />
                Requirements
              </label>
              <label className="toggle-item">
                <input
                  type="checkbox"
                  checked={selectedFields.statistics}
                  onChange={() => toggleField('statistics')}
                />
                Statistics
              </label>
            </div>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
        </div>

        <div className="comparison-table-container">
          <table className="comparison-table">
            <thead>
              <tr>
                <th className="field-header">Field</th>
                {universities.map((university) => (
                  <th key={university.id} className="university-header">
                    <div className="university-header-content">
                      <span className="university-flag">
                        {getCountryFlag(university.country)}
                      </span>
                      <div className="university-info">
                        <div className="university-name">{university.name}</div>
                        <div className="university-location">
                          {university.city}, {university.country}
                        </div>
                      </div>
                      <button
                        className="remove-university-btn"
                        onClick={() => onRemoveUniversity(university.id)}
                        title="Remove from comparison"
                      >
                        ×
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Basic Information */}
              {selectedFields.basic && (
                <>
                  <tr className="section-header">
                    <td colSpan={universities.length + 1}>Basic Information</td>
                  </tr>
                  <tr>
                    <td className="field-name">Ranking</td>
                    {universities.map((uni) => (
                      <td 
                        key={uni.id}
                        className={isBestValue('ranking', uni.ranking, universities) ? 'best-value' : ''}
                      >
                        {uni.ranking ? `#${uni.ranking}` : 'N/A'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="field-name">Type</td>
                    {universities.map((uni) => (
                      <td key={uni.id}>
                        <span className={`type-badge ${uni.type?.toLowerCase()}`}>
                          {uni.type || 'N/A'}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="field-name">Established</td>
                    {universities.map((uni) => (
                      <td key={uni.id}>{uni.established || 'N/A'}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="field-name">Fields of Study</td>
                    {universities.map((uni) => (
                      <td key={uni.id} className="fields-cell">
                        {uni.fields && uni.fields.length > 0 ? (
                          <div className="fields-list">
                            {uni.fields.slice(0, 3).map((field, index) => (
                              <span key={index} className="field-tag">
                                {field}
                              </span>
                            ))}
                            {uni.fields.length > 3 && (
                              <span className="field-tag more">
                                +{uni.fields.length - 3} more
                              </span>
                            )}
                          </div>
                        ) : 'N/A'}
                      </td>
                    ))}
                  </tr>
                </>
              )}

              {/* Cost Information */}
              {selectedFields.costs && (
                <>
                  <tr className="section-header">
                    <td colSpan={universities.length + 1}>Cost Information</td>
                  </tr>
                  <tr>
                    <td className="field-name">Tuition Fee</td>
                    {universities.map((uni) => (
                      <td 
                        key={uni.id}
                        className={isBestValue('tuition_fee', uni.tuition_fee, universities) ? 'best-value' : ''}
                      >
                        {uni.tuition_fee ? formatCurrency(uni.tuition_fee) : 'N/A'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="field-name">Living Cost</td>
                    {universities.map((uni) => (
                      <td 
                        key={uni.id}
                        className={isBestValue('living_cost', uni.living_cost, universities) ? 'best-value' : ''}
                      >
                        {uni.living_cost ? formatCurrency(uni.living_cost) : 'N/A'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="field-name">Application Fee</td>
                    {universities.map((uni) => (
                      <td key={uni.id}>
                        {uni.application_fee ? formatCurrency(uni.application_fee) : 'N/A'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="field-name">Total Annual Cost</td>
                    {universities.map((uni) => {
                      const total = (uni.tuition_fee || 0) + (uni.living_cost || 0);
                      return (
                        <td key={uni.id} className="total-cost">
                          {total > 0 ? formatCurrency(total) : 'N/A'}
                        </td>
                      );
                    })}
                  </tr>
                </>
              )}

              {/* Requirements */}
              {selectedFields.requirements && (
                <>
                  <tr className="section-header">
                    <td colSpan={universities.length + 1}>Admission Requirements</td>
                  </tr>
                  <tr>
                    <td className="field-name">Minimum CGPA</td>
                    {universities.map((uni) => (
                      <td 
                        key={uni.id}
                        className={isBestValue('min_cgpa', uni.min_cgpa, universities) ? 'best-value' : ''}
                      >
                        {uni.min_cgpa || 'N/A'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="field-name">Minimum GRE</td>
                    {universities.map((uni) => (
                      <td 
                        key={uni.id}
                        className={isBestValue('min_gre', uni.min_gre, universities) ? 'best-value' : ''}
                      >
                        {uni.min_gre || 'N/A'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="field-name">Minimum IELTS</td>
                    {universities.map((uni) => (
                      <td 
                        key={uni.id}
                        className={isBestValue('min_ielts', uni.min_ielts, universities) ? 'best-value' : ''}
                      >
                        {uni.min_ielts || 'N/A'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="field-name">Minimum TOEFL</td>
                    {universities.map((uni) => (
                      <td 
                        key={uni.id}
                        className={isBestValue('min_toefl', uni.min_toefl, universities) ? 'best-value' : ''}
                      >
                        {uni.min_toefl || 'N/A'}
                      </td>
                    ))}
                  </tr>
                </>
              )}

              {/* Statistics */}
              {selectedFields.statistics && (
                <>
                  <tr className="section-header">
                    <td colSpan={universities.length + 1}>University Statistics</td>
                  </tr>
                  <tr>
                    <td className="field-name">Acceptance Rate</td>
                    {universities.map((uni) => (
                      <td 
                        key={uni.id}
                        className={isBestValue('acceptance_rate', uni.acceptance_rate, universities) ? 'best-value' : ''}
                      >
                        {uni.acceptance_rate ? formatPercentage(uni.acceptance_rate) : 'N/A'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="field-name">Student Population</td>
                    {universities.map((uni) => (
                      <td key={uni.id}>
                        {uni.student_population ? uni.student_population.toLocaleString() : 'N/A'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="field-name">International Students</td>
                    {universities.map((uni) => (
                      <td key={uni.id}>
                        {uni.international_students ? `${uni.international_students}%` : 'N/A'}
                      </td>
                    ))}
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>

        <div className="comparison-footer">
          <div className="comparison-legend">
            <span className="legend-item">
              <span className="legend-star">★</span>
              Best value in category
            </span>
          </div>
          <button className="btn btn-secondary" onClick={onClose}>
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};

export default UniversityComparison;