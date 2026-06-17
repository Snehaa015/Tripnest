const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');
const authRoutes = require('./routes/authRoutes');
const itineraryRoutes = require('./routes/itineraryRoutes');

// Connect to MongoDB
connectDB();

const app = express();

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false // Allows files or images to be requested across domains if needed
}));

// CORS Configuration
app.use(cors({
  origin: '*', // For ease of development, but can be restricted in production
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per 15 mins
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests from this IP. Please try again after 15 minutes.' }
});
app.use('/api/', apiLimiter);

// Mount Routes
app.use('/api/auth', authRoutes);

// For /api/upload, /api/itinerary, and public /api/share paths
// We will mount itineraryRoutes at /api/itinerary, and define sub-mounts or mount it at /api directly
// Let's mount itineraryRoutes at /api. In itineraryRoutes, paths are:
// - GET /api/share/:shareId
// - POST /api/upload -> actually we want POST /api/upload. If we mount at /api, then it becomes /api/upload!
// - POST /api/itinerary/generate -> wait! The route inside itineraryRoutes is /generate. If mounted at /api/itinerary, it becomes /api/itinerary/generate.
// Let's verify:
// Inside itineraryRoutes:
// - GET /share/:shareId -> mapped to GET /api/share/:shareId if mounted at /api
// - POST /upload -> mapped to POST /api/upload if mounted at /api
// - POST /generate -> mapped to POST /api/itinerary/generate? No, if mounted at /api, it would be /api/generate.
// To make it map exactly to the requested paths:
// We can mount at /api/itinerary, but upload and share are at root /api.
// Let's write standard mounting in server.js:
// Mount itineraryRoutes at /api, and adjust itinerary routes accordingly or mount them individually in server.js!
// Yes, let's check:
// In itineraryRoutes.js:
// - router.get('/share/:shareId', getPublicItinerary);
// - router.post('/upload', upload.single('document'), uploadDocument);
// - router.post('/itinerary/generate', validateItineraryGenerate, generateItinerary);
// - router.get('/itinerary', getItineraries);
// - router.get('/itinerary/:id', getItineraryById);
// - router.delete('/itinerary/:id', deleteItinerary);
// - router.post('/itinerary/:id/share', shareItinerary);
// This is perfect! Let's modify itineraryRoutes.js first to ensure it matches these paths exactly. Let's write the server.js to mount it at /api.
app.use('/api', itineraryRoutes);

// Test Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'TripNest API is running and healthy.' });
});

// Serve static assets in production if needed (empty uploads directory check)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Global Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

module.exports = app;
