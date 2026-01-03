import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './NotificationsPage.css';

const NotificationsPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [selectedNotifications, setSelectedNotifications] = useState(new Set());

  // Mock notifications data (in real app, fetch from API)
  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockNotifications = [
        {
          id: 1,
          type: 'recommendation',
          title: 'New University Recommendations Available',
          message: 'We found 8 new universities that match your academic profile and preferences. Check them out to discover your perfect match!',
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          read: false,
          priority: 'high',
          actionUrl: '/recommendations'
        },
        {
          id: 2,
          type: 'deadline',
          title: 'Application Deadline Reminder',
          message: 'MIT application deadline is approaching in 7 days. Make sure to submit all required documents.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          read: false,
          priority: 'urgent',
          actionUrl: '/applications'
        },
        {
          id: 3,
          type: 'update',
          title: 'Profile Completion',
          message: 'Your profile is 85% complete. Add your test scores and extracurricular activities to get better recommendations.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
          read: true,
          priority: 'medium',
          actionUrl: '/profile'
        },
        {
          id: 4,
          type: 'success',
          title: 'Application Submitted Successfully',
          message: 'Your application to Stanford University has been submitted successfully. You will receive updates on your application status.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          read: true,
          priority: 'low',
          actionUrl: '/applications'
        },
        {
          id: 5,
          type: 'info',
          title: 'New Feature: University Comparison Tool',
          message: 'Compare up to 5 universities side by side with our new comparison tool. Make informed decisions about your future.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
          read: false,
          priority: 'low',
          actionUrl: '/search'
        }
      ];
      
      setNotifications(mockNotifications);
      setLoading(false);
    };

    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getNotificationIcon = (type) => {
    const icons = {
      recommendation: '⭐',
      deadline: '⏰',
      update: '🔄',
      success: '✅',
      info: 'ℹ️'
    };
    return icons[type] || 'ℹ️';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: '#ef4444',
      high: '#f59e0b',
      medium: '#3b82f6',
      low: '#6b7280'
    };
    return colors[priority] || '#6b7280';
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  });

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  const deleteNotification = (notificationId) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    setSelectedNotifications(prev => {
      const newSet = new Set(prev);
      newSet.delete(notificationId);
      return newSet;
    });
  };

  const toggleSelectNotification = (notificationId) => {
    setSelectedNotifications(prev => {
      const newSet = new Set(prev);
      if (newSet.has(notificationId)) {
        newSet.delete(notificationId);
      } else {
        newSet.add(notificationId);
      }
      return newSet;
    });
  };

  const deleteSelectedNotifications = () => {
    setNotifications(prev => 
      prev.filter(notif => !selectedNotifications.has(notif.id))
    );
    setSelectedNotifications(new Set());
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="notifications-page">
        <div className="container">
          <LoadingSpinner size="large" message="Loading notifications..." />
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <div className="container">
        <div className="notifications-header">
          <div className="header-content">
            <h1 className="page-title">
              <span className="title-icon">🔔</span>
              Notifications
              {unreadCount > 0 && (
                <span className="unread-badge">{unreadCount}</span>
              )}
            </h1>
            <p className="page-subtitle">
              Stay updated with your university applications and recommendations
            </p>
          </div>

          <div className="header-actions">
            <div className="filter-tabs">
              <button
                className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All ({notifications.length})
              </button>
              <button
                className={`filter-tab ${filter === 'unread' ? 'active' : ''}`}
                onClick={() => setFilter('unread')}
              >
                Unread ({unreadCount})
              </button>
              <button
                className={`filter-tab ${filter === 'read' ? 'active' : ''}`}
                onClick={() => setFilter('read')}
              >
                Read ({notifications.length - unreadCount})
              </button>
            </div>

            <div className="action-buttons">
              {selectedNotifications.size > 0 && (
                <button
                  className="btn btn-danger btn-sm"
                  onClick={deleteSelectedNotifications}
                >
                  Delete Selected ({selectedNotifications.size})
                </button>
              )}
              {unreadCount > 0 && (
                <button
                  className="btn btn-outline btn-sm"
                  onClick={markAllAsRead}
                >
                  Mark All Read
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="notifications-content">
          {filteredNotifications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>No notifications found</h3>
              <p>
                {filter === 'unread' 
                  ? "You're all caught up! No unread notifications."
                  : filter === 'read'
                  ? "No read notifications to show."
                  : "You don't have any notifications yet."
                }
              </p>
            </div>
          ) : (
            <div className="notifications-list">
              {filteredNotifications.map(notification => (
                <div
                  key={notification.id}
                  className={`notification-card ${!notification.read ? 'unread' : ''}`}
                >
                  <div className="notification-select">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.has(notification.id)}
                      onChange={() => toggleSelectNotification(notification.id)}
                    />
                  </div>

                  <div className="notification-icon">
                    <span 
                      className="icon"
                      style={{ color: getPriorityColor(notification.priority) }}
                    >
                      {getNotificationIcon(notification.type)}
                    </span>
                  </div>

                  <div className="notification-content">
                    <div className="notification-header">
                      <h3 className="notification-title">
                        {notification.title}
                        {!notification.read && <span className="unread-dot"></span>}
                      </h3>
                      <div className="notification-meta">
                        <span className={`priority-badge priority-${notification.priority}`}>
                          {notification.priority}
                        </span>
                        <span className="notification-time">
                          {formatTimeAgo(notification.timestamp)}
                        </span>
                      </div>
                    </div>

                    <p className="notification-message">
                      {notification.message}
                    </p>

                    {notification.actionUrl && (
                      <div className="notification-actions">
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => window.location.href = notification.actionUrl}
                        >
                          View Details
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="notification-controls">
                    {!notification.read && (
                      <button
                        className="control-btn"
                        onClick={() => markAsRead(notification.id)}
                        title="Mark as read"
                      >
                        ✓
                      </button>
                    )}
                    <button
                      className="control-btn delete-btn"
                      onClick={() => deleteNotification(notification.id)}
                      title="Delete notification"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;