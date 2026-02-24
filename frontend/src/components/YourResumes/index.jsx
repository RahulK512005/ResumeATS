import React, { useState, useEffect } from "react";
import "./index.css";
import Navbar from "../Navbar";
import { API_ENDPOINTS } from "../../utils/api";
 
const YourResumes = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [savedResumes, setSavedResumes] = useState([]);
  const [loadingResumes, setLoadingResumes] = useState(true);
 
  // Fetch saved resumes on mount
  useEffect(() => {
    fetchSavedResumes();
  }, []);
 
  const fetchSavedResumes = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
 
    try {
      const response = await fetch(API_ENDPOINTS.RESUME.LIST, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setSavedResumes(data.resumes);
      }
    } catch (err) {
      console.error("Failed to fetch resumes:", err);
    } finally {
      setLoadingResumes(false);
    }
  };
 
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setError("");
  };
 
  const handleUploadAndAnalyze = async () => {
    if (!selectedFile) {
      setError("Please select a resume to upload.");
      return;
    }
    
    if (!jobDescription.trim()) {
      setError("Please enter a job description.");
      return;
    }
  
    const token = localStorage.getItem("token");
  
    if (!token) {
      setError("You must be logged in.");
      return;
    }
  
    const formData = new FormData();
    formData.append("resume", selectedFile);
  
    try {
      setLoading(true);
      setError("");
  
      // STEP 1: Upload Resume
      const uploadResponse = await fetch(
        API_ENDPOINTS.RESUME.UPLOAD,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );
  
      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(errorText || "Resume upload failed.");
      }
  
      const data = await uploadResponse.json();
      
      // STEP 2: Analyze Resume
      const analyzeDataPayload = {
        resumeText: data.text,
        jobDescription: jobDescription,
        resumeId: data.resume?._id
      };
  
      const analyzeResponse = await fetch(
        API_ENDPOINTS.RESUME.ANALYZE,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(analyzeDataPayload),
        }
      );
  
      if (!analyzeResponse.ok) {
        const errorText = await analyzeResponse.text();
        throw new Error(errorText || "Resume analysis failed.");
      }
      const analyzeData = await analyzeResponse.json();
      console.log(analyzeData);
      setAnalysisResult(analyzeData);
      setShowModal(true);
      
      // Refresh saved resumes
      fetchSavedResumes();
  
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };
 
  const handleDeleteResume = async (id) => {
    if (!confirm("Are you sure you want to delete this resume?")) return;
    
    const token = localStorage.getItem("token");
    
    try {
      const response = await fetch(API_ENDPOINTS.RESUME.DELETE(id), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      if (data.success) {
        fetchSavedResumes();
      }
    } catch (err) {
      console.error("Delete failed:", err);
      setError("Failed to delete resume");
    }
  };
 
  return (
    <div className="resume-page-wrapper">
      <Navbar />
      <div className="resume-container">
        <h2>Upload & Analyze Your Resume</h2>
        
        {/* File Upload Section */}
        <div className="upload-section">
          <label className="file-label">Select Resume (PDF)</label>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="file-input"
          />
          {selectedFile && (
            <p className="selected-file">Selected: {selectedFile.name}</p>
          )}
        </div>
        
        {/* Job Description Section */}
        <div className="jd-section">
          <label className="jd-label">Paste Job Description</label>
          <textarea
            className="jd-textarea"
            placeholder="Paste the job description here for accurate analysis..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={6}
          />
        </div>
        
        <button 
          onClick={handleUploadAndAnalyze} 
          disabled={loading}
          className="analyze-btn"
        >
          {loading ? "Processing..." : "Upload & Analyze Resume"}
        </button>

        {analysisResult && (
          <button className="view-report-btn" onClick={() => setShowModal(true)}>
              View Report
          </button>
        )}

        {/* Saved Resumes Section */}
        <div className="saved-resumes-section">
          <h3>Your Saved Resumes</h3>
          {loadingResumes ? (
            <p>Loading...</p>
          ) : savedResumes.length === 0 ? (
            <p className="no-resumes">No resumes uploaded yet.</p>
          ) : (
            <div className="resumes-list">
              {savedResumes.map((resume) => (
                <div key={resume._id} className="resume-card">
                  <div className="resume-info">
                    <span className="resume-name">{resume.fileName}</span>
                    <span className="resume-date">
                      {new Date(resume.createdAt).toLocaleDateString()}
                    </span>
                    {resume.analyzed && (
                      <span className="score-badge">{resume.atsScore}%</span>
                    )}
                  </div>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDeleteResume(resume._id)}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
       </div>
     
      {/* Analysis Modal */}
      {showModal && analysisResult?.success && (
   <div className="modal-overlay">
     <div className="modal">
       <h2>ATS Resume Analysis Report</h2>
 
       {(() => {
         const report =
           analysisResult.suggestions?.analysis ||
           analysisResult.suggestions ||
           analysisResult;
 
         return (
           <>
             {/* Score */}
             <div className="score-section">
               <h3>Compatibility Score</h3>
               <div className="score-display">
                 {report?.compatibility_score ?? analysisResult.score ?? "N/A"}%
               </div>
             </div>
 
             {/* Resume Skills */}
             <div className="skills-section">
               <h3>Resume Skills</h3>
               <div className="skills-list">
                 {report?.resume_skills?.map((skill, index) => (
                   <span key={index} className="skill-tag">{skill}</span>
                 )) || <p>No skills detected</p>}
               </div>
             </div>
 
             {/* Job Description Skills */}
             <div className="skills-section">
               <h3>Job Description Skills</h3>
               <div className="skills-list">
                 {report?.job_description_skills?.map((skill, index) => (
                   <span key={index} className="skill-tag jd-skill">{skill}</span>
                 )) || <p>No skills detected</p>}
               </div>
             </div>
 
             {/* Missing Skills */}
             <div className="skills-section">
               <h3>Missing Skills (Add to Resume)</h3>
               <div className="skills-list">
                 {report?.missing_skills?.from_resume_for_job_description?.map(
                   (skill, index) => (
                     <span key={index} className="skill-tag missing">{skill}</span>
                   )
                 ) || <p>No missing skills</p>}
               </div>
             </div>
 
             <div className="skills-section">
               <h3>Extra Skills (Not Required by Job)</h3>
               <div className="skills-list">
                 {report?.missing_skills?.from_job_description_for_resume?.map(
                   (skill, index) => (
                     <span key={index} className="skill-tag extra">{skill}</span>
                   )
                 ) || <p>No extra skills</p>}
               </div>
             </div>
 
             {/* ATS Optimization Tips */}
             <div className="tips-section">
               <h3>ATS Optimization Tips</h3>
               <ul>
                 {report?.ats_optimization_tips?.map((tip, index) => (
                   <li key={index}>{tip.replace(/\*\*/g, "")}</li>
                 ))}
                 {analysisResult.allSuggestions?.map((tip, index) => (
                   <li key={`suggestion-${index}`}>{tip}</li>
                 ))}
               </ul>
             </div>
 
             {/* Bullet Improvements */}
             {report?.ats_optimized_bullet_point_improvements?.length > 0 && (
               <div className="bullets-section">
                 <h3>Bullet Point Improvements</h3>
                 {report.ats_optimized_bullet_point_improvements.map(
                   (item, index) => (
                     <div key={index} className="bullet-improvement">
                       <p>
                         <strong>Original:</strong> {item.original_summary}
                       </p>
 
                       <p>
                         <strong>Reasoning:</strong> {item.reasoning}
                       </p>
 
                       <strong>Suggested Bullets:</strong>
                       <ul>
                         {item.suggested_bullets?.map((bullet, i) => (
                           <li key={i}>{bullet}</li>
                         ))}
                       </ul>
                     </div>
                   )
                 )}
               </div>
             )}
 
             {/* Overall Assessment */}
             <div className="assessment-section">
               <h3>Overall Assessment</h3>
               <p>{report?.overall_assessment || "No assessment available"}</p>
             </div>
 
             <button onClick={() => setShowModal(false)} className="close-btn">Close</button>
           </>
         );
       })()}
     </div>
   </div>
)}
 
      {error && <p className="error">{error}</p>}
    </div>
  );
};
 
export default YourResumes;
