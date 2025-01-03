<template>
  <div
    class="group bg-white rounded-xl border border-gray-200 p-6 hover:border-green-500 hover:shadow-md transition-all cursor-pointer"
    @click="$emit('click', product)"
  >
    <div class="space-y-4">
      <div class="flex justify-between items-start">
        <div>
          <h3
            class="text-lg font-semibold text-gray-800 group-hover:text-green-600"
          >
            {{ product.name }}
          </h3>
          <p class="text-sm text-gray-500">{{ product.brand }}</p>
        </div>
        <span
          :class="[
            'px-3 py-1 rounded-full text-xs font-medium',
            product.status === 'active'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800',
          ]"
        >
          {{ statusText }}
        </span>
      </div>

      <div class="grid grid-cols-2 gap-4 text-sm">
        <div class="flex items-center text-gray-600">
          <Tag class="w-4 h-4 mr-2" />
          {{ formatPrice(product.price.current) }} ₺
        </div>
        <div 
          class="flex items-center text-gray-600 cursor-pointer hover:text-green-600"
          @click.stop="navigateToStock"
        >
          <Package class="w-4 h-4 mr-2" />
          {{ product.stock.quantity }} {{ product.stock.unit }}
        </div>
      </div>

      <!-- Ürün Görseli -->
      <div
        v-if="product.images?.length"
        class="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden"
      >
        <img
          :src="product.images[0].url"
          :alt="product.name"
          class="w-full h-full object-cover"
        />
      </div>
    </div>
  </div>
</template>
  
<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { Tag, Package } from "lucide-vue-next";

const router = useRouter();
const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
});

defineEmits(["click"]);

const statusText = computed(() => {
  return props.product.status === "active" ? "Aktif" : "Pasif";
});

const formatPrice = (price) => {
  return new Intl.NumberFormat("tr-TR").format(price);
};

const navigateToStock = () => {
  router.push({
    name: 'product-stock',
    params: { id: props.product._id }
  });
};
</script>