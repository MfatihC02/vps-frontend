<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-3 py-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div
        class="flex items-center justify-between mb-6 bg-white p-4 rounded-lg shadow-sm"
      >
        <div class="flex items-center">
          <ShoppingBag class="w-6 h-6 text-green-600 mr-2" />
          <h1 class="text-xl font-semibold text-gray-900">Sepetim</h1>
          <span class="ml-2 text-sm text-gray-500">
            ({{ cartStore.totalItems }} ürün)
          </span>
        </div>
        <button
          class="text-green-600 hover:text-green-700 text-sm font-medium flex items-center"
          @click="$router.push('/products')"
        >
          <ArrowLeft class="w-4 h-4 mr-1" />
          <span class="hidden sm:inline">Alışverişe Devam Et</span>
        </button>
      </div>

      <!-- Ana İçerik -->
      <div class="lg:grid lg:grid-cols-3 gap-6">
        <!-- Ürün Listesi -->
        <div class="lg:col-span-2">
          <div v-if="loading" class="flex justify-center items-center py-8">
            <div
              class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"
            ></div>
          </div>

          <div
            v-else-if="cartStore.isEmpty"
            class="bg-white rounded-lg shadow-sm p-12 text-center"
          >
            <div class="max-w-md mx-auto">
              <ShoppingBag class="w-16 h-16 text-gray-400 mx-auto mb-6" />
              <h3 class="text-2xl font-semibold text-gray-900 mb-4">
                Sepetiniz Boş
              </h3>
              <p class="text-gray-600 mb-8">
                Sepetinizde henüz ürün bulunmamaktadır. Ürünlerimizi inceleyerek
                alışverişe başlayabilirsiniz.
              </p>
              <button
                @click="$router.push('/products')"
                class="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 transition-colors duration-200"
              >
                <ShoppingBag class="w-5 h-5 mr-2" />
                Alışverişe Başla
              </button>
            </div>
          </div>

          <div v-else class="bg-white rounded-lg shadow-sm overflow-hidden">
            <div
              class="hidden sm:grid sm:grid-cols-12 text-sm font-medium text-gray-500 bg-gray-50 px-6 py-3"
            >
              <div class="col-span-6">Ürün Bilgisi</div>
              <div class="col-span-2 text-center">Birim Fiyat</div>
              <div class="col-span-2 text-center">Miktar</div>
              <div class="col-span-2 text-right">Toplam</div>
            </div>

            <div
              v-for="item in cartStore.items"
              :key="item._id"
              class="px-4 py-4 sm:px-6 border-b last:border-b-0"
            >
              <div class="sm:grid sm:grid-cols-12 sm:gap-4 items-center">
                <!-- Ürün Bilgisi -->
                <div class="sm:col-span-6">
                  <div class="flex items-center">
                    <img
                      :src="item.product.images?.[0]?.url || '/placeholder.jpg'"
                      :alt="item.product.name"
                      class="h-20 w-20 object-cover rounded-md"
                    />
                    <div class="ml-4">
                      <h3 class="text-sm font-medium text-gray-900">
                        {{ item.product.name }}
                      </h3>
                      <p class="mt-1 text-sm text-gray-500">
                        SKU: {{ item.product.sku }}
                      </p>
                      <p class="mt-1 text-sm text-gray-500">
                        Birim: {{ item.unit }}
                      </p>
                      <!-- Stok Durumu -->
                      <div
                        class="stock-status"
                        :class="{
                          available:
                            getStockStatus(item.product._id) === 'available',
                          low: getStockStatus(item.product._id) === 'low',
                          out: getStockStatus(item.product._id) === 'out',
                        }"
                      >
                        <div class="flex items-center">
                          <span
                            v-if="getStockStatus(item.product._id) === 'out'"
                            class="flex items-center text-red-600"
                          >
                            <AlertCircle class="w-4 h-4 mr-1" />
                            <span>Stokta yok</span>
                          </span>
                          <span
                            v-else-if="
                              getStockStatus(item.product._id) === 'low'
                            "
                            class="flex items-center text-orange-600"
                          >
                            <AlertTriangle class="w-4 h-4 mr-1" />
                            <span>Stok tükeniyor</span>
                          </span>
                          <span v-else class="flex items-center text-green-600">
                            <Check class="w-4 h-4 mr-1" />
                            <span>Stokta var</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Birim Fiyat -->
                <div class="sm:col-span-2 mt-4 sm:mt-0 text-center">
                  <span class="sm:hidden text-sm text-gray-500 mr-2"
                    >Birim Fiyat:</span
                  >
                  <span class="text-sm font-medium"
                    >₺{{ formatPrice(item.price) }}</span
                  >
                </div>

                <!-- Miktar -->
                <div class="sm:col-span-2 mt-4 sm:mt-0">
                  <div class="flex items-center justify-center">
                    <button
                      @click="updateQuantity(item.product, item.quantity - 1)"
                      class="p-1 rounded-md hover:bg-gray-100"
                      :disabled="item.quantity <= 1 || loading"
                    >
                      <Minus
                        class="w-4 h-4"
                        :class="
                          item.quantity <= 1 || loading
                            ? 'text-gray-300'
                            : 'text-gray-600'
                        "
                      />
                    </button>
                    <span class="mx-2 w-8 text-center">{{
                      item.quantity
                    }}</span>
                    <button
                      @click="updateQuantity(item.product, item.quantity + 1)"
                      class="p-1 rounded-md hover:bg-gray-100"
                      :disabled="
                        !canIncreaseQuantity(item.product._id, item.quantity) ||
                        loading
                      "
                    >
                      <Plus
                        class="w-4 h-4"
                        :class="
                          !canIncreaseQuantity(
                            item.product._id,
                            item.quantity
                          ) || loading
                            ? 'text-gray-300'
                            : 'text-gray-600'
                        "
                      />
                    </button>
                  </div>
                </div>

                <!-- Toplam -->
                <div class="sm:col-span-2 mt-4 sm:mt-0 text-right">
                  <span class="sm:hidden text-sm text-gray-500 mr-2"
                    >Toplam:</span
                  >
                  <span class="text-sm font-medium"
                    >₺{{ formatPrice(item.quantity * item.price) }}</span
                  >
                  <button
                    @click="removeFromCart(item.product)"
                    class="ml-4 text-red-600 hover:text-red-800"
                    :disabled="loading"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sipariş Özeti -->
        <div class="mt-6 lg:mt-0" v-if="!cartStore.isEmpty">
          <div class="bg-white rounded-lg shadow-sm p-6 sticky top-4">
            <h2 class="text-lg font-medium text-gray-900">Sipariş Özeti</h2>

            <div class="mt-6 space-y-4">
              <div class="flex items-center justify-between">
                <p class="text-sm text-gray-600">Ara Toplam</p>
                <p class="text-sm font-medium text-gray-900">
                  ₺{{ formatPrice(cartStore.subtotal) }}
                </p>
              </div>
              <div class="flex items-center justify-between">
                <p class="text-sm text-gray-600">Kargo Ücreti</p>
                <p class="text-sm font-medium text-gray-900">
                  ₺{{ formatPrice(cartStore.shipping) }}
                </p>
              </div>
              <div class="border-t border-gray-200 pt-4">
                <div class="flex items-center justify-between">
                  <p class="text-base font-medium text-gray-900">
                    Toplam (KDV Dahil)
                  </p>
                  <p class="text-base font-medium text-gray-900">
                    ₺{{ formatPrice(cartStore.grandTotal) }}
                  </p>
                </div>
              </div>
            </div>

            <div class="mt-2 flex items-center">
              <input
                type="checkbox"
                id="contract-checkbox"
                v-model="contractAccepted"
                class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label for="contract-checkbox" class="ml-2 text-sm text-gray-600">
                <span class="mr-1">Mesafeli satış sözleşmesini</span>
                <button
                  @click="showContract = true"
                  class="text-blue-600 hover:text-blue-800 inline-block"
                >
                  görüntüle
                </button>
                <span> kabul ediyorum</span>
              </label>
            </div>

            <button
              @click="completeOrder"
              class="mt-6 w-full bg-green-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              :disabled="loading || !cartStore.hasItems || !contractAccepted"
            >
              <span v-if="loading">İşleniyor...</span>
              <span v-else-if="!contractAccepted">Sözleşmeyi Kabul Edin</span>
              <span v-else>Siparişi Onayla</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Sözleşme Modalı -->
  <div
    v-if="showContract"
    class="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50"
  >
    <div
      class="bg-white rounded-lg shadow-sm p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
    >
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-medium text-gray-900">
          Mesafeli Satış Sözleşmesi
        </h2>
        <button
          @click="showContract = false"
          class="text-gray-400 hover:text-gray-500"
        >
          <svg
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div class="prose prose-sm max-w-none">
        <DistanceSalesContract />
      </div>

      <div class="mt-6 flex justify-end">
        <button
          @click="showContract = false"
          class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Kapat
        </button>
      </div>
    </div>
  </div>
</template>
<script setup>
import { onMounted, ref, onUnmounted, computed, watch } from "vue";
import { useCartStore } from "@/stores/cartStore";
import { useStockStore } from "@/stores/stockStore";
import { useOrderStore } from "@/stores/orderStore";
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import DistanceSalesContract from "@/components/contracts/DistanceSalesContract.vue";
import {
  ShoppingBag,
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  Clock,
  AlertCircle,
  FileText,
  Check,
  AlertTriangle,
} from "lucide-vue-next";

const router = useRouter();
const toast = useToast();
const cartStore = useCartStore();
const stockStore = useStockStore();
const orderStore = useOrderStore();
const loading = ref(false);
const error = ref(null);
const contractAccepted = ref(false); // Sözleşme kabul durumu
const showContract = ref(false);

// Hesaplanan özellikler
const hasValidReservations = computed(() => cartStore.hasValidReservations);
const reservationTimer = computed(() => {
  const firstItem = cartStore.items[0];
  if (!firstItem) return 0;
  return cartStore.getItemReservationTime(firstItem.product._id);
});

// Fiyat formatlama
const formatPrice = (price) => {
  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
};

// Stok kontrolü ve yönetimi
const getStockStatus = (productId) => {
  const stock = stockStore.getStockByProductId(productId);
  if (!stock) return "out";

  const availableQuantity = stock.quantity - stock.reservedQuantity;

  if (availableQuantity <= 0) return "out";
  if (availableQuantity <= stock.lowStockThreshold) return "low";
  return "available";
};

const checkStockAvailability = (productId, requestedQuantity) => {
  const stock = stockStore.getStockByProductId(productId);
  if (!stock) return { available: false, message: "Stok bilgisi bulunamadı" };

  const availableQuantity = stock.quantity - stock.reservedQuantity;

  if (availableQuantity < requestedQuantity) {
    return {
      available: false,
      message: "Seçilen miktar için yeterli stok bulunmamaktadır",
    };
  }

  return { available: true };
};

const canIncreaseQuantity = (productId, currentQuantity) => {
  const stock = stockStore.stocks.get(productId);
  if (!stock) return false;

  const availableQuantity = stock.quantity - (stock.reservedQuantity || 0);
  return availableQuantity > currentQuantity;
};

// Miktar güncelleme fonksiyonu
const updateQuantity = async (product, newQuantity) => {
  try {
    loading.value = true;
    error.value = null;

    // Stok kontrolü
    const stockCheck = checkStockAvailability(product._id, newQuantity);
    if (!stockCheck.available) {
      toast.error(stockCheck.message);
      return;
    }

    // Sepet güncelleme
    await cartStore.updateCartItemQuantity(product._id, newQuantity);
    toast.success("Sepet güncellendi");
  } catch (err) {
    error.value = err.message;
    toast.error("Sepet güncellenirken bir hata oluştu");
  } finally {
    loading.value = false;
  }
};

// Sepetten ürün çıkarma
const removeFromCart = async (product) => {
  try {
    loading.value = true;
    error.value = null;

    // Önce rezervasyonu iptal et
    if (cartStore.hasItemReservation(product._id)) {
      await cartStore.cancelReservation(product._id);
    }

    // Ürünü sepetten çıkar
    await cartStore.removeFromCart(product._id);
    toast.success("Ürün sepetten çıkarıldı");
  } catch (err) {
    error.value = err.message;
    toast.error("Ürün çıkarılırken bir hata oluştu");
  } finally {
    loading.value = false;
  }
};

// Siparişi tamamlama
const completeOrder = async () => {
  try {
    loading.value = true;
    error.value = null;

    // Stok ve rezervasyon kontrolü
    const validationResult = await cartStore.validateCartItems();
    if (!validationResult.success) {
      toast.error(validationResult.message);
      return;
    }

    // Checkout rezervasyonu oluştur
    const checkoutResult = await cartStore.startCheckoutProcess();
    if (!checkoutResult.success) {
      toast.error(checkoutResult.message);
      return;
    }

    // Adres sayfasına yönlendir
    router.push("/adres");
  } catch (err) {
    error.value = err.message;
    toast.error("İşlem sırasında bir hata oluştu");
  } finally {
    loading.value = false;
  }
};

// Sayfa yüklendiğinde
onMounted(async () => {
  try {
    await cartStore.fetchCart();

    // Sepetteki tüm ürünlerin stok bilgilerini yükle
    await Promise.all(
      cartStore.items.map((item) =>
        stockStore.fetchStockByProduct(item.product._id)
      )
    );

    // Stok değişikliklerini dinlemeye başla
    stockStore.initializeSocketListeners();

    if (cartStore.hasItems) {
      await cartStore.validateCartItems();
      await cartStore.refreshReservations();
    }
  } catch (error) {
    console.error("Sepet yükleme hatası:", error);
  }
});

// Sayfa kapandığında
onUnmounted(() => {
  stockStore.cleanup();
});

// Sepet değişikliklerini izle
watch(
  () => cartStore.items,
  async (newItems) => {
    if (newItems.length > 0) {
      await cartStore.validateCartItems();
    }
  },
  { deep: true }
);

// Fiyat değişimlerini izle
watch(
  () => cartStore.totalAmount,
  (newValue, oldValue) => {
    console.log("Toplam tutar değişti:", {
      oldValue,
      newValue,
      items: cartStore.items,
      cart: cartStore.cart,
    });
  }
);

// Stok değişikliklerini izle
watch(
  () => stockStore.stocks,
  (newStocks) => {
    cartStore.items.forEach((item) => {
      const stockCheck = checkStockAvailability(
        item.product._id,
        item.quantity
      );
      if (!stockCheck.available) {
        toast.warning(
          `"${item.product.name}" ürününün stok durumu değişti. Sepetinizi kontrol ediniz.`
        );
      }
    });
  },
  { deep: true }
);
</script>

<style scoped>
.stock-status {
  @apply mt-2 text-sm font-medium;
}

.stock-status.available {
  @apply text-green-600;
}

.stock-status.low {
  @apply text-orange-600;
}

.stock-status.out {
  @apply text-red-600;
}

.reservation-timer {
  @apply text-sm text-orange-600 flex items-center mt-2;
}

.reservation-warning {
  @apply text-sm text-red-600 flex items-center mt-2;
}
</style>