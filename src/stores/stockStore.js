import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/services/axiosInstance';
import { socketManager } from '@/plugins/socket';
import { useToast } from 'vue-toastification';

const toast = useToast();

// Socket Event Tanımları
const STOCK_EVENTS = {
    UPDATED: 'STOCK.UPDATED',
    ALERT: 'STOCK.ALERT',
    MOVEMENT: 'STOCK.MOVEMENT',
    LOW_STOCK: 'STOCK.LOW_STOCK',
    OUT_OF_STOCK: 'STOCK.OUT_OF_STOCK'
};

export const useStockStore = defineStore('stock', () => {
    // State
    const stocks = ref(new Map()); // productId -> stock mapping
    const loading = ref(false);
    const error = ref(null);
    const selectedStock = ref(null);
    const stockStatus = ref({});
    const reservationDetails = ref({});
    const stockMovements = ref(new Map()); // productId -> movements[]
    const stockHistory = ref([]);

    // Getters
    const getStockByProductId = computed(() => (productId) => stocks.value.get(productId));

    const isStockAvailable = computed(() => (productId, quantity = 1) => {
        const stock = stocks.value.get(productId);
        return stock ? stock.quantity >= quantity : false;
    });

    const getLowStockProducts = computed(() => {
        return Array.from(stocks.value.values()).filter(stock =>
            stock.quantity <= stock.lowStockThreshold
        );
    });

    const getStockMovements = computed(() => (productId) => stockMovements.value.get(productId) || []);

    const getStockHistory = computed(() => stockHistory.value);

    const getStockStatus = computed(() => (productId) => {
        return stockStatus.value[productId] || { available: false, quantity: 0 };
    });

    const getReservationDetails = computed(() => (productId) => {
        return reservationDetails.value[productId] || null;
    });

    const hasActiveReservation = computed(() => (productId) => {
        const reservation = reservationDetails.value[productId];
        return reservation && !reservation.isExpired;
    });

    // Actions
    const fetchStockByProduct = async (productId) => {
        try {
            loading.value = true;
            error.value = null;

            const response = await api.get(`stocks/product/${productId}`);
            const stockData = response.data;

            // Stok bulunamadı durumu kontrolü
            if (stockData.error || !stockData._id) {
                return null;
            }

            // Stok verisini düzenle
            const formattedStock = {
                _id: stockData._id,
                product: stockData.product,
                quantity: stockData.quantity,
                unit: stockData.unit,
                lowStockThreshold: stockData.lowStockThreshold,
                lastUpdated: stockData.lastUpdated
            };

            stocks.value.set(productId, formattedStock);
            return formattedStock;
        } catch (err) {
            if (err.response?.status === 404) {
                // 404 durumunda null dön
                return null;
            }
            console.error('Stok getirme hatası:', err);
            error.value = err.response?.data?.message || 'Stok bilgisi alınamadı';
            return null; // Hata durumunda da null dön
        } finally {
            loading.value = false;
        }
    };

    const fetchStockByProductSlug = async (slug) => {
        try {
            loading.value = true;
            error.value = null;

            const response = await api.get(`stocks/product/slug/${slug}`);
            const stockData = response.data;

            // Stok verisini düzenle
            const formattedStock = {
                _id: stockData._id,
                product: stockData.product,
                quantity: stockData.quantity,
                unit: stockData.unit,
                lowStockThreshold: stockData.lowStockThreshold,
                lastUpdated: stockData.lastUpdated
            };

            stocks.value.set(stockData.product, formattedStock);
            return formattedStock;
        } catch (err) {
            console.error('Stok getirme hatası:', err);
            error.value = err.response?.data?.message || 'Stok bilgisi alınamadı';
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const updateStock = async (productId, data) => {
        try {
            loading.value = true;
            error.value = null;

            const response = await api.put(`stocks/product/${productId}`, {
                quantity: data.quantity,
                type: data.type, // 'add' veya 'remove'
                reason: data.reason,
                note: data.note
            });

            const updatedStock = response.data;
            stocks.value.set(productId, updatedStock);

            // Toast bildirimi
            const action = data.type === 'add' ? 'eklendi' : 'çıkarıldı';
            toast.success(`${data.quantity} ${updatedStock.unit} stok ${action}`);

            return updatedStock;
        } catch (err) {
            error.value = err.response?.data?.message || 'Stok güncellenemedi';
            toast.error(error.value);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const reserveStock = async (productId, quantity) => {
        try {
            loading.value = true;
            error.value = null;

            const response = await api.post(`/stocks/product/${productId}/reservations`, { quantity });
            const updatedStock = response.data.data;

            stocks.value.set(productId, updatedStock);
            return updatedStock;
        } catch (err) {
            error.value = err.response?.data?.message || 'Stok rezerve edilemedi';
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const releaseStock = async (productId, quantity) => {
        try {
            loading.value = true;
            error.value = null;

            const response = await api.post(`/stocks/${productId}/release`, { quantity });
            const updatedStock = response.data.data;

            stocks.value.set(productId, updatedStock);
            return updatedStock;
        } catch (err) {
            error.value = err.response?.data?.message || 'Stok rezervasyonu iptal edilemedi';
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const checkStockStatus = async (productId) => {
        try {
            loading.value = true;
            error.value = null;

            const response = await api.get(`/product/${productId}/availability`);
            const stockData = response.data;

            stockStatus.value[productId] = {
                available: stockData.available,
                quantity: stockData.quantity,
                unit: stockData.unit,
                lowStockThreshold: stockData.lowStockThreshold,
                isLowStock: stockData.quantity <= stockData.lowStockThreshold
            };

            return stockStatus.value[productId];
        } catch (err) {
            console.error('Stok kontrolü hatası:', err);
            error.value = err.response?.data?.message || 'Stok durumu kontrol edilirken bir hata oluştu';
            throw error.value;
        } finally {
            loading.value = false;
        }
    };

    const checkReservationStatus = async (productId) => {
        try {
            loading.value = true;
            error.value = null;

            const response = await api.get(`/stock/reservations/${productId}/status`);

            if (response.data.success) {
                const reservationData = response.data.data;
                reservationDetails.value[productId] = {
                    isValid: reservationData.isValid,
                    isExpired: reservationData.isExpired,
                    remainingTime: reservationData.remainingTime,
                    status: reservationData.status,
                    quantity: reservationData.quantity
                };
                return reservationData;
            }

            return null;
        } catch (error) {
            console.error('Rezervasyon kontrolü hatası:', error);
            error.value = 'Rezervasyon durumu kontrol edilirken bir hata oluştu';
            toast.error(error.value);
            return null;
        } finally {
            loading.value = false;
        }
    };

    const extendReservation = async (reservationId) => {
        try {
            loading.value = true;
            error.value = null;

            const response = await api.post(`/stock/reservations/${reservationId}/extend`);

            if (response.data.success) {
                const reservationData = response.data.data;
                const productId = reservationData.product;

                reservationDetails.value[productId] = {
                    isValid: true,
                    isExpired: false,
                    remainingTime: reservationData.remainingTime,
                    status: reservationData.status,
                    quantity: reservationData.quantity
                };

                toast.success('Rezervasyon süresi uzatıldı');
                return true;
            }

            return false;
        } catch (error) {
            console.error('Rezervasyon uzatma hatası:', error);
            error.value = 'Rezervasyon süresi uzatılırken bir hata oluştu';
            toast.error(error.value);
            return false;
        } finally {
            loading.value = false;
        }
    };

    const createBatchReservations = async (items) => {
        try {
            loading.value = true;
            error.value = null;

            const response = await api.post('/stock/reservations/batch', {
                items: items.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity
                }))
            });

            if (response.data.success) {
                const results = response.data.data;
                
                results.forEach(result => {
                    if (result.success) {
                        reservationDetails.value[result.productId] = {
                            isValid: true,
                            isExpired: false,
                            remainingTime: result.remainingTime,
                            status: result.status,
                            quantity: result.quantity
                        };
                    }
                });

                return results;
            }

            return null;
        } catch (error) {
            console.error('Toplu rezervasyon hatası:', error);
            error.value = 'Rezervasyonlar oluşturulurken bir hata oluştu';
            toast.error(error.value);
            return null;
        } finally {
            loading.value = false;
        }
    };

    const createCheckoutReservation = async (items) => {
        try {
            loading.value = true;
            error.value = null;

            const response = await api.post('/stock/reservations/checkout', {
                items: items.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity
                }))
            });

            if (response.data.success) {
                const results = response.data.data;
                
                results.forEach(result => {
                    if (result.success) {
                        reservationDetails.value[result.productId] = {
                            isValid: true,
                            isExpired: false,
                            remainingTime: result.remainingTime,
                            status: 'CHECKOUT',
                            quantity: result.quantity
                        };
                    }
                });

                return results;
            }

            return null;
        } catch (error) {
            console.error('Checkout rezervasyon hatası:', error);
            error.value = 'Checkout rezervasyonları oluşturulurken bir hata oluştu';
            toast.error(error.value);
            return null;
        } finally {
            loading.value = false;
        }
    };

    const confirmReservation = async (reservationId) => {
        try {
            loading.value = true;
            error.value = null;

            const response = await api.post(`/stock/reservations/${reservationId}/confirm`);

            if (response.data.success) {
                const reservationData = response.data.data;
                const productId = reservationData.product;

                // Rezervasyon onaylandığında detayları temizle
                delete reservationDetails.value[productId];
                
                toast.success('Rezervasyon onaylandı');
                return true;
            }

            return false;
        } catch (error) {
            console.error('Rezervasyon onaylama hatası:', error);
            error.value = 'Rezervasyon onaylanırken bir hata oluştu';
            toast.error(error.value);
            return false;
        } finally {
            loading.value = false;
        }
    };

    const cancelReservation = async (reservationId) => {
        try {
            loading.value = true;
            error.value = null;

            const response = await api.post(`/stock/reservations/${reservationId}/cancel`);

            if (response.data.success) {
                const reservationData = response.data.data;
                const productId = reservationData.product;

                // Rezervasyon iptal edildiğinde detayları temizle
                delete reservationDetails.value[productId];
                
                toast.success('Rezervasyon iptal edildi');
                return true;
            }

            return false;
        } catch (error) {
            console.error('Rezervasyon iptal hatası:', error);
            error.value = 'Rezervasyon iptal edilirken bir hata oluştu';
            toast.error(error.value);
            return false;
        } finally {
            loading.value = false;
        }
    };

    const fetchStockMovements = async (productId) => {
        try {
            loading.value = true;
            error.value = null;

            const response = await api.get(`/${productId}/movements`);
            const { movements, lowStockThreshold } = response.data;

            // Hareketleri formatlayıp saklama
            const formattedMovements = movements.map(movement => ({
                _id: movement._id,
                type: movement.type,
                quantity: movement.quantity,
                reason: movement.reason,
                note: movement.note || '',
                date: new Date(movement.date),
                remainingStock: movement.remainingStock,
                unit: movement.unit
            }));

            stockMovements.value.set(productId, formattedMovements);
            return { movements: formattedMovements, lowStockThreshold };
        } catch (err) {
            console.error('Stok hareketleri getirme hatası:', err);
            error.value = err.response?.data?.message || 'Stok hareketleri alınamadı';
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const addStock = async (productId, data) => {
        try {
            loading.value = true;
            error.value = null;

            const stockData = {
                quantity: data.quantity,
                type: 'add',
                reason: data.reason,
                note: data.note
            };

            const response = await api.put(`/${productId}`, stockData);
            const updatedStock = response.data;

            // Stok ve hareket verilerini güncelle
            stocks.value.set(productId, updatedStock);
            await fetchStockMovements(productId);

            toast.success(`${data.quantity} ${updatedStock.unit} stok eklendi`);
            return updatedStock;
        } catch (err) {
            error.value = err.response?.data?.message || 'Stok eklenemedi';
            toast.error(error.value);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const removeStock = async (productId, data) => {
        try {
            loading.value = true;
            error.value = null;

            // Stok kontrolü
            const currentStock = stocks.value.get(productId);
            if (!currentStock || currentStock.quantity < data.quantity) {
                throw new Error('Yetersiz stok miktarı');
            }

            const stockData = {
                quantity: data.quantity,
                type: 'remove',
                reason: data.reason,
                note: data.note
            };

            const response = await api.put(`/${productId}`, stockData);
            const updatedStock = response.data;

            // Stok ve hareket verilerini güncelle
            stocks.value.set(productId, updatedStock);
            await fetchStockMovements(productId);

            toast.success(`${data.quantity} ${updatedStock.unit} stok çıkarıldı`);
            return updatedStock;
        } catch (err) {
            error.value = err.response?.data?.message || 'Stok çıkarılamadı';
            toast.error(error.value);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const createStock = async (productId, stockData) => {
        try {
            loading.value = true;
            error.value = null;

            const response = await api.post('stocks', {
                productId,
                quantity: stockData.quantity,
                unit: stockData.unit || 'adet',
                lowStockThreshold: stockData.lowStockThreshold || 10
            });

            // Cache'i güncelle
            if (response.data.success) {
                stocks.value.set(productId, response.data.data);
            }

            return response.data;
        } catch (err) {
            error.value = err.response?.data?.message || 'Stok oluşturulurken bir hata oluştu';
            throw error.value;
        } finally {
            loading.value = false;
        }
    };

    const clearState = () => {
        stockStatus.value = {};
        reservationDetails.value = {};
        loading.value = false;
        error.value = null;
    };

    // Socket Event Handlers
    const handleStockUpdate = (data) => {
        if (data && data.productId) {
            console.log('[StockStore] Stok güncellemesi alındı:', data);

            // Stok verilerini güncelle
            const currentStock = stocks.value.get(data.productId);
            stocks.value.set(data.productId, {
                ...currentStock,
                ...data.stock,
                lastUpdated: new Date()
            });

            // Hareket verilerini güncelle
            if (data.movement) {
                const movements = stockMovements.value.get(data.productId) || [];
                movements.unshift({
                    ...data.movement,
                    date: new Date(data.movement.date)
                });
                stockMovements.value.set(data.productId, movements);

                // Hareket bildirimi
                const actionText = data.movement.type === 'add' ? 'eklendi' : 'çıkarıldı';
                toast.info(
                    `${data.movement.quantity} ${data.movement.unit} stok ${actionText}`,
                    { timeout: 3000 }
                );
            }

            // Düşük stok kontrolü
            if (data.stock.quantity <= data.stock.lowStockThreshold) {
                toast.warning(
                    `Düşük stok uyarısı: ${data.stock.quantity} ${data.stock.unit} kaldı`,
                    { timeout: 5000 }
                );
            }
        }
    };

    const handleStockAlert = (data) => {
        if (!data) return;

        console.log('[StockStore] Stok uyarısı alındı:', data);

        switch (data.type) {
            case 'LOW_STOCK':
                toast.warning(data.message, { timeout: 5000 });
                break;
            case 'OUT_OF_STOCK':
                toast.error(data.message, { timeout: 5000 });
                break;
            case 'MOVEMENT':
                toast.info(data.message, { timeout: 3000 });
                break;
            default:
                toast.info(data.message);
        }

        // Stok durumunu güncelle
        if (data.productId && data.stock) {
            stocks.value.set(data.productId, {
                ...stocks.value.get(data.productId),
                ...data.stock,
                lastUpdated: new Date()
            });
        }
    };

    const handleStockMovement = (data) => {
        if (data && data.productId && data.movement) {
            console.log('[StockStore] Stok hareketi alındı:', data);

            // Hareket listesini güncelle
            const movements = stockMovements.value.get(data.productId) || [];
            movements.unshift({
                ...data.movement,
                date: new Date(data.movement.date)
            });
            stockMovements.value.set(data.productId, movements);

            // Stok verilerini güncelle
            if (data.stock) {
                stocks.value.set(data.productId, {
                    ...stocks.value.get(data.productId),
                    ...data.stock,
                    lastUpdated: new Date()
                });
            }
        }
    };

    // Socket Bağlantı Yönetimi
    const initializeSocketListeners = () => {
        console.log('[StockStore] Socket dinleyicileri başlatılıyor');
        
        // Bağlantı kontrolü
        if (!socketManager.socket?.connected) {
            console.log('[StockStore] Socket bağlantısı kuruluyor');
            socketManager.connect();
        }

        // Event dinleyicilerini ekle
        socketManager.addListener(STOCK_EVENTS.UPDATED, handleStockUpdate);
        socketManager.addListener(STOCK_EVENTS.ALERT, handleStockAlert);
        socketManager.addListener(STOCK_EVENTS.MOVEMENT, handleStockMovement);
        socketManager.addListener(STOCK_EVENTS.LOW_STOCK, (data) => handleStockAlert({ ...data, type: 'LOW_STOCK' }));
        socketManager.addListener(STOCK_EVENTS.OUT_OF_STOCK, (data) => handleStockAlert({ ...data, type: 'OUT_OF_STOCK' }));
    };

    const cleanup = () => {
        console.log('[StockStore] Socket dinleyicileri temizleniyor');
        
        // Event dinleyicilerini kaldır
        socketManager.removeListener(STOCK_EVENTS.UPDATED, handleStockUpdate);
        socketManager.removeListener(STOCK_EVENTS.ALERT, handleStockAlert);
        socketManager.removeListener(STOCK_EVENTS.MOVEMENT, handleStockMovement);
        socketManager.removeListener(STOCK_EVENTS.LOW_STOCK, handleStockAlert);
        socketManager.removeListener(STOCK_EVENTS.OUT_OF_STOCK, handleStockAlert);

        // State temizliği
        stocks.value.clear();
        stockMovements.value.clear();
        stockHistory.value = [];
        error.value = null;
    };

    return {
        // State
        stocks,
        loading,
        error,
        selectedStock,
        stockStatus,
        reservationDetails,
        stockMovements,
        stockHistory,

        // Getters
        getStockByProductId,
        isStockAvailable,
        getLowStockProducts,
        getStockStatus,
        getReservationDetails,
        hasActiveReservation,
        getStockMovements,
        getStockHistory,

        // Actions
        fetchStockByProduct,
        fetchStockByProductSlug,
        updateStock,
        reserveStock,
        releaseStock,
        checkStockStatus,
        checkReservationStatus,
        extendReservation,
        createBatchReservations,
        createCheckoutReservation,
        confirmReservation,
        cancelReservation,
        fetchStockMovements,
        addStock,
        removeStock,
        createStock,
        clearState,
        initializeSocketListeners,
        cleanup
    };
});
