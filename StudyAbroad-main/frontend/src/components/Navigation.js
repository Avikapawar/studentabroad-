import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLoading } from '../utils/loadingManager';
import { usePrefetchOnHover } from '../hooks/usePrefetch';
import { performanceUtils } from '../utils/performanceMonitor';
import './Navigation.css';

const Navigation = React.memo(() => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const { isLoading: isLoggingOut, executeWithLoading } = useLoading();

  const userDropdownRef = useRef(null);
  const notificationRef = useRef(null);

  // Prefetch handlers for performance
  const { handleMouseEnter: prefetchRecommendations } = usePrefetchOnHover('/api/recommendations');
  const { handleMouseEnter: prefetchBookmarks } = usePrefetchOnHover('/api/bookmarks');
  const { handleMouseEnter: prefetchProfile } = usePrefetchOnHover('/api/user/profile');

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);



  // Mock notifications (in real app, fetch from API)
  useEffect(() => {
    if (isAuthenticated) {
      setNotifications([
        {
          id: 1,
          type: 'recommendation',
          title: 'New University Recommendations',
          message: 'We found 5 new universities that match your profile',
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          read: false
        },
        {
          id: 2,
          type: 'deadline',
          title: 'Application Deadline Reminder',
          message: 'MIT application deadline is in 7 days',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          read: false
        }
      ]);
    }
  }, [isAuthenticated]);

  const handleLogout = useCallback(async () => {
    try {
      await executeWithLoading(async () => {
        await logout();
        navigate('/');
        setIsMobileMenuOpen(false);
        setShowUserDropdown(false);
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [executeWithLoading, logout, navigate]);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
    setShowUserDropdown(false);
    setShowNotifications(false);
  }, []);



  const markNotificationAsRead = useCallback((notificationId) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  // Memoized calculations for better performance
  const unreadNotificationCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const formatTimeAgo = useCallback((timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }, []);

  // Check if current path is active
  const isActive = useCallback((path) => location.pathname === path, [location.pathname]);

  // Memoized user display info
  const userDisplayInfo = useMemo(() => {
    if (!user) return { initial: 'U', name: 'User', email: '' };

    return {
      initial: (user.name || user.email || 'U').charAt(0).toUpperCase(),
      name: user.name || user.email?.split('@')[0] || 'User',
      email: user.email || ''
    };
  }, [user]);

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Logo/Brand */}
        <Link
          to="/"
          className="nav-logo"
          onClick={closeMobileMenu}
          style={{ textDecoration: 'none !important' }}
        >
          <span className="logo-icon">🎓</span>
          <span className="logo-text">StudyAbroad</span>
        </Link>

        {/* Desktop Navigation */}
        <div className={`nav-menu ${isMobileMenuOpen ? 'active' : ''}`}>
          {/* Public Navigation Items */}
          <Link
            to="/"
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
            onClick={closeMobileMenu}
            style={{ textDecoration: 'none' }}
          >
            <span className="nav-icon">🏠</span>
            <span className="nav-text">Home</span>
          </Link>

          <Link
            to="/search"
            className={`nav-link ${isActive('/search') ? 'active' : ''}`}
            onClick={closeMobileMenu}
            style={{ textDecoration: 'none' }}
          >
            <span className="nav-icon">🔍</span>
            <span className="nav-text">Search</span>
          </Link>

          {/* Authenticated User Navigation */}
          {isAuthenticated ? (
            <>
              <Link
                to="/compare"
                className={`nav-link ${isActive('/compare') ? 'active' : ''}`}
                onClick={closeMobileMenu}
                style={{ textDecoration: 'none' }}
              >
                <span className="nav-icon">📊</span>
                <span className="nav-text">Compare</span>
              </Link>

              <Link
                to="/recommendations"
                className={`nav-link ${isActive('/recommendations') ? 'active' : ''}`}
                onClick={closeMobileMenu}
                style={{ textDecoration: 'none' }}
              >
                <span className="nav-icon">🎯</span>
                <span className="nav-text">AI Recommendations</span>
              </Link>

              <Link
                to="/bookmarks"
                className={`nav-link ${isActive('/bookmarks') ? 'active' : ''}`}
                onClick={closeMobileMenu}
                onMouseEnter={prefetchBookmarks}
                style={{ textDecoration: 'none' }}
              >
                <span className="nav-icon">📚</span>
                <span className="nav-text">Bookmarks</span>
              </Link>

              {/* Notifications */}
              <div className="nav-notifications" ref={notificationRef}>
                <Link
                  to="/notifications"
                  className="notification-button"
                  onClick={closeMobileMenu}
                >
                  <span className="notification-icon">🔔</span>
                  {unreadNotificationCount > 0 && (
                    <span className="notification-badge">
                      {unreadNotificationCount}
                    </span>
                  )}
                </Link>


              </div>

              {/* User Menu Dropdown */}
              <div className="nav-user-menu" ref={userDropdownRef}>
                <button
                  className="user-menu-button"
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                >
                  <div className="user-avatar">
                    {userDisplayInfo.initial}
                  </div>
                  <span className="user-name">
                    {userDisplayInfo.name}
                  </span>
                  <span className="dropdown-arrow">▼</span>
                </button>

                {showUserDropdown && (
                  <div className="user-dropdown">
                    <div className="user-info">
                      <div className="user-avatar-large">
                        {userDisplayInfo.initial}
                      </div>
                      <div className="user-details">
                        <div className="user-name-large">
                          {userDisplayInfo.name}
                        </div>
                        <div className="user-email">
                          {userDisplayInfo.email}
                        </div>
                      </div>
                    </div>

                    <div className="dropdown-divider"></div>

                    <Link
                      to="/profile"
                      className="dropdown-item"
                      onClick={() => {
                        setShowUserDropdown(false);
                        closeMobileMenu();
                      }}
                      onMouseEnter={prefetchProfile}
                      style={{ textDecoration: 'none' }}
                    >
                      <span className="dropdown-icon">👤</span>
                      Profile Settings
                    </Link>

                    <Link
                      to="/preferences"
                      className="dropdown-item"
                      onClick={() => {
                        setShowUserDropdown(false);
                        closeMobileMenu();
                      }}
                      style={{ textDecoration: 'none' }}
                    >
                      <span className="dropdown-icon">⚙️</span>
                      Preferences
                    </Link>

                    <Link
                      to="/help"
                      className="dropdown-item"
                      onClick={() => {
                        setShowUserDropdown(false);
                        closeMobileMenu();
                      }}
                      style={{ textDecoration: 'none' }}
                    >
                      <span className="dropdown-icon">❓</span>
                      Help & Support
                    </Link>

                    <div className="dropdown-divider"></div>

                    <button
                      className="dropdown-item logout-item"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                    >
                      <span className="dropdown-icon">🚪</span>
                      {isLoggingOut ? 'Logging out...' : 'Logout'}
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Guest User Navigation */
            <>
              <Link
                to="/login"
                className={`nav-link ${isActive('/login') ? 'active' : ''}`}
                onClick={closeMobileMenu}
                style={{ textDecoration: 'none' }}
              >
                <span className="nav-icon">🔑</span>
                <span className="nav-text">Login</span>
              </Link>

              <Link
                to="/register"
                className="nav-link nav-register-btn"
                onClick={closeMobileMenu}
                style={{ textDecoration: 'none' }}
              >
                <span className="nav-icon">✨</span>
                <span className="nav-text">Get Started</span>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="nav-toggle" onClick={toggleMobileMenu}>
          <span className={`bar ${isMobileMenuOpen ? 'active' : ''}`}></span>
          <span className={`bar ${isMobileMenuOpen ? 'active' : ''}`}></span>
          <span className={`bar ${isMobileMenuOpen ? 'active' : ''}`}></span>
        </div>
      </div>


    </nav>
  );
});

Navigation.displayName = 'Navigation';

export default Navigation;