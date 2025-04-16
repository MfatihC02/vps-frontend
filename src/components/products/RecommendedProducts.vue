<template>
  <section v-if="showRecommendations" class="mt-12">
    <h2 class="text-2xl font-bold text-[#2F5E32] mb-6">
      Bunları da Beğenebilirsiniz
    </h2>
    <Swiper
      :modules="[Navigation, Pagination, Autoplay]"
      :slides-per-view="getSlidesPerView"
      :space-between="18"
      :navigation="{
        nextEl: '.swiper-button-next.custom',
        prevEl: '.swiper-button-prev.custom',
      }"
      :pagination="{ clickable: true }"
      :breakpoints="swiperBreakpoints"
      class="w-full max-w-full"
      :loop="recommendedProducts.length > getSlidesPerView"
      :autoplay="{ delay: 3500, disableOnInteraction: false, pauseOnMouseEnter: true }"
      style="min-height: 260px;"
    >
      <template v-if="loading">
        <SwiperSlide v-for="i in 7" :key="i">
          <div class="skeleton-card animate-pulse bg-gray-100 rounded-lg flex flex-col items-center p-3 w-36 md:w-44 h-56">
            <div class="w-full h-28 bg-gray-200 rounded mb-3"></div>
            <div class="w-3/4 h-4 bg-gray-200 rounded mb-2"></div>
            <div class="w-1/2 h-3 bg-gray-200 rounded"></div>
          </div>
        </SwiperSlide>
      </template>
      <template v-else>
        <SwiperSlide
          v-for="product in recommendedProducts"
          :key="product._id"
        >
          <div
            class="product-card bg-white rounded-lg shadow hover:shadow-xl transition p-3 flex flex-col items-center w-36 md:w-44 h-56"
          >
            <a :href="`/urun/${product.slug}`" class="w-full flex flex-col items-center">
              <img
                :src="product.images?.[0]?.url || '/placeholder.png'"
                :alt="product.name"
                class="w-full h-28 object-cover rounded-md mb-2"
                loading="lazy"
                width="160"
                height="112"
              />
              <div class="text-sm font-semibold text-gray-800 text-center line-clamp-2 mb-1">
                {{ product.name }}
              </div>
              <div class="text-base font-bold text-green-700">
                {{ product.price?.current?.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' }) }}
              </div>
              <div v-if="product.price?.discount" class="text-xs text-red-600 line-through mt-1">
                {{ (product.price.current / (1 - product.price.discount / 100)).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' }) }}
              </div>
            </a>
            <a :href="`/urun/${product.slug}`" class="mt-2 w-full">
              <button class="w-full bg-[#2F5E32] text-white rounded py-1 text-sm hover:bg-green-800 transition font-medium">
                Ürünü İncele
              </button>
            </a>
          </div>
        </SwiperSlide>
      </template>
      <!-- Zarif küçük oklar -->
      <div class="swiper-button-prev custom swiper-nav-btn"></div>
      <div class="swiper-button-next custom swiper-nav-btn"></div>
    </Swiper>
  </section>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useProductStore } from '@/stores/productStore';
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

const props = defineProps({
  currentProduct: {
    type: Object,
    required: true,
  },
});

const recommendedProducts = ref([]);
const loading = ref(true);
const showRecommendations = ref(true);
const productStore = useProductStore();

function shuffleArray(array) {
  // Fisher-Yates Shuffle
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function fetchRecommended() {
  loading.value = true;
  showRecommendations.value = true;
  let category = props.currentProduct.category;
  let slug = category?.slug;
  let foundProducts = [];

  if (slug) {
    await productStore.fetchProductsByCategory(slug, { limit: 16 });
    // Ürünün kendisini hariç tut
    let filtered = productStore.products.filter(
      p => p._id !== props.currentProduct._id
    );
    foundProducts = shuffleArray(filtered);
    if (foundProducts.length >= 2) {
      recommendedProducts.value = foundProducts.slice(0, 8);
      showRecommendations.value = true;
    } else {
      showRecommendations.value = false;
    }
  } else {
    showRecommendations.value = false;
  }

  loading.value = false;
}

watch(
  () => props.currentProduct?._id,
  () => {
    if (props.currentProduct?._id) {
      fetchRecommended();
    }
  },
  { immediate: true }
);

const swiperBreakpoints = {
  320: {
    slidesPerView: 2,
    spaceBetween: 12,
  },
  480: {
    slidesPerView: 2.5,
    spaceBetween: 12,
  },
  640: {
    slidesPerView: 3,
    spaceBetween: 14,
  },
  768: {
    slidesPerView: 4,
    spaceBetween: 16,
  },
  1024: {
    slidesPerView: 5,
    spaceBetween: 18,
  },
  1280: {
    slidesPerView: 6,
    spaceBetween: 18,
  },
};

const getSlidesPerView = computed(() => {
  if (window.innerWidth >= 1280) return 6;
  if (window.innerWidth >= 1024) return 5;
  if (window.innerWidth >= 768) return 4;
  if (window.innerWidth >= 640) return 3;
  if (window.innerWidth >= 480) return 2.5;
  return 2;
});
</script>

<style scoped>
.product-card,
.skeleton-card {
  min-height: 224px;
  max-width: 180px;
}
.swiper {
  padding-bottom: 38px;
}
.swiper-nav-btn {
  width: 28px;
  height: 28px;
  background: rgba(47,94,50,0.85);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 40%;
  z-index: 10;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: background 0.2s;
  font-size: 16px;
  opacity: 0.85;
}
.swiper-button-prev.custom {
  left: 6px;
}
.swiper-button-next.custom {
  right: 6px;
}
.swiper-nav-btn:hover {
  background: #256029;
  opacity: 1;
}
.swiper-nav-btn:after {
  font-family: 'Lucide', 'Material Icons', Arial, sans-serif;
  font-size: 18px;
  font-weight: bold;
}
.swiper-button-prev.custom:after {
  content: '\2039'; /* ‹ */
}
.swiper-button-next.custom:after {
  content: '\203A'; /* › */
}
</style>
