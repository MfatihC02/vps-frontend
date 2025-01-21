<template>
  <div class="min-h-screen bg-gray-50">
    <div class="py-6">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProductList
          :products="productStore.products"
          @manage-product="handleManageProduct"
          @add-product="handleAddProduct"
        />
      </div>
    </div>
  </div>
</template>
  
<script setup>
import { onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { useProductStore } from "@/stores/productStore";
import ProductList from "@/components/admin/ProductList.vue";

const router = useRouter();
const productStore = useProductStore();

onMounted(async () => {
  await productStore.fetchProducts();
  productStore.initializeSocketListeners();
});

onBeforeUnmount(() => {
  productStore.clearSocketListeners();
});

const handleManageProduct = (product) => {
  router.push(`/admin/product/${product._id}`);
};

const handleAddProduct = () => {
  router.push({ name: 'product-new' });
};
</script>