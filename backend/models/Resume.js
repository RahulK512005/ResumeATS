import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  fileName: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  atsScore: {
    type: Number,
    default: 0
  },
  suggestions: {
    type: Array,
    default: []
  },
  jobDescription: {
    type: String,
    default: ''
  },
  analyzed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model("Resume", resumeSchema);