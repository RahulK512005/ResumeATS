/**
 * Suggestion Engine for Resume Optimization
 * Provides actionable suggestions based on resume analysis
 */

// Common ATS-friendly keywords by category
const KEYWORD_CATEGORIES = {
  technical: ['javascript', 'python', 'java', 'react', 'node.js', 'sql', 'aws', 'docker', 'kubernetes', 'git', 'html', 'css', 'typescript', 'angular', 'vue', 'mongodb', 'postgresql', 'redis', 'CI/CD', 'REST API', 'GraphQL'],
  soft: ['leadership', 'communication', 'teamwork', 'problem-solving', 'analytical', 'adaptable', 'collaboration', 'project management', 'time management', 'critical thinking'],
  action: ['developed', 'implemented', 'created', 'designed', 'managed', 'led', 'optimized', 'analyzed', 'improved', 'increased', 'reduced', 'delivered', 'achieved', 'coordinated']
};

/**
 * Generate suggestions based on resume analysis
 * @param {Object} analysis - Analysis results from AI
 * @param {Array} jdKeywords - Keywords from job description
 * @param {Array} resumeKeywords - Keywords from resume
 * @returns {Array} Array of suggestion strings
 */
export const buildSuggestions = (analysis, jdKeywords = [], resumeKeywords = []) => {
  const suggestions = [];
  
  // Check for missing skills
  if (analysis?.missing_skills?.from_resume_for_job_description?.length > 0) {
    const missingSkills = analysis.missing_skills.from_resume_for_job_description;
    suggestions.push(`Add these missing keywords: ${missingSkills.slice(0, 5).join(', ')}${missingSkills.length > 5 ? '...' : ''}`);
  }
  
  // Check for ATS score
  if (analysis?.compatibility_score < 50) {
    suggestions.push('Your ATS score is low. Consider adding more relevant keywords from the job description.');
  } else if (analysis?.compatibility_score < 70) {
    suggestions.push('Good start! Add more keywords and quantify your achievements to improve your score.');
  } else if (analysis?.compatibility_score >= 70) {
    suggestions.push('Great ATS score! Review bullet point improvements for further optimization.');
  }
  
  // Check for bullet improvements
  if (analysis?.ats_optimized_bullet_point_improvements?.length > 0) {
    suggestions.push('Review the suggested bullet point improvements to make your achievements more impactful.');
  }
  
  // General suggestions based on keywords
  const uniqueJD = [...new Set(jdKeywords)];
  const matchRate = resumeKeywords.length / uniqueJD.length;
  
  if (matchRate < 0.3) {
    suggestions.push('Low keyword match. Carefully review the job description and incorporate more relevant terms.');
  }
  
  // Action verb suggestions
  suggestions.push('Use strong action verbs (developed, implemented, led, optimized) to describe your achievements.');
  
  // Quantification suggestion
  suggestions.push('Quantify your achievements with numbers (e.g., "increased efficiency by 40%").');
  
  // Format suggestion
  suggestions.push('Ensure consistent formatting - use standard section headers (Experience, Education, Skills).');
  
  return suggestions;
};

/**
 * Get keyword suggestions for a job description
 * @param {Array} jdKeywords - Keywords from job description
 * @returns {Array} Suggested keywords to add
 */
export const getKeywordSuggestions = (jdKeywords) => {
  const suggestions = [];
  const lowerJD = jdKeywords.map(k => k.toLowerCase());
  
  // Check each category
  for (const [category, keywords] of Object.entries(KEYWORD_CATEGORIES)) {
    const matching = keywords.filter(k => lowerJD.includes(k.toLowerCase()));
    if (matching.length > 0) {
      suggestions.push({
        category,
        found: matching
      });
    }
  }
  
  return suggestions;
};

/**
 * Analyze resume format and provide suggestions
 * @param {String} resumeText - Raw resume text
 * @returns {Array} Format suggestions
 */
export const analyzeFormat = (resumeText) => {
  const suggestions = [];
  const lowerText = resumeText.toLowerCase();
  
  // Check for required sections
  const sections = {
    'experience': /\b(experience|work history|employment)\b/,
    'education': /\b(education|degree|certification)\b/,
    'skills': /\b(skills|technical|competencies)\b/
  };
  
  for (const [section, regex] of Object.entries(sections)) {
    if (!regex.test(lowerText)) {
      suggestions.push(`Consider adding a ${section} section.`);
    }
  }
  
  // Check for contact info
  const hasEmail = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(resumeText);
  const hasPhone = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/.test(resumeText);
  
  if (!hasEmail) suggestions.push('Add your email address.');
  if (!hasPhone) suggestions.push('Add a phone number.');
  
  // Check length
  const wordCount = resumeText.split(/\s+/).length;
  if (wordCount < 100) {
    suggestions.push('Resume may be too short. Consider adding more detail about your experience.');
  } else if (wordCount > 1000) {
    suggestions.push('Resume may be too long. Consider condensing to 1-2 pages.');
  }
  
  return suggestions;
};