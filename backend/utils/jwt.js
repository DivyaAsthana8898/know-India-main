const jwt = require('jsonwebtoken');

/**
 * SECURITY: Token blacklist for invalidated tokens (logout)
 * In production, replace with Redis for distributed deployments
 * Map<token, expiryTimestamp>
 */
const tokenBlacklist = new Map();

/**
 * SECURITY: Clean up expired tokens from blacklist every 15 minutes
 * Prevents memory leaks from accumulating expired tokens
 */
setInterval(() => {
  const now = Date.now();
  for (const [token, expiry] of tokenBlacklist.entries()) {
    if (expiry < now) {
      tokenBlacklist.delete(token);
    }
  }
}, 15 * 60 * 1000);

/**
 * SECURITY: Get JWT secret with strict validation
 * Fails fast if secret is not configured
 */
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('FATAL: JWT_SECRET environment variable is required');
  }
  if (secret.length < 32) {
    console.warn('SECURITY WARNING: JWT_SECRET should be at least 32 characters');
  }
  return secret;
};

/**
 * SECURITY: Cookie configuration for HttpOnly JWT storage
 * HttpOnly prevents XSS attacks from accessing the token
 */
const COOKIE_OPTIONS = {
  httpOnly: true,           // SECURITY: Prevents JavaScript access (XSS protection)
  secure: process.env.NODE_ENV === 'production',  // HTTPS only in production
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',  // CSRF protection
  maxAge: 24 * 60 * 60 * 1000,   // 1 day in milliseconds
  path: '/',
};

/**
 * Generate a JWT token for a user
 * SECURITY: 1 day expiry for login validity
 * @param {Object} user - User object with id, role, name, email, avatar
 * @returns {string} JWT token
 */
function generateToken(user) {
  // SECURITY: Include email, name, and avatar for profile operations
  // These are needed for feedback submission and profile display
  const payload = {
    id: user.id,
    role: user.role,
    email: user.email,
    name: user.name,
    avatar: user.avatar || null, // Include avatar for Navbar profile picture display
    iat: Math.floor(Date.now() / 1000),
  };

  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: '1d', // Login validity: 1 day
    algorithm: 'HS256',
  });
}

/**
 * Set JWT token as HttpOnly cookie
 * SECURITY: HttpOnly cookies cannot be accessed by JavaScript (XSS protection)
 * @param {Object} res - Express response object
 * @param {string} token - JWT token
 */
function setTokenCookie(res, token) {
  res.cookie('auth_token', token, COOKIE_OPTIONS);
}

/**
 * Clear JWT cookie on logout
 * @param {Object} res - Express response object
 */
function clearTokenCookie(res) {
  res.clearCookie('auth_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
  });
}

/**
 * Extract token from request (cookie first, then header)
 * SECURITY: Prefers HttpOnly cookie over Authorization header
 * @param {Object} req - Express request object
 * @returns {string|null} Token or null
 */
function getTokenFromRequest(req) {
  // SECURITY: Check HttpOnly cookie first (more secure)
  if (req.cookies && req.cookies.auth_token) {
    return req.cookies.auth_token;
  }
  
  // Fallback to Authorization header for API clients
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return null;
}

/**
 * Verify and decode a JWT token
 * SECURITY: Validates signature, expiry, and checks blacklist
 * @param {string} token - JWT token to verify
 * @returns {Object|null} Decoded payload or null if invalid
 */
function verifyToken(token) {
  try {
    if (!token || token.trim() === '') {
      return null;
    }
    
    // SECURITY: Check if token has been blacklisted (logged out)
    if (isTokenBlacklisted(token)) {
      return null;
    }
    
    return jwt.verify(token, getJwtSecret(), {
      algorithms: ['HS256'], // SECURITY: Specify allowed algorithms
    });
  } catch (err) {
    // SECURITY: Don't log token contents, only error type
    if (err.name !== 'TokenExpiredError') {
      console.error('JWT verification failed:', err.name);
    }
    return null;
  }
}

/**
 * SECURITY: Check if a token is blacklisted
 * @param {string} token - JWT token to check
 * @returns {boolean} True if blacklisted
 */
function isTokenBlacklisted(token) {
  return tokenBlacklist.has(token);
}

/**
 * SECURITY: Add a token to the blacklist
 * Used during logout to invalidate tokens before expiry
 * @param {string} token - JWT token to blacklist
 */
function blacklistToken(token) {
  try {
    // Decode without verification to get expiry time
    const decoded = jwt.decode(token);
    if (decoded && decoded.exp) {
      // Store with expiry time (in milliseconds)
      tokenBlacklist.set(token, decoded.exp * 1000);
    } else {
      // If no expiry, set to 1 hour from now
      tokenBlacklist.set(token, Date.now() + 60 * 60 * 1000);
    }
  } catch (err) {
    // If decode fails, still blacklist for 1 hour
    tokenBlacklist.set(token, Date.now() + 60 * 60 * 1000);
  }
}

module.exports = {
  generateToken,
  verifyToken,
  getJwtSecret,
  isTokenBlacklisted,
  blacklistToken,
  setTokenCookie,
  clearTokenCookie,
  getTokenFromRequest,
  COOKIE_OPTIONS,
};

