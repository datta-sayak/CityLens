# CityLens

**CityLens** is an urban issue tracking platform built to bridge the gap between citizens and city officials. It uses AI to categorize reports and real-time maps to visualize what's happening in the city, making maintenance transparent and efficient.

## The Problem
Broken infrastructure stays broken for months because:
- ❌ **Black Holes**: Citizens report issues but never hear back.
- ❌ **No Accountability**: No way to track who is working on it.
- ❌ **Too Complex**: Complicated forms mean people just don't bother reporting.

**CityLens** fixes this with transparency, speed, and AI.

## How It Works

### 1. Citizen Reports (10 Seconds) 📸
No forms. No hassle.
- **Snap a photo**: Our **AI** analyzes it to detect the issue (e.g., "Severe Pothole") automatically.
- **Auto-Location**: GPS tags the exact spot.
- **Submit**: It's live on the public map instantly.

### 2. Government Action ⚡
- **Assignment**: Use the dashboard to assign a specific worker.
- **Accountability**: The worker's name becomes **publicly visible** on the ticket. Everyone knows who is responsible.

### 3. Resolution & Verification ✅
- **Proof of Work**: Workers must upload a photo to mark it "Resolved".
- **Citizen Review**: The person who reported it gets to say "Yes, it's fixed" or "No, try again".

## Tech Stack
- 💻 **Frontend**: Next.js 14, Tailwind CSS, ShadCN UI
- 🔥 **Backend**: Firebase (Firestore, Auth, Storage)
- 🧠 **AI**: Google Gemini
- 🌍 **Maps**: Leaflet

## Technical Implementation

### 🧠 AI Analysis Engine
We use **Google Gemini 2.5 Flash** to analyze infrastructure images in real-time.
- **Input**: Base64 encoded image from the user's camera.
- **Processing**: The model is prompted to act as a civil engineer, detecting specific defects (potholes, debris, etc.) and assigning a severity score.
- **Output**: Returns a strict JSON object with `defectType`, `severity`, and a technical description, ensuring data consistency for the database.

### 📍 Real-time Mapping
- **Leaflet & React-Leaflet**: Renders an interactive map of the city.
- **Geospatial Data**: User location is captured via the browser's Geolocation API and stored as lat/lng coordinates in Firestore.
- **Dynamic Re-centering**: The map automatically focuses on the user's location or the specific issue being reviewed.

### 🔥 Backend & Database
- **Firebase Firestore**: Stores issue tickets, user profiles, and status updates. Real-time listeners ensure the dashboard updates instantly without refreshing.
- **Firebase Storage**: Securely hosts "Before" and "Proof of Work" images.
- **Authentication**: Role-based access control (Citizen vs. Government vs. Worker) checks user claims before rendering protected routes.

## Getting Started

1. **Clone the repo**
   ```bash
   git clone https://github.com/your-username/citylens.git
   cd citylens
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Create a `.env.local` file with your credentials (see `env.example`).

4. **Run it**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).


## Team Average

- [Sayak](https://github.com/datta-sayak)
- [Sunayana](https://github.com/Sunayana-005)
- [Sidhant](https://github.com/SuperiorDevelop)
- Koushani

---
*Created for Cosmohack1 (Open Innovation Track)*
*Built by Team Average with the assistance of AI tools.*
