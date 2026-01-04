import axios from 'axios';

// Create the axios instance (It is an OBJECT, not a function)
const api = axios.create({
  baseURL: 'https://job-nexus-f3ub.onrender.com/api', // Make sure this is 5001
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add the token to requests if it exists
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
  }
  return config;
});

export default api;