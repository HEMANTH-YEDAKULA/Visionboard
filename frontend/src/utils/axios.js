import axios from 'axios';

const explicitBaseUrl = import.meta.env.VITE_API_URL?.trim();

const API = axios.create({
  baseURL: explicitBaseUrl ? `${explicitBaseUrl}/api` : '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      window.dispatchEvent(new Event('visionboard:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default API;
