// ProductSpecifications.vue
<template>
  <div class="space-y-6 border-t border-gray-200 pt-6">
    <h3 class="text-lg font-semibold text-gray-800">Ürün Özellikleri</h3>

    <div class="space-y-4">
      <template v-if="productType === 'seed'">
        <div class="form-group">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Çimlenme Oranı (%)
          </label>
          <input
            v-model.number="specData.germinationRate"
            type="number"
            min="0"
            max="100"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
      </template>

      <template v-else-if="productType === 'fertilizer'">
        <div class="form-group">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Besin İçeriği
          </label>
          <div class="grid grid-cols-3 gap-4">
            <div v-for="nutrient in ['N', 'P', 'K']" :key="nutrient">
              <input
                v-model="specData.nutrientContent[nutrient]"
                type="text"
                :placeholder="`${nutrient} (%)`"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from "vue";

const props = defineProps({
  productType: {
    type: String,
    required: true,
  },
  modelValue: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["update:modelValue"]);

const specData = reactive({
  nutrientContent: { N: "", P: "", K: "" },
});

watch(
  specData,
  (newVal) => {
    emit("update:modelValue", newVal);
  },
  { deep: true }
);

watch(
  () => props.modelValue,
  (newVal) => {
    Object.assign(specData, newVal);
  },
  { deep: true, immediate: true }
);

watch(
  () => props.productType,
  () => {
    Object.keys(specData).forEach((key) => delete specData[key]);
    if (props.productType === "fertilizer") {
      specData.nutrientContent = { N: "", P: "", K: "" };
    }
  }
);
</script>
