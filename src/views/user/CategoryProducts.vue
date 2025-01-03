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
            <h1 class="text-3xl font-bold text-green-800 flex items-center gap-3">
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

          <!-- Filtreler ve Sıralama -->
          <div class="bg-white rounded-xl shadow-md border border-green-100 p-4 mb-6 transition-all duration-300 hover:shadow-lg">
            <div class="flex flex-wrap items-center justify-between gap-4">
              <div class="flex items-center gap-4">
                <button 
                  @click="showFilters = !showFilters"
                  class="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors group"
                >
                  <SlidersHorizontal class="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  Filtreler
                </button>

                <!-- Aktif Filtreler -->
                <div class="flex items-center gap-2">
                  <span 
                    v-if="filters.productType" 
                    class="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                  >
                    <Sprout class="w-4 h-4" />
                    {{ filters.productType }}
                    <X 
                      class="w-4 h-4 cursor-pointer hover:text-red-500 transition-colors" 
                      @click="clearFilter('productType')" 
                    />
                  </span>
                </div>
              </div>

              <select 
                v-model="sortBy"
                class="px-4 py-2 bg-green-50 text-green-700 rounded-lg focus:ring-2 focus:ring-green-500 border-none transition-all"
              >
                <option value="price_asc">Fiyat: Düşükten Yükseğe</option>
                <option value="price_desc">Fiyat: Yüksekten Düşüğe</option>
                <option value="name_asc">İsim: A-Z</option>
                <option value="name_desc">İsim: Z-A</option>
              </select>
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
              class="product-card bg-white rounded-xl overflow-hidden shadow-md border border-green-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <!-- Ürün Resmi -->
                <div class="relative md:col-span-1">
                  <img 
                    :src="product.images?.[0]?.url || '/api/placeholder/400/300'"
                    :alt="product.name"
                    class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div 
                    v-if="product.stock?.quantity > 0" 
                    class="absolute top-3 right-3 px-2 py-1 bg-green-500 text-white text-xs rounded-full"
                  >
                    Stokta
                  </div>
                </div>

                <!-- Ürün Bilgileri -->
                <div class="p-6 md:col-span-2 flex flex-col justify-between">
                  <div>
                    <span class="text-sm text-gray-500 block mb-2">{{ product.brand }}</span>
                    <h3 class="text-2xl font-semibold text-green-900 mb-4">{{ product.name }}</h3>

                    <div class="flex flex-wrap gap-2 mb-6">
                      <span 
                        v-if="product.productType"
                        class="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm"
                      >
                        {{ product.productType }}
                      </span>
                    </div>
                  </div>

                  <!-- Fiyat ve Butonlar -->
                  <div class="mt-auto flex items-center justify-between">
                    <div class="flex flex-col">
                      <span class="text-3xl font-bold text-green-700">
                        {{ formatPrice(product.price?.current) }} ₺
                      </span>
                      <span class="text-sm text-gray-500">
                        / {{ product.stock?.unit }}
                      </span>
                    </div>

                    <div class="flex items-center gap-3">
                      <button 
                        class="flex items-center gap-2 px-4 py-2.5 border border-green-200 text-green-700 rounded-lg hover:bg-green-50 transition-colors group"
                      >
                        <Eye class="w-5 h-5 group-hover:rotate-6 transition-transform" />
                        Detay
                      </button>
                      <button 
                        class="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all transform hover:scale-105"
                      >
                        <ShoppingCart class="w-5 h-5" />
                        Sepete Ekle
                      </button>
                    </div>
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
  SlidersHorizontal,
  X,
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
const showFilters = ref(false);
const sortBy = ref("price_asc");
const filters = ref({
  productType: "",
  brand: "",
  minPrice: "",
  maxPrice: "",
});

// Computed properties
const displayProducts = computed(() => {
  return productStore.products || [];
});

const totalProducts = computed(() => {
  return productStore.pagination?.totalItems || 0;
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

const getSpecifications = (product) => {
  if (!product.specifications) return {};
  try {
    return JSON.parse(product.specifications);
  } catch {
    return {};
  }
};

const clearFilter = (filterName) => {
  filters.value[filterName] = "";
  fetchProducts();
};

const loadMore = async () => {
  const nextPage = (productStore.pagination?.page || 1) + 1;
  await fetchProducts({ page: nextPage, loadMore: true });
};

const fetchProducts = async (params = {}) => {
  try {
    await productStore.fetchProductsByCategory(props.categorySlug, {
      ...params,
      ...filters.value,
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

.product-card:hover .product-image {
  transform: scale(1.05);
}
</style>
