<script setup>
import { ref, onMounted, computed } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { useCategoryStore } from '@/stores/categoryStore';
import { Icon } from '@iconify/vue';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

// Store
const categoryStore = useCategoryStore();

// Props
const props = defineProps({
  categoryId: {
    type: String,
    required: true
  },
  categoryTitle: {
    type: String,
    required: true
  }
});

// Computed
const navigationPrevClass = computed(() => `swiper-button-prev-${props.categoryId}`);
const navigationNextClass = computed(() => `swiper-button-next-${props.categoryId}`);
const paginationClass = computed(() => `swiper-pagination-${props.categoryId}`);

// Reactive refs
const isInitialized = ref(false);

// Debug
const loading = computed(() => {
  return categoryStore.loading || !isInitialized.value;
});

const error = computed(() => {
  return categoryStore.error;
});

// Swiper modules
const modules = [Autoplay, Pagination, Navigation];

// Breakpoints for responsive slides
const swiperBreakpoints = {
  320: {
    slidesPerView: 2,
    spaceBetween: 12
  },
  640: {
    slidesPerView: 3,
    spaceBetween: 16
  },
  768: {
    slidesPerView: 3,
    spaceBetween: 16
  },
  1024: {
    slidesPerView: 4,
    spaceBetween: 16
  },
  1280: {
    slidesPerView: 5,
    spaceBetween: 16
  }
};

// Computed
const subCategories = computed(() => {
  if (!isInitialized.value || !categoryStore.categoryTree.length) return [];
  
  const findCategory = (id, categories) => {
    if (!categories) return null;
    return categories.find(cat => cat._id === id) || 
           categories.reduce((found, cat) => 
             found || (cat.children && findCategory(id, cat.children)), null);
  };

  const category = findCategory(props.categoryId, categoryStore.categoryTree);
  return category?.children?.filter(cat => cat.isActive) || [];
});

// Methods
const getCategoryPath = (categoryId) => {
  if (!categoryId || !categoryStore.categoryTree.length) return '';
  
  const buildPath = (id, categories, currentPath = []) => {
    for (const cat of categories) {
      if (cat._id === id) return [...currentPath, cat.slug];
      if (cat.children) {
        const path = buildPath(id, cat.children, [...currentPath, cat.slug]);
        if (path) return path;
      }
    }
    return null;
  };

  const path = buildPath(categoryId, categoryStore.categoryTree);
  return path ? path.join('/') : '';
};

const getSubCategoryUrl = (subCategory) => {
  return subCategory ? `/kategori/${getCategoryPath(subCategory._id)}` : '';
};

const categoryUrl = computed(() => {
  const path = getCategoryPath(props.categoryId);
  return path ? `/kategori/${path}` : '';
});

// Lifecycle
onMounted(async () => {
  try {
    if (!categoryStore.categoryTree.length) {
      await categoryStore.fetchCategoryTree();
    }
    isInitialized.value = true;
  } catch (err) {
    console.error('Error in CategorySlider mount:', err);
  }
});
</script>

<template>
  <div class="relative">
    <div v-if="loading" class="animate-pulse">
      <!-- Loading state -->
    </div>
    <div v-else-if="error" class="text-red-500">
      {{ error }}
    </div>
    <div v-else-if="subCategories.length === 0" class="text-gray-500">
      Bu kategoride alt kategori bulunmamaktadır.
    </div>
    <div v-else class="relative">
      <h3 class="text-lg font-semibold mb-4 text-gray-800">
        {{ props.categoryTitle }}
      </h3>
      <div class="relative group">
        <Swiper
          :modules="modules"
          :breakpoints="swiperBreakpoints"
          :pagination="{ 
            el: `.${paginationClass}`,
            clickable: true,
            dynamicBullets: true
          }"
          :navigation="{
            nextEl: `.${navigationNextClass}`,
            prevEl: `.${navigationPrevClass}`
          }"
          :autoplay="{
            delay: 5000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true
          }"
          :rtl="true"
          class="!overflow-hidden px-2"
        >
          <SwiperSlide 
            v-for="category in subCategories"
            :key="category._id"
            class="!w-auto"
          >
            <router-link 
              :to="getSubCategoryUrl(category)"
              class="block group"
            >
              <div class="relative aspect-[4/3] w-40 sm:w-48 lg:w-52 overflow-hidden rounded-xl bg-gray-100">
                <img
                  v-if="category.image"
                  :src="category.image"
                  :alt="category.name"
                  class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                />
                <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                  <Icon icon="heroicons:photo" class="w-12 h-12" />
                </div>
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <h4 class="absolute bottom-0 left-0 right-0 p-3 text-white font-medium">
                  {{ category.name }}
                </h4>
              </div>
            </router-link>
          </SwiperSlide>

          <!-- Pagination -->
          <div :class="['swiper-pagination', paginationClass]"></div>
        </Swiper>
        
        <!-- Navigation Buttons -->
        <button 
          :class="[navigationPrevClass, 'swiper-button-prev !w-10 !h-10 !bg-white/80 !backdrop-blur !shadow-lg rounded-full !text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300 after:!text-xl']"
        ></button>
        <button 
          :class="[navigationNextClass, 'swiper-button-next !w-10 !h-10 !bg-white/80 !backdrop-blur !shadow-lg rounded-full !text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300 after:!text-xl']"
        ></button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.swiper-button-prev,
.swiper-button-next {
  --swiper-navigation-size: 1.5rem;
}

.swiper-pagination-bullet-active {
  background-color: #0F6735 !important;
}

/* Her slider için özel z-index tanımlaması */
.swiper-button-prev,
.swiper-button-next {
  z-index: 10;
}

.swiper-pagination {
  z-index: 9;
}
</style>
