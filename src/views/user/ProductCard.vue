<!-- components/shared/ProductCard.vue -->
<template>
  <div class="border rounded-lg p-4 hover:shadow-lg transition-shadow">
    <div class="relative mb-4">
      <div class="aspect-square bg-gray-100 rounded-lg"></div>
      <div class="absolute top-2 left-2 flex gap-1">
        <span
          v-if="product.isNew"
          class="bg-[#0F6735] text-white text-xs px-2 py-1 rounded"
          >Yeni</span
        >
        <span
          v-if="product.isDiscount"
          class="bg-red-500 text-white text-xs px-2 py-1 rounded"
          >%15</span
        >
      </div>
    </div>
    <div class="space-y-2">
      <p class="text-sm text-gray-500">{{ product.category }}</p>
      <h3 class="font-semibold">{{ product.name }}</h3>
      <div class="flex items-center gap-2">
        <span class="font-bold text-lg">{{ product.price }} TL</span>
        <div class="flex items-center gap-1">
          <i class="fas fa-star text-yellow-400"></i>
          <span class="text-sm">{{ product.rating }}</span>
        </div>
      </div>
      <button
        class="w-full bg-[#0F6735] text-white py-2 rounded-md flex items-center justify-center gap-2"
      >
        Sepete Ekle
        <i class="fas fa-shopping-cart"></i>
      </button>
    </div>
  </div>
</template>
  
  <script>
export default {
  name: "ProductCard",
  props: {
    product: {
      type: Object,
      required: true,
      validator: function (product) {
        return [
          "id",
          "category",
          "name",
          "price",
          "rating",
          "isNew",
          "isDiscount",
        ].every((prop) => prop in product);
      },
    },
  },
};
</script>