import api from './api';

/**
 * University Service
 * Handles all university-related API calls
 */
class UniversityService {
  /**
   * Search universities with filters and pagination
   * @param {Object} params - Search parameters
   * @param {string} params.q - Search query
   * @param {string|Array} params.country - Country filter(s)
   * @param {string|Array} params.field - Field of study filter(s)
   * @param {number} params.min_tuition - Minimum tuition fee
   * @param {number} params.max_tuition - Maximum tuition fee
   * @param {number} params.min_cgpa - Minimum CGPA requirement
   * @param {number} params.max_cgpa - Maximum CGPA requirement
   * @param {number} params.min_gre - Minimum GRE score
   * @param {number} params.max_gre - Maximum GRE score
   * @param {number} params.min_ielts - Minimum IELTS score
   * @param {number} params.max_ielts - Maximum IELTS score
   * @param {number} params.min_toefl - Minimum TOEFL score
   * @param {number} params.max_toefl - Maximum TOEFL score
   * @param {string} params.type - University type (Public/Private)
   * @param {number} params.min_ranking - Minimum ranking
   * @param {number} params.max_ranking - Maximum ranking
   * @param {number} params.min_acceptance_rate - Minimum acceptance rate
   * @param {number} params.max_acceptance_rate - Maximum acceptance rate
   * @param {string} params.sort_by - Sort field
   * @param {string} params.sort_order - Sort order (asc/desc)
   * @param {number} params.page - Page number
   * @param {number} params.per_page - Results per page
   * @returns {Promise<Object>} Search results with pagination
   */
  async searchUniversities(params = {}) {
    try {
      // Clean up parameters - remove empty values
      const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          // Handle array parameters
          if (Array.isArray(value)) {
            acc[key] = value.join(',');
          } else {
            acc[key] = value;
          }
        }
        return acc;
      }, {});

      const response = await api.get('/universities', { params: cleanParams });
      return response.data;
    } catch (error) {
      console.error('Error searching universities:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get university details by ID
   * @param {number} universityId - University ID
   * @returns {Promise<Object>} University details
   */
  async getUniversityById(universityId) {
    try {
      const response = await api.get(`/universities/${universityId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching university details:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get list of available countries
   * @returns {Promise<Array>} List of countries
   */
  async getCountries() {
    try {
      const response = await api.get('/universities/countries');
      return response.data;
    } catch (error) {
      console.error('Error fetching countries:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get list of available fields of study
   * @returns {Promise<Array>} List of fields
   */
  async getFields() {
    try {
      const response = await api.get('/universities/fields');
      return response.data;
    } catch (error) {
      console.error('Error fetching fields:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get university database statistics
   * @returns {Promise<Object>} Database statistics
   */
  async getStatistics() {
    try {
      const response = await api.get('/universities/statistics');
      return response.data;
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get search suggestions based on partial query
   * @param {string} query - Partial search query
   * @param {number} limit - Maximum number of suggestions
   * @returns {Promise<Array>} Search suggestions
   */
  async getSearchSuggestions(query, limit = 10) {
    try {
      const response = await api.get('/universities/search/suggestions', {
        params: { q: query, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching search suggestions:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Compare multiple universities
   * @param {Array<number>} universityIds - Array of university IDs to compare
   * @returns {Promise<Object>} Comparison data
   */
  async compareUniversities(universityIds) {
    try {
      const response = await api.post('/universities/compare', {
        university_ids: universityIds
      });
      return response.data;
    } catch (error) {
      console.error('Error comparing universities:', error);
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
          return new Error('University not found');
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
const universityService = new UniversityService();
export default universityService;

// Export individual methods for convenience
export const {
  searchUniversities,
  getUniversityById,
  getCountries,
  getFields,
  getStatistics,
  getSearchSuggestions,
  compareUniversities
} = universityService;