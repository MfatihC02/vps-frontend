import { defineStore } from 'pinia';
import api from '@/services/axiosInstance';
import { socketManager } from '@/plugins/socket';

const API_URL = 'https://muhendislerticaret-backend.onrender.com/api';

export const useCategoryStore = defineStore('category', {
    state: () => ({
        categories: [],
        categoryTree: [],
        currentCategory: null,
        loading: false,
        error: null,
        socketListeners: null,
        pagination: {
            total: 0,
            page: 1,
            pages: 1
        }
    }),

    getters: {
        getCategoryById: (state) => (id) => {
            return state.categories.find(category => category._id === id);
        },

        getRootCategories: (state) => {
            return state.categories.filter(category => !category.parent);
        },

        getActiveCategories: (state) => {
            return state.categories.filter(category => category.isActive);
        },

        getCategoryBySlug: (state) => (slug) => {
            const findCategory = (categories, slug, path = []) => {
                for (const category of categories) {
                    if (category.slug === slug) {
                        return [...path, category];
                    }
                    if (category.children) {
                        const found = findCategory(category.children, slug, [...path, category]);
                        if (found) {
                            return found;
                        }
                    }
                }
                return null;
            };

            return findCategory(state.categoryTree, slug);
        },

        getCategoryByPath: (state) => (path) => {
            if (!path) return [];

            const slugs = typeof path === 'string' ? path.split('/') : path;
            let categories = [];
            let currentLevel = state.categoryTree;

            for (const slug of slugs) {
                const category = currentLevel?.find(cat => cat.slug === slug);
                if (!category) return categories;

                categories.push(category);
                currentLevel = category.children || [];
            }

            return categories;
        },
    },

    actions: {
        initializeSocketListeners() {
            // Önce eski dinleyicileri temizle
            this.removeSocketListeners();

            // Yeni socket dinleyicilerini oluştur
            this.socketListeners = {
                'category:created': this.handleCategoryCreated.bind(this),
                'category:updated': this.handleCategoryUpdated.bind(this),
                'category:deleted': this.handleCategoryDeleted.bind(this),
                'category:statusChanged': this.handleCategoryStatusChanged.bind(this)
            };

            // Socket dinleyicilerini ekle
            Object.entries(this.socketListeners).forEach(([event, handler]) => {
                socketManager.addListener(event, handler);
            });
        },

        // Socket event handlers
        handleCategoryCreated(data) {
            const { category } = data;
            this.categories.push(category);
            this.updateCategoryTree();
        },

        handleCategoryUpdated(data) {
            const { categoryId, updates } = data;
            const index = this.categories.findIndex(c => c._id === categoryId);
            if (index !== -1) {
                this.categories[index] = { ...this.categories[index], ...updates };
                this.updateCategoryTree();
            }
        },

        handleCategoryDeleted(data) {
            const { categoryId } = data;
            this.categories = this.categories.filter(c => c._id !== categoryId);
            this.updateCategoryTree();
        },

        handleCategoryStatusChanged(data) {
            const { categoryId, isActive } = data;
            const category = this.categories.find(c => c._id === categoryId);
            if (category) {
                category.isActive = isActive;
                this.updateCategoryTree();
            }
        },

        removeSocketListeners() {
            if (this.socketListeners) {
                Object.entries(this.socketListeners).forEach(([event, handler]) => {
                    socketManager.removeListener(event, handler);
                });
                this.socketListeners = null;
            }
        },

        async fetchCategories({ page = 1, limit = 10, sort = 'order', parent = null } = {}) {
            try {
                this.loading = true;
                const response = await api.get(`${API_URL}/categories`, {
                    params: { page, limit, sort, parent }
                });

                this.categories = response.data.data;
                this.pagination = response.data.pagination;
                this.error = null;
                this.updateCategoryTree();
            } catch (error) {
                this.error = error.response?.data?.message || 'Kategoriler getirilirken bir hata oluştu';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async fetchCategoryById(id) {
            try {
                this.loading = true;
                const response = await api.get(`${API_URL}/categories/${id}`);
                this.currentCategory = response.data.data;
                this.error = null;
                return this.currentCategory;
            } catch (error) {
                this.error = error.response?.data?.message || 'Kategori getirilirken bir hata oluştu';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async fetchCategoryTree() {
            // Eğer zaten yükleme yapılıyorsa veya veriler varsa, mevcut veriyi döndür
            if (this.loading || (this.categoryTree.length > 0 && !this.error)) {
                return this.categoryTree;
            }

            this.loading = true;
            try {
                const response = await api.get(`${API_URL}/categories/tree`);
                this.categoryTree = response.data.data;
                this.error = null;
            } catch (error) {
                this.error = error.response?.data?.message || 'Kategori ağacı getirilirken bir hata oluştu';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async createCategory(categoryData) {
            try {
                this.loading = true;
                const response = await api.post(`${API_URL}/categories`, categoryData, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                // Socket event'i beklemeden önce local state'i güncelle
                const newCategory = response.data.data;
                this.categories.push(newCategory);
                await this.updateCategoryTree();

                this.error = null;
                return newCategory;
            } catch (error) {
                this.error = error.response?.data?.message || 'Kategori oluşturulurken bir hata oluştu';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async updateCategory(id, categoryData) {
            try {
                this.loading = true;
                const formData = new FormData();
                Object.keys(categoryData).forEach(key => {
                    if (key === 'metadata' && typeof categoryData[key] === 'object') {
                        formData.append(key, JSON.stringify(categoryData[key]));
                    } else if (key === 'image' && categoryData[key] instanceof File) {
                        formData.append(key, categoryData[key]);
                    } else if (categoryData[key] !== undefined) {
                        formData.append(key, categoryData[key]);
                    }
                });

                const response = await api.put(`${API_URL}/categories/${id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                // Socket event'i beklemeden önce local state'i güncelle
                const updatedCategory = response.data.data;
                const index = this.categories.findIndex(c => c._id === id);
                if (index !== -1) {
                    this.categories[index] = updatedCategory;
                    await this.updateCategoryTree();
                }

                this.error = null;
                return updatedCategory;
            } catch (error) {
                this.error = error.response?.data?.message || 'Kategori güncellenirken bir hata oluştu';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async updateCategoryTree() {
            try {
                const response = await api.get(`${API_URL}/categories/tree`);
                this.categoryTree = response.data.data;
            } catch (error) {
                console.error('Kategori ağacı güncellenirken hata:', error);
            }
        },

        async deleteCategory(id) {
            try {
                this.loading = true;
                await api.delete(`${API_URL}/categories/${id}`);

                // Socket event'i beklemeden önce local state'i güncelle
                this.categories = this.categories.filter(c => c._id !== id);
                await this.updateCategoryTree();

                this.error = null;
            } catch (error) {
                this.error = error.response?.data?.message || 'Kategori silinirken bir hata oluştu';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async updateCategoryStatus(id, isActive) {
            try {
                this.loading = true;
                const response = await api.put(`${API_URL}/categories/${id}/status`, { isActive });

                // Socket event'i beklemeden önce local state'i güncelle
                const category = this.categories.find(c => c._id === id);
                if (category) {
                    category.isActive = isActive;
                    await this.updateCategoryTree();
                }

                this.error = null;
                return response.data.data;
            } catch (error) {
                this.error = error.response?.data?.message || 'Kategori durumu güncellenirken bir hata oluştu';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        updatePagination() {
            this.pagination.total = this.categories.length;
            this.pagination.pages = Math.ceil(this.pagination.total / 10);
        },

        resetState() {
            this.removeSocketListeners();
            this.categories = [];
            this.categoryTree = [];
            this.currentCategory = null;
            this.loading = false;
            this.error = null;
            this.pagination = {
                total: 0,
                page: 1,
                pages: 1
            };
        }
    }
});