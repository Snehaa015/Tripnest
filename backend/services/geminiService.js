const { GoogleGenerativeAI } = require('@google/generative-ai');

// Helper to sanitize JSON response from Gemini (stripping markdown fences)
const sanitizeJsonString = (text) => {
  let cleaned = text.trim();
  
  // Remove markdown code fences if present
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.substring(3);
  }
  
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  
  return cleaned.trim();
};

// Models to try in order (fallback chain)
const MODEL_FALLBACK_LIST = [
  'gemini-1.5-flash',
  'gemini-1.5-flash-latest',
  'gemini-2.0-flash',
  'gemini-1.5-pro',
];

// Sleep helper
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getGenAIInstance = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    throw new Error('Gemini API key is not configured. Please add GEMINI_API_KEY to your backend/.env file.');
  }
  return new GoogleGenerativeAI(apiKey);
};

/**
 * Tries to generate content using a list of models with retry & fallback.
 * On 429 quota errors, tries next model. On 503, retries with delay.
 */
const generateWithFallback = async (promptFn) => {
  const genAI = getGenAIInstance();
  
  for (const modelName of MODEL_FALLBACK_LIST) {
    const model = genAI.getGenerativeModel({ model: modelName });
    let retries = 2;
    
    while (retries >= 0) {
      try {
        const prompt = promptFn();
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
      } catch (err) {
        const status = err?.status || err?.httpErrorCode;
        const msg = err?.message || '';
        
        if (msg.includes('503') || msg.includes('Service Unavailable')) {
          // Temporary overload — retry with delay
          if (retries > 0) {
            console.warn(`[Gemini] ${modelName} returned 503, retrying in 5s... (${retries} retries left)`);
            await sleep(5000);
            retries--;
            continue;
          }
        }
        
        if (msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
          // Quota exhausted on this model — break to try next
          console.warn(`[Gemini] ${modelName} quota exhausted, trying next model...`);
          break;
        }
        
        // Unknown error — rethrow
        throw err;
      }
    }
  }
  
  throw new Error('All Gemini models are currently unavailable or quota exhausted. Please try again later.');
};

/**
 * Extracts structured travel data from raw OCR text using Gemini
 */
const parseExtractedData = async (rawText) => {
  try {
    const buildPrompt = () => `
You are an expert AI parser for travel booking documents.
Your task is to extract specific travel fields from the raw text of an uploaded document (flight ticket, hotel booking confirmation, train ticket, bus ticket, itinerary confirmation, etc.).

Required Fields:
1. flightNumber (Flight number e.g., AA123, EK202)
2. airline (Airline name e.g., Emirates, American Airlines)
3. departureCity (Departure city or airport)
4. arrivalCity (Arrival city or airport)
5. departureDate (Departure date in YYYY-MM-DD or standard readable format)
6. arrivalDate (Arrival date in YYYY-MM-DD or standard readable format)
7. hotelName (Hotel name if present)
8. hotelAddress (Hotel address if present)
9. checkInDate (Hotel check-in date in YYYY-MM-DD or readable format)
10. checkOutDate (Hotel check-out date in YYYY-MM-DD or readable format)
11. destination (The main destination city. If not explicitly stated, infer it from the arrival city, station, or hotel city. If you cannot find any, write 'Unknown')
12. bookingReference (Booking ID, PNR, confirmation code, reference number)
13. passengerNames (Passenger name or names separated by commas)
14. operator (Train or Bus operator/provider e.g. Amtrak, Greyhound, FlixBus, IRCTC)
15. ticketNumber (Train/Bus ticket number)
16. trainNumber (Train number e.g. 12002, 9024)
17. busNumber (Bus line/number e.g. Line 5, Bus 102)
18. trainName (Name of the train e.g. Shatabdi Express, Eurostar)
19. departureStation (Departure train station or bus stop/terminal)
20. arrivalStation (Arrival train station or bus stop/terminal)
21. departureTime (Departure time format e.g. 09:30 AM)
22. arrivalTime (Arrival time format e.g. 05:45 PM)
23. seatInfo (Seat, berth, or cabin number)
24. coachClass (Coach number or service class e.g. Economy, Sleeper, First Class)
25. fareAmount (Paid ticket fare amount e.g. $45.00, Rs. 1200)
26. bookingDate (Date booking was created)
27. journeyDuration (Duration of travel e.g. 4h 30m)

Instructions:
- Return ONLY a valid JSON object matching the fields above.
- Do NOT include any explanations, introduction, markdown code block backticks (like \`\`\`json), or formatting.
- If a field is not found in the raw text, set its value to "".
- Be accurate and do not make up values.

Raw OCR Text from document:
-------------------------
${rawText}
-------------------------
`;

    const textResponse = await generateWithFallback(buildPrompt);
    
    const sanitizedJson = sanitizeJsonString(textResponse);
    
    try {
      const parsedData = JSON.parse(sanitizedJson);
      
      // Basic validation
      const finalData = {
        flightNumber: parsedData.flightNumber || '',
        airline: parsedData.airline || '',
        departureCity: parsedData.departureCity || '',
        arrivalCity: parsedData.arrivalCity || '',
        departureDate: parsedData.departureDate || '',
        arrivalDate: parsedData.arrivalDate || '',
        hotelName: parsedData.hotelName || '',
        hotelAddress: parsedData.hotelAddress || '',
        checkInDate: parsedData.checkInDate || '',
        checkOutDate: parsedData.checkOutDate || '',
        destination: parsedData.destination || 'Unknown',
        bookingReference: parsedData.bookingReference || '',
        passengerNames: parsedData.passengerNames || '',
        operator: parsedData.operator || '',
        ticketNumber: parsedData.ticketNumber || '',
        trainNumber: parsedData.trainNumber || '',
        busNumber: parsedData.busNumber || '',
        trainName: parsedData.trainName || '',
        departureStation: parsedData.departureStation || '',
        arrivalStation: parsedData.arrivalStation || '',
        departureTime: parsedData.departureTime || '',
        arrivalTime: parsedData.arrivalTime || '',
        seatInfo: parsedData.seatInfo || '',
        coachClass: parsedData.coachClass || '',
        fareAmount: parsedData.fareAmount || '',
        bookingDate: parsedData.bookingDate || '',
        journeyDuration: parsedData.journeyDuration || ''
      };
      
      return finalData;
    } catch (parseErr) {
      console.error('Failed to parse Gemini OCR JSON:', textResponse);
      throw new Error('Gemini output could not be parsed as valid JSON.');
    }
  } catch (error) {
    console.error('Gemini OCR extraction service error:', error);
    throw error;
  }
};

/**
 * Generates complete travel itinerary based on reviewed travel details
 */
const generateItinerary = async (travelData, duration) => {
  try {
    const buildPrompt = () => `
You are a professional travel planner and tour operator.
Create a comprehensive, premium day-by-day travel itinerary for a trip to: ${travelData.destination}.

Trip parameters:
- Destination: ${travelData.destination}
- Duration: ${duration.days} Days, ${duration.nights} Nights
- Flight Details: ${travelData.airline || 'N/A'} ${travelData.flightNumber || 'N/A'} from ${travelData.departureCity || 'N/A'} to ${travelData.arrivalCity || 'N/A'} (Date: ${travelData.departureDate || 'N/A'})
- Hotel Details: ${travelData.hotelName || 'N/A'}, Address: ${travelData.hotelAddress || 'N/A'} (Check-in: ${travelData.checkInDate || 'N/A'}, Check-out: ${travelData.checkOutDate || 'N/A'})
- Train Details: ${travelData.trainName || 'N/A'} (No. ${travelData.trainNumber || 'N/A'}), Operator: ${travelData.operator || 'N/A'}, Station: ${travelData.departureStation || 'N/A'} to ${travelData.arrivalStation || 'N/A'} (Date/Time: ${travelData.departureDate || 'N/A'} ${travelData.departureTime || 'N/A'})
- Bus Details: ${travelData.operator || 'N/A'} (No. ${travelData.busNumber || 'N/A'}), Station: ${travelData.departureStation || 'N/A'} to ${travelData.arrivalStation || 'N/A'} (Date/Time: ${travelData.departureDate || 'N/A'} ${travelData.departureTime || 'N/A'})

Instructions for generation:
1. Provide a beautiful and engaging 'tripSummary' highlighting what makes this trip special.
2. Generate a 'dayWisePlan' array containing exactly ${duration.days} days. Each day must have:
   - 'dayNumber' (number, starting at 1)
   - 'title' (a catchy name for that day's theme, e.g. "Exploring Historic Landmarks")
   - 'activities' array. Each activity must have:
     - 'time' (specific time of day, e.g. "09:00 AM", "02:30 PM", "07:00 PM")
     - 'activity' (title of the activity)
     - 'description' (a brief description explaining the activity, spots, or directions)
     - 'cost' (estimated cost. If there is a cost, provide it in both USD and INR (Indian Rupees), e.g. "$15 / ₹1,250". If it is free or included, write "Free" or "Included".)
3. Include 'flightInformation', 'hotelInformation', 'trainInformation', and 'busInformation' structures matching the input.
4. Provide a list of 'attractions' (at least 5 key tourist attractions).
5. Provide a list of 'foodRecommendations' (at least 4 famous local dishes or restaurant ideas).
6. Provide a list of 'travelTips' (custom warnings, safety, local etiquette, currency tips).
7. Provide a list of 'packingSuggestions' (essential items suitable for this destination and duration).

Return ONLY a valid JSON object matching the following structure. Do not include markdown code fences (like \`\`\`json) or any extra characters.

JSON Schema:
{
  "tripSummary": "...",
  "dayWisePlan": [
    {
      "dayNumber": 1,
      "title": "...",
      "activities": [
        {
          "time": "...",
          "activity": "...",
          "description": "...",
          "cost": "..."
        }
      ]
    }
  ],
  "flightInformation": {
    "flightNumber": "...",
    "airline": "...",
    "departure": "...",
    "arrival": "...",
    "time": "..."
  },
  "trainInformation": {
    "trainNumber": "...",
    "trainName": "...",
    "operator": "...",
    "departureStation": "...",
    "arrivalStation": "...",
    "departureTime": "...",
    "arrivalTime": "...",
    "seatInfo": "...",
    "coachClass": "..."
  },
  "busInformation": {
    "busNumber": "...",
    "operator": "...",
    "departureStation": "...",
    "arrivalStation": "...",
    "departureTime": "...",
    "arrivalTime": "...",
    "seatInfo": "..."
  },
  "hotelInformation": {
    "name": "...",
    "address": "...",
    "checkIn": "...",
    "checkOut": "..."
  },
  "attractions": ["...", "..."],
  "foodRecommendations": ["...", "..."],
  "travelTips": ["...", "..."],
  "packingSuggestions": ["...", "..."]
}
`;

    const textResponse = await generateWithFallback(buildPrompt);
    const sanitizedJson = sanitizeJsonString(textResponse);
    
    try {
      const parsedItinerary = JSON.parse(sanitizedJson);
      
      // Basic validation of fields
      if (!parsedItinerary.tripSummary || !Array.isArray(parsedItinerary.dayWisePlan)) {
        throw new Error('Missing core itinerary fields from AI response.');
      }
      
      return parsedItinerary;
    } catch (parseErr) {
      console.error('Failed to parse Gemini Itinerary JSON:', textResponse);
      throw new Error('Gemini itinerary output could not be parsed as valid JSON.');
    }
  } catch (error) {
    console.error('Gemini itinerary generation service error:', error);
    throw error;
  }
};

/**
 * Translates a generated itinerary object into the specified target language using Gemini
 */
const translateItinerary = async (itineraryObj, targetLangCode) => {
  const langNames = {
    en: 'English',
    hi: 'Hindi',
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    ja: 'Japanese',
    ar: 'Arabic',
    pt: 'Portuguese'
  };

  const targetLang = langNames[targetLangCode];
  if (!targetLang || targetLangCode === 'en') {
    return itineraryObj; // No translation needed or fallback to English
  }

  try {
    const buildPrompt = () => `
You are a translation expert.
Translate the following travel itinerary JSON object to ${targetLang}.

Rules:
1. Translate all text values (e.g. strings, descriptions, titles, recommendations, tips, summary) to ${targetLang}.
2. Maintain the exact same JSON schema and keys. Do NOT translate the JSON keys.
3. Keep names like flight numbers, booking references, numbers, time format (e.g., "08:10 AM") as-is or properly formatted for ${targetLang}.
4. Return ONLY a valid JSON object matching the exact structure. Do not include markdown code block backticks (like \`\`\`json) or any explanations.

Itinerary JSON to translate:
${JSON.stringify(itineraryObj)}
`;

    const textResponse = await generateWithFallback(buildPrompt);
    const sanitizedJson = sanitizeJsonString(textResponse);
    return JSON.parse(sanitizedJson);
  } catch (err) {
    console.error(`Failed to dynamically translate itinerary to ${targetLangCode}:`, err);
    return itineraryObj; // Return original on failure (graceful degradation)
  }
};

module.exports = {
  parseExtractedData,
  generateItinerary,
  translateItinerary
};

