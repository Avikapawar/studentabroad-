import api from './api';

/**
 * Bookmark Service
 * Handles all bookmark-related API calls
 */
class BookmarkService {
  /**
   * Get all bookmarked universities for the current user
   * @returns {Promise<Object>} User's bookmarked universities
   */
  async getUserBookmarks() {
    try {
      const response = await api.get('/bookmarks');
      return response.data;
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Add a university to bookmarks
   * @param {number} universityId - University ID to bookmark
   * @param {string} notes - Optional notes about the university
   * @returns {Promise<Object>} Bookmark creation result
   */
  async addBookmark(universityId, notes = '') {
    try {
      const response = await api.post('/bookmarks', {
        university_id: universityId,
        notes: notes
      });
      return response.data;
    } catch (error) {
      console.error('Error adding bookmark:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Remove a bookmark by bookmark ID
   * @param {number} bookmarkId - Bookmark ID to remove
   * @returns {Promise<Object>} Removal result
   */
  async removeBookmark(bookmarkId) {
    try {
      const response = await api.delete(`/bookmarks/${bookmarkId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing bookmark:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Remove a bookmark by university ID
   * @param {number} universityId - University ID to remove from bookmarks
   * @returns {Promise<Object>} Removal result
   */
  async removeBookmarkByUniversity(universityId) {
    try {
      const response = await api.delete(`/bookmarks/university/${universityId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing bookmark:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update bookmark notes
   * @param {number} bookmarkId - Bookmark ID to update
   * @param {string} notes - New notes
   * @returns {Promise<Object>} Update result
   */
  async updateBookmark(bookmarkId, notes) {
    try {
      const response = await api.put(`/bookmarks/${bookmarkId}`, {
        notes: notes
      });
      return response.data;
    } catch (error) {
      console.error('Error updating bookmark:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Check if a university is bookmarked
   * @param {number} universityId - University ID to check
   * @returns {Promise<Object>} Bookmark status
   */
  async checkBookmarkStatus(universityId) {
    try {
      const response = await api.get(`/bookmarks/check/${universityId}`);
      return response.data;
    } catch (error) {
      console.error('Error checking bookmark status:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Toggle bookmark status for a university
   * @param {number} universityId - University ID
   * @param {boolean} isBookmarked - Current bookmark status
   * @param {string} notes - Optional notes
   * @returns {Promise<Object>} Toggle result
   */
  async toggleBookmark(universityId, isBookmarked, notes = '') {
    try {
      if (isBookmarked) {
        return await this.removeBookmarkByUniversity(universityId);
      } else {
        return await this.addBookmark(universityId, notes);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors and return user-friendly messages
   * @param {Error} error - API error
   * @returns {Error} Formatted error
   */
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      const message = data?.error || data?.message || 'An error occurred';
      
      switch (status) {
        case 400:
          return new Error(`Invalid request: ${message}`);
        case 401:
          return new Error('Authentication required');
        case 403:
          return new Error('Access denied');
        case 404:
          return new Error('Bookmark or university not found');
        case 409:
          return new Error('University is already bookmarked');
        case 429:
          return new Error('Too many requests. Please try again later.');
        case 500:
          return new Error('Server error. Please try again later.');
        default:
          return new Error(message);
      }
    } else if (error.request) {
      // Network error
      return new Error('Network error. Please check your connection.');
    } else {
      // Other error
      return new Error(error.message || 'An unexpected error occurred');
    }
  }
}

// Create and export a singleton instance
const bookmarkService = new BookmarkService();
export default bookmarkService;

// Export individual methods for convenience
export const {
  getUserBookmarks,
  addBookmark,
  removeBookmark,
  removeBookmarkByUniversity,
  updateBookmark,
  checkBookmarkStatus,
  toggleBookmark
} = bookmarkService;