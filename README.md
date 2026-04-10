# JobTrackr — AI-Powered Job Application Tracker

Track your job applications on a Kanban board with AI-powered job description parsing and tailored resume suggestions.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS v3 |
| State | Redux Toolkit (auth) + React Query (server) |
| Drag & Drop | @dnd-kit |
| Backend | Node.js + Express + TypeScript |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt |
| AI | OpenAI API (gpt-4o-mini, JSON mode) |

---

## Prerequisites

- Node.js 18+
- MongoDB (local) or MongoDB Atlas URI
- OpenAI API key

---

## Setup

### 1. Clone and install dependencies

```bash
# Server
cd server
npm install

# Client
cd ../client
npm install
```

### 2. Configure environment variables

```bash
# In server/
cp .env.example .env
```

Edit `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/job-tracker
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRES_IN=7d
OPENAI_API_KEY=sk-your-openai-api-key-here
CLIENT_URL=http://localhost:5173
```

### 3. Run the app

Open two terminals:

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

The app will be live at **http://localhost:5173**

---

## Features

### Kanban Board
- Five status columns: Applied → Phone Screen → Interview → Offer → Rejected
- Drag cards between columns to update status
- Cards show company, role, skills, date, and location

### AI Job Description Parser
- Paste a job description and click **Parse & Generate Suggestions**
- AI extracts: company, role, location, seniority, required skills, nice-to-have skills
- Fields auto-populate in the form

### AI Resume Suggestions
- After parsing, generates 4 role-specific resume bullet points
- Each has a one-click copy button

### Authentication
- Register/Login with email + password (bcrypt hashed)
- JWT stored in localStorage — survives page refresh
- Auto-logout on expired/invalid token

---

## Project Structure

```
job-tracker/
├── client/
│   └── src/
│       ├── api/           # Axios API client + endpoints
│       ├── components/    # KanbanColumn, ApplicationCard, ApplicationModal
│       ├── hooks/         # useApplications (React Query)
│       ├── pages/         # LoginPage, RegisterPage, BoardPage
│       ├── store/         # Redux auth slice
│       ├── types/         # Shared TypeScript interfaces
│       └── utils/         # Constants, helpers
└── server/
    └── src/
        ├── controllers/   # Thin request handlers
        ├── middleware/    # Auth, error handler
        ├── models/        # User, Application (Mongoose)
        ├── routes/        # authRoutes, applicationRoutes, aiRoutes
        └── services/      # aiService, authService (business logic)
```

---

## API Endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login |
| GET | `/api/applications` | ✅ | Get all applications |
| POST | `/api/applications` | ✅ | Create application |
| PUT | `/api/applications/:id` | ✅ | Update application |
| DELETE | `/api/applications/:id` | ✅ | Delete application |
| POST | `/api/ai/parse` | ✅ | Parse JD only |
| POST | `/api/ai/suggestions` | ✅ | Parse JD + generate suggestions |
