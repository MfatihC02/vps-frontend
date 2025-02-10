<template>
  <div class="p-6 max-w-7xl mx-auto">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-gray-800">Ürünler</h1>
      <button
        class="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
        @click="$emit('add-product')"
      >
        <PlusCircle class="w-5 h-5 mr-2" />
        Yeni Ürün Ekle
      </button>
    </div>

    <!-- Filtreler -->
    <div class="mb-6 flex flex-wrap gap-4">
      <input
        type="text"
        v-model="filters.search"
        placeholder="Ürün ara..."
        class="px-4 py-2 border rounded-lg"
        @input="handleFilterChange"
      />

      <select
        v-model="filters.productType"
        class="px-4 py-2 border rounded-lg"
        @change="handleFilterChange"
      >
        <option value="">Tüm Türler</option>
        <option v-for="tab in tabs" :key="tab.value" :value="tab.value">
          {{ tab.label }}
        </option>
      </select>

      <select
        v-model="filters.status"
        class="px-4 py-2 border rounded-lg"
        @change="handleFilterChange"
      >
        <option value="">Tüm Durumlar</option>
        <option value="active">Aktif</option>
        <option value="passive">Pasif</option>
      </select>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ProductCard
        v-for="product in products"
        :key="product._id"
        :product="product"
        @click="$emit('manage-product', product)"
      />
    </div>

    <!-- Pagination -->
    <div class="mt-8 flex justify-center items-center space-x-4">
      <button
        @click="handlePageChange(currentPage - 1)"
        :disabled="!pagination.hasPrevPage"
        class="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
      >
        Önceki
      </button>

      <div class="flex space-x-2">
        <button
          v-for="pageNum in getPageNumbers()"
          :key="pageNum"
          @click="handlePageChange(pageNum)"
          :class="[
            'px-4 py-2 rounded-lg',
            currentPage === pageNum
              ? 'bg-green-600 text-white'
              : 'border hover:bg-gray-100',
          ]"
        >
          {{ pageNum }}
        </button>
      </div>

      <button
        @click="handlePageChange(currentPage + 1)"
        :disabled="!pagination.hasNextPage"
        class="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
      >
        Sonraki
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useProductStore } from "@/stores/productStore";
import { PlusCircle } from "lucide-vue-next";
import ProductCard from "@/components/admin/ProductCard.vue";
import debounce from "lodash/debounce";

const productStore = useProductStore();
const currentPage = ref(1);
const pagination = ref({
  totalDocs: 0,
  limit: 12,
  totalPages: 0,
  page: 1,
  hasPrevPage: false,
  hasNextPage: false,
});

const props = defineProps({
  products: {
    type: Array,
    required: true,
  },
});

defineEmits(["manage-product", "add-product"]);

const filters = ref({
  search: "",
  productType: "",
  status: "",
});

const tabs = [
  { value: "seed", label: "Tohumlar" },
  { value: "seedling", label: "Fideler" },
  { value: "fertilizer", label: "Gübreler" },
  { value: "agriculturalTool", label: "Zirai Aletler" },
];

// Sayfa numaralarını hesapla
const getPageNumbers = () => {
  const totalPages = pagination.value.totalPages;
  const current = pagination.value.page;
  const delta = 2; // Aktif sayfanın her iki yanında gösterilecek sayfa sayısı

  const range = [];
  for (
    let i = Math.max(2, current - delta);
    i <= Math.min(totalPages - 1, current + delta);
    i++
  ) {
    range.push(i);
  }

  if (current - delta > 2) {
    range.unshift("...");
  }
  if (current + delta < totalPages - 1) {
    range.push("...");
  }

  range.unshift(1);
  if (totalPages !== 1) {
    range.push(totalPages);
  }

  return range;
};

// Sayfa değişikliğini yönet
const handlePageChange = async (page) => {
  if (page === "...") return;

  currentPage.value = page;
  const response = await productStore.fetchProducts({
    page,
    ...filters.value,
  });

  // Pagination bilgilerini güncelle
  pagination.value = {
    totalDocs: response.data.totalDocs,
    limit: response.data.limit,
    totalPages: response.data.totalPages,
    page: response.data.page,
    hasPrevPage: response.data.hasPrevPage,
    hasNextPage: response.data.hasNextPage,
  };
};

// Filtreleme işlemi
const handleFilterChange = debounce(async () => {
  currentPage.value = 1; // Filtre değiştiğinde ilk sayfaya dön
  const response = await productStore.fetchProducts({
    page: 1,
    ...filters.value,
  });

  // Pagination bilgilerini güncelle
  pagination.value = {
    totalDocs: response.data.totalDocs,
    limit: response.data.limit,
    totalPages: response.data.totalPages,
    page: response.data.page,
    hasPrevPage: response.data.hasPrevPage,
    hasNextPage: response.data.hasNextPage,
  };
}, 300);

// İlk yüklemede pagination bilgilerini al
onMounted(async () => {
  const response = await productStore.fetchProducts({ page: 1 });
  pagination.value = {
    totalDocs: response.data.totalDocs,
    limit: response.data.limit,
    totalPages: response.data.totalPages,
    page: response.data.page,
    hasPrevPage: response.data.hasPrevPage,
    hasNextPage: response.data.hasNextPage,
  };
});
</script>