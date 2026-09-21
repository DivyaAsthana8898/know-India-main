/**
 * Utility to sync locally stored feedback with the server
 * when the database connection is restored
 * 
 * SECURITY: All API calls now include authentication headers
 */

import { API_CONFIG, getApiUrl } from '../config';

const TOKEN_KEY = 'auth_token';

/**
 * Get auth headers for API requests
 * @returns {Object} Headers object with auth token if available
 */
const getAuthHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

/**
 * Attempts to sync any pending feedback stored in local storage
 * @returns {Promise<{success: boolean, synced: number, failed: number, errors: Array}>}
 */
export const syncPendingFeedback = async () => {
  const result = {
    success: false,
    synced: 0,
    failed: 0,
    errors: []
  };

  try {
    // Check if there's any pending feedback
    const pendingFeedback = JSON.parse(localStorage.getItem('pendingFeedback')) || [];
    
    if (pendingFeedback.length === 0) {
      console.log('No pending feedback to sync');
      result.success = true;
      return result;
    }

    console.log(`Found ${pendingFeedback.length} pending feedback items to sync`);

    // Check if the server is online and database is connected
    try {
      console.log('Checking server and database health...');
      // SECURITY: Include credentials for HttpOnly cookie auth
      const healthResponse = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.HEALTH), {
        credentials: 'include',
      });
      
      if (!healthResponse.ok) {
        console.error('Server health check failed, aborting sync');
        result.errors.push('Server health check failed');
        return result;
      }
      
      const healthStatus = await healthResponse.json();
      console.log('Server health status:', healthStatus);
      
      if (healthStatus.db_connection !== 'connected') {
        console.error('Database is still not connected, aborting sync');
        result.errors.push('Database not connected');
        return result;
      }
      
      // Double-check with a database test endpoint
      // SECURITY: Include credentials for HttpOnly cookie auth
      const dbResponse = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.DB_TEST), {
        credentials: 'include',
      });
      
      if (!dbResponse.ok) {
        console.error('Database test failed, aborting sync');
        result.errors.push('Database test failed');
        return result;
      }
      
      const dbStatus = await dbResponse.json();
      console.log('Database test status:', dbStatus);
      
      if (!dbStatus.connected) {
        console.error('Database test indicates database is not connected, aborting sync');
        result.errors.push('Database test indicates not connected');
        return result;
      }
    } catch (healthError) {
      console.error('Error checking server health:', healthError);
      result.errors.push(`Health check error: ${healthError.message}`);
      return result;
    }

    // Server and database are available, start syncing
    const successfullySubmitted = [];
    
    for (let i = 0; i < pendingFeedback.length; i++) {
      const feedback = pendingFeedback[i];
      try {
        // Remove the timestamp field before sending
        const { timestamp: _timestamp, ...feedbackData } = feedback;
        
        console.log(`Syncing item ${i+1}/${pendingFeedback.length}:`, feedbackData);
        
        // SECURITY: Include auth headers and credentials for authenticated sync
        const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.FEEDBACK), {
          method: 'POST',
          headers: getAuthHeaders(),
          credentials: 'include', // SECURITY: Include HttpOnly cookies
          body: JSON.stringify(feedbackData),
        });

        if (response.ok) {
          const responseData = await response.json();
          console.log(`Successfully synced item ${i+1}, server response:`, responseData);
          // Successfully submitted this feedback
          successfullySubmitted.push(i);
          result.synced++;
        } else {
          // Failed to submit this feedback
          result.failed++;
          try {
            const errorData = await response.json();
            console.error(`Failed to sync item ${i+1}:`, errorData);
            result.errors.push(`Failed to sync item ${i+1}: ${errorData.error || response.status}`);
          } catch (e) {
            console.error(`Failed to parse error response for item ${i+1}:`, e);
            result.errors.push(`Failed to sync item ${i+1}: ${response.status}`);
          }
        }
      } catch (error) {
        // Error submitting this feedback
        result.failed++;
        console.error(`Error syncing item ${i+1}:`, error);
        result.errors.push(`Error syncing item ${i+1}: ${error.message}`);
      }
    }

    // Remove successfully submitted feedback from local storage
    if (successfullySubmitted.length > 0) {
      const remainingFeedback = pendingFeedback.filter((_, index) => !successfullySubmitted.includes(index));
      
      if (remainingFeedback.length > 0) {
        localStorage.setItem('pendingFeedback', JSON.stringify(remainingFeedback));
        console.log(`Updated local storage: ${remainingFeedback.length} items remaining`);
      } else {
        localStorage.removeItem('pendingFeedback');
        console.log('All feedback synced, cleared local storage');
      }
      
      console.log(`Synced ${successfullySubmitted.length} feedback items, ${remainingFeedback.length} remaining`);
    }

    result.success = result.synced > 0;
    return result;
  } catch (error) {
    console.error('Error syncing feedback:', error);
    result.errors.push(`Sync error: ${error.message}`);
    return result;
  }
};

/**
 * Check if there's any pending feedback in local storage
 * @returns {boolean} - True if there's pending feedback
 */
export const hasPendingFeedback = () => {
  try {
    const pendingFeedback = JSON.parse(localStorage.getItem('pendingFeedback')) || [];
    return pendingFeedback.length > 0;
  } catch (error) {
    console.error('Error checking pending feedback:', error);
    return false;
  }
};
