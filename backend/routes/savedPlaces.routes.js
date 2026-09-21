const express = require('express');
const router = express.Router();
const { authRequired } = require('../middleware/auth.middleware');
const {
  getSavedPlaces,
  addSavedPlace,
  removeSavedPlace,
  clearSavedPlaces,
  checkSavedPlace,
} = require('../controllers/savedPlaces.controller');

// All routes require authentication
router.use(authRequired);

// GET /api/saved-places/check/:placeId - Check if place is saved (MUST be before /:placeId)
router.get('/check/:placeId', checkSavedPlace);

// GET /api/saved-places - Get all saved places
router.get('/', getSavedPlaces);

// POST /api/saved-places - Add a place to saved
router.post('/', addSavedPlace);

// DELETE /api/saved-places - Clear all saved places
router.delete('/', clearSavedPlaces);

// DELETE /api/saved-places/:placeId - Remove a specific place
router.delete('/:placeId', removeSavedPlace);

module.exports = router;
