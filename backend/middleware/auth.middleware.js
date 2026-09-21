const { verifyToken, getTokenFromRequest } = require('../utils/jwt');

/**
 * Middleware to verify JWT token and attach user to request
 * SECURITY: Checks HttpOnly cookie first, then Authorization header
 * Returns 401 if token is missing or invalid
 */
function authRequired(req, res, next) {
  // SECURITY: Get token from HttpOnly cookie (preferred) or header
  const token = getTokenFromRequest(req);
  
  if (!token) {
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'No token provided' 
    });
  }
  
  const decoded = verifyToken(token);
  
  if (!decoded) {
    return res.status(401).json({ 
      error: 'Authentication failed',
      message: 'Invalid or expired token' 
    });
  }
  
  req.user = decoded;
  req.token = token; // Store for potential logout
  next();
}

/**
 * Optional auth middleware - attaches user if token exists, but doesn't require it
 * SECURITY: Checks HttpOnly cookie first, then Authorization header
 */
function authOptional(req, res, next) {
  // SECURITY: Get token from HttpOnly cookie (preferred) or header
  const token = getTokenFromRequest(req);
  
  if (token) {
    const decoded = verifyToken(token);
    
    if (decoded) {
      req.user = decoded;
      req.token = token;
    }
  }
  
  next();
}

/**
 * CSRF protection middleware for state-changing operations
 * SECURITY: Validates CSRF token from header against cookie
 * Use on POST, PUT, PATCH, DELETE routes
 */
function csrfProtection(req, res, next) {
  // SECURITY: Skip CSRF check for GET, HEAD, OPTIONS (safe methods)
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  // SECURITY: Get CSRF token from cookie and header
  const cookieToken = req.cookies?.csrf_token;
  const headerToken = req.headers['x-csrf-token'] || req.body?._csrf;
  
  // SECURITY: Validate both tokens exist and match
  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({
      error: 'CSRF validation failed',
      message: 'Invalid or missing CSRF token',
    });
  }
  
  next();
}

module.exports = {
  authRequired,
  authOptional,
  csrfProtection,
};

