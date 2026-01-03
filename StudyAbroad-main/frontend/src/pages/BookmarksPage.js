import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import universityService from '../services/universityService';
import UniversityCard from '../components/university/UniversityCard';
import UniversityComparison from '../components/university/UniversityComparison';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import useBookmarks from '../hooks/useBookmarks';

const BookmarksPage = () => {
  const navigate = useNavigate();
  const { 
    bookmarks, 
    loading, 
    error, 
    removeBookmark, 
    clearAllBookmarks, 
    getBookmarkStats,
    loadBookmarks 
  } = useBookmarks();
  
  const [selectedBookmarks, setSelectedBookmarks] = useState([]);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonUniversities, setComparisonUniversities] = useState([]);
  const [comparisonLoading, setComparisonLoading] = useState(false);

  // Handle bookmark removal
  const handleBookmarkToggle = async (universityId, isBookmarked) => {
    try {
      if (isBookmarked) {
        await removeBookmark(universityId);
        // Remove from selected bookmarks if it was selected
        setSelectedBookmarks(prev => prev.filter(id => id !== universityId));
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      alert('Failed to remove bookmark. Please try again.');
    }
  };

  // Handle university card click
  const handleUniversityClick = (universityId) => {
    navigate(`/universities/${universityId}`);
  };

  // Handle bookmark selection for comparison
  const handleBookmarkSelection = (universityId, isSelected) => {
    if (isSelected) {
      setSelectedBookmarks(prev => [...prev, universityId]);
    } else {
      setSelectedBookmarks(prev => prev.filter(id => id !== universityId));
    }
  };

  // Handle comparison
  const handleCompareSelected = async () => {
    if (selectedBookmarks.length < 2) {
      alert('Please select at least 2 universities to compare');
      return;
    }

    if (selectedBookmarks.length > 5) {
      alert('You can compare up to 5 universities at once');
      return;
    }

    try {
      setComparisonLoading(true);
      const response = await universityService.compareUniversities(selectedBookmarks);
      
      if (response.success) {
        setComparisonUniversities(response.data.universities);
        setShowComparison(true);
      }
    } catch (error) {
      console.error('Error comparing universities:', error);
      alert('Failed to compare universities. Please try again.');
    } finally {
      setComparisonLoading(false);
    }
  };

  // Handle removing university from comparison
  const handleRemoveFromComparison = (universityId) => {
    const updatedUniversities = comparisonUniversities.filter(uni => uni.id !== universityId);
    setComparisonUniversities(updatedUniversities);
    
    // Also remove from selected bookmarks
    setSelectedBookmarks(prev => prev.filter(id => id !== universityId));
    
    // Close comparison if less than 2 universities remain
    if (updatedUniversities.length < 2) {
      setShowComparison(false);
    }
  };

  // Handle closing comparison
  const handleCloseComparison = () => {
    setShowComparison(false);
    setComparisonUniversities([]);
  };

  // Clear all bookmarks
  const handleClearAllBookmarks = async () => {
    if (!window.confirm('Are you sure you want to remove all bookmarks?')) {
      return;
    }

    try {
      await clearAllBookmarks();
      setSelectedBookmarks([]);
    } catch (error) {
      console.error('Error clearing bookmarks:', error);
      alert('Failed to clear all bookmarks. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="bookmarks-page">
        <div className="container">
          <LoadingSpinner size="large" message="Loading your bookmarks..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bookmarks-page">
        <div className="container">
          <ErrorMessage
            message={error}
            onRetry={loadBookmarks}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bookmarks-page">
      <div className="container">
        {/* Page Header */}
        <div className="page-header">
          <div className="header-content">
            <h1>My Bookmarks</h1>
            <p>Universities you've saved for later review</p>
          </div>
          
          {bookmarks.length > 0 && (
            <div className="header-actions">
              {selectedBookmarks.length > 0 && (
                <div className="selection-actions">
                  <span className="selection-count">
                    {selectedBookmarks.length} selected
                  </span>
                  <button
                    className="btn btn-primary"
                    onClick={handleCompareSelected}
                    disabled={selectedBookmarks.length < 2 || comparisonLoading}
                  >
                    {comparisonLoading ? 'Loading...' : 'Compare Selected'}
                  </button>
                  <button
                    className="btn btn-outline"
                    onClick={() => setSelectedBookmarks([])}
                  >
                    Clear Selection
                  </button>
                </div>
              )}
              
              <button
                className="btn btn-outline btn-danger"
                onClick={handleClearAllBookmarks}
              >
                Clear All Bookmarks
              </button>
            </div>
          )}
        </div>

        {/* Bookmarks Content */}
        {bookmarks.length === 0 ? (
          <div className="empty-bookmarks">
            <div className="empty-icon">🔖</div>
            <h3>No bookmarks yet</h3>
            <p>Start exploring universities and bookmark the ones you're interested in!</p>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/search')}
            >
              Search Universities
            </button>
          </div>
        ) : (
          <>
            {/* Bookmarks Stats */}
            <div className="bookmarks-stats">
              <div className="stat-item">
                <span className="stat-value">{getBookmarkStats().total}</span>
                <span className="stat-label">Bookmarked Universities</span>
              </div>
              
              <div className="stat-item">
                <span className="stat-value">{getBookmarkStats().countries}</span>
                <span className="stat-label">Countries</span>
              </div>
              
              <div className="stat-item">
                <span className="stat-value">{getBookmarkStats().fields}</span>
                <span className="stat-label">Fields of Study</span>
              </div>
            </div>

            {/* Selection Mode Toggle */}
            <div className="bookmarks-controls">
              <label className="selection-toggle">
                <input
                  type="checkbox"
                  checked={selectedBookmarks.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      // Select all
                      setSelectedBookmarks(bookmarks.map(b => b.university.id));
                    } else {
                      // Deselect all
                      setSelectedBookmarks([]);
                    }
                  }}
                />
                <span>Select for comparison</span>
              </label>
            </div>

            {/* Bookmarks Grid */}
            <div className="bookmarks-grid">
              {bookmarks.map((bookmark) => (
                <div key={bookmark.bookmark_id} className="bookmark-item">
                  {selectedBookmarks.length > 0 && (
                    <div className="bookmark-selection">
                      <input
                        type="checkbox"
                        checked={selectedBookmarks.includes(bookmark.university.id)}
                        onChange={(e) => handleBookmarkSelection(bookmark.university.id, e.target.checked)}
                      />
                    </div>
                  )}
                  
                  <UniversityCard
                    university={bookmark.university}
                    onClick={() => handleUniversityClick(bookmark.university.id)}
                    showBookmark={true}
                    isBookmarked={true}
                    onBookmarkToggle={handleBookmarkToggle}
                  />
                  
                  <div className="bookmark-meta">
                    <div className="bookmark-date">
                      Bookmarked on {new Date(bookmark.bookmarked_at).toLocaleDateString()}
                    </div>
                    {bookmark.notes && (
                      <div className="bookmark-notes">
                        <strong>Notes:</strong> {bookmark.notes}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Comparison Modal */}
        {showComparison && comparisonUniversities.length > 0 && (
          <UniversityComparison
            universities={comparisonUniversities}
            onClose={handleCloseComparison}
            onRemoveUniversity={handleRemoveFromComparison}
          />
        )}
      </div>
    </div>
  );
};

export default BookmarksPage;