<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white rounded-lg shadow-md overflow-hidden">
      <!-- Loading State -->
      <div v-if="loading" class="p-6 text-center">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500 mx-auto mb-3"></div>
        <p class="text-gray-600">Bilgiler yükleniyor...</p>
      </div>

      <!-- Payment Failed Content -->
      <div v-else class="p-6">
        <div class="text-center mb-6">
          <div class="text-red-500 mb-4">
            <svg class="h-14 w-14 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 class="text-xl font-bold text-gray-800 mb-2">Ödeme Başarısız</h1>
          <p class="text-gray-600 text-sm">Ödeme işlemi tamamlanamadı.</p>
        </div>
        
        <!-- Order Details -->
        <div v-if="orderDetails" class="mb-6 border-t border-b border-gray-100 py-3">
          <div class="flex justify-between items-center mb-2">
            <span class="text-gray-500 text-sm">Sipariş No</span>
            <span class="text-gray-800 font-medium">{{ orderDetails.orderNumber }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-500 text-sm">Tutar</span>
            <span class="text-gray-800 font-medium">{{ formatPrice(orderDetails.totalAmount) }} TL</span>
          </div>
        </div>
        
        <!-- Bank Response -->
        <div class="mb-5 bg-red-50 rounded-md p-3">
          <h3 class="text-sm font-medium text-red-800 mb-1">Banka Yanıtı</h3>
          <p class="text-sm text-red-700">{{ errorMessage }}</p>
          <p v-if="errorCode" class="text-xs text-red-600 mt-1">Hata Kodu: {{ errorCode }}</p>
        </div>
        
        <!-- Help Message -->
        <div v-if="errorCode" class="mb-5 bg-yellow-50 rounded-md p-3">
          <h3 class="text-sm font-medium text-yellow-800 mb-1">Çözüm Önerisi</h3>
          <p class="text-xs text-yellow-700">{{ getHelpMessage(errorCode) }}</p>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-2">
          <router-link to="/sepet" class="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none">
            Sepete Dön
          </router-link>
          <router-link to="/" class="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">
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
import api from '@/services/axiosInstance';

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const orderDetails = ref(null);

// URL parametrelerinden değerleri al
const orderId = route.query.orderId || '';
const paymentId = route.query.paymentId || '';
const errorMessage = route.query.error || 'Ödeme işlemi sırasında bir sorun oluştu';
const errorCode = route.query.code || '';

const formatPrice = (price) => {
  return new Intl.NumberFormat('tr-TR').format(price);
};

// Sadece en yaygın banka hata kodları için yardım mesajları
const getHelpMessage = (code) => {
  const helpMessages = {
    '51': 'Kartınızda yeterli bakiye bulunmuyor. Lütfen bakiyenizi kontrol edin veya başka bir kart ile ödeme yapmayı deneyin.',
    '61': 'Kartınızın günlük/aylık harcama limiti aşılmış. Bankanızla iletişime geçebilir veya başka bir kart ile ödeme yapabilirsiniz.',
    '57': 'Kartınız internetten alışverişe kapalı. Bankanızın mobil uygulamasından kartınızı internette kullanıma açtırabilirsiniz.',
    '54': 'Kartınızın son kullanma tarihi geçmiş. Lütfen kart bilgilerinizi kontrol edin.'
  };
  
  return helpMessages[code] || 'Lütfen kart bilgilerinizi kontrol edin veya bankanızla iletişime geçin.';
};

const loadOrderDetails = async () => {
  try {
    loading.value = true;
    const response = await api.get(`/orders/${orderId}`);
    orderDetails.value = response.data.data;
    loading.value = false;
  } catch (err) {
    loading.value = false;
    console.error('Ödeme failed sayfası hatası:', err);
  }
};

onMounted(async () => {
  if (!orderId) {
    router.push('/');
    return;
  }
  await loadOrderDetails();
});
</script>
