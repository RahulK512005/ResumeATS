// API Configuration
// This file centralizes all API calls to the backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGIN: `${API_BASE_URL}/auth/login`,
  },
  RESUME: {
    UPLOAD: `${API_BASE_URL}/resume/upload`,
    ANALYZE: `${API_BASE_URL}/resume/analyze`,
    LIST: `${API_BASE_URL}/resume`,
    GET_BY_ID: (id) => `${API_BASE_URL}/resume/${id}`,
    DELETE: (id) => `${API_BASE_URL}/resume/${id}`,
  }
};

export default API_BASE_URL;
