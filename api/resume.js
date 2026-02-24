import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import pdf from 'pdf-parse';

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ats-resume-analyzer';

let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  try {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
}

// Resume Model
const resumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fileName: String,
  originalName: String,
  content: String,
  jobDescription: String,
  analysis: {
    atsScore: Number,
    keywords: [String],
    missingKeywords: [String],
    suggestions: [String],
    summary: String,
  },
  createdAt: { type: Date, default: Date.now },
});

const Resume = mongoose.models.Resume || mongoose.model('Resume', resumeSchema);

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Multer setup for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

// Auth middleware
const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Helper function to analyze with Gemini
async function analyzeResume(content, jobDescription) {
  if (!GEMINI_API_KEY) {
    return {
      atsScore: 75,
      keywords: ['JavaScript', 'React', 'Node.js'],
      missingKeywords: ['TypeScript', 'GraphQL'],
      suggestions: ['Add more technical keywords', 'Include quantifiable achievements'],
      summary: 'Good resume structure. Consider adding more keywords from the job description.'
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are an ATS (Applicant Tracking System) expert. Analyze this resume against the job description and provide:
    1. ATS Score (0-100)
    2. Keywords found
    3. Missing keywords
    4. Suggestions for improvement
    5. A brief summary

    Resume:
    ${content}

    Job Description:
    ${jobDescription}

    Return as JSON:
    {
      "atsScore": number,
      "keywords": string[],
      "missingKeywords": string[],
      "suggestions": string[],
      "summary": string
    }`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return {
      atsScore: 70,
      keywords: [],
      missingKeywords: [],
      suggestions: ['Add more relevant keywords'],
      summary: 'Analysis completed'
    };
  } catch (error) {
    console.error('AI Analysis error:', error);
    return {
      atsScore: 70,
      keywords: [],
      missingKeywords: [],
      suggestions: ['Add more relevant keywords'],
      summary: 'Analysis completed with errors'
    };
  }
}

// Routes
app.post('/resume/upload', auth, upload.single('resume'), async (req, res) => {
  try {
    await connectDB();
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const jobDescription = req.body.jobDescription || '';
    
    // Extract text from PDF
    let content = '';
    try {
      const data = await pdf(req.file.buffer);
      content = data.text;
    } catch (err) {
      content = req.file.buffer.toString('utf-8');
    }

    // Analyze resume
    const analysis = await analyzeResume(content, jobDescription);

    const resume = await Resume.create({
      userId: req.userId,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      content,
      jobDescription,
      analysis,
    });

    res.status(201).json(resume);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.get('/resume', auth, async (req, res) => {
  try {
    await connectDB();
    const resumes = await Resume.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(resumes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/resume/:id', auth, async (req, res) => {
  try {
    await connectDB();
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.userId });
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    res.json(resume);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/resume/:id', auth, async (req, res) => {
  try {
    await connectDB();
    const resume = await Resume.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    res.json({ message: 'Resume deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/resume/analyze/:id', auth, async (req, res) => {
  try {
    await connectDB();
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.userId });
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    const jobDescription = req.body.jobDescription || resume.jobDescription;
    const analysis = await analyzeResume(resume.content, jobDescription);

    resume.jobDescription = jobDescription;
    resume.analysis = analysis;
    await resume.save();

    res.json(resume);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default app;
