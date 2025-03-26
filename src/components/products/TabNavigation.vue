<template>
  <div class="w-full">
    <!-- Tab Navigation -->
    <nav class="sticky top-16 bg-white/90 backdrop-blur-md z-30 shadow-lg">
      <div class="w-full">
        <div class="grid grid-cols-2 gap-4 px-4 sm:px-6 relative py-2">
          <a
            v-for="tab in tabs"
            :key="tab.id"
            :href="'#' + tab.id"
            class="flex py-2.5 min-[400px]:py-3.5 px-2 min-[400px]:px-4 text-sm font-medium 
                   transition-all duration-300 hover:text-emerald-600 focus:outline-none rounded-xl
                   relative group overflow-hidden text-center w-full"
            :class="[
              activeTab === tab.id
                ? 'text-emerald-600 bg-emerald-50/50'
                : 'text-gray-600 hover:bg-gray-50/80'
            ]"
            @click.prevent="scrollToTab(tab.id)"
          >
            <!-- Tab Background Effect -->
            <div class="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-emerald-600/5 
                        opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <!-- Tab Content -->
            <div class="relative flex flex-col min-[400px]:flex-row items-center justify-center 
                        gap-1 min-[400px]:gap-2 w-full">
              <!-- Tab Icons -->
              <i :class="[
                'fas',
                tab.id === 'recommended' ? 'fa-star' : 
                tab.id === 'new' ? 'fa-sparkles' : 
                'fa-tag',
                'text-xs',
                activeTab === tab.id ? 'text-emerald-500' : 'text-gray-400'
              ]"></i>
              
              <!-- Tab Name with Responsive Text -->
              <div class="hidden min-[400px]:block flex-1">{{ tab.name }}</div>
              <div class="block min-[400px]:hidden">
                <div>{{ getFirstWord(tab.id) }}</div>
                <div class="text-[11px] opacity-90">{{ getSecondWord(tab.id) }}</div>
              </div>
              
              <!-- Count Badge -->
              <span v-if="tab.count" 
                    class="absolute top-1 right-1 min-[400px]:static min-[400px]:ml-1 
                           text-[10px] min-[400px]:text-xs bg-emerald-100 text-emerald-600 
                           px-1.5 min-[400px]:px-2 py-0.5 rounded-full shadow-sm 
                           transition-all duration-300 group-hover:bg-emerald-500 
                           group-hover:text-white">
                {{ tab.count }}
              </span>
            </div>

            <!-- Active Indicator -->
            <div v-if="activeTab === tab.id"
                 class="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r 
                        from-emerald-500 to-emerald-600 animate-slideIn"></div>
          </a>
        </div>
      </div>
    </nav>

    <!-- Content -->
    <div class="px-4">
      <div class="space-y-12 py-8">
        <template v-for="tab in tabs" :key="tab.id">
          <section :id="tab.id" class="scroll-mt-24">
            <div class="mb-8 relative">
              <div class="flex items-center gap-3">
                <i :class="[
                  'fas',
                  tab.id === 'recommended' ? 'fa-star' : 
                  tab.id === 'new' ? 'fa-sparkles' : 
                  'fa-tag',
                  'text-2xl text-emerald-600'
                ]"></i>
                <h2 class="text-2xl font-montserrat font-semibold text-gray-800 tracking-tight">
                  {{ tab.title }}
                </h2>
              </div>
              <div class="w-24 h-1 bg-gradient-to-r from-emerald-500 to-emerald-600 
                          rounded-full mt-3 ml-9 opacity-80"></div>
            </div>

            <!-- Loading State -->
            <div v-if="loading" 
                 class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 
                        gap-4 sm:gap-6">
              <div v-for="n in 8" :key="n" 
                   class="animate-pulse bg-white rounded-xl overflow-hidden shadow-sm p-4 
                          flex flex-col">
                <div class="aspect-square rounded-xl bg-gray-200 mb-4"></div>
                <div class="space-y-3">
                  <div class="h-2 bg-gray-200 rounded-full w-1/4"></div>
                  <div class="h-4 bg-gray-200 rounded-full w-3/4"></div>
                  <div class="h-4 bg-gray-200 rounded-full w-1/2"></div>
                </div>
              </div>
            </div>

            <!-- Error State -->
            <div v-else-if="error" 
                 class="py-16 text-center bg-red-50/50 rounded-2xl backdrop-blur-sm">
              <div class="max-w-md mx-auto">
                <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 
                            flex items-center justify-center">
                  <i class="fas fa-exclamation-circle text-3xl text-red-500"></i>
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">
                  Ürünler yüklenirken bir hata oluştu
                </h3>
                <p class="text-gray-500 mb-6">
                  Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin
                </p>
                <button @click="retryLoading"
                        class="inline-flex items-center px-6 py-2.5 border border-transparent 
                               rounded-xl shadow-md text-sm font-medium text-white 
                               bg-gradient-to-r from-emerald-500 to-emerald-600
                               hover:from-emerald-600 hover:to-emerald-700
                               focus:outline-none focus:ring-2 focus:ring-offset-2 
                               focus:ring-emerald-500 transition-all duration-300">
                  <i class="fas fa-redo mr-2"></i>
                  Tekrar Dene
                </button>
              </div>
            </div>

            <!-- Products Grid -->
            <div v-else 
                 class="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 
                        gap-4 sm:gap-5 md:gap-6">
              <product-card
                v-for="product in getProductsBySection(tab.id)"
                :key="product._id"
                :product="product"
              />
            </div>
          </section>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, onBeforeUnmount } from 'vue';
import { useProductStore } from "@/stores/productStore.js";
import ProductCard from './ProductCard.vue';

export default {
  name: "TabNavigation",
  components: { ProductCard },
  setup() {
    const productStore = useProductStore();
    const activeTab = ref("recommended");
    let observers = [];

    const tabs = [
      {
        id: 'recommended',
        name: 'Sizin İçin Önerilen',
        title: 'Sizin İçin Önerilen',
      },
      {
        id: 'new',
        name: 'Yeni Ürünler',
        title: 'Yeni Ürünler',
      }
    ];

    const scrollToTab = (tabId) => {
      activeTab.value = tabId;
      const element = document.getElementById(tabId);
      if (element) {
        const offset = 64;
        const top = element.offsetTop - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    };

    const setupIntersectionObservers = () => {
      // Önce eski observer'ları temizle
      observers.forEach(observer => observer.disconnect());
      observers = [];

      // Her section için yeni bir observer oluştur
      tabs.forEach(tab => {
        const element = document.getElementById(tab.id);
        if (!element) return;

        const observer = new IntersectionObserver(
          (entries) => {
            requestAnimationFrame(() => {
              entries.forEach(entry => {
                // Eğer element görünür alandaysa ve yeterince görünürse
                if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
                  activeTab.value = tab.id;
                }
              });
            });
          },
          {
            root: null, // viewport'u kullan
            rootMargin: '-20% 0px -60% 0px', // üstten ve alttan margin bırak
            threshold: [0.5] // elementin %50'si görünür olduğunda tetikle
          }
        );

        observer.observe(element);
        observers.push(observer);
      });
    };

    const getProductsBySection = (sectionId) => {
      switch (sectionId) {
        case 'recommended':
          return productStore.products;
        case 'new':
          return productStore.newProducts;
        default:
          return [];
      }
    };

    const getFirstWord = (tabId) => {
      switch (tabId) {
        case 'recommended':
          return 'Sizin';
        case 'new':
          return 'Yeni';
        default:
          return '';
      }
    };

    const getSecondWord = (tabId) => {
      switch (tabId) {
        case 'recommended':
          return 'İçin';
        case 'new':
          return 'Ürünler';
        default:
          return '';
      }
    };

    const retryLoading = async () => {
      try {
        await productStore.fetchAllSections();
      } catch (error) {
        console.error('Ürünler yüklenirken hata:', error);
      }
    };

    onMounted(async () => {
      productStore.initializeSocketListeners();
      await retryLoading();
      // Sayfa yüklendikten sonra observer'ları kur
      setupIntersectionObservers();
    });

    onBeforeUnmount(() => {
      // Component unmount olduğunda observer'ları temizle
      observers.forEach(observer => observer.disconnect());
    });

    return {
      activeTab,
      tabs,
      productStore,
      scrollToTab,
      retryLoading,
      getProductsBySection,
      getFirstWord,
      getSecondWord,
      loading: computed(() => productStore.loading),
      error: computed(() => productStore.error)
    };
  }
};
</script>

<style scoped>
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

@keyframes slideIn {
  from { 
    transform: scaleX(0);
    opacity: 0;
  }
  to { 
    transform: scaleX(1);
    opacity: 1;
  }
}

.animate-slideIn {
  animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  transform-origin: left;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in-up {
  animation: fadeInUp 0.5s ease-out forwards;
}
</style>
