import { defineStore } from 'pinia';
import { useUserStore } from './userStore';
import api from '@/services/axiosInstance';

let tokenRefreshTimeout = null;

export const useAuthStore = defineStore('auth', {
    state: () => ({
        isAuthenticated: false,
        loading: false,
        error: null,
        refreshError: null,
        tokenExpiry: null,
        refreshTokenExpiry: null,
        initialCheckDone: false // Initial check state'i
    }),

    getters: {
        hasError: (state) => !!state.error,
        isLoading: (state) => state.loading
    },

    actions: {
        stopTokenRefreshTimer() {
            if (tokenRefreshTimeout) {
                clearTimeout(tokenRefreshTimeout);
                tokenRefreshTimeout = null;
            }
        },

        resetState() {
            this.isAuthenticated = false;
            this.loading = false;
            this.error = null;
            this.refreshError = null;
            this.tokenExpiry = null;
            this.refreshTokenExpiry = null;
        },

        scheduleTokenRefresh() {
            this.stopTokenRefreshTimer();

            if (!this.tokenExpiry) return;

            const now = Date.now();
            const timeUntilExpiry = this.tokenExpiry - now;
            const refreshTime = timeUntilExpiry - (60 * 1000);

            if (refreshTime > 0) {
                console.log(`Token yenileme planlandı: ${Math.floor(refreshTime / 1000)} saniye sonra`);
                tokenRefreshTimeout = setTimeout(async () => {
                    if (!this.isAuthenticated) return;

                    try {
                        const response = await api.post('/auth/refresh-token');
                        if (response.data.success) {
                            this.tokenExpiry = response.data.accessTokenExpiry;
                            this.refreshTokenExpiry = response.data.refreshTokenExpiry;
                            this.scheduleTokenRefresh();
                        }
                    } catch (error) {
                        console.error("Token yenileme hatası:", error.response?.data?.message || error.message);
                        this.refreshError = error.response?.data?.message || 'Token yenileme başarısız oldu';
                        await this.handleAuthError();
                    }
                }, refreshTime);
            }
        },

        async handleAuthError() {
            this.stopTokenRefreshTimer();
            this.resetState();
            const userStore = useUserStore();
            userStore.clearState();

            const router = useRouter();
            if (router.currentRoute.value.name !== 'login') {
                console.log("Oturum sonlandı, login sayfasına yönlendiriliyor...");
                router.push({
                    name: 'login',
                    query: { message: 'Oturumunuz sonlanmıştır. Lütfen tekrar giriş yapın.' }
                });
            } else {
                // Login sayfasındaysak, yönlendirme yapma, sadece state'i sıfırla
                console.log("Zaten login sayfasındayız, yönlendirme yapılmadı.");
            }
        },

        async register({ username, email, password }) {
            if (this.loading) return;

            this.loading = true;
            this.error = null;

            try {
                const response = await api.post('/auth/register', { username, email, password });
                if (response.data.success) {
                    this.isAuthenticated = true;
                    this.tokenExpiry = response.data.accessTokenExpiry;
                    this.refreshTokenExpiry = response.data.refreshTokenExpiry;

                    const userStore = useUserStore();
                    await userStore.fetchProfile();

                    this.scheduleTokenRefresh();
                }
                return response.data;
            } catch (error) {
                this.error = error.response?.data?.message || 'Kayıt işlemi başarısız oldu';
                console.log("Register error:", this.error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async login({ email, password }) {
            if (this.loading) return;

            this.loading = true;
            this.error = null;

            try {
                const response = await api.post('/auth/login', { email, password });
                if (response.data.success) {
                    this.isAuthenticated = true;
                    this.tokenExpiry = response.data.accessTokenExpiry;
                    this.refreshTokenExpiry = response.data.refreshTokenExpiry;

                    const userStore = useUserStore();
                    await userStore.fetchProfile();

                    this.scheduleTokenRefresh();
                }
                return response.data;
            } catch (error) {
                this.error = error.response?.data?.message || 'Giriş işlemi başarısız oldu';
                console.log("Login error:", this.error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async logout() {
            if (this.loading) return;

            this.loading = true;
            this.error = null;
            this.refreshError = null;

            try {
                if (this.isAuthenticated) {
                    await api.post('/auth/logout');
                }
            } catch (error) {
                console.error("Logout error:", error);
            } finally {
                const userStore = useUserStore();
                userStore.clearState();
                this.resetState();
                this.loading = false;
            }
        },

        async checkAuth() {
            if (this.loading) return;

            this.loading = true;
            try {
                const response = await api.get('/auth/check');
                if (response.data.success) {
                    this.isAuthenticated = true;
                    this.tokenExpiry = response.data.accessTokenExpiry;
                    this.refreshTokenExpiry = response.data.refreshTokenExpiry;

                    const userStore = useUserStore();
                    await userStore.fetchProfile();

                    this.scheduleTokenRefresh();
                }
            } catch (error) {
                console.log("Auth kontrolü başarısız:", error);
                this.resetState();
            } finally {
                this.initialCheckDone = true; // Check tamamlandı
                this.loading = false;
            }
        },
    
    }
});