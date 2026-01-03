import api from './api';

const recommendationService = {
  // Generate personalized recommendations
  generateRecommendations: async (filters = {}, maxRecommendations = 10) => {
    try {
      console.log('Generating recommendations with:', { filters, maxRecommendations });
      
      const response = await api.post('/recommendations/generate', {
        max_recommendations: maxRecommendations,
        filters
      }, {
        timeout: 15000 // 15 second timeout
      });
      
      console.log('Recommendation response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timed out. The recommendation system is taking too long to respond.');
      } else if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in to get recommendations.');
      } else if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || 'Invalid profile data. Please complete your profile.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error. The recommendation system is currently unavailable.');
      } else {
        throw new Error('Failed to generate recommendations. Please try again.');
      }
    }
  },

  // Predict admission probability for a specific university
  predictAdmission: async (universityId, userProfile = null) => {
    try {
      const response = await api.post(`/recommendations/predict/${universityId}`, userProfile || {});
      return response.data;
    } catch (error) {
      console.error('Error predicting admission:', error);
      throw error;
    }
  },

  // Batch predict admission probabilities
  predictBatchAdmission: async (universityIds, userProfile = null) => {
    try {
      const response = await api.post('/recommendations/predict/batch', {
        university_ids: universityIds,
        user_profile: userProfile
      });
      return response.data;
    } catch (error) {
      console.error('Error in batch prediction:', error);
      throw error;
    }
  },

  // Get explanation for a recommendation
  getRecommendationExplanation: async (universityId, userProfile = null) => {
    try {
      const response = await api.post(`/recommendations/explain/${universityId}`, {
        user_profile: userProfile
      });
      return response.data;
    } catch (error) {
      console.error('Error getting recommendation explanation:', error);
      throw error;
    }
  },

  // Get ML model information
  getModelInfo: async () => {
    try {
      const response = await api.get('/recommendations/model-info');
      return response.data;
    } catch (error) {
      console.error('Error getting model info:', error);
      throw error;
    }
  },

  // Health check for recommendation service
  healthCheck: async () => {
    try {
      const response = await api.get('/recommendations/health');
      return response.data;
    } catch (error) {
      console.error('Error checking recommendation service health:', error);
      throw error;
    }
  }
};

export default recommendationService;