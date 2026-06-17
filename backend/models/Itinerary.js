const mongoose = require('mongoose');

const itinerarySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  uploadedFile: {
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true }
  },
  extractedData: {
    flightNumber: { type: String, default: '' },
    airline: { type: String, default: '' },
    departureCity: { type: String, default: '' },
    arrivalCity: { type: String, default: '' },
    departureDate: { type: String, default: '' },
    arrivalDate: { type: String, default: '' },
    hotelName: { type: String, default: '' },
    hotelAddress: { type: String, default: '' },
    checkInDate: { type: String, default: '' },
    checkOutDate: { type: String, default: '' },
    destination: { type: String, required: true },
    bookingReference: { type: String, default: '' },
    passengerNames: { type: String, default: '' },
    operator: { type: String, default: '' },
    ticketNumber: { type: String, default: '' },
    trainNumber: { type: String, default: '' },
    busNumber: { type: String, default: '' },
    trainName: { type: String, default: '' },
    departureStation: { type: String, default: '' },
    arrivalStation: { type: String, default: '' },
    departureTime: { type: String, default: '' },
    arrivalTime: { type: String, default: '' },
    seatInfo: { type: String, default: '' },
    coachClass: { type: String, default: '' },
    fareAmount: { type: String, default: '' },
    bookingDate: { type: String, default: '' },
    journeyDuration: { type: String, default: '' }
  },
  generatedItinerary: {
    tripSummary: { type: String, required: true },
    dayWisePlan: [{
      dayNumber: { type: Number, required: true },
      title: { type: String, required: true },
      activities: [{
        time: { type: String, default: '' },
        activity: { type: String, required: true },
        description: { type: String, default: '' },
        cost: { type: String, default: '' }
      }]
    }],
    flightInformation: {
      flightNumber: { type: String, default: '' },
      airline: { type: String, default: '' },
      departure: { type: String, default: '' },
      arrival: { type: String, default: '' },
      time: { type: String, default: '' }
    },
    trainInformation: {
      trainNumber: { type: String, default: '' },
      trainName: { type: String, default: '' },
      operator: { type: String, default: '' },
      departureStation: { type: String, default: '' },
      arrivalStation: { type: String, default: '' },
      departureTime: { type: String, default: '' },
      arrivalTime: { type: String, default: '' },
      seatInfo: { type: String, default: '' },
      coachClass: { type: String, default: '' }
    },
    busInformation: {
      busNumber: { type: String, default: '' },
      operator: { type: String, default: '' },
      departureStation: { type: String, default: '' },
      arrivalStation: { type: String, default: '' },
      departureTime: { type: String, default: '' },
      arrivalTime: { type: String, default: '' },
      seatInfo: { type: String, default: '' }
    },
    hotelInformation: {
      name: { type: String, default: '' },
      address: { type: String, default: '' },
      checkIn: { type: String, default: '' },
      checkOut: { type: String, default: '' }
    },
    attractions: [{ type: String }],
    foodRecommendations: [{ type: String }],
    travelTips: [{ type: String }],
    packingSuggestions: [{ type: String }]
  },
  destinationImage: {
    type: String,
    required: true
  },
  shareId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  duration: {
    days: { type: Number, required: true },
    nights: { type: Number, required: true }
  },
  translations: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

module.exports = mongoose.model('Itinerary', itinerarySchema);
