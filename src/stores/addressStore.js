import { defineStore } from 'pinia';
import { useToast } from 'vue-toastification';
import api from '@/services/axiosInstance';

const toast = useToast();

export const useAddressStore = defineStore('address', {
    state: () => ({
        addresses: [],
        defaultAddress: null,
        cities: [],
        districts: [],
        loading: false,
        error: null,
        selectedCity: null,
        selectedAddress: null, // Seçili adres için yeni state
        citiesLoaded: false,  // Şehirlerin yüklenip yüklenmediğini kontrol etmek için
        districtCache: new Map() // İlçeleri önbelleğe almak için
    }),

    getters: {
        getAddresses: (state) => state.addresses,
        getDefaultAddress: (state) => state.defaultAddress,
        getCities: (state) => state.cities,
        getDistricts: (state) => state.districts,
        isLoading: (state) => state.loading,
        getError: (state) => state.error,
        getSelectedCity: (state) => state.selectedCity,
        // Aktif adres: Seçili adres varsa onu, yoksa varsayılan adresi döndür
        activeAddress: (state) => state.selectedAddress || state.defaultAddress
    },

    actions: {
        // Hata yönetimi
        handleError(error) {
            // Backend'den gelen errors dizisini kontrol et
            if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
                // İlk hatayı mesaj olarak al veya tüm hata mesajlarını birleştir
                const firstError = error.response.data.errors[0];
                this.error = firstError.message || 'Bir hata oluştu';
                toast.error(this.error);
            } else {
                const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Bir hata oluştu';
                this.error = errorMessage;
                toast.error(errorMessage);
            }
        },

        // Tüm adresleri getir
        async fetchAddresses() {
            try {
                this.loading = true;
                const response = await api.get('/address');
                if (response.data.success) {
                    // Adresleri formatla ve state'e kaydet
                    this.addresses = response.data.addresses.map(addr => this.formatAddressForDisplay(addr)) || [];
                    // Varsayılan adresi bul ve state'e kaydet
                    this.defaultAddress = this.addresses.find(addr => addr.isDefault) || null;
                    // Eğer seçili adres yoksa varsayılan adresi seç
                    if (!this.selectedAddress) {
                        this.selectedAddress = this.defaultAddress;
                    }
                } else {
                    throw new Error(response.data.message || 'Adresler getirilemedi');
                }
            } catch (error) {
                this.addresses = [];
                this.handleError(error);
            } finally {
                this.loading = false;
            }
        },

        // Varsayılan adresi getir
        async fetchDefaultAddress() {
            try {
                this.loading = true;
                const response = await api.get('/address/default');
                if (response.data.success) {
                    this.defaultAddress = response.data.address;
                    // Eğer seçili adres yoksa varsayılan adresi seç
                    if (!this.selectedAddress) {
                        this.selectedAddress = this.defaultAddress;
                    }
                }
            } catch (error) {
                this.handleError(error);
            } finally {
                this.loading = false;
            }
        },

        // Şehir listesini getir (önbellekli)
        async fetchCities() {
            try {
                // Eğer şehirler zaten yüklenmişse tekrar yükleme
                if (this.citiesLoaded && this.cities.length > 0) {
                    return;
                }
                const response = await api.get('/address/cities');
                if (response.data.success) {
                    this.cities = response.data.cities;
                    this.citiesLoaded = true;
                }
            } catch (error) {
                this.handleError(error);
            }
        },

        // İlçe listesini getir (önbellekli)
        async fetchDistricts(city) {
            try {
                if (!city) return;
                
                // Önbellekte varsa oradan al
                if (this.districtCache.has(city)) {
                    this.districts = this.districtCache.get(city);
                    return;
                }

                const response = await api.get(`/address/districts/${city}`);
                if (response.data.success) {
                    this.districts = response.data.districts;
                    // Önbelleğe kaydet
                    this.districtCache.set(city, response.data.districts);
                }
            } catch (error) {
                this.handleError(error);
            }
        },

        // Adres seçimi (API çağrısı yapmadan)
        selectAddress(address) {
            this.selectedAddress = address;
        },

        // Yeni adres oluştur
        async createAddress(addressData) {
            try {
                if (!this.validateAddressData(addressData)) return false;

                this.loading = true;
                const response = await api.post('/address', addressData);
                
                if (response.data.success) {
                    this.addresses.push(response.data.address);
                    toast.success('Adres başarıyla eklendi');
                    return true;
                }
                return false;
            } catch (error) {
                this.handleError(error);
                return false;
            } finally {
                this.loading = false;
            }
        },

        // Adres güncelle
        async updateAddress(addressId, addressData) {
            try {
                this.loading = true;
                const response = await api.put(`/address/${addressId}`, addressData);
                if (response.data.success) {
                    // Sadece ilgili adresi güncelle
                    const updatedAddress = response.data.address;
                    const index = this.addresses.findIndex(addr => addr._id === addressId);
                    
                    if (index !== -1) {
                        this.addresses[index] = updatedAddress;
                    }
                    
                    // Eğer varsayılan adres güncellendiyse, diğer adreslerin varsayılan durumunu güncelle
                    if (addressData.isDefault) {
                        this.addresses.forEach(addr => {
                            if (addr._id !== addressId) {
                                addr.isDefault = false;
                            }
                        });
                        this.defaultAddress = updatedAddress;
                    }
                    
                    toast.success('Adres başarıyla güncellendi');
                    return true;
                } else {
                    throw new Error(response.data.message || 'Adres güncellenemedi');
                }
            } catch (error) {
                this.handleError(error);
                return false;
            } finally {
                this.loading = false;
            }
        },

        // Adres sil
        async deleteAddress(addressId) {
            try {
                this.loading = true;
                const response = await api.delete(`/address/${addressId}`);

                if (response.data.success) {
                    this.addresses = this.addresses.filter(addr => addr._id !== addressId);
                    toast.success('Adres başarıyla silindi');
                    return true;
                }
                return false;
            } catch (error) {
                this.handleError(error);
                return false;
            } finally {
                this.loading = false;
            }
        },

        // Form validasyonu
        validateAddressData(addressData) {
            const requiredFields = ['title', 'fullName', 'phone', 'city', 'district', 'neighborhood', 'fullAddress', 'zipCode', 'identityNumber'];
            const missingFields = requiredFields.filter(field => !addressData[field]);

            if (missingFields.length > 0) {
                const fieldNames = {
                    title: 'Adres Başlığı',
                    fullName: 'Ad Soyad',
                    phone: 'Telefon',
                    city: 'İl',
                    district: 'İlçe',
                    neighborhood: 'Mahalle',
                    fullAddress: 'Açık Adres',
                    zipCode: 'Posta Kodu',
                    identityNumber: 'TC Kimlik Numarası'
                };

                const missingFieldNames = missingFields.map(field => fieldNames[field] || field);
                toast.error(`Lütfen tüm alanları doldurun: ${missingFieldNames.join(', ')}`);
                return false;
            }

            // TC Kimlik numarası kontrolü
            const identityNumberRegex = /^[0-9]{11}$/;
            if (!identityNumberRegex.test(addressData.identityNumber)) {
                toast.error('TC Kimlik numarası 11 haneli olmalıdır');
                return false;
            }

            // Telefon numarası kontrolü
            const phoneRegex = /^[0-9]{10}$/;
            if (!phoneRegex.test(addressData.phone)) {
                toast.error('Telefon numarası 10 haneli olmalıdır');
                return false;
            }

            // Posta kodu kontrolü
            const zipCodeRegex = /^[0-9]{5}$/;
            if (!zipCodeRegex.test(addressData.zipCode)) {
                toast.error('Posta kodu 5 haneli olmalıdır');
                return false;
            }

            return true;
        },

        // Adres verilerini görüntüleme için hazırla
        formatAddressForDisplay(address) {
            if (!address) return null;
            
            return {
                ...address,
                // TC Kimlik numarası zaten backend'den maskelenmiş olarak geliyor (maskedIdentityNumber)
                displayIdentityNumber: address.maskedIdentityNumber || '*******####'
            };
        },

        // State'i temizle
        clearAddressState() {
            this.addresses = [];
            this.defaultAddress = null;
            this.cities = [];
            this.districts = [];
            this.loading = false;
            this.error = null;
            this.selectedCity = null;
            this.selectedAddress = null;
            this.citiesLoaded = false;
            this.districtCache.clear();
        }
    }
});
