// stores/cartStore.js
import { defineStore } from 'pinia';
import api from '@/services/axiosInstance.js';
import { useToast } from 'vue-toastification';

const toast = useToast();

export const useCartStore = defineStore('cart', {
    state: () => ({
        items: [],
        totalAmount: 0,
        loading: false,
        error: null,
        checkoutStarted: false,
        cart: null,
        // Yeni state alanları
        activeReservations: {},
        reservationStatus: {},
        reservationTimer: null
    }),

    getters: {
        itemCount: (state) => state.items.length,
        hasItems: (state) => state.items.length > 0,
        // Cart objesi getter'ı
        cartData: (state) => state.cart,
        // Yeni getter'lar
        hasValidReservations: (state) => {
            return Object.values(state.reservationStatus).every(status => status.isValid);
        },
        getReservationStatus: (state) => (productId) => {
            return state.reservationStatus[productId] || { isValid: false, message: '' };
        },
        // Yeni getter'lar
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
            const reservation = state.activeReservations[productId];
            console.log('Rezervasyon kontrolü:', {
                productId,
                reservation,
                hasId: reservation?._id ? true : false
            });
            if (reservation && 
                reservation.status === 'CHECKOUT' && 
                new Date(reservation.expiresAt) > new Date()) {
                return reservation._id;
            }
            return null;
        }
    },

    actions: {
        // Sepeti yükle
        async fetchCart() {
            try {
                this.loading = true;
                this.error = null;

                const response = await api.get('/cart');

                console.log('4. Cart fetch yapılıyor:', {
                    responseSuccess: response?.data?.success,
                    cartData: response?.data?.data
                });

                if (response.data.success) {
                    // Cart verisini direkt olarak saklayalım
                    this.cart = response.data.data;
                    
                    // Mevcut items yapısını da güncelleyelim
                    this.items = this.cart.items.map(item => ({
                        product: {
                            _id: item.product._id,
                            name: item.product.name,
                            price: item.product.price,
                            images: item.product.images,
                            sku: item.product.sku,
                            stock: item.product.stock,
                            slug: item.product.slug
                        },
                        quantity: item.quantity,
                        price: item.price,
                        unit: item.unit,
                        _id: item._id
                    }));

                    return this.cart;
                }

                return null;
            } catch (error) {
                console.error('Cart fetch error:', error);
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
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
            if (!this.hasItems) return;

            try {
                const response = await api.post('/cart/reservations/refresh');

                if (response.data.success) {
                    const results = response.data.data;
                    
                    results.forEach(result => {
                        this.reservationStatus[result.productId] = {
                            isValid: result.success,
                            message: result.message || '',
                            reservationId: result.reservationId
                        };
                    });

                    // Başarısız rezervasyonlar için uyarı göster
                    const failedReservations = results.filter(r => !r.success);
                    if (failedReservations.length > 0) {
                        toast.warning('Bazı ürünlerin rezervasyonları güncellenemedi');
                    }
                }
            } catch (error) {
                console.error('Rezervasyon yenileme hatası:', error);
                toast.error('Rezervasyonlar yenilenirken bir hata oluştu');
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
                    
                    toast.success('Ürün sepete eklendi');
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
                    
                    toast.success('Ürün sepetten çıkarıldı');
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

        // Rezervasyonları yenile
        async refreshReservations() {
            try {
                const checkPromises = this.items.map(item => 
                    api.get(`/stocks/reservations/${item.product._id}/availability?quantity=${item.quantity}`)
                );
                
                const responses = await Promise.all(checkPromises);
                
                responses.forEach((response, index) => {
                    const item = this.items[index];
                    const productId = item.product._id;
                    
                    if (response.data.success) {
                        const { isAvailable, availableQuantity } = response.data.data;  
                        
                        this.reservationStatus[productId] = {
                            isValid: isAvailable,
                            message: isAvailable 
                                ? 'Ürün rezerve edildi' 
                                : `Stokta ${availableQuantity} adet var`
                        };
                    }
                });
        
                return true;
            } catch (error) {
                console.error('Rezervasyon yenileme hatası:', error);
                this.error = 'Rezervasyonlar güncellenirken bir hata oluştu';
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
            if (!Array.isArray(this.items)) {
                this.totalAmount = 0;
                return;
            }

            this.totalAmount = this.items.reduce((total, item) => {
                if (!item) return total;
                
                // Önce item.price'ı kontrol et (backend'den direkt gelen fiyat)
                if (typeof item.price === 'number') {
                    return total + (item.price * (item.quantity || 1));
                }
                
                // Sonra product.price.current'ı kontrol et
                const productPrice = item.product?.price?.current;
                if (typeof productPrice === 'number') {
                    return total + (productPrice * (item.quantity || 1));
                }
                
                return total;
            }, 0);
        },

        // Component destroyed olduğunda
        cleanup() {
            if (this.reservationTimer) {
                clearInterval(this.reservationTimer);
                this.reservationTimer = null;
            }
        }
    }
});