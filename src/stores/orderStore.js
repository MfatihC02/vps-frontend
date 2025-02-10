// stores/orderStore.js
import { defineStore } from 'pinia';
import api from '@/services/axiosInstance.js';
import { socketManager } from '@/plugins/socket';
import { useCartStore } from '@/stores/cartStore';

export const useOrderStore = defineStore('order', {
    state: () => ({
        orders: [],
        currentOrder: null,  // Tekil sipariş için state ekliyoruz
        loading: false,
        error: null,
        stats: null,
        adminStats: null,
        selectedOrders: [],
        bulkOperationStatus: {
            processing: false,
            total: 0,
            processed: 0,
            success: [],
            failed: []
        },
        orderStatuses: [
            'PROCESSING',  // Hazırlanıyor
            'SHIPPED',     // Kargoya Verildi
            'DELIVERED',   // Teslim Edildi
            'CANCELLED'    // İptal Edildi
        ],
        filters: {
            status: null,
            dateRange: null,
            sortBy: 'createdAt',
            sortOrder: 'desc',
            searchTerm: null
        },
        pagination: {
            page: 1,
            limit: 10,
            total: 0,
            pages: 0
        },
    }),

    getters: {
        // Siparişleri duruma göre filtreleme
        filteredOrders: (state) => {
            let filtered = [...state.orders];
            if (state.filters.status) {
                filtered = filtered.filter(order => order.status === state.filters.status);
            }
            if (state.filters.searchTerm) {
                const searchLower = state.filters.searchTerm.toLowerCase();
                filtered = filtered.filter(order =>
                    order.orderNumber?.toLowerCase().includes(searchLower) ||
                    order.user?.email?.toLowerCase().includes(searchLower)
                );
            }
            return filtered;
        },

        // Sipariş durumlarına göre gruplandırma
        ordersByStatus: (state) => {
            return state.orders.reduce((acc, order) => {
                if (!acc[order.status]) {
                    acc[order.status] = [];
                }
                acc[order.status].push(order);
                return acc;
            }, {});
        },

        // Toplam sipariş tutarı
        totalOrderAmount: (state) => {
            return state.orders.reduce((sum, order) => sum + order.totalAmount, 0);
        },

        // Formatlı toplam tutar
        formattedTotalAmount: (state) => {
            return new Intl.NumberFormat('tr-TR', {
                style: 'currency',
                currency: 'TRY'
            }).format(state.orders.reduce((sum, order) => sum + order.totalAmount, 0));
        },

        // Sipariş istatistikleri
        orderStatistics: (state) => ({
            total: state.orders.length,
            pending: state.orders.filter(o => o.status === 'PENDING_PAYMENT').length,
            processing: state.orders.filter(o => o.status === 'PROCESSING').length,
            completed: state.orders.filter(o => o.status === 'DELIVERED').length,
            cancelled: state.orders.filter(o => o.status === 'CANCELLED').length,
            totalRevenue: state.orders
                .filter(o => o.status === 'DELIVERED')
                .reduce((sum, order) => sum + order.totalAmount, 0)
        }),

        pendingOrders: (state) =>
            state.orders.filter(o => o.status === 'PENDING_PAYMENT'),

        processingOrders: (state) =>
            state.orders.filter(o => o.status === 'PROCESSING'),

        completedOrders: (state) =>
            state.orders.filter(o => o.status === 'DELIVERED'),

        cancelledOrders: (state) =>
            state.orders.filter(o => o.status === 'CANCELLED'),

        hasSelectedOrders: (state) => state.selectedOrders.length > 0,
    },

    actions: {
        // Sipariş oluşturma
        async createOrder(orderData) {
            try {
                this.loading = true;
                this.error = null;

                console.log('5. Order oluşturuluyor:', {
                    orderData: orderData,
                    cartExists: !!useCartStore()?.cart,
                    cartTotal: useCartStore()?.cart?.totalAmount
                });

                // Siparişi oluştur
                const response = await api.post('/orders', orderData);

                if (response.data.success) {
                    const newOrder = response.data.data;
                    console.log('6. Order oluşturuldu:', {
                        orderId: newOrder._id,
                        orderTotal: newOrder.totalAmount
                    });

                    this.orders.unshift(newOrder);
                    this.currentOrder = newOrder;

                    // Socket room'a katıl
                    socketManager.socket?.emit('JOIN_ORDER_ROOM', { orderId: newOrder._id });

                    return newOrder;
                }
            } catch (error) {
                this.error = error.response?.data?.message || 'Sipariş oluşturulamadı';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Sipariş iptal etme
        async cancelOrder(orderId) {
            try {
                this.loading = true;
                this.error = null;

                const response = await api.post(`/orders/${orderId}/cancel`);

                if (response.data.success) {
                    // Sipariş durumunu güncelle
                    const order = this.orders.find(o => o._id === orderId);
                    if (order) {
                        order.status = 'CANCELLED';
                        order.timeline.push({
                            status: 'CANCELLED',
                            date: new Date(),
                            note: 'Sipariş iptal edildi'
                        });

                        // Rezervasyonları iptal et
                        for (const item of order.items) {
                            if (item.reservationId) {
                                await api.patch(
                                    `/stocks/${item.product.stockId}/reservations/${item.reservationId}/cancel`
                                );
                            }
                        }
                    }

                    return true;
                }
            } catch (error) {
                this.error = error.response?.data?.message || 'Sipariş iptal edilemedi';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Tekil sipariş getirme
        async fetchOrder(orderId) {
            try {
                this.loading = true;
                this.error = null;

                const response = await api.get(`/orders/${orderId}`);
                this.currentOrder = response.data.data;

                return this.currentOrder;
            } catch (error) {
                this.error = error.response?.data?.message || 'Sipariş detayları yüklenemedi';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Kullanıcının siparişlerini getir
        async fetchUserOrders() {
            try {
                this.loading = true;
                this.error = null;

                const response = await api.get('/orders/user/orders', {
                    params: {
                        page: this.pagination.page,
                        limit: this.pagination.limit,
                        status: this.filters.status,
                        sortBy: this.filters.sortBy,
                        sortOrder: this.filters.sortOrder
                    }
                });

                if (response.data.success) {
                    const { orders, total, pages, currentPage } = response.data.data;
                    console.log('Gelen Siparişler:', orders); // Debug için eklendi
                    this.orders = orders;
                    this.pagination.total = total;
                    this.pagination.pages = pages;
                    this.pagination.page = currentPage;
                }

                return this.orders;
            } catch (error) {
                this.error = error.response?.data?.message || 'Siparişler yüklenemedi';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Tek bir siparişin detaylarını getir
        async fetchOrderDetails(orderId) {
            try {
                this.loading = true;
                this.error = null;

                const response = await api.get(`/orders/${orderId}`);
                this.currentOrder = response.data.data;

                return this.currentOrder;
            } catch (error) {
                this.error = error.response?.data?.message || 'Sipariş detayları alınamadı';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Admin: Tüm siparişleri getir
        async fetchAllOrders() {
            try {
                this.loading = true;
                this.error = null;

                const response = await api.get('/orders/admin/all', {
                    params: {
                        page: this.pagination.page,
                        limit: this.pagination.limit,
                        status: this.filters.status,
                        sortBy: this.filters.sortBy,
                        sortOrder: this.filters.sortOrder
                    }
                });

                if (response.data.success) {
                    this.orders = response.data.data.orders;
                    this.pagination.total = response.data.data.total;
                    this.pagination.pages = response.data.data.pages;
                    this.pagination.page = response.data.data.currentPage;
                }

                return this.orders;
            } catch (error) {
                this.error = error.response?.data?.message || 'Siparişler yüklenemedi';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Admin: Sipariş durumu güncelleme
        async updateOrderStatus(orderId, status, note = '') {
            try {
                this.loading = true;
                this.error = null;

                const response = await api.patch(`/orders/${orderId}/status`, {
                    status,
                    note
                });

                if (response.data.success) {
                    const updatedOrder = response.data.data;

                    // Orders array'inde güncelleme
                    const orderIndex = this.orders.findIndex(o => o._id === orderId);
                    if (orderIndex !== -1) {
                        this.orders[orderIndex] = updatedOrder;
                    }

                    // Mevcut sipariş detayını güncelleme
                    if (this.currentOrder?._id === orderId) {
                        this.currentOrder = updatedOrder;
                    }

                    // Socket event'i dinle
                    socketManager.socket?.on('adminOrderStatusUpdated', (data) => {
                        if (data.orderId === orderId) {
                            console.log('Sipariş durumu güncellendi:', data);
                        }
                    });

                    return updatedOrder;
                }
            } catch (error) {
                this.error = error.response?.data?.message || error.response?.data?.error || 'Sipariş durumu güncellenemedi';
                console.error('Sipariş durumu güncelleme hatası:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Admin: İstatistikleri getir
        async fetchOrderStats() {
            try {
                this.loading = true;
                this.error = null;

                const params = {
                    startDate: this.filters.dateRange?.start,
                    endDate: this.filters.dateRange?.end
                };

                const response = await api.get('/orders/admin/stats', { params });

                if (response.data.success) {
                    this.adminStats = response.data.data;
                    return response.data;
                }
            } catch (error) {
                this.error = error.response?.data?.error || 'İstatistikler getirilemedi';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Admin: Sipariş detay güncelleme
        async updateOrderDetails(orderId, updateData) {
            try {
                this.loading = true;
                this.error = null;

                const response = await api.patch(`/orders/admin/${orderId}`, updateData);

                if (response.data.success) {
                    const orderIndex = this.orders.findIndex(o => o._id === orderId);
                    if (orderIndex !== -1) {
                        this.orders[orderIndex] = {
                            ...this.orders[orderIndex],
                            ...response.data.data
                        };
                    }

                    // Socket bildirimi
                    socketManager.socket?.emit('ORDER_UPDATED', {
                        orderId,
                        updates: updateData
                    });

                    return response.data;
                }
            } catch (error) {
                this.error = error.response?.data?.error || 'Sipariş güncellenemedi';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Toplu sipariş güncelleme
        async bulkUpdateOrders(orderIds, updateData) {
            this.bulkOperationStatus = {
                processing: true,
                total: orderIds.length,
                processed: 0,
                success: [],
                failed: []
            };

            try {
                // Her 10 sipariş için bir batch oluştur
                const batches = orderIds.reduce((acc, id, i) => {
                    const batchIndex = Math.floor(i / 10);
                    if (!acc[batchIndex]) acc[batchIndex] = [];
                    acc[batchIndex].push(id);
                    return acc;
                }, []);

                for (const batch of batches) {
                    const promises = batch.map(orderId =>
                        this.updateOrderStatus(orderId, updateData.status)
                            .then(() => {
                                this.bulkOperationStatus.success.push(orderId);
                                this.bulkOperationStatus.processed++;
                            })
                            .catch(() => {
                                this.bulkOperationStatus.failed.push(orderId);
                                this.bulkOperationStatus.processed++;
                            })
                    );

                    await Promise.all(promises);
                }

                return {
                    success: this.bulkOperationStatus.success,
                    failed: this.bulkOperationStatus.failed
                };
            } finally {
                this.bulkOperationStatus.processing = false;
            }
        },

        // Socket listeners
        initializeSocketListeners() {
            // Sipariş durumu değişikliklerini dinle
            socketManager.socket?.on('ORDER_STATUS_UPDATED', (data) => {
                const index = this.orders.findIndex(o => o._id === data.orderId);
                if (index !== -1) {
                    this.orders[index] = { ...this.orders[index], ...data };
                }
                if (this.currentOrder?._id === data.orderId) {
                    this.currentOrder = { ...this.currentOrder, ...data };
                }
            });

            // Yeni sipariş bildirimi (Admin için)
            socketManager.socket?.on('NEW_ORDER_NOTIFICATION', (data) => {
                if (data.order) {
                    this.orders.unshift(data.order);
                    this.pagination.total += 1;
                }
            });

            socketManager.socket?.on('ORDER_STATUS_CHANGED', this.handleOrderStatusChange);
            socketManager.socket?.on('ORDER_PAYMENT_STATUS', this.handlePaymentStatus);
            socketManager.socket?.on('ORDER_SHIPPING_UPDATE', this.handleShippingUpdate);
            socketManager.socket?.on('ORDER_ERROR', this.handleOrderError);
        },

        handleOrderStatusChange(data) {
            const { orderId, status, note } = data;
            const orderIndex = this.orders.findIndex(o => o._id === orderId);

            if (orderIndex !== -1) {
                this.orders[orderIndex] = {
                    ...this.orders[orderIndex],
                    status,
                    statusNote: note,
                    lastUpdated: new Date()
                };

                // Eğer bu aktif sipariş ise onu da güncelle
                if (this.currentOrder?._id === orderId) {
                    this.currentOrder = this.orders[orderIndex];
                }
            }
        },

        handlePaymentStatus(data) {
            const order = this.orders.find(o => o._id === data.orderId);
            if (order) {
                order.paymentStatus = data.status;
                if (data.status === 'SUCCESS') {
                    // Ödeme başarılı olduğunda sepeti temizle
                    const cartStore = useCartStore();
                    cartStore.clearCart();
                }
            }
        },

        handleShippingUpdate(data) {
            const { orderId, trackingNumber, shippingStatus, estimatedDelivery } = data;
            const orderIndex = this.orders.findIndex(o => o._id === orderId);

            if (orderIndex !== -1) {
                this.orders[orderIndex] = {
                    ...this.orders[orderIndex],
                    trackingNumber,
                    shippingStatus,
                    estimatedDelivery,
                    lastUpdated: new Date()
                };
            }
        },

        handleOrderError(data) {
            const { orderId, error } = data;
            this.error = error;

            // Sipariş durumunu güncelle
            const orderIndex = this.orders.findIndex(o => o._id === orderId);
            if (orderIndex !== -1) {
                this.orders[orderIndex] = {
                    ...this.orders[orderIndex],
                    status: 'ERROR',
                    errorMessage: error,
                    lastUpdated: new Date()
                };
            }
        },

        // Filtreleri güncelle
        updateFilters(newFilters) {
            this.filters = { ...this.filters, ...newFilters };
            this.pagination.page = 1; // Filtreler değiştiğinde sayfa 1'e dön
        },

        // Pagination güncelle
        async updatePagination(newPage) {
            if (newPage !== this.pagination.page) {
                this.pagination.page = newPage;
                await this.fetchAllOrders();
            }
        },

        // Hata temizleme
        clearError() {
            this.error = null;
        },

        // Store reset
        resetStore() {
            this.orders = [];
            this.currentOrder = null;
            this.loading = false;
            this.error = null;
            this.stats = null;
            this.adminStats = null;
            this.selectedOrders = [];
            this.bulkOperationStatus = {
                processing: false,
                total: 0,
                processed: 0,
                success: [],
                failed: []
            };
            this.filters = {
                status: null,
                dateRange: null,
                sortBy: 'createdAt',
                sortOrder: 'desc',
                searchTerm: null
            };
            this.pagination = {
                page: 1,
                limit: 10,
                total: 0,
                pages: 0
            };

            // Socket listeners'ları temizle
            socketManager.socket?.off('ORDER_STATUS_UPDATED');
            socketManager.socket?.off('NEW_ORDER_NOTIFICATION');
            socketManager.socket?.off('ORDER_STATUS_CHANGED');
            socketManager.socket?.off('ORDER_PAYMENT_STATUS');
            socketManager.socket?.off('ORDER_SHIPPING_UPDATE');
            socketManager.socket?.off('ORDER_ERROR');
        }
    }
});
