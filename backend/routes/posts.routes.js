const express = require('express');
const { connectToDatabase } = require('../utils/db');
const { verifyToken } = require('../utils/jwt');

const router = express.Router();

/**
 * Middleware to verify JWT token
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  
  req.user = decoded;
  next();
}

/**
 * GET /api/posts - Fetch all travel posts
 * Public endpoint
 */
router.get('/', async (req, res) => {
  try {
    const connection = await connectToDatabase();
    
    const [posts] = await connection.execute(`
      SELECT 
        tp.*,
        u.name as user_name,
        u.email as user_email,
        u.avatar as user_avatar
      FROM travel_posts tp
      JOIN users u ON tp.user_id = u.id
      ORDER BY tp.created_at DESC
    `);
    
    // Parse images JSON for each post
    const formattedPosts = posts.map(post => ({
      ...post,
      images: post.images ? JSON.parse(post.images) : [],
    }));
    
    res.json({ posts: formattedPosts });
  } catch (err) {
    console.error('Error fetching posts:', err.message);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

/**
 * GET /api/posts/:id - Fetch single post
 * Public endpoint
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await connectToDatabase();
    
    const [posts] = await connection.execute(`
      SELECT 
        tp.*,
        u.name as user_name,
        u.email as user_email,
        u.avatar as user_avatar
      FROM travel_posts tp
      JOIN users u ON tp.user_id = u.id
      WHERE tp.id = ?
    `, [id]);
    
    if (posts.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const post = {
      ...posts[0],
      images: posts[0].images ? JSON.parse(posts[0].images) : [],
    };
    
    res.json({ post });
  } catch (err) {
    console.error('Error fetching post:', err.message);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

/**
 * POST /api/posts - Create a new travel post
 * Protected endpoint - requires authentication
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { content, rating, images } = req.body;
    const userId = req.user.id;
    
    // Validate required fields
    if (!content || !rating) {
      return res.status(400).json({ error: 'Content and rating are required' });
    }
    
    // Validate rating range
    const ratingNum = parseInt(rating, 10);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    
    const connection = await connectToDatabase();
    
    // Insert the post
    const [result] = await connection.execute(
      `INSERT INTO travel_posts (user_id, content, rating, images) VALUES (?, ?, ?, ?)`,
      [userId, content, ratingNum, images ? JSON.stringify(images) : null]
    );
    
    // Fetch the created post with user info
    const [newPosts] = await connection.execute(`
      SELECT 
        tp.*,
        u.name as user_name,
        u.email as user_email,
        u.avatar as user_avatar
      FROM travel_posts tp
      JOIN users u ON tp.user_id = u.id
      WHERE tp.id = ?
    `, [result.insertId]);
    
    const post = {
      ...newPosts[0],
      images: newPosts[0].images ? JSON.parse(newPosts[0].images) : [],
    };
    
    res.status(201).json({ 
      message: 'Post created successfully',
      post 
    });
  } catch (err) {
    console.error('Error creating post:', err.message);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

/**
 * POST /api/posts/:id/vote - Upvote or downvote a post
 * Protected endpoint - requires authentication
 */
router.post('/:id/vote', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { voteType } = req.body; // 'upvote' or 'downvote'
    const userId = req.user.id;
    
    if (!voteType || !['upvote', 'downvote'].includes(voteType)) {
      return res.status(400).json({ error: 'Invalid vote type' });
    }
    
    const connection = await connectToDatabase();
    
    // Check if post exists
    const [posts] = await connection.execute(
      'SELECT id, upvotes, downvotes FROM travel_posts WHERE id = ?',
      [id]
    );
    
    if (posts.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Check if user already voted
    const [existingVotes] = await connection.execute(
      'SELECT id, vote_type FROM post_votes WHERE post_id = ? AND user_id = ?',
      [id, userId]
    );
    
    let message = '';
    let newUpvotes = posts[0].upvotes;
    let newDownvotes = posts[0].downvotes;
    
    if (existingVotes.length > 0) {
      const existingVote = existingVotes[0];
      
      if (existingVote.vote_type === voteType) {
        // Same vote - remove it (toggle off)
        await connection.execute(
          'DELETE FROM post_votes WHERE id = ?',
          [existingVote.id]
        );
        
        if (voteType === 'upvote') {
          newUpvotes = Math.max(0, newUpvotes - 1);
        } else {
          newDownvotes = Math.max(0, newDownvotes - 1);
        }
        
        message = 'Vote removed';
      } else {
        // Different vote - update it
        await connection.execute(
          'UPDATE post_votes SET vote_type = ? WHERE id = ?',
          [voteType, existingVote.id]
        );
        
        if (voteType === 'upvote') {
          newUpvotes += 1;
          newDownvotes = Math.max(0, newDownvotes - 1);
        } else {
          newDownvotes += 1;
          newUpvotes = Math.max(0, newUpvotes - 1);
        }
        
        message = 'Vote changed';
      }
    } else {
      // New vote
      await connection.execute(
        'INSERT INTO post_votes (post_id, user_id, vote_type) VALUES (?, ?, ?)',
        [id, userId, voteType]
      );
      
      if (voteType === 'upvote') {
        newUpvotes += 1;
      } else {
        newDownvotes += 1;
      }
      
      message = 'Vote recorded';
    }
    
    // Update post vote counts
    await connection.execute(
      'UPDATE travel_posts SET upvotes = ?, downvotes = ? WHERE id = ?',
      [newUpvotes, newDownvotes, id]
    );
    
    res.json({ 
      message,
      upvotes: newUpvotes,
      downvotes: newDownvotes 
    });
  } catch (err) {
    console.error('Error voting on post:', err.message);
    res.status(500).json({ error: 'Failed to vote on post' });
  }
});

/**
 * GET /api/posts/:id/vote - Get user's vote on a post
 * Protected endpoint - requires authentication
 */
router.get('/:id/vote', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const connection = await connectToDatabase();
    
    const [votes] = await connection.execute(
      'SELECT vote_type FROM post_votes WHERE post_id = ? AND user_id = ?',
      [id, userId]
    );
    
    res.json({ 
      userVote: votes.length > 0 ? votes[0].vote_type : null 
    });
  } catch (err) {
    console.error('Error fetching vote:', err.message);
    res.status(500).json({ error: 'Failed to fetch vote' });
  }
});

/**
 * DELETE /api/posts/:id - Delete a post
 * Protected endpoint - only post owner can delete
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const connection = await connectToDatabase();
    
    // Check if post exists and belongs to user
    const [posts] = await connection.execute(
      'SELECT id, user_id FROM travel_posts WHERE id = ?',
      [id]
    );
    
    if (posts.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    if (posts[0].user_id !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }
    
    await connection.execute('DELETE FROM travel_posts WHERE id = ?', [id]);
    
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error('Error deleting post:', err.message);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

module.exports = router;

