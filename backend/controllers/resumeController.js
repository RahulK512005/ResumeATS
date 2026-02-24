import Resume from "../models/Resume.js";
import { parseResume } from "../utils/resumeParser.js";
import { extractKeywords } from "../utils/keywordExtractor.js";
import { calculateATSScore } from "../utils/atsScore.js";
import { analyzeWithGemini } from "../utils/aiAnalyzer.js";
import { buildSuggestions, analyzeFormat } from "../utils/suggestionEngine.js";

/* =========================
   UPLOAD + PARSE RESUME
   ========================= */

export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // ✅ CRITICAL FIX → Convert Buffer → Uint8Array
    const uint8Array = new Uint8Array(req.file.buffer);

    // ✅ Parse PDF
    const text = await parseResume(uint8Array);

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: "No text extracted from PDF" });
    }

    console.log("Resume parsed. Length:", text.length);

    // Save resume to database
    const resume = await Resume.create({
      userId: req.user.id,
      fileName: req.file.originalname,
      text: text,
      atsScore: 0,
      suggestions: [],
      analyzed: false
    });

    res.json({
      success: true,
      resume: {
        _id: resume._id,
        fileName: resume.fileName,
        createdAt: resume.createdAt
      },
      preview: text.substring(0, 500),
      text
    });

  } catch (err) {
    console.error("Upload Resume Error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* =========================
   ANALYZE RESUME + JD
   ========================= */

export const analyzeResume = async (req, res) => {
  try {
    const { resumeText, jobDescription, resumeId } = req.body;

    if (!resumeText || !jobDescription) {
      return res.status(400).json({ error: "Missing resumeText or jobDescription" });
    }

    // ✅ Keyword extraction
    const jdKeywords = extractKeywords(jobDescription);
    const resumeKeywords = extractKeywords(resumeText);

    // ✅ ATS Score
    const score = calculateATSScore(jdKeywords, resumeKeywords);

    console.log("ATS Score:", score);

    // ✅ Gemini AI analysis
    const suggestions = await analyzeWithGemini(resumeText, jobDescription);
    
    // ✅ Get additional format suggestions
    const formatSuggestions = analyzeFormat(resumeText);
    
    // ✅ Get keyword suggestions
    const allSuggestions = buildSuggestions(
      suggestions.analysis || suggestions,
      jdKeywords,
      resumeKeywords
    );

    // Update resume in database if resumeId provided
    if (resumeId) {
      await Resume.findByIdAndUpdate(resumeId, {
        atsScore: score,
        suggestions: allSuggestions,
        analyzed: true,
        jobDescription: jobDescription
      });
    }

    res.json({
      success: true,
      score,
      suggestions: suggestions.analysis || suggestions,
      formatSuggestions,
      allSuggestions
    });

  } catch (err) {
    console.error("Analyze Resume Error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* =========================
   GET USER RESUMES
   ========================= */

export const getUserResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .select('fileName atsScore analyzed createdAt');
    
    res.json({
      success: true,
      resumes
    });
  } catch (err) {
    console.error("Get Resumes Error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* =========================
   DELETE RESUME
   ========================= */

export const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!resume) {
      return res.status(404).json({ error: "Resume not found" });
    }
    
    await Resume.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: "Resume deleted successfully"
    });
  } catch (err) {
    console.error("Delete Resume Error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* =========================
   GET RESUME BY ID
   ========================= */

export const getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!resume) {
      return res.status(404).json({ error: "Resume not found" });
    }
    
    res.json({
      success: true,
      resume
    });
  } catch (err) {
    console.error("Get Resume Error:", err);
    res.status(500).json({ error: err.message });
  }
};