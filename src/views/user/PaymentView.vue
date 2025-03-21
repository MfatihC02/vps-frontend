<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
      <!-- Ödeme Adımları -->
      <div class="mb-8 pt-4">
        <div class="flex items-center justify-center">
          <div class="flex items-center">
            <div
              class="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-gray-600"
            >
              <span class="text-sm font-medium">1</span>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-900">Sepet</p>
            </div>
          </div>

          <div class="w-12 h-0.5 bg-gray-200 mx-2"></div>

          <div class="flex items-center">
            <div
              class="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-gray-600"
            >
              <span class="text-sm font-medium">2</span>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-900">Adres</p>
            </div>
          </div>

          <div class="w-12 h-0.5 bg-gray-200 mx-2"></div>

          <div class="flex items-center">
            <div
              class="flex items-center justify-center w-10 h-10 rounded-full bg-green-600 text-white"
            >
              <span class="text-sm font-medium">3</span>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-900">Ödeme</p>
            </div>
          </div>
        </div>
      </div>

      <div class="lg:grid lg:grid-cols-12 gap-8">
        <!-- Sol Taraf - Sipariş Bilgileri -->
        <div class="lg:col-span-5">
          <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 class="text-lg font-medium text-gray-900 mb-6">
              Sipariş Özeti
            </h2>

            <div class="border-t border-gray-200 pt-4 mt-4">
              <div v-if="loading" class="flex justify-center items-center py-8">
                <div
                  class="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"
                ></div>
              </div>

              <div v-else-if="!cartStore.items.length" class="text-center py-6">
                <p class="text-gray-500">Sepetinizde ürün bulunmamaktadır.</p>
                <button
                  @click="$router.push('/cart')"
                  class="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                >
                  Sepete Dön
                </button>
              </div>

              <div v-else>
                <!-- Ürünler Listesi -->
                <div class="space-y-4 mb-6">
                  <div
                    v-for="item in cartStore.items"
                    :key="item._id"
                    class="flex justify-between"
                  >
                    <div class="flex">
                      <div class="w-12 h-12 rounded-md overflow-hidden">
                        <img
                          :src="
                            item.product.images?.[0]?.url || '/placeholder.jpg'
                          "
                          :alt="item.product.name"
                          class="w-full h-full object-cover"
                        />
                      </div>
                      <div class="ml-4">
                        <p class="text-sm font-medium text-gray-900">
                          {{ item.product.name }}
                        </p>
                        <p class="text-sm text-gray-500">
                          {{ item.quantity }} adet
                        </p>
                      </div>
                    </div>
                    <p class="text-sm font-medium text-gray-900">
                      ₺{{ formatPrice(item.price * item.quantity) }}
                    </p>
                  </div>
                </div>

                <!-- Fiyat Detayları -->
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <p class="text-sm text-gray-600">Ara Toplam</p>
                    <p class="text-sm font-medium text-gray-900">
                      ₺{{ formatPrice(cartStore.cart?.totalAmount || 0) }}
                    </p>
                  </div>

                  <!-- Kupon İndirimi (Varsa) -->
                  <div
                    v-if="cartStore.cart?.discountAmount > 0"
                    class="flex justify-between"
                  >
                    <p class="text-sm text-green-600">
                      {{ cartStore.cart.coupon?.code }} İndirimi
                    </p>
                    <p class="text-sm font-medium text-green-600">
                      -₺{{ formatPrice(cartStore.cart.discountAmount) }}
                    </p>
                  </div>

                  <!-- İndirimli Ara Toplam (Varsa) -->
                  <div
                    v-if="cartStore.cart?.discountAmount > 0"
                    class="flex justify-between"
                  >
                    <p class="text-sm text-gray-600">İndirimli Ara Toplam</p>
                    <p class="text-sm font-medium text-gray-900">
                      ₺{{ formatPrice(cartStore.cart.discountedTotalAmount) }}
                    </p>
                  </div>

                  <div class="flex justify-between">
                    <p class="text-sm text-gray-600">Kargo Ücreti</p>
                    <p class="text-sm font-medium text-gray-900">
                      ₺{{ formatPrice(cartStore.shipping || 200) }}
                    </p>
                  </div>

                  <div class="border-t border-gray-200 pt-2 mt-2">
                    <div class="flex justify-between">
                      <p class="text-base font-medium text-gray-900">Toplam</p>
                      <p class="text-base font-medium text-gray-900">
                        ₺{{ formatPrice(calculateTotalAmount()) }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Teslimat Adresi -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">
              Teslimat Adresi
            </h2>

            <div v-if="loading" class="flex justify-center items-center py-4">
              <div
                class="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"
              ></div>
            </div>

            <div
              v-else-if="!addressStore.defaultAddress"
              class="text-center py-4"
            >
              <p class="text-gray-500">Teslimat adresi belirtilmemiş.</p>
              <button
                @click="$router.push('/adres')"
                class="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                Adres Seç
              </button>
            </div>

            <div v-else class="border border-gray-200 rounded-md p-4">
              <p class="font-medium text-gray-900">
                {{ addressStore.defaultAddress.fullName }}
              </p>
              <p class="text-gray-600 mt-1">
                {{ addressStore.defaultAddress.phone }}
              </p>
              <p class="text-gray-600 mt-1">
                {{ addressStore.defaultAddress.fullAddress }},
                {{ addressStore.defaultAddress.neighborhood }},
                {{ addressStore.defaultAddress.district }},
                {{ addressStore.defaultAddress.city }}
                {{ addressStore.defaultAddress.zipCode }}
              </p>

              <button
                @click="$router.push('/adres')"
                class="mt-4 inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Değiştir
              </button>
            </div>
          </div>
        </div>

        <!-- Sağ Taraf - Ödeme Formu -->
        <div class="lg:col-span-7 mt-6 lg:mt-0">
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-6">
              Ödeme Bilgileri
            </h2>

            <div
              v-if="paymentError"
              class="bg-red-50 border border-red-200 rounded-md p-4 mb-6"
            >
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg
                    class="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-red-800">Ödeme Hatası</h3>
                  <div class="mt-2 text-sm text-red-700">
                    <p>{{ paymentError }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Ödeme Formu Komponenti -->
            <PaymentForm
              :total-amount="calculateTotalAmount()"
              @submit="handlePayment"
              :loading="isProcessing"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useCartStore } from "@/stores/cartStore";
import { useAddressStore } from "@/stores/addressStore";
import { usePaymentStore } from "@/stores/paymentStore";
import { useOrderStore } from "@/stores/orderStore";
import { useToast } from "vue-toastification";
import PaymentForm from "@/components/payment/PaymentForm.vue";

const router = useRouter();
const toast = useToast();
const cartStore = useCartStore();
const addressStore = useAddressStore();
const paymentStore = usePaymentStore();
const orderStore = useOrderStore();

const loading = ref(false);
const isProcessing = ref(false);
const paymentError = ref(null);

// Toplam tutarı hesaplama - Kupon indirimi varsa dikkate alarak
const calculateTotalAmount = () => {
  console.log("calculateTotalAmount çağrıldı", {
    cart: cartStore.cart,
    discountedTotalAmount: cartStore.cart?.discountedTotalAmount,
    totalAmount: cartStore.cart?.totalAmount,
    shipping: cartStore.shipping || 200,
  });

  // Eğer indirimli toplam varsa onu kullan, yoksa normal toplamı kullan
  const baseAmount =
    cartStore.cart?.discountedTotalAmount || cartStore.cart?.totalAmount || 0;
  return baseAmount + (cartStore.shipping || 200);
};

// Fiyat formatlama
const formatPrice = (price) => {
  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
};

// Sayfa yüklendiğinde verileri al
onMounted(async () => {
  try {
    loading.value = true;

    // Sepet ve adres verilerini kontrol et
    await cartStore.fetchCart();
    await addressStore.fetchDefaultAddress();

    // Sepet veya adres yoksa yönlendir
    if (!cartStore.items.length) {
      toast.warning("Sepetinizde ürün bulunmamaktadır.");
      router.push("/cart");
      return;
    }

    if (!addressStore.defaultAddress) {
      toast.warning("Lütfen bir teslimat adresi seçin.");
      router.push("/adres");
      return;
    }

    console.log("Ödeme sayfası hazır, veriler yüklendi", {
      cartItemCount: cartStore.items.length,
      hasAddress: !!addressStore.defaultAddress,
      totalAmount: calculateTotalAmount(),
    });
  } catch (error) {
    console.error("Veri yükleme hatası:", error);
    toast.error("Bilgiler yüklenirken bir hata oluştu.");
  } finally {
    loading.value = false;
  }
});

// Ödeme işlemi
const handlePayment = async (cardDetails) => {
  try {
    paymentError.value = null;
    isProcessing.value = true;

    console.log("Ödeme işlemi başlatılıyor", {
      cardNumber: cardDetails.cardNumber
        ? "****" + cardDetails.cardNumber.slice(-4)
        : null,
      hasAddress: !!addressStore.defaultAddress,
      totalAmount: calculateTotalAmount(),
    });

    // Ödeme işlemini başlat
    const result = await paymentStore.initiatePayment(cardDetails);

    if (result.success) {
      toast.success("Ödeme işlemi başarıyla tamamlandı.");
      router.push("/siparisler");
    } else {
      paymentError.value =
        result.message || "Ödeme işlemi sırasında bir hata oluştu.";
      toast.error(paymentError.value);
    }
  } catch (error) {
    console.error("Payment error:", error);
    paymentError.value =
      error.message || "Ödeme işlemi sırasında bir hata oluştu.";
    toast.error(paymentError.value);
  } finally {
    isProcessing.value = false;
  }
};
</script> 