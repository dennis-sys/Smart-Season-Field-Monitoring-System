import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000'
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sb-access-token');
    const userId = localStorage.getItem('sb-user-id');
    const userRole = localStorage.getItem('sb-user-role');
    
    console.log('Sending request with token:', token ? 'Present' : 'Missing');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (userId) {
      config.headers['X-User-Id'] = userId;
    }
    if (userRole) {
      config.headers['X-User-Role'] = userRole;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Authentication failed - clearing storage');
      localStorage.removeItem('sb-access-token');
      localStorage.removeItem('sb-user-id');
      localStorage.removeItem('sb-user-role');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;