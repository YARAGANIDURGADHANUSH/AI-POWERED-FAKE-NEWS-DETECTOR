import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000'; // Update to your production URL later

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Automatically attach JWT token to every request if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const newsService = {
  // Fact Detector (Global)
  verifyGlobal: (claim) => api.post('/verify', { claim }),

  // Geo Analysis (Regional)
  verifyRegional: (claim, region) => api.post('/geo-verify', { claim, region }),

  // History / Bookmarks
  getHistory: () => api.get('/claims/history'),
  saveClaim: (claimData) => api.post('/claims/save', claimData),
};

export default api;
