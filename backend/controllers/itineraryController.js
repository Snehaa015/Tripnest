const Itinerary = require('../models/Itinerary');
const geminiService = require('../services/geminiService');
const { getDestinationImage } = require('../utils/imageHelper');
const { v4: uuidv4 } = require('uuid');

const parseDate = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
};

// Calculate duration based on travel dates
const calculateDuration = (extractedData) => {
  let start = parseDate(extractedData.checkInDate);
  let end = parseDate(extractedData.checkOutDate);

  if (!start || !end) {
    start = parseDate(extractedData.departureDate);
    end = parseDate(extractedData.arrivalDate);
  }

  if (!start || !end || end <= start) {
    return { days: 3, nights: 2 }; // default 3 days, 2 nights
  }

  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return {
    days: diffDays + 1,
    nights: diffDays
  };
};

/**
 * Generate travel itinerary based on confirmed/edited OCR fields
 */
const generateItinerary = async (req, res, next) => {
  try {
    const { extractedData, tempFile } = req.body;

    if (!extractedData || !extractedData.destination) {
      return res.status(400).json({ success: false, message: 'Destination is required for itinerary generation' });
    }

    const userId = req.user._id;
    const duration = calculateDuration(extractedData);

    console.log(`Generating itinerary for destination: ${extractedData.destination} (Duration: ${duration.days} Days, ${duration.nights} Nights)`);

    // 1. Generate itinerary using Gemini service
    const generatedItinerary = await geminiService.generateItinerary(extractedData, duration);

    // 2. Fetch destination image
    const destinationImage = await getDestinationImage(extractedData.destination);

    // 3. Create database entry
    const shareId = uuidv4();
    const itinerary = await Itinerary.create({
      userId,
      uploadedFile: tempFile,
      extractedData,
      generatedItinerary,
      destinationImage,
      shareId,
      isPublic: false,
      duration
    });

    res.status(201).json({
      success: true,
      message: 'Itinerary generated and saved successfully',
      data: itinerary
    });
  } catch (error) {
    console.error('Itinerary generation controller error:', error.message);
    next(error);
  }
};

/**
 * Get all itineraries for the logged-in user (with search filter)
 */
const getItineraries = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { search } = req.query;

    let query = { userId };

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search, 'i');
      query['$or'] = [
        { 'extractedData.destination': searchRegex },
        { 'extractedData.hotelName': searchRegex },
        { 'extractedData.airline': searchRegex },
        { 'extractedData.operator': searchRegex },
        { 'extractedData.trainName': searchRegex },
        { 'extractedData.departureStation': searchRegex },
        { 'extractedData.arrivalStation': searchRegex }
      ];
    }

    const itineraries = await Itinerary.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: itineraries.length,
      data: itineraries
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get specific itinerary by ID (requires ownership)
 */
const getItineraryById = async (req, res, next) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id);

    if (!itinerary) {
      return res.status(404).json({ success: false, message: 'Itinerary not found' });
    }

    // Protect ownership
    if (itinerary.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this itinerary' });
    }

    const { lang } = req.query;
    if (lang && lang !== 'en') {
      let translated = itinerary.translations ? itinerary.translations.get(lang) : null;
      if (!translated) {
        translated = await geminiService.translateItinerary(
          itinerary.generatedItinerary,
          lang
        );
        if (!itinerary.translations) {
          itinerary.translations = {};
        }
        itinerary.translations.set(lang, translated);
        itinerary.markModified('translations');
        await itinerary.save();
      }
      const plainItinerary = itinerary.toObject();
      plainItinerary.generatedItinerary = translated;
      return res.status(200).json({
        success: true,
        data: plainItinerary
      });
    }

    res.status(200).json({
      success: true,
      data: itinerary
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete itinerary by ID (requires ownership)
 */
const deleteItinerary = async (req, res, next) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id);

    if (!itinerary) {
      return res.status(404).json({ success: false, message: 'Itinerary not found' });
    }

    // Protect ownership
    if (itinerary.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this itinerary' });
    }

    await Itinerary.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Itinerary deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get public itinerary by Share ID (No auth required)
 */
const getPublicItinerary = async (req, res, next) => {
  try {
    const { shareId } = req.params;
    const { lang } = req.query;
    
    // Find itinerary, and ensure it's marked public or just let public links open.
    // The requirement states: "When a user shares an itinerary: Generate unique UUID shareId, Create public share page"
    // And: "Invalid links must show 'Itinerary not found' instead of application errors"
    const itinerary = await Itinerary.findOne({ shareId });

    if (!itinerary || !itinerary.isPublic) {
      return res.status(404).json({ success: false, message: 'Itinerary not found' });
    }

    if (lang && lang !== 'en') {
      let translated = itinerary.translations ? itinerary.translations.get(lang) : null;
      if (!translated) {
        translated = await geminiService.translateItinerary(
          itinerary.generatedItinerary,
          lang
        );
        if (!itinerary.translations) {
          itinerary.translations = {};
        }
        itinerary.translations.set(lang, translated);
        itinerary.markModified('translations');
        await itinerary.save();
      }
      const plainItinerary = itinerary.toObject();
      plainItinerary.generatedItinerary = translated;
      return res.status(200).json({
        success: true,
        data: plainItinerary
      });
    }

    res.status(200).json({
      success: true,
      data: itinerary
    });
  } catch (error) {
    // Return a clean 404 rather than app error details
    res.status(404).json({ success: false, message: 'Itinerary not found' });
  }
};

/**
 * Toggle sharing setting for itinerary (requires ownership)
 */
const shareItinerary = async (req, res, next) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id);

    if (!itinerary) {
      return res.status(404).json({ success: false, message: 'Itinerary not found' });
    }

    if (itinerary.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to configure sharing for this itinerary' });
    }

    itinerary.isPublic = !itinerary.isPublic;
    await itinerary.save();

    res.status(200).json({
      success: true,
      message: itinerary.isPublic ? 'Itinerary shared successfully' : 'Itinerary private state restored',
      data: {
        isPublic: itinerary.isPublic,
        shareId: itinerary.shareId
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateItinerary,
  getItineraries,
  getItineraryById,
  deleteItinerary,
  getPublicItinerary,
  shareItinerary
};
