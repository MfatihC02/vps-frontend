import { defineStore } from 'pinia';
import { socketManager } from '@/plugins/socket';
import api from '@/services/axiosInstance';

export const useProductStore = defineStore('product', {
    state: () => ({
        searchResults: [],        // Yeni eklenen state
        products: [],
        newProducts: [],
        fideProducts: [],         // Fide ürünleri için yeni state
        categoryProducts: [],     // Kategori ürünleri için yeni state
        product: null,
        loading: false,
        error: null,
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
        getRecommendedProducts: (state) => state.products,
        getNewProducts: (state) => state.newProducts,
        getFideProducts: (state) => state.fideProducts,
        isLoading: (state) => state.loading,
        getError: (state) => state.error,
        getSearchResults: (state) => state.searchResults,
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
                    limit: params.limit || 24,
                    ...validFilters
                });

                const response = await api.get(`/products?${queryParams}`);

                // Eğer arama parametresi varsa, searchResults'ı güncelle
                if (validFilters.search) {
                    this.searchResults = response.data.data.docs;
                } else {
                    this.products = response.data.data.docs;
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

        // Tüm bölümleri yükle
        async fetchAllSections() {
            this.loading = true;
            this.error = null;
            try {
                // Önce tüm ürünleri getirelim (yeni ve indirimli ürünler için)
                const response = await api.get('/products');
                const allProducts = response.data.data.docs;

                // Öne çıkan ürünler için ayrı sorgu
                const recommendedResponse = await api.get('/products', {
                    params: {
                        search: 'öneÇıkan',
                        status: 'active',
                        limit: 24,
                        sort: '-createdAt'
                    }
                });
                this.products = recommendedResponse.data.data.docs;

                // Yeni ürünler için özel sorgu - son eklenen 24 ürün
                const newProductsResponse = await api.get('/products', {
                    params: {
                        search: 'yeni',
                        limit: 24,
                        sort: '-createdAt',
                        status: 'active'
                    }
                });
                this.newProducts = newProductsResponse.data.data.docs;

                // Fide ürünleri için özel sorgu
                const fideProductsResponse = await api.get('/products', {
                    params: {
                        search: 'fide',
                        limit: 24,
                        sort: '-createdAt',
                        status: 'active'
                    }
                });
                this.fideProducts = fideProductsResponse.data.data.docs;

            } catch (err) {
                console.error('Ürünler yüklenirken hata:', err);
                this.error = 'Ürünler yüklenirken bir hata oluştu.';
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
                    limit: params.limit || 24,
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

        // Ürün güncelleme
        async updateProduct(id, data) {
            try {
                // FormData için özel headers ayarı
                const config = {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                };

                const response = await api.put(`/products/${id}`, data, config);
                return response.data;
            } catch (error) {
                console.error('Ürün güncelleme hatası:', error);
                throw error;
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
        },

        // Kategori ID'si ile ürünleri getirme
        async fetchProductsByCategoryId(categoryId, params = {}) {
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
                    limit: params.limit || 24,
                    category: categoryId,
                    ...validFilters
                });

                const response = await api.get(`/products?${queryParams}`);

                if (response.data.success) {
                    this.categoryProducts = response.data.data.docs;
                }

                return response.data;
            } catch (error) {
                console.error('Fetch Products by Category ID Error:', error);
                this.error = error.response?.data?.message || 'Kategoriye ait ürünler yüklenirken bir hata oluştu';
                throw error;
            } finally {
                this.loading = false;
            }
        }
    }
});
