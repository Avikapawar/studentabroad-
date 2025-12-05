import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import bookmarkService from '../../services/bookmarkService';

const BookmarkButton = ({ 
  universityId, 
  universityName,
  className = '',
  size = 'normal',
  showText = false,
  onBookmarkChange
}) => {
  const { user } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check bookmark status on mount
  useEffect(() => {
    if (user && universityId) {
      checkBookmarkStatus();
    }
  }, [user, universityId]);

  const checkBookmarkStatus = async () => {
    try {
      const response = await bookmarkService.checkBookmarkStatus(universityId);
      if (response.success) {
        setIsBookmarked(response.data.is_bookmarked);
      }
    } catch (error) {
      console.error('Error checking bookmark status:', error);
      // Don't show error for bookmark status check
    }
  };

  const handleToggleBookmark = async (e) => {
    e.stopPropagation();
    
    if (!user) {
      alert('Please log in to bookmark universities');
      return;
    }

    if (loading) return;

    try {
      setLoading(true);
      setError(null);

      const response = await bookmarkService.toggleBookmark(universityId, isBookmarked);
      
      if (response.success) {
        const newBookmarkStatus = !isBookmarked;
        setIsBookmarked(newBookmarkStatus);
        
        // Notify parent component of bookmark change
        if (onBookmarkChange) {
          onBookmarkChange(universityId, newBookmarkStatus, universityName);
        }
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      setError(error.message);
      
      // Show error message briefly
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Don't render if user is not logged in
  if (!user) {
    return null;
  }

  const buttonClass = `bookmark-btn ${className} ${isBookmarked ? 'bookmarked' : ''} ${size === 'small' ? 'btn-sm' : ''}`;
  const icon = loading ? '⏳' : (isBookmarked ? '❤️' : '🤍');
  const title = loading 
    ? 'Processing...' 
    : (isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks');

  return (
    <div className="bookmark-button-container">
      <button
        className={buttonClass}
        onClick={handleToggleBookmark}
        disabled={loading}
        title={title}
        aria-label={title}
      >
        {icon}
        {showText && (
          <span className="bookmark-text">
            {loading ? 'Loading...' : (isBookmarked ? 'Bookmarked' : 'Bookmark')}
          </span>
        )}
      </button>
      
      {error && (
        <div className="bookmark-error">
          {error}
        </div>
      )}
    </div>
  );
};

export default BookmarkButton;