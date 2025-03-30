<template>
  <section
    class="product-gallery"
    itemscope
    itemtype="http://schema.org/ImageGallery"
  >
    <!-- Ana görsel görüntüleme alanı -->
    <div class="relative pb-8">
      <!-- Ana Görsel Container -->
      <div
        class="relative w-full aspect-[4/3] md:aspect-[16/9] lg:aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 group"
        :class="{ 'animate-pulse': loading }"
        @touchstart.passive="handleTouchStart"
        @touchmove.passive="handleTouchMove"
        @touchend.passive="handleTouchEnd"
      >
        <!-- Loading Placeholder -->
        <div
          v-if="loading"
          class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100"
          aria-label="Yükleniyor"
        >
          <div
            class="w-12 h-12 rounded-full border-4 border-gray-200 border-t-[#2F5E32] animate-spin"
            role="progressbar"
          ></div>
        </div>

        <picture v-if="currentImage">
          <source
            :srcset="`
              ${currentImage.url.replace('/upload/', '/upload/f_webp,q_auto:good,w_400,h_400,c_fit/')} 400w,
              ${currentImage.url.replace('/upload/', '/upload/f_webp,q_auto:good,w_600,h_600,c_fit/')} 600w,
              ${currentImage.url.replace('/upload/', '/upload/f_webp,q_auto:good,w_800,h_800,c_fit/')} 800w,
              ${currentImage.url.replace('/upload/', '/upload/f_webp,q_auto:good,w_1200,h_1200,c_fit/')} 1200w
            `"
            type="image/webp"
          />
          <img
            :src="currentImage.url.replace('/upload/', '/upload/f_auto,q_auto:good,w_600,h_600,c_fit/')"
            :srcset="`
              ${currentImage.url.replace('/upload/', '/upload/f_auto,q_auto:good,w_400,h_400,c_fit/')} 400w,
              ${currentImage.url.replace('/upload/', '/upload/f_auto,q_auto:good,w_600,h_600,c_fit/')} 600w,
              ${currentImage.url.replace('/upload/', '/upload/f_auto,q_auto:good,w_800,h_800,c_fit/')} 800w,
              ${currentImage.url.replace('/upload/', '/upload/f_auto,q_auto:good,w_1200,h_1200,c_fit/')} 1200w
            `"
            :sizes="'(max-width: 480px) 100vw, (max-width: 768px) 75vw, (max-width: 1024px) 50vw, 800px'"
            :alt="currentImage.alt || `${currentImageIndex + 1}. ürün görseli`"
            class="w-full h-full object-contain transition-transform duration-300"
            :class="{
              'opacity-0': loading,
              'scale-[1.6] cursor-zoom-out': zoomed,
              'cursor-zoom-in': !zoomed,
            }"
            @click="toggleZoom"
            itemprop="image"
            fetchpriority="high"
            decoding="async"
            loading="eager"
            width="800"
            height="800"
            @load="handleImageLoad"
          />
        </picture>
        <div
          v-else
          class="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50"
        >
          <div class="text-center">
            <ImageOff class="w-12 h-12 mx-auto mb-2" />
            <span class="text-sm text-gray-500">Görsel bulunamadı</span>
          </div>
        </div>

        <!-- Navigasyon Butonları -->
        <div
          v-if="sortedImages.length > 1"
          class="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          aria-label="Galeri navigasyonu"
        >
          <button
            @click.prevent="prevImage"
            class="p-2.5 rounded-full bg-white/95 hover:bg-white shadow-lg transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#2F5E32] backdrop-blur-sm"
            :disabled="loading || isFirstImage"
            :class="{ 'opacity-50 cursor-not-allowed': isFirstImage }"
          >
            <ChevronLeft class="w-5 h-5 text-gray-800" />
          </button>
          <button
            @click.prevent="nextImage"
            class="p-2.5 rounded-full bg-white/95 hover:bg-white shadow-lg transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#2F5E32] backdrop-blur-sm"
            :disabled="loading || isLastImage"
            :class="{ 'opacity-50 cursor-not-allowed': isLastImage }"
          >
            <ChevronRight class="w-5 h-5 text-gray-800" />
          </button>
        </div>

        <!-- Zoom İndikatörü -->
        <div
          v-if="!zoomed"
          class="absolute bottom-4 right-4 bg-white/90 px-3 py-1 rounded-full text-sm font-medium shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ZoomIn class="w-4 h-4 inline-block mr-1" />
          Yakınlaştırmak için tıklayın
        </div>
      </div>

      <!-- Thumbnail Navigator -->
      <div
        v-if="sortedImages.length > 1"
        class="mt-4 grid grid-flow-col auto-cols-[4.5rem] md:auto-cols-[5rem] gap-2 sm:gap-3 overflow-x-auto scrollbar-thin pb-2 snap-x"
        role="tablist"
        aria-label="Ürün görselleri"
      >
        <button
          v-for="(img, idx) in sortedImages"
          :key="img.publicId || idx"
          @click="selectImage(idx)"
          class="relative aspect-square rounded-lg overflow-hidden focus:outline-none transition-transform duration-200 transform hover:scale-105 snap-center focus:ring-2 focus:ring-[#2F5E32]"
          :class="{
            'ring-2 ring-[#2F5E32] shadow-md': currentImageIndex === idx,
            'opacity-60 hover:opacity-100': currentImageIndex !== idx,
            'cursor-not-allowed': loading,
          }"
          :disabled="loading"
          role="tab"
          :aria-selected="currentImageIndex === idx"
          :aria-label="`Görsel ${idx + 1}`"
        >
          <picture>
            <source
              :srcset="img.url.replace('/upload/', '/upload/f_webp,q_auto:good,w_120,h_120,c_fill,g_center/')"
              type="image/webp"
            />
            <img
              :src="img.url.replace('/upload/', '/upload/f_auto,q_auto:good,w_120,h_120,c_fill,g_center/')"
              :alt="`Küçük görsel ${idx + 1}`"
              class="w-full h-full object-cover transition-opacity duration-200"
              :class="{ 'opacity-50': loading }"
              loading="lazy"
              decoding="async"
              width="120"
              height="120"
            />
          </picture>
          <div
            v-if="loading"
            class="absolute inset-0 flex items-center justify-center bg-white/50"
            aria-hidden="true"
          >
            <div
              class="w-4 h-4 border-2 border-[#2F5E32] border-t-transparent rounded-full animate-spin"
            ></div>
          </div>
        </button>
      </div>
    </div>

    <!-- Lightbox -->
    <div
      v-if="showLightbox"
      class="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      @click.self="closeLightbox"
    >
      <div class="relative max-w-4xl w-full p-4">
        <img
          :src="
            currentImage?.url.replace(
              '/upload/',
              '/upload/f_auto,q_auto:eco,w_800,h_800,c_limit,g_center/'
            )
          "
          :alt="currentImage?.alt"
          class="max-w-full max-h-full object-contain"
          loading="lazy"
        />
        <button
          @click="closeLightbox"
          class="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Lightbox'ı kapat"
        >
          <X class="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  </section>
</template>

<script>
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ImageOff,
  X,
} from "lucide-vue-next";
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { useThrottleFn } from "@vueuse/core";

export default {
  name: "ProductGallery",
  components: {
    ChevronLeft,
    ChevronRight,
    ZoomIn,
    ImageOff,
    X,
  },

  props: {
    images: {
      type: Array,
      required: true,
      validator: (value) => {
        return value.every(
          (img) =>
            typeof img === "object" &&
            img !== null &&
            "url" in img &&
            typeof img.url === "string"
        );
      },
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },

  setup(props) {
    const zoomed = ref(false);
    const loading = ref(true);
    const currentImageIndex = ref(0);
    const showLightbox = ref(false);
    const touchStartX = ref(0);
    const touchEndX = ref(0);
    let preloadedImages = new Set();

    const sortedImages = computed(() => {
      return props.images || [];
    });

    const currentImage = computed(() => {
      return sortedImages.value[currentImageIndex.value];
    });

    const isFirstImage = computed(() => currentImageIndex.value === 0);
    const isLastImage = computed(() => {
      return currentImageIndex.value === sortedImages.value.length - 1;
    });

    // Touch olayları için throttle
    const handleTouchStart = useThrottleFn((e) => {
      touchStartX.value = e.touches[0].clientX;
    }, 16);

    const handleTouchMove = useThrottleFn((e) => {
      touchEndX.value = e.touches[0].clientX;
    }, 16);

    const handleTouchEnd = useThrottleFn(() => {
      const swipeThreshold = 50;
      const swipeDistance = touchEndX.value - touchStartX.value;

      if (Math.abs(swipeDistance) > swipeThreshold) {
        if (swipeDistance > 0 && !isFirstImage.value) {
          prevImage();
        } else if (swipeDistance < 0 && !isLastImage.value) {
          nextImage();
        }
      }
    }, 16);

    const handleImageLoad = () => {
      loading.value = false;
    };

    const toggleZoom = useThrottleFn(() => {
      zoomed.value = !zoomed.value;
    }, 300);

    const openLightbox = () => {
      showLightbox.value = true;
      document.body.style.overflow = "hidden";
    };

    const closeLightbox = () => {
      showLightbox.value = false;
      document.body.style.overflow = "";
    };

    const preloadImage = (url) => {
      if (preloadedImages.has(url)) return;
      
      const img = new Image();
      img.fetchPriority = 'low';
      img.loading = 'lazy';
      img.src = url.replace(
        '/upload/',
        '/upload/f_auto,q_auto:good,w_600,h_600,c_fit/'
      );
      preloadedImages.add(url);
    };

    const preloadAdjacentImages = () => {
      const nextIndex = currentImageIndex.value + 1;
      const prevIndex = currentImageIndex.value - 1;

      if (sortedImages.value[nextIndex]) {
        preloadImage(sortedImages.value[nextIndex].url);
      }
      if (sortedImages.value[prevIndex]) {
        preloadImage(sortedImages.value[prevIndex].url);
      }
    };

    const nextImage = useThrottleFn(() => {
      if (loading.value || !sortedImages.value.length) return;
      currentImageIndex.value =
        (currentImageIndex.value + 1) % sortedImages.value.length;
    }, 300);

    const prevImage = useThrottleFn(() => {
      if (loading.value || !sortedImages.value.length) return;
      currentImageIndex.value =
        (currentImageIndex.value - 1 + sortedImages.value.length) %
        sortedImages.value.length;
    }, 300);

    const selectImage = useThrottleFn((index) => {
      if (loading.value) return;
      currentImageIndex.value = index;
    }, 300);

    onMounted(() => {
      if (props.images?.[0]?.url) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = props.images[0].url.replace(
          '/upload/',
          '/upload/f_auto,q_auto:good,w_600,h_600,c_fit/'
        );
        link.fetchPriority = 'high';
        document.head.appendChild(link);
        
        // İlk birkaç görseli önyükle
        sortedImages.value.slice(0, 3).forEach(img => {
          preloadImage(img.url);
        });
      }
    });

    watch(() => currentImageIndex.value, () => {
      preloadAdjacentImages();
    });

    onBeforeUnmount(() => {
      preloadedImages.clear();
    });

    return {
      zoomed,
      loading,
      currentImage,
      currentImageIndex,
      sortedImages,
      isFirstImage,
      isLastImage,
      showLightbox,
      toggleZoom,
      handleImageLoad,
      openLightbox,
      closeLightbox,
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
      nextImage,
      prevImage,
      selectImage,
    };
  },
};
</script>

<style scoped>
/* Performans optimizasyonları */
.product-gallery {
  contain: content;
  overscroll-behavior: contain;
}

.product-gallery img {
  will-change: transform;
  transform: translateZ(0);
  backface-visibility: hidden;
  contain: paint;
}

/* Smooth transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Scrollbar styles */
.scrollbar-thin {
  scrollbar-width: thin;
  -webkit-overflow-scrolling: touch;
}

.scrollbar-thin::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #cdcdcd;
  border-radius: 2px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Touch optimizasyonları */
@media (hover: none) {
  .product-gallery {
    touch-action: pan-y pinch-zoom;
  }
  
  .product-gallery img {
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .product-gallery img,
  .fade-enter-active,
  .fade-leave-active {
    transition: none !important;
  }
}
</style>
