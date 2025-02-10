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
          <div
            v-for="item in cartDetails.items"
            :key="item._id"
            class="cart-item"
          >
            <img
              :src="item.product.images[0].url"
              :alt="item.product.name"
              class="item-image"
            />
            <div class="item-details">
              <h3>{{ item.product.name }}</h3>
              <p>Adet: {{ item.quantity }}</p>
              <p>Fiyat: {{ item.price }} TL</p>
            </div>
          </div>
        </div>
        <div class="total-details mt-4 space-y-3">
          <div class="flex justify-between">
            <span class="text-gray-600">Ürünler Toplamı:</span>
            <span>₺{{ formatPrice(cartStore.subtotal) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Kargo Ücreti:</span>
            <span>₺{{ formatPrice(cartStore.shipping) }}</span>
          </div>
          <div class="flex justify-between font-semibold text-lg border-t pt-3">
            <span>Ödenecek Tutar:</span>
            <span>₺{{ formatPrice(cartStore.grandTotal) }}</span>
          </div>
        </div>
      </div>

      <div class="payment-form-container">
        <h2>Ödeme Bilgileri</h2>
        <PaymentForm :loading="loading" @submit="handlePayment" />
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
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import { useCartStore } from "@/stores/cartStore";
import { useAddressStore } from "@/stores/addressStore";
import { usePaymentStore } from "@/stores/paymentStore";
import PaymentForm from "@/components/payment/PaymentForm.vue";

const router = useRouter();
const toast = useToast();
const cartStore = useCartStore();
const addressStore = useAddressStore();
const paymentStore = usePaymentStore();

const loading = ref(false);
const error = ref(null);
const processing = ref(false);

// Computed properties
const cartDetails = computed(() => cartStore.cart);
const selectedAddress = computed(() => addressStore.defaultAddress);
const totalAmount = computed(() => cartStore.totalAmount);

// Fiyat formatlama fonksiyonu
const formatPrice = (price) => {
  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
};

onMounted(async () => {
  try {
    // Sepeti yükle
    await cartStore.fetchCart();

    // Sepet boşsa ana sayfaya yönlendir
    if (!cartStore.hasItems) {
      toast.error("Sepetiniz boş");
      router.push("/");
      return;
    }

    // Adres seçili değilse adres sayfasına yönlendir
    if (!selectedAddress.value) {
      toast.error("Lütfen bir teslimat adresi seçin");
      router.push("/adres");
      return;
    }
  } catch (err) {
    error.value = err.message;
    toast.error(error.value);
  }
});

const handlePayment = async (paymentData) => {
  try {
    processing.value = true;
    error.value = null;

    // Sepet kontrolü
    if (!cartDetails.value?.items?.length) {
      router.push("/sepet");
      throw new Error("Sepetiniz boş");
    }

    // Rezervasyonları yenile ve kontrol et
    const reservationsValid = await cartStore.refreshReservations();

    if (!reservationsValid) {
      throw new Error(
        "Ürün rezervasyonları güncellenemedi. Lütfen tekrar deneyin."
      );
    }

    // Adres kontrolü
    if (!selectedAddress.value) {
      router.push("/adres");
      throw new Error("Lütfen bir teslimat adresi seçin");
    }

    // Ödeme verisi hazırla - grandTotal'i kullan
    const paymentRequestData = {
      ...paymentData,
      cardNumber: paymentData.cardNumber.replace(/\s/g, ""),
      Amount: cartStore.grandTotal, // Kargo dahil toplam tutar
    };

    // Ödeme başlat
    const result = await paymentStore.initiatePayment(paymentRequestData);

    // 3D Secure kontrolü - Hem eski hem yeni yapıyı destekle
    if (result.requires3D || result.data?.is3DSecure) {
      processing.value = true;
      toast.info("3D Secure doğrulamasına yönlendiriliyorsunuz...");

      // Kısa bir bekleme süresi ekle
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (result.data?.is3DSecure) {
        // Yeni 3D Secure form yapısı
        const formData = result.data.formData.formData;

        // Form oluştur
        const form = document.createElement("form");
        form.method = formData.method;
        form.action = formData.action;

        // Input'ları ekle
        Object.entries(formData.inputs).forEach(([name, value]) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = name;
          input.value = value;
          form.appendChild(input);
        });

        // Formu sayfaya ekle ve submit et
        document.body.appendChild(form);
        form.submit();
      } else if (result.requires3D) {
        // Eski yapı için URL yönlendirmesi
        window.location.href = result.url;
      }
    }
  } catch (err) {
    error.value = err.message || "Ödeme işlemi başlatılırken bir hata oluştu";
    toast.error(error.value);
    console.error("Payment error:", err);
  } finally {
    loading.value = false;
  }
};
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

.total-details {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid #eee;
  font-size: 18px;
}

.payment-form-container {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .payment-container {
    grid-template-columns: 1fr;
  }
}
</style>
