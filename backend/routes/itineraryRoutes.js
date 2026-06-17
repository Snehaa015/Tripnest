const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { uploadDocument } = require('../controllers/uploadController');
const {
  generateItinerary,
  getItineraries,
  getItineraryById,
  deleteItinerary,
  getPublicItinerary,
  shareItinerary
} = require('../controllers/itineraryController');
const { validateItineraryGenerate } = require('../validators/itineraryValidator');

// Public route for shared itineraries
// GET /api/share/:shareId
router.get('/share/:shareId', getPublicItinerary);

// Protected routes below
router.use(protect);

// POST /api/upload
// Handle single document upload and text parsing
router.post('/upload', upload.single('document'), uploadDocument);

// POST /api/itinerary/generate
// Accept editable OCR data and produce full itinerary
router.post('/itinerary/generate', validateItineraryGenerate, generateItinerary);

// GET /api/itinerary
// Fetch history of current user's generated plans
router.get('/itinerary', getItineraries);

// GET /api/itinerary/:id
// Details of a single itinerary
router.get('/itinerary/:id', getItineraryById);

// DELETE /api/itinerary/:id
// Remove an itinerary
router.delete('/itinerary/:id', deleteItinerary);

// POST /api/itinerary/:id/share
// Toggle itinerary isPublic state
router.post('/itinerary/:id/share', shareItinerary);

module.exports = router;
