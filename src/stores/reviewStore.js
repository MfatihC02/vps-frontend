import { defineStore } from 'pinia';
import api from '@/services/axiosInstance';

export const useReviewStore = defineStore('review', {
    state: () => ({
        productReviews: [],
        userReviews: [],
        allReviews: [], // Admin için
        loading: false,
        error: null
    }),

    getters: {
        getProductReviews: (state) => state.productReviews,
        getUserReviews: (state) => state.userReviews,
        getAllReviews: (state) => state.allReviews,
        isLoading: (state) => state.loading,
        getError: (state) => state.error
    },

    actions: {
        // Ürün yorumlarını getir
        async fetchProductReviews(productId) {
            try {
                this.loading = true;
                this.error = null;
                const response = await api.get(`/reviews/product/${productId}`);
                if (response.data.success) {
                    this.productReviews = response.data.data;
                }
                return response.data;
            } catch (error) {
                this.error = error.response?.data?.message || 'Yorumlar yüklenirken bir hata oluştu';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Kullanıcının kendi yorumlarını getir
        async fetchUserReviews() {
            try {
                this.loading = true;
                this.error = null;
                const response = await api.get('/reviews/user');
                if (response.data.success) {
                    this.userReviews = response.data.data;
                }
                return response.data;
            } catch (error) {
                this.error = error.response?.data?.message || 'Yorumlarınız yüklenirken bir hata oluştu';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Yeni yorum ekle
        async createReview(reviewData) {
            try {
                this.loading = true;
                this.error = null;
                const response = await api.post('/reviews', reviewData);
                if (response.data.success) {
                    // Yeni yorumu productReviews listesine ekle
                    this.productReviews.unshift(response.data.data);
                }
                return response.data;
            } catch (error) {
                this.error = error.response?.data?.message || 'Yorum eklenirken bir hata oluştu';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Yorum güncelle
        async updateReview(reviewId, reviewData) {
            try {
                this.loading = true;
                this.error = null;
                const response = await api.put(`/reviews/${reviewId}`, reviewData);
                if (response.data.success) {
                    // Güncellenmiş yorumu state'de güncelle
                    this.updateReviewInState(response.data.data);
                }
                return response.data;
            } catch (error) {
                this.error = error.response?.data?.message || 'Yorum güncellenirken bir hata oluştu';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Yorum sil
        async deleteReview(reviewId) {
            try {
                this.loading = true;
                this.error = null;
                const response = await api.delete(`/reviews/${reviewId}`);
                if (response.data.success) {
                    // Yorumu state'den kaldır
                    this.removeReviewFromState(reviewId);
                }
                return response.data;
            } catch (error) {
                this.error = error.response?.data?.message || 'Yorum silinirken bir hata oluştu';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Admin: Tüm yorumları getir
        async fetchAllReviews() {
            try {
                this.loading = true;
                this.error = null;
                const response = await api.get('/reviews/admin/all');
                if (response.data.success) {
                    this.allReviews = response.data.data;
                }
                return response.data;
            } catch (error) {
                this.error = error.response?.data?.message || 'Yorumlar yüklenirken bir hata oluştu';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Admin: Yorum sil
        async deleteReviewAdmin(reviewId) {
            try {
                this.loading = true;
                this.error = null;
                const response = await api.delete(`/reviews/admin/${reviewId}`);
                if (response.data.success) {
                    // Yorumu tüm listelerden kaldır
                    this.removeReviewFromState(reviewId);
                }
                return response.data;
            } catch (error) {
                this.error = error.response?.data?.message || 'Yorum silinirken bir hata oluştu';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Admin: Yorum güncelle
        async updateReviewAdmin(reviewId, reviewData) {
            try {
                this.loading = true;
                this.error = null;
                const response = await api.put(`/reviews/admin/${reviewId}`, reviewData);
                if (response.data.success) {
                    // Güncellenmiş yorumu state'de güncelle
                    this.updateReviewInState(response.data.data);
                }
                return response.data;
            } catch (error) {
                this.error = error.response?.data?.message || 'Yorum güncellenirken bir hata oluştu';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Yardımcı fonksiyonlar
        updateReviewInState(updatedReview) {
            // ProductReviews listesini güncelle
            const productIndex = this.productReviews.findIndex(r => r._id === updatedReview._id);
            if (productIndex !== -1) {
                this.productReviews[productIndex] = updatedReview;
            }

            // UserReviews listesini güncelle
            const userIndex = this.userReviews.findIndex(r => r._id === updatedReview._id);
            if (userIndex !== -1) {
                this.userReviews[userIndex] = updatedReview;
            }

            // AllReviews listesini güncelle (admin için)
            const adminIndex = this.allReviews.findIndex(r => r._id === updatedReview._id);
            if (adminIndex !== -1) {
                this.allReviews[adminIndex] = updatedReview;
            }
        },

        removeReviewFromState(reviewId) {
            this.productReviews = this.productReviews.filter(r => r._id !== reviewId);
            this.userReviews = this.userReviews.filter(r => r._id !== reviewId);
            this.allReviews = this.allReviews.filter(r => r._id !== reviewId);
        },

        // State'i temizle
        clearState() {
            this.productReviews = [];
            this.userReviews = [];
            this.allReviews = [];
            this.loading = false;
            this.error = null;
        }
    }
});
