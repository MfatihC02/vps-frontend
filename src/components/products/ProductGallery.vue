<template>
  <section
    class="product-gallery -mt-4 sticky top-0"
    itemscope
    itemtype="http://schema.org/ImageGallery"
  >
    <!-- Ana görsel görüntüleme alanı -->
    <div class="relative h-screen overflow-y-auto pb-8">
      <!-- Ana Görsel Container -->
      <div
        class="relative w-full h-[70vh] rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 group sticky top-0 z-10"
        :class="{ 'animate-pulse': loading }"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
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
              ${currentImage.url.replace('/upload/', '/upload/f_webp,q_auto:eco,w_400,dpr_auto,c_limit/')} 400w,
              ${currentImage.url.replace('/upload/', '/upload/f_webp,q_auto:eco,w_600,dpr_auto,c_limit/')} 600w,
              ${currentImage.url.replace('/upload/', '/upload/f_webp,q_auto:eco,w_800,dpr_auto,c_limit/')} 800w
            `"
            type="image/webp"
          />
          <img
            :src="currentImage.url.replace('/upload/', '/upload/f_auto,q_auto:eco,w_600,dpr_auto,c_limit/')"
            :srcset="`
              ${currentImage.url.replace('/upload/', '/upload/f_auto,q_auto:eco,w_400,dpr_auto,c_limit/')} 400w,
              ${currentImage.url.replace('/upload/', '/upload/f_auto,q_auto:eco,w_600,dpr_auto,c_limit/')} 600w,
              ${currentImage.url.replace('/upload/', '/upload/f_auto,q_auto:eco,w_800,dpr_auto,c_limit/')} 800w
            `"
            :sizes="'(max-width: 480px) 95vw, (max-width: 768px) 75vw, 600px'"
            :alt="currentImage.alt || `${currentImageIndex + 1}. ürün görseli`"
            class="w-full h-full object-contain transition-all duration-300"
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
        class="mt-4 flex gap-2 sm:gap-3 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pb-2 snap-x"
        role="tablist"
        aria-label="Ürün görselleri"
      >
        <button
          v-for="(img, idx) in sortedImages"
          :key="img.publicId || idx"
          @click="selectImage(idx)"
          class="relative flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden focus:outline-none transition-all duration-200 transform hover:scale-105 snap-center"
          :class="{
            'ring-2 ring-[#2F5E32] shadow-md': selectedImageIndex === idx,
            'opacity-60 hover:opacity-100': selectedImageIndex !== idx,
            'cursor-not-allowed': loading,
          }"
          :disabled="loading"
          role="tab"
          :aria-selected="selectedImageIndex === idx"
          :aria-label="`Görsel ${idx + 1}`"
        >
          <picture>
            <source
              :srcset="img.url.replace('/upload/', '/upload/f_webp,q_auto:eco,w_150,h_150,c_fill,g_center/')"
              type="image/webp"
            />
            <img
              :src="img.url.replace('/upload/', '/upload/f_auto,q_auto:eco,w_150,h_150,c_fill,g_center/')"
              :alt="`Küçük görsel ${idx + 1}`"
              class="w-full h-full object-cover transition-opacity duration-200"
              :class="{ 'opacity-50': loading }"
              loading="lazy"
              decoding="async"
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
    const loading = ref(false);
    const selectedImageIndex = ref(0);
    const touchStartX = ref(0);
    const touchEndX = ref(0);
    const showLightbox = ref(false);

    // Görüntüleri sıralama
    const sortedImages = computed(() => {
      if (!props.images.length) return [];
      return [...props.images].sort((a, b) => (a.order || 0) - (b.order || 0));
    });

    // Mevcut görüntü
    const currentImage = computed(() => {
      return sortedImages.value[selectedImageIndex.value] || null;
    });

    // Navigasyon durumu
    const isFirstImage = computed(() => selectedImageIndex.value === 0);
    const isLastImage = computed(() => {
      return selectedImageIndex.value === sortedImages.value.length - 1;
    });

    // Touch olayları için yeni fonksiyonlar
    const handleTouchStart = (e) => {
      touchStartX.value = e.touches[0].clientX;
    };

    const handleTouchMove = (e) => {
      touchEndX.value = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
      const swipeThreshold = 50; // minimum kaydırma mesafesi
      const swipeDistance = touchEndX.value - touchStartX.value;

      if (Math.abs(swipeDistance) > swipeThreshold) {
        if (swipeDistance > 0 && !isFirstImage.value) {
          prevImage();
        } else if (swipeDistance < 0 && !isLastImage.value) {
          nextImage();
        }
      }
    };

    // Görsel yükleme işleyicisi
    const handleImageLoad = () => {
      loading.value = false;
    };

    // Lightbox işlemleri
    const openLightbox = () => {
      showLightbox.value = true;
      document.body.style.overflow = "hidden";
    };

    const closeLightbox = () => {
      showLightbox.value = false;
      document.body.style.overflow = "";
    };

    // Navigasyon metodları
    const nextImage = () => {
      if (props.loading || !sortedImages.value.length) return;
      selectedImageIndex.value =
        (selectedImageIndex.value + 1) % sortedImages.value.length;
    };

    const prevImage = () => {
      if (props.loading || !sortedImages.value.length) return;
      selectedImageIndex.value =
        (selectedImageIndex.value - 1 + sortedImages.value.length) %
        sortedImages.value.length;
    };

    const selectImage = (index) => {
      if (props.loading) return;
      selectedImageIndex.value = index;
    };

    const toggleZoom = () => {
      zoomed.value = !zoomed.value;
    };

    // Klavye navigasyonu
    const handleKeyPress = (event) => {
      if (showLightbox.value) {
        switch (event.key) {
          case "ArrowLeft":
            prevImage();
            break;
          case "ArrowRight":
            nextImage();
            break;
          case "Escape":
            closeLightbox();
            break;
        }
      }
    };

    // Klavye event listener'ları
    onMounted(() => {
      window.addEventListener("keydown", handleKeyPress);
    });

    onBeforeUnmount(() => {
      window.removeEventListener("keydown", handleKeyPress);
    });

    // Preload next image
    watch(selectedImageIndex, (newIndex) => {
      const nextIndex = (newIndex + 1) % sortedImages.value.length;
      const nextImage = sortedImages.value[nextIndex];
      if (nextImage) {
        const img = new Image();
        img.src = nextImage.url.replace(
          "/upload/",
          "/upload/f_auto,q_auto:eco,w_600,dpr_auto,c_limit/"
        );
      }
    });

    // Error handling için
    const handleImageError = (event) => {
      event.target.src = "/fallback-image.jpg"; // Fallback görsel
      loading.value = false;
    };

    return {
      zoomed,
      loading,
      selectedImageIndex,
      currentImage,
      sortedImages,
      isFirstImage,
      isLastImage,
      selectImage,
      prevImage,
      nextImage,
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
      handleImageLoad,
      openLightbox,
      closeLightbox,
      showLightbox,
      toggleZoom,
      handleImageError,
    };
  },
};
</script>

<style scoped>
.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.scrollbar-thin::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #cdcdcd;
  border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Performans optimizasyonları için CSS */
.product-gallery img {
  will-change: transform, opacity;
  transform: translateZ(0);
  backface-visibility: hidden;
}

/* Smooth transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Thumbnail scrollbar optimizasyonu */
.scrollbar-thin {
  scrollbar-width: thin;
  -webkit-overflow-scrolling: touch;
}

.product-gallery {
  z-index: 10;
  height: 100vh;
  overflow-y: auto;
}

.product-gallery::-webkit-scrollbar {
  width: 6px;
}

.product-gallery::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.product-gallery::-webkit-scrollbar-thumb {
  background: #cdcdcd;
  border-radius: 3px;
}

.product-gallery::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
