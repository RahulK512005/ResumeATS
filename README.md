# ATS Resume Analyzer

A full-stack web application that analyzes resumes against job descriptions using AI-powered ATS (Applicant Tracking System) scoring.

## Features

- **User Authentication**: Register and login functionality
- **Resume Upload**: Upload PDF resumes for analysis
- **AI Analysis**: Get detailed analysis of your resume
- **ATS Scoring**: Score your resume against job descriptions
- **Keyword Extraction**: Identify missing keywords in your resume
- **Suggestions**: Get personalized improvement suggestions

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Multer for file uploads
- PDF parsing and generation

### Frontend
- React 19
- Vite
- React Router DOM
- Axios
- CSS3

## Prerequisites

- Node.js (v18+)
- MongoDB (local or Atlas)
- npm or yarn

## Installation

### 1. Clone the repository

```bash
cd ATS-Resume-Analyzer
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Configure Backend Environment

Create a `.env` file in the `backend` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ats-resume-analyzer
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_google_gemini_api_key
```

### 4. Install Frontend Dependencies

```bash
cd frontend
npm install
```

## Running the Project

### Start Backend Server

```bash
cd backend
npm start
```

The backend will run on http://localhost:5000

### Start Frontend Development Server

```bash
cd frontend
npm run dev
```

The frontend will run on http://localhost:5173

## Project Structure

```
ATS-Resume-Analyzer/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   └── resumeController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── upload.js
│   ├── models/
│   │   ├── Resume.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── resumeRoutes.js
│   ├── utils/
│   │   ├── aiAnalyzer.js
│   │   ├── atsScore.js
│   │   ├── keywordExtractor.js
│   │   ├── pdfGenerator.js
│   │   ├── resumeParser.js
│   │   └── suggestionEngine.js
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Contact/
│   │   │   ├── Home/
│   │   │   ├── Login/
│   │   │   ├── Navbar/
│   │   │   ├── ProtectedRoute/
│   │   │   ├── Register/
│   │   │   └── YourResumes/
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── GET_CONNECTION_STRING.md
├── MONGODB_ATLAS_SETUP.md
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Resumes
- `POST /api/resumes/upload` - Upload a resume
- `GET /api/resumes` - Get all resumes for current user
- `GET /api/resumes/:id` - Get specific resume
- `DELETE /api/resumes/:id` - Delete a resume
- `POST /api/resumes/analyze/:id` - Analyze a resume

## Environment Variables

### Backend (.env)
| Variable | Description |
|----------|-------------|
| PORT | Server port (default: 5000) |
| MONGODB_URI | MongoDB connection string |
| JWT_SECRET | Secret key for JWT |
| GEMINI_API_KEY | Google Gemini API key for AI analysis |

### Frontend (.env)
| Variable | Description |
|----------|-------------|
| VITE_API_URL | Backend API URL |

## License

ISC

---

## Vercel Deployment (Full Stack)

This project is configured for full-stack Vercel deployment with serverless API functions.

### Step 1: Configure Environment Variables

Go to your Vercel project Settings → Environment Variables and add:

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB Atlas connection string (mongodb+srv://...) |
| `JWT_SECRET` | A secure random string for JWT tokens |
| `GEMINI_API_KEY` | Google Gemini API key (optional, for AI analysis) |

### Step 2: Deploy

1. Push all changes to GitHub
2. Go to [Vercel](https://vercel.com) → Add Project
3. Import your repository
4. Vercel will auto-detect the configuration from `vercel.json`
5. Click "Deploy"

### Project Structure for Vercel

```
├── api/
│   ├── auth.js        # Authentication API routes
│   └── resume.js      # Resume upload & analysis API
├── frontend/
│   ├── src/           # React frontend source
│   └── dist/          # Built frontend (generated)
├── vercel.json        # Vercel configuration
└── package.json       # Root package with build script
```

### API Endpoints (deployed)

- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/resume/upload` - Upload resume
- `GET /api/resume` - List resumes
- `GET /api/resume/:id` - Get resume
- `DELETE /api/resume/:id` - Delete resume
- `POST /api/resume/analyze/:id` - Analyze resume
