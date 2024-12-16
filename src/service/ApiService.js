import axios from 'axios';
import { useCookies } from 'vue3-cookies';
const { cookies } = useCookies();
const apiClient = axios.create({
  baseURL: 'https://localhost:7246/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = cookies.get('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default {
  get(url, params = {}) {
    return apiClient.get(url, { params });
  },
  post(url, params) {
    const formData = new FormData();

    // Check if params is an object and populate FormData
    if (params && typeof params === 'object') {
      Object.entries(params).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }
    return apiClient.post(url, params);
  },
  put(url, params = {}) {
    return apiClient.put(url, { params });
  },
  delete(url, params = {}) {
    return apiClient.delete(url, { params });
  },
};
