import axios from 'axios';
import { storage } from '../utils/storage';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // 10 second timeout — prevents hanging requests from looking like auth failures
  timeout: 10000,
});

// Attach token to every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Track if we already triggered a logout to avoid double-redirect
let isLoggingOut = false;

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // No response = network error / server down — NEVER log out for this
    if (!error.response) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const detail: string = error.response?.data?.detail || '';

    // Only log out when the backend explicitly says the TOKEN itself is bad/expired.
    // DB errors (503), permission errors (403), not-found (404) etc. must NOT log out.
    const isRealTokenError =
      status === 401 &&
      (detail.includes('Token expired') ||
       detail.includes('Invalid token') ||
       detail.includes('please log in again'));

    if (isRealTokenError && !isLoggingOut) {
      isLoggingOut = true;
      storage.clear();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
