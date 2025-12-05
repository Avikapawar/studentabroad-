import React, { useState } from 'react';
import { formatCurrency, formatPercentage } from '../../utils/helpers';
import { getUniversityLogo, getPlaceholderLogo } from '../../utils/logoUtils';
import './UniversityCard.css';

const UniversityCard = ({
  university,
  onClick,
  showBookmark = true,
  isBookmarked = false,
  onBookmarkToggle,
  showComparison = false,
  isSelected = false,
  onSelectionToggle
}) => {
  const [logoError, setLogoError] = useState(false);
  const [logoLoading, setLogoLoading] = useState(true);
  const {
    id,
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
    website,
    established
  } = university;

  // Calculate total cost
  const totalCost = (tuition_fee || 0) + (living_cost || 0);

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
      'NZ': '🇳🇿', 'New Zealand': '🇳🇿'
    };
    return flags[countryCode] || flags[country] || '🌍';
  };

  // Get ranking display with better categorization
  const getRankingDisplay = (rank) => {
    if (!rank) return null;
    if (rank <= 10) return { text: `#${rank}`, class: 'ranking-top', label: 'Top 10' };
    if (rank <= 25) return { text: `#${rank}`, class: 'ranking-excellent', label: 'Top 25' };
    if (rank <= 50) return { text: `#${rank}`, class: 'ranking-good', label: 'Top 50' };
    if (rank <= 100) return { text: `#${rank}`, class: 'ranking-decent', label: 'Top 100' };
    if (rank <= 200) return { text: `#${rank}`, class: 'ranking-fair', label: 'Top 200' };
    return { text: `#${rank}`, class: 'ranking-normal', label: 'Ranked' };
  };

  const rankingDisplay = getRankingDisplay(ranking);

  // Get acceptance rate category
  const getAcceptanceRateCategory = (rate) => {
    if (!rate) return null;
    if (rate <= 0.05) return 'extremely-selective';
    if (rate <= 0.15) return 'highly-selective';
    if (rate <= 0.30) return 'selective';
    if (rate <= 0.50) return 'moderately-selective';
    return 'less-selective';
  };

  // Handle card click
  const handleCardClick = (e) => {
    // Don't trigger card click if interactive elements were clicked
    if (e.target.closest('.bookmark-btn') ||
      e.target.closest('.selection-checkbox') ||
      e.target.closest('.card-footer')) {
      return;
    }
    if (onClick) onClick(id);
  };

  // Handle bookmark toggle
  const handleBookmarkClick = (e) => {
    e.stopPropagation();
    if (onBookmarkToggle) {
      onBookmarkToggle(id, isBookmarked);
    }
  };

  // Handle selection toggle
  const handleSelectionToggle = (e) => {
    e.stopPropagation();
    if (onSelectionToggle) onSelectionToggle(id, !isSelected);
  };

  // Handle external link click
  const handleWebsiteClick = (e) => {
    e.stopPropagation();
    if (website) {
      window.open(website, '_blank', 'noopener,noreferrer');
    }
  };

  // Handle logo loading
  const handleLogoLoad = () => {
    setLogoLoading(false);
  };

  // Handle logo error
  const handleLogoError = () => {
    setLogoError(true);
    setLogoLoading(false);
  };

  // Get logo URL
  const logoUrl = logoError ? getPlaceholderLogo(university) : getUniversityLogo(university);

  return (
    <div className={`university-card ${isSelected ? 'selected' : ''}`} onClick={handleCardClick}>
      {/* Selection checkbox for comparison */}
      {showComparison && (
        <div className="selection-checkbox">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleSelectionToggle}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Card Header */}
      <div className="card-header">
        <div className="university-info">
          <div className="university-location">
            <span className="country-flag" title={country}>
              {getCountryFlag(country)}
            </span>
            <span className="location-text">
              {city}{state && `, ${state}`}
            </span>
          </div>

          {rankingDisplay && (
            <div
              className={`university-ranking ${rankingDisplay.class}`}
              title={`${rankingDisplay.label} globally`}
            >
              {rankingDisplay.text}
            </div>
          )}
        </div>

        {showBookmark && (
          <button
            className={`bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`}
            onClick={handleBookmarkClick}
            title={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
            aria-label={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
          >
            {isBookmarked ? '❤️' : '🤍'}
          </button>
        )}
      </div>

      {/* University Logo and Name */}
      <div className="university-header">
        <div className="university-logo-container">
          {logoLoading && (
            <div className="logo-skeleton">
              <div className="skeleton-loader"></div>
            </div>
          )}
          <img
            src={logoUrl}
            alt={`${name} logo`}
            className={`university-logo ${logoLoading ? 'loading' : ''}`}
            onLoad={handleLogoLoad}
            onError={handleLogoError}
            loading="lazy"
          />
        </div>
        <h3 className="university-name" title={name}>{name}</h3>
      </div>

      {/* University Meta Info */}
      <div className="university-meta">
        {type && (
          <span className={`type-badge ${type?.toLowerCase()}`}>
            {type}
          </span>
        )}

        {established && (
          <span className="established-badge">
            Est. {established}
          </span>
        )}
      </div>

      {/* Fields of Study */}
      {fields && fields.length > 0 && (
        <div className="university-fields">
          <div className="fields-list">
            {fields.slice(0, 3).map((field, index) => (
              <span key={index} className="field-tag" title={field}>
                {field}
              </span>
            ))}
            {fields.length > 3 && (
              <span
                className="field-tag more"
                title={`Additional fields: ${fields.slice(3).join(', ')}`}
              >
                +{fields.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Cost Information */}
      <div className="cost-info">
        <h4 className="cost-title">Annual Costs</h4>
        {tuition_fee && (
          <div className="cost-item">
            <span className="cost-label">Tuition:</span>
            <span className="cost-value">
              {formatCurrency(tuition_fee)}
            </span>
          </div>
        )}
        {living_cost && (
          <div className="cost-item">
            <span className="cost-label">Living:</span>
            <span className="cost-value">
              {formatCurrency(living_cost)}
            </span>
          </div>
        )}
        {application_fee && (
          <div className="cost-item">
            <span className="cost-label">Application:</span>
            <span className="cost-value">
              {formatCurrency(application_fee)}
            </span>
          </div>
        )}
        {totalCost > 0 && (
          <div className="cost-item total">
            <span className="cost-label">Total Annual:</span>
            <span className="cost-value">
              {formatCurrency(totalCost)}
            </span>
          </div>
        )}
      </div>

      {/* Admission Requirements */}
      <div className="admission-requirements">
        <h4>Minimum Requirements</h4>
        <div className="requirements-grid">
          {min_cgpa && (
            <div className="requirement-item">
              <span className="req-label">CGPA:</span>
              <span className="req-value">{min_cgpa}</span>
            </div>
          )}
          {min_gre && (
            <div className="requirement-item">
              <span className="req-label">GRE:</span>
              <span className="req-value">{min_gre}</span>
            </div>
          )}
          {min_ielts && (
            <div className="requirement-item">
              <span className="req-label">IELTS:</span>
              <span className="req-value">{min_ielts}</span>
            </div>
          )}
          {min_toefl && (
            <div className="requirement-item">
              <span className="req-label">TOEFL:</span>
              <span className="req-value">{min_toefl}</span>
            </div>
          )}
        </div>
      </div>

      {/* University Statistics */}
      <div className="university-stats">
        {acceptance_rate && (
          <div className="stat-item">
            <span className="stat-label">Acceptance Rate:</span>
            <span className={`stat-value acceptance-rate ${getAcceptanceRateCategory(acceptance_rate)}`}>
              {formatPercentage(acceptance_rate)}
            </span>
          </div>
        )}

        {student_population && (
          <div className="stat-item">
            <span className="stat-label">Students:</span>
            <span className="stat-value">
              {student_population.toLocaleString()}
            </span>
          </div>
        )}

        {international_students && (
          <div className="stat-item">
            <span className="stat-label">International:</span>
            <span className="stat-value">
              {international_students}%
            </span>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="card-footer">
        <div className="footer-actions">
          <button
            className="btn btn-primary btn-sm"
            onClick={(e) => { e.stopPropagation(); if (onClick) onClick(id); }}
          >
            View Details
          </button>

          {website && (
            <button
              className="btn btn-outline btn-sm"
              onClick={handleWebsiteClick}
              title="Visit university website"
            >
              🌐 Website
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UniversityCard;