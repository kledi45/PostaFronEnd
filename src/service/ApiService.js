import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'https://localhost:7246/api',
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
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
    post(url, data) {
        return apiClient.post(url, data);
    },
    put(url, data) {
        return apiClient.put(url, data);
    },
    delete(url) {
        return apiClient.delete(url);
    },
};
