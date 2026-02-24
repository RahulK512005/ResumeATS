import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { upload } from "../middleware/upload.js";
import { uploadResume, analyzeResume, getUserResumes, getResumeById, deleteResume } from "../controllers/resumeController.js";

const router = express.Router();

router.post("/upload", authMiddleware, upload.single("resume"), uploadResume);
router.post("/analyze", authMiddleware, analyzeResume);
router.get("/", authMiddleware, getUserResumes);
router.get("/:id", authMiddleware, getResumeById);
router.delete("/:id", authMiddleware, deleteResume);

export default router;