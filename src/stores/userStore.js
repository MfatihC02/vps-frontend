import { defineStore } from 'pinia';
import api from '@/services/axiosInstance';
import { useAuthStore } from './authStore';

export const useUserStore = defineStore('user', {
    state: () => ({
        user: null,
        loading: false,
        error: null
    }),

    getters: {
        userProfile: (state) => state.user,
        isLoading: (state) => state.loading,
        hasError: (state) => !!state.error,
        username: (state) => state.user?.username,
        email: (state) => state.user?.email,
        role: (state) => state.user?.role,
        isAdmin: (state) => state.user?.role === 'admin'
    },

    actions: {
        async fetchProfile() {
            this.loading = true;
            this.error = null;

            try {
                const response = await api.get('/users/profile');

                if (response.data.success) {
                    this.user = response.data.data;
                    return response.data;
                }

                throw new Error(response.data.message);
            } catch (error) {
                this.error = error.response?.data?.message || 'Profil bilgileri alınamadı';
                const authStore = useAuthStore();

                if (error.response?.status === 401) {
                    await authStore.handleAuthError();
                }
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async updateProfile(updateData) {
            this.loading = true;
            this.error = null;

            try {
                const response = await api.put('/users/profile', updateData);

                if (response.data.success) {
                    this.user = response.data.data;
                    return response.data;
                }

                throw new Error(response.data.message);
            } catch (error) {
                this.error = error.response?.data?.message || 'Profil güncellenemedi';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async changePassword(passwordData) {
            this.loading = true;
            this.error = null;

            try {
                const response = await api.put('/users/change-password', passwordData);

                if (!response.data.success) {
                    throw new Error(response.data.message);
                }

                return response.data;
            } catch (error) {
                this.error = error.response?.data?.message || 'Şifre değiştirilemedi';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Admin: Tüm kullanıcıları getir
        async getAllUsers() {
            this.loading = true;
            this.error = null;

            try {
                const response = await api.get('/users');

                if (response.data.success) {
                    return response.data.data;
                }

                throw new Error(response.data.message);
            } catch (error) {
                this.error = error.response?.data?.message || 'Kullanıcılar alınamadı';
                const authStore = useAuthStore();
                if (error.response?.status === 401) {
                    await authStore.handleAuthError();
                }
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Admin: Tek kullanıcı detayı
        async getUserById(userId) {
            this.loading = true;
            this.error = null;

            try {
                const response = await api.get(`/users/${userId}`);

                if (response.data.success) {
                    return response.data.data;
                }

                throw new Error(response.data.message);
            } catch (error) {
                this.error = error.response?.data?.message || 'Kullanıcı detayları alınamadı';
                const authStore = useAuthStore();
                if (error.response?.status === 401) {
                    await authStore.handleAuthError();
                }
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Admin: Kullanıcı sil
        async deleteUser(userId) {
            this.loading = true;
            this.error = null;

            try {
                const response = await api.delete(`/users/${userId}`);

                if (response.data.success) {
                    return response.data;
                }

                throw new Error(response.data.message);
            } catch (error) {
                this.error = error.response?.data?.message || 'Kullanıcı silinemedi';
                const authStore = useAuthStore();
                if (error.response?.status === 401) {
                    await authStore.handleAuthError();
                }
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Admin: Kullanıcı rolünü güncelle
        async updateUserRole(userId, role) {
            this.loading = true;
            this.error = null;

            try {
                const response = await api.put(`/users/${userId}/role`, { role });

                if (response.data.success) {
                    return response.data.data;
                }

                throw new Error(response.data.message);
            } catch (error) {
                this.error = error.response?.data?.message || 'Kullanıcı rolü güncellenemedi';
                const authStore = useAuthStore();
                if (error.response?.status === 401) {
                    await authStore.handleAuthError();
                }
                throw error;
            } finally {
                this.loading = false;
            }
        },

        clearState() {
            this.user = null;
            this.loading = false;
            this.error = null;
        }
    }
});
