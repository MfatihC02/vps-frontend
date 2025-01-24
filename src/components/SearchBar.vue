<template>
  <div class="relative">
    <input
      v-model="searchQuery"
      type="text"
      :placeholder="placeholder"
      class="w-full px-4 py-2 pl-10 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition"
      @input="handleSearch"
      @focus="showResults = true"
      @blur="handleBlur"
    />
    <Search class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />

    <!-- Arama Sonuçları Dropdown -->
    <div
      v-if="showResults && searchResults.length > 0"
      class="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto"
      @mousedown.prevent
    >
      <div v-for="product in searchResults" :key="product._id" 
           class="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
           @mousedown="handleProductSelect(product)">
        <div class="flex items-center space-x-3">
          <!-- Ürün Resmi -->
          <img 
            v-if="product.images && product.images.length > 0"
            :src="product.images[0].url" 
            :alt="product.name"
            class="w-12 h-12 object-cover rounded-md"
          />
          <div class="flex-1">
            <!-- Ürün Adı -->
            <h4 class="font-medium text-gray-900">{{ product.name }}</h4>
            <!-- Marka -->
            <p class="text-sm text-gray-600">{{ product.brand }}</p>
          </div>
          <!-- Fiyat -->
          <div class="text-right">
            <p class="font-medium text-emerald-600">
              {{ formatPrice(product.price.current) }} ₺
            </p>
            <p v-if="product.price.discount" class="text-sm text-gray-500 line-through">
              {{ formatPrice(product.price.original) }} ₺
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue';
import { useProductStore } from '@/stores/productStore';
import { Search } from 'lucide-vue-next';
import { useRouter } from 'vue-router';

const router = useRouter();
const props = defineProps({
  placeholder: {
    type: String,
    default: 'Ürün veya marka ara...'
  },
  debounceTime: {
    type: Number,
    default: 300
  }
});

const emit = defineEmits(['search']);
const productStore = useProductStore();
const searchQuery = ref('');
const searchResults = ref([]);
const showResults = ref(false);
let debounceTimeout = null;

const handleSearch = () => {
  if (debounceTimeout) clearTimeout(debounceTimeout);

  debounceTimeout = setTimeout(async () => {
    try {
      productStore.setFilters({
        search: searchQuery.value
      });

      if (searchQuery.value.trim()) {
        const result = await productStore.fetchProducts();
        searchResults.value = result.data.docs || [];
        emit('search', result);
      } else {
        searchResults.value = [];
      }
    } catch (error) {
      console.error('Arama hatası:', error);
      searchResults.value = [];
    }
  }, props.debounceTime);
};

const handleBlur = () => {
  // Tıklama işlemi tamamlanana kadar bekle
  setTimeout(() => {
    showResults.value = false;
  }, 200);
};

const handleProductSelect = (product) => {
  // Ürün detay sayfasına yönlendir
  router.push(`/urun/${product.slug}`);
  showResults.value = false;
  searchQuery.value = '';
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('tr-TR').format(price);
};

// Component destroy edildiğinde timeout'u temizle
onBeforeUnmount(() => {
  if (debounceTimeout) clearTimeout(debounceTimeout);
});
</script>

<style scoped>
/* Scrollbar stilini özelleştir */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: #10b981 #e5e7eb;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #e5e7eb;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: #10b981;
  border-radius: 3px;
}
</style>
