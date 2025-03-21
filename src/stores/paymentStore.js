// stores/paymentStore.js
import { defineStore } from 'pinia';
import api from '@/services/axiosInstance';
import { useCartStore } from './cartStore';
import { useOrderStore } from './orderStore';
import { useAddressStore } from './addressStore';
import { useUserStore } from './userStore';
import { socketManager } from '@/plugins/socket';

export const usePaymentStore = defineStore('payment', {
    state: () => ({
        paymentDetails: {
            cardNumber: '',
            cardHolderName: '',
            cardExpireDateYear: '',
            cardExpireDateMonth: '',
            cardCVV2: '',
            cardType: ''
        },
        transactionDetails: {
            transactionType: 'Sale',
            installmentCount: 0,
            amount: 0,
            displayAmount: 0,
            currencyCode: '0949',
            transactionSecurity: '3'
        },
        cardHolderData: {
            billAddrCity: '',
            billAddrCountry: '792', // Türkiye için sabit
            billAddrLine1: '',
            billAddrPostCode: '',
            billAddrState: '',
            email: '',
            mobilePhone: {
                cc: '90', // Türkiye için sabit
                subscriber: ''
            }
        },
        loading: false,
        error: null,
        paymentStatus: null,
        threeDSecureUrl: null,
        transactionId: null,
        cardDetails: {
            cardHolderName: '',
            cardNumber: '',
            expireMonth: '',
            expireYear: '',
            cvv: ''
        },
        installmentCount: 1,
        installmentOptions: [],
        paymentAmount: null,
        paymentAmountFormatted: null,
        processingOrderId: null,
        // 3D Secure için yeni state
        threeDSecureData: {
            formAction: null,
            formInputs: null,
            isProcessing: false
        }
    }),

    getters: {
        isProcessing: state => state.loading,
        hasError: state => !!state.error,
        is3DSecure: state => !!state.threeDSecureUrl,
        currentStatus: state => state.paymentStatus,
        getError: state => state.error,
        getTransactionId: state => state.transactionId,
        getInstallmentOptions: state => state.installmentOptions,
        getSelectedInstallment: state => state.installmentCount,
        getPaymentDetails: state => state.paymentDetails,
        getCardHolderData: state => state.cardHolderData,
        getBillingAddress: state => state.billingAddress,
        getPaymentRequestData: state => state.preparePaymentRequestData()
    },

    actions: {
        // Socket event listeners
        initSocketListeners() {
            const socket = socketManager.initialize();
            if (socket) {
                socket.on('payment_status_update', this.handlePaymentStatusUpdate);
                socket.on('payment_error', this.handlePaymentError);
                socket.on('3d_secure_required', this.handle3DSecureRedirect);
            }
        },

        removeSocketListeners() {
            const socket = socketManager.socket;
            if (socket) {
                socket.off('payment_status_update', this.handlePaymentStatusUpdate);
                socket.off('payment_error', this.handlePaymentError);
                socket.off('3d_secure_required', this.handle3DSecureRedirect);
            }
        },

        // Payment preparation and validation
        async preparePaymentData() {
            const cartStore = useCartStore();
            const orderStore = useOrderStore();
            const addressStore = useAddressStore();

            // Sepet ve adres kontrolü
            if (!cartStore.hasItems) {
                throw new Error('Sepetiniz boş');
            }

            if (!addressStore.defaultAddress) {
                throw new Error('Teslimat adresi seçilmedi');
            }

            try {
                // Sepetteki her ürün için rezervasyon ID'lerini al
                const orderItems = cartStore.items.map(item => {
                    const reservationId = cartStore.getReservationId(item.product._id);
                    if (!reservationId) {
                        throw new Error(`${item.product.name} için geçerli bir rezervasyon bulunamadı. Lütfen tekrar deneyin.`);
                    }
                    return {
                        productId: item.product._id,
                        quantity: item.quantity,
                        unit: item.unit || 'adet',
                        reservationId: reservationId
                    };
                });

                // Sipariş verilerini hazırla
                const orderData = {
                    items: orderItems,
                    shippingAddressId: addressStore.defaultAddress._id,
                    totalAmount: cartStore.grandTotal  // Kargo dahil toplam tutar
                };

                console.log('Creating order with data:', orderData);

                // Siparişi oluştur
                const order = await orderStore.createOrder(orderData);

                if (!order || !order._id) {
                    throw new Error('Sipariş oluşturulamadı');
                }

                // Ödeme için gerekli müşteri bilgilerini hazırla
                const customerInfo = {
                    email: addressStore.defaultAddress.email,
                    name: addressStore.defaultAddress.fullName,
                    phone: addressStore.defaultAddress.phone,
                    address: addressStore.defaultAddress.fullAddress,
                    city: addressStore.defaultAddress.city,
                    district: addressStore.defaultAddress.district,
                    neighborhood: addressStore.defaultAddress.neighborhood,
                    zipCode: addressStore.defaultAddress.zipCode
                };

                // Payment verilerini hazırla
                return {
                    orderId: order._id,
                    amount: order.totalAmount,
                    customerInfo
                };
            } catch (error) {
                console.error('Error preparing payment data:', error);
                throw new Error(error.message || 'Ödeme hazırlığı sırasında bir hata oluştu');
            }
        },

        // Validate card details before submission
        validateCardDetails(cardDetails) {
            const { cardNumber, cardHolderName, expiryMonth, expiryYear, cvv, cardType } = cardDetails;

            // Kart tipi kontrolü
            if (!['TROY', 'VISA', 'MASTERCARD'].includes(cardType)) {
                throw new Error('Geçersiz kart tipi');
            }

            // Kart numarası kontrolü - sadece format kontrolü
            const cleanNumber = cardNumber.replace(/\D/g, '');
            if (cleanNumber.length !== 16) {
                throw new Error('Kart numarası 16 haneli olmalıdır');
            }

            // Kart tipine göre prefix kontrolü
            const firstDigit = cleanNumber[0];
            const firstTwoDigits = parseInt(cleanNumber.substring(0, 2));

            const isValidPrefix =
                (cardType === 'VISA' && firstDigit === '4') ||
                (cardType === 'MASTERCARD' && firstTwoDigits >= 51 && firstTwoDigits <= 55) ||
                (cardType === 'TROY' && firstDigit === '9');

            if (!isValidPrefix) {
                throw new Error('Kart numarası seçilen kart tipi ile uyuşmuyor');
            }

            // Kart sahibi adı kontrolü
            if (!cardHolderName || cardHolderName.trim().length < 5) {
                throw new Error('Geçersiz kart sahibi adı');
            }

            // Tarih kontrolü
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear() % 100;
            const currentMonth = currentDate.getMonth() + 1;

            const expYear = parseInt(expiryYear, 10);
            const expMonth = parseInt(expiryMonth, 10);

            if (isNaN(expYear) || isNaN(expMonth)) {
                throw new Error('Geçersiz tarih formatı');
            }

            if (expYear < currentYear ||
                (expYear === currentYear && expMonth < currentMonth) ||
                expMonth < 1 || expMonth > 12) {
                throw new Error('Geçersiz son kullanma tarihi');
            }

            // CVV kontrolü
            if (!cvv || !/^\d{3}$/.test(cvv)) {
                throw new Error('Geçersiz CVV');
            }

            return true;
        },

        // Luhn algoritması ile kart numarası kontrolü
        validateCardNumber(cardNumber) {
            if (!cardNumber || typeof cardNumber !== 'string') return false;

            // Sadece rakamları al
            const digits = cardNumber.replace(/\D/g, '');
            if (digits.length !== 16) return false;

            let sum = 0;
            let isEven = false;

            for (let i = digits.length - 1; i >= 0; i--) {
                let digit = parseInt(digits[i]);

                if (isEven) {
                    digit *= 2;
                    if (digit > 9) {
                        digit -= 9;
                    }
                }

                sum += digit;
                isEven = !isEven;
            }

            return sum % 10 === 0;
        },

        // Ödeme verilerini KT formatına dönüştür
        prepareKuveytTurkData(paymentData, orderId) {
            const { cardNumber, cardHolderName, expiryMonth, expiryYear, cvv, cardType, billingInfo } = paymentData;

            return {
                cardDetails: {
                    CardNumber: cardNumber.replace(/\s/g, ''),
                    CardHolderName: cardHolderName.trim().toUpperCase(),
                    CardExpireDateMonth: expiryMonth.toString().padStart(2, '0'),
                    CardExpireDateYear: expiryYear.toString().slice(-2),
                    CardCVV2: cvv,
                    CardType: cardType
                },
                CardHolderData: {
                    BillAddrCity: billingInfo?.city || '',
                    BillAddrCountry: '792', // Türkiye ISO kodu
                    BillAddrLine1: billingInfo?.addressLine || '',
                    BillAddrPostCode: billingInfo?.postCode || '',
                    BillAddrState: billingInfo?.state || '',
                    Email: billingInfo?.email || '',
                    MobilePhone: {
                        Cc: '90', // Türkiye ülke kodu
                        Subscriber: billingInfo?.phone?.replace(/\D/g, '') || ''
                    }
                },
                DeviceData: {
                    DeviceChannel: '02', // Web Browser
                    ClientIP: window.clientIP || '' // IP backend'den gelecek
                },
                MerchantOrderId: orderId,
                Amount: this.totalAmount, // Mevcut amount değeri
                Currency: 'TRY'
            };
        },

        // Payment initiation
        async initiatePayment(cardDetails) {
            this.loading = true;
            this.error = null;
            this.threeDSecureData = {
                formAction: null,
                formInputs: null,
                isProcessing: false
            };

            try {
                const cartStore = useCartStore();
                console.log('1. Payment başlatılıyor, cart durumu:', {
                    cartExists: !!cartStore?.cart,
                    cartItems: cartStore?.cart?.items?.length,
                    totalAmount: cartStore?.cart?.totalAmount
                });

                // 1. Adres ve kullanıcı verilerini al
                const addressStore = useAddressStore();
                const userStore = useUserStore();
                const orderStore = useOrderStore();

                await addressStore.fetchDefaultAddress();
                console.log('Adres verisi alındı:', addressStore.getDefaultAddress);

                // 2. Sipariş oluştur
                console.log('Order oluşturma öncesi cart durumu:', {
                    items: cartStore.cart.items.map(item => ({
                        productId: item.product._id,
                        productName: item.product.name,
                        reservation: cartStore.activeReservations[item.product._id]
                    }))
                });

                const orderData = {
                    items: cartStore.cart.items.map(item => {
                        const reservationId = cartStore.getReservationId(item.product._id);
                        if (!reservationId) {
                            throw new Error(`${item.product.name} için geçerli bir rezervasyon bulunamadı. Lütfen tekrar deneyin.`);
                        }
                        return {
                            productId: item.product._id,
                            quantity: item.quantity,
                            unit: item.unit,
                            reservationId: reservationId
                        };
                    }),
                    shippingAddressId: addressStore.getDefaultAddress._id,
                    totalAmount: cartStore.grandTotal  // Kargo dahil toplam tutar
                };

                const order = await orderStore.createOrder(orderData);
                console.log('Sipariş oluşturuldu:', order);

                // 3. CardHolderData hazırla
                const cardHolderData = this.prepareCardHolderData(addressStore.getDefaultAddress);
                console.log('CardHolderData hazırlandı:', cardHolderData);

                // 4. Kart bilgilerini doğrula
                this.validateCardDetails(cardDetails);
                console.log('Kart bilgileri doğrulandı');

                // 5. Ödeme verilerini hazırla
                const paymentData = await this.preparePaymentRequestData(cardDetails, cardHolderData);
                console.log('Ödeme verileri hazırlandı:', paymentData);

                // 6. API isteği gönder (order ID ile)
                const response = await api.post(`/payments/initiate/${order._id}`, paymentData);

                if (response.data.success) {
                    // 3D Secure kontrolü
                    if (response.data.data?.is3DSecure) {
                        const formData = response.data.data.formData;

                        // 3D Secure Response Log
                        console.log('3D Secure Response:', {
                            formAction: formData.formData.action,
                            formInputs: formData.formData.inputs,
                            rawResponse: response.data
                        });

                        // State güncelleme öncesi log
                        console.log('3D Secure state güncelleniyor');

                        // State güncelleme
                        this.threeDSecureData = {
                            formAction: formData.formData.action,
                            formInputs: formData.formData.inputs,
                            isProcessing: true
                        };

                        // State güncelleme sonrası log
                        console.log('3D Secure state güncellendi:', {
                            isProcessing: this.threeDSecureData.isProcessing,
                            formAction: this.threeDSecureData.formAction,
                            inputCount: Object.keys(this.threeDSecureData.formInputs || {}).length
                        });

                        console.log('3D Secure yönlendirmesi hazırlandı:', this.threeDSecureData);
                    }

                    this.transactionId = response.data.transactionId;
                    return response.data;
                } else {
                    throw new Error(response.data.message || 'Ödeme başlatılamadı');
                }
            } catch (error) {
                console.error('Ödeme başlatma hatası:', error);
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // 3D Secure form submit işlemi
        async submit3DSecureForm() {
            if (!this.threeDSecureData.isProcessing) {
                throw new Error('3D Secure işlemi başlatılmadı');
            }

            try {
                console.log('3D Secure form gönderiliyor:', {
                    action: this.threeDSecureData.formAction,
                    inputCount: Object.keys(this.threeDSecureData.formInputs || {}).length
                });

                // Form submit işlemi component tarafında gerçekleştirilecek
                return {
                    action: this.threeDSecureData.formAction,
                    inputs: this.threeDSecureData.formInputs
                };
            } catch (error) {
                console.error('3D Secure form submit hatası:', error);
                this.error = error.message;
                throw error;
            }
        },

        // Handle payment error
        handlePaymentError(error) {
            this.loading = false;
            this.paymentStatus = 'FAILED';

            const errorMessages = {
                'INVALID_CARD': 'Geçersiz kart bilgileri',
                'EXPIRED_CARD': 'Kartınızın son kullanma tarihi geçmiş',
                'INSUFFICIENT_FUNDS': 'Yetersiz bakiye',
                'DECLINED': 'İşlem reddedildi',
                'SYSTEM_ERROR': 'Sistem hatası oluştu',
                'TIMEOUT': 'İşlem zaman aşımına uğradı',
                'INVALID_MERCHANT': 'Geçersiz üye işyeri',
                'INVALID_TRANSACTION': 'Geçersiz işlem',
                'SECURITY_VIOLATION': 'Güvenlik ihlali',
                'CARD_NOT_ENROLLED': 'Kart 3D Secure sistemine kayıtlı değil'
            };

            this.error = errorMessages[error.response?.data?.errorCode] || error.message || 'Ödeme işlemi başarısız';
            this.lastError = {
                code: error.response?.data?.errorCode,
                message: this.error,
                timestamp: new Date()
            };
        },

        // Success handler
        async handlePaymentSuccess(data) {
            this.paymentStatus = 'SUCCESS';
            this.lastPaymentDate = new Date();

            const orderStore = useOrderStore();
            await orderStore.updateOrderStatus('PAID');

            this.clearPaymentData();
            return data;
        },

        // Event handlers
        handlePaymentStatusUpdate(status) {
            this.paymentStatus = status;

            switch (status) {
                case 'SUCCESS':
                    this.error = null;
                    this.lastPaymentDate = new Date();
                    break;
                case 'FAILED':
                    this.error = 'Ödeme işlemi başarısız oldu';
                    break;
                case 'TIMEOUT':
                    this.error = 'Ödeme işlemi zaman aşımına uğradı';
                    break;
                case 'CANCELLED':
                    this.error = 'Ödeme işlemi iptal edildi';
                    break;
            }

            const orderStore = useOrderStore();
            orderStore.updateOrderStatus(status);
        },

        handle3DSecureRedirect(data) {
            this.threeDSecureUrl = data.url;
            this.transactionId = data.transactionId;
            this.paymentStatus = 'REDIRECTING_3D';
        },

        // Update card details
        updateCardDetails(details) {
            this.paymentDetails = {
                ...this.paymentDetails,
                ...details
            };
        },

        // Update installment selection
        setInstallment(count) {
            this.selectedInstallment = count;
        },

        // Fetch available installment options
        async fetchInstallmentOptions(amount) {
            try {
                const response = await api.get(`/api/payments/installments?amount=${amount}`);
                this.installmentOptions = response.data.options;
                return response.data.options;
            } catch (error) {
                this.handlePaymentError(error);
                return [];
            }
        },

        // Cleanup
        clearPaymentData() {
            this.paymentDetails = null;
            this.threeDSecureUrl = null;
            this.error = null;
            this.transactionId = null;
            this.paymentStatus = null;

            // Aktif ödeme oturumundan çık
            if (this.activePaymentSession) {
                socketManager.emitSafely('LEAVE_PAYMENT_ROOM', {
                    orderId: this.activePaymentSession
                });
                this.activePaymentSession = null;
            }
        },

        // Store reset
        resetStore() {
            this.clearPaymentData();
            this.paymentStatus = null;
            this.lastPaymentDate = null;
            this.loading = false;
            this.installmentOptions = [];
            this.removeSocketListeners();
        },

        // Adres satırını formatlama
        _formatAddressLine(addressData) {
            if (!addressData) {
                throw new Error('Adres bilgisi eksik');
            }

            const addressParts = [
                addressData.fullAddress,
                addressData.neighborhood,
                addressData.district
            ];

            return addressParts
                .filter(Boolean)
                .join(' ')
                .trim()
                .replace(/\s+/g, ' ')
                .substring(0, 500);
        },

        // Telefon numarasını formatlama
        _formatPhoneNumber(phone) {
            if (!phone) {
                throw new Error('Telefon numarası eksik');
            }

            // Sadece rakamları al
            const cleanedNumber = phone.replace(/\D/g, '');

            // Başındaki 0'ı kaldır
            const subscriber = cleanedNumber.replace(/^0+/, '');

            if (subscriber.length !== 10) {
                throw new Error('Geçersiz telefon numarası formatı');
            }

            return {
                Cc: "90",
                Subscriber: subscriber
            };
        },

        // Adres verisi doğrulama
        _validateAddressData(addressData) {
            console.log('Adres verisi doğrulama başladı:', addressData);

            // Temel kontrol
            if (!addressData) {
                console.error('Adres verisi bulunamadı');
                throw new Error('Adres bilgileri eksik');
            }

            // Zorunlu alanları kontrol et
            const requiredFields = {
                city: 'Şehir',
                stateCode: 'Şehir Kodu',
                zipCode: 'Posta Kodu',
                phone: 'Telefon',
                fullAddress: 'Tam Adres'
            };

            // Her zorunlu alanı kontrol et
            for (const [field, label] of Object.entries(requiredFields)) {
                if (!addressData[field]) {
                    console.error(`${label} bilgisi eksik:`, { field, value: addressData[field] });
                    throw new Error(`${label} bilgisi eksik`);
                }
            }

            // Format kontrolü
            const validations = {
                phone: {
                    check: (value) => /^\d{10}$/.test(value.replace(/\D/g, '')),
                    message: 'Telefon numarası 10 haneli olmalıdır'
                },
                zipCode: {
                    check: (value) => /^\d{5}$/.test(value.replace(/\D/g, '')),
                    message: 'Posta kodu 5 haneli olmalıdır'
                },
                stateCode: {
                    check: (value) => /^TR-\d{2}$/.test(value),
                    message: 'Geçersiz şehir kodu formatı (TR-XX)'
                }
            };

            // Format kontrollerini uygula
            for (const [field, validation] of Object.entries(validations)) {
                const value = addressData[field];
                if (!validation.check(value)) {
                    console.error(`${field} format hatası:`, { field, value });
                    throw new Error(validation.message);
                }
            }

            console.log('Adres verisi doğrulama başarılı');
            return true;
        },

        // CardHolderData hazırlama
        prepareCardHolderData(addressData) {
            try {
                console.log('CardHolderData hazırlama başladı');

                // Adres verisi doğrulama
                this._validateAddressData(addressData);

                // Kullanıcı store'unu al
                const userStore = useUserStore();
                if (!userStore.user?.email) {
                    console.error('Kullanıcı email bilgisi eksik');
                    throw new Error('Kullanıcı email bilgisi eksik');
                }

                // Telefon numarasını formatla
                const phoneNumber = this._formatPhoneNumber(addressData.phone);
                console.log('Formatlanmış telefon:', phoneNumber);

                // Adresi formatla
                const formattedAddress = this._formatAddressLine(addressData);
                console.log('Formatlanmış adres:', formattedAddress);

                // CardHolderData nesnesini oluştur
                const cardHolderData = {
                    CardHolderData: {
                        BillAddrCity: addressData.city,
                        BillAddrCountry: "792", // Türkiye için sabit değer
                        BillAddrLine1: formattedAddress,
                        BillAddrPostCode: addressData.zipCode,
                        BillAddrState: addressData.stateCode.replace('TR-', ''),
                        Email: userStore.user.email,
                        MobilePhone: phoneNumber
                    }
                };

                console.log('CardHolderData hazırlama başarılı:', cardHolderData);
                return cardHolderData;

            } catch (error) {
                console.error('CardHolderData hazırlama hatası:', error);
                throw new Error(`Fatura bilgileri hazırlanamadı: ${error.message}`);
            }
        },

        // Kart bilgilerini doğrulama
        validateCardDetails(cardDetails) {
            if (!cardDetails) {
                throw new Error('Kart bilgileri eksik');
            }

            const {
                cardNumber,
                cardHolderName,
                expiryMonth,
                expiryYear,
                cvv
            } = cardDetails;

            // Kart numarası kontrolü
            if (!cardNumber || !/^\d{16}$/.test(cardNumber.replace(/\s/g, ''))) {
                throw new Error('Geçersiz kart numarası');
            }

            // Kart sahibi adı kontrolü
            if (!cardHolderName || cardHolderName.trim().length < 5) {
                throw new Error('Geçersiz kart sahibi adı');
            }

            // Son kullanma tarihi kontrolü
            if (!expiryMonth || !expiryYear ||
                !/^(0[1-9]|1[0-2])$/.test(expiryMonth) ||
                !/^\d{2}$/.test(expiryYear)) {
                throw new Error('Geçersiz son kullanma tarihi');
            }

            // CVV kontrolü
            if (!cvv || !/^\d{3}$/.test(cvv)) {
                throw new Error('Geçersiz CVV');
            }
        },

        // Ödeme verilerini hazırlama
        async preparePaymentRequestData(cardDetails, cardHolderData) {
            try {
                console.log('preparePaymentRequestData başlıyor', {
                    hasCardDetails: !!cardDetails,
                    hasCardHolderData: !!cardHolderData
                });

                const cartAmount = await this.getCartAmount();

                console.log('3. Ödeme verileri hazırlanıyor:', {
                    cartAmount: cartAmount,
                    cardHolderData: cardHolderData,
                    hasCardDetails: !!cardDetails
                });

                const paymentData = {
                    // Kart bilgileri
                    CardNumber: cardDetails.cardNumber.replace(/\s/g, ''),
                    CardHolderName: cardDetails.cardHolderName.toUpperCase(),
                    CardExpireDateYear: cardDetails.expiryYear,
                    CardExpireDateMonth: cardDetails.expiryMonth,
                    CardCVV2: cardDetails.cvv,
                    CardType: cardDetails.cardType,

                    // İşlem bilgileri
                    TransactionType: "Sale",
                    TransactionSecurity: "3",
                    InstallmentCount: 0,
                    Amount: cartAmount.Amount,
                    DisplayAmount: cartAmount.DisplayAmount,
                    CurrencyCode: cartAmount.CurrencyCode,

                    // CardHolderData
                    CardHolderData: cardHolderData
                };

                console.log('Hazırlanan ödeme verileri:', {
                    ...paymentData,
                    CardNumber: paymentData.CardNumber ? '****' + paymentData.CardNumber.slice(-4) : null,
                    CardCVV2: paymentData.CardCVV2 ? '***' : null
                });

                return paymentData;
            } catch (error) {
                console.error('Ödeme verileri hazırlama hatası:', error);
                throw new Error(`Ödeme verileri hazırlanamadı: ${error.message}`);
            }
        },

        // Tutar bilgilerini formatlama
        _formatAmount(amount) {
            if (!amount || amount <= 0) {
                console.warn('Geçersiz tutar formatlanmaya çalışılıyor:', amount);
                throw new Error('Geçersiz tutar');
            }

            // KT için tutar formatı: 1.00 TL -> 100
            const formattedAmount = Math.round(amount * 100);
            console.log(`Tutar formatlandı: ${amount} -> ${formattedAmount}`);
            return formattedAmount;
        },

        // Cart tutarını alma ve formatlama
        async getCartAmount() {
            try {
                console.log('getCartAmount metoduna girildi');

                const cartStore = useCartStore();

                if (!cartStore) {
                    console.error('CartStore bulunamadı');
                    throw new Error('Sepet bilgisi bulunamadı');
                }

                // Cart verisi yoksa yüklemeyi dene
                let cart = cartStore.cart;
                if (!cart) {
                    console.log('Cart verisi yok, fetchCart() çağırılıyor');
                    cart = await cartStore.fetchCart();
                    console.log('fetchCart() sonrası cart durumu:', {
                        cartExist: !!cart,
                        cartId: cart?._id,
                        totalAmount: cart?.totalAmount,
                        discountAmount: cart?.discountAmount,
                        discountedAmount: cart?.discountedTotalAmount
                    });
                }

                console.log('2. Cart tutarı alınıyor:', {
                    cartStoreExists: !!cartStore,
                    cartExists: !!cart,
                    cartId: cart?._id,
                    totalAmount: cart?.totalAmount,
                    discountedTotalAmount: cart?.discountedTotalAmount,
                    discountAmount: cart?.discountAmount,
                    coupon: cart?.coupon,
                    items: cart?.items?.length || 0,
                    grandTotal: cartStore.grandTotal
                });

                // Sepet verisi hala yoksa veya ürün yoksa hata ver
                if (!cart || !cart.items || cart.items.length === 0) {
                    console.error('Sepet boş veya bulunamadı', {
                        cartExists: !!cart,
                        items: cart?.items?.length || 0
                    });
                    throw new Error('Sepet tutarı bulunamadı');
                }

                // İndirimli tutar varsa onu kullan, yoksa normal tutarı kullan
                let baseAmount = cart.totalAmount || 0;
                if (cart.discountAmount > 0 && cart.discountedTotalAmount) {
                    baseAmount = cart.discountedTotalAmount;
                    console.log('İndirimli tutar kullanılıyor:', baseAmount);
                } else {
                    console.log('Normal tutar kullanılıyor:', baseAmount);
                }

                // Kargo ücreti ekle
                const shippingFee = cartStore.shippingFee || 200;
                const totalWithShipping = baseAmount + shippingFee;

                console.log('Sepet tutarı hesaplandı:', {
                    subtotal: cart.totalAmount,
                    discountedSubtotal: cart.discountedTotalAmount,
                    discountAmount: cart.discountAmount,
                    shipping: shippingFee,
                    grandTotal: totalWithShipping
                });

                return {
                    Amount: totalWithShipping, // Kargo dahil toplam tutar
                    DisplayAmount: this._formatAmount(totalWithShipping), // Kuruş formatına çevir
                    CurrencyCode: "0949"
                };
            } catch (error) {
                console.error('Sepet tutarı alma hatası:', error);
                throw new Error(`Sepet tutarı alınamadı: ${error.message}`);
            }
        },
    }
});
