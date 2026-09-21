/**
 * Decode a JWT token without verification (client-side only)
 * @param {string} token - JWT token to decode
 * @returns {Object|null} Decoded payload or null if invalid
 */
export function decodeToken(token) {
  try {
    if (!token) return null;
    
    // JWT structure: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    // Decode the payload (second part)
    const payload = parts[1];
    
    // Handle base64url encoding (replace URL-safe chars)
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    
    // Decode base64
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error('Error decoding token:', err);
    return null;
  }
}

/**
 * Check if a token is expired
 * @param {string} token - JWT token to check
 * @returns {boolean} True if expired or invalid
 */
export function isTokenExpired(token) {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  
  // exp is in seconds, Date.now() is in milliseconds
  return decoded.exp * 1000 < Date.now();
}

/**
 * Get user info from token
 * @param {string} token - JWT token
 * @returns {Object|null} User info object or null
 */
export function getUserFromToken(token) {
  const decoded = decodeToken(token);
  if (!decoded) return null;
  
  return {
    id: decoded.id,
    email: decoded.email,
    role: decoded.role,
    name: decoded.name || null,
    avatar: decoded.avatar || null,
  };
}

