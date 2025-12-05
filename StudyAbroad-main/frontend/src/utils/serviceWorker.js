/**
 * Service Worker registration and management utilities
 */
import React from 'react';

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(
    /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
  )
);

export function register(config) {
  if ('serviceWorker' in navigator) {
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/sw.js`;

      if (isLocalhost) {
        checkValidServiceWorker(swUrl, config);
        navigator.serviceWorker.ready.then(() => {
          console.log(
            'This web app is being served cache-first by a service ' +
            'worker. To learn more, visit https://cra.link/PWA'
          );
        });
      } else {
        registerValidSW(swUrl, config);
      }
    });
  }
}

function registerValidSW(swUrl, config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      console.log('Service Worker registered successfully:', registration);
      
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }
        
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              console.log(
                'New content is available and will be used when all ' +
                'tabs for this page are closed. See https://cra.link/PWA.'
              );

              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              console.log('Content is cached for offline use.');

              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('Error during service worker registration:', error);
    });
}

function checkValidServiceWorker(swUrl, config) {
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then((response) => {
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log(
        'No internet connection found. App is running in offline mode.'
      );
    });
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}

// Service Worker messaging utilities
export class ServiceWorkerManager {
  constructor() {
    this.registration = null;
    this.isOnline = navigator.onLine;
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Online/offline detection
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyOnlineStatus(true);
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyOnlineStatus(false);
    });

    // Service Worker messages
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        this.handleServiceWorkerMessage(event);
      });
    }
  }

  async initialize() {
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.ready;
        console.log('Service Worker ready');
        return this.registration;
      } catch (error) {
        console.error('Service Worker initialization failed:', error);
        return null;
      }
    }
    return null;
  }

  // Send message to service worker
  async sendMessage(type, payload = {}) {
    if (!this.registration || !this.registration.active) {
      console.warn('Service Worker not available');
      return;
    }

    this.registration.active.postMessage({
      type,
      payload
    });
  }

  // Handle messages from service worker
  handleServiceWorkerMessage(event) {
    const { type, payload } = event.data;
    
    switch (type) {
      case 'CACHE_UPDATED':
        console.log('Cache updated:', payload);
        break;
      case 'OFFLINE_READY':
        console.log('App ready for offline use');
        break;
      default:
        console.log('Unknown service worker message:', type, payload);
    }
  }

  // Clear all caches
  async clearCache(cacheName = null) {
    await this.sendMessage('CLEAR_CACHE', { cacheName });
  }

  // Preload routes for offline access
  async preloadRoutes(routes) {
    await this.sendMessage('PRELOAD_ROUTES', { routes });
  }

  // Skip waiting for new service worker
  async skipWaiting() {
    await this.sendMessage('SKIP_WAITING');
  }

  // Check if app is running offline
  isOffline() {
    return !this.isOnline;
  }

  // Notify components about online status changes
  notifyOnlineStatus(isOnline) {
    window.dispatchEvent(new CustomEvent('onlineStatusChange', {
      detail: { isOnline }
    }));
  }

  // Queue offline actions
  async queueOfflineAction(action) {
    const offlineActions = this.getOfflineActions();
    offlineActions.push({
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...action
    });
    localStorage.setItem('offlineActions', JSON.stringify(offlineActions));
  }

  // Get queued offline actions
  getOfflineActions() {
    try {
      return JSON.parse(localStorage.getItem('offlineActions') || '[]');
    } catch (error) {
      console.error('Failed to parse offline actions:', error);
      return [];
    }
  }

  // Clear processed offline actions
  clearOfflineActions() {
    localStorage.removeItem('offlineActions');
  }

  // Sync offline actions when back online
  async syncOfflineActions() {
    if (!this.isOnline) return;

    const actions = this.getOfflineActions();
    if (actions.length === 0) return;

    console.log('Syncing offline actions:', actions.length);

    for (const action of actions) {
      try {
        await this.processOfflineAction(action);
      } catch (error) {
        console.error('Failed to sync offline action:', error);
      }
    }

    this.clearOfflineActions();
  }

  // Process individual offline action
  async processOfflineAction(action) {
    // This would be implemented based on your specific offline action types
    console.log('Processing offline action:', action);
  }
}

// Create singleton instance
export const serviceWorkerManager = new ServiceWorkerManager();

// React hook for service worker functionality
export function useServiceWorker() {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  const [swRegistration, setSwRegistration] = React.useState(null);
  const [updateAvailable, setUpdateAvailable] = React.useState(false);

  React.useEffect(() => {
    const handleOnlineStatus = (event) => {
      setIsOnline(event.detail.isOnline);
    };

    window.addEventListener('onlineStatusChange', handleOnlineStatus);

    // Initialize service worker
    serviceWorkerManager.initialize().then(setSwRegistration);

    return () => {
      window.removeEventListener('onlineStatusChange', handleOnlineStatus);
    };
  }, []);

  const clearCache = React.useCallback(async (cacheName) => {
    await serviceWorkerManager.clearCache(cacheName);
  }, []);

  const preloadRoutes = React.useCallback(async (routes) => {
    await serviceWorkerManager.preloadRoutes(routes);
  }, []);

  const skipWaiting = React.useCallback(async () => {
    await serviceWorkerManager.skipWaiting();
    window.location.reload();
  }, []);

  return {
    isOnline,
    isOffline: !isOnline,
    swRegistration,
    updateAvailable,
    clearCache,
    preloadRoutes,
    skipWaiting
  };
}

export default serviceWorkerManager;