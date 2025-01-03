<template>
  <div class="space-y-6">
    <h3 class="text-lg font-medium text-gray-900">Fide Özellikleri</h3>

    <!-- Dikim Bilgileri -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="form-group">
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Toprak Yapısı
        </label>
        <input
          v-model="specifications.planting.soil"
          type="text"
          placeholder="Örn: Tınlı, organik maddece zengin"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
      </div>

      <div class="form-group">
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Dikim Sezonu
        </label>
        <input
          v-model="specifications.planting.season"
          type="text"
          placeholder="Örn: Mart-Nisan"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
      </div>

      <div class="form-group">
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Dikim Aralığı
        </label>
        <input
          v-model="specifications.planting.spacing"
          type="text"
          placeholder="Örn: 40x60 cm"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
      </div>
    </div>

    <!-- Çeşit Bilgisi -->
    <div class="form-group">
      <label class="block text-sm font-medium text-gray-700 mb-1">
        Çeşit
      </label>
      <select
        v-model="specifications.variety"
        required
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
      >
        <option value="">Çeşit Seçin</option>
        <option value="hibrit">Hibrit</option>
        <option value="standart">Standart</option>
      </select>
    </div>

    <!-- Paketleme Bilgileri -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="form-group">
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Paketleme Tipi
        </label>
        <select
          v-model="specifications.packaging.type"
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        >
          <option value="">Paketleme Tipi Seçin</option>
          <option value="200lu_viyol">200'lü Viyol</option>
          <option value="350li_viyol">350'li Viyol</option>
          <option value="400lu_viyol">400'lü Viyol</option>
          <option value="diger">Diğer</option>
        </select>
      </div>

      <div class="form-group">
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Paketleme Açıklaması
        </label>
        <input
          v-model="specifications.packaging.description"
          type="text"
          placeholder="Örn: Özel köpük viyol"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
      </div>
    </div>
  </div>
</template>
  
  <script setup>
import { defineProps, defineEmits, computed } from "vue";

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      planting: {
        soil: "",
        season: "",
        spacing: "",
      },
      variety: "",
      packaging: {
        type: "",
        description: "",
      },
    }),
  },
});

const emit = defineEmits(["update:modelValue"]);

const specifications = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});
</script>