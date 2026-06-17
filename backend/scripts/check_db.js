const mongoose = require('mongoose');
const Itinerary = require('../models/Itinerary');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tripnest';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    const itineraries = await Itinerary.find({}).sort({ createdAt: -1 }).limit(5);
    console.log(`Found ${itineraries.length} recent itineraries:`);
    itineraries.forEach(it => {
      console.log(`- ID: ${it._id}, Destination: ${it.extractedData.destination}, TrainNumber: ${it.extractedData.trainNumber}, BusNumber: ${it.extractedData.busNumber}, CreatedAt: ${it.createdAt}`);
    });
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
  });
