import { jsPDF } from 'jspdf';

export const exportItineraryToPDF = (itinerary) => {
  const { extractedData, generatedItinerary, duration } = itinerary;
  const doc = new jsPDF();
  
  let y = 15; // Vertical position tracker

  // Page limit handler
  const checkPageEnd = (neededHeight) => {
    if (y + neededHeight > 280) {
      doc.addPage();
      y = 15;
    }
  };

  // 1. Header Title
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(16, 185, 129); // Brand color (Emerald)
  doc.text(`TripNest Travel Itinerary`, 14, y);
  y += 8;

  // Subtitle
  doc.setFontSize(14);
  doc.setTextColor(100, 116, 139);
  doc.setFont('Helvetica', 'normal');
  doc.text(`Destination: ${extractedData.destination}`, 14, y);
  y += 6;
  doc.text(`Duration: ${duration.days} Days / ${duration.nights} Nights`, 14, y);
  y += 12;

  // 2. Summary
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text('Trip Summary:', 14, y);
  y += 6;

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  // Split long summary text to fit width
  const summaryLines = doc.splitTextToSize(generatedItinerary.tripSummary || '', 180);
  doc.text(summaryLines, 14, y);
  y += (summaryLines.length * 5) + 8;

  // 3. Flight & Hotel Information
  checkPageEnd(50);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text('Travel & Booking Reservations:', 14, y);
  y += 6;

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);

  let bookingInfo = [];
  if (extractedData.flightNumber) {
    bookingInfo.push(`Flight: ${extractedData.airline || ''} ${extractedData.flightNumber} (${extractedData.departureCity || ''} -> ${extractedData.arrivalCity || ''}) - Departs: ${extractedData.departureDate || ''}`);
  }
  if (extractedData.trainNumber || extractedData.trainName) {
    bookingInfo.push(`Train: ${extractedData.trainName || ''} ${extractedData.trainNumber ? 'No. ' + extractedData.trainNumber : ''} (${extractedData.departureStation || ''} -> ${extractedData.arrivalStation || ''}) - Departs: ${extractedData.departureDate || ''} ${extractedData.departureTime || ''}`);
    if (extractedData.seatInfo || extractedData.coachClass) {
      bookingInfo.push(`  Coach/Seat: ${extractedData.coachClass || 'N/A'} / ${extractedData.seatInfo || 'N/A'}`);
    }
  }
  if (extractedData.busNumber || (extractedData.operator && !extractedData.trainNumber && !extractedData.flightNumber)) {
    bookingInfo.push(`Bus: ${extractedData.operator || ''} ${extractedData.busNumber ? 'No. ' + extractedData.busNumber : ''} (${extractedData.departureStation || ''} -> ${extractedData.arrivalStation || ''}) - Departs: ${extractedData.departureDate || ''} ${extractedData.departureTime || ''}`);
    if (extractedData.seatInfo) {
      bookingInfo.push(`  Seat: ${extractedData.seatInfo}`);
    }
  }
  if (extractedData.hotelName) {
    bookingInfo.push(`Hotel: ${extractedData.hotelName} (Address: ${extractedData.hotelAddress || ''}) - Check-in: ${extractedData.checkInDate || ''} - Checkout: ${extractedData.checkOutDate || ''}`);
  }
  if (extractedData.bookingReference) {
    bookingInfo.push(`Booking Ref / PNR: ${extractedData.bookingReference}`);
  }
  if (extractedData.passengerNames) {
    bookingInfo.push(`Passenger(s): ${extractedData.passengerNames}`);
  }
  if (extractedData.fareAmount) {
    bookingInfo.push(`Fare Amount: ${extractedData.fareAmount}`);
  }

  if (bookingInfo.length === 0) {
    doc.text('No flight or accommodation records associated.', 14, y);
    y += 6;
  } else {
    bookingInfo.forEach(line => {
      const splitLines = doc.splitTextToSize(line, 180);
      doc.text(splitLines, 14, y);
      y += (splitLines.length * 5) + 1;
    });
  }
  y += 8;

  // 4. Day-wise Schedule
  checkPageEnd(40);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(16, 185, 129);
  doc.text('Day-by-Day Schedule:', 14, y);
  y += 8;

  generatedItinerary.dayWisePlan.forEach((day) => {
    checkPageEnd(40);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(`Day ${day.dayNumber}: ${day.title}`, 14, y);
    y += 6;

    day.activities.forEach((act) => {
      const timeStr = act.time ? `[${act.time}] ` : '';
      const costStr = act.cost ? ` (Est. Cost: ${act.cost})` : '';
      const activityTitle = `${timeStr}${act.activity}${costStr}`;
      
      checkPageEnd(25);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);
      doc.text(`• ${activityTitle}`, 16, y);
      y += 5;

      if (act.description) {
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105);
        const descLines = doc.splitTextToSize(act.description, 175);
        doc.text(descLines, 20, y);
        y += (descLines.length * 4.5) + 3;
      }
    });
    y += 4;
  });

  // 5. Dining & Tips (Page Break Friendly)
  checkPageEnd(60);
  y += 6;
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('Local Dining & Food Recommendations:', 14, y);
  y += 6;

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  generatedItinerary.foodRecommendations.forEach((food) => {
    checkPageEnd(8);
    doc.text(`- ${food}`, 16, y);
    y += 5;
  });

  checkPageEnd(60);
  y += 6;
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('Travel Tips & Guidelines:', 14, y);
  y += 6;

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  generatedItinerary.travelTips.forEach((tip) => {
    checkPageEnd(8);
    const splitTip = doc.splitTextToSize(`- ${tip}`, 180);
    doc.text(splitTip, 16, y);
    y += (splitTip.length * 5);
  });

  checkPageEnd(60);
  y += 6;
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('Essential Packing Suggestions:', 14, y);
  y += 6;

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  generatedItinerary.packingSuggestions.forEach((pack) => {
    checkPageEnd(8);
    doc.text(`- ${pack}`, 16, y);
    y += 5;
  });

  // Save PDF
  const filename = `${extractedData.destination.replace(/[^a-zA-Z0-9]/g, '_')}_itinerary.pdf`;
  doc.save(filename);
};

/**
 * Export the currently rendered itinerary page as a PDF using html2canvas.
 * This approach captures the page as a visual screenshot, which means it works
 * perfectly for ALL languages including Hindi, Arabic, Japanese, etc.
 * since the browser renders the fonts natively.
 *
 * @param {string} elementId - The ID of the DOM element to capture (default: 'itinerary-content')
 * @param {string} filename - Output filename for the PDF
 */
export const exportPageToPDF = async (elementId = 'itinerary-content', filename = 'itinerary.pdf') => {
  try {
    // Dynamically import html2canvas to keep bundle size light
    const html2canvas = (await import('html2canvas')).default;
    
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Element #${elementId} not found`);
      return;
    }

    // Capture the element as a canvas
    const canvas = await html2canvas(element, {
      scale: 2,               // 2x for sharp retina-quality output
      useCORS: true,          // allow cross-origin images (e.g. destination photos)
      allowTaint: true,
      backgroundColor: '#020817', // Match slate-950 dark background
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 210;  // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add new pages if content is longer than one page
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(filename);
  } catch (err) {
    console.error('Failed to export page as PDF:', err);
    throw err;
  }
};
