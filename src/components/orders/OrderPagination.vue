<!-- OrderPagination.vue -->
<template>
  <div class="flex items-center justify-between px-4 py-3 sm:px-6">
    <!-- Mobil Görünüm -->
    <div class="flex flex-1 justify-between sm:hidden">
      <button
        :disabled="currentPage === 1"
        @click="onPageChange(currentPage - 1)"
        class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Önceki
      </button>
      <button
        :disabled="currentPage === totalPages"
        @click="onPageChange(currentPage + 1)"
        class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Sonraki
      </button>
    </div>

    <!-- Desktop Görünüm -->
    <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
      <div>
        <p class="text-sm text-gray-700">
          Toplam
          <span class="font-medium">{{ totalItems }}</span>
          siparişten
          <span class="font-medium">{{ startItem }}-{{ endItem }}</span>
          arası gösteriliyor
        </p>
      </div>
      <div>
        <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
          <!-- Önceki Sayfa -->
          <button
            :disabled="currentPage === 1"
            @click="onPageChange(currentPage - 1)"
            class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span class="sr-only">Önceki</span>
            <ChevronLeft class="h-5 w-5" aria-hidden="true" />
          </button>

          <!-- Sayfa Numaraları -->
          <template v-for="page in visiblePages" :key="page">
            <!-- Ellipsis (...) -->
            <span
              v-if="page === '...'"
              class="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0"
            >
              ...
            </span>
            <!-- Sayfa Numarası -->
            <button
              v-else
              :class="[
                page === currentPage
                  ? 'relative z-10 inline-flex items-center bg-primary-600 px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600'
                  : 'relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
              ]"
              @click="onPageChange(page)"
            >
              {{ page }}
            </button>
          </template>

          <!-- Sonraki Sayfa -->
          <button
            :disabled="currentPage === totalPages"
            @click="onPageChange(currentPage + 1)"
            class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span class="sr-only">Sonraki</span>
            <ChevronRight class="h-5 w-5" aria-hidden="true" />
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

const props = defineProps({
  currentPage: {
    type: Number,
    required: true
  },
  totalPages: {
    type: Number,
    required: true
  },
  totalItems: {
    type: Number,
    required: true
  },
  itemsPerPage: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['page-change'])

// Sayfa değişikliği
const onPageChange = (page) => {
  if (page >= 1 && page <= props.totalPages) {
    emit('page-change', page)
  }
}

// Gösterilen öğe aralığı
const startItem = computed(() => {
  return (props.currentPage - 1) * props.itemsPerPage + 1
})

const endItem = computed(() => {
  const end = props.currentPage * props.itemsPerPage
  return end > props.totalItems ? props.totalItems : end
})

// Görünür sayfalar
const visiblePages = computed(() => {
  const delta = 2 // Her yönde kaç sayfa gösterilecek
  const range = []
  const rangeWithDots = []
  let l

  // Sayfa aralığını oluştur
  for (let i = 1; i <= props.totalPages; i++) {
    if (
      i === 1 || // İlk sayfa
      i === props.totalPages || // Son sayfa
      i >= props.currentPage - delta && // Aktif sayfadan önceki delta kadar sayfa
      i <= props.currentPage + delta // Aktif sayfadan sonraki delta kadar sayfa
    ) {
      range.push(i)
    }
  }

  // Aralıkları ... ile birleştir
  for (let i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1)
      } else if (i - l !== 1) {
        rangeWithDots.push('...')
      }
    }
    rangeWithDots.push(i)
    l = i
  }

  return rangeWithDots
})
</script>
