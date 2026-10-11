# Women Safety Shield 🛡️
### Complete Full-Stack Women Personal Safety & Emergency Response Application

**Women Safety Shield** is a production-grade, full-stack personal safety application architected to provide immediate emergency response, real-time live location sharing, automated journey monitoring, and cryptographic evidence archiving.

---

## 🌟 Key Features

1. **Dedicated Emergency SOS System**
   - Prominent 1-tap SOS trigger with a 5-second cancellation buffer.
   - Immediate manual panic activation (skips countdown).
   - High-accuracy GPS coordinate capture via Browser Geolocation API.
   - Real-time location streaming and breadcrumb tracking.
   - Direct integration link with Indian Emergency Services (`tel:112` Police, `tel:1091` Women Helpline, `tel:181` Women in Distress).
   - Real-time notification dispatch tracking to trusted contacts (`pending`, `sent`, `delivered`, `failed`, `acknowledged`).
   - Duplicate SOS prevention logic and safe incident resolution flow.

2. **Safe Journey Mode**
   - Destination selection, estimated journey duration, and customizable check-in intervals (every 10, 15, 20 mins).
   - Real-time check-in button (*"Confirm I Am Safe"*).
   - Escalation workflow with automatic alerts to contacts if check-ins are critically overdue.
   - Route breadcrumb trail visualization on OpenStreetMap.
   - Arrival confirmation (*"I Have Arrived Safely"*).

3. **Live Location Sharing**
   - OpenStreetMap & Leaflet interactive map with high-accuracy GPS circles.
   - Secret, time-limited share code & unique viewer link (`/shared-location/:code`).
   - Secure Socket.IO rooms ensuring coordinates are shared exclusively with authorized viewers.
   - Location update throttling to prevent database bloat.

4. **Trusted Contacts Management**
   - Configure up to 10 trusted contacts with relationship categories (`parent`, `sibling`, `spouse`, `friend`, `colleague`, `guardian`).
   - Preferred alert notification channels (SMS, WhatsApp, Voice call, App push).
   - Full CRUD operations with server-side ownership authorization.

5. **Nearby Help & Safe Places Directory**
   - OpenStreetMap Overpass API integration querying nearby police stations, 24/7 hospitals, and pharmacies within customizable radii (3km, 5km, 10km).
   - Geospatial caching in MongoDB via 2dsphere indexes.
   - Direct phone dial links and Google Maps driving directions.
   - Fallback emergency response centers if external networks are unavailable.

6. **Emergency Evidence Vault**
   - Private storage for incident photographs, voice memos, and documentation.
   - Server-side SHA-256 cryptographic hash computation to detect tampering.
   - Private access-controlled file streaming and permanent deletion.
   - Clear integrity disclosure regarding forensic verification.

7. **AI Safety Assistant**
   - Contextual guidance on street harassment, stalking tactics, cab ride safety, and legal rights.
   - Provider-independent architecture: uses external AI provider (OpenAI/Gemini) if configured, or a rule-based safety knowledge engine with Indian emergency helplines.

8. **Application Security & Privacy Dashboard**
   - JWT authentication with access tokens and HTTP-only cookies.
   - Bcrypt password hashing (12 rounds) with salt generation.
   - Secret device shake gesture trigger for discrete activation.
   - GDPR/privacy transparency page and one-click account & data erasure.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, React Router DOM 6, Tailwind CSS, Leaflet & React-Leaflet, Lucide Icons, Sonner Toasts, Axios, Socket.IO Client |
| **Backend** | Node.js, Express.js (ES Modules), MongoDB & Mongoose, Socket.IO, JWT, BcryptJS, Zod Validation, Helmet, CORS, Express Rate Limit, Multer |
| **Testing** | Vitest, React Testing Library, JSDOM, Supertest |

---

## 📂 Project Architecture

```
women-safety-shield/
│
├── frontend/                     # React + Vite Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/           # Badge, EmptyState, Modal, EmergencyButton, ConnectionStatus
│   │   │   ├── layout/           # Navbar, Sidebar, MobileNav
│   │   │   └── map/              # MapView (Leaflet OpenStreetMap)
│   │   ├── context/              # AuthContext, EmergencyContext, ThemeContext
│   │   ├── layouts/              # AppLayout, Auth guards
│   │   ├── pages/                # All 21 functional application screens
│   │   ├── services/             # api.js (Axios), socket.js (Socket.IO client)
│   │   ├── styles/               # index.css (Tailwind & glassmorphism)
│   │   ├── tests/                # Frontend Vitest test suites
│   │   ├── App.jsx               # React Router config
│   │   └── main.jsx              # Entry point
│   ├── .env.example
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── backend/                      # Node.js + Express + MongoDB Backend
│   ├── src/
│   │   ├── config/               # db.js, env.js
│   │   ├── controllers/          # auth, user, contact, emergency, journey, location, evidence, places, ai
│   │   ├── middleware/           # auth.js, errorHandler.js, rateLimiter.js, upload.js, validate.js
│   │   ├── models/               # User, TrustedContact, EmergencyIncident, Journey, LocationShareSession, Evidence, Notification, SafetyPlaceCache
│   │   ├── routes/               # Modular REST API endpoints under /api/v1
│   │   ├── services/             # notificationService.js, aiAssistantService.js, placesService.js
│   │   ├── sockets/              # socketHandler.js (Authenticated rooms & events)
│   │   ├── utils/                # apiResponse.js, hash.js, jwt.js, logger.js
│   │   ├── validators/           # Zod schema definitions
│   │   └── server.js             # Express & HTTP server bootstrap
│   ├── tests/                    # Integration test suite (api.test.js)
│   ├── .env.example
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🚀 Local Development Setup

### Prerequisites
1. **Node.js** (v18 or higher; tested on Node.js v24.12.0)
2. **npm** (v9 or higher; tested on npm 11.6.2)
3. **MongoDB** running locally on port `27017` (e.g. `mongodb://127.0.0.1:27017`) or a MongoDB Atlas URI.

---

### Step 1: Environment Configuration

#### Backend Configuration
Copy `.env.example` to `.env` in `backend/`:
```powershell
cd backend
Copy-Item .env.example .env
```
Default `.env` settings:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/women_safety_shield
JWT_ACCESS_SECRET=women_safety_shield_access_jwt_secret_key_super_secure_32bytes_min
JWT_REFRESH_SECRET=women_safety_shield_refresh_jwt_secret_key_super_secure_32bytes_min
FRONTEND_URL=http://localhost:5173
COOKIE_SECURE=false
COOKIE_SAME_SITE=lax
AI_PROVIDER_API_KEY=
EMAIL_PROVIDER_API_KEY=
SMS_PROVIDER_API_KEY=
PUSH_NOTIFICATION_CONFIG=
```

#### Frontend Configuration
Copy `.env.example` to `.env` in `frontend/`:
```powershell
cd ../frontend
Copy-Item .env.example .env
```
Default `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
```

---

### Step 2: Running the Application Locally

Open **two separate Windows PowerShell terminals**:

#### Terminal 1 — Start the Backend Server:
```powershell
cd backend
npm run dev
```
> The backend server will initialize on **http://localhost:5000** and automatically connect to MongoDB.

#### Terminal 2 — Start the Frontend Application:
```powershell
cd frontend
npm run dev
```
> The Vite development server will start on **http://localhost:5173**. Open your browser and navigate to this URL.

---

## 🧪 Running Automated Tests

### Backend Tests
Runs the full suite of integration tests verifying registration, login, auth guards, trusted contact ownership, emergency SOS creation, duplicate SOS prevention, incident resolution, Safe Journey check-ins, and the AI Safety engine:
```powershell
cd backend
npm test
```
*Result: 15 passing tests across all modules.*

### Frontend Tests
Runs component, form validation, and layout tests:
```powershell
cd frontend
npm test
```
*Result: 5 passing test suites.*

### Frontend Production Build
Validates bundling, chunking, and type/syntax correctness:
```powershell
cd frontend
npm run build
```
*Generates optimized production assets in `frontend/dist/`.*

---

## 📡 REST API Reference (`/api/v1`)

### Authentication & Profile
- `POST /api/v1/auth/register` — Create user account with name, phone, email, password.
- `POST /api/v1/auth/login` — Sign in and receive access token + refresh cookies.
- `POST /api/v1/auth/logout` — Invalidate refresh session and clear cookies.
- `GET  /api/v1/auth/me` — Retrieve authenticated user profile.
- `POST /api/v1/auth/refresh` — Issue fresh access token using refresh token.
- `POST /api/v1/auth/forgot-password` — Generate expiring single-use reset token.
- `POST /api/v1/auth/reset-password` — Apply new password with valid token.
- `PATCH /api/v1/users/me` — Update full name, phone number, and safety preferences.
- `PATCH /api/v1/users/me/password` — Change password after checking current credentials.
- `DELETE /api/v1/users/me` — Cascade delete account and all associated safety data.

### Trusted Contacts
- `GET    /api/v1/contacts` — List current user's trusted contacts (up to 10).
- `POST   /api/v1/contacts` — Add new trusted contact.
- `PATCH  /api/v1/contacts/:id` — Update contact details.
- `DELETE /api/v1/contacts/:id` — Remove contact.

### Emergency SOS
- `POST  /api/v1/emergencies` — Trigger SOS incident (captures GPS, alerts contacts).
- `GET   /api/v1/emergencies/active` — Check for active incident.
- `GET   /api/v1/emergencies` — Retrieve user incident history.
- `GET   /api/v1/emergencies/:id` — Retrieve full incident timeline and trails.
- `POST  /api/v1/emergencies/:id/location` — Stream real-time coordinate updates.
- `PATCH /api/v1/emergencies/:id/resolve` — Mark incident safe and resolved.
- `POST  /api/v1/emergencies/:id/acknowledge` — Contact acknowledges alert via SMS link.

### Safe Journey
- `POST  /api/v1/journeys` — Start journey with destination, ETA, and check-in intervals.
- `GET   /api/v1/journeys/active` — Retrieve current active journey.
- `PATCH /api/v1/journeys/:id/check-in` — Confirm safety (*"I am safe"*).
- `PATCH /api/v1/journeys/:id/complete` — Mark journey completed (*"I Have Arrived"*).
- `PATCH /api/v1/journeys/:id/cancel` — Cancel active journey.

### Live Location Sharing
- `POST  /api/v1/location-sessions` — Start live sharing session (generates share code).
- `GET   /api/v1/location-sessions/active` — Retrieve active session.
- `GET   /api/v1/location-sessions/shared/:code` — Authorized viewer endpoint for contacts.
- `PATCH /api/v1/location-sessions/:id/stop` — Terminate sharing session.

### Evidence Vault
- `GET    /api/v1/evidence` — List user's encrypted evidence files.
- `POST   /api/v1/evidence` — Upload evidence file (calculates SHA-256 hash).
- `GET    /api/v1/evidence/:id/download` — Private authenticated file download stream.
- `DELETE /api/v1/evidence/:id` — Permanently delete file from disk and database.

### Nearby Places & AI Assistant
- `GET  /api/v1/places/nearby?lat=...&lng=...&radius=...` — OpenStreetMap Overpass query for police & hospitals.
- `POST /api/v1/assistant/chat` — AI Safety Assistant answering safety questions.
- `GET  /api/v1/health` — System status, database connection, and uptime check.

---

## 🔒 Security & Privacy Architecture

1. **Principle of Least Privilege**: Private user coordinates and evidence files can never be accessed without verifying user identity on the server.
2. **No Deceptive Fallbacks**: If SMS or Email credentials (`SMS_PROVIDER_API_KEY`) are unconfigured, the system explicitly logs simulated dispatch in development rather than claiming messages were sent over cellular networks.
3. **Evidence Integrity**: SHA-256 digests are computed directly on the backend before writing files to secure private disk storage (`backend/uploads/evidence/`).
4. **Rate Limiting**: Configured with strict rate limits on authentication attempts (20 per 15 min) and emergency triggers (10 per min) to prevent abuse.
5. **No Covert Audio/Video Recording**: All recording features require deliberate user consent and explicit UI triggers.

---

## 📄 License
This project is open-source under the MIT License.
