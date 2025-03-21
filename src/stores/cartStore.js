// stores/cartStore.js
import { defineStore } from 'pinia';
import api from '@/services/axiosInstance.js';
import { useToast } from 'vue-toastification';
import { useStockStore } from '@/stores/stockStore';
import { useCouponStore } from '@/stores/couponStore';

const toast = useToast();

export const useCartStore = defineStore('cart', {
    state: () => ({
        // Temel state değişkenleri - DOĞRUDAN PRİMİTİF DEĞERLER (ref() OLMADAN) TANIMLA
        items: [],
        totalAmount: 0,
        loading: false,
        error: null,
        checkoutStarted: false,
        cart: null,

        // Rezervasyon state'leri
        activeReservations: {},
        reservationStatus: {},
        reservationTimer: null,

        // Fiyatlandırma state'leri
        shippingFee: 200, // Sabit kargo ücreti
        coupon: null,
        discountAmount: 0,
        discountedTotalAmount: 0
    }),

    getters: {
        itemCount: (state) => state.items.length,
        hasItems: (state) => state.items.length > 0,
        totalItems: (state) => {
            return state.items.reduce((total, item) => total + item.quantity, 0);
        },
        cartItemCount: (state) => {
            return state.items.reduce((total, item) => total + item.quantity, 0);
        },
        isEmpty: (state) => state.items.length === 0,

        // Cart objesi getter'ı
        cartData: (state) => state.cart,

        // Rezervasyon getter'ları
        hasValidReservations: (state) => {
            return Object.values(state.reservationStatus).every(status => status.isValid);
        },
        getReservationStatus: (state) => (productId) => {
            return state.reservationStatus[productId] || { isValid: false, message: '' };
        },
        hasItemReservation: (state) => (productId) => {
            return !!state.activeReservations[productId];
        },
        getItemReservationTime: (state) => (productId) => {
            const reservation = state.activeReservations[productId];
            if (!reservation) return 0;

            const now = Date.now();
            const expiresAt = new Date(reservation.expiresAt).getTime();
            return Math.max(0, Math.floor((expiresAt - now) / 1000)); // Kalan süreyi saniye cinsinden döndür
        },

        // Ürün rezervasyon ID'sini güvenli bir şekilde getir
        getReservationId: (state) => (productId) => {
            const reservationInfo = state.reservationStatus[productId];
            console.log('Rezervasyon kontrolü:', {
                productId,
                reservationInfo,
                hasId: reservationInfo?.reservationId ? true : false
            });

            if (reservationInfo?.isValid && reservationInfo?.reservationId) {
                return reservationInfo.reservationId;
            }
            return null;
        },

        // Fiyatlandırma getter'ları
        subtotal: (state) => {
            return state.items.reduce((total, item) => {
                if (!item) return total;
                return total + (item.price * (item.quantity || 1));
            }, 0);
        },
        shipping: (state) => state.shippingFee,

        // Genel toplam (kargo dahil) - Bu kısmı düzeltiyorum
        grandTotal: (state) => {
            console.log("grandTotal hesaplanıyor:", {
                discountedTotalAmount: state.cart?.discountedTotalAmount,
                totalAmount: state.totalAmount,
                subtotal: state.subtotal,
                shippingFee: state.shippingFee
            });

            // Eğer indirimli toplam varsa onu kullan, yoksa normal toplamı kullan
            const baseAmount = state.cart?.discountedTotalAmount || state.totalAmount || state.subtotal;
            return baseAmount + state.shippingFee;
        },

        // Kupon uygulanmış mı kontrolü
        hasCoupon: (state) => !!state.coupon || !!state.cart?.coupon,

        // İndirim tutarı
        discountAmount: (state) => state.cart?.discountAmount || state.discountAmount || 0,

        // İndirimli toplam
        finalTotal: (state) => {
            const amount = state.cart?.discountedTotalAmount || state.discountedTotalAmount || state.totalAmount || 0;
            console.log("finalTotal hesaplanıyor:", {
                cartDiscountedTotal: state.cart?.discountedTotalAmount,
                stateDiscountedTotal: state.discountedTotalAmount,
                totalAmount: state.totalAmount,
                sonuç: amount
            });
            return amount;
        },

        // İndirim yüzdesi (görüntüleme için)
        discountPercentage: (state) => {
            const totalAmount = state.cart?.totalAmount || state.totalAmount || 0;
            const discountAmount = state.cart?.discountAmount || state.discountAmount || 0;

            if (!totalAmount || !discountAmount) return 0;
            return Math.round((discountAmount / totalAmount) * 100);
        }
    },

    actions: {
        // Sepeti yükle
        async fetchCart() {
            try {
                this.loading = true;
                this.error = null;

                const response = await api.get('/cart');

                console.log('Cart fetch yapılıyor:', {
                    responseSuccess: response?.data?.success,
                    cartData: response?.data?.data,
                    coupon: response?.data?.data?.coupon,
                    discountAmount: response?.data?.data?.discountAmount,
                    discountedTotal: response?.data?.data?.discountedTotalAmount
                });

                if (response.data.success) {
                    // Cart verisini saklayalım
                    this.cart = response.data.data;

                    // Mevcut items yapısını güncelleyelim
                    if (Array.isArray(this.cart.items)) {
                        this.items = this.cart.items.map(item => ({
                            product: {
                                _id: item.product._id,
                                name: item.product.name,
                                price: item.product.price,
                                images: item.product.images,
                                sku: item.product.sku,
                                stock: item.product.stock,
                                slug: item.product.slug,
                                productType: item.product.productType
                            },
                            quantity: item.quantity,
                            price: item.price,
                            unit: item.unit,
                            _id: item._id
                        }));
                    } else {
                        console.warn('Cart itemları dizi değil:', this.cart.items);
                        this.items = [];
                    }

                    // Toplam tutarı cart'tan al
                    this.totalAmount = this.cart.totalAmount || 0;

                    // Kupon bilgilerini güncelle - null ve 0 değerlerini açıkça belirt
                    this.coupon = this.cart.coupon || null;
                    this.discountAmount = this.cart.discountAmount || 0;
                    this.discountedTotalAmount = this.cart.discountedTotalAmount || this.totalAmount;

                    console.log('Cart verileri güncellendi:', {
                        totalAmount: this.totalAmount,
                        coupon: this.coupon,
                        discountAmount: this.discountAmount,
                        discountedTotalAmount: this.discountedTotalAmount
                    });

                    // Kupon store'u güncelle
                    this._updateCouponStore();

                    return this.cart;
                } else {
                    console.warn('Cart fetch başarısız:', response.data.message);
                    return null;
                }
            } catch (error) {
                console.error('Cart fetch error:', error);
                this.error = error.message;
                return null;
            } finally {
                this.loading = false;
            }
        },

        // CouponStore güncelleme işlemini ayrı bir metoda çıkaralım
        _updateCouponStore() {
            try {
                const couponStore = useCouponStore();
                if (couponStore && this.cart) {
                    couponStore.updateWithCartData(this.cart);
                    console.log("CouponStore güncellendi", {
                        appliedCoupon: couponStore.appliedCoupon,
                        discountAmount: couponStore.discountAmount
                    });
                }
            } catch (err) {
                console.error("CouponStore güncellenirken hata:", err);
            }
        },

        // Rezervasyon zamanlayıcısını başlat
        startReservationTimer() {
            // Önceki zamanlayıcıyı temizle
            if (this.reservationTimer) {
                clearInterval(this.reservationTimer);
            }

            // Her 5 dakikada bir rezervasyonları yenile
            this.reservationTimer = setInterval(async () => {
                if (this.hasItems) {
                    await this.refreshReservations();
                }
            }, 5 * 60 * 1000); // 5 dakika
        },

        // Rezervasyonları yenile
        async refreshReservations() {
            if (!this.hasItems) return false;

            try {
                const response = await api.post('/cart/reservations/refresh');
                console.log('Rezervasyon yanıtı:', response.data);

                if (response.data.success && response.data.data.items) {
                    const results = response.data.data.items;

                    results.forEach(result => {
                        this.reservationStatus[result.productId] = {
                            isValid: result.success,
                            message: result.message || '',
                            reservationId: result.reservationId
                        };
                        console.log(`Rezervasyon güncellendi - Ürün: ${result.productId}, ID: ${result.reservationId}`);
                    });

                    // Başarısız rezervasyonları kontrol et
                    const failedReservations = results.filter(r => !r.success);
                    if (failedReservations.length > 0) {
                        toast.warning('Bazı ürünlerin rezervasyonları güncellenemedi');
                        return false;
                    }

                    return true; // Tüm rezervasyonlar başarılı
                }
                return false;
            } catch (error) {
                console.error('Rezervasyon yenileme hatası:', error);
                toast.error('Rezervasyonlar yenilenirken bir hata oluştu');
                return false;
            }
        },

        // Sepet öğelerini doğrula
        async validateCartItems() {
            console.log('Sepet doğrulaması başlatılıyor...');

            if (!this.hasItems) {
                console.log('Sepet boş, doğrulama gerekmiyor');
                return {
                    success: true,
                    message: ''
                };
            }

            try {
                console.log('API doğrulaması yapılıyor...');
                const response = await api.post('/cart/validate');
                console.log('Doğrulama yanıtı:', response.data);

                if (response.data.success) {
                    const validationResults = response.data.data;

                    // Her ürün için rezervasyon durumunu güncelle
                    validationResults.items.forEach(result => {
                        this.reservationStatus[result.productId] = {
                            isValid: result.isValid,
                            message: result.message || ''
                        };
                    });

                    // Tüm ürünlerin geçerli olup olmadığını kontrol et
                    const allItemsValid = validationResults.items.every(item => item.isValid);

                    if (!allItemsValid) {
                        const invalidItems = validationResults.items
                            .filter(item => !item.isValid)
                            .map(item => item.message)
                            .join(', ');

                        return {
                            success: false,
                            message: `Bazı ürünler için stok problemi var: ${invalidItems}`
                        };
                    }

                    return {
                        success: true,
                        message: ''
                    };
                }

                return {
                    success: false,
                    message: response.data.message || 'Sepet doğrulaması başarısız oldu'
                };
            } catch (error) {
                console.error('Sepet doğrulama hatası:', error);
                return {
                    success: false,
                    message: error.response?.data?.message || error.message || 'Sepet doğrulanırken bir hata oluştu'
                };
            }
        },

        // Checkout başlat
        async startCheckout() {
            if (!this.hasItems) {
                toast.error('Sepetiniz boş');
                return false;
            }

            try {
                this.loading = true;
                this.error = null;

                // Önce sepeti doğrula
                const isValid = await this.validateCartItems();
                if (!isValid) {
                    toast.error('Sepetinizdeki bazı ürünler için stok problemi var');
                    return false;
                }

                // Checkout rezervasyonlarını oluştur
                const response = await api.post('/cart/checkout/start');

                if (response.data.success) {
                    const results = response.data.data;

                    // Rezervasyon durumlarını güncelle
                    results.items.forEach(result => {
                        this.reservationStatus[result.productId] = {
                            isValid: result.success,
                            message: result.message || '',
                            reservationId: result.reservationId
                        };
                    });

                    this.checkoutStarted = true;
                    return true;
                }

                return false;
            } catch (error) {
                console.error('Checkout başlatma hatası:', error);
                this.error = 'Checkout başlatılırken bir hata oluştu';
                toast.error(this.error);
                return false;
            } finally {
                this.loading = false;
            }
        },

        // Checkout başlat
        async startCheckoutProcess() {
            try {
                console.log('Checkout işlemi başlatılıyor...');
                console.log('Mevcut sepet durumu:', JSON.stringify(this.items, null, 2));

                // Mevcut sepet doğrulama
                console.log('Sepet doğrulaması yapılıyor...');
                const validationResult = await this.validateCartItems();
                console.log('Doğrulama sonucu:', validationResult);

                if (!validationResult.success) {
                    console.warn('Doğrulama başarısız:', validationResult.message);
                    return {
                        success: false,
                        message: validationResult.message
                    };
                }

                // Her ürün için checkout rezervasyonu oluştur
                console.log('Ürün rezervasyonları başlatılıyor...');
                for (const item of this.items) {
                    try {
                        const requestUrl = `/stocks/product/${item.product._id}/checkout-reservation`;
                        const requestData = { quantity: item.quantity };

                        console.log('Rezervasyon isteği gönderiliyor:', {
                            url: requestUrl,
                            data: requestData,
                            productDetails: {
                                id: item.product._id,
                                name: item.product.name
                            }
                        });

                        const response = await api.post(requestUrl, requestData);
                        console.log('Rezervasyon yanıtı:', {
                            status: response.status,
                            data: response.data,
                            headers: response.headers
                        });

                        if (!response.data.success) {
                            throw new Error(`${item.product.name} için rezervasyon oluşturulamadı: ${response.data.message}`);
                        }

                        // Rezervasyon bilgilerini güncelle
                        this.activeReservations[item.product._id] = {
                            ...this.activeReservations[item.product._id],
                            _id: response.data.data._id,
                            status: 'CHECKOUT',
                            expiresAt: response.data.data.expiresAt
                        };
                        console.log('Rezervasyon detayları:', {
                            productId: item.product._id,
                            reservationData: response.data.data,
                            storedReservation: this.activeReservations[item.product._id]
                        });
                    } catch (error) {
                        console.error('Ürün rezervasyon hatası:', {
                            product: {
                                id: item.product._id,
                                name: item.product.name
                            },
                            error: {
                                message: error.message,
                                response: error.response?.data,
                                status: error.response?.status,
                                config: error.config
                            }
                        });
                        throw error;
                    }
                }

                console.log('Tüm rezervasyonlar başarıyla tamamlandı');
                return {
                    success: true
                };
            } catch (error) {
                console.error('Checkout işlemi hatası:', error);
                console.error('Hata detayları:', {
                    message: error.message,
                    response: error.response?.data,
                    status: error.response?.status
                });
                return {
                    success: false,
                    message: error.response?.data?.message || error.message || 'Bir hata oluştu'
                };
            }
        },

        // Sepete ürün ekle
        async addToCart(product, quantity) {
            try {
                // Önce stok kontrolü yap
                const stockCheck = await api.get(`/stocks/reservations/${product._id}/availability?quantity=${quantity}`);

                if (!stockCheck.data.success || !stockCheck.data.data.isAvailable) {
                    this.error = `Üzgünüz, stok durumu: ${stockCheck.data.data.availableQuantity} adet`;
                    toast.error(this.error);
                    return false;
                }

                // Sepete ekle
                const response = await api.post('/cart', {
                    productId: product._id,
                    quantity
                });

                if (response.data.success) {
                    // Sepete ekleme başarılı, rezervasyon oluştur
                    await this.createItemReservation(product._id, quantity);

                    // Tüm sepet verilerini güncelle
                    this.items = response.data.data.items;
                    this.totalAmount = response.data.data.totalAmount;

                    return true;
                }
                return false;
            } catch (error) {
                console.error('Sepete ekleme hatası:', error);
                this.error = error.response?.data?.message || 'Ürün sepete eklenirken bir hata oluştu';
                toast.error(this.error);
                return false;
            }
        },

        // Sepetten ürün çıkar
        async removeFromCart(productId) {
            try {
                this.loading = true;
                this.error = null;

                const response = await api.delete(`/cart/${productId}`);

                if (response.data.success) {
                    this.items = this.items.filter(item => item.product._id !== productId);
                    this.calculateTotal();

                    // Rezervasyon durumunu temizle
                    delete this.reservationStatus[productId];

                    // Sepeti yeniden yükleyerek kupon bilgilerini güncelle
                    await this.fetchCart();
                }
            } catch (error) {
                console.error('Sepetten çıkarma hatası:', error);
                this.error = 'Ürün sepetten çıkarılırken bir hata oluştu';
                toast.error(this.error);
            } finally {
                this.loading = false;
            }
        },

        // Sepeti temizle
        async clearCart() {
            try {
                this.loading = true;
                this.error = null;

                const response = await api.delete('/cart');

                if (response.data.success) {
                    this.items = [];
                    this.totalAmount = 0;
                    this.reservationStatus = {};
                    this.activeReservations = {};
                    this.coupon = null;
                    this.discountAmount = 0;
                    this.discountedTotalAmount = 0;
                    toast.success('Sepet temizlendi');
                }
            } catch (error) {
                console.error('Sepet temizleme hatası:', error);
                this.error = 'Sepet temizlenirken bir hata oluştu';
                toast.error(this.error);
            } finally {
                this.loading = false;
            }
        },

        // Miktar güncelle
        async updateCartItemQuantity(productId, newQuantity) {
            try {
                this.loading = true;
                this.error = null;

                // Mevcut rezervasyon durumunu kontrol et
                const currentReservation = this.activeReservations[productId];
                if (currentReservation) {
                    // Rezervasyon durumunu güncelle
                    this.reservationStatus[productId] = {
                        isValid: false,
                        message: 'Rezervasyon güncelleniyor...'
                    };
                }

                // API isteği
                const response = await api.put(`/cart/${productId}`, {
                    quantity: newQuantity
                });

                if (response.data.success) {
                    // Sepet verilerini güncelle
                    this.items = response.data.data.items;

                    // Rezervasyon durumunu güncelle
                    if (response.data.data.items.find(item => item.product._id === productId)) {
                        this.reservationStatus[productId] = {
                            isValid: true,
                            message: 'Rezervasyon güncellendi'
                        };
                    } else {
                        // Ürün sepetten çıkarıldıysa rezervasyonu temizle
                        delete this.reservationStatus[productId];
                        delete this.activeReservations[productId];
                    }

                    // Toplam tutarı güncelle
                    this.calculateTotal();

                    toast.success(response.data.message || 'Ürün miktarı güncellendi');

                    // Kupon uygulanmışsa, sepeti yeniden yükleyerek indirim bilgilerini güncelle
                    if (this.cart?.coupon) {
                        await this.fetchCart();
                    }

                    // Rezervasyon zamanlayıcısını yeniden başlat
                    this.startReservationTimer();
                } else {
                    throw new Error(response.data.message || 'Miktar güncellenemedi');
                }
            } catch (error) {
                console.error('Update quantity error:', error);
                this.error = error.response?.data?.message || error.message || 'Miktar güncellenemedi';

                // Hata durumunda rezervasyon durumunu güncelle
                this.reservationStatus[productId] = {
                    isValid: false,
                    message: error.response?.data?.message || 'Rezervasyon hatası'
                };

                // Kullanılabilir stok bilgisini göster
                if (error.response?.data?.availableQuantity !== undefined) {
                    toast.error(`Yetersiz stok. Mevcut stok: ${error.response.data.availableQuantity}`);
                } else {
                    toast.error(this.error);
                }

                // Sepeti yeniden yükle
                await this.fetchCart();
            } finally {
                this.loading = false;
            }
        },

        // Ürün rezervasyonu oluştur
        async createItemReservation(productId, quantity) {
            try {
                const response = await api.post(`/stocks/product/${productId}/cart-reservation`, {
                    quantity
                });

                if (response.data.success) {
                    const reservation = response.data.data;
                    this.activeReservations[productId] = reservation;
                    this.reservationStatus[productId] = {
                        isValid: true,
                        message: 'Ürün rezerve edildi'
                    };
                    return true;
                }
                return false;
            } catch (error) {
                console.error('Rezervasyon oluşturma hatası:', error);
                this.error = 'Ürün rezerve edilirken bir hata oluştu';
                toast.error(this.error);
                return false;
            }
        },

        // Rezervasyonu iptal et
        async cancelReservation(productId) {
            const reservation = this.reservationStatus[productId];
            if (!reservation || !reservation.reservationId) return;

            try {
                const response = await api.post(`/stocks/reservations/${reservation.reservationId}/cancel`);

                if (response.data.success) {
                    delete this.reservationStatus[productId];
                    delete this.activeReservations[productId];
                }
            } catch (error) {
                console.error('Rezervasyon iptal hatası:', error);
                toast.error('Rezervasyon iptal edilirken bir hata oluştu');
            }
        },

        // Toplam tutarı hesapla
        calculateTotal() {
            // Sadece ürünlerin toplamını hesapla ve totalAmount'a ata
            this.totalAmount = this.items.reduce((total, item) => {
                if (!item) return total;
                return total + (item.price * (item.quantity || 1));
            }, 0);

            // Toplam tutarı yuvarla
            this.totalAmount = Math.round(this.totalAmount * 100) / 100;
        },

        // Component destroyed olduğunda
        cleanup() {
            if (this.reservationTimer) {
                clearInterval(this.reservationTimer);
                this.reservationTimer = null;
            }
        },

        // Sepeti kupon bilgisiyle güncelle
        updateCartWithCoupon(cartData, discountData) {
            if (!cartData) return;

            this.cart = cartData; // Tam cart nesnesini güncelle

            // Güvenli atama
            if (Array.isArray(cartData.items)) {
                this.items = cartData.items.map(item => ({
                    product: {
                        _id: item.product._id,
                        name: item.product.name,
                        price: item.product.price,
                        images: item.product.images || [],
                        sku: item.product.sku,
                        stock: item.product.stock || 0,
                        slug: item.product.slug || '',
                        productType: item.product.productType || 'default'
                    },
                    quantity: item.quantity,
                    price: item.price,
                    unit: item.unit || 'adet',
                    _id: item._id
                }));
            }

            this.totalAmount = cartData.totalAmount || 0;
            this.coupon = cartData.coupon || null;
            this.discountAmount = cartData.discountAmount || 0;
            this.discountedTotalAmount = cartData.discountedTotalAmount || this.totalAmount;

            console.log('CartStore kupon ile güncellendi:', {
                items: this.items.length,
                totalAmount: this.totalAmount,
                coupon: this.coupon,
                discountAmount: this.discountAmount,
                discountedTotalAmount: this.discountedTotalAmount
            });
        },

        // Sepet verisini güncelle
        updateCart(cartData) {
            if (!cartData) return;

            this.cart = cartData;

            // Güvenli atama
            if (Array.isArray(cartData.items)) {
                this.items = cartData.items.map(item => ({
                    product: {
                        _id: item.product._id,
                        name: item.product.name,
                        price: item.product.price,
                        images: item.product.images || [],
                        sku: item.product.sku,
                        stock: item.product.stock || 0,
                        slug: item.product.slug || '',
                        productType: item.product.productType || 'default'
                    },
                    quantity: item.quantity,
                    price: item.price,
                    unit: item.unit || 'adet',
                    _id: item._id
                }));
            } else {
                this.items = [];
            }

            this.totalAmount = cartData.totalAmount || 0;

            // Kupon bilgilerini güncelle veya temizle
            this.coupon = cartData.coupon || null;
            this.discountAmount = cartData.discountAmount || 0;
            this.discountedTotalAmount = cartData.discountedTotalAmount || this.totalAmount;

            console.log('CartStore güncellendi:', {
                items: this.items.length,
                totalAmount: this.totalAmount,
                coupon: this.coupon,
                discountAmount: this.discountAmount,
                discountedTotalAmount: this.discountedTotalAmount
            });
        },

        // Reset fonksiyonuna kupon alanlarını da ekle
        resetState() {
            this.items = [];
            this.totalAmount = 0;
            this.loading = false;
            this.error = null;
            this.checkoutStarted = false;
            this.cart = null;
            this.activeReservations = {};
            this.reservationStatus = {};
            this.reservationTimer = null;
            this.coupon = null;
            this.discountAmount = 0;
            this.discountedTotalAmount = 0;
        }
    }
});