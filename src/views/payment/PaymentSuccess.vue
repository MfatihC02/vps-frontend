<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
    <div class="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
      <!-- Loading State -->
      <div v-if="loading" class="p-8 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p class="text-gray-600">Ödeme bilgileri yükleniyor...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="p-8 text-center">
        <div class="text-red-500 mb-4">
          <svg class="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 class="text-xl font-semibold text-gray-800 mb-2">Bir Hata Oluştu</h2>
        <p class="text-gray-600 mb-4">{{ error }}</p>
        <router-link to="/dashboard" class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
          Ana Sayfaya Dön
        </router-link>
      </div>

      <!-- Success State -->
      <div v-else class="p-8">
        <div class="text-center mb-8">
          <div class="text-green-500 mb-4">
            <svg class="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-gray-800 mb-2">Ödeme Başarılı!</h1>
          <p class="text-gray-600">Siparişiniz başarıyla oluşturuldu.</p>
        </div>
        
        <div v-if="orderDetails" class="space-y-4 mb-8">
          <div class="border-t border-b border-gray-100 py-4 space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-gray-600">Sipariş Numarası</span>
              <span class="text-gray-800 font-medium">{{ orderDetails.orderNumber }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-600">Toplam Tutar</span>
              <span class="text-gray-800 font-medium">{{ formatPrice(orderDetails.totalAmount) }} TL</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-600">Durum</span>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Ödeme Tamamlandı
              </span>
            </div>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-3">
          <router-link to="/siparislerim" class="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
            Siparişlerime Git
          </router-link>
          <router-link to="/" class="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
            Alışverişe Devam Et
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCartStore } from '@/stores/cartStore';
import api from '@/services/axiosInstance';

const route = useRoute();
const router = useRouter();
const cartStore = useCartStore();

const loading = ref(true);
const error = ref(null);
const orderDetails = ref(null);

const orderId = route.query.orderId || '';
const status = route.query.status || '';
const paymentId = route.query.paymentId || '';

const formatPrice = (price) => {
  return new Intl.NumberFormat('tr-TR').format(price);
};

const loadOrderDetails = async () => {
  try {
    loading.value = true;
    error.value = null;

    const response = await api.get(`/orders/${orderId}`);
    orderDetails.value = response.data.data;

    if (status !== 'success' || response.data.data.status !== 'PAYMENT_COMPLETED') {
      throw new Error('Ödeme durumu geçersiz');
    }

    // Ödeme başarılı olduğunda sepeti temizle
    await cartStore.clearCart();
    loading.value = false;
  } catch (err) {
    loading.value = false;
    error.value = 'Sipariş detayları yüklenirken bir hata oluştu';
    console.error('Ödeme success sayfası hatası:', err);
  }
};

onMounted(async () => {
  if (!orderId || !status || !paymentId) {
    router.push('/dashboard');
    return;
  }

  await loadOrderDetails();
});
</script>

<style scoped>
.min-h-screen {
  min-height: 100vh;
}

.bg-gray-50 {
  background-color: #f9fafb;
}

.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.justify-center {
  justify-content: center;
}

.p-4 {
  padding: 1rem;
}

.sm\:p-6 {
  padding: 1.5rem;
}

.lg\:p-8 {
  padding: 2rem;
}

.max-w-md {
  max-width: 720px;
}

.w-full {
  width: 100%;
}

.bg-white {
  background-color: #ffffff;
}

.rounded-xl {
  border-radius: 0.75rem;
}

.shadow-lg {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.overflow-hidden {
  overflow: hidden;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

.rounded-full {
  border-radius: 50%;
}

.h-12 {
  height: 3rem;
}

.w-12 {
  width: 3rem;
}

.border-b-2 {
  border-bottom-width: 2px;
}

.border-primary {
  border-color: #3498db;
}

.mx-auto {
  margin-left: auto;
  margin-right: auto;
}

.mb-4 {
  margin-bottom: 1rem;
}

.text-gray-600 {
  color: #718096;
}

.text-red-500 {
  color: #e3342f;
}

.h-12 {
  height: 3rem;
}

.w-12 {
  width: 3rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.text-xl {
  font-size: 1.25rem;
}

.font-semibold {
  font-weight: 600;
}

.text-gray-800 {
  color: #2f365f;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.inline-flex {
  display: inline-flex;
}

.items-center {
  align-items: center;
}

.px-4 {
  padding-left: 1rem;
  padding-right: 1rem;
}

.py-2 {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.border {
  border-width: 1px;
}

.border-transparent {
  border-color: transparent;
}

.rounded-md {
  border-radius: 0.375rem;
}

.shadow-sm {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.text-sm {
  font-size: 0.875rem;
}

.font-medium {
  font-weight: 500;
}

.text-white {
  color: #ffffff;
}

.bg-primary {
  background-color: #3498db;
}

.hover\:bg-primary-dark {
  background-color: #2e6da4;
}

.focus\:outline-none {
  outline: none;
}

.focus\:ring-2 {
  ring-width: 2px;
}

.focus\:ring-offset-2 {
  ring-offset-width: 2px;
}

.focus\:ring-primary {
  ring-color: #3498db;
}

.text-green-500 {
  color: #34c759;
}

.h-16 {
  height: 4rem;
}

.w-16 {
  width: 4rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.text-2xl {
  font-size: 1.5rem;
}

.font-bold {
  font-weight: 700;
}

.space-y-4 {
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.mb-8 {
  margin-bottom: 2rem;
}

.border-t {
  border-top-width: 1px;
}

.border-b {
  border-bottom-width: 1px;
}

.border-gray-100 {
  border-color: #f7fafc;
}

.py-4 {
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.space-y-3 {
  margin-top: 0.75rem;
  margin-bottom: 0.75rem;
}

.flex {
  display: flex;
}

.justify-between {
  justify-content: space-between;
}

.items-center {
  align-items: center;
}

.text-gray-800 {
  color: #2f365f;
}

.font-medium {
  font-weight: 500;
}

.inline-flex {
  display: inline-flex;
}

.items-center {
  align-items: center;
}


.rounded-full {
  border-radius: 50%;
}

.text-xs {
  font-size: 0.75rem;
}

.font-medium {
  font-weight: 500;
}

.bg-green-100 {
  background-color: #dcfce7;
}

.text-green-800 {
  color: #2f9e44;
}

.flex-1 {
  flex: 1;
}

.inline-flex {
  display: inline-flex;
}

.justify-center {
  justify-content: center;
}

.items-center {
  align-items: center;
}

.px-4 {
  padding-left: 1rem;
  padding-right: 1rem;
}

.py-2 {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.border {
  border-width: 1px;
}

.border-transparent {
  border-color: transparent;
}

.rounded-md {
  border-radius: 0.375rem;
}

.shadow-sm {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.text-sm {
  font-size: 0.875rem;
}

.font-medium {
  font-weight: 500;
}

.text-white {
  color: #ffffff;
}

.bg-primary {
  background-color: #3498db;
}

.hover\:bg-primary-dark {
  background-color: #2e6da4;
}

.focus\:outline-none {
  outline: none;
}

.focus\:ring-2 {
  ring-width: 2px;
}

.focus\:ring-offset-2 {
  ring-offset-width: 2px;
}

.focus\:ring-primary {
  ring-color: #3498db;
}

.border {
  border-width: 1px;
}

.border-gray-300 {
  border-color: #d1d5db;
}

.rounded-md {
  border-radius: 0.375rem;
}

.shadow-sm {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.text-sm {
  font-size: 0.875rem;
}

.font-medium {
  font-weight: 500;
}

.text-gray-700 {
  color: #4a5568;
}

.bg-white {
  background-color: #ffffff;
}

.hover\:bg-gray-50 {
  background-color: #f9fafb;
}

.focus\:outline-none {
  outline: none;
}

.focus\:ring-2 {
  ring-width: 2px;
}

.focus\:ring-offset-2 {
  ring-offset-width: 2px;
}

.focus\:ring-primary {
  ring-color: #3498db;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
