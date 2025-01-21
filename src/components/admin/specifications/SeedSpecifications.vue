<template>
  <div class="space-y-6">
    <h3 class="text-lg font-medium text-gray-900">Tohum Özellikleri</h3>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Çimlenme Oranı -->
      <div class="form-group">
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Çimlenme Oranı (%)
        </label>
        <input
          v-model.number="specifications.germinationRate"
          type="number"
          min="0"
          max="100"
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
      </div>

      <!-- Yetişme Süresi -->
      <div class="form-group">
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Yetişme Süresi
        </label>
        <input
          v-model="specifications.growthPeriod"
          type="text"
          required
          placeholder="Örn: 60-75 gün"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Hasat Zamanı -->
      <div class="form-group">
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Hasat Zamanı
        </label>
        <input
          v-model="specifications.harvestTime"
          type="text"
          placeholder="Örn: Ağustos-Eylül"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
      </div>

      <!-- Ekim Derinliği -->
      <div class="form-group">
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Ekim Derinliği
        </label>
        <input
          v-model="specifications.plantingDepth"
          type="text"
          placeholder="Örn: 2-3 cm"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Sıra Arası Mesafe -->
      <div class="form-group">
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Ekim Mesafesi
        </label>
        <input
          v-model="specifications.sowingDistance"
          type="text"
          placeholder="Örn: 40-50 cm"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
      </div>

      <!-- Verim -->
      <div class="form-group">
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Verim
        </label>
        <input
          v-model="specifications.yield"
          type="text"
          placeholder="Örn: 2-3 ton/dekar"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Sezon -->
      <div class="form-group">
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Ekim Sezonu
        </label>
        <select
          v-model="specifications.season"
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        >
          <option value="">Sezon Seçin</option>
          <option value="ilkbahar">İlkbahar</option>
          <option value="yaz">Yaz</option>
          <option value="sonbahar">Sonbahar</option>
          <option value="kış">Kış</option>
          <option value="tümYıl">Tüm Yıl</option>
        </select>
      </div>

      <!-- Menşei -->
      <div class="form-group">
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Menşei
        </label>
        <input
          v-model="specifications.origin"
          type="text"
          placeholder="Örn: Türkiye"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
      </div>
    </div>

    <!-- Paketleme -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="form-group">
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Paket Ağırlığı
        </label>
        <input
          v-model.number="specifications.packaging.weight"
          type="number"
          min="0"
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
      </div>

      <div class="form-group">
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Birim
        </label>
        <select
          v-model="specifications.packaging.unit"
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        >
          <option value="">Birim Seçin</option>
          <option value="gr">Gram</option>
          <option value="kg">Kilogram</option>
          <option value="adet">Adet</option>
        </select>
      </div>
    </div>
  </div>
</template>
  
  <script setup>
import { defineProps, defineEmits, computed } from "vue";

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
    default: () => ({
      germinationRate: 0,
      growthPeriod: "",
      harvestTime: "",
      plantingDepth: "",
      sowingDistance: "",
      yield: "",
      season: "",
      origin: "",
      packaging: {
        weight: 0,
        unit: "",
      },
    }),
    validator: (value) => {
      // packaging özelliğinin varlığını kontrol et
      return value && typeof value === "object" && value.packaging;
    },
  },
});

const emit = defineEmits(["update:modelValue"]);
const ensureValidSpecifications = (specs) => {
  if (!specs.packaging) {
    specs.packaging = { weight: 0, unit: "" };
  }
  return specs;
};

const specifications = computed({
  get: () => ensureValidSpecifications(props.modelValue),
  set: (value) => emit("update:modelValue", ensureValidSpecifications(value)),
});
</script>