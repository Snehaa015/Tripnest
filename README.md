# TripNest 🌍

> **Upload. Explore. Travel Smarter.**
> A production-quality MERN Stack application that turns travel booking confirmations (tickets, hotel vouchers) into AI-powered travel itineraries.

---

## 📖 Project Overview

TripNest simplifies travel planning by eliminating manual scheduling. Users simply drag and drop booking documents (PDFs or Images), review details captured via optical character recognition (OCR) parsed dynamically using Google Gemini, and receive rich, interactive day-wise itineraries packed with food suggestions, key attractions, weather/packing lists, and travel guidelines.

The layout and design system draw inspiration from modern travel portals like **Airbnb**, **Google Travel**, and **Expedia**, utilizing soft gradients, glassmorphism, responsive timelines, and smooth animations.

---

## ✨ Features

- **Document Extraction (OCR)**: Scans PDF files (`pdf-parse`) and image vouchers (`Tesseract.js`) to parse booking reference keys, dates, airlines, and lodging coordinates.
- **AI Parser Integration**: Extracted OCR text is mapped into 12 distinct schema fields using the **Google Gemini API** (`gemini-1.5-flash`).
- **Extraction Review Screen**: An interactive verification center displaying extracted data, warning about missing properties, allowing manual edits, and locking scheduling until valid variables exist.
- **Day-Wise Itinerary Generation**: Crafts custom timelines detailing hourly events, estimated local costs, dining locations, packing guides, and safety tips using Gemini.
- **Dynamic Destination Images**: Automatically queries and fetches high-resolution destination covers using **Unsplash API** (or falls back gracefully to beautiful pre-mapped graphics).
- **History Portal**: Searchable, sorted index of all past itineraries linked to the logged-in user with instant deletion support.
- **Static Sharing**: Generates UUID-backed share links (`/share/:shareId`) to share plans with colleagues or family without account logins.
- **PDF Export**: Single-click high-fidelity document generation (`jsPDF`) featuring full schedules, summaries, and recommendations.
- **Robust Security**: Protected private endpoints (JWT/bcrypt), file security validations (mime-type, extension, 10MB bounds), request rate limits, and sanitized database models.

---

## 📂 Folder Structure

```
Tripnest/
├── backend/
│   ├── config/          # DB connections
│   ├── controllers/     # Controller layer
│   ├── middleware/      # Auth, upload, validation filters
│   ├── models/          # Mongoose DB Schemas
│   ├── routes/          # API Route controllers
│   ├── services/        # Business logic: Auth, OCR, Gemini API
│   ├── validators/      # Input payload checkers
│   ├── utils/           # Image helper fallbacks
│   ├── uploads/         # Temporary Multer storage
│   ├── server.js        # Main server entrypoint
│   └── .env             # Environment configurations
│
└── frontend/
    ├── src/
    │   ├── assets/      # Static visual components
    │   ├── components/  # Nav bars and layout frames
    │   ├── context/     # Auth Context providers
    │   ├── hooks/       # Custom React state hooks
    │   ├── layouts/     # Main layouts wrapping private screens
    │   ├── pages/       # Login, Register, Upload, Details, Share, History pages
    │   ├── routes/      # Frontend private & public routes
    │   ├── services/    # Axios client connectors
    │   ├── utils/       # PDF export scripts
    │   ├── index.css    # Design configurations (Tailwind imports)
    │   ├── App.jsx      # Core react setup
    │   └── main.jsx     # App injection root
    ├── tailwind.config.js
    └── vite.config.js
```

---

## 🛠️ Local Setup Guide

Follow these steps to run the application on your computer:

### Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB running locally (or a MongoDB Atlas database URI)
- A Google Gemini API Key

---

### Step 1: Clone and Configure Backend

1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Install the backend Node modules:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` folder (or duplicate the `.env.example` template):
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/tripnest
   JWT_SECRET=your_jwt_secret_key_here
   GEMINI_API_KEY=your_google_gemini_api_key_here
   UNSPLASH_ACCESS_KEY=your_unsplash_api_key_here_optional
   NODE_ENV=development
   ```

4. Start the backend server:
   - For development (with hot-reloading):
     ```bash
     npm run dev
     ```
   - For production:
     ```bash
     npm start
     ```

---

### Step 2: Configure and Start Frontend

1. Open a new terminal and navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install the React packages:
   ```bash
   npm install
   ```
3. Run the development build:
   ```bash
   npm run dev
   ```
4. Access the portal in your browser at: [http://localhost:5173](http://localhost:5173)

---

## 🔐 Environment Variables

| Variable | Scope | Purpose |
| :--- | :--- | :--- |
| `PORT` | Backend | Port number the Express application mounts on (Defaults to `5000`). |
| `MONGO_URI` | Backend | Connection link to local or remote Atlas MongoDB. |
| `JWT_SECRET` | Backend | Strong secure token signature salt for user logins. |
| `GEMINI_API_KEY` | Backend | **Mandatory** key from Google AI Studio. |
| `UNSPLASH_ACCESS_KEY` | Backend | Optional key from Unsplash Developers console. |

---

## 🚀 Deployment Steps

### Backend Hosting (e.g., Render, Heroku)
1. Set the root folder to `backend/`.
2. Configure Environment variables in the host manager setting panel.
3. Configure start scripts to `npm start`.

### Frontend Hosting (e.g., Vercel, Netlify)
1. Point to the `frontend/` directory.
2. Build command: `npm run build`.
3. Directory output target: `dist`.
4. Ensure history mode fallbacks (`_redirects` or `vercel.json`) are active to handle React Router redirection queries correctly.
