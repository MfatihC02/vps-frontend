import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

const BASE_URL = 'https://backend.tarimsepetim.com.tr/api';

const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        'Accept': 'application/json',
    }
});

// Multipart form data için yardımcı fonksiyon
api.postForm = async (url, formData, config = {}) => {
    return api.post(url, formData, {
        ...config,
        headers: {
            ...config.headers,
            'Content-Type': 'multipart/form-data'
        }
    });
};

let failedQueue = [];
let isRefreshing = false;

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && originalRequest.url === '/auth/refresh-token') {
            processQueue(error, null);
            const authStore = useAuthStore();
            await authStore.logout();
            return Promise.reject(error);
        }

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !['/auth/login', '/auth/register'].includes(originalRequest.url)
        ) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(token => {
                        return api(originalRequest);
                    })
                    .catch(err => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const response = await api.post('/auth/refresh-token');
                if (response.data.success) {
                    processQueue(null, response.data);
                    const authStore = useAuthStore();
                    authStore.tokenExpiry = response.data.accessTokenExpiry;
                    authStore.refreshTokenExpiry = response.data.refreshTokenExpiry;
                     
                    // localStorage'a token bilgilerini yaz
                    localStorage.setItem('tokenExpiry', response.data.accessTokenExpiry);
                    localStorage.setItem('refreshTokenExpiry', response.data.refreshTokenExpiry);
                    localStorage.setItem('isAuthenticated', 'true');
                    
                    authStore.scheduleTokenRefresh();
                    isRefreshing = false;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                isRefreshing = false;
                processQueue(refreshError, null);
                const authStore = useAuthStore();
                await authStore.logout();
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
