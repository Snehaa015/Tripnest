const fs = require('fs');
const path = require('path');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

const templatePath = path.join(__dirname, 'template.pdf');
const targetPdfPath = path.join(__dirname, '../../mock-travel-booking.pdf');

async function generateMockPdf() {
  try {
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template PDF not found at ${templatePath}`);
    }
    const templateBuffer = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(templateBuffer);
    
    // Embed standard fonts
    const fontHelvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontHelveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Get the first page
    const page = pdfDoc.getPages()[0];
    const { width, height } = page.getSize();

    // Clear background
    page.drawRectangle({
      x: 0,
      y: 0,
      width: width,
      height: height,
      color: rgb(1, 1, 1),
    });

    let yOffset = height - 50;

    // Title
    page.drawText('TRIPNEST BOOKING CONFIRMATION', {
      x: 50,
      y: yOffset,
      size: 18,
      font: fontHelveticaBold,
      color: rgb(0.0078, 0.5176, 0.7765), // #0284c7 equivalent
    });
    yOffset -= 25;

    // Line separator
    page.drawLine({
      start: { x: 50, y: yOffset },
      end: { x: width - 50, y: yOffset },
      thickness: 1.5,
      color: rgb(0.886, 0.910, 0.941), // #e2e8f0
    });
    yOffset -= 25;

    // Section: Confirmation Details
    page.drawText('CONFIRMATION DETAILS', {
      x: 50,
      y: yOffset,
      size: 11,
      font: fontHelveticaBold,
      color: rgb(0.976, 0.451, 0.086), // #f97316
    });
    yOffset -= 18;

    const details = [
      'Booking Reference / PNR: PNR-998877',
      'Status: CONFIRMED',
      'Passenger Name: John Doe'
    ];
    for (const text of details) {
      page.drawText(text, {
        x: 50,
        y: yOffset,
        size: 9,
        font: fontHelvetica,
        color: rgb(0.2, 0.255, 0.333), // #334155
      });
      yOffset -= 14;
    }
    yOffset -= 15;

    // Section: Flight Reservation
    page.drawText('FLIGHT RESERVATION', {
      x: 50,
      y: yOffset,
      size: 11,
      font: fontHelveticaBold,
      color: rgb(0.055, 0.647, 0.914), // #0ea5e9
    });
    yOffset -= 18;

    const flightDetails = [
      'Airline: Air India',
      'Flight Number: AI-101',
      'Departure City: New Delhi (DEL)',
      'Arrival City: Mumbai (BOM)',
      'Departure Date: 2026-07-20',
      'Arrival Date: 2026-07-20'
    ];
    for (const text of flightDetails) {
      page.drawText(text, {
        x: 50,
        y: yOffset,
        size: 9,
        font: fontHelvetica,
        color: rgb(0.2, 0.255, 0.333),
      });
      yOffset -= 14;
    }
    yOffset -= 15;

    // Section: Hotel Accommodation
    page.drawText('ACCOMMODATION VOUCHER', {
      x: 50,
      y: yOffset,
      size: 11,
      font: fontHelveticaBold,
      color: rgb(0.063, 0.725, 0.506), // #10b981
    });
    yOffset -= 18;

    const hotelDetails = [
      'Hotel Name: Taj Mahal Palace Mumbai',
      'Hotel Address: Apollo Bandar, Colaba, Mumbai, Maharashtra 400001',
      'Check-in Date: 2026-07-20',
      'Check-out Date: 2026-07-25',
      'Destination: Mumbai'
    ];
    for (const text of hotelDetails) {
      page.drawText(text, {
        x: 50,
        y: yOffset,
        size: 9,
        font: fontHelvetica,
        color: rgb(0.2, 0.255, 0.333),
      });
      yOffset -= 14;
    }
    yOffset -= 25;

    // Footer Line separator
    page.drawLine({
      start: { x: 50, y: yOffset },
      end: { x: width - 50, y: yOffset },
      thickness: 1,
      color: rgb(0.886, 0.910, 0.941),
    });
    yOffset -= 15;

    page.drawText('Thank you for choosing TripNest. Have a wonderful and safe journey!', {
      x: 100,
      y: yOffset,
      size: 8,
      font: fontHelvetica,
      color: rgb(0.58, 0.639, 0.722), // #94a3b8
    });

    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(targetPdfPath, pdfBytes);
    console.log(`\nSUCCESS: Searchable mock PDF ticket generated at:\n${targetPdfPath}\n`);
  } catch (error) {
    console.error('Error generating mock PDF:', error);
  }
}

generateMockPdf();
