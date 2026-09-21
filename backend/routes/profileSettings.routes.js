const express = require('express');
const { authRequired } = require('../middleware/auth.middleware');
const {
  getProfile,
  updateProfile,
} = require('../controllers/profileSettings.controller');

const router = express.Router();

// GET /api/profile/settings - Get current user profile
router.get('/', authRequired, getProfile);

// PUT /api/profile/settings - Update user profile (name only)
router.put('/', authRequired, updateProfile);

module.exports = router;
