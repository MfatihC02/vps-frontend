import { defineStore } from 'pinia';
import api from '@/services/axiosInstance';
import { useCartStore } from './cartStore';
import { useToast } from 'vue-toastification';
import { ref, computed } from 'vue';

export const useCouponStore = defineStore('coupon', {
    state: () => ({
        availableCoupons: [],
        loading: false,
        error: null,
        couponDetails: null,
        appliedCoupon: null,
        discountAmount: 0,

        // Admin kısmı için
        adminCoupons: [],
        adminCouponDetails: null,
        pagination: {
            total: 0,
            page: 1,
            totalPages: 1,
            limit: 10
        },
        adminLoading: false,
        adminError: null
    }),

    getters: {
        hasCoupon: (state) => !!state.appliedCoupon,

        // İndirim ve orijinal tutar bilgileri
        discount: (state) => state.discountAmount || 0,

        // Admin kısmı için getterlar
        isAdminLoading: (state) => state.adminLoading,
        adminErrorMessage: (state) => state.adminError,

        // Kullanıcı kısmı için
        isLoading: (state) => state.loading,
        errorMessage: (state) => state.error,

        getCouponByCode: (state) => {
            return (code) => state.availableCoupons.find((coupon) => coupon.code === code);
        }
    },

    actions: {
        // Kullanıcı: Kullanılabilir kuponları getir
        async fetchAvailableCoupons() {
            this.loading = true;
            this.error = null;

            try {
                const response = await api.get('/coupons/available');
                if (response.data.success) {
                    this.availableCoupons = response.data.data.coupons;
                } else {
                    this.error = 'Kuponlar alınamadı';
                }
            } catch (error) {
                console.error('Kuponları getirme hatası:', error);
                this.error = error.response?.data?.message || 'Kuponlar alınamadı';
            } finally {
                this.loading = false;
            }
        },

        // Kullanıcı: Kupon doğrulama
        async validateCoupon(couponCode) {
            this.loading = true;
            this.error = null;

            try {
                const response = await api.post('/coupons/validate', { couponCode });
                if (response.data.success) {
                    this.couponDetails = response.data.data.coupon;
                    return {
                        valid: true,
                        coupon: response.data.data.coupon,
                        discount: response.data.data.cart.discountAmount,
                        originalTotal: response.data.data.cart.originalTotal,
                        finalTotal: response.data.data.cart.finalTotal
                    };
                } else {
                    this.error = response.data.message || 'Kupon geçerli değil';
                    return { valid: false, message: this.error };
                }
            } catch (error) {
                console.error('Kupon doğrulama hatası:', error);
                this.error = error.response?.data?.message || 'Kupon doğrulanamadı';
                return { valid: false, message: this.error };
            } finally {
                this.loading = false;
            }
        },

        // Kullanıcı: Kuponu sepete uygula
        async applyCouponToCart(couponCode) {
            const toast = useToast();
            const cartStore = useCartStore();

            this.loading = true;
            this.error = null;

            try {
                console.log('Kupon uygulanıyor:', couponCode);
                const response = await api.post('/cart/apply-coupon', { couponCode });

                console.log('Kupon uygulama yanıtı:', {
                    success: response.data.success,
                    message: response.data.message,
                    data: response.data.data
                });

                if (response.data.success) {
                    // API'den gelen verileri kullanarak state'i güncelle
                    this.appliedCoupon = response.data.data.coupon?.code || couponCode;
                    this.discountAmount = response.data.data.discount?.amount || 0;
                    this.couponDetails = response.data.data.coupon || null;

                    console.log('Kupon uygulandı, state güncellendi:', {
                        appliedCoupon: this.appliedCoupon,
                        discountAmount: this.discountAmount,
                        couponDetails: this.couponDetails
                    });

                    // Cart store'u güncelle
                    cartStore.updateCartWithCoupon(
                        response.data.data.cart,
                        response.data.data.discount
                    );

                    console.log('Kupon uygulandı, güncel durum:', {
                        appliedCoupon: this.appliedCoupon,
                        discountAmount: this.discountAmount,
                        cartCoupon: cartStore.cart?.coupon,
                        cartDiscountAmount: cartStore.cart?.discountAmount
                    });

                    return {
                        success: true,
                        data: response.data.data,
                        message: response.data.message || 'Kupon başarıyla uygulandı'
                    };
                } else {
                    console.warn('Kupon uygulanamadı:', response.data.message);
                    this.error = response.data.message || 'Kupon uygulanamadı';
                    return { success: false, message: this.error };
                }
            } catch (error) {
                console.error('Kupon uygulama hatası:', error);
                this.error = error.response?.data?.message || 'Kupon uygulanırken bir hata oluştu';
                return { success: false, message: this.error };
            } finally {
                this.loading = false;
            }
        },

        // Kullanıcı: Kuponu sepetten kaldır
        async removeCouponFromCart() {
            const toast = useToast();
            const cartStore = useCartStore();

            this.loading = true;
            this.error = null;

            try {
                console.log('Kupon kaldırılıyor');
                const response = await api.delete('/coupons/remove');

                console.log('Kupon kaldırma yanıtı:', {
                    success: response.data.success,
                    message: response.data.message,
                    data: response.data.data
                });

                if (response.data.success) {
                    // State'i temizle
                    this.appliedCoupon = null;
                    this.discountAmount = 0;
                    this.couponDetails = null;

                    // Cart store'u güncelle
                    cartStore.updateCart(response.data.data);

                    console.log('Kupon kaldırıldı, güncel durum:', {
                        appliedCoupon: this.appliedCoupon,
                        discountAmount: this.discountAmount,
                        cartCoupon: cartStore.cart?.coupon,
                        cartDiscountAmount: cartStore.cart?.discountAmount
                    });

                    return {
                        success: true,
                        message: response.data.message || 'Kupon kaldırıldı'
                    };
                } else {
                    console.warn('Kupon kaldırılamadı:', response.data.message);
                    this.error = response.data.message || 'Kupon kaldırılamadı';
                    return { success: false, message: this.error };
                }
            } catch (error) {
                console.error('Kupon kaldırma hatası:', error);
                this.error = error.response?.data?.message || 'Kupon kaldırılırken bir hata oluştu';
                return { success: false, message: this.error };
            } finally {
                this.loading = false;
            }
        },

        // Admin: Kuponları listele
        async fetchAdminCoupons(options = {}) {
            this.adminLoading = true;
            this.adminError = null;

            const { page = 1, limit = 10, status } = options;
            let url = `/coupons/admin?page=${page}&limit=${limit}`;

            if (status) {
                url += `&status=${status}`;
            }

            try {
                const response = await api.get(url);

                if (response.data.success) {
                    this.adminCoupons = response.data.data.coupons;
                    this.pagination = response.data.data.pagination;
                } else {
                    this.adminError = response.data.message || 'Kuponlar alınamadı';
                }
            } catch (error) {
                console.error('Kuponları listeleme hatası:', error);
                this.adminError = error.response?.data?.message || 'Kuponlar listelenirken bir hata oluştu';
            } finally {
                this.adminLoading = false;
            }
        },

        // Admin: Kupon oluştur
        async createCoupon(couponData) {
            const toast = useToast();
            this.adminLoading = true;
            this.adminError = null;

            try {
                const response = await api.post('/coupons/admin', couponData);

                if (response.data.success) {
                    toast.success('Kupon başarıyla oluşturuldu');
                    return response.data.data;
                } else {
                    this.adminError = response.data.message || 'Kupon oluşturulamadı';
                    toast.error(this.adminError);
                    return null;
                }
            } catch (error) {
                console.error('Kupon oluşturma hatası:', error);
                this.adminError = error.response?.data?.message || 'Kupon oluşturulurken bir hata oluştu';
                toast.error(this.adminError);
                return null;
            } finally {
                this.adminLoading = false;
            }
        },

        // Admin: Kupon detaylarını getir
        async fetchAdminCouponDetails(couponId) {
            this.adminLoading = true;
            this.adminError = null;

            try {
                const response = await api.get(`/coupons/admin/${couponId}`);

                if (response.data.success) {
                    this.adminCouponDetails = response.data.data;
                    return response.data.data;
                } else {
                    this.adminError = response.data.message || 'Kupon detayları alınamadı';
                    return null;
                }
            } catch (error) {
                console.error('Kupon detayları hatası:', error);
                this.adminError = error.response?.data?.message || 'Kupon detayları alınırken bir hata oluştu';
                return null;
            } finally {
                this.adminLoading = false;
            }
        },

        // Admin: Kupon güncelle
        async updateCoupon(couponId, couponData) {
            const toast = useToast();
            this.adminLoading = true;
            this.adminError = null;

            try {
                const response = await api.put(`/coupons/admin/${couponId}`, couponData);

                if (response.data.success) {
                    toast.success('Kupon başarıyla güncellendi');
                    return response.data.data;
                } else {
                    this.adminError = response.data.message || 'Kupon güncellenemedi';
                    toast.error(this.adminError);
                    return null;
                }
            } catch (error) {
                console.error('Kupon güncelleme hatası:', error);
                this.adminError = error.response?.data?.message || 'Kupon güncellenirken bir hata oluştu';
                toast.error(this.adminError);
                return null;
            } finally {
                this.adminLoading = false;
            }
        },

        // Admin: Kupon sil
        async deleteCoupon(couponId) {
            const toast = useToast();
            this.adminLoading = true;
            this.adminError = null;

            try {
                const response = await api.delete(`/coupons/admin/${couponId}`);

                if (response.data.success) {
                    toast.success('Kupon başarıyla silindi');
                    // Kupon listesini güncelle
                    this.adminCoupons = this.adminCoupons.filter(coupon => coupon._id !== couponId);
                    return true;
                } else {
                    this.adminError = response.data.message || 'Kupon silinemedi';
                    toast.error(this.adminError);
                    return false;
                }
            } catch (error) {
                console.error('Kupon silme hatası:', error);
                this.adminError = error.response?.data?.message || 'Kupon silinirken bir hata oluştu';
                toast.error(this.adminError);
                return false;
            } finally {
                this.adminLoading = false;
            }
        },

        // Admin: Kupon durumunu değiştir (aktif/pasif)
        async toggleCouponStatus(couponId) {
            const toast = useToast();
            this.adminLoading = true;
            this.adminError = null;

            try {
                const response = await api.patch(`/coupons/admin/${couponId}/toggle`);

                if (response.data.success) {
                    toast.success(response.data.message);

                    // Kupon listesinde durumu güncelle
                    const couponIndex = this.adminCoupons.findIndex(c => c._id === couponId);
                    if (couponIndex !== -1) {
                        this.adminCoupons[couponIndex].isActive = response.data.data.isActive;
                    }

                    return response.data.data;
                } else {
                    this.adminError = response.data.message || 'Kupon durumu değiştirilemedi';
                    toast.error(this.adminError);
                    return null;
                }
            } catch (error) {
                console.error('Kupon durumu değiştirme hatası:', error);
                this.adminError = error.response?.data?.message || 'Kupon durumu değiştirilirken bir hata oluştu';
                toast.error(this.adminError);
                return null;
            } finally {
                this.adminLoading = false;
            }
        },

        // Admin: Email ile kupon gönder
        async sendCouponByEmail(couponId, userIds) {
            const toast = useToast();
            this.adminLoading = true;
            this.adminError = null;

            try {
                const response = await api.post('/coupons/admin/send-email', {
                    couponId,
                    userIds
                });

                if (response.data.success) {
                    toast.success(`${response.data.data.sentCount} kullanıcıya kupon gönderildi`);
                    return response.data.data;
                } else {
                    this.adminError = response.data.message || 'Kupon e-postaları gönderilemedi';
                    toast.error(this.adminError);
                    return null;
                }
            } catch (error) {
                console.error('Kupon e-posta gönderme hatası:', error);
                this.adminError = error.response?.data?.message || 'Kupon e-postaları gönderilirken bir hata oluştu';
                toast.error(this.adminError);
                return null;
            } finally {
                this.adminLoading = false;
            }
        },

        // Sepet store'u ile entegrasyon - Bu metodu düzeltiyorum
        updateWithCartData(cartData) {
            try {
                if (!cartData) {
                    console.warn("CouponStore - updateWithCartData: cartData yok");
                    return;
                }

                console.log("CouponStore - updateWithCartData başlıyor", {
                    cartId: cartData._id,
                    hasCoupon: !!cartData.coupon,
                    discountAmount: cartData.discountAmount || 0,
                    totalAmount: cartData.totalAmount || 0,
                    discountedAmount: cartData.discountedTotalAmount || 0
                });

                if (cartData.coupon) {
                    this.appliedCoupon = cartData.coupon.code || null;
                    this.discountAmount = cartData.discountAmount || 0;
                    this.couponDetails = {
                        ...cartData.coupon,
                        discountAmount: cartData.discountAmount || 0,
                        originalTotal: cartData.totalAmount || 0,
                        finalTotal: cartData.discountedTotalAmount || cartData.totalAmount || 0
                    };

                    console.log("CouponStore - Kupon bilgileri güncellendi", {
                        appliedCoupon: this.appliedCoupon,
                        discountAmount: this.discountAmount,
                        couponDetails: this.couponDetails
                    });
                } else {
                    this.appliedCoupon = null;
                    this.discountAmount = 0;
                    this.couponDetails = null;

                    console.log("CouponStore - Kupon bilgileri temizlendi");
                }
            } catch (error) {
                console.error("CouponStore - updateWithCartData hatası:", error);
            }
        },

        // Store'u sıfırla
        resetState() {
            this.availableCoupons = [];
            this.loading = false;
            this.error = null;
            this.couponDetails = null;
            this.appliedCoupon = null;
            this.discountAmount = 0;

            // Admin kısmı
            this.adminCoupons = [];
            this.adminCouponDetails = null;
            this.pagination = {
                total: 0,
                page: 1,
                totalPages: 1,
                limit: 10
            };
            this.adminLoading = false;
            this.adminError = null;
        },

        async fetchCoupons() {
            try {
                this.loading = true;
                this.error = null;

                const response = await api.get("/coupons/user");

                if (response.data.success) {
                    this.availableCoupons = response.data.data;
                    return { success: true, data: response.data.data };
                } else {
                    this.error = response.data.message;
                    return { success: false, message: response.data.message };
                }
            } catch (err) {
                console.error("Kupon yükleme hatası:", err);
                this.error = err.message;
                return { success: false, message: err.message };
            } finally {
                this.loading = false;
            }
        }
    }
}); 