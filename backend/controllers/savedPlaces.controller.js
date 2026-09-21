const { connectToDatabase } = require('../utils/db');
const { sanitizeText, sanitizeUserInput, sanitizeUrl } = require('../utils/sanitize');

// Flag to track if table has been initialized this session
let tableInitialized = false;

/**
 * SECURITY: Input validation helpers
 */

/**
 * Validate that an ID is a positive integer
 * SECURITY: Prevents SQL injection and invalid data
 */
function isValidId(id) {
  if (id === undefined || id === null) return false;
  const numId = parseInt(id, 10);
  return !isNaN(numId) && numId > 0 && String(numId) === String(id);
}

/**
 * Ensure the saved_places table exists
 */
async function ensureTableExists(connection) {
  if (tableInitialized) return;
  
  try {
    const createSavedPlacesQuery = `
      CREATE TABLE IF NOT EXISTS saved_places (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        place_id INT NOT NULL,
        place_name VARCHAR(255) NOT NULL,
        state VARCHAR(100) NOT NULL,
        state_slug VARCHAR(100),
        category VARCHAR(100),
        image TEXT,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_place (user_id, place_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;
    await connection.execute(createSavedPlacesQuery);
    tableInitialized = true;
    console.log('Saved places table verified/created');
  } catch (err) {
    console.error('Error ensuring saved_places table:', err.message);
    // Don't throw - let the operation continue and fail naturally if table doesn't exist
  }
}

/**
 * Get all saved places for the authenticated user
 * GET /api/saved-places
 */
async function getSavedPlaces(req, res) {
  try {
    const userId = req.user.id;
    
    const connection = await connectToDatabase();
    await ensureTableExists(connection);
    
    const [places] = await connection.execute(
      `SELECT id, place_id, place_name, state, state_slug, category, image, description, created_at 
       FROM saved_places 
       WHERE user_id = ? 
       ORDER BY created_at DESC`,
      [userId]
    );
    
    // Transform to match frontend bookmark format
    const bookmarks = places.map(place => ({
      id: place.place_id,
      name: place.place_name,
      state: place.state,
      stateSlug: place.state_slug,
      category: place.category,
      image: place.image,
      description: place.description,
      addedAt: new Date(place.created_at).getTime(),
    }));
    
    res.json({
      success: true,
      bookmarks,
      count: bookmarks.length,
    });
  } catch (err) {
    console.error('Error fetching saved places:', err.message);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch saved places',
    });
  }
}

/**
 * Add a place to saved places
 * POST /api/saved-places
 * SECURITY: Comprehensive input validation to prevent injection and abuse
 */
async function addSavedPlace(req, res) {
  try {
    const userId = req.user.id;
    const { id, name, state, stateSlug, category, image, description } = req.body;
    
    // SECURITY: Validate place ID is a positive integer
    if (!isValidId(id)) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Valid place ID is required',
      });
    }
    
    // SECURITY: Validate name is a non-empty string
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Place name is required',
      });
    }

    // SECURITY: Sanitize all inputs to prevent Stored XSS
    const sanitizedImage = image ? sanitizeUrl(image) : null;
    
    // SECURITY: Validate image URL if provided
    if (image && !sanitizedImage) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Invalid image URL format',
      });
    }
    
    // SECURITY: Sanitize all string inputs - strips HTML to prevent XSS
    const sanitizedData = {
      placeId: parseInt(id, 10),
      name: sanitizeText(name, 255),
      state: sanitizeText(state || '', 100),
      stateSlug: sanitizeText(stateSlug || '', 100),
      category: sanitizeText(category || 'Place', 100),
      image: sanitizedImage,
      // SECURITY: sanitizeUserInput for longer text content
      description: sanitizeUserInput(description || '', 2000),
    };
    
    const connection = await connectToDatabase();
    await ensureTableExists(connection);
    
    // Check if already saved
    const [existing] = await connection.execute(
      'SELECT id FROM saved_places WHERE user_id = ? AND place_id = ?',
      [userId, sanitizedData.placeId]
    );
    
    if (existing.length > 0) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'Place is already saved',
      });
    }
    
    // Insert new saved place with sanitized data
    await connection.execute(
      `INSERT INTO saved_places (user_id, place_id, place_name, state, state_slug, category, image, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, sanitizedData.placeId, sanitizedData.name, sanitizedData.state, 
       sanitizedData.stateSlug, sanitizedData.category, sanitizedData.image, sanitizedData.description]
    );
    
    res.status(201).json({
      success: true,
      message: 'Place saved successfully',
    });
  } catch (err) {
    // SECURITY: Don't expose internal error details
    console.error('Error saving place:', err.message);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to save place',
    });
  }
}

/**
 * Remove a place from saved places
 * DELETE /api/saved-places/:placeId
 * SECURITY: Validates placeId is a positive integer
 */
async function removeSavedPlace(req, res) {
  try {
    const userId = req.user.id;
    const { placeId } = req.params;
    
    // SECURITY: Validate placeId is a positive integer
    if (!isValidId(placeId)) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Valid place ID is required',
      });
    }
    
    const numericPlaceId = parseInt(placeId, 10);
    
    const connection = await connectToDatabase();
    await ensureTableExists(connection);
    
    const [result] = await connection.execute(
      'DELETE FROM saved_places WHERE user_id = ? AND place_id = ?',
      [userId, numericPlaceId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Saved place not found',
      });
    }
    
    res.json({
      success: true,
      message: 'Place removed from saved',
    });
  } catch (err) {
    console.error('Error removing saved place:', err.message);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to remove saved place',
    });
  }
}

/**
 * Clear all saved places for the user
 * DELETE /api/saved-places
 */
async function clearSavedPlaces(req, res) {
  try {
    const userId = req.user.id;
    
    const connection = await connectToDatabase();
    await ensureTableExists(connection);
    
    await connection.execute(
      'DELETE FROM saved_places WHERE user_id = ?',
      [userId]
    );
    
    res.json({
      success: true,
      message: 'All saved places cleared',
    });
  } catch (err) {
    console.error('Error clearing saved places:', err.message);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to clear saved places',
    });
  }
}

/**
 * Check if a place is saved
 * GET /api/saved-places/check/:placeId
 * SECURITY: Validates placeId is a positive integer
 */
async function checkSavedPlace(req, res) {
  try {
    const userId = req.user.id;
    const { placeId } = req.params;
    
    // SECURITY: Validate placeId is a positive integer
    if (!isValidId(placeId)) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Valid place ID is required',
      });
    }
    
    const numericPlaceId = parseInt(placeId, 10);
    
    const connection = await connectToDatabase();
    await ensureTableExists(connection);
    
    const [existing] = await connection.execute(
      'SELECT id FROM saved_places WHERE user_id = ? AND place_id = ?',
      [userId, numericPlaceId]
    );
    
    res.json({
      success: true,
      isSaved: existing.length > 0,
    });
  } catch (err) {
    console.error('Error checking saved place:', err.message);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to check saved status',
    });
  }
}

module.exports = {
  getSavedPlaces,
  addSavedPlace,
  removeSavedPlace,
  clearSavedPlaces,
  checkSavedPlace,
};
