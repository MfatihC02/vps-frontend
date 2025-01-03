<!-- PaymentView.vue -->
<template>
  <div class="payment-view">
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-if="!processing" class="payment-container">
      <div class="order-summary">
        <h2>Sipariş Özeti</h2>
        <div class="cart-items" v-if="cartDetails">
          <div v-for="item in cartDetails.items" :key="item._id" class="cart-item">
            <img :src="item.product.images[0].url" :alt="item.product.name" class="item-image">
            <div class="item-details">
              <h3>{{ item.product.name }}</h3>
              <p>Adet: {{ item.quantity }}</p>
              <p>Fiyat: {{ item.price }} TL</p>
            </div>
          </div>
        </div>
        <div class="total-amount">
          <strong>Toplam Tutar:</strong> {{ totalAmount }} TL
        </div>
      </div>

      <div class="payment-form-container">
        <h2>Ödeme Bilgileri</h2>
        <PaymentForm 
          :loading="loading"
          @submit="handlePayment"
        />
      </div>
    </div>

    <div v-else class="processing-payment">
      <div class="spinner"></div>
      <p>Ödeme işleminiz devam ediyor...</p>
      <p>Lütfen sayfadan ayrılmayın.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useCartStore } from '@/stores/cartStore'
import { useAddressStore } from '@/stores/addressStore'
import { usePaymentStore } from '@/stores/paymentStore'
import PaymentForm from '@/components/payment/PaymentForm.vue'

const router = useRouter()
const toast = useToast()
const cartStore = useCartStore()
const addressStore = useAddressStore()
const paymentStore = usePaymentStore()

const loading = ref(false)
const error = ref(null)
const processing = ref(false)

// Computed properties
const cartDetails = computed(() => cartStore.cart)
const selectedAddress = computed(() => addressStore.defaultAddress)
const totalAmount = computed(() => cartStore.totalAmount)

onMounted(async () => {
  try {
    // Sepeti yükle
    await cartStore.fetchCart()
    
    // Sepet boşsa ana sayfaya yönlendir
    if (!cartStore.hasItems) {
      toast.error('Sepetiniz boş')
      router.push('/')
      return
    }

    // Adres seçili değilse adres sayfasına yönlendir
    if (!selectedAddress.value) {
      toast.error('Lütfen bir teslimat adresi seçin')
      router.push('/adres')
      return
    }
  } catch (err) {
    error.value = err.message
    toast.error(error.value)
  }
})

const handlePayment = async (paymentData) => {
  try {
    loading.value = true;
    error.value = null;

    // Adres kontrolü
    if (!selectedAddress.value) {
      router.push('/adres');
      throw new Error('Lütfen bir teslimat adresi seçin');
    }

    // Sepet kontrolü
    if (!cartDetails.value?.items?.length) {
      router.push('/sepet');
      throw new Error('Sepetiniz boş');
    }

    console.log('Payment data received:', {
      ...paymentData,
      cardNumber: paymentData.cardNumber.replace(/\s/g, '')
    });

    // Ödeme başlat
    const result = await paymentStore.initiatePayment({
      ...paymentData,
      cardNumber: paymentData.cardNumber.replace(/\s/g, '')
    });
    
    if (result.requires3D) {
      processing.value = true;
      toast.info('3D Secure doğrulamasına yönlendiriliyorsunuz...');
      // 3D Secure sayfasına yönlendir
      setTimeout(() => {
        window.location.href = result.url;
      }, 1500); // Kullanıcıya toast mesajını görmesi için kısa bir süre ver
    }
  } catch (err) {
    error.value = err.message || 'Ödeme işlemi başlatılırken bir hata oluştu';
    toast.error(error.value);
    console.error('Payment error:', err);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.payment-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.payment-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.order-summary {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.cart-items {
  margin-top: 20px;
}

.cart-item {
  display: flex;
  gap: 15px;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.item-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
}

.item-details {
  flex: 1;
}

.item-details h3 {
  margin: 0 0 5px 0;
  font-size: 16px;
}

.item-details p {
  margin: 5px 0;
  color: #666;
}

.total-amount {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid #eee;
  font-size: 18px;
}

.payment-form-container {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.processing-payment {
  text-align: center;
  padding: 40px;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .payment-container {
    grid-template-columns: 1fr;
  }
}
</style>
