<template>
  <div class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Yorum Özeti Bölümü -->
    <div class="bg-white rounded-2xl shadow-sm border border-green-100 p-6 mb-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Ortalama Puan -->
        <div class="flex flex-col items-center justify-center">
          <div class="text-4xl font-bold text-green-800 mb-2">
            {{ averageRating.toFixed(1) }}
          </div>
          <div class="flex items-center gap-1 mb-2">
            <template v-for="i in 5" :key="i">
              <Icon
                :name="i <= Math.round(averageRating) ? 'ph:star-fill' : 'ph:star'"
                class="w-6 h-6"
                :class="i <= Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-400'"
              />
            </template>
          </div>
          <p class="text-sm text-gray-600">
            {{ totalReviews }} değerlendirme
          </p>
        </div>

        <!-- Puan Dağılımı -->
        <div class="col-span-2">
          <div v-for="rating in [5, 4, 3, 2, 1]" :key="rating" class="flex items-center gap-2 mb-2">
            <span class="text-sm text-gray-600 w-8">{{ rating }}</span>
            <Icon name="ph:star-fill" class="w-4 h-4 text-yellow-400" />
            <div class="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                class="h-full bg-green-500 rounded-full transition-all duration-500"
                :style="{
                  width: `${getRatingPercentage(rating)}%`,
                  backgroundColor: getRatingColor(rating)
                }"
              ></div>
            </div>
            <span class="text-sm text-gray-600 w-12">
              {{ getRatingPercentage(rating) }}%
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtreleme ve Sıralama -->
    <div class="flex flex-wrap items-center justify-between gap-4 mb-8">
      <div class="flex items-center gap-4">
        <Menu as="div" class="relative">
          <MenuButton
            class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <Icon name="ph:funnel" class="w-5 h-5 mr-2" />
            {{ selectedFilter }}
            <Icon name="ph:caret-down" class="w-5 h-5 ml-2" />
          </MenuButton>

          <transition
            enter-active-class="transition duration-100 ease-out"
            enter-from-class="transform scale-95 opacity-0"
            enter-to-class="transform scale-100 opacity-100"
            leave-active-class="transition duration-75 ease-in"
            leave-from-class="transform scale-100 opacity-100"
            leave-to-class="transform scale-95 opacity-0"
          >
            <MenuItems
              class="absolute left-0 z-10 mt-2 w-56 origin-top-left bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
            >
              <div class="py-1">
                <MenuItem v-for="filter in filterOptions" :key="filter.value">
                  <button
                    @click="selectedFilter = filter.label"
                    :class="[
                      selectedFilter === filter.label
                        ? 'bg-green-50 text-green-700'
                        : 'text-gray-700',
                      'block px-4 py-2 text-sm w-full text-left hover:bg-green-50'
                    ]"
                  >
                    {{ filter.label }}
                  </button>
                </MenuItem>
              </div>
            </MenuItems>
          </transition>
        </Menu>

        <Menu as="div" class="relative">
          <MenuButton
            class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <Icon name="ph:sort-ascending" class="w-5 h-5 mr-2" />
            {{ selectedSort }}
            <Icon name="ph:caret-down" class="w-5 h-5 ml-2" />
          </MenuButton>

          <transition
            enter-active-class="transition duration-100 ease-out"
            enter-from-class="transform scale-95 opacity-0"
            enter-to-class="transform scale-100 opacity-100"
            leave-active-class="transition duration-75 ease-in"
            leave-from-class="transform scale-100 opacity-100"
            leave-to-class="transform scale-95 opacity-0"
          >
            <MenuItems
              class="absolute left-0 z-10 mt-2 w-56 origin-top-left bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
            >
              <div class="py-1">
                <MenuItem v-for="sort in sortOptions" :key="sort.value">
                  <button
                    @click="selectedSort = sort.label"
                    :class="[
                      selectedSort === sort.label
                        ? 'bg-green-50 text-green-700'
                        : 'text-gray-700',
                      'block px-4 py-2 text-sm w-full text-left hover:bg-green-50'
                    ]"
                  >
                    {{ sort.label }}
                  </button>
                </MenuItem>
              </div>
            </MenuItems>
          </transition>
        </Menu>
      </div>

      <button
        @click="showReviewForm = true"
        class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
      >
        <Icon name="ph:plus" class="w-5 h-5 mr-2" />
        Yorum Yaz
      </button>
    </div>

    <!-- Yorum Listesi -->
    <div class="space-y-6">
      <TransitionGroup
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 transform translate-y-4"
        enter-to-class="opacity-100 transform translate-y-0"
        leave-active-class="transition-all duration-300 ease-in"
        leave-from-class="opacity-100 transform translate-y-0"
        leave-to-class="opacity-0 transform translate-y-4"
      >
        <div
          v-for="review in filteredReviews"
          :key="review._id"
          class="bg-white rounded-lg shadow-sm border border-gray-100 p-6 transition duration-300 hover:shadow-md"
        >
          <div class="flex items-start justify-between">
            <div class="flex items-center">
              <div
                class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-800 font-medium mr-4"
              >
                {{ review.userId.username.charAt(0).toUpperCase() }}
              </div>
              <div>
                <h3 class="text-sm font-medium text-gray-900">
                  {{ review.userId.username }}
                </h3>
                <div class="flex items-center mt-1">
                  <div class="flex items-center">
                    <template v-for="i in 5" :key="i">
                      <Icon
                        :name="i <= review.rating ? 'ph:star-fill' : 'ph:star'"
                        class="w-4 h-4"
                        :class="i <= review.rating ? 'text-yellow-400' : 'text-gray-400'"
                      />
                    </template>
                  </div>
                  <span
                    v-if="review.isVerifiedPurchase"
                    class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800"
                  >
                    <Icon name="ph:check-circle" class="w-4 h-4 mr-1" />
                    Doğrulanmış Alışveriş
                  </span>
                </div>
              </div>
            </div>
            <time
              :datetime="review.createdAt"
              class="text-sm text-gray-500"
            >
              {{ formatDate(review.createdAt) }}
            </time>
          </div>
          <p class="mt-4 text-sm text-gray-600">
            {{ review.comment }}
          </p>

          <!-- Admin yanıtı varsa göster -->
          <div v-if="review.adminReply" class="mt-4 bg-green-50 p-4 rounded-lg">
            <div class="flex items-center gap-2 text-green-800">
              <Icon name="ph:shield-check" class="w-5 h-5" />
              <span class="font-medium">Admin Yanıtı</span>
            </div>
            <p class="mt-2 text-gray-700">{{ review.adminReply }}</p>
            <div class="mt-1 text-sm text-gray-500">
              {{ formatDate(review.adminReplyDate) }}
            </div>
          </div>

          <!-- Admin kontrolleri -->
          <AdminReviewControls
            v-if="isAdmin"
            :review="review"
            @updated="handleReviewUpdate"
            @deleted="handleReviewDelete"
            class="mt-4"
          />
        </div>
      </TransitionGroup>
    </div>

    <!-- Yorum Form Modal -->
    <TransitionRoot appear :show="showReviewForm" as="template">
      <Dialog as="div" @close="showReviewForm = false" class="relative z-50">
        <TransitionChild
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black bg-opacity-25" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              enter="duration-300 ease-out"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="duration-200 ease-in"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <DialogPanel class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900">
                  Ürün Değerlendirmesi
                </DialogTitle>
                <div class="mt-4">
                  <ReviewForm
                    @submit="handleReviewSubmit"
                    @error="handleReviewError"
                    @cancel="showReviewForm = false"
                  />
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useReviewStore } from '@/stores/reviewStore';
import { useUserStore } from '@/stores/userStore';
import { useToast } from 'vue-toastification';
import {
  Menu,
  MenuButton,
  MenuItems,
  MenuItem,
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionRoot,
  TransitionChild
} from '@headlessui/vue';
import { Icon } from '@iconify/vue';
import ReviewForm from '@/components/ReviewForm.vue';
import AdminReviewControls from '@/components/AdminReviewControls.vue';

const props = defineProps({
  productId: {
    type: String,
    required: true,
    validator: (value) => {
      return value && value.length > 0;
    }
  }
});

const reviewStore = useReviewStore();
const userStore = useUserStore();
const toast = useToast();
const showReviewForm = ref(false);
const selectedFilter = ref('Tüm Yorumlar');
const selectedSort = ref('En Yeni');

// Admin kontrolü
const isAdmin = computed(() => userStore.isAdmin);

// Önce loadReviews fonksiyonunu tanımla
const loadReviews = async () => {
  try {
    await reviewStore.fetchProductReviews(props.productId);
  } catch (error) {
    console.error('Yorumlar yüklenirken hata:', error);
  }
};

// Sonra watch'ı tanımla
watch(() => props.productId, async (newId) => {
  if (newId) {
    await loadReviews();
  }
}, { immediate: true });

const filterOptions = [
  { label: 'Tüm Yorumlar', value: 'all' },
  { label: '5 Yıldız', value: 5 },
  { label: '4 Yıldız', value: 4 },
  { label: '3 Yıldız', value: 3 },
  { label: '2 Yıldız', value: 2 },
  { label: '1 Yıldız', value: 1 },
  { label: 'Doğrulanmış Alışverişler', value: 'verified' }
];

const sortOptions = [
  { label: 'En Yeni', value: 'newest' },
  { label: 'En Eski', value: 'oldest' },
  { label: 'En Yüksek Puan', value: 'highest' },
  { label: 'En Düşük Puan', value: 'lowest' }
];

// Computed Properties
const averageRating = computed(() => {
  const reviews = reviewStore.getProductReviews;
  if (!reviews.length) return 0;
  return reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
});

const totalReviews = computed(() => reviewStore.getProductReviews.length);

const filteredReviews = computed(() => {
  let reviews = [...reviewStore.getProductReviews];

  // Filtreleme
  if (selectedFilter.value !== 'Tüm Yorumlar') {
    if (selectedFilter.value === 'Doğrulanmış Alışverişler') {
      reviews = reviews.filter(review => review.isVerifiedPurchase);
    } else {
      const rating = parseInt(selectedFilter.value);
      reviews = reviews.filter(review => review.rating === rating);
    }
  }

  // Sıralama
  switch (selectedSort.value) {
    case 'En Eski':
      reviews.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      break;
    case 'En Yüksek Puan':
      reviews.sort((a, b) => b.rating - a.rating);
      break;
    case 'En Düşük Puan':
      reviews.sort((a, b) => a.rating - b.rating);
      break;
    default: // En Yeni
      reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  return reviews;
});

// Methods
const getRatingPercentage = (rating) => {
  const reviews = reviewStore.getProductReviews;
  if (!reviews.length) return 0;
  const count = reviews.filter(review => review.rating === rating).length;
  return Math.round((count / reviews.length) * 100);
};

const getRatingColor = (rating) => {
  const colors = {
    5: '#FBBF24', // yellow-400
    4: '#FCD34D', // yellow-300
    3: '#FDE68A', // yellow-200
    2: '#FEF3C7', // yellow-100
    1: '#FFFBEB'  // yellow-50
  };
  return colors[rating];
};

const formatDate = (date) => {
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(date));
};

const handleReviewSubmit = async (reviewData) => {
  try {
    const response = await reviewStore.createReview({
      productId: props.productId,
      ...reviewData
    });

    // Backend'den gelen yanıtı kontrol et
    if (!response || !response.success) {
      toast.error(response?.message || 'Yorum eklenirken bir hata oluştu');
      return { success: false, message: response?.message };
    }

    // Başarılı durumda
    toast.success('Yorumunuz başarıyla eklendi!');
    showReviewForm.value = false;
    await loadReviews();
    return { success: true };

  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Yorum eklenirken bir hata oluştu';
    toast.error(errorMessage);
    return { success: false, message: errorMessage };
  }
};

const handleReviewUpdate = (updatedReview) => {
  const index = filteredReviews.value.findIndex(r => r._id === updatedReview._id);
  if (index !== -1) {
    filteredReviews.value[index] = updatedReview;
  }
};

const handleReviewDelete = (reviewId) => {
  filteredReviews.value = filteredReviews.value.filter(r => r._id !== reviewId);
};

const handleReviewError = (error) => {
  console.error('Review submission error:', error);
};
</script>
