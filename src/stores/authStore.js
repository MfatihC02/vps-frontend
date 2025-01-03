import { defineStore } from 'pinia';
import { useUserStore } from './userStore';
import api from '@/services/axiosInstance';

let tokenRefreshTimeout = null;

export const useAuthStore = defineStore('auth', {
    state: () => ({
        isAuthenticated: false,
        loading: false,
        error: null,
        tokenExpiry: null,
        refreshTokenExpiry: null,
        initialCheckDone: false
    }),

    getters: {
        hasError: (state) => !!state.error,
        isLoading: (state) => state.loading
    },

    actions: {
        stopTokenRefreshTimer() {
            // Aktif bir token yenileme zamanlayıcısı varsa iptal eder
            if (tokenRefreshTimeout) {
                clearTimeout(tokenRefreshTimeout);
                tokenRefreshTimeout = null;
            }
        },

        resetState() {
            this.isAuthenticated = false;
            this.loading = false;
            this.error = null;
            this.tokenExpiry = null;
            this.refreshTokenExpiry = null;
        },

        scheduleTokenRefresh() {
            // Önce var olan zamanlayıcıyı durdur
            this.stopTokenRefreshTimer();

            if (!this.tokenExpiry) return;

            const now = Date.now();
            const timeUntilExpiry = this.tokenExpiry - now;

            // Token süresinin dolmasına 1 dakika kala yenileme planı yap
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
                            this.scheduleTokenRefresh();  // Yeniden yenileme planı yap
                        }
                    } catch (error) {
                        console.error("Token yenileme hatası:", error);
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

            // Oturumun bittiği için kullanıcıyı login sayfasına yönlendir
            const router = useRouter();
            if (router.currentRoute.value.name !== 'login') {
                router.push({
                    name: 'login',
                    query: {
                        message: 'Oturumunuz sonlanmıştır. Lütfen tekrar giriş yapın.'
                    }
                });
            }
        },

        async register({ username, email, password }) {
            if (this.loading) return;

            this.loading = true;
            this.error = null;

            try {
                const response = await api.post('/auth/register', {
                    username,
                    email,
                    password
                });

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
                throw error;
            } finally {
                this.loading = false;
            }
        },
        async logout() {
            if (this.loading) return;

            this.loading = true;
            this.error = null;

            try {
                if (this.isAuthenticated) {
                    await api.post('/auth/logout');
                }
            } catch (error) {
                console.error("Logout error:", error);
            } finally {
                // Merkezi hata yönetimi için clearState çağrısı
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

                    // Token yenilemeyi başlat
                    this.scheduleTokenRefresh();
                }
            } catch (error) {
                console.log("Auth kontrolü başarısız:", error);
                this.resetState();
            } finally {
                // Burada initialCheckDone bayrağını güncelliyoruz
                this.initialCheckDone = true;
                this.loading = false;
            }
        },
    }
});