/**
 * Bookmark/Favorites Utility Functions
 * Uses backend API for authenticated users, localStorage as fallback
 * 
 * SECURITY NOTE: This utility checks localStorage token as fallback.
 * Components should prefer using AuthContext.isAuthenticated as the
 * single source of truth for authentication state.
 */

import { API_CONFIG } from '../config';

const STORAGE_KEY = 'knowindia_bookmarks';
const TOKEN_KEY = 'auth_token';

/**
 * Get auth token from localStorage
 * @returns {string|null} Token or null
 */
const getToken = () => localStorage.getItem(TOKEN_KEY);

/**
 * Check if user has a valid token (utility internal use)
 * NOTE: Components should use AuthContext.isAuthenticated instead
 * This is kept for backward compatibility within the bookmark utilities
 * @returns {boolean} True if token exists and is not expired
 */
const hasValidToken = () => {
  const token = getToken();
  if (!token) return false;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

/**
 * Get all bookmarked places - from API if logged in, localStorage otherwise
 * @returns {Promise<Array>} Array of bookmarked place objects
 */
export const getBookmarks = async () => {
  if (hasValidToken()) {
    try {
      // SECURITY: Use credentials: 'include' for HttpOnly cookie auth
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SAVED_PLACES}`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        // Also update localStorage for offline access
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.bookmarks || []));
        return data.bookmarks || [];
      }
    } catch (error) {
      console.error('Error fetching bookmarks from API:', error);
    }
  }
  
  // Fallback to localStorage
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading bookmarks from localStorage:', error);
    return [];
  }
};

/**
 * Get bookmarks synchronously from localStorage (for initial render)
 * @returns {Array} Array of bookmarked place objects
 */
export const getBookmarksSync = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading bookmarks:', error);
    return [];
  }
};

/**
 * Save bookmarks array to localStorage
 * @param {Array} bookmarks - Array of bookmark objects
 */
const saveBookmarksLocal = (bookmarks) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  } catch (error) {
    console.error('Error saving bookmarks:', error);
  }
};

/**
 * Check if a place is bookmarked (sync version for UI)
 * @param {string} placeId - The unique identifier for the place
 * @returns {boolean} True if bookmarked
 */
export const isBookmarked = (placeId) => {
  const bookmarks = getBookmarksSync();
  return bookmarks.some(b => b.id === placeId);
};

/**
 * Add a place to bookmarks
 * @param {Object} place - Place object with id, name, state, image, etc.
 * @returns {Promise<{success: boolean, requiresLogin: boolean}>} Result object
 */
export const addBookmark = async (place) => {
  if (!place || !place.id) {
    console.error('Invalid place object');
    return { success: false, requiresLogin: false };
  }
  
  // Require authentication to save
  if (!hasValidToken()) {
    return { success: false, requiresLogin: true };
  }
  
  // Create bookmark object
  const bookmark = {
    id: place.id,
    name: place.name,
    state: place.state || place.stateName,
    stateSlug: place.stateSlug || (place.state || '').toLowerCase().replace(/\s+/g, '-'),
    category: place.category_name || place.category || 'Place',
    image: place.images?.[0] || place.image || null,
    description: place.description?.substring(0, 150) || '',
    addedAt: Date.now(),
  };
  
  try {
    // SECURITY: Use credentials: 'include' for HttpOnly cookie auth
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SAVED_PLACES}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      credentials: 'include',
      body: JSON.stringify(bookmark),
    });
    
    if (response.ok || response.status === 409) {
      // Update local storage as well
      const bookmarks = getBookmarksSync();
      if (!bookmarks.some(b => b.id === place.id)) {
        bookmarks.unshift(bookmark);
        saveBookmarksLocal(bookmarks);
      }
      
      // Dispatch custom event for reactivity
      window.dispatchEvent(new CustomEvent('bookmarksUpdated', { 
        detail: { action: 'add', place: bookmark } 
      }));
      
      return { success: true, requiresLogin: false };
    }
    
    const data = await response.json();
    console.error('Failed to save bookmark:', data.message);
    return { success: false, requiresLogin: false };
  } catch (error) {
    console.error('Error saving bookmark:', error);
    return { success: false, requiresLogin: false };
  }
};

/**
 * Remove a place from bookmarks
 * @param {string} placeId - The unique identifier for the place
 * @returns {Promise<boolean>} True if removed successfully
 */
export const removeBookmark = async (placeId) => {
  if (!hasValidToken()) {
    // Remove from local only if not authenticated
    const bookmarks = getBookmarksSync();
    const filtered = bookmarks.filter(b => b.id !== placeId);
    
    if (filtered.length === bookmarks.length) {
      return false;
    }
    
    saveBookmarksLocal(filtered);
    window.dispatchEvent(new CustomEvent('bookmarksUpdated', { 
      detail: { action: 'remove', placeId } 
    }));
    return true;
  }
  
  try {
    // SECURITY: Use credentials: 'include' for HttpOnly cookie auth
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SAVED_PLACES}/${placeId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
        credentials: 'include',
      }
    );
    
    if (response.ok) {
      // Update local storage
      const bookmarks = getBookmarksSync();
      const filtered = bookmarks.filter(b => b.id !== placeId);
      saveBookmarksLocal(filtered);
      
      // Dispatch custom event for reactivity
      window.dispatchEvent(new CustomEvent('bookmarksUpdated', { 
        detail: { action: 'remove', placeId } 
      }));
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error removing bookmark:', error);
    return false;
  }
};

/**
 * Toggle bookmark status for a place
 * @param {Object} place - Place object
 * @returns {Promise<{newStatus: boolean, requiresLogin: boolean}>} Result object
 */
export const toggleBookmark = async (place) => {
  if (isBookmarked(place.id)) {
    const removed = await removeBookmark(place.id);
    return { newStatus: !removed, requiresLogin: false };
  } else {
    const result = await addBookmark(place);
    return { newStatus: result.success, requiresLogin: result.requiresLogin };
  }
};

/**
 * Get bookmark count
 * @returns {number} Number of bookmarked places
 */
export const getBookmarkCount = () => {
  return getBookmarksSync().length;
};

/**
 * Clear all bookmarks
 * @returns {Promise<boolean>} True if cleared successfully
 */
export const clearAllBookmarks = async () => {
  if (hasValidToken()) {
    try {
      // SECURITY: Use credentials: 'include' for HttpOnly cookie auth
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SAVED_PLACES}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
        credentials: 'include',
      });
      
      if (response.ok) {
        saveBookmarksLocal([]);
        window.dispatchEvent(new CustomEvent('bookmarksUpdated', { 
          detail: { action: 'clear' } 
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error clearing bookmarks:', error);
      return false;
    }
  }
  
  saveBookmarksLocal([]);
  window.dispatchEvent(new CustomEvent('bookmarksUpdated', { detail: { action: 'clear' } }));
  return true;
};

/**
 * Sync local bookmarks to server (call after login)
 * @returns {Promise<void>}
 */
export const syncBookmarksToServer = async () => {
  if (!hasValidToken()) return;
  
  const localBookmarks = getBookmarksSync();
  
  // Fetch server bookmarks
  const serverBookmarks = await getBookmarks();
  const serverIds = new Set(serverBookmarks.map(b => b.id));
  
  // Upload local bookmarks that aren't on server
  for (const bookmark of localBookmarks) {
    if (!serverIds.has(bookmark.id)) {
      try {
        // SECURITY: Use credentials: 'include' for HttpOnly cookie auth
        await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SAVED_PLACES}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`,
          },
          credentials: 'include',
          body: JSON.stringify(bookmark),
        });
      } catch (error) {
        console.error('Error syncing bookmark:', error);
      }
    }
  }
  
  // Refresh bookmarks from server
  await getBookmarks();
};

/**
 * Custom hook-like function to subscribe to bookmark changes
 * @param {Function} callback - Function to call when bookmarks change
 * @returns {Function} Unsubscribe function
 */
export const onBookmarksChange = (callback) => {
  const handler = (event) => callback(event.detail);
  window.addEventListener('bookmarksUpdated', handler);
  return () => window.removeEventListener('bookmarksUpdated', handler);
};
