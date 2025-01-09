<template>
  <div class="max-w-2xl mx-auto space-y-8">
    <!-- Ürün Başlığı ve Değerlendirme -->
    <div class="space-y-4 sm:space-y-6">
      <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 font-montserrat tracking-tight">
        {{ product.name }}
      </h1>

      <div class="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-6">
        <div class="flex items-center">
          <div class="flex space-x-1">
            <Star
              v-for="n in 5"
              :key="n"
              :class="[
                'w-5 h-5 sm:w-6 sm:h-6',
                n <= averageRating ? 'text-yellow-400 fill-current' : 'text-gray-200',
              ]"
            />
          </div>
          <span class="ml-2 sm:ml-3 text-xs sm:text-sm font-medium text-gray-600">
            ({{ reviewCount }} değerlendirme)
          </span>
        </div>
        <div class="hidden sm:block h-6 w-px bg-gray-200"></div>
        <div class="flex items-center space-x-2">
          <Building2 class="w-4 h-4 sm:w-5 sm:h-5 text-[#2F5E32]" />
          <span class="text-xs sm:text-sm font-medium text-gray-700">{{ product.brand }}</span>
        </div>
      </div>
    </div>

    <!-- Fiyat ve İndirim Bilgisi -->
    <div class="bg-gradient-to-br from-white to-gray-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100">
      <div class="flex flex-wrap items-baseline gap-2 sm:gap-4">
        <span class="text-2xl sm:text-3xl font-bold text-gray-900 font-montserrat tracking-tight">
          ₺{{ formatPrice(product.price.current) }}
        </span>
        <template v-if="product.price.discount > 0">
          <span class="text-base sm:text-lg text-gray-400 line-through font-inter">
            ₺{{ formatPrice(calculateOriginalPrice) }}
          </span>
          <span class="inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-semibold bg-red-50 text-red-600 border border-red-100">
            %{{ product.price.discount }} İndirim
          </span>
        </template>
      </div>

      <div v-if="product.price.discountEndDate" class="mt-2 sm:mt-3">
        <div class="flex items-center space-x-2 text-xs sm:text-sm font-medium text-red-600">
          <Clock class="w-4 h-4" />
          <span>İndirim bitimine: {{ formatRemainingTime(product.price.discountEndDate) }}</span>
        </div>
      </div>
    </div>

    <!-- Adet Seçimi ve Sepete Ekleme -->
    <div class="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div class="flex items-center space-x-4 sm:space-x-6">
          <span class="text-sm sm:text-base text-gray-700 font-medium">Adet</span>
          <div class="flex items-center bg-gray-50 rounded-lg sm:rounded-xl border border-gray-200">
            <button
              @click="handleQuantityChange('decrease')"
              class="p-2 sm:p-3 hover:bg-gray-100 transition-colors rounded-l-lg sm:rounded-l-xl disabled:opacity-50"
              :disabled="quantity <= 1"
            >
              <Minus
                class="w-3.5 h-3.5 sm:w-4 sm:h-4"
                :class="quantity <= 1 ? 'text-gray-300' : 'text-gray-600'"
              />
            </button>
            <span class="w-12 sm:w-16 text-center text-sm sm:text-base font-medium text-gray-700">{{ quantity }}</span>
            <button
              @click="handleQuantityChange('increase')"
              class="p-2 sm:p-3 hover:bg-gray-100 transition-colors rounded-r-lg sm:rounded-r-xl disabled:opacity-50"
              :disabled="!canIncreaseQuantity"
            >
              <Plus
                class="w-3.5 h-3.5 sm:w-4 sm:h-4"
                :class="!canIncreaseQuantity ? 'text-gray-300' : 'text-gray-600'"
              />
            </button>
          </div>
        </div>

        <div class="text-xs sm:text-sm font-medium text-gray-600">
          {{ stockInfo ? `${stockInfo.quantity} ${stockInfo.unit} mevcut` : `${product.stock?.quantity} ${product.stock?.unit} mevcut` }}
        </div>
      </div>

      <div class="space-y-3 sm:space-y-4">
        <button
          @click="addToCart"
          :disabled="!isAvailableForPurchase || loading"
          class="w-full py-3 sm:py-3.5 bg-gradient-to-r from-[#2F5E32] to-[#4A8E4D] text-white rounded-lg sm:rounded-xl hover:from-[#2F5E32]/90 hover:to-[#4A8E4D]/90 transition-all duration-300 font-semibold text-sm sm:text-base flex items-center justify-center space-x-2 sm:space-x-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <template v-if="loading">
            <Loader2 class="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
            <span>İşleniyor...</span>
          </template>
          <template v-else>
            <ShoppingCart class="w-4 h-4 sm:w-5 sm:h-5" />
            <span>{{ getButtonText }}</span>
          </template>
        </button>

        <a
          :href="'https://wa.me/905551234567?text=' + encodeURIComponent(`${product.name} ürünü hakkında bilgi almak istiyorum.`)"
          target="_blank"
          rel="noopener noreferrer"
          class="w-full py-3 sm:py-3.5 bg-[#25D366] hover:bg-[#22BF5B] text-white rounded-lg sm:rounded-xl transition-all duration-300 shadow-md transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2 sm:space-x-3"
        >
          <svg class="w-4 h-4 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          <span class="text-sm sm:text-base font-medium">WhatsApp'tan Bilgi Al</span>
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import {
  Star,
  ShoppingCart,
  Truck,
  Clock,
  Plus,
  Minus,
  Mail,
  Phone,
  Building2,
  Loader2,
} from "lucide-vue-next";
import { useProductStore } from "@/stores/productStore";
import { useCartStore } from "@/stores/cartStore";
import { useStockStore } from "@/stores/stockStore";
import { useReviewStore } from "@/stores/reviewStore";
import { computed, ref, onMounted, watch } from "vue";
import { storeToRefs } from "pinia";
import { useToast } from 'vue-toastification'

export default {
  name: "ProductDetails",

  components: {
    Star,
    ShoppingCart,
    Truck,
    Clock,
    Plus,
    Minus,
    Mail,
    Phone,
    Building2,
    Loader2,
  },

  props: {
    productId: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: false,
    },
  },

  setup(props) {
    const productStore = useProductStore();
    const cartStore = useCartStore();
    const stockStore = useStockStore();
    const reviewStore = useReviewStore();
    const toast = useToast();
    const quantity = ref(1);

    const { loading, error } = storeToRefs(cartStore);
    const { productReviews } = storeToRefs(reviewStore);

    const product = computed(() => productStore.product);

    const stockInfo = computed(() => {
      return stockStore.getStockByProductId(product.value?._id);
    });

    const calculateOriginalPrice = computed(() => {
      if (!product.value) return 0;
      const discount = product.value.price.discount || 0;
      const currentPrice = product.value.price.current;
      return (currentPrice / (1 - discount / 100)).toFixed(2);
    });

    const isAvailableForPurchase = computed(() => {
      if (stockInfo.value) {
        return stockInfo.value.quantity > 0;
      }
      return product.value?.stock?.quantity > 0;
    });

    const canIncreaseQuantity = computed(() => {
      if (stockInfo.value) {
        return quantity.value < stockInfo.value.quantity;
      }
      if (!product.value) return false;
      return quantity.value < product.value.stock?.quantity;
    });

    const getButtonText = computed(() => {
      if (!isAvailableForPurchase.value) return "Stokta Yok";
      return "Sepete Ekle";
    });

    const formatPrice = (price) => {
      return Number(price).toLocaleString("tr-TR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    };

    const formatRemainingTime = (endDate) => {
      const end = new Date(endDate);
      const now = new Date();
      const diff = end - now;

      if (diff <= 0) return "Sona erdi";

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );

      if (days > 0) return `${days} gün ${hours} saat`;
      return `${hours} saat`;
    };

    const averageRating = computed(() => {
      if (!productReviews.value || productReviews.value.length === 0) return 0;
      const total = productReviews.value.reduce((sum, review) => sum + review.rating, 0);
      return Math.round((total / productReviews.value.length) * 10) / 10;
    });

    const reviewCount = computed(() => productReviews.value?.length || 0);

    const addToCart = async () => {
      if (!product.value?.slug) return;

      try {
        const currentStock = stockInfo.value || product.value.stock;
        if (!currentStock || currentStock.quantity < quantity.value) {
          toast.error("Yeterli stok bulunmuyor");
          return;
        }

        const result = await cartStore.addToCart(product.value, quantity.value);

        if (result) {
          quantity.value = 1;
          toast.success("Ürün sepete eklendi");
          if (props.slug) {
            await stockStore.fetchStockByProductSlug(props.slug);
          } else if (props.productId) {
            await stockStore.fetchStockByProduct(props.productId);
          }
        }
      } catch (error) {
        toast.error(error.message || "Ürün sepete eklenirken bir hata oluştu");
      }
    };

    const handleQuantityChange = (type) => {
      if (!product.value) return;

      if (type === "increase" && canIncreaseQuantity.value) {
        quantity.value++;
      } else if (type === "decrease" && quantity.value > 1) {
        quantity.value--;
      }
    };

    const loadReviews = async () => {
      try {
        if (props.productId) {
          await reviewStore.fetchProductReviews(props.productId);
        }
      } catch (error) {
        console.error('Yorumlar yüklenirken hata:', error);
      }
    };

    onMounted(async () => {
      try {
        // Stok bilgisini yükle
        if (props.slug) {
          await stockStore.fetchStockByProductSlug(props.slug);
        } else if (props.productId) {
          await stockStore.fetchStockByProduct(props.productId);
        }
        // Yorumları yükle
        await loadReviews();
      } catch (error) {
        console.error('Veriler yüklenirken hata:', error);
      }
    });

    // ProductId değiştiğinde yorumları yeniden yükle
    watch(() => props.productId, async (newId) => {
      if (newId) {
        await loadReviews();
      }
    });

    return {
      product,
      loading,
      error,
      quantity,
      stockInfo,
      calculateOriginalPrice,
      isAvailableForPurchase,
      canIncreaseQuantity,
      getButtonText,
      formatPrice,
      formatRemainingTime,
      addToCart,
      handleQuantityChange,
      averageRating,
      reviewCount,
    };
  },
};
</script>