<template>
  <div class="flex-1">
    <!-- Tab Navigation - Daha modern ve akıcı bir tasarım -->
    <div class="mb-8">
      <div class="flex gap-6 border-b border-gray-100">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="handleTabChange(tab.id)"
          :class="[
            'py-4 px-8 relative transition-all duration-300 hover:bg-gray-50/80 focus:outline-none',
            'text-base font-medium tracking-wide',
            activeTab === tab.id
              ? 'text-[#0F6735] font-semibold'
              : 'text-gray-600 hover:text-[#0F6735]/90',
          ]"
          :aria-selected="activeTab === tab.id"
          role="tab"
        >
          {{ tab.name }}
          <!-- Geliştirilmiş tab indicator animasyonu -->
          <div
            v-if="activeTab === tab.id"
            class="absolute bottom-0 left-0 w-full h-0.5 bg-[#0F6735]"
          >
            <div class="absolute inset-0 bg-[#0F6735] animate-slideIn"></div>
          </div>
        </button>
      </div>
    </div>

    <!-- Geliştirilmiş loading state -->
    <div
      v-if="productStore.loading"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
      aria-busy="true"
    >
      <div v-for="n in 8" :key="n" class="animate-pulse rounded-xl overflow-hidden shadow-sm">
        <div class="aspect-[4/3] bg-gray-200"></div>
        <div class="p-4 space-y-3">
          <div class="h-2 bg-gray-200 rounded w-1/4"></div>
          <div class="h-4 bg-gray-200 rounded w-3/4"></div>
          <div class="h-3 bg-gray-200 rounded w-1/2"></div>
          <div class="h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="productStore.error" class="text-red-500 text-center py-12 bg-red-50 rounded-lg" role="alert">
      <i class="fas fa-exclamation-circle text-xl mb-2"></i>
      <p>{{ productStore.error }}</p>
    </div>

    <!-- Ürün Grid -->
    <div v-else class="relative overflow-hidden">
      <div
        class="transition-all duration-500 ease-out flex"
        :style="{ transform: `translateX(-${activeTab * 100}%)` }"
      >
        <div
          v-for="tabContent in tabContents"
          :key="tabContent.id"
          class="w-full flex-shrink-0"
        >
          <div
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            role="list"
          >
            <!-- Geliştirilmiş ürün kartı -->
            <router-link
              v-for="product in filteredProducts"
              :key="product._id"
              :to="{
                name: 'product-detail',
                params: { slug: product.slug || slugify(product.name) },
              }"
              class="group bg-white rounded-xl overflow-hidden shadow-sm transition-all duration-300 
                     hover:shadow-xl hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#0F6735]/50"
              :aria-label="'Ürün: ' + product.name"
              role="listitem"
            >
              <!-- Görsel alanı -->
              <div class="relative aspect-[4/3] overflow-hidden bg-gray-50">
                <img
                  v-if="product.images?.length"
                  :src="product.images[0].url"
                  :alt="product.name"
                  class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div
                  v-else
                  class="w-full h-full flex items-center justify-center text-gray-400"
                >
                  <i class="fas fa-image text-3xl opacity-50"></i>
                </div>
                
                <!-- Geliştirilmiş rozetler -->
                <div class="absolute top-3 left-3 flex gap-2">
                  <span
                    v-if="isNewProduct(product)"
                    class="bg-[#0F6735]/90 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full 
                           font-medium shadow-lg animate-fadeIn"
                  >Yeni</span>
                  <span
                    v-if="product.price?.discount > 0"
                    class="bg-red-500/90 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full 
                           font-medium shadow-lg animate-fadeIn"
                  >%{{ product.price.discount }}</span>
                </div>
              </div>
              
              <!-- İçerik alanı -->
              <div class="p-4 space-y-3">
                <router-link
                  v-if="product.category"
                  :to="getCategoryRoute(product.category)"
                  class="text-sm text-gray-500 hover:text-[#0F6735] transition-colors duration-200 block"
                  @click.stop
                >
                  {{ getCategoryName(product) }}
                </router-link>
                
                <h3 class="font-medium text-gray-800 line-clamp-2 group-hover:text-[#0F6735] 
                         transition-colors duration-200 text-lg">
                  {{ product.name }}
                </h3>

                <!-- Fiyat alanı -->
                <div class="flex items-baseline gap-3">
                  <span class="font-semibold text-[#0F6735] text-lg">
                    {{ formatPrice(product.price?.current) }} TL
                  </span>
                  <span 
                    v-if="product.price?.discount > 0" 
                    class="text-sm text-gray-400 line-through"
                  >
                    {{ formatPrice(product.price?.original) }} TL
                  </span>
                </div>

                <!-- Ürün detayları -->
                <div class="text-sm text-gray-500 flex items-center gap-1">
                  <i class="fas fa-box text-xs"></i>
                  {{ product.specifications?.packaging?.weight }}
                  {{ product.specifications?.packaging?.unit }}
                </div>

                <!-- Detay butonu -->
                <button
                  class="w-full bg-[#0F6735] text-white py-2.5 rounded-lg flex items-center justify-center 
                         gap-2 transition-all duration-300 hover:bg-[#0a4c28] text-sm font-medium 
                         group-hover:shadow-lg mt-4"
                  @click.stop
                >
                  Detayları Gör
                  <i class="fas fa-arrow-right text-xs transition-transform duration-300 
                        group-hover:translate-x-1"></i>
                </button>
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Geliştirilmiş sayfalama -->
    <div
      v-if="productStore.pagination.totalPages > 1"
      class="mt-12 flex justify-center gap-3"
      role="navigation"
      aria-label="Sayfa navigasyonu"
    >
      <button
        v-for="page in productStore.pagination.totalPages"
        :key="page"
        @click="handlePageChange(page)"
        :class="[
          'px-5 py-2.5 rounded-lg transition-all duration-300 text-sm font-medium',
          productStore.pagination.page === page
            ? 'bg-[#0F6735] text-white shadow-lg hover:bg-[#0a4c28] scale-105'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105',
        ]"
        :aria-current="productStore.pagination.page === page ? 'page' : undefined"
      >
        {{ page }}
      </button>
    </div>
  </div>
</template>
<script>
import { useProductStore } from "@/stores/productStore.js";
import { ref, onMounted, computed } from "vue";
import ProductReviews from '@/views/user/ProductReviews.vue';

export default {
  name: "ProductTabs",
  components: {
    ProductReviews
  },
  props: {
    product: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const productStore = useProductStore();
    const activeTab = ref(0);

    const tabs = [
      { id: 0, name: "Tüm Ürünler" },
      { id: 1, name: "Yeni Ürünler" },
      { id: 2, name: "İndirimli Ürünler" },
    ];

    const slugify = (text) => {
      return (
        text
          ?.toLowerCase()
          .replace(/[^a-z0-9-]/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "") || ""
      );
    };

    // Kategori path'ini oluşturan yardımcı fonksiyon
    const buildCategoryPath = (category) => {
      const path = [];
      let currentCategory = category;

      // Kategori ve üst kategorileri dolaşarak path'i oluştur
      while (currentCategory) {
        path.unshift(slugify(currentCategory.name)); // En üst kategoriden başlayarak ekle
        currentCategory = currentCategory.parent; // Bir üst kategoriye geç
      }

      return path;
    };

    const getCategoryRoute = (category) => {
      if (!category) return { name: "home" };

      // Kategori hiyerarşisini içeren path'i oluştur
      const categoryPath = buildCategoryPath(category);

      return {
        name: "category-detail",
        params: {
          path: categoryPath,
        },
      };
    };

    const tabContents = computed(() => {
      return tabs.map((tab) => ({
        id: tab.id,
        products: productStore.products,
      }));
    });

    const filteredProducts = computed(() => {
      const products = productStore.products;

      switch (activeTab.value) {
        case 1:
          return products.filter((product) => isNewProduct(product));
        case 2:
          return products.filter(
            (product) =>
              product.price?.discount &&
              product.price.discount > 0 &&
              new Date(product.price.discountEndDate) > new Date()
          );
        default:
          return products;
      }
    });

    const getCategoryName = (product) => {
      return product.category?.name || "Kategorisiz";
    };

    const isNewProduct = (product) => {
      if (!product.createdAt) return false;
      const createdAt = new Date(product.createdAt);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return createdAt >= thirtyDaysAgo;
    };

    const formatPrice = (price) => {
      if (!price || isNaN(price)) return "0.00";
      return Number(price).toLocaleString("tr-TR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    };

    const loadProducts = async (params = {}) => {
      try {
        await productStore.fetchProducts({
          ...params,
          limit: 12,
        });
      } catch (error) {
        console.error("Ürünler yüklenirken hata:", error);
      }
    };

    const handleTabChange = (tabId) => {
      activeTab.value = tabId;
      loadProducts();
    };

    const handlePageChange = (page) => {
      loadProducts({ page });
    };

    onMounted(() => {
      productStore.initializeSocketListeners();
      loadProducts();
    });

    return {
      productStore,
      activeTab,
      tabs,
      tabContents,
      filteredProducts,
      getCategoryName,
      getCategoryRoute,
      isNewProduct,
      formatPrice,
      handleTabChange,
      handlePageChange,
      slugify,
    };
  },
};
</script>

<style scoped>
@keyframes slideIn {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-slideIn {
  animation: slideIn 0.3s ease-out forwards;
  transform-origin: left;
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out forwards;
}
</style>
