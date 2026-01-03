import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const useNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const navigateTo = (path, options = {}) => {
    navigate(path, options);
  };

  const goBack = () => {
    navigate(-1);
  };

  const goHome = () => {
    navigate('/');
  };

  const goToLogin = (redirectTo = null) => {
    const state = redirectTo ? { from: redirectTo } : { from: location.pathname };
    navigate('/login', { state });
  };

  const goToRegister = () => {
    navigate('/register');
  };

  const goToProfile = () => {
    if (isAuthenticated) {
      navigate('/profile');
    } else {
      goToLogin('/profile');
    }
  };

  const goToRecommendations = () => {
    if (isAuthenticated) {
      navigate('/recommendations');
    } else {
      goToLogin('/recommendations');
    }
  };

  const goToBookmarks = () => {
    if (isAuthenticated) {
      navigate('/bookmarks');
    } else {
      goToLogin('/bookmarks');
    }
  };

  const isCurrentPath = (path) => {
    return location.pathname === path;
  };

  const isAuthPage = () => {
    return ['/login', '/register'].includes(location.pathname);
  };

  return {
    navigateTo,
    goBack,
    goHome,
    goToLogin,
    goToRegister,
    goToProfile,
    goToRecommendations,
    goToBookmarks,
    isCurrentPath,
    isAuthPage,
    currentPath: location.pathname
  };
};