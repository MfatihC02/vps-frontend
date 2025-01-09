<template>
  <div class="w-full"> 
    <!-- Tab Navigation - Modern ve responsive tasarım -->
    <nav class="sticky top-16 bg-white/95 backdrop-blur-sm z-30 border-b border-gray-100 shadow-sm">
      <div class="container mx-auto">
        <div class="flex overflow-x-auto hide-scrollbar gap-1 px-4 -mb-px">
          <a
            v-for="tab in tabs"
            :key="tab.id"
            :href="'#' + tab.id"
            class="flex-none py-4 px-6 text-sm font-medium border-b-2 transition-all duration-200
                   hover:text-emerald-600 focus:outline-none whitespace-nowrap"
            :class="[
              activeTab === tab.id
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-gray-500 hover:border-gray-300'
            ]"
            @click.prevent="scrollToTab(tab.id)"
          >
            {{ tab.name }}
            <span v-if="tab.count" 
                  class="ml-2 text-xs bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">
              {{ tab.count }}
            </span>
          </a>
        </div>
      </div>
    </nav>

    <!-- Loading State -->
    <div v-if="productStore.loading" class="container mx-auto px-4 py-8">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        <div v-for="n in 8" :key="n" 
             class="animate-pulse bg-white rounded-xl overflow-hidden shadow-sm p-4 flex flex-col">
          <div class="aspect-[4/3] rounded-lg bg-gray-200 mb-4"></div>
          <div class="space-y-3">
            <div class="h-2 bg-gray-200 rounded w-1/4"></div>
            <div class="h-4 bg-gray-200 rounded w-3/4"></div>
            <div class="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="productStore.error" 
         class="container mx-auto px-4 py-16 text-center">
      <div class="max-w-md mx-auto">
        <i class="fas fa-exclamation-circle text-4xl text-red-500 mb-4"></i>
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          Ürünler yüklenirken bir hata oluştu
        </h3>
        <p class="text-gray-500 mb-4">
          Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin
        </p>
        <button @click="retryLoading"
                class="inline-flex items-center px-4 py-2 border border-transparent 
                       rounded-md shadow-sm text-sm font-medium text-white 
                       bg-emerald-600 hover:bg-emerald-700 focus:outline-none 
                       focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
          <i class="fas fa-redo mr-2"></i>
          Tekrar Dene
        </button>
      </div>
    </div>

    <!-- Content -->
    <div v-else class="container mx-auto px-4">
      <div class="space-y-12 py-8">
        <!-- Önerilen Ürünler -->
        <section id="recommended" class="scroll-mt-20">
          <div class="mb-6">
            <h2 class="text-2xl font-semibold text-gray-800 mb-2">Önerilen Ürünler</h2>
            <p class="text-gray-600">Sizin için seçtiğimiz en iyi ürünler</p>
            <div class="w-20 h-1 bg-[#0F6735] rounded-full mt-2"></div>
          </div>
          <div class="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
            <router-link
              v-for="product in productStore.products"
              :key="product._id"
              :to="{ name: 'product-detail', params: { slug: product.slug || slugify(product.name) }}"
              class="group bg-white/90 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-100/50
                     shadow-sm hover:shadow-lg transition-all duration-300 
                     hover:-translate-y-1 hover:scale-[1.01] focus:outline-none focus:ring-2 
                     focus:ring-emerald-500/50 flex flex-col h-full relative"
            >
              <!-- Görsel alanı -->
              <div class="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 w-full">
                <img
                  v-if="product.images?.length"
                  :src="product.images[0].url"
                  :alt="product.name"
                  class="w-full h-full object-cover transition-all duration-500 
                         group-hover:scale-110 group-hover:brightness-105"
                  loading="lazy"
                />
                <div
                  v-else
                  class="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50"
                >
                  <i class="fas fa-image text-3xl opacity-50"></i>
                </div>
                
                <!-- Geliştirilmiş rozetler -->
                <div class="absolute top-3 left-3 flex gap-2">
                  <span
                    v-if="isNewProduct(product)"
                    class="bg-emerald-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full 
                           font-medium shadow-md animate-fadeIn transform hover:scale-105 
                           transition-all duration-300"
                  >Yeni</span>
                  <span
                    v-if="product.price?.discount > 0"
                    class="bg-red-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full 
                           font-medium shadow-md animate-fadeIn transform hover:scale-105
                           transition-all duration-300"
                  >%{{ product.price.discount }}</span>
                </div>

                <!-- Hover overlay -->
                <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 
                           transition-opacity duration-300"></div>
              </div>
              
              <!-- İçerik alanı -->
              <div class="p-3 sm:p-4 flex flex-col flex-grow">
                <div class="space-y-2.5 flex-grow">
                  <!-- Kategori -->
                  <router-link
                    v-if="product.category"
                    :to="getCategoryRoute(product.category)"
                    class="text-xs text-emerald-600 hover:text-emerald-700 font-medium 
                           transition-colors duration-200 inline-flex items-center gap-1"
                    @click.stop
                  >
                    <i class="fas fa-tag text-[10px]"></i>
                    {{ getCategoryName(product) }}
                  </router-link>
                  
                  <!-- Ürün Adı -->
                  <h3 class="font-medium text-gray-800 line-clamp-2 group-hover:text-emerald-600
                           transition-colors duration-200 text-sm sm:text-base">
                    {{ product.name }}
                  </h3>

                  <!-- Fiyat alanı -->
                  <div class="flex items-baseline gap-2">
                    <span class="font-semibold text-emerald-600 text-base sm:text-lg">
                      {{ formatPrice(product.price?.current) }} TL
                    </span>
                    <span 
                      v-if="product.price?.discount > 0" 
                      class="text-xs text-gray-400 line-through"
                    >
                      {{ formatPrice(product.price?.original) }} TL
                    </span>
                  </div>
                </div>

                <!-- Detay butonu -->
                <button
                  class="w-full mt-3 bg-emerald-50 text-emerald-600 py-2 rounded-lg flex items-center 
                         justify-center gap-2 transition-all duration-300 
                         hover:bg-emerald-600 hover:text-white group/btn text-sm font-medium
                         focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  @click.stop
                >
                  Detayları Gör
                  <i class="fas fa-arrow-right text-xs transition-transform duration-300 
                           group-hover/btn:translate-x-0.5"></i>
                </button>
              </div>
            </router-link>
          </div>
        </section>

        <!-- Yeni Ürünler -->
        <section id="new" class="scroll-mt-20">
          <div class="mb-6">
            <h2 class="text-2xl font-semibold text-gray-800 mb-2">Yeni Ürünler</h2>
            <p class="text-gray-600">En son eklenen taze ürünlerimiz</p>
            <div class="w-20 h-1 bg-[#0F6735] rounded-full mt-2"></div>
          </div>
          <div class="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
            <router-link
              v-for="product in productStore.newProducts"
              :key="product._id"
              :to="{ name: 'product-detail', params: { slug: product.slug || slugify(product.name) }}"
              class="group bg-white/90 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-100/50
                     shadow-sm hover:shadow-lg transition-all duration-300 
                     hover:-translate-y-1 hover:scale-[1.01] focus:outline-none focus:ring-2 
                     focus:ring-emerald-500/50 flex flex-col h-full relative"
            >
              <!-- Görsel alanı -->
              <div class="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 w-full">
                <img
                  v-if="product.images?.length"
                  :src="product.images[0].url"
                  :alt="product.name"
                  class="w-full h-full object-cover transition-all duration-500 
                         group-hover:scale-110 group-hover:brightness-105"
                  loading="lazy"
                />
                <div
                  v-else
                  class="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50"
                >
                  <i class="fas fa-image text-3xl opacity-50"></i>
                </div>
                
                <!-- Geliştirilmiş rozetler -->
                <div class="absolute top-3 left-3 flex gap-2">
                  <span
                    v-if="isNewProduct(product)"
                    class="bg-emerald-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full 
                           font-medium shadow-md animate-fadeIn transform hover:scale-105 
                           transition-all duration-300"
                  >Yeni</span>
                  <span
                    v-if="product.price?.discount > 0"
                    class="bg-red-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full 
                           font-medium shadow-md animate-fadeIn transform hover:scale-105
                           transition-all duration-300"
                  >%{{ product.price.discount }}</span>
                </div>

                <!-- Hover overlay -->
                <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 
                           transition-opacity duration-300"></div>
              </div>
              
              <!-- İçerik alanı -->
              <div class="p-3 sm:p-4 flex flex-col flex-grow">
                <div class="space-y-2.5 flex-grow">
                  <!-- Kategori -->
                  <router-link
                    v-if="product.category"
                    :to="getCategoryRoute(product.category)"
                    class="text-xs text-emerald-600 hover:text-emerald-700 font-medium 
                           transition-colors duration-200 inline-flex items-center gap-1"
                    @click.stop
                  >
                    <i class="fas fa-tag text-[10px]"></i>
                    {{ getCategoryName(product) }}
                  </router-link>
                  
                  <!-- Ürün Adı -->
                  <h3 class="font-medium text-gray-800 line-clamp-2 group-hover:text-emerald-600
                           transition-colors duration-200 text-sm sm:text-base">
                    {{ product.name }}
                  </h3>

                  <!-- Fiyat alanı -->
                  <div class="flex items-baseline gap-2">
                    <span class="font-semibold text-emerald-600 text-base sm:text-lg">
                      {{ formatPrice(product.price?.current) }} TL
                    </span>
                    <span 
                      v-if="product.price?.discount > 0" 
                      class="text-xs text-gray-400 line-through"
                    >
                      {{ formatPrice(product.price?.original) }} TL
                    </span>
                  </div>
                </div>

                <!-- Detay butonu -->
                <button
                  class="w-full mt-3 bg-emerald-50 text-emerald-600 py-2 rounded-lg flex items-center 
                         justify-center gap-2 transition-all duration-300 
                         hover:bg-emerald-600 hover:text-white group/btn text-sm font-medium
                         focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  @click.stop
                >
                  Detayları Gör
                  <i class="fas fa-arrow-right text-xs transition-transform duration-300 
                           group-hover/btn:translate-x-0.5"></i>
                </button>
              </div>
            </router-link>
          </div>
        </section>

        <!-- İndirimli Ürünler -->
        <section id="discounted" class="scroll-mt-20">
          <div class="mb-6">
            <h2 class="text-2xl font-semibold text-gray-800 mb-2">İndirimli Ürünler</h2>
            <p class="text-gray-600">Kaçırılmayacak fırsatlar</p>
            <div class="w-20 h-1 bg-[#0F6735] rounded-full mt-2"></div>
          </div>
          <div class="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
            <router-link
              v-for="product in productStore.discountedProducts"
              :key="product._id"
              :to="{ name: 'product-detail', params: { slug: product.slug || slugify(product.name) }}"
              class="group bg-white/90 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-100/50
                     shadow-sm hover:shadow-lg transition-all duration-300 
                     hover:-translate-y-1 hover:scale-[1.01] focus:outline-none focus:ring-2 
                     focus:ring-emerald-500/50 flex flex-col h-full relative"
            >
              <!-- Görsel alanı -->
              <div class="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 w-full">
                <img
                  v-if="product.images?.length"
                  :src="product.images[0].url"
                  :alt="product.name"
                  class="w-full h-full object-cover transition-all duration-500 
                         group-hover:scale-110 group-hover:brightness-105"
                  loading="lazy"
                />
                <div
                  v-else
                  class="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50"
                >
                  <i class="fas fa-image text-3xl opacity-50"></i>
                </div>
                
                <!-- Geliştirilmiş rozetler -->
                <div class="absolute top-3 left-3 flex gap-2">
                  <span
                    v-if="isNewProduct(product)"
                    class="bg-emerald-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full 
                           font-medium shadow-md animate-fadeIn transform hover:scale-105 
                           transition-all duration-300"
                  >Yeni</span>
                  <span
                    v-if="product.price?.discount > 0"
                    class="bg-red-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full 
                           font-medium shadow-md animate-fadeIn transform hover:scale-105
                           transition-all duration-300"
                  >%{{ product.price.discount }}</span>
                </div>

                <!-- Hover overlay -->
                <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 
                           transition-opacity duration-300"></div>
              </div>
              
              <!-- İçerik alanı -->
              <div class="p-3 sm:p-4 flex flex-col flex-grow">
                <div class="space-y-2.5 flex-grow">
                  <!-- Kategori -->
                  <router-link
                    v-if="product.category"
                    :to="getCategoryRoute(product.category)"
                    class="text-xs text-emerald-600 hover:text-emerald-700 font-medium 
                           transition-colors duration-200 inline-flex items-center gap-1"
                    @click.stop
                  >
                    <i class="fas fa-tag text-[10px]"></i>
                    {{ getCategoryName(product) }}
                  </router-link>
                  
                  <!-- Ürün Adı -->
                  <h3 class="font-medium text-gray-800 line-clamp-2 group-hover:text-emerald-600
                           transition-colors duration-200 text-sm sm:text-base">
                    {{ product.name }}
                  </h3>

                  <!-- Fiyat alanı -->
                  <div class="flex items-baseline gap-2">
                    <span class="font-semibold text-emerald-600 text-base sm:text-lg">
                      {{ formatPrice(product.price?.current) }} TL
                    </span>
                    <span 
                      v-if="product.price?.discount > 0" 
                      class="text-xs text-gray-400 line-through"
                    >
                      {{ formatPrice(product.price?.original) }} TL
                    </span>
                  </div>
                </div>

                <!-- Detay butonu -->
                <button
                  class="w-full mt-3 bg-emerald-50 text-emerald-600 py-2 rounded-lg flex items-center 
                         justify-center gap-2 transition-all duration-300 
                         hover:bg-emerald-600 hover:text-white group/btn text-sm font-medium
                         focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  @click.stop
                >
                  Detayları Gör
                  <i class="fas fa-arrow-right text-xs transition-transform duration-300 
                           group-hover/btn:translate-x-0.5"></i>
                </button>
              </div>
            </router-link>
          </div>
        </section>
      </div>
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
    const activeTab = ref("recommended");

    const tabs = [
      { id: 'recommended', name: 'Sizin İçin Önerilen' },
      { id: 'new', name: 'Yeni Ürünler' },
      { id: 'discounted', name: 'İndirimli Ürünler' }
    ];

    const getTabIcon = (tabId) => {
      switch (tabId) {
        case 0:
          return 'fas fa-th-large';
        case 1:
          return 'fas fa-star';
        case 2:
          return 'fas fa-tags';
        default:
          return 'fas fa-th-large';
      }
    };

    const slugify = (text) => {
      return (
        text
          ?.toLowerCase()
          .replace(/[^a-z0-9-]/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "") || ""
      );
    };

    const buildCategoryPath = (category) => {
      const path = [];
      let currentCategory = category;

      while (currentCategory) {
        path.unshift(slugify(currentCategory.name));
        currentCategory = currentCategory.parent;
      }

      return path;
    };

    const getCategoryRoute = (category) => {
      if (!category) return { name: "home" };

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
      switch (activeTab.value) {
        case 'recommended':
          return productStore.products;
        case 'new':
          return productStore.newProducts;
        case 'discounted':
          return productStore.discountedProducts;
        default:
          return [];
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

    const handleTabChange = (tabId) => {
      activeTab.value = tabId;
    };

    const retryLoading = async () => {
      try {
        await productStore.fetchAllSections();
      } catch (error) {
        console.error('Ürünler yüklenirken hata:', error);
      }
    };

    const scrollToTab = (tabId) => {
      activeTab.value = tabId;
      const element = document.getElementById(tabId);
      if (element) {
        const offset = 64; // nav yüksekliği
        const top = element.offsetTop - offset;
        window.scrollTo({
          top,
          behavior: 'smooth'
        });
      }
    };

    onMounted(async () => {
      productStore.initializeSocketListeners();
      try {
        await productStore.fetchAllSections(); // Yeni eklenen fonksiyon
      } catch (error) {
        console.error('Ürünler yüklenirken hata:', error);
      }
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
      slugify,
      getTabIcon,
      retryLoading,
      scrollToTab,
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

/* Scrollbar gizleme için özel stil */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Tab geçiş animasyonu */
.tab-enter-active,
.tab-leave-active {
  transition: all 0.3s ease-in-out;
}

.tab-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.tab-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* Tab hover efekti */
button:hover .tab-icon {
  transform: scale(1.1);
  transition: transform 0.2s ease;
}
</style>