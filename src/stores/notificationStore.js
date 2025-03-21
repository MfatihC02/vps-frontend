import { defineStore } from 'pinia';
import api from '../services/axiosInstance';
import { useToast } from 'vue-toastification';

const toast = useToast();
const API_URL = import.meta.env.VITE_API_URL || 'https://backend.tarimsepetim.com.tr/api';

export const useNotificationStore = defineStore('notification', {
    state: () => ({
        // Kullanıcının bildirimleri
        notifications: [],

        // Okunmamış bildirim sayısı
        unreadCount: 0,

        // Modal/Alert bildirimleri
        modalNotifications: [],

        // Toast bildirimleri
        toastNotifications: [],

        // Banner bildirimleri
        bannerNotifications: [],

        // Aktif sayfalama bilgileri
        pagination: {
            page: 1,
            limit: 10,
            totalPages: 0,
            totalDocs: 0
        },

        // Admin için tüm bildirimler
        adminNotifications: [],

        // Yükleme durumları
        loading: {
            notifications: false,
            modalNotifications: false,
            toastNotifications: false,
            bannerNotifications: false,
            unreadCount: false,
            adminNotifications: false
        },

        // Hata durumları
        error: {
            notifications: null,
            modalNotifications: null,
            toastNotifications: null,
            bannerNotifications: null,
            unreadCount: null,
            adminNotifications: null
        },

        // Aktif modal bildirimi (gösterilmek üzere)
        activeModalNotification: null,

        // Aktif modal gösterim durumu
        showModal: false
    }),

    getters: {
        // Okunmamış bildirim sayısı 
        hasUnreadNotifications: (state) => state.unreadCount > 0,

        // Bildirim listesi boş mu?
        hasNotifications: (state) => state.notifications.length > 0,

        // Modal bildirim var mı?
        hasModalNotifications: (state) => state.modalNotifications.length > 0,

        // Bildirim tipine göre filtreleme
        getNotificationsByType: (state) => (type) => {
            return state.notifications.filter(notification => notification.type === type);
        }
    },

    actions: {
        // ----- KULLANICI ACTIONS -----

        /**
         * Kullanıcının bildirimlerini getir
         */
        async fetchNotifications(page = 1, limit = 10, type = null) {
            this.loading.notifications = true;
            this.error.notifications = null;

            try {
                let url = `${API_URL}/notifications?page=${page}&limit=${limit}`;
                if (type) url += `&type=${type}`;

                const response = await api.get(url);

                if (response.data.success) {
                    this.notifications = response.data.data.docs;
                    this.pagination = {
                        page: response.data.data.page,
                        limit: response.data.data.limit,
                        totalPages: response.data.data.totalPages,
                        totalDocs: response.data.data.totalDocs
                    };
                }
            } catch (error) {
                console.error('Bildirimler getirilemedi:', error);
                this.error.notifications = error.response?.data?.message || 'Bildirimler yüklenirken bir hata oluştu';
                toast.error(this.error.notifications);
            } finally {
                this.loading.notifications = false;
            }
        },

        /**
         * Okunmamış bildirim sayısını getir
         */
        async fetchUnreadCount() {
            this.loading.unreadCount = true;
            this.error.unreadCount = null;

            try {
                const response = await api.get(`${API_URL}/notifications/unread-count`);

                if (response.data.success) {
                    this.unreadCount = response.data.count;
                }
            } catch (error) {
                console.error('Okunmamış bildirim sayısı getirilemedi:', error);
                this.error.unreadCount = error.response?.data?.message || 'Okunmamış bildirim sayısı alınırken bir hata oluştu';
            } finally {
                this.loading.unreadCount = false;
            }
        },

        /**
         * Modal/Alert bildirimlerini getir
         */
        async fetchModalNotifications() {
            this.loading.modalNotifications = true;
            this.error.modalNotifications = null;

            try {
                const response = await api.get(`${API_URL}/notifications/modal`);

                if (response.data.success) {
                    this.modalNotifications = response.data.data;

                    // İlk modal bildirimi aktif et (eğer varsa)
                    if (this.modalNotifications.length > 0) {
                        this.activeModalNotification = this.modalNotifications[0];
                        this.showModal = true;
                    }
                }
            } catch (error) {
                console.error('Modal bildirimler getirilemedi:', error);
                this.error.modalNotifications = error.response?.data?.message || 'Modal bildirimler yüklenirken bir hata oluştu';
            } finally {
                this.loading.modalNotifications = false;
            }
        },

        /**
         * Toast bildirimlerini getir
         */
        async fetchToastNotifications() {
            this.loading.toastNotifications = true;
            this.error.toastNotifications = null;

            try {
                const response = await api.get(`${API_URL}/notifications/toast`);

                if (response.data.success) {
                    this.toastNotifications = response.data.data;

                    // Otomatik olarak toast bildirimleri göster
                    this.toastNotifications.forEach(notification => {
                        toast[notification.displayOptions?.style || 'info']({
                            title: notification.title,
                            content: notification.message,
                            timeout: notification.displayOptions?.autoHideAfter || 5000
                        });

                        // Toast gösterildikten sonra okundu olarak işaretle
                        this.markAsRead(notification._id);
                    });
                }
            } catch (error) {
                console.error('Toast bildirimler getirilemedi:', error);
                this.error.toastNotifications = error.response?.data?.message || 'Toast bildirimler yüklenirken bir hata oluştu';
            } finally {
                this.loading.toastNotifications = false;
            }
        },

        /**
         * Banner bildirimlerini getir
         */
        async fetchBannerNotifications() {
            this.loading.bannerNotifications = true;
            this.error.bannerNotifications = null;

            try {
                const response = await api.get(`${API_URL}/notifications/banner`);

                if (response.data.success) {
                    this.bannerNotifications = response.data.data;
                }
            } catch (error) {
                console.error('Banner bildirimler getirilemedi:', error);
                this.error.bannerNotifications = error.response?.data?.message || 'Banner bildirimler yüklenirken bir hata oluştu';
            } finally {
                this.loading.bannerNotifications = false;
            }
        },

        /**
         * Bildirimi okundu olarak işaretle
         */
        async markAsRead(notificationId) {
            try {
                const response = await api.put(`${API_URL}/notifications/${notificationId}/read`);

                if (response.data.success) {
                    // Bildirim listesini güncelle
                    this.notifications = this.notifications.map(notification => {
                        if (notification._id === notificationId) {
                            return { ...notification, isRead: true };
                        }
                        return notification;
                    });

                    // Modal bildirimlerinden kaldır
                    this.modalNotifications = this.modalNotifications.filter(
                        notification => notification._id !== notificationId
                    );

                    // Banner bildirimlerinden kaldır
                    this.bannerNotifications = this.bannerNotifications.filter(
                        notification => notification._id !== notificationId
                    );

                    // Okunmamış sayısını güncelle
                    if (this.unreadCount > 0) this.unreadCount--;

                    // Aktif modal bildirimini güncelle
                    if (this.activeModalNotification && this.activeModalNotification._id === notificationId) {
                        // Modaldan sonraki bildirimi göster
                        if (this.modalNotifications.length > 0) {
                            this.activeModalNotification = this.modalNotifications[0];
                        } else {
                            this.activeModalNotification = null;
                            this.showModal = false;
                        }
                    }
                }
            } catch (error) {
                console.error('Bildirim okundu işaretlenemedi:', error);
                toast.error('Bildirim okundu işaretlenirken bir hata oluştu');
            }
        },

        /**
         * Tüm bildirimleri okundu olarak işaretle
         */
        async markAllAsRead() {
            try {
                const response = await api.put(`${API_URL}/notifications/read-all`);

                if (response.data.success) {
                    // Tüm bildirimleri okundu olarak işaretle
                    this.notifications = this.notifications.map(notification => ({
                        ...notification,
                        isRead: true
                    }));

                    // Okunmamış sayısını sıfırla
                    this.unreadCount = 0;

                    // Modal ve banner bildirimlerini temizle
                    this.modalNotifications = [];
                    this.bannerNotifications = [];
                    this.activeModalNotification = null;
                    this.showModal = false;

                    toast.success('Tüm bildirimler okundu olarak işaretlendi');
                }
            } catch (error) {
                console.error('Tüm bildirimler okundu işaretlenemedi:', error);
                toast.error('Bildirimler okundu işaretlenirken bir hata oluştu');
            }
        },

        /**
         * Bildirimi sil
         */
        async deleteNotification(notificationId) {
            try {
                const response = await api.delete(`${API_URL}/notifications/${notificationId}`);

                if (response.data.success) {
                    // Bildirim listesinden kaldır
                    this.notifications = this.notifications.filter(
                        notification => notification._id !== notificationId
                    );

                    // Bildirim okunmamışsa sayacı güncelle
                    const deletedNotification = this.notifications.find(
                        notification => notification._id === notificationId
                    );

                    if (deletedNotification && !deletedNotification.isRead) {
                        if (this.unreadCount > 0) this.unreadCount--;
                    }

                    toast.success('Bildirim başarıyla silindi');
                }
            } catch (error) {
                console.error('Bildirim silinemedi:', error);
                toast.error('Bildirim silinirken bir hata oluştu');
            }
        },

        /**
         * Sonraki modal bildirimini göster
         */
        showNextModalNotification() {
            if (this.modalNotifications.length > 0) {
                const currentIndex = this.modalNotifications.findIndex(
                    notification => notification._id === this.activeModalNotification._id
                );

                if (currentIndex >= 0 && currentIndex < this.modalNotifications.length - 1) {
                    this.activeModalNotification = this.modalNotifications[currentIndex + 1];
                } else {
                    // Son bildirimdeysek kapatılır
                    this.activeModalNotification = null;
                    this.showModal = false;
                }
            } else {
                this.activeModalNotification = null;
                this.showModal = false;
            }
        },

        // ----- ADMIN ACTIONS -----

        /**
         * Tüm bildirimleri getir (admin)
         */
        async fetchAllNotifications(page = 1, limit = 20, type = null) {
            this.loading.adminNotifications = true;
            this.error.adminNotifications = null;

            try {
                let url = `${API_URL}/notifications/admin/all?page=${page}&limit=${limit}`;
                if (type) url += `&type=${type}`;

                const response = await api.get(url);

                if (response.data.success) {
                    this.adminNotifications = response.data.data.docs;
                    this.pagination = {
                        page: response.data.data.page,
                        limit: response.data.data.limit,
                        totalPages: response.data.data.totalPages,
                        totalDocs: response.data.data.totalDocs
                    };
                }
            } catch (error) {
                console.error('Admin bildirimleri getirilemedi:', error);
                this.error.adminNotifications = error.response?.data?.message || 'Bildirimler yüklenirken bir hata oluştu';
                toast.error(this.error.adminNotifications);
            } finally {
                this.loading.adminNotifications = false;
            }
        },

        /**
         * Yeni bildirim oluştur (admin)
         */
        async createNotification(notificationData) {
            try {
                const response = await api.post(`${API_URL}/notifications/admin/create`, notificationData);

                if (response.data.success) {
                    toast.success(`${response.data.count} adet bildirim başarıyla oluşturuldu`);
                    return true;
                }
                return false;
            } catch (error) {
                console.error('Bildirim oluşturulamadı:', error);
                toast.error(error.response?.data?.message || 'Bildirim oluşturulurken bir hata oluştu');
                return false;
            }
        },

        /**
         * Bildirimi güncelle (admin)
         */
        async updateNotification(notificationId, updateData) {
            try {
                const response = await api.put(`${API_URL}/notifications/admin/${notificationId}`, updateData);

                if (response.data.success) {
                    // Admin bildirim listesini güncelle
                    this.adminNotifications = this.adminNotifications.map(notification => {
                        if (notification._id === notificationId) {
                            return { ...notification, ...updateData };
                        }
                        return notification;
                    });

                    toast.success('Bildirim başarıyla güncellendi');
                    return true;
                }
                return false;
            } catch (error) {
                console.error('Bildirim güncellenemedi:', error);
                toast.error(error.response?.data?.message || 'Bildirim güncellenirken bir hata oluştu');
                return false;
            }
        },

        /**
         * Bildirimi sil (admin)
         */
        async deleteNotificationAdmin(notificationId) {
            try {
                const response = await api.delete(`${API_URL}/notifications/admin/${notificationId}`);

                if (response.data.success) {
                    // Admin bildirim listesinden kaldır
                    this.adminNotifications = this.adminNotifications.filter(
                        notification => notification._id !== notificationId
                    );

                    toast.success('Bildirim başarıyla silindi');
                    return true;
                }
                return false;
            } catch (error) {
                console.error('Bildirim silinemedi (admin):', error);
                toast.error(error.response?.data?.message || 'Bildirim silinirken bir hata oluştu');
                return false;
            }
        },

        /**
         * Bildirimleri toplu sil (admin)
         */
        async bulkDeleteNotifications(notificationIds) {
            try {
                const response = await api.post(`${API_URL}/notifications/admin/bulk-delete`, {
                    ids: notificationIds
                });

                if (response.data.success) {
                    // Silinen bildirimleri listeden kaldır
                    this.adminNotifications = this.adminNotifications.filter(
                        notification => !notificationIds.includes(notification._id)
                    );

                    toast.success(`${response.data.deletedCount} adet bildirim başarıyla silindi`);
                    return true;
                }
                return false;
            } catch (error) {
                console.error('Bildirimler toplu silinemedi:', error);
                toast.error(error.response?.data?.message || 'Bildirimler silinirken bir hata oluştu');
                return false;
            }
        },

        /**
         * Kampanya bildirimi gönder (admin)
         */
        async sendCampaignNotification(campaignData) {
            try {
                const response = await api.post(`${API_URL}/notifications/admin/campaign`, campaignData);

                if (response.data.success) {
                    toast.success(`${response.data.count} kullanıcıya kampanya bildirimi gönderildi`);
                    return true;
                }
                return false;
            } catch (error) {
                console.error('Kampanya bildirimi gönderilemedi:', error);
                toast.error(error.response?.data?.message || 'Kampanya bildirimi gönderilirken bir hata oluştu');
                return false;
            }
        },

        /**
         * Kullanıcı girişinde bildirimleri yükle
         */
        async loadUserNotifications() {
            try {
                // Okunmamış bildirim sayısını getir
                await this.fetchUnreadCount();

                // Modal bildirimleri getir (ve göster)
                await this.fetchModalNotifications();

                // Toast bildirimleri getir (ve göster)
                await this.fetchToastNotifications();

                // Banner bildirimleri getir
                await this.fetchBannerNotifications();
            } catch (error) {
                console.error('Bildirimler yüklenirken hata:', error);
            }
        },

        /**
         * Bildirim state'ini sıfırla (çıkış yapıldığında)
         */
        resetNotifications() {
            this.notifications = [];
            this.unreadCount = 0;
            this.modalNotifications = [];
            this.toastNotifications = [];
            this.bannerNotifications = [];
            this.adminNotifications = [];
            this.activeModalNotification = null;
            this.showModal = false;
        },

        async fetchNotificationsByFilter(targetAudience = null, displayMethod = null) {
            this.loading.notifications = true;
            this.error.notifications = null;

            try {
                let url = `${API_URL}/notifications/filter`;
                const params = new URLSearchParams();

                if (targetAudience) params.append('targetAudience', targetAudience);
                if (displayMethod) params.append('displayMethod', displayMethod);

                if (params.toString()) {
                    url += `?${params.toString()}`;
                }

                const response = await api.get(url);

                if (response.data.success) {
                    this.notifications = response.data.data;
                }
            } catch (error) {
                console.error('Bildirimler filtrelenerek getirilemedi:', error);
                this.error.notifications = error.response?.data?.message || 'Bildirimler yüklenirken bir hata oluştu';
                toast.error(this.error.notifications);
            } finally {
                this.loading.notifications = false;
            }
        }
    }
}); 