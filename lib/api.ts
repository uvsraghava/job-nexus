import axios from 'axios';

const api = axios.create({
  baseURL: 'https://job-nexus-f3ub.onrender.com/api', // <--- MUST SAY LOCALHOST:5001
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers['x-auth-token'] = token;
  }
  return config;
});

export default api;