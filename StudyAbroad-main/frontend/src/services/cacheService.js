/**
 * Advanced caching service with multiple storage strategies
 */

class CacheService {
  constructor() {
    this.memoryCache = new Map();
    this.maxMemorySize = 100; // Maximum number of items in memory cache
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes default TTL
    this.compressionThreshold = 1024; // Compress data larger than 1KB
  }

  /**
   * Generate cache key from URL and parameters
   */
  generateKey(url, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {});
    
    return `${url}:${JSON.stringify(sortedParams)}`;
  }

  /**
   * Compress data for storage
   */
  compress(data) {
    const jsonString = JSON.stringify(data);
    if (jsonString.length < this.compressionThreshold) {
      return { data: jsonString, compressed: false };
    }
    
    // Simple compression using btoa (base64 encoding)
    // In production, you might want to use a proper compression library
    try {
      const compressed = btoa(jsonString);
      return { data: compressed, compressed: true };
    } catch (error) {
      return { data: jsonString, compressed: false };
    }
  }

  /**
   * Decompress data from storage
   */
  decompress(cacheItem) {
    if (!cacheItem.compressed) {
      return JSON.parse(cacheItem.data);
    }
    
    try {
      const decompressed = atob(cacheItem.data);
      return JSON.parse(decompressed);
    } catch (error) {
      console.warn('Failed to decompress cache data:', error);
      return null;
    }
  }

  /**
   * Set item in cache with multiple storage strategies
   */
  set(key, data, ttl = this.defaultTTL, strategy = 'memory') {
    const expiresAt = Date.now() + ttl;
    const compressed = this.compress(data);
    
    const cacheItem = {
      data: compressed.data,
      compressed: compressed.compressed,
      expiresAt,
      createdAt: Date.now(),
      accessCount: 0,
      lastAccessed: Date.now()
    };

    switch (strategy) {
      case 'memory':
        this.setMemoryCache(key, cacheItem);
        break;
      case 'localStorage':
        this.setLocalStorageCache(key, cacheItem);
        break;
      case 'sessionStorage':
        this.setSessionStorageCache(key, cacheItem);
        break;
      case 'hybrid':
        // Store in both memory and localStorage
        this.setMemoryCache(key, cacheItem);
        this.setLocalStorageCache(key, cacheItem);
        break;
      default:
        this.setMemoryCache(key, cacheItem);
    }
  }

  /**
   * Get item from cache with fallback strategies
   */
  get(key, strategies = ['memory', 'localStorage', 'sessionStorage']) {
    for (const strategy of strategies) {
      let cacheItem;
      
      switch (strategy) {
        case 'memory':
          cacheItem = this.getMemoryCache(key);
          break;
        case 'localStorage':
          cacheItem = this.getLocalStorageCache(key);
          break;
        case 'sessionStorage':
          cacheItem = this.getSessionStorageCache(key);
          break;
      }

      if (cacheItem) {
        // Check if item has expired
        if (Date.now() > cacheItem.expiresAt) {
          this.delete(key, strategy);
          continue;
        }

        // Update access statistics
        cacheItem.accessCount++;
        cacheItem.lastAccessed = Date.now();

        // If found in persistent storage, also cache in memory for faster access
        if (strategy !== 'memory') {
          this.setMemoryCache(key, cacheItem);
        }

        return this.decompress(cacheItem);
      }
    }

    return null;
  }

  /**
   * Memory cache operations
   */
  setMemoryCache(key, cacheItem) {
    // Implement LRU eviction if cache is full
    if (this.memoryCache.size >= this.maxMemorySize) {
      const oldestKey = this.findLeastRecentlyUsed();
      if (oldestKey) {
        this.memoryCache.delete(oldestKey);
      }
    }
    
    this.memoryCache.set(key, cacheItem);
  }

  getMemoryCache(key) {
    return this.memoryCache.get(key);
  }

  /**
   * localStorage cache operations
   */
  setLocalStorageCache(key, cacheItem) {
    try {
      const cacheKey = `cache:${key}`;
      localStorage.setItem(cacheKey, JSON.stringify(cacheItem));
    } catch (error) {
      console.warn('Failed to set localStorage cache:', error);
      // Handle quota exceeded error
      if (error.name === 'QuotaExceededError') {
        this.clearExpiredLocalStorage();
        try {
          localStorage.setItem(`cache:${key}`, JSON.stringify(cacheItem));
        } catch (retryError) {
          console.warn('Failed to set localStorage cache after cleanup:', retryError);
        }
      }
    }
  }

  getLocalStorageCache(key) {
    try {
      const cacheKey = `cache:${key}`;
      const item = localStorage.getItem(cacheKey);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.warn('Failed to get localStorage cache:', error);
      return null;
    }
  }

  /**
   * sessionStorage cache operations
   */
  setSessionStorageCache(key, cacheItem) {
    try {
      const cacheKey = `cache:${key}`;
      sessionStorage.setItem(cacheKey, JSON.stringify(cacheItem));
    } catch (error) {
      console.warn('Failed to set sessionStorage cache:', error);
    }
  }

  getSessionStorageCache(key) {
    try {
      const cacheKey = `cache:${key}`;
      const item = sessionStorage.getItem(cacheKey);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.warn('Failed to get sessionStorage cache:', error);
      return null;
    }
  }

  /**
   * Delete item from cache
   */
  delete(key, strategy = 'all') {
    if (strategy === 'all' || strategy === 'memory') {
      this.memoryCache.delete(key);
    }
    
    if (strategy === 'all' || strategy === 'localStorage') {
      try {
        localStorage.removeItem(`cache:${key}`);
      } catch (error) {
        console.warn('Failed to remove from localStorage:', error);
      }
    }
    
    if (strategy === 'all' || strategy === 'sessionStorage') {
      try {
        sessionStorage.removeItem(`cache:${key}`);
      } catch (error) {
        console.warn('Failed to remove from sessionStorage:', error);
      }
    }
  }

  /**
   * Clear all cache
   */
  clear(strategy = 'all') {
    if (strategy === 'all' || strategy === 'memory') {
      this.memoryCache.clear();
    }
    
    if (strategy === 'all' || strategy === 'localStorage') {
      this.clearLocalStorageCache();
    }
    
    if (strategy === 'all' || strategy === 'sessionStorage') {
      this.clearSessionStorageCache();
    }
  }

  /**
   * Clear expired items from localStorage
   */
  clearExpiredLocalStorage() {
    const now = Date.now();
    const keysToRemove = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('cache:')) {
        try {
          const item = JSON.parse(localStorage.getItem(key));
          if (item && item.expiresAt && now > item.expiresAt) {
            keysToRemove.push(key);
          }
        } catch (error) {
          // Remove invalid cache items
          keysToRemove.push(key);
        }
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  /**
   * Clear all cache items from localStorage
   */
  clearLocalStorageCache() {
    const keysToRemove = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('cache:')) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  /**
   * Clear all cache items from sessionStorage
   */
  clearSessionStorageCache() {
    const keysToRemove = [];
    
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith('cache:')) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => sessionStorage.removeItem(key));
  }

  /**
   * Find least recently used item in memory cache
   */
  findLeastRecentlyUsed() {
    let oldestKey = null;
    let oldestTime = Date.now();
    
    for (const [key, item] of this.memoryCache.entries()) {
      if (item.lastAccessed < oldestTime) {
        oldestTime = item.lastAccessed;
        oldestKey = key;
      }
    }
    
    return oldestKey;
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const memorySize = this.memoryCache.size;
    const localStorageSize = this.getLocalStorageCacheSize();
    const sessionStorageSize = this.getSessionStorageCacheSize();
    
    return {
      memory: {
        size: memorySize,
        maxSize: this.maxMemorySize,
        usage: (memorySize / this.maxMemorySize) * 100
      },
      localStorage: {
        size: localStorageSize,
        usage: this.getStorageUsage('localStorage')
      },
      sessionStorage: {
        size: sessionStorageSize,
        usage: this.getStorageUsage('sessionStorage')
      }
    };
  }

  /**
   * Get localStorage cache size
   */
  getLocalStorageCacheSize() {
    let count = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('cache:')) {
        count++;
      }
    }
    return count;
  }

  /**
   * Get sessionStorage cache size
   */
  getSessionStorageCacheSize() {
    let count = 0;
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith('cache:')) {
        count++;
      }
    }
    return count;
  }

  /**
   * Get storage usage percentage
   */
  getStorageUsage(storageType) {
    try {
      const storage = storageType === 'localStorage' ? localStorage : sessionStorage;
      let totalSize = 0;
      
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        const value = storage.getItem(key);
        totalSize += key.length + (value ? value.length : 0);
      }
      
      // Estimate quota (usually 5-10MB for localStorage)
      const estimatedQuota = 5 * 1024 * 1024; // 5MB
      return (totalSize / estimatedQuota) * 100;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Preload data into cache
   */
  async preload(requests) {
    const promises = requests.map(async ({ key, fetcher, ttl, strategy }) => {
      try {
        const data = await fetcher();
        this.set(key, data, ttl, strategy);
        return { key, success: true };
      } catch (error) {
        console.warn(`Failed to preload cache for key: ${key}`, error);
        return { key, success: false, error };
      }
    });

    return Promise.allSettled(promises);
  }

  /**
   * Invalidate cache by pattern
   */
  invalidatePattern(pattern) {
    const regex = new RegExp(pattern);
    
    // Clear from memory cache
    for (const key of this.memoryCache.keys()) {
      if (regex.test(key)) {
        this.memoryCache.delete(key);
      }
    }
    
    // Clear from localStorage
    const localStorageKeysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('cache:')) {
        const cacheKey = key.substring(6); // Remove 'cache:' prefix
        if (regex.test(cacheKey)) {
          localStorageKeysToRemove.push(key);
        }
      }
    }
    localStorageKeysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Clear from sessionStorage
    const sessionStorageKeysToRemove = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith('cache:')) {
        const cacheKey = key.substring(6); // Remove 'cache:' prefix
        if (regex.test(cacheKey)) {
          sessionStorageKeysToRemove.push(key);
        }
      }
    }
    sessionStorageKeysToRemove.forEach(key => sessionStorage.removeItem(key));
  }
}

// Create singleton instance
const cacheService = new CacheService();

// Cache configuration for different data types
export const CACHE_CONFIGS = {
  UNIVERSITIES: {
    ttl: 30 * 60 * 1000, // 30 minutes
    strategy: 'hybrid'
  },
  USER_PROFILE: {
    ttl: 10 * 60 * 1000, // 10 minutes
    strategy: 'memory'
  },
  RECOMMENDATIONS: {
    ttl: 15 * 60 * 1000, // 15 minutes
    strategy: 'localStorage'
  },
  SEARCH_RESULTS: {
    ttl: 5 * 60 * 1000, // 5 minutes
    strategy: 'sessionStorage'
  },
  STATIC_DATA: {
    ttl: 60 * 60 * 1000, // 1 hour
    strategy: 'localStorage'
  }
};

export default cacheService;