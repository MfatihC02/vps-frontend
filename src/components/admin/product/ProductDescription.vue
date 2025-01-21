<template>
  <div class="space-y-6">
    <h3 class="text-lg font-medium text-gray-900">Ürün Açıklamaları</h3>
    
    <!-- Meta Açıklama -->
    <div class="form-group">
      <label class="block text-sm font-medium text-gray-700 mb-1">
        Meta Açıklama
        <span class="text-red-500">*</span>
      </label>
      <div class="relative">
        <textarea
          v-model="localDescription.meta"
          rows="2"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          :class="{'border-red-500': errors.meta}"
          @input="validateField('meta')"
        ></textarea>
        <div class="absolute bottom-2 right-2 text-sm text-gray-500">
          {{ localDescription.meta.length }}/160
        </div>
      </div>
      <p v-if="errors.meta" class="mt-1 text-sm text-red-600">{{ errors.meta }}</p>
      <p class="mt-1 text-sm text-gray-500">
        Google için optimize edilmiş kısa ürün açıklaması (50-160 karakter)
      </p>
    </div>

    <!-- Detaylı Açıklama -->
    <div class="form-group">
      <label class="block text-sm font-medium text-gray-700 mb-1">
        Detaylı Açıklama
        <span class="text-red-500">*</span>
      </label>
      <div class="relative">
        <textarea
          v-model="localDescription.detailed"
          rows="4"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          :class="{'border-red-500': errors.detailed}"
          @input="validateField('detailed')"
        ></textarea>
        <div class="absolute bottom-2 right-2 text-sm text-gray-500">
          {{ localDescription.detailed.length }}/1000
        </div>
      </div>
      <p v-if="errors.detailed" class="mt-1 text-sm text-red-600">{{ errors.detailed }}</p>
      <p class="mt-1 text-sm text-gray-500">
        Ürünün detaylı açıklaması (en az 100 karakter)
      </p>
    </div>

    <!-- Anahtar Kelimeler -->
    <div class="form-group">
      <label class="block text-sm font-medium text-gray-700 mb-1">
        Anahtar Kelimeler
        <span class="text-red-500">*</span>
      </label>
      <div class="space-y-2">
        <div class="flex flex-wrap gap-2 p-2 border border-gray-300 rounded-lg min-h-[42px]"
             :class="{'border-red-500': errors.keywords}">
          <!-- Mevcut etiketler -->
          <span v-for="(keyword, index) in localDescription.keywords" 
                :key="index"
                class="inline-flex items-center px-2 py-1 rounded-md bg-green-100 text-green-800">
            {{ keyword }}
            <button type="button" 
                    class="ml-1 text-green-600 hover:text-green-900"
                    @click="removeKeyword(index)">
              ×
            </button>
          </span>
          
          <!-- Input alanı -->
          <input
            v-model="newKeyword"
            @keydown.enter.prevent="addKeyword"
            @keydown.tab.prevent="addKeyword"
            @keydown.comma.prevent="addKeyword"
            placeholder="Anahtar kelime ekle..."
            class="flex-1 min-w-[120px] outline-none border-0 bg-transparent p-1"
          />
        </div>
        <p v-if="errors.keywords" class="mt-1 text-sm text-red-600">{{ errors.keywords }}</p>
        <p class="text-sm text-gray-500">
          En az 3, en fazla 10 anahtar kelime ekleyin. Enter, Tab veya virgül ile ayırabilirsiniz.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
    default: () => ({
      meta: '',
      detailed: '',
      keywords: []
    })
  }
})

const emit = defineEmits(['update:modelValue'])

// Yerel veri yönetimi
const localDescription = reactive({
  meta: '',
  detailed: '',
  keywords: []
})

// Anahtar kelime ekleme için input
const newKeyword = ref('')

// Hata yönetimi
const errors = reactive({
  meta: '',
  detailed: '',
  keywords: ''
})

// Props'tan gelen verileri yerel state'e aktar
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    localDescription.meta = newValue.meta || ''
    localDescription.detailed = newValue.detailed || ''
    localDescription.keywords = [...(newValue.keywords || [])]
  }
}, { immediate: true, deep: true })

// Yerel state değişikliklerini üst bileşene bildir
watch(localDescription, (newValue) => {
  emit('update:modelValue', {
    meta: newValue.meta,
    detailed: newValue.detailed,
    keywords: [...newValue.keywords]
  })
}, { deep: true })

// Anahtar kelime ekleme
const addKeyword = () => {
  const keyword = newKeyword.value.trim()
  if (keyword && !localDescription.keywords.includes(keyword)) {
    if (localDescription.keywords.length < 10) {
      localDescription.keywords.push(keyword)
      newKeyword.value = ''
      validateField('keywords')
    } else {
      errors.keywords = 'En fazla 10 anahtar kelime ekleyebilirsiniz'
    }
  }
}

// Anahtar kelime silme
const removeKeyword = (index) => {
  localDescription.keywords.splice(index, 1)
  validateField('keywords')
}

// Alan validasyonu
const validateField = (field) => {
  errors[field] = ''
  
  switch (field) {
    case 'meta':
      if (!localDescription.meta) {
        errors.meta = 'Meta açıklama zorunludur'
      } else if (localDescription.meta.length < 50) {
        errors.meta = 'Meta açıklama en az 50 karakter olmalıdır'
      } else if (localDescription.meta.length > 160) {
        errors.meta = 'Meta açıklama en fazla 160 karakter olmalıdır'
      }
      break
      
    case 'detailed':
      if (!localDescription.detailed) {
        errors.detailed = 'Detaylı açıklama zorunludur'
      } else if (localDescription.detailed.length < 100) {
        errors.detailed = 'Detaylı açıklama en az 100 karakter olmalıdır'
      }
      break
      
    case 'keywords':
      if (!localDescription.keywords.length) {
        errors.keywords = 'En az 3 anahtar kelime eklemelisiniz'
      } else if (localDescription.keywords.length < 3) {
        errors.keywords = 'En az 3 anahtar kelime eklemelisiniz'
      } else if (localDescription.keywords.length > 10) {
        errors.keywords = 'En fazla 10 anahtar kelime ekleyebilirsiniz'
      }
      break
  }
  
  return !errors[field]
}

// Tüm alanların validasyonu
const validateAll = () => {
  const fieldsToValidate = ['meta', 'detailed', 'keywords'];
  return fieldsToValidate.every(field => {
    const isValid = validateField(field);
    if (!isValid) {
      console.log(`Validation failed for ${field}:`, errors[field]);
    }
    return isValid;
  });
}

// Validasyon fonksiyonunu dışa aktar
defineExpose({
  validate: validateAll
})
</script>
