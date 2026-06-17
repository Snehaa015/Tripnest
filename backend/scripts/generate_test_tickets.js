const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generatePDF = (filename, text) => {
  const doc = new PDFDocument();
  const filePath = path.join(__dirname, '..', filename);
  doc.pipe(fs.createWriteStream(filePath));
  doc.fontSize(12).text(text, 100, 100);
  doc.end();
  console.log(`Generated ${filePath}`);
};

const trainText = `
TripNest Train Booking Confirmation
-----------------------------------
Operator: IRCTC
Train Name: Shatabdi Express
Train Number: 12002
Seat Information: Coach C1, Seat 35
Coach/Class: AC Chair Car
Fare Amount: Rs. 650
Booking Reference: TRN98765
Passenger Names: Alice, Bob
Departure Station: Mumbai CSMT
Arrival Station: Pune Junction
Departure Date & Time: 2026-07-01 06:00 AM
Arrival Date & Time: 2026-07-01 09:15 AM
Booking Date: 2026-06-01
Journey Duration: 3h 15m
Destination: Pune
`;

const busText = `
TripNest Bus Ticket Booking
---------------------------
Operator: Neeta Travels
Bus Number: MH-12-PQ-9999
Seat Information: Seat 12
Fare Amount: Rs. 450
Booking Reference: BUS4567
Passenger Names: Alice, Bob
Departure Station: Dadar East
Arrival Station: Swargate Pune
Departure Date & Time: 2026-07-02 07:30 AM
Arrival Date & Time: 2026-07-02 11:30 AM
Booking Date: 2026-06-05
Journey Duration: 4h 00m
Destination: Pune
`;

generatePDF('train_mock.pdf', trainText);
generatePDF('bus_mock.pdf', busText);
