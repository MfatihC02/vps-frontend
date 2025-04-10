<template>
  <section
    class="product-gallery"
    itemscope
    itemtype="http://schema.org/ImageGallery"
  >
    <!-- Ana görsel görüntüleme alanı -->
    <div class="relative pb-4 md:pb-8">
      <!-- Ana Görsel Container -->
      <div
        class="relative w-full h-[50vh] md:h-[70vh] rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 group sticky top-0 z-10"
        :class="{ 'animate-pulse': loading }"
        @touchstart.passive="handleTouchStart"
        @touchmove.passive="handleTouchMove"
        @touchend.passive="handleTouchEnd"
      >
        <!-- Loading Placeholder -->
        <div
          v-if="loading"
          class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100"
        >
          <div
            class="w-12 h-12 rounded-full border-4 border-gray-200 border-t-[#2F5E32] animate-spin"
          ></div>
        </div>

        <picture v-if="currentImage">
          <source
            :srcset="`
              ${currentImage.url.replace('/upload/', '/upload/f_webp,q_auto:good,w_300,dpr_auto,c_limit,e_blur:1000/')} 300w,
              ${currentImage.url.replace('/upload/', '/upload/f_webp,q_auto:good,w_400,dpr_auto,c_limit/')} 400w,
              ${currentImage.url.replace('/upload/', '/upload/f_webp,q_auto:good,w_600,dpr_auto,c_limit/')} 600w
            `"
            type="image/webp"
            media="(max-width: 768px)"
          />
          <source
            :srcset="`
              ${currentImage.url.replace('/upload/', '/upload/f_webp,q_auto:eco,w_600,dpr_auto,c_limit/')} 600w,
              ${currentImage.url.replace('/upload/', '/upload/f_webp,q_auto:eco,w_800,dpr_auto,c_limit/')} 800w,
              ${currentImage.url.replace('/upload/', '/upload/f_webp,q_auto:eco,w_1200,dpr_auto,c_limit/')} 1200w
            `"
            type="image/webp"
            media="(min-width: 769px)"
          />
          <img
            :src="currentImage.url.replace('/upload/', '/upload/f_auto,q_auto:good,w_300,dpr_auto,c_limit/')"
            :srcset="`
              ${currentImage.url.replace('/upload/', '/upload/f_auto,q_auto:good,w_300,dpr_auto,c_limit/')} 300w,
              ${currentImage.url.replace('/upload/', '/upload/f_auto,q_auto:good,w_400,dpr_auto,c_limit/')} 400w
            `"
            :sizes="'(max-width: 480px) 90vw, (max-width: 768px) 70vw, 600px'"
            :alt="currentImage.alt || `${currentImageIndex + 1}. ürün görseli`"
            class="w-full h-full object-contain transition-all duration-300"
            width="300"
            height="300"
            :class="{
              'opacity-0': loading,
              'scale-[1.6] cursor-zoom-out': zoomed,
              'cursor-zoom-in': !zoomed,
            }"
            @click="toggleZoom"
            itemprop="image"
            fetchpriority="high"
            decoding="async"
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
        class="mt-4 flex gap-1.5 sm:gap-3 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pb-2 snap-x"
        role="tablist"
        aria-label="Ürün görselleri"
      >
        <button
          v-for="(img, idx) in sortedImages"
          :key="img.publicId || idx"
          @click="selectImage(idx)"
          class="relative flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden focus:outline-none transition-all duration-200 transform hover:scale-105 snap-center"
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
              :srcset="img.url.replace('/upload/', '/upload/f_webp,q_auto:eco,w_100,h_100,c_fill,g_center/')"
              type="image/webp"
            />
            <img
              :src="img.url.replace('/upload/', '/upload/f_auto,q_auto:eco,w_100,h_100,c_fill,g_center/')"
              :alt="`Küçük görsel ${idx + 1}`"
              class="w-full h-full object-cover transition-opacity duration-200"
              :class="{ 'opacity-50': loading }"
              loading="lazy"
              decoding="async"
              width="100"
              height="100"
            />
          </picture>
          <div
            v-if="loading"
            class="absolute inset-0 flex items-center justify-center bg-white/50"
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
import { defineAsyncComponent } from "vue";

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

    const sortedImages = computed(() => {
      return props.images || [];
    });

    const currentImage = computed(() => {
      return sortedImages.value[currentImageIndex.value];
    });

    const isFirstImage = computed(() => currentImageIndex.value === 0);
    const isLastImage = computed(() => {
      return (
        currentImageIndex.value === sortedImages.value.length - 1
      );
    });

    const handleTouchStart = (e) => {
      touchStartX.value = e.touches[0].clientX;
    };

    const handleTouchMove = (e) => {
      touchEndX.value = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
      const swipeThreshold = 50; 
      const swipeDistance = touchEndX.value - touchStartX.value;

      if (Math.abs(swipeDistance) > swipeThreshold) {
        if (swipeDistance > 0 && !isFirstImage.value) {
          prevImage();
        } else if (swipeDistance < 0 && !isLastImage.value) {
          nextImage();
        }
      }
    };

    const handleImageLoad = () => {
      loading.value = false;
    };

    const toggleZoom = () => {
      zoomed.value = !zoomed.value;
    };

    const openLightbox = () => {
      showLightbox.value = true;
      document.body.style.overflow = "hidden";
    };

    const closeLightbox = () => {
      showLightbox.value = false;
      document.body.style.overflow = "";
    };

    const nextImage = () => {
      if (loading.value || !sortedImages.value.length) return;
      currentImageIndex.value =
        (currentImageIndex.value + 1) % sortedImages.value.length;
    };

    const prevImage = () => {
      if (loading.value || !sortedImages.value.length) return;
      currentImageIndex.value =
        (currentImageIndex.value - 1 + sortedImages.value.length) %
        sortedImages.value.length;
    };

    const selectImage = (index) => {
      if (loading.value) return;
      currentImageIndex.value = index;
    };

    onMounted(() => {
      if (props.images?.[0]?.url) {
        // Ana görseli preload et
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = props.images[0].url.replace(
          '/upload/',
          '/upload/f_auto,q_auto:good,w_300,dpr_auto,c_limit/'
        );
        link.fetchPriority = 'high';
        document.head.appendChild(link);

        // Bir sonraki görseli düşük öncelikle preload et
        if (props.images[1]?.url) {
          const nextLink = document.createElement('link');
          nextLink.rel = 'preload';
          nextLink.as = 'image';
          nextLink.href = props.images[1].url.replace(
            '/upload/',
            '/upload/f_auto,q_auto:eco,w_300,dpr_auto,c_limit/'
          );
          nextLink.fetchPriority = 'low';
          document.head.appendChild(nextLink);
        }
      }
    });

    watch(() => currentImageIndex.value, (newIndex) => {
      const nextIndex = (newIndex + 1) % sortedImages.value.length;
      if (sortedImages.value[nextIndex]) {
        const img = new Image();
        img.fetchPriority = 'low';
        img.loading = 'lazy';
        img.src = sortedImages.value[nextIndex].url.replace(
          '/upload/',
          '/upload/f_auto,q_auto:eco,w_300,dpr_auto,c_limit/'
        );
      }
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
/* Performans optimizasyonları için CSS */
.product-gallery {
  z-index: 10;
  contain: content;
}

.product-gallery img {
  will-change: transform, opacity;
  transform: translateZ(0);
  backface-visibility: hidden;
  contain: paint;
}

/* Mobil için optimize edilmiş transition'lar */
@media (max-width: 768px) {
  .product-gallery img {
    transition: transform 0.2s ease-out, opacity 0.2s ease-out;
    contain: size layout paint;
    content-visibility: auto;
  }
  
  .product-gallery {
    scroll-behavior: smooth;
    scroll-snap-type: x mandatory;
  }
}

/* Desktop için normal transition'lar */
@media (min-width: 769px) {
  .product-gallery img {
    transition: transform 0.3s ease-out, opacity 0.3s ease-out;
  }
}

/* Thumbnail scrollbar optimizasyonu */
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

/* Fade animasyonları */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
