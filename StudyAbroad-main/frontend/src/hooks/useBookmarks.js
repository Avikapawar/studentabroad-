import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import bookmarkService from '../services/bookmarkService';

/**
 * Custom hook for managing bookmarks
 * Provides bookmark state management and operations
 */
export const useBookmarks = () => {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [bookmarkIds, setBookmarkIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load user's bookmarks
  const loadBookmarks = useCallback(async () => {
    if (!user) {
      setBookmarks([]);
      setBookmarkIds(new Set());
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await bookmarkService.getUserBookmarks();
      
      if (response.success) {
        setBookmarks(response.data);
        // Create a Set of university IDs for quick lookup
        const ids = new Set(response.data.map(bookmark => bookmark.university.id));
        setBookmarkIds(ids);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error loading bookmarks:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load bookmarks when user changes
  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  // Check if a university is bookmarked
  const isBookmarked = useCallback((universityId) => {
    return bookmarkIds.has(universityId);
  }, [bookmarkIds]);

  // Add a bookmark
  const addBookmark = useCallback(async (universityId, notes = '') => {
    if (!user) {
      throw new Error('User must be logged in to bookmark universities');
    }

    try {
      const response = await bookmarkService.addBookmark(universityId, notes);
      
      if (response.success) {
        // Reload bookmarks to get updated list
        await loadBookmarks();
        return response;
      }
    } catch (error) {
      console.error('Error adding bookmark:', error);
      throw error;
    }
  }, [user, loadBookmarks]);

  // Remove a bookmark
  const removeBookmark = useCallback(async (universityId) => {
    if (!user) {
      throw new Error('User must be logged in to manage bookmarks');
    }

    try {
      const response = await bookmarkService.removeBookmarkByUniversity(universityId);
      
      if (response.success) {
        // Update local state immediately for better UX
        setBookmarks(prev => prev.filter(bookmark => bookmark.university.id !== universityId));
        setBookmarkIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(universityId);
          return newSet;
        });
        return response;
      }
    } catch (error) {
      console.error('Error removing bookmark:', error);
      throw error;
    }
  }, [user]);

  // Toggle bookmark status
  const toggleBookmark = useCallback(async (universityId, notes = '') => {
    const currentlyBookmarked = isBookmarked(universityId);
    
    if (currentlyBookmarked) {
      return await removeBookmark(universityId);
    } else {
      return await addBookmark(universityId, notes);
    }
  }, [isBookmarked, addBookmark, removeBookmark]);

  // Update bookmark notes
  const updateBookmarkNotes = useCallback(async (bookmarkId, notes) => {
    if (!user) {
      throw new Error('User must be logged in to update bookmarks');
    }

    try {
      const response = await bookmarkService.updateBookmark(bookmarkId, notes);
      
      if (response.success) {
        // Update local state
        setBookmarks(prev => prev.map(bookmark => 
          bookmark.bookmark_id === bookmarkId 
            ? { ...bookmark, notes } 
            : bookmark
        ));
        return response;
      }
    } catch (error) {
      console.error('Error updating bookmark:', error);
      throw error;
    }
  }, [user]);

  // Clear all bookmarks
  const clearAllBookmarks = useCallback(async () => {
    if (!user) {
      throw new Error('User must be logged in to clear bookmarks');
    }

    try {
      // Remove all bookmarks one by one
      const promises = bookmarks.map(bookmark => 
        bookmarkService.removeBookmark(bookmark.bookmark_id)
      );
      
      await Promise.all(promises);
      
      // Clear local state
      setBookmarks([]);
      setBookmarkIds(new Set());
      
      return { success: true };
    } catch (error) {
      console.error('Error clearing bookmarks:', error);
      throw error;
    }
  }, [user, bookmarks]);

  // Get bookmark statistics
  const getBookmarkStats = useCallback(() => {
    const totalBookmarks = bookmarks.length;
    const countries = new Set(bookmarks.map(b => b.university.country)).size;
    const fields = new Set(bookmarks.flatMap(b => b.university.fields || [])).size;
    
    return {
      total: totalBookmarks,
      countries,
      fields
    };
  }, [bookmarks]);

  return {
    bookmarks,
    bookmarkIds,
    loading,
    error,
    isBookmarked,
    addBookmark,
    removeBookmark,
    toggleBookmark,
    updateBookmarkNotes,
    clearAllBookmarks,
    loadBookmarks,
    getBookmarkStats
  };
};

export default useBookmarks;