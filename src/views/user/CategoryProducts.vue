<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-green-50">
    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Ana Grid Layout -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- Kategori Listesi (Tablet ve Üstü) -->
        <div class="hidden md:block md:col-span-1">
          <CategoryList />
        </div>

        <!-- Ürünler Bölümü -->
        <div class="md:col-span-3">
          <!-- Başlık ve Bilgi -->
          <div class="flex items-center justify-between mb-6 animate-fade-in">
            <h1 class="text-3xl font-bold text-green-800 flex items-center gap-3 font-montserrat">
              <Sprout class="w-8 h-8 text-green-600" />
              {{ currentCategory?.name || "Ürünler" }}
            </h1>
            <div class="flex items-center gap-4">
              <div class="flex items-center gap-2">
                <span class="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full">
                  <Package class="w-5 h-5 text-green-600" />
                  {{ totalProducts }} Ürün
                </span>
              </div>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="productStore.loading" class="flex justify-center py-12">
            <div class="animate-pulse flex flex-col items-center space-y-4">
              <div class="w-24 h-24 bg-green-200 rounded-full"></div>
              <div class="h-4 bg-green-200 rounded w-3/4"></div>
            </div>
          </div>

          <!-- Error State -->
          <div 
            v-else-if="productStore.error" 
            class="bg-red-50 p-6 rounded-xl text-red-600 flex items-center gap-4 border-l-4 border-red-500"
          >
            <AlertCircle class="w-8 h-8" />
            {{ productStore.error }}
          </div>

          <!-- Ürün Listesi -->
          <div v-else-if="displayProducts.length > 0" class="space-y-6">
            <div 
              v-for="product in displayProducts" 
              :key="product._id"
              class="product-card bg-white rounded-xl overflow-hidden shadow-sm border border-green-100 hover:shadow-lg transition-all duration-300"
            >
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <!-- Ürün Resmi -->
                <div class="relative md:col-span-1 aspect-[4/3] md:aspect-auto overflow-hidden">
                  <img 
                    :src="product.images?.[0]?.url || '/api/placeholder/400/300'"
                    :alt="product.name"
                    class="w-full h-full object-cover transition-transform duration-500"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>

                <!-- Ürün Bilgileri -->
                <div class="p-4 md:p-6 md:col-span-2 flex flex-col h-full">
                  <div class="flex-1">
                    <div class="flex items-start justify-between mb-3">
                      <div>
                        <span class="text-sm text-gray-500 block mb-1 font-inter">{{ product.brand }}</span>
                        <h3 class="text-xl md:text-2xl font-semibold text-gray-800 line-clamp-2 font-montserrat">{{ product.name }}</h3>
                      </div>
                      <div class="flex flex-col items-end">
                        <span class="text-2xl md:text-3xl font-bold text-green-700 font-inter">
                          {{ formatPrice(product.price?.current) }} ₺
                        </span>
                        <span class="text-xs text-gray-500 font-inter italic">
                          (KDV Dahil)
                        </span>
                        <span class="text-sm text-gray-500 font-inter">
                          / {{ product.stock?.unit }}
                        </span>
                      </div>
                    </div>

                    <div class="flex flex-wrap gap-2 mb-4">
                      <span 
                        v-if="product.productType"
                        class="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-sm font-medium font-inter"
                      >
                        {{ product.productType }}
                      </span>
                    </div>
                  </div>

                  <!-- Butonlar -->
                  <div class="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4">
                    <button 
                      class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 transition-colors text-sm sm:text-base font-medium"
                    >
                      <ShoppingCart class="w-4 h-4 sm:w-5 sm:h-5" />
                      <span class="hidden sm:inline">Sepete Ekle</span>
                      <span class="sm:hidden">Sepet</span>
                    </button>
                    <button 
                      @click="$router.push({ name: 'product-detail', params: { slug: product.slug }})"
                      class="flex items-center justify-center gap-2 px-4 py-2.5 border border-green-200 text-green-700 rounded-lg hover:bg-green-50 transition-colors text-sm sm:text-base"
                    >
                      <Eye class="w-4 h-4 sm:w-5 sm:h-5" />
                      <span class="hidden sm:inline">Detayları Gör</span>
                      <span class="sm:hidden">Detay</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div 
            v-else 
            class="text-center py-12 bg-white rounded-xl shadow-md border border-green-100"
          >
            <PackageX class="w-24 h-24 mx-auto text-green-300 mb-6" />
            <p class="text-xl text-gray-600">
              Bu kategoride henüz ürün bulunmamaktadır.
            </p>
          </div>

          <!-- Pagination -->
          <div v-if="hasMore" class="flex justify-center mt-8">
            <button
              @click="loadMore"
              class="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all transform hover:scale-105 flex items-center gap-2"
              :disabled="productStore.loading"
            >
              <RefreshCw 
                class="w-5 h-5 animate-spin" 
                v-if="productStore.loading" 
              />
              {{ productStore.loading ? "Yükleniyor..." : "Daha Fazla Göster" }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
  <script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useProductStore } from "@/stores/productStore";
import { useCategoryStore } from "@/stores/categoryStore";
import CategoryList from "@/components/CategoryList.vue";
import {
  Sprout,
  Package,
  Eye,
  ShoppingCart,
  RefreshCw,
  AlertCircle,
  PackageX
} from "lucide-vue-next";

// Props tanımı
const props = defineProps({
  categorySlug: {
    type: String,
    required: true,
  },
});

// Store'ları başlat
const productStore = useProductStore();
const categoryStore = useCategoryStore();

// Reactive state
const sortBy = ref("price_asc");

// Computed properties
const displayProducts = computed(() => {
  return productStore.products || [];
});

const totalProducts = computed(() => {
  return displayProducts.value.length;
});

const hasMore = computed(() => {
  const currentPage = productStore.pagination?.page || 1;
  const totalPages = productStore.pagination?.totalPages || 1;
  return currentPage < totalPages;
});

const currentCategory = computed(() => {
  return categoryStore.categories?.find(
    (cat) => cat.slug === props.categorySlug
  );
});

// Methods
const formatPrice = (price) => {
  return Number(price || 0).toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const loadMore = async () => {
  const nextPage = (productStore.pagination?.page || 1) + 1;
  await fetchProducts({ page: nextPage, loadMore: true });
};

const fetchProducts = async (params = {}) => {
  try {
    await productStore.fetchProductsByCategory(props.categorySlug, {
      ...params,
      sortBy: sortBy.value,
    });
  } catch (error) {
    console.error("Ürünler yüklenirken hata oluştu:", error);
  }
};

// Lifecycle hooks
onMounted(async () => {
  await fetchProducts();
});

// Watchers
watch([() => props.categorySlug, sortBy], () => {
  fetchProducts();
});
</script>
<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Özel Scrollbar */
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

/* Ürün Kartı Animasyonları */
.product-card {
  @apply transition-all duration-300;
}

.product-card:hover {
  @apply shadow-lg;
}

.product-card img {
  @apply transition-transform duration-500;
}

.product-card:hover img {
  transform: scale(1.05);
}

/* Responsive Tasarım */
@screen xs {
  .product-card {
    @apply hover:-translate-y-1;
  }
}

@media (max-width: 425px) {
  .product-card button {
    @apply text-sm py-2;
  }
  
  .product-card .button-text {
    @apply hidden;
  }
  
  .product-card .button-icon {
    @apply w-4 h-4;
  }
}

/* Tipografi ve Spacing */
h1, h2, h3 {
  @apply tracking-tight leading-tight;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Animasyonlar */
.group-hover\:rotate-12:hover {
  transform: rotate(12deg);
}

.active\:scale-95:active {
  transform: scale(0.95);
}

/* Loading ve Error States */
.loading-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .5; }
}

/* Özel Scrollbar */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #22c55e #e5e7eb;
}

.custom-scrollbar::-webkit-scrollbar {
  @apply w-1.5;
}

.custom-scrollbar::-webkit-scrollbar-track {
  @apply bg-gray-100 rounded-full;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  @apply bg-green-500/70 rounded-full hover:bg-green-600/70;
}
</style>
