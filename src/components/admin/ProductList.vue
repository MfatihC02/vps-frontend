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
    <div
      v-if="productStore.pagination.totalPages > 1"
      class="mt-6 flex justify-center"
    >
      <div class="flex space-x-2">
        <button
          v-for="page in productStore.pagination.totalPages"
          :key="page"
          @click="handlePageChange(page)"
          :class="[
            'px-4 py-2 rounded-lg',
            page === productStore.pagination.page
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
          ]"
        >
          {{ page }}
        </button>
      </div>
    </div>
  </div>
</template>
  
  <script setup>
import { ref, computed, watch } from "vue";
import { useProductStore } from "@/stores/productStore";
import { PlusCircle } from "lucide-vue-next";
import ProductCard from "@/components/admin/ProductCard.vue";
import debounce from "lodash/debounce";

const productStore = useProductStore();

defineProps({
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

const handleFilterChange = debounce(async () => {
  productStore.setFilters(filters.value);
  await productStore.fetchProducts({ page: 1 });
}, 300);

const handlePageChange = async (page) => {
  await productStore.fetchProducts({ page });
};
</script>