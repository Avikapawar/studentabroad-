import api from './api';

class UserService {
  /**
   * Get user profile
   * @returns {Promise<Object>} Profile response
   */
  async getProfile() {
    try {
      const response = await api.get('/users/profile');
      return {
        success: true,
        profile: response.data.profile
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get profile',
        code: error.response?.data?.code || 'PROFILE_FETCH_ERROR',
        details: error.response?.data?.details || null
      };
    }
  }

  /**
   * Update user profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<Object>} Update response
   */
  async updateProfile(profileData) {
    try {
      const response = await api.put('/users/profile', profileData);
      return {
        success: true,
        profile: response.data.profile,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update profile',
        code: error.response?.data?.code || 'PROFILE_UPDATE_ERROR',
        details: error.response?.data?.details || null
      };
    }
  }

  /**
   * Update academic credentials only
   * @param {Object} academicData - Academic credentials data
   * @param {number} academicData.cgpa - CGPA (0.0-4.0)
   * @param {number} academicData.gre_score - GRE score (260-340)
   * @param {number} academicData.ielts_score - IELTS score (0.0-9.0)
   * @param {number} academicData.toefl_score - TOEFL score (0-120)
   * @returns {Promise<Object>} Update response
   */
  async updateAcademicCredentials(academicData) {
    try {
      const response = await api.put('/users/profile/academic', academicData);
      return {
        success: true,
        academicData: response.data.academic_data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update academic credentials',
        code: error.response?.data?.code || 'ACADEMIC_UPDATE_ERROR',
        details: error.response?.data?.details || null
      };
    }
  }

  /**
   * Update user preferences
   * @param {Object} preferencesData - Preferences data
   * @param {string} preferencesData.field_of_study - Field of study
   * @param {Array|string} preferencesData.preferred_countries - Preferred countries
   * @param {number} preferencesData.budget_min - Minimum budget
   * @param {number} preferencesData.budget_max - Maximum budget
   * @returns {Promise<Object>} Update response
   */
  async updatePreferences(preferencesData) {
    try {
      const response = await api.put('/users/profile/preferences', preferencesData);
      return {
        success: true,
        preferences: response.data.preferences,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update preferences',
        code: error.response?.data?.code || 'PREFERENCES_UPDATE_ERROR',
        details: error.response?.data?.details || null
      };
    }
  }

  /**
   * Validate CGPA value
   * @param {number} cgpa - CGPA value
   * @returns {Object} Validation result
   */
  validateCGPA(cgpa) {
    if (cgpa === null || cgpa === undefined || cgpa === '') {
      return { isValid: true, message: 'CGPA is optional' };
    }
    
    const cgpaNum = parseFloat(cgpa);
    if (isNaN(cgpaNum)) {
      return { isValid: false, message: 'CGPA must be a valid number' };
    }
    
    if (cgpaNum < 0.0 || cgpaNum > 4.0) {
      return { isValid: false, message: 'CGPA must be between 0.0 and 4.0' };
    }
    
    return { isValid: true, message: 'Valid CGPA' };
  }

  /**
   * Validate GRE score
   * @param {number} greScore - GRE score
   * @returns {Object} Validation result
   */
  validateGREScore(greScore) {
    if (greScore === null || greScore === undefined || greScore === '') {
      return { isValid: true, message: 'GRE score is optional' };
    }
    
    const greNum = parseInt(greScore);
    if (isNaN(greNum)) {
      return { isValid: false, message: 'GRE score must be a valid integer' };
    }
    
    if (greNum < 260 || greNum > 340) {
      return { isValid: false, message: 'GRE score must be between 260 and 340' };
    }
    
    return { isValid: true, message: 'Valid GRE score' };
  }

  /**
   * Validate IELTS score
   * @param {number} ieltsScore - IELTS score
   * @returns {Object} Validation result
   */
  validateIELTSScore(ieltsScore) {
    if (ieltsScore === null || ieltsScore === undefined || ieltsScore === '') {
      return { isValid: true, message: 'IELTS score is optional' };
    }
    
    const ieltsNum = parseFloat(ieltsScore);
    if (isNaN(ieltsNum)) {
      return { isValid: false, message: 'IELTS score must be a valid number' };
    }
    
    if (ieltsNum < 0.0 || ieltsNum > 9.0) {
      return { isValid: false, message: 'IELTS score must be between 0.0 and 9.0' };
    }
    
    return { isValid: true, message: 'Valid IELTS score' };
  }

  /**
   * Validate TOEFL score
   * @param {number} toeflScore - TOEFL score
   * @returns {Object} Validation result
   */
  validateTOEFLScore(toeflScore) {
    if (toeflScore === null || toeflScore === undefined || toeflScore === '') {
      return { isValid: true, message: 'TOEFL score is optional' };
    }
    
    const toeflNum = parseInt(toeflScore);
    if (isNaN(toeflNum)) {
      return { isValid: false, message: 'TOEFL score must be a valid integer' };
    }
    
    if (toeflNum < 0 || toeflNum > 120) {
      return { isValid: false, message: 'TOEFL score must be between 0 and 120' };
    }
    
    return { isValid: true, message: 'Valid TOEFL score' };
  }

  /**
   * Validate budget range
   * @param {number} budgetMin - Minimum budget
   * @param {number} budgetMax - Maximum budget
   * @returns {Object} Validation result
   */
  validateBudget(budgetMin, budgetMax) {
    if ((budgetMin === null || budgetMin === undefined || budgetMin === '') &&
        (budgetMax === null || budgetMax === undefined || budgetMax === '')) {
      return { isValid: true, message: 'Budget is optional' };
    }
    
    if (budgetMin !== null && budgetMin !== undefined && budgetMin !== '') {
      const minNum = parseFloat(budgetMin);
      if (isNaN(minNum) || minNum < 0) {
        return { isValid: false, message: 'Minimum budget must be a positive number' };
      }
    }
    
    if (budgetMax !== null && budgetMax !== undefined && budgetMax !== '') {
      const maxNum = parseFloat(budgetMax);
      if (isNaN(maxNum) || maxNum < 0) {
        return { isValid: false, message: 'Maximum budget must be a positive number' };
      }
    }
    
    if (budgetMin && budgetMax) {
      const minNum = parseFloat(budgetMin);
      const maxNum = parseFloat(budgetMax);
      if (minNum > maxNum) {
        return { isValid: false, message: 'Minimum budget cannot be greater than maximum budget' };
      }
    }
    
    return { isValid: true, message: 'Valid budget range' };
  }

  /**
   * Validate preferred countries
   * @param {Array|string} countries - Preferred countries
   * @returns {Object} Validation result
   */
  validateCountries(countries) {
    if (!countries || countries.length === 0) {
      return { isValid: true, message: 'Countries preference is optional' };
    }
    
    let countriesList;
    if (typeof countries === 'string') {
      try {
        countriesList = JSON.parse(countries);
      } catch (error) {
        return { isValid: false, message: 'Invalid countries format' };
      }
    } else if (Array.isArray(countries)) {
      countriesList = countries;
    } else {
      return { isValid: false, message: 'Countries must be an array' };
    }
    
    if (countriesList.length > 10) {
      return { isValid: false, message: 'Maximum 10 countries allowed' };
    }
    
    for (const country of countriesList) {
      if (typeof country !== 'string' || country.trim().length === 0) {
        return { isValid: false, message: 'Each country must be a non-empty string' };
      }
    }
    
    return { isValid: true, message: 'Valid countries list' };
  }

  /**
   * Upload user resume
   * @param {File} resumeFile - Resume file to upload
   * @returns {Promise<Object>} Upload response
   */
  async uploadResume(resumeFile) {
    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      
      const response = await api.post('/users/resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return {
        success: true,
        resumeUrl: response.data.resume_url,
        filename: response.data.filename,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to upload resume',
        code: error.response?.data?.code || 'RESUME_UPLOAD_ERROR',
        details: error.response?.data?.details || null
      };
    }
  }

  /**
   * Delete user resume
   * @returns {Promise<Object>} Delete response
   */
  async deleteResume() {
    try {
      const response = await api.delete('/users/resume');
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to delete resume',
        code: error.response?.data?.code || 'RESUME_DELETE_ERROR',
        details: error.response?.data?.details || null
      };
    }
  }

  /**
   * Get resume download URL
   * @param {string} filename - Resume filename
   * @returns {string} Download URL
   */
  getResumeDownloadUrl(filename) {
    return `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/users/resume/${filename}`;
  }
}

// Create and export a singleton instance
const userService = new UserService();
export default userService;