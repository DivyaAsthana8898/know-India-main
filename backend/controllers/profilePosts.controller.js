const { connectToDatabase } = require('../utils/db');
const { sanitizeText, sanitizeUserInput, sanitizeUrl } = require('../utils/sanitize');

/**
 * SECURITY: Validation helpers
 */

/**
 * Validation helper - checks if value is non-empty string
 */
function isValidString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Validation helper - checks if rating is valid (1-5)
 */
function isValidRating(value) {
  const rating = parseInt(value, 10);
  return !isNaN(rating) && rating >= 1 && rating <= 5;
}

/**
 * SECURITY: Validate that an ID is a positive integer
 * Prevents SQL injection and invalid data
 */
function isValidId(id) {
  if (id === undefined || id === null) return false;
  const numId = parseInt(id, 10);
  return !isNaN(numId) && numId > 0;
}

/**
 * Safely parse images JSON field
 * Handles malformed data gracefully
 */
function safeParseImages(imagesData) {
  if (!imagesData) return [];
  try {
    const parsed = JSON.parse(imagesData);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    // If JSON parse fails, check if it's a single URL string
    if (typeof imagesData === 'string' && imagesData.startsWith('http')) {
      return [imagesData];
    }
    return [];
  }
}

/**
 * Create a new profile post
 * POST /api/profile/posts
 * SECURITY: Comprehensive input validation
 */
async function createPost(req, res) {
  try {
    const { place_name, state, content, rating, images } = req.body;
    const userId = req.user.id;

    // Validate required fields
    const errors = [];

    if (!isValidString(place_name)) {
      errors.push('place_name is required and must be a non-empty string');
    }

    if (!isValidString(state)) {
      errors.push('state is required and must be a non-empty string');
    }

    if (!isValidString(content)) {
      errors.push('content is required and must be a non-empty string');
    }

    if (!isValidRating(rating)) {
      errors.push('rating is required and must be between 1 and 5');
    }

    // SECURITY: Validate images array if provided
    if (images && (!Array.isArray(images) || images.length > 10)) {
      errors.push('images must be an array with max 10 items');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        messages: errors,
      });
    }

    // SECURITY: Sanitize ALL inputs to prevent Stored XSS
    const sanitizedPlaceName = sanitizeText(place_name, 255);
    const sanitizedState = sanitizeText(state, 100);
    // SECURITY: sanitizeUserInput strips all HTML tags to prevent XSS
    const sanitizedContent = sanitizeUserInput(content, 10000);

    // SECURITY: Validate and sanitize image URLs
    let sanitizedImages = null;
    if (images && Array.isArray(images)) {
      sanitizedImages = images
        .map(url => sanitizeUrl(url))
        .filter(url => url !== null);
    }

    const connection = await connectToDatabase();

    // Insert the post with explicit pending status for approval workflow
    const [result] = await connection.execute(
      `INSERT INTO profile_posts (user_id, place_name, state, content, rating, images, status) 
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [
        userId,
        sanitizedPlaceName,
        sanitizedState,
        sanitizedContent,
        parseInt(rating, 10),
        sanitizedImages ? JSON.stringify(sanitizedImages) : null,
      ]
    );

    // Fetch the created post with user info
    const [posts] = await connection.execute(
      `SELECT 
        pp.*,
        u.name as user_name,
        u.email as user_email,
        u.avatar as user_avatar
      FROM profile_posts pp
      JOIN users u ON pp.user_id = u.id
      WHERE pp.id = ?`,
      [result.insertId]
    );

    const post = {
      ...posts[0],
      images: safeParseImages(posts[0].images),
    };

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post,
    });
  } catch (err) {
    console.error('Error creating profile post:', err.message);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create post',
    });
  }
}

/**
 * Get all profile posts (only approved ones for public viewing)
 * GET /api/profile/posts
 */
async function getAllPosts(req, res) {
  try {
    const connection = await connectToDatabase();

    // Log database name for debugging which database we're connected to
    const [dbInfo] = await connection.execute('SELECT DATABASE() as db_name');
    console.log(`getAllPosts: Connected to database: ${dbInfo[0].db_name}`);

    // First, check how many approved posts exist (for debugging)
    const [countResult] = await connection.execute(`
      SELECT COUNT(*) as total FROM profile_posts WHERE status = 'approved'
    `);
    console.log(`getAllPosts: Total approved posts in DB: ${countResult[0].total}`);

    // Only fetch approved posts for public display
    // Using LEFT JOIN to include posts even if user data is incomplete
    const [posts] = await connection.execute(`
      SELECT 
        pp.*,
        u.name as user_name,
        u.email as user_email,
        u.avatar as user_avatar
      FROM profile_posts pp
      LEFT JOIN users u ON pp.user_id = u.id
      WHERE pp.status = 'approved'
      ORDER BY pp.created_at DESC
    `);

    // Parse images JSON for each post with error handling
    const formattedPosts = posts.map((post) => ({
      ...post,
      images: safeParseImages(post.images),
      // Provide fallback for user data if not available
      user_name: post.user_name || 'Anonymous',
      user_email: post.user_email || '',
    }));

    // Log for debugging (will appear in Vercel logs)
    console.log(`getAllPosts: Found ${formattedPosts.length} approved posts with user data`);

    res.json({
      success: true,
      posts: formattedPosts,
      count: formattedPosts.length,
    });
  } catch (err) {
    console.error('Error fetching profile posts:', err.message, err.code);
    
    // Always return empty array on error - don't block the UI
    return res.json({
      success: true,
      posts: [],
      count: 0,
      error: err.message // Include error for debugging
    });
  }
}

/**
 * Get current user's posts (including pending ones)
 * GET /api/profile/posts/me
 * SECURITY: Returns only the authenticated user's posts
 */
async function getMyPosts(req, res) {
  try {
    const userId = req.user.id;
    const connection = await connectToDatabase();

    // Fetch all posts by the current user (including pending for their own view)
    const [posts] = await connection.execute(`
      SELECT 
        pp.*,
        u.name as user_name,
        u.email as user_email,
        u.avatar as user_avatar
      FROM profile_posts pp
      JOIN users u ON pp.user_id = u.id
      WHERE pp.user_id = ?
      ORDER BY pp.created_at DESC
    `, [userId]);

    // Parse images JSON for each post with error handling
    const formattedPosts = posts.map((post) => ({
      ...post,
      images: safeParseImages(post.images),
    }));

    res.json({
      success: true,
      posts: formattedPosts,
      count: formattedPosts.length,
    });
  } catch (err) {
    console.error('Error fetching user posts:', err.message);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch your posts',
    });
  }
}

/**
 * Get a single profile post by ID
 * GET /api/profile/posts/:id
 * SECURITY: Validates ID parameter
 */
async function getPostById(req, res) {
  try {
    const { id } = req.params;
    
    // SECURITY: Validate ID is a positive integer
    if (!isValidId(id)) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Invalid post ID',
      });
    }
    
    const numericId = parseInt(id, 10);
    const connection = await connectToDatabase();

    const [posts] = await connection.execute(
      `SELECT 
        pp.*,
        u.name as user_name,
        u.email as user_email,
        u.avatar as user_avatar
      FROM profile_posts pp
      JOIN users u ON pp.user_id = u.id
      WHERE pp.id = ?`,
      [numericId]
    );

    if (posts.length === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Post not found',
      });
    }

    const post = {
      ...posts[0],
      images: safeParseImages(posts[0].images),
    };

    res.json({
      success: true,
      post,
    });
  } catch (err) {
    console.error('Error fetching profile post:', err.message);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch post',
    });
  }
}

/**
 * Vote on a profile post (upvote or downvote)
 * POST /api/profile/posts/:id/vote
 * SECURITY: Validates ID and vote type
 */
async function voteOnPost(req, res) {
  try {
    const { id } = req.params;
    const { type } = req.body;
    const userId = req.user.id;

    // SECURITY: Validate ID is a positive integer
    if (!isValidId(id)) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Invalid post ID',
      });
    }

    // Validate vote type
    if (!type || !['upvote', 'downvote'].includes(type)) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'type must be either "upvote" or "downvote"',
      });
    }

    const numericId = parseInt(id, 10);
    const connection = await connectToDatabase();

    // Check if post exists
    const [posts] = await connection.execute(
      'SELECT id, upvotes, downvotes FROM profile_posts WHERE id = ?',
      [numericId]
    );

    if (posts.length === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Post not found',
      });
    }

    const post = posts[0];

    // Check if user already voted
    const [existingVotes] = await connection.execute(
      'SELECT id, vote_type FROM profile_post_votes WHERE post_id = ? AND user_id = ?',
      [numericId, userId]
    );

    let message = '';
    let newUpvotes = post.upvotes;
    let newDownvotes = post.downvotes;
    let userVote = null;

    if (existingVotes.length > 0) {
      const existingVote = existingVotes[0];

      if (existingVote.vote_type === type) {
        // Same vote - remove it (toggle off)
        await connection.execute(
          'DELETE FROM profile_post_votes WHERE post_id = ? AND user_id = ?',
          [numericId, userId]
        );

        if (type === 'upvote') {
          newUpvotes = Math.max(0, newUpvotes - 1);
        } else {
          newDownvotes = Math.max(0, newDownvotes - 1);
        }

        message = 'Vote removed';
        userVote = null;
      } else {
        // Different vote - update it (use ON DUPLICATE KEY to handle race condition)
        await connection.execute(
          `INSERT INTO profile_post_votes (post_id, user_id, vote_type) 
           VALUES (?, ?, ?) 
           ON DUPLICATE KEY UPDATE vote_type = VALUES(vote_type)`,
          [numericId, userId, type]
        );

        if (type === 'upvote') {
          newUpvotes += 1;
          newDownvotes = Math.max(0, newDownvotes - 1);
        } else {
          newDownvotes += 1;
          newUpvotes = Math.max(0, newUpvotes - 1);
        }

        message = 'Vote changed';
        userVote = type;
      }
    } else {
      // New vote - use INSERT ON DUPLICATE KEY to handle race condition
      const [result] = await connection.execute(
        `INSERT INTO profile_post_votes (post_id, user_id, vote_type) 
         VALUES (?, ?, ?) 
         ON DUPLICATE KEY UPDATE vote_type = VALUES(vote_type)`,
        [numericId, userId, type]
      );

      // affectedRows = 1 means new insert, 2 means update happened (race condition handled)
      if (result.affectedRows === 2) {
        // A vote already existed (race condition) - re-fetch to get accurate counts
        const [currentVotes] = await connection.execute(
          'SELECT vote_type FROM profile_post_votes WHERE post_id = ? AND user_id = ?',
          [numericId, userId]
        );
        userVote = currentVotes.length > 0 ? currentVotes[0].vote_type : null;
        message = 'Vote updated';
      } else {
        if (type === 'upvote') {
          newUpvotes += 1;
        } else {
          newDownvotes += 1;
        }
        message = 'Vote recorded';
        userVote = type;
      }
    }

    // Update post vote counts
    await connection.execute(
      'UPDATE profile_posts SET upvotes = ?, downvotes = ? WHERE id = ?',
      [newUpvotes, newDownvotes, numericId]
    );

    res.json({
      success: true,
      message,
      upvotes: newUpvotes,
      downvotes: newDownvotes,
      userVote,
    });
  } catch (err) {
    console.error('Error voting on profile post:', err.message);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to vote on post',
    });
  }
}

/**
 * Get user's vote on a specific post
 * GET /api/profile/posts/:id/vote
 * SECURITY: Validates ID parameter
 */
async function getUserVote(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // SECURITY: Validate ID is a positive integer
    if (!isValidId(id)) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Invalid post ID',
      });
    }

    const numericId = parseInt(id, 10);
    const connection = await connectToDatabase();

    const [votes] = await connection.execute(
      'SELECT vote_type FROM profile_post_votes WHERE post_id = ? AND user_id = ?',
      [numericId, userId]
    );

    res.json({
      success: true,
      userVote: votes.length > 0 ? votes[0].vote_type : null,
    });
  } catch (err) {
    console.error('Error fetching user vote:', err.message);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch vote',
    });
  }
}

/**
 * Update a profile post (only owner can edit)
 * PUT /api/profile/posts/:id
 * SECURITY: Validates ID and ownership
 */
async function updatePost(req, res) {
  try {
    const { id } = req.params;
    const { place_name, state, content, rating, images } = req.body;
    const userId = req.user.id;

    // SECURITY: Validate ID is a positive integer
    if (!isValidId(id)) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Invalid post ID',
      });
    }

    // Validate required fields
    const errors = [];

    if (!isValidString(place_name)) {
      errors.push('place_name is required and must be a non-empty string');
    }

    if (!isValidString(state)) {
      errors.push('state is required and must be a non-empty string');
    }

    if (!isValidString(content)) {
      errors.push('content is required and must be a non-empty string');
    }

    if (!isValidRating(rating)) {
      errors.push('rating is required and must be between 1 and 5');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        messages: errors,
      });
    }

    const numericId = parseInt(id, 10);
    const connection = await connectToDatabase();

    // Check if post exists
    const [posts] = await connection.execute(
      'SELECT id, user_id FROM profile_posts WHERE id = ?',
      [numericId]
    );

    if (posts.length === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Post not found',
      });
    }

    // Check ownership (use === with String conversion for type safety)
    if (String(posts[0].user_id) !== String(userId)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You are not authorized to edit this post',
      });
    }

    // SECURITY: Sanitize ALL inputs to prevent Stored XSS
    const sanitizedPlaceName = sanitizeText(place_name, 255);
    const sanitizedState = sanitizeText(state, 100);
    // SECURITY: sanitizeUserInput strips all HTML tags to prevent XSS
    const sanitizedContent = sanitizeUserInput(content, 10000);

    // SECURITY: Validate and sanitize image URLs
    let sanitizedImages = null;
    if (images && Array.isArray(images)) {
      sanitizedImages = images
        .map(url => sanitizeUrl(url))
        .filter(url => url !== null);
    }

    // Update the post
    await connection.execute(
      `UPDATE profile_posts 
       SET place_name = ?, state = ?, content = ?, rating = ?, images = ?
       WHERE id = ?`,
      [
        sanitizedPlaceName,
        sanitizedState,
        sanitizedContent,
        parseInt(rating, 10),
        sanitizedImages ? JSON.stringify(sanitizedImages) : null,
        numericId,
      ]
    );

    // Fetch the updated post with user info
    const [updatedPosts] = await connection.execute(
      `SELECT 
        pp.*,
        u.name as user_name,
        u.email as user_email,
        u.avatar as user_avatar
      FROM profile_posts pp
      JOIN users u ON pp.user_id = u.id
      WHERE pp.id = ?`,
      [numericId]
    );

    const post = {
      ...updatedPosts[0],
      images: safeParseImages(updatedPosts[0].images),
    };

    res.json({
      success: true,
      message: 'Post updated successfully',
      post,
    });
  } catch (err) {
    // SECURITY: Don't expose internal error details
    console.error('Error updating profile post:', err.message);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update post',
    });
  }
}

/**
 * Delete a profile post (only owner can delete)
 * DELETE /api/profile/posts/:id
 * SECURITY: Validates ID and ownership
 */
async function deletePost(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // SECURITY: Validate ID is a positive integer
    if (!isValidId(id)) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Invalid post ID',
      });
    }

    const numericId = parseInt(id, 10);
    const connection = await connectToDatabase();

    // Check if post exists and belongs to user
    const [posts] = await connection.execute(
      'SELECT id, user_id FROM profile_posts WHERE id = ?',
      [numericId]
    );

    if (posts.length === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Post not found',
      });
    }

    // Check ownership (use String() to handle type mismatch)
    if (String(posts[0].user_id) !== String(userId)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You are not authorized to delete this post',
      });
    }

    await connection.execute('DELETE FROM profile_posts WHERE id = ?', [numericId]);

    res.json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (err) {
    console.error('Error deleting profile post:', err.message);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete post',
    });
  }
}

/**
 * Get post status counts (for debugging approval workflow)
 * GET /api/profile/posts/status-check
 * PUBLIC: Returns counts of posts by status (no sensitive data)
 * 
 * IMPORTANT: Use this endpoint to verify both admin dashboard and main website
 * are connected to the same database. Compare the 'database' field and counts.
 */
async function getPostStatusCounts(req, res) {
  try {
    const connection = await connectToDatabase();

    // Get counts by status
    const [statusCounts] = await connection.execute(`
      SELECT 
        COALESCE(status, 'null') as status,
        COUNT(*) as count
      FROM profile_posts
      GROUP BY status
    `);

    // Get total count
    const [totalCount] = await connection.execute(`
      SELECT COUNT(*) as total FROM profile_posts
    `);

    // Get database name to verify connection
    const [dbInfo] = await connection.execute('SELECT DATABASE() as db_name');

    // Get recent posts for debugging (limited info, no sensitive data)
    const [recentPosts] = await connection.execute(`
      SELECT id, place_name, state, status, created_at
      FROM profile_posts
      ORDER BY created_at DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      source: 'main-website',
      database: dbInfo[0].db_name,
      totalPosts: totalCount[0].total,
      statusCounts: statusCounts,
      recentPosts: recentPosts,
      instructions: {
        step1: 'Compare this database name with admin dashboard',
        step2: 'If databases differ, update Vercel environment variables to match',
        step3: 'Both should use same DB_DATABASE/DB_NAME value',
        adminEndpoint: '/api/debug/posts-status (admin dashboard)',
        mainEndpoint: '/api/profile/posts/status-check (this endpoint)'
      },
      message: 'If approved count is 0 or database names differ, the systems are not synced'
    });
  } catch (err) {
    console.error('Error getting post status counts:', err.message);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
}

module.exports = {
  createPost,
  getAllPosts,
  getMyPosts,
  getPostById,
  updatePost,
  voteOnPost,
  getUserVote,
  deletePost,
  getPostStatusCounts,
};

