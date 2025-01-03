<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Arama Alanı -->
      <div class="col-span-1 md:col-span-2">
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Arama
        </label>
        <div class="relative rounded-md shadow-sm">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search class="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            v-model="localFilters.searchTerm"
            class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="Sipariş no veya müşteri bilgisi ile ara..."
            @input="debounceSearch"
          />
          <button
            v-if="localFilters.searchTerm"
            @click="clearSearch"
            class="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X class="h-4 w-4 text-gray-400 hover:text-gray-500" />
          </button>
        </div>
      </div>

      <!-- Durum Filtresi -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Sipariş Durumu
        </label>
        <select
          v-model="localFilters.status"
          class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
          @change="emitFilters"
        >
          <option value="">Tümü</option>
          <option
            v-for="status in orderStatuses"
            :key="status"
            :value="status"
          >
            {{ formatStatus(status) }}
          </option>
        </select>
      </div>

      <!-- Tarih Filtresi -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Tarih Aralığı
        </label>
        <Popover class="relative">
          <PopoverButton
            class="w-full bg-white border border-gray-300 rounded-md shadow-sm px-4 py-2 inline-flex justify-between items-center text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <span>{{ formatDateRange }}</span>
            <Calendar class="ml-2 h-4 w-4 text-gray-400" />
          </PopoverButton>

          <transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 translate-y-1"
          >
            <PopoverPanel class="absolute z-10 mt-1 w-screen max-w-xs px-2 sm:px-0">
              <div class="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                <div class="relative bg-white p-4">
                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700">
                        Başlangıç Tarihi
                      </label>
                      <input
                        type="date"
                        v-model="localFilters.dateRange.start"
                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        @change="emitFilters"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700">
                        Bitiş Tarihi
                      </label>
                      <input
                        type="date"
                        v-model="localFilters.dateRange.end"
                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        @change="emitFilters"
                      />
                    </div>
                    <div class="flex justify-end space-x-2">
                      <button
                        @click="clearDateRange"
                        class="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        Temizle
                      </button>
                      <button
                        @click="applyDateRange"
                        class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        Uygula
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </PopoverPanel>
          </transition>
        </Popover>
      </div>
    </div>

    <!-- Aktif Filtreler -->
    <div v-if="hasActiveFilters" class="mt-4 flex flex-wrap gap-2">
      <div
        v-if="localFilters.searchTerm"
        class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800"
      >
        Arama: {{ localFilters.searchTerm }}
        <button
          @click="clearSearch"
          class="ml-2 text-gray-500 hover:text-gray-700"
        >
          <X class="h-4 w-4" />
        </button>
      </div>
      <div
        v-if="localFilters.status"
        class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800"
      >
        Durum: {{ formatStatus(localFilters.status) }}
        <button
          @click="clearStatus"
          class="ml-2 text-gray-500 hover:text-gray-700"
        >
          <X class="h-4 w-4" />
        </button>
      </div>
      <div
        v-if="hasDateRange"
        class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800"
      >
        Tarih: {{ formatDateRange }}
        <button
          @click="clearDateRange"
          class="ml-2 text-gray-500 hover:text-gray-700"
        >
          <X class="h-4 w-4" />
        </button>
      </div>
      <button
        @click="clearAllFilters"
        class="inline-flex items-center px-3 py-1 text-sm text-primary-600 hover:text-primary-700"
      >
        <Trash2 class="h-4 w-4 mr-1" />
        Tüm filtreleri temizle
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch  } from 'vue'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
import { Search, X, Calendar, Trash2 } from 'lucide-vue-next'
import { useOrderStore } from '@/stores/orderStore'
import debounce from 'lodash/debounce'
import { storeToRefs } from 'pinia'
const props = defineProps({
  filters: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:filters'])

// Store
const orderStore = useOrderStore()
const { orderStatuses } = storeToRefs(orderStore)

// Local state
const localFilters = ref({
  searchTerm: props.filters.searchTerm || '',
  status: props.filters.status || '',
  dateRange: {
    start: props.filters.dateRange?.start || '',
    end: props.filters.dateRange?.end || ''
  }
})

// Computed
const hasActiveFilters = computed(() => {
  return (
    localFilters.value.searchTerm ||
    localFilters.value.status ||
    hasDateRange.value
  )
})

const hasDateRange = computed(() => {
  return localFilters.value.dateRange.start || localFilters.value.dateRange.end
})

const formatDateRange = computed(() => {
  if (!hasDateRange.value) return 'Tarih seçin'

  const start = localFilters.value.dateRange.start
    ? new Date(localFilters.value.dateRange.start).toLocaleDateString('tr-TR')
    : ''
  const end = localFilters.value.dateRange.end
    ? new Date(localFilters.value.dateRange.end).toLocaleDateString('tr-TR')
    : ''

  if (start && end) return `${start} - ${end}`
  if (start) return `${start}'den itibaren`
  if (end) return `${end}'e kadar`
  return 'Tarih seçin'
})

// Methods
const emitFilters = () => {
  emit('update:filters', { ...localFilters.value })
}

const debounceSearch = debounce(() => {
  emitFilters()
}, 300)

const clearSearch = () => {
  localFilters.value.searchTerm = ''
  emitFilters()
}

const clearStatus = () => {
  localFilters.value.status = ''
  emitFilters()
}

const clearDateRange = () => {
  localFilters.value.dateRange = {
    start: '',
    end: ''
  }
  emitFilters()
}

const applyDateRange = () => {
  emitFilters()
}

const clearAllFilters = () => {
  localFilters.value = {
    searchTerm: '',
    status: '',
    dateRange: {
      start: '',
      end: ''
    }
  }
  emitFilters()
}

const formatStatus = (status) => {
  const statusMap = {
    'PENDING_PAYMENT': 'Ödeme Bekliyor',
    'PROCESSING': 'Hazırlanıyor',
    'SHIPPED': 'Kargoda',
    'DELIVERED': 'Teslim Edildi',
    'CANCELLED': 'İptal Edildi',
    'REFUNDED': 'İade Edildi'
  }
  return statusMap[status] || status
}

// Watch props changes
watch(
  () => props.filters,
  (newFilters) => {
    localFilters.value = {
      searchTerm: newFilters.searchTerm || '',
      status: newFilters.status || '',
      dateRange: {
        start: newFilters.dateRange?.start || '',
        end: newFilters.dateRange?.end || ''
      }
    }
  },
  { deep: true }
)
</script>
