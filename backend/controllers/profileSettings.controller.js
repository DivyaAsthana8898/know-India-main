const { connectToDatabase } = require('../utils/db');

/**
 * Get current user profile
 * GET /api/profile/settings
 */
async function getProfile(req, res) {
  try {
    const userId = req.user.id;
    
    const connection = await connectToDatabase();
    const [users] = await connection.execute(
      'SELECT id, name, email, avatar, role, created_at FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'User not found',
      });
    }
    
    res.json({
      success: true,
      user: users[0],
    });
  } catch (err) {
    console.error('Error fetching profile:', err.message);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch profile',
    });
  }
}

/**
 * Update user profile (name only — avatar comes from Google OAuth)
 * PUT /api/profile/settings
 */
async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const { name } = req.body;
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Name is required and must not be empty',
      });
    }
    
    const trimmedName = name.trim();
    
    if (trimmedName.length > 100) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Name must be 100 characters or less',
      });
    }
    
    const connection = await connectToDatabase();
    
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE id = ?',
      [userId]
    );
    
    if (existingUsers.length === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'User not found',
      });
    }
    
    await connection.execute(
      'UPDATE users SET name = ? WHERE id = ?',
      [trimmedName, userId]
    );
    
    const [updatedUsers] = await connection.execute(
      'SELECT id, name, email, avatar, role, created_at FROM users WHERE id = ?',
      [userId]
    );
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUsers[0],
    });
  } catch (err) {
    console.error('Error updating profile:', err.message);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update profile',
    });
  }
}

module.exports = {
  getProfile,
  updateProfile,
};
