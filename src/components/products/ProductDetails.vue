<template>
  <div class="max-w-2xl mx-auto space-y-8 flex-grow">
    <!-- Ürün Başlığı ve Değerlendirme -->
    <div class="space-y-4 sm:space-y-6 min-h-[120px]">
      <!-- Başlık Skeleton -->
      <div 
        v-if="!isTitleReady"
        class="animate-pulse"
        aria-hidden="true"
      >
        <div class="h-7 sm:h-8 bg-gray-200 rounded-md w-3/4 mb-4"></div>
      </div>

      <!-- Optimize edilmiş başlık render -->
      <Transition
        name="fade"
        appear
        @before-enter="startTitleTransition"
        @after-enter="endTitleTransition"
      >
        <h1 
          v-show="isTitleReady"
          ref="titleRef"
          class="text-2xl sm:text-3xl font-bold text-gray-900 font-montserrat tracking-tight min-h-[40px]"
          :class="{ 'opacity-0': !isTitleReady }"
        >
          {{ product.name || 'Yükleniyor...' }}
        </h1>
      </Transition>

      <div
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 sm:space-x-6 min-h-[48px]"
      >
        <div class="flex items-center space-x-4 sm:space-x-6">
          <div class="flex space-x-1">
            <Star
              v-for="n in 5"
              :key="n"
              :class="[
                'w-5 h-5 sm:w-6 sm:h-6',
                n <= averageRating
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-200',
              ]"
            />
          </div>
          <span
            class="ml-2 sm:ml-3 text-xs sm:text-sm font-medium text-gray-600"
          >
            ({{ reviewCount }} değerlendirme)
          </span>
        </div>
        <div class="hidden sm:block h-6 w-px bg-gray-200"></div>
        <div class="flex items-center space-x-2">
          <Building2 class="w-4 h-4 sm:w-5 sm:h-5 text-[#2F5E32]" />
          <span class="text-xs sm:text-sm font-medium text-gray-700">{{
            product.brand
          }}</span>
        </div>
      </div>
    </div>
    <!-- Ürün Açıklaması -->
    <div
      v-if="description"
      class="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100"
    >
      <div
        class="prose prose-sm sm:prose-base max-w-none font-inter text-gray-700"
        v-html="description"
      ></div>
    </div>
    <!-- Fiyat ve İndirim Bilgisi -->
    <div
      class="bg-gradient-to-br from-white to-gray-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 min-h-[100px]"
    >
      <div class="flex flex-wrap items-center justify-between">
        <!-- Sol taraf: Fiyat ve İndirim -->
        <div class="flex items-baseline gap-2 sm:gap-4 min-h-[36px]">
          <span
            class="text-2xl sm:text-3xl font-bold text-gray-900 font-montserrat tracking-tight"
          >
            {{ product.price?.current ? `₺${formatPrice(Number(product.price.current))}` : 'Yükleniyor...' }}
          </span>
          <template v-if="product.price.discount > 0">
            <span
              class="text-base sm:text-lg text-gray-400 line-through font-inter"
            >
              ₺{{ formatPrice(Number(calculateOriginalPrice)) }}
            </span>
            <span
              class="inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-semibold bg-red-50 text-red-600 border border-red-100"
            >
              %{{ product.price.discount }} İndirim
            </span>
          </template>
        </div>

        <!-- Sağ taraf: Paket Bilgisi -->
        <div class="text-md text-black font-inter">
          {{ product.specifications?.packaging?.weight }} /
          {{ product.specifications?.packaging?.unit }}
        </div>
      </div>

      <!-- İndirim Bitiş Tarihi -->
      <div v-if="product.price.discountEndDate" class="mt-2 sm:mt-3">
        <div
          class="flex items-center space-x-2 text-xs sm:text-sm font-medium text-red-600"
        >
          <Clock class="w-4 h-4" />
          <span
            >İndirim bitimine:
            {{ formatRemainingTime(product.price.discountEndDate) }}</span
          >
        </div>
      </div>
    </div>

    <!-- Adet Seçimi ve Sepete Ekleme -->
    <div
      class="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 space-y-4 min-h-[200px]"
    >
      <!-- Giriş yapmamış kullanıcılar için bilgilendirme -->
      <div class="flex flex-col space-y-3">
        <div
          v-if="!isAuthenticated"
          class="bg-blue-50 border border-blue-100 rounded-lg p-4"
        >
          <div class="flex items-center space-x-3">
            <Info class="w-5 h-5 text-blue-500" />
            <p class="text-sm text-blue-700">
              Ürünü sepete eklemek için
              <router-link
                :to="{ name: 'login', query: { redirect: $route.fullPath } }"
                class="font-medium underline hover:text-blue-800"
              >
                giriş yapmalısınız
              </router-link>
            </p>
          </div>
        </div>
        
        <div
          v-if="!isAuthenticated"
          class="bg-green-50 border border-green-100 rounded-lg p-4"
        >
          <div class="flex items-center space-x-3">
            <Info class="w-5 h-5 text-green-500" />
            <p class="text-sm text-green-700">
              Hesabınız yok mu?
              <router-link
                :to="{ name: 'register' }"
                class="font-medium underline hover:text-green-800"
              >
                Hemen kayıt olun
              </router-link>
            </p>
          </div>
        </div>
      </div>

      <div
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0"
      >
        <div class="flex items-center space-x-4 sm:space-x-6">
          <span class="text-sm sm:text-base text-gray-700 font-medium"
            >Adet</span
          >
          <div
            class="flex items-center bg-gray-50 rounded-lg sm:rounded-xl border border-gray-200"
          >
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
            <span
              class="w-12 sm:w-16 text-center text-sm sm:text-base font-medium text-gray-700"
              >{{ quantity }}</span
            >
            <button
              @click="handleQuantityChange('increase')"
              class="p-2 sm:p-3 hover:bg-gray-100 transition-colors rounded-r-lg sm:rounded-r-xl disabled:opacity-50"
              :disabled="!canIncreaseQuantity"
            >
              <Plus
                class="w-3.5 h-3.5 sm:w-4 sm:h-4"
                :class="
                  !canIncreaseQuantity ? 'text-gray-300' : 'text-gray-600'
                "
              />
            </button>
          </div>
        </div>

        <div class="text-xs sm:text-sm font-medium text-gray-600">
          {{
            stockInfo
              ? `${stockInfo.quantity} ${stockInfo.unit} mevcut`
              : `${product.stock?.quantity} ${product.stock?.unit} mevcut`
          }}
        </div>
      </div>

      <div class="space-y-3 sm:space-y-4">
        <button
          @click="handleAddToCart"
          :disabled="!isAvailableForPurchase || loading || !isAuthenticated"
          :class="[
            'w-full py-3 sm:py-3.5 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base flex items-center justify-center space-x-2 sm:space-x-3 shadow-md transform transition-all duration-300',
            isAuthenticated
              ? 'bg-gradient-to-r from-[#2F5E32] to-[#4A8E4D] text-white hover:from-[#2F5E32]/90 hover:to-[#4A8E4D]/90 hover:scale-[1.02] active:scale-[0.98]'
              : 'bg-gray-100 text-gray-500 cursor-not-allowed',
          ]"
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

        <div class="grid xs:grid-cols-1 sm:grid-cols-2 gap-2">
          <!-- Birincil WhatsApp Butonu -->
          <a
            :href="
              'https://wa.me/905516419012?text=' +
              encodeURIComponent(
                `${product.name} ürünü hakkında bilgi almak istiyorum.`
              )
            "
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center justify-center space-x-2 py-3 px-4 rounded-lg bg-[#25D366] hover:bg-[#22BF5B] text-white transition-all duration-300 shadow-md transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <svg
              class="w-5 h-5 fill-current"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
              />
            </svg>
            <span class="text-sm font-medium">WhatsApp'tan Bilgi Al</span>
          </a>

          <!-- İkincil WhatsApp Butonu (Paylaş) -->
          <ProductShare
            :productName="product.name"
            :price="product.price.current"
            :productUrl="currentUrl"
          />
        </div>
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
  Info,
} from "lucide-vue-next";
import ProductShare from "./ProductShare.vue";
import { useProductStore } from "@/stores/productStore";
import { useCartStore } from "@/stores/cartStore";
import { useStockStore } from "@/stores/stockStore";
import { useReviewStore } from "@/stores/reviewStore";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "vue-router";
import { computed, ref, onMounted, watch } from "vue";
import { storeToRefs } from "pinia";
import { useToast } from "vue-toastification";
import { useRoute } from "vue-router";
import { marked } from "marked";

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
    Info,
    ProductShare,
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
    const authStore = useAuthStore();
    const router = useRouter();
    const route = useRoute();
    const toast = useToast();
    const quantity = ref(1);
    const isTitleReady = ref(false);
    const titleRef = ref(null);

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
      if (!isAuthenticated.value) return "Giriş Yaparak Sepete Ekle";
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
      const total = productReviews.value.reduce(
        (sum, review) => sum + review.rating,
        0
      );
      return Math.round((total / productReviews.value.length) * 10) / 10;
    });

    const reviewCount = computed(() => productReviews.value?.length || 0);

    const isAuthenticated = computed(() => authStore.isAuthenticated);

    const currentUrl = computed(() => {
      return typeof window !== "undefined"
        ? window.location.href
        : route.fullPath;
    });

    const description = computed(() => {
      if (!product.value?.description?.meta) return "";
      return marked(product.value.description.meta);
    });

    const handleAddToCart = async () => {
      if (!isAuthenticated.value) {
        router.push({
          name: "login",
          query: { redirect: router.currentRoute.value.fullPath },
        });
        return;
      }
      await addToCart();
    };

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
        console.error("Yorumlar yüklenirken hata:", error);
      }
    };

    const startTitleTransition = () => {
      if (titleRef.value) {
        titleRef.value.style.willChange = 'opacity';
      }
    };

    const endTitleTransition = () => {
      if (titleRef.value) {
        titleRef.value.style.willChange = 'auto';
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
        await nextTick();
        if (props.product?.name) {
          // Başlık içeriğini hazırla
          const titleContent = props.product.name;
          
          // requestAnimationFrame ile render zamanlaması
          requestAnimationFrame(() => {
            if (titleRef.value) {
              titleRef.value.textContent = titleContent;
              isTitleReady.value = true;
            }
          });
        }
      } catch (error) {
        console.error("Veriler yüklenirken hata:", error);
      }
    });

    // ProductId değiştiğinde yorumları yeniden yükle
    watch(
      () => props.productId,
      async (newId) => {
        if (newId) {
          await loadReviews();
        }
      }
    );

    const getOneYearFromNow = () => {
      const date = new Date();
      date.setFullYear(date.getFullYear() + 1);
      return date.toISOString().split("T")[0];
    };

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
      handleAddToCart,
      averageRating,
      reviewCount,
      isAuthenticated,
      router,
      currentUrl,
      description,
      getOneYearFromNow,
      isTitleReady,
      titleRef,
      startTitleTransition,
      endTitleTransition
    };
  },
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
