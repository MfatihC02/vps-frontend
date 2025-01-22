<template>
  <div class="w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 font-inter">
    <!-- Yorum Özeti Bölümü -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-3 mb-4">
      <!-- Ana Container - Mobilde dikey, tablet ve üstünde yatay -->
      <div class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
        <!-- Sol Taraf: Yıldız ve Değerlendirme -->
        <div class="flex items-center gap-2 sm:gap-3">
          <div class="flex items-center gap-1.5">
            <template v-for="i in 5" :key="i">
              <Icon
                icon="material-symbols:star"
                class="w-5 h-5"
                :class="i <= Math.round(averageRating) ? 'text-amber-400' : 'text-gray-300'"
              />
            </template>
            <span class="text-base font-medium text-gray-700 ml-1">{{ averageRating.toFixed(1) }}</span>
          </div>
          <div class="text-sm text-gray-500 border-l border-gray-200 pl-2 sm:pl-3">
            {{ totalReviews }} değerlendirme
          </div>
        </div>

        <!-- Sağ Taraf: İstatistikler - Mobilde alt alta, tablet ve üstünde yan yana -->
        <div class="flex flex-col sm:flex-row sm:ml-auto gap-2 sm:gap-4 mt-2 sm:mt-0 text-sm">
          <!-- Onaylı Alışveriş -->
          <div class="flex items-center gap-1.5">
            <div class="flex items-center justify-center w-6 h-6 rounded-full bg-green-100">
              <Icon
                icon="material-symbols:shopping-bag"
                class="w-3.5 h-3.5 text-green-600"
              />
            </div>
            <span class="text-gray-600">
              <span class="font-medium text-green-600">{{ getVerifiedReviewCount }}</span> onaylı alışveriş
            </span>
          </div>

          <!-- Son Yorum - Mobilde gizli değil -->
          <div class="flex items-center gap-1.5">
            <div class="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100">
              <Icon
                icon="material-symbols:schedule"
                class="w-3.5 h-3.5 text-purple-600"
              />
            </div>
            <span class="text-gray-600">
              Son yorum: <span class="font-medium text-purple-600">{{ getLatestReviewDate }}</span>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtreleme ve Sıralama -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
      <div class="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto">
        <Menu as="div" class="relative">
          <MenuButton
            class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
          >
            <Icon
              icon="material-symbols:filter-list"
              class="w-5 h-5 mr-2 text-gray-500"
            />
            {{ selectedFilter }}
            <Icon
              icon="material-symbols:arrow-drop-down"
              class="w-5 h-5 ml-2 text-gray-500"
            />
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
              class="absolute left-0 z-10 mt-2 w-56 origin-top-left bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-100"
            >
              <div class="py-1">
                <MenuItem v-for="filter in filterOptions" :key="filter.value">
                  <button
                    @click="selectedFilter = filter.label"
                    :class="[
                      selectedFilter === filter.label
                        ? 'bg-primary/5 text-primary'
                        : 'text-gray-700 hover:bg-gray-50',
                      'block px-4 py-2 text-sm w-full text-left transition-colors duration-200'
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
            class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
          >
            <Icon
              icon="material-symbols:sort"
              class="w-5 h-5 mr-2 text-gray-500"
            />
            {{ selectedSort }}
            <Icon
              icon="material-symbols:arrow-drop-down"
              class="w-5 h-5 ml-2 text-gray-500"
            />
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
              class="absolute left-0 z-10 mt-2 w-56 origin-top-left bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-100"
            >
              <div class="py-1">
                <MenuItem v-for="sort in sortOptions" :key="sort.value">
                  <button
                    @click="selectedSort = sort.label"
                    :class="[
                      selectedSort === sort.label
                        ? 'bg-primary/5 text-primary'
                        : 'text-gray-700 hover:bg-gray-50',
                      'block px-4 py-2 text-sm w-full text-left transition-colors duration-200'
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
        class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark border border-transparent rounded-lg shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary w-full sm:w-auto justify-center"
      >
        <Icon
          icon="material-symbols:add"
          class="w-5 h-5 mr-2"
        />
        Yorum Yaz
      </button>
    </div>

    <!-- Yorum Listesi -->
    <div class="space-y-4 sm:space-y-6">
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
          class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 transition-all duration-300 hover:shadow-md hover:border-gray-200"
        >
          <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 sm:gap-0">
            <div class="flex items-start">
              <div
                class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-semibold mr-4"
              >
                {{ review.userId.username.charAt(0).toUpperCase() }}
              </div>
              <div>
                <h3 class="text-sm font-medium text-gray-900 break-words">
                  {{ review.userId.username }}
                </h3>
                <div class="flex flex-wrap items-center mt-1.5 gap-2">
                  <div class="flex items-center">
                    <template v-for="i in 5" :key="i">
                      <Icon
                        :icon="i <= review.rating ? 'material-symbols:star' : 'material-symbols:star-outline'"
                        class="w-4 h-4"
                        :class="i <= review.rating ? 'text-yellow-400' : 'text-gray-300'"
                      />
                    </template>
                  </div>
                  <span
                    v-if="review.isVerifiedPurchase"
                    class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-green-50 text-green-700"
                  >
                    <Icon
                      icon="material-symbols:check-circle"
                      class="w-3.5 h-3.5 mr-1"
                    />
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
          <p class="mt-4 text-sm text-gray-600 break-words whitespace-pre-line leading-relaxed">
            {{ review.comment }}
          </p>

          <!-- Admin yanıtı varsa göster -->
          <div v-if="review.adminReply" class="mt-4 bg-primary/5 p-4 rounded-lg">
            <div class="flex items-center gap-2 text-primary">
              <Icon
                icon="material-symbols:shield-check"
                class="w-5 h-5"
              />
              <span class="font-medium">Admin Yanıtı</span>
            </div>
            <p class="mt-2 text-gray-700 break-words whitespace-pre-line leading-relaxed">
              {{ review.adminReply }}
            </p>
            <div class="mt-2 text-sm text-gray-500">
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
          <div class="flex min-h-full items-center justify-center p-2 sm:p-4">
            <TransitionChild
              enter="duration-300 ease-out"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="duration-200 ease-in"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <DialogPanel class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-4 sm:p-6 text-left align-middle shadow-xl transition-all">
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
const getVerifiedReviewCount = computed(() => {
  const reviews = reviewStore.getProductReviews;
  return reviews.filter(review => review.isVerifiedPurchase).length;
});

const getLatestReviewDate = computed(() => {
  const reviews = reviewStore.getProductReviews;
  if (!reviews.length) return '-';
  const latestDate = new Date(Math.max(...reviews.map(r => new Date(r.createdAt))));
  const now = new Date();
  const diffDays = Math.floor((now - latestDate) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Bugün';
  if (diffDays === 1) return 'Dün';
  if (diffDays < 7) return `${diffDays} gün önce`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta önce`;
  return `${Math.floor(diffDays / 30)} ay önce`;
});

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
