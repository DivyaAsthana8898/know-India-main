const express = require('express');
const passport = require('passport');
const crypto = require('crypto');
const { connectToDatabase } = require('../utils/db');
const { 
  generateToken, 
  blacklistToken, 
  verifyToken, 
  setTokenCookie, 
  clearTokenCookie,
  getTokenFromRequest 
} = require('../utils/jwt');

const router = express.Router();

/**
 * Find user by Google ID or create a new user
 * @param {Object} profile - Google profile data
 * @returns {Object} User from database
 */
async function findOrCreateUser(profile) {
  const connection = await connectToDatabase();

  // Check if user exists
  const [existingUsers] = await connection.execute(
    'SELECT * FROM users WHERE google_id = ?',
    [profile.id]
  );

  if (existingUsers.length > 0) {
    // User exists - update avatar and name from Google if changed
    const existingUser = existingUsers[0];
    const needsUpdate = existingUser.avatar !== profile.photo || existingUser.name !== profile.displayName;
    
    if (needsUpdate) {
      await connection.execute(
        'UPDATE users SET avatar = ?, name = ? WHERE id = ?',
        [profile.photo, profile.displayName, existingUser.id]
      );
      // Return updated user data
      return {
        ...existingUser,
        avatar: profile.photo,
        name: profile.displayName,
      };
    }
    
    return existingUser;
  }

  // Create new user
  const [result] = await connection.execute(
    `INSERT INTO users (google_id, name, email, avatar, role) VALUES (?, ?, ?, ?, ?)`,
    [
      profile.id,
      profile.displayName,
      profile.email,
      profile.photo,
      'user',
    ]
  );

  // Fetch the newly created user
  const [newUsers] = await connection.execute(
    'SELECT * FROM users WHERE id = ?',
    [result.insertId]
  );

  return newUsers[0];
}

// GET /auth/google - Start Google OAuth flow
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);

// GET /auth/google/callback - Handle Google OAuth callback
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/auth/failure',
  }),
  async (req, res) => {
    try {
      // Find or create user in database
      const user = await findOrCreateUser(req.user);

      // Generate JWT token
      const token = generateToken(user);

      // Get frontend URL from environment (production default)
      const clientUrl = process.env.CLIENT_URL || 'https://knowindia.aryankr.in';

      // SECURITY: Set token in HttpOnly cookie (prevents XSS token theft)
      setTokenCookie(res, token);

      // SECURITY: Also pass token in URL for backward compatibility
      // Frontend should prefer cookie but can use URL token for initial setup
      res.redirect(`${clientUrl}/auth/success?token=${token}`);
    } catch (err) {
      console.error('OAuth callback error:', err.message);
      const clientUrl = process.env.CLIENT_URL || 'https://knowindia.aryankr.in';
      res.redirect(`${clientUrl}/auth/failure?error=${encodeURIComponent(err.message)}`);
    }
  }
);

// GET /auth/failure - Handle authentication failure
router.get('/failure', (req, res) => {
  const clientUrl = process.env.CLIENT_URL || 'https://knowindia.aryankr.in';
  res.redirect(`${clientUrl}/auth/failure?error=authentication_failed`);
});

/**
 * GET /auth/logout - Logout user and invalidate token
 * SECURITY: Blacklists the token and clears HttpOnly cookie
 */
router.get('/logout', (req, res) => {
  try {
    // SECURITY: Get token from cookie or header
    const token = getTokenFromRequest(req);
    
    // SECURITY: Blacklist the token to prevent reuse after logout
    if (token && token.trim() !== '') {
      blacklistToken(token);
    }
    
    // SECURITY: Clear the HttpOnly cookie
    clearTokenCookie(res);
    
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (err) {
    console.error('Logout error:', err.message);
    // SECURITY: Still clear cookie even on error
    clearTokenCookie(res);
    res.json({
      success: true,
      message: 'Logged out',
    });
  }
});

/**
 * POST /auth/logout - Logout user (POST method for better security)
 * SECURITY: POST is preferred for logout to prevent CSRF via GET
 */
router.post('/logout', (req, res) => {
  try {
    // SECURITY: Get token from cookie or header
    const token = getTokenFromRequest(req);
    
    if (token && token.trim() !== '') {
      blacklistToken(token);
    }
    
    // SECURITY: Clear the HttpOnly cookie
    clearTokenCookie(res);
    
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (err) {
    console.error('Logout error:', err.message);
    clearTokenCookie(res);
    res.json({
      success: true,
      message: 'Logged out',
    });
  }
});

/**
 * GET /auth/status - Check authentication status
 * SECURITY: Returns user info if token is valid, null otherwise
 * Checks HttpOnly cookie first, then Authorization header
 */
router.get('/status', async (req, res) => {
  try {
    // SECURITY: Get token from HttpOnly cookie or header
    const token = getTokenFromRequest(req);
    
    if (!token) {
      return res.json({
        authenticated: false,
        user: null,
      });
    }
    
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.json({
        authenticated: false,
        user: null,
      });
    }
    
    // SECURITY: Verify user still exists in database
    const connection = await connectToDatabase();
    const [users] = await connection.execute(
      'SELECT id, email, name, role, avatar FROM users WHERE id = ?',
      [decoded.id]
    );
    
    if (users.length === 0) {
      return res.json({
        authenticated: false,
        user: null,
      });
    }
    
    res.json({
      authenticated: true,
      user: {
        id: users[0].id,
        email: users[0].email,
        name: users[0].name,
        role: users[0].role,
        avatar: users[0].avatar,
      },
    });
  } catch (err) {
    // SECURITY: Don't expose error details, just return unauthenticated
    res.json({
      authenticated: false,
      user: null,
    });
  }
});

/**
 * GET /auth/me - Get current user info (requires valid token)
 * SECURITY: Validates token and returns user profile
 * Checks HttpOnly cookie first, then Authorization header
 */
router.get('/me', async (req, res) => {
  try {
    // SECURITY: Get token from HttpOnly cookie or header
    const token = getTokenFromRequest(req);
    
    if (!token) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'No token provided',
      });
    }
    
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid or expired token',
      });
    }
    
    // SECURITY: Always verify user exists in database
    const connection = await connectToDatabase();
    const [users] = await connection.execute(
      'SELECT id, email, name, role, avatar FROM users WHERE id = ?',
      [decoded.id]
    );
    
    if (users.length === 0) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'User not found',
      });
    }
    
    res.json({
      success: true,
      user: {
        id: users[0].id,
        email: users[0].email,
        name: users[0].name,
        role: users[0].role,
        avatar: users[0].avatar,
      },
    });
  } catch (err) {
    console.error('Get user error:', err.message);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get user info',
    });
  }
});

/**
 * GET /auth/csrf-token - Get CSRF token for state-changing operations
 * SECURITY: Returns a CSRF token that must be included in POST/PUT/DELETE requests
 */
router.get('/csrf-token', (req, res) => {
  // SECURITY: Generate a CSRF token tied to the session
  const csrfToken = crypto.randomBytes(32).toString('hex');
  
  // SECURITY: Store CSRF token in HttpOnly cookie
  res.cookie('csrf_token', csrfToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 60 * 60 * 1000, // 1 hour
    path: '/',
  });
  
  // Return token for frontend to include in requests
  res.json({
    success: true,
    csrfToken,
  });
});

module.exports = router;
