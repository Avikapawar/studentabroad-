import React, { useState, useEffect, useRef } from 'react';
import universityService from '../../services/universityService';
import { debounce } from '../../utils/helpers';

const SearchBar = ({ 
  value, 
  onChange, 
  placeholder = "Search universities by name, city, or country...",
  showSuggestions = true,
  autoFocus = false 
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestionsDropdown, setShowSuggestionsDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [error, setError] = useState(null);
  
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Auto focus on mount if requested
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Debounced function to fetch suggestions
  const debouncedGetSuggestions = debounce(async (query) => {
    if (!showSuggestions || !query || query.length < 2) {
      setSuggestions([]);
      setShowSuggestionsDropdown(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await universityService.getSearchSuggestions(query, 8);
      if (response.success) {
        setSuggestions(response.data);
        setShowSuggestionsDropdown(response.data.length > 0);
      } else {
        throw new Error('Failed to fetch suggestions');
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setError('Failed to load suggestions');
      setSuggestions([]);
      setShowSuggestionsDropdown(false);
    } finally {
      setLoading(false);
    }
  }, 300);

  // Handle input change
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);
    setSelectedIndex(-1);
    debouncedGetSuggestions(newValue);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    onChange(suggestion.name);
    setShowSuggestionsDropdown(false);
    setSelectedIndex(-1);
    inputRef.current?.blur();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestionsDropdown || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else {
          // Submit the form with current value
          handleSubmit(e);
        }
        break;
      
      case 'Escape':
        setShowSuggestionsDropdown(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
      
      default:
        break;
    }
  };

  // Handle input focus
  const handleFocus = () => {
    if (showSuggestions && value && value.length >= 2 && suggestions.length > 0) {
      setShowSuggestionsDropdown(true);
    }
  };

  // Handle input blur
  const handleBlur = (e) => {
    // Delay hiding suggestions to allow for suggestion clicks
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(document.activeElement)) {
        setShowSuggestionsDropdown(false);
        setSelectedIndex(-1);
      }
    }, 150);
  };

  // Clear search
  const handleClear = () => {
    onChange('');
    setSuggestions([]);
    setShowSuggestionsDropdown(false);
    setSelectedIndex(-1);
    setError(null);
    inputRef.current?.focus();
  };

  // Handle search submit
  const handleSubmit = (e) => {
    e.preventDefault();
    setShowSuggestionsDropdown(false);
    setSelectedIndex(-1);
    inputRef.current?.blur();
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestionsDropdown(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="search-bar">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-container">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder={placeholder}
              className="search-input"
              autoComplete="off"
            />
            {value && (
              <button
                type="button"
                className="clear-btn"
                onClick={handleClear}
                title="Clear search"
              >
                ×
              </button>
            )}
            {loading && (
              <div className="search-loading">
                <div className="loading-spinner"></div>
              </div>
            )}
          </div>
          
          <button type="submit" className="search-submit-btn">
            Search
          </button>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestionsDropdown && (
          <div ref={suggestionsRef} className="search-suggestions">
            {loading && (
              <div className="suggestion-loading">
                <div className="loading-spinner"></div>
                <span>Loading suggestions...</span>
              </div>
            )}
            
            {error && (
              <div className="suggestion-error">
                <span>⚠️ {error}</span>
              </div>
            )}
            
            {!loading && !error && suggestions.length > 0 && (
              <>
                {suggestions.map((suggestion, index) => (
                  <div
                    key={suggestion.id}
                    className={`suggestion-item ${index === selectedIndex ? 'selected' : ''}`}
                    onClick={() => handleSuggestionClick(suggestion)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="suggestion-content">
                      <div className="suggestion-name">{suggestion.name}</div>
                      <div className="suggestion-location">
                        {suggestion.city}, {suggestion.country}
                      </div>
                    </div>
                    <div className="suggestion-type">University</div>
                  </div>
                ))}
                <div className="suggestion-footer">
                  <small>Press Enter to search for "{value}"</small>
                </div>
              </>
            )}
            
            {!loading && !error && suggestions.length === 0 && value.length >= 2 && (
              <div className="suggestion-empty">
                <span>No suggestions found</span>
                <small>Press Enter to search for "{value}"</small>
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchBar;