import { defineStore } from 'pinia';
import { socketManager } from '@/plugins/socket';
import api from '@/services/axiosInstance';

export const useProductStore = defineStore('product', {
    state: () => ({
        products: [],
        product: null,
        loading: false,
        error: null,
        pagination: {
            page: 1,
            limit: 10,
            totalPages: 0,
            totalItems: 0
        },
        filters: {
            category: '',
            productType: '',
            brand: '',
            minPrice: '',
            maxPrice: '',
            status: '',
            search: ''
        },
        socketListeners: []
    }),

    getters: {
        getProductById: (state) => (id) => {
            return state.products.find(product => product._id === id);
        },
        getFilteredProducts: (state) => {
            return state.products;
        },
        isLoading: (state) => state.loading,
        getError: (state) => state.error,
        getPagination: (state) => state.pagination
    },
    actions: {
        // Socket Event Listeners
        initializeSocketListeners() {
            const listeners = [
                {
                    event: 'product:created',
                    callback: (product) => {
                        this.products.unshift(product);
                    }
                },
                {
                    event: 'product:updated',
                    callback: ({ productId, updates }) => {
                        const index = this.products.findIndex(p => p._id === productId);
                        if (index !== -1) {
                            this.products[index] = { ...this.products[index], ...updates };
                        }
                    }
                },
                {
                    event: 'product:deleted',
                    callback: ({ productId }) => {
                        const index = this.products.findIndex(p => p._id === productId);
                        if (index !== -1) {
                            this.products.splice(index, 1);
                        }
                    }
                },
                {
                    event: 'product:stock:updated',
                    callback: ({ productId, newStock }) => {
                        const product = this.products.find(p => p._id === productId);
                        if (product) {
                            product.stock.quantity = newStock;
                        }
                    }
                },
                {
                    event: 'product:price:updated',
                    callback: ({ productId, newPrice }) => {
                        const product = this.products.find(p => p._id === productId);
                        if (product) {
                            product.price.current = newPrice;
                        }
                    }
                },
                {
                    event: 'product:stock:low',
                    callback: ({ productId, currentStock }) => {
                        console.warn(`Düşük stok uyarısı: ${productId}, Mevcut stok: ${currentStock}`);
                    }
                }
            ];

            // Dinleyicileri kaydet ve sakla
            listeners.forEach(({ event, callback }) => {
                socketManager.addListener(event, callback);
                this.socketListeners.push({ event, callback });
            });
        },

        // Socket Listeners'ları temizle
        clearSocketListeners() {
            this.socketListeners.forEach(({ event, callback }) => {
                socketManager.removeListener(event, callback);
            });
            this.socketListeners = [];
        },

        // API Calls
        async fetchProducts(params = {}) {
            try {
                this.loading = true;
                this.error = null;

                const validFilters = Object.entries({
                    ...this.filters,
                    ...params
                }).reduce((acc, [key, value]) => {
                    if (value !== null && value !== '' && value !== undefined) {
                        acc[key] = value;
                    }
                    return acc;
                }, {});

                const queryParams = new URLSearchParams({
                    page: params.page || this.pagination.page,
                    limit: params.limit || this.pagination.limit,
                    ...validFilters
                });

                const response = await api.get(`/products?${queryParams}`);

                if (response.data.success) {
                    this.products = response.data.data.docs;
                    this.pagination = {
                        page: response.data.data.page,
                        limit: response.data.data.limit,
                        totalPages: response.data.data.totalPages,
                        totalItems: response.data.data.totalDocs
                    };
                }

                return response.data;
            } catch (error) {
                console.error('Fetch Products Error:', error);
                this.error = error.response?.data?.message || 'Ürünler yüklenirken bir hata oluştu';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async fetchProductById(id) {
            try {
                this.loading = true;
                this.error = null;

                const response = await api.get(`/products/${id}`);
                this.product = response.data.data;
                return response.data;
            } catch (error) {
                this.error = error.response?.data?.message || 'Ürün yüklenirken bir hata oluştu';
                throw error;
            } finally {
                this.loading = false;
            }
        },
        //kategori slugu ile ürünleri getirme
        async fetchProductsByCategory(slug, params = {}) {
            try {
                this.loading = true;
                this.error = null;

                const validFilters = Object.entries({
                    ...this.filters,
                    ...params
                }).reduce((acc, [key, value]) => {
                    if (value !== null && value !== '' && value !== undefined) {
                        acc[key] = value;
                    }
                    return acc;
                }, {});

                const queryParams = new URLSearchParams({
                    page: params.page || this.pagination.page,
                    limit: params.limit || this.pagination.limit,
                    sortBy: params.sortBy || 'price_asc',
                    ...validFilters
                });

                const response = await api.get(`/categories/${slug}/products?${queryParams}`);

                if (response.data.success) {
                    // Eğer sayfa 1'den büyükse ve loadMore ise, mevcut ürünlere ekle
                    if (params.page > 1 && params.loadMore) {
                        this.products = [...this.products, ...response.data.data];
                    } else {
                        // İlk sayfa veya normal yükleme ise, ürünleri değiştir
                        this.products = response.data.data;
                    }

                    // Pagination yapısını API yanıtına göre güncelle
                    this.pagination = {
                        page: response.data.pagination.page,
                        limit: this.pagination.limit,
                        totalPages: response.data.pagination.pages,
                        totalItems: response.data.pagination.total
                    };
                }

                return response.data;
            } catch (error) {
                console.error('Fetch Products by Category Error:', error);
                this.error = error.response?.data?.message || 'Kategoriye ait ürünler yüklenirken bir hata oluştu';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        //slug ile ürün bulma 
        async fetchProductBySlug(slug) {
            try {
                this.loading = true;
                this.error = null;

                const response = await api.get(`/products/slug/${slug}`);
                this.product = response.data.data;
                return response.data;
            } catch (error) {
                this.error = error.response?.data?.message || 'Ürün yüklenirken bir hata oluştu';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async createProduct(productData) {
            console.log("createProduct başladı");
            try {
                this.loading = true;
                this.error = null;

                if (!(productData instanceof FormData)) {
                    throw new Error("Form verisi FormData tipinde olmalıdır");
                }

                // FormData içeriği kontrolü
                const hasImage = Array.from(productData.entries()).some(([key, value]) =>
                    key === 'image' && value instanceof File
                );

                if (!hasImage) {
                    console.warn("Dikkat: FormData içinde image dosyası bulunamadı");
                }

                const response = await api.postForm('/products', productData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        console.log(`Yükleme ilerleme: ${percentCompleted}%`);
                    }
                });

                if (response.data.success) {
                    const newProduct = response.data.data;
                    this.products.unshift(newProduct);
                    return response.data;
                } else {
                    throw new Error(response.data.message || 'Ürün oluşturma başarısız');
                }

            } catch (error) {
                console.error("Store - Ürün oluşturma hatası:", {
                    message: error.message,
                    response: error.response?.data,
                    stack: error.stack
                });
                this.error = error.response?.data?.message || error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },


        async updateProduct(id, updateData) {
            try {
                this.loading = true;
                this.error = null;

                console.log('Store - Update öncesi:', {
                    id,
                    updateData
                });

                const response = await api.put(`/products/${id}`, updateData, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                console.log('Store - Backend yanıtı:', response.data);

                if (response.data.success) {
                    // Tekil ürün state'ini güncelle
                    this.product = response.data.data;

                    // products array'inde de güncelle
                    const index = this.products.findIndex(p => p._id === id);
                    if (index !== -1) {
                        this.products[index] = response.data.data;
                        console.log('Store - Products array güncellendi:', this.products[index]);
                    }

                    console.log('Store - State güncellendi:', {
                        product: this.product,
                        productsArray: index !== -1 ? this.products[index] : 'Ürün listede bulunamadı'
                    });
                }

                return response.data;
            } catch (error) {
                console.error('Store - Ürün güncelleme hatası:', error);
                this.error = error.response?.data?.message || 'Ürün güncellenirken bir hata oluştu';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async deleteProduct(id) {
            try {
                this.loading = true;
                this.error = null;

                const response = await api.delete(`/products/${id}`);
                return response.data;
            } catch (error) {
                this.error = error.response?.data?.message || 'Ürün silinirken bir hata oluştu';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async deleteProductImage(productId, imageId) {
            try {
                this.loading = true;
                this.error = null;

                const response = await api.delete(`/products/${productId}/images/${imageId}`);

                if (this.product && this.product._id === productId) {
                    this.product.images = this.product.images.filter(img => img._id !== imageId);
                }

                return response.data;
            } catch (error) {
                this.error = error.response?.data?.message || 'Ürün resmi silinirken bir hata oluştu';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async updateImageOrder(productId, imageOrders) {
            try {
                this.loading = true;
                this.error = null;

                const response = await api.patch(`/products/${productId}/images/order`, {
                    imageOrders
                });

                if (this.product && this.product._id === productId) {
                    this.product.images = response.data.data.images;
                }

                return response.data;
            } catch (error) {
                this.error = error.response?.data?.message || 'Resim sırası güncellenirken bir hata oluştu';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Filters ve error handling metodları aynı kalacak
        setFilters(filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value === null || value === undefined) {
                    this.filters[key] = '';
                } else {
                    this.filters[key] = value;
                }
            });
        },

        clearFilters() {
            this.filters = {
                category: '',
                productType: '',
                brand: '',
                minPrice: '',
                maxPrice: '',
                status: '',
                search: ''
            };
        },

        clearError() {
            this.error = null;
        }
    }
});
