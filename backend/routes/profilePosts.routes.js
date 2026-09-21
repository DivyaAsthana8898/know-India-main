const express = require('express');
const { authRequired } = require('../middleware/auth.middleware');
const {
  createPost,
  getAllPosts,
  getMyPosts,
  getPostById,
  updatePost,
  voteOnPost,
  getUserVote,
  deletePost,
  getPostStatusCounts,
} = require('../controllers/profilePosts.controller');

const router = express.Router();

/**
 * @route   GET /api/profile/posts/status-check
 * @desc    Get post status counts for debugging
 * @access  Public (no sensitive data exposed)
 */
router.get('/status-check', getPostStatusCounts);

/**
 * @route   GET /api/profile/posts/me
 * @desc    Get current user's posts (including pending)
 * @access  Protected (JWT required)
 * NOTE: This route MUST be defined before /:id to avoid matching 'me' as an ID
 */
router.get('/me', authRequired, getMyPosts);

/**
 * @route   GET /api/profile/posts
 * @desc    Get all profile posts (public - only approved)
 * @access  Public
 */
router.get('/', getAllPosts);

/**
 * @route   GET /api/profile/posts/:id
 * @desc    Get a single profile post by ID (public)
 * @access  Public
 */
router.get('/:id', getPostById);

/**
 * @route   POST /api/profile/posts
 * @desc    Create a new profile post
 * @access  Protected (JWT required)
 */
router.post('/', authRequired, createPost);

/**
 * @route   PUT /api/profile/posts/:id
 * @desc    Update a profile post (owner only)
 * @access  Protected (JWT required)
 * @body    { place_name, state, content, rating, images? }
 */
router.put('/:id', authRequired, updatePost);

/**
 * @route   POST /api/profile/posts/:id/vote
 * @desc    Vote on a profile post (upvote/downvote)
 * @access  Protected (JWT required)
 * @body    { type: "upvote" | "downvote" }
 */
router.post('/:id/vote', authRequired, voteOnPost);

/**
 * @route   GET /api/profile/posts/:id/vote
 * @desc    Get user's vote on a specific post
 * @access  Protected (JWT required)
 */
router.get('/:id/vote', authRequired, getUserVote);

/**
 * @route   DELETE /api/profile/posts/:id
 * @desc    Delete a profile post (owner only)
 * @access  Protected (JWT required)
 */
router.delete('/:id', authRequired, deletePost);

module.exports = router;

