<template>
  <div class="space-y-6">
    <h3 class="text-lg font-medium text-gray-900">Gübre Özellikleri</h3>

    <!-- Besin İçeriği -->
    <div class="space-y-4">
      <h4 class="text-sm font-medium text-gray-700">Besin İçeriği</h4>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          v-for="(nutrient, index) in nutrients"
          :key="index"
          class="form-group"
        >
          <div class="flex space-x-2">
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ nutrient.label }}
              </label>
              <div class="flex space-x-2">
                <input
                  v-model.number="nutrientContent[nutrient.key].value"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <span
                  class="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                >
                  {{ nutrientContent[nutrient.key].unit }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Uygulama Yöntemi -->
    <div class="form-group">
      <label class="block text-sm font-medium text-gray-700 mb-1">
        Uygulama Yöntemi
      </label>
      <input
        v-model="specifications.applicationMethod"
        type="text"
        required
        placeholder="Örn: Toprağa karıştırma"
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
      />
    </div>

    <!-- Bileşim -->
    <div class="form-group">
      <label class="block text-sm font-medium text-gray-700 mb-1">
        Bileşim
      </label>
      <textarea
        v-model="specifications.composition"
        rows="3"
        placeholder="Gübrenin içeriğindeki maddeler ve oranları"
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
      ></textarea>
    </div>

    <!-- Paketleme -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="form-group">
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Paket Miktarı
        </label>
        <input
          v-model.number="specifications.packaging.weight"
          type="number"
          min="0"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
      </div>

      <div class="form-group">
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Birim
        </label>
        <select
          v-model="specifications.packaging.unit"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        >
          <option value="">Birim Seçin</option>
          <option value="gr">Gram</option>
          <option value="kg">Kilogram</option>
          <option value="lt">Litre</option>
        </select>
      </div>
    </div>

    <!-- Kullanım Bilgileri -->
    <div class="space-y-4">
      <h4 class="text-sm font-medium text-gray-700">Kullanım Bilgileri</h4>

      <div class="form-group">
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Dozaj
        </label>
        <input
          v-model="specifications.usage.dosage"
          type="text"
          placeholder="Örn: 1-2 kg/dekar"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
      </div>

      <div class="form-group">
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Uygulama Sıklığı
        </label>
        <input
          v-model="specifications.usage.frequency"
          type="text"
          placeholder="Örn: Ayda bir kez"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
      </div>

      <!-- Uyarılar -->
      <div class="form-group">
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Uyarılar
        </label>
        <div class="space-y-2">
          <div
            v-for="(warning, index) in specifications.usage.warnings"
            :key="index"
            class="flex space-x-2"
          >
            <input
              v-model="specifications.usage.warnings[index]"
              type="text"
              placeholder="Uyarı ekleyin"
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            <button
              type="button"
              @click="removeWarning(index)"
              class="px-2 py-2 text-red-600 hover:text-red-800"
            >
              <span class="sr-only">Sil</span>
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
        <button
          type="button"
          @click="addWarning"
          class="mt-2 text-sm text-green-600 hover:text-green-800"
        >
          + Uyarı Ekle
        </button>
      </div>
    </div>
  </div>
</template>

<script>
// Normal script bloğunda sabit değerleri tanımlıyoruz
export const NUTRIENTS = [
  { key: "N", label: "Azot (N)" },
  { key: "P", label: "Fosfor (P)" },
  { key: "K", label: "Potasyum (K)" },
  { key: "Mg", label: "Magnezyum (Mg)" },
  { key: "Ca", label: "Kalsiyum (Ca)" },
  { key: "S", label: "Kükürt (S)" },
];
</script>

<script setup>
import { defineProps, defineEmits, computed } from "vue";

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      nutrientContent: Object.fromEntries(
        NUTRIENTS.map((n) => [n.key, { value: 0, unit: "%" }])
      ),
      applicationMethod: "",
      composition: "",
      packaging: {
        weight: 0,
        unit: "",
      },
      usage: {
        dosage: "",
        frequency: "",
        warnings: [],
      },
    }),
  },
});

const emit = defineEmits(["update:modelValue"]);

// Computed properties ve metodlar
const specifications = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const nutrients = computed(() => NUTRIENTS);

const nutrientContent = computed({
  get: () => {
    const content = {};
    NUTRIENTS.forEach((n) => {
      content[n.key] = props.modelValue.nutrientContent[n.key] || {
        value: 0,
        unit: "%",
      };
    });
    return content;
  },
  set: (value) => {
    emit("update:modelValue", {
      ...specifications.value,
      nutrientContent: value,
    });
  },
});

const addWarning = () => {
  specifications.value.usage.warnings.push("");
};

const removeWarning = (index) => {
  specifications.value.usage.warnings.splice(index, 1);
};
</script>