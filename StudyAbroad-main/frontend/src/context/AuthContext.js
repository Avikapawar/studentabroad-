import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on app start
  useEffect(() => {
    const initializeAuth = async () => {
      const accessToken = authService.getAccessToken();
      const userData = authService.getUserData();
      
      if (accessToken && userData) {
        // Verify token is still valid by fetching current user
        const result = await authService.getCurrentUser();
        if (result.success) {
          setUser(result.user);
          setIsAuthenticated(true);
        } else {
          // Token is invalid, try to refresh
          const refreshToken = authService.getRefreshToken();
          if (refreshToken) {
            const refreshResult = await authService.refreshToken(refreshToken);
            if (refreshResult.success) {
              authService.storeTokens(refreshResult.accessToken, refreshToken);
              // Try to get user again with new token
              const userResult = await authService.getCurrentUser();
              if (userResult.success) {
                setUser(userResult.user);
                setIsAuthenticated(true);
                authService.storeUserData(userResult.user);
              } else {
                // Complete logout if refresh fails
                authService.clearAuthData();
              }
            } else {
              // Refresh failed, clear auth data
              authService.clearAuthData();
            }
          } else {
            // No refresh token, clear auth data
            authService.clearAuthData();
          }
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const result = await authService.login(credentials);
      if (result.success) {
        authService.storeTokens(result.accessToken, result.refreshToken);
        authService.storeUserData(result.user);
        setUser(result.user);
        setIsAuthenticated(true);
        return { success: true, user: result.user };
      } else {
        return { success: false, error: result.error, code: result.code, details: result.details };
      }
    } catch (error) {
      return { success: false, error: 'Login failed', code: 'LOGIN_ERROR' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const result = await authService.register(userData);
      if (result.success) {
        authService.storeTokens(result.accessToken, result.refreshToken);
        authService.storeUserData(result.user);
        setUser(result.user);
        setIsAuthenticated(true);
        return { success: true, user: result.user };
      } else {
        return { success: false, error: result.error, code: result.code, details: result.details };
      }
    } catch (error) {
      return { success: false, error: 'Registration failed', code: 'REGISTRATION_ERROR' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.clearAuthData();
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (updatedUserData) => {
    const newUserData = { ...user, ...updatedUserData };
    authService.storeUserData(newUserData);
    setUser(newUserData);
  };

  const changePassword = async (passwordData) => {
    try {
      const result = await authService.changePassword(passwordData);
      return result;
    } catch (error) {
      return { success: false, error: 'Password change failed', code: 'PASSWORD_CHANGE_ERROR' };
    }
  };

  const refreshAuthToken = async () => {
    const refreshToken = authService.getRefreshToken();
    if (refreshToken) {
      const result = await authService.refreshToken(refreshToken);
      if (result.success) {
        authService.storeTokens(result.accessToken, refreshToken);
        return true;
      }
    }
    return false;
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    changePassword,
    refreshAuthToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};