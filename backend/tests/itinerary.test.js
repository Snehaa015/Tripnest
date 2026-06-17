process.env.MONGO_URI = 'mongodb://127.0.0.1:27017/tripnest_test';
process.env.NODE_ENV = 'test';

// Mock Gemini Service to prevent external API requests during tests
jest.mock('../services/geminiService', () => ({
  parseExtractedData: jest.fn().mockResolvedValue({
    flightNumber: 'BA123',
    airline: 'British Airways',
    departureCity: 'New York',
    arrivalCity: 'London',
    departureDate: '2026-07-01',
    arrivalDate: '2026-07-01',
    hotelName: 'The Royal Savoy',
    hotelAddress: 'London',
    checkInDate: '2026-07-01',
    checkOutDate: '2026-07-07',
    destination: 'London',
    bookingReference: 'PNR123'
  }),
  generateItinerary: jest.fn().mockResolvedValue({
    tripSummary: 'Mocked beautiful Trip to London',
    dayWisePlan: [
      {
        dayNumber: 1,
        title: 'Arrival and City Walk',
        activities: [
          { time: '09:00 AM', activity: 'Hotel Check-in', description: 'Drop bags', cost: 'Free' }
        ]
      }
    ],
    flightInformation: {
      flightNumber: 'BA123',
      airline: 'British Airways',
      departure: 'New York',
      arrival: 'London',
      time: '08:00 AM'
    },
    hotelInformation: {
      name: 'The Royal Savoy',
      address: 'London',
      checkIn: '2026-07-01',
      checkOut: '2026-07-07'
    },
    attractions: ['Big Ben', 'London Eye'],
    foodRecommendations: ['Fish and Chips'],
    travelTips: ['Use Oyster card'],
    packingSuggestions: ['Umbrella']
  })
}));

// Mock Image Helper to make tests network independent
jest.mock('../utils/imageHelper', () => ({
  getDestinationImage: jest.fn().mockResolvedValue('https://images.unsplash.com/mock-image-url.jpg')
}));

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');
const Itinerary = require('../models/Itinerary');

describe('Itinerary API Tests', () => {
  let user1, user2;
  let token1, token2;
  let testItineraryId;
  let shareId;

  beforeAll(async () => {
    await User.deleteMany({});
    await Itinerary.deleteMany({});

    // Register User 1
    const res1 = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'User One',
        email: 'user1@example.com',
        password: 'password123'
      });
    user1 = res1.body.data;
    token1 = res1.body.data.token;

    // Register User 2
    const res2 = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'User Two',
        email: 'user2@example.com',
        password: 'password123'
      });
    user2 = res2.body.data;
    token2 = res2.body.data.token;
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Itinerary.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/itinerary/generate', () => {
    it('should block requests without authentication', async () => {
      const res = await request(app)
        .post('/api/itinerary/generate')
        .send({
          extractedData: { destination: 'London' }
        });

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('success', false);
    });

    it('should generate and save an itinerary successfully', async () => {
      const payload = {
        extractedData: {
          destination: 'London',
          checkInDate: '2026-07-01',
          checkOutDate: '2026-07-05',
          hotelName: 'The London Inn'
        },
        tempFile: {
          filename: 'mock.pdf',
          originalName: 'mock.pdf',
          mimeType: 'application/pdf',
          size: 1000
        }
      };

      const res = await request(app)
        .post('/api/itinerary/generate')
        .set('Authorization', `Bearer ${token1}`)
        .send(payload);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data.extractedData.destination).toEqual('London');
      expect(res.body.data.userId.toString()).toEqual(user1._id.toString());
      expect(res.body.data.destinationImage).toEqual('https://images.unsplash.com/mock-image-url.jpg');

      testItineraryId = res.body.data._id;
      shareId = res.body.data.shareId;
    });

    it('should generate and save a train itinerary successfully', async () => {
      const payload = {
        extractedData: {
          destination: 'Pune',
          trainNumber: '12002',
          trainName: 'Shatabdi Express',
          operator: 'IRCTC',
          departureStation: 'Mumbai CSMT',
          arrivalStation: 'Pune Junction',
          departureTime: '06:00 AM',
          arrivalTime: '09:15 AM',
          seatInfo: 'Coach C1, Seat 35',
          coachClass: 'AC Chair Car',
          passengerNames: 'Alice, Bob',
          fareAmount: 'Rs. 650',
          bookingDate: '2026-06-01',
          journeyDuration: '3h 15m',
          bookingReference: 'TRN98765'
        },
        tempFile: {
          filename: 'train_mock.pdf',
          originalName: 'train_mock.pdf',
          mimeType: 'application/pdf',
          size: 1500
        }
      };

      const res = await request(app)
        .post('/api/itinerary/generate')
        .set('Authorization', `Bearer ${token1}`)
        .send(payload);

      expect(res.statusCode).toEqual(201);
      expect(res.body.data.extractedData.destination).toEqual('Pune');
      expect(res.body.data.extractedData.trainName).toEqual('Shatabdi Express');
      expect(res.body.data.extractedData.departureStation).toEqual('Mumbai CSMT');
      expect(res.body.data.extractedData.passengerNames).toEqual('Alice, Bob');
    });

    it('should generate and save a bus itinerary successfully', async () => {
      const payload = {
        extractedData: {
          destination: 'Pune',
          busNumber: 'MH-12-PQ-9999',
          operator: 'Neeta Travels',
          departureStation: 'Dadar East',
          arrivalStation: 'Swargate Pune',
          departureTime: '07:30 AM',
          arrivalTime: '11:30 AM',
          seatInfo: 'Seat 12',
          fareAmount: 'Rs. 450',
          bookingDate: '2026-06-05',
          journeyDuration: '4h 00m',
          bookingReference: 'BUS4567'
        },
        tempFile: {
          filename: 'bus_mock.pdf',
          originalName: 'bus_mock.pdf',
          mimeType: 'application/pdf',
          size: 1200
        }
      };

      const res = await request(app)
        .post('/api/itinerary/generate')
        .set('Authorization', `Bearer ${token1}`)
        .send(payload);

      expect(res.statusCode).toEqual(201);
      expect(res.body.data.extractedData.destination).toEqual('Pune');
      expect(res.body.data.extractedData.operator).toEqual('Neeta Travels');
      expect(res.body.data.extractedData.busNumber).toEqual('MH-12-PQ-9999');
    });

    it('should reject generation when destination is missing', async () => {
      const payload = {
        extractedData: {
          checkInDate: '2026-07-01',
          checkOutDate: '2026-07-05'
        }
      };

      const res = await request(app)
        .post('/api/itinerary/generate')
        .set('Authorization', `Bearer ${token1}`)
        .send(payload);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/itinerary', () => {
    it('should fetch the list of itineraries for current user only', async () => {
      // Fetch for user 1 (should contain 1 itinerary)
      const res1 = await request(app)
        .get('/api/itinerary')
        .set('Authorization', `Bearer ${token1}`);

      expect(res1.statusCode).toEqual(200);
      expect(res1.body).toHaveProperty('success', true);
      expect(res1.body.data.length).toBe(3);

      // Fetch for user 2 (should contain 0 itineraries)
      const res2 = await request(app)
        .get('/api/itinerary')
        .set('Authorization', `Bearer ${token2}`);

      expect(res2.statusCode).toEqual(200);
      expect(res2.body.data.length).toBe(0);
    });

    it('should filter itineraries by search query', async () => {
      const resMatched = await request(app)
        .get('/api/itinerary?search=lond')
        .set('Authorization', `Bearer ${token1}`);

      expect(resMatched.body.data.length).toBe(1);

      const resUnmatched = await request(app)
        .get('/api/itinerary?search=paris')
        .set('Authorization', `Bearer ${token1}`);

      expect(resUnmatched.body.data.length).toBe(0);
    });
  });

  describe('GET /api/itinerary/:id', () => {
    it('should retrieve a specific itinerary for the owner', async () => {
      const res = await request(app)
        .get(`/api/itinerary/${testItineraryId}`)
        .set('Authorization', `Bearer ${token1}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.extractedData.destination).toEqual('London');
    });

    it('should block non-owners from retrieving the itinerary', async () => {
      const res = await request(app)
        .get(`/api/itinerary/${testItineraryId}`)
        .set('Authorization', `Bearer ${token2}`);

      expect(res.statusCode).toEqual(403);
      expect(res.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/itinerary/:id/share', () => {
    it('should block non-owners from sharing', async () => {
      const res = await request(app)
        .post(`/api/itinerary/${testItineraryId}/share`)
        .set('Authorization', `Bearer ${token2}`);

      expect(res.statusCode).toEqual(403);
    });

    it('should successfully toggle sharing state of the itinerary', async () => {
      // 1. Initially false, toggle to true
      const resShare = await request(app)
        .post(`/api/itinerary/${testItineraryId}/share`)
        .set('Authorization', `Bearer ${token1}`);

      expect(resShare.statusCode).toEqual(200);
      expect(resShare.body.data.isPublic).toBe(true);

      // 2. Fetch shared route as public visitor
      const resPublic = await request(app)
        .get(`/api/share/${shareId}`);

      expect(resPublic.statusCode).toEqual(200);
      expect(resPublic.body.data.extractedData.destination).toEqual('London');

      // 3. Toggle back to false
      const resPrivate = await request(app)
        .post(`/api/itinerary/${testItineraryId}/share`)
        .set('Authorization', `Bearer ${token1}`);

      expect(resPrivate.body.data.isPublic).toBe(false);

      // 4. Fetch shared route should now return 404
      const resPublic404 = await request(app)
        .get(`/api/share/${shareId}`);

      expect(resPublic404.statusCode).toEqual(404);
      expect(resPublic404.body.message).toEqual('Itinerary not found');
    });
  });

  describe('DELETE /api/itinerary/:id', () => {
    it('should block non-owners from deleting', async () => {
      const res = await request(app)
        .delete(`/api/itinerary/${testItineraryId}`)
        .set('Authorization', `Bearer ${token2}`);

      expect(res.statusCode).toEqual(403);
    });

    it('should allow owner to delete successfully', async () => {
      const res = await request(app)
        .delete(`/api/itinerary/${testItineraryId}`)
        .set('Authorization', `Bearer ${token1}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toMatch(/deleted successfully/i);

      // Verify it is removed from database
      const resGet = await request(app)
        .get(`/api/itinerary/${testItineraryId}`)
        .set('Authorization', `Bearer ${token1}`);

      expect(resGet.statusCode).toEqual(404);
    });
  });
});
