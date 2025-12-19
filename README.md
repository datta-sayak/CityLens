# CityLens - Transparent Urban Issue Tracker

A Next.js web application enabling citizens to report infrastructure issues and municipal workers to manage them transparently.

## Features

### 1. Public Citizen Reporting Portal (`/report`)
- Dynamic issue reporting form (Title, Description)
- Browser-native image upload with preview
- One-click geolocation capture
- Real-time Firebase Storage integration
- Transparency notice for public visibility
- Success notifications with auto-redirect

### 2. Citizen Dashboard (`/my-reports`)
- Personalized view of submitted reports
- Status tracking (Open, In Progress, Resolved)
- Tab-based filtering system
- Visual cards with images and timestamps
- Direct Google Maps links for locations
- Actionable empty states

### 3. Worker Task Management (`/workers`)
- Unified task board for all issues
- Status update actions:
  - "Start Working" (Open → In Progress)
  - "Mark Resolved" (In Progress → Resolved)
  - "Re-open" capability
- Real-time statistics dashboard
- Full task context with photos and locations

### 4. Public Issues Board (`/issues`)
- Live feed of all reported issues
- Interactive Leaflet map with issue markers
- Real-time Firestore synchronization
- Status visibility for transparency

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: JavaScript (.jsx)
- **Styling**: Tailwind CSS v4
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Maps**: Leaflet + react-leaflet
- **Icons**: Lucide React

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Firebase
1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication, Firestore, and Storage
3. Copy `env.example` to `.env.local`:
```bash
cp env.example .env.local
```
4. Add your Firebase credentials to `.env.local`

### 3. Firestore Security Rules
Set up basic rules in Firebase Console:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /issues/{issueId} {
      allow read: if true;
      allow create: if true;
      allow update: if true;
    }
  }
}
```

### 4. Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /issues/{allPaths=**} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

### 5. Run Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── page.jsx              # Landing page
│   ├── report/page.jsx       # Citizen reporting portal
│   ├── my-reports/page.jsx   # Citizen dashboard
│   ├── workers/page.jsx      # Worker task board
│   ├── issues/page.jsx       # Public issues board
│   ├── layout.jsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   └── IssuesMap.jsx         # Leaflet map component
└── lib/
    ├── firebase.js           # Firebase configuration
    └── utils.js              # Utility functions
```

## Usage

### For Citizens
1. Visit `/report` to submit an issue
2. Fill in title, description, upload photo
3. Click "Get Current Location" for geolocation
4. Submit and view on `/issues` or `/my-reports`

### For Workers
1. Visit `/workers` to see all tasks
2. Click "Start Working" on open issues
3. Click "Mark Resolved" when complete
4. Re-open if needed

### For Public
- Visit `/issues` to see all reports and map
- View real-time status updates

## Philosophy

**Transparency First**: Every report, status change, and resolution is instantly visible to the public, building trust between municipalities and citizens.

## License

MIT
