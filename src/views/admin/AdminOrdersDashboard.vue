<template>
  <div class="min-h-screen bg-gray-50/60">
    <!-- Header Section -->
    <div class="bg-white shadow-lg border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div class="flex flex-col xs:flex-row xs:items-center xs:justify-between space-y-3 xs:space-y-0">
          <div>
            <h1 class="text-2xl xs:text-3xl font-bold text-gray-900 font-inter">Sipariş Yönetimi</h1>
            <p class="mt-1 text-sm text-gray-500">Siparişlerinizi buradan yönetebilirsiniz</p>
          </div>
          <div class="flex flex-col xs:flex-row items-center space-y-2 xs:space-y-0 xs:space-x-4">
            <button
              @click="refreshOrders"
              class="w-full xs:w-auto inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200 ease-in-out"
            >
              <RefreshCcw class="w-4.5 h-4.5 mr-2" />
              Yenile
            </button>
            <button
              v-if="hasSelectedOrders"
              @click="showBulkActions = true"
              class="w-full xs:w-auto inline-flex items-center justify-center px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg transition-all duration-200 ease-in-out shadow-sm hover:shadow-md"
            >
              <ClipboardList class="w-4.5 h-4.5 mr-2" />
              Toplu İşlem ({{ selectedOrders.length }})
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
        <div
          v-for="stat in stats"
          :key="stat.name"
          class="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-4 lg:p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
        >
          <div class="flex items-center">
            <div class="p-2 sm:p-3 rounded-xl" :class="stat.bgColor">
              <component
                :is="stat.icon"
                class="w-8 h-8 sm:w-10 sm:h-10"
                :class="stat.iconClass"
              />
            </div>
            <div class="ml-3 sm:ml-4">
              <p class="text-sm font-medium text-gray-600">{{ stat.name }}</p>
              <p class="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                {{ stat.value }}
              </p>
            </div>
          </div>
          <div class="mt-3 sm:mt-4 flex items-center text-sm">
            <span :class="stat.trendColor">{{ stat.trend }}%</span>
            <span class="text-gray-500 ml-2">geçen haftaya göre</span>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="mb-4 sm:mb-6 lg:mb-8">
        <div class="flex flex-col xs:flex-row xs:items-center xs:justify-between mb-3 sm:mb-4">
          <h2 class="text-base sm:text-lg font-semibold text-gray-900 mb-2 xs:mb-0">Filtreler</h2>
          <button
            @click="clearAllFilters"
            class="text-sm text-gray-600 hover:text-gray-900 inline-flex items-center"
          >
            <Trash2 class="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
            Filtreleri Temizle
          </button>
        </div>
        <AdminOrderFilters
          :filters="filters"
          @update:filters="updateFilters"
          class="animate-fade-in"
        />
      </div>

      <!-- Orders Table -->
      <div class="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <!-- Mobile View -->
        <div class="block sm:hidden">
          <div v-for="order in filteredOrders" :key="order._id" class="p-4 border-b border-gray-200 last:border-b-0">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center">
                <input
                  type="checkbox"
                  v-model="selectedOrders"
                  :value="order._id"
                  class="rounded border-gray-300 text-primary focus:ring-primary-light mr-3"
                />
                <span class="font-medium text-gray-900">{{ order.orderNumber }}</span>
              </div>
              <span
                class="px-2 py-1 text-xs leading-5 font-semibold rounded-full inline-flex items-center"
                :class="getStatusClass(order.status)"
              >
                <component
                  :is="getStatusIcon(order.status)"
                  class="w-3.5 h-3.5 mr-1"
                  :class="getStatusIconClass(order.status)"
                />
                {{ order.status }}
              </span>
            </div>
            <div class="space-y-1 text-sm">
              <div class="text-gray-600">{{ formatDate(order.createdAt) }}</div>
              <div class="text-gray-800">{{ order.user?.email }}</div>
            </div>
            <div class="mt-3 flex justify-end">
              <button
                @click="viewOrderDetails(order._id)"
                class="inline-flex items-center text-primary hover:text-primary-dark transition-colors text-sm"
              >
                <Eye class="w-4 h-4 mr-1" />
                Detay
              </button>
            </div>
          </div>
        </div>

        <!-- Desktop View -->
        <div class="hidden sm:block overflow-x-auto min-w-full">
          <table class="w-full divide-y divide-gray-200">
            <thead class="bg-gray-50/80">
              <tr>
                <th scope="col" class="px-4 sm:px-6 py-3 sm:py-4 text-left">
                  <input
                    type="checkbox"
                    v-model="selectAll"
                    class="rounded border-gray-300 text-primary focus:ring-primary-light"
                  />
                </th>
                <th
                  v-for="header in tableHeaders"
                  :key="header.key"
                  scope="col"
                  class="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                >
                  {{ header.label }}
                </th>
                <th scope="col" class="relative px-4 sm:px-6 py-3 sm:py-4">
                  <span class="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="order in filteredOrders"
                :key="order._id"
                class="hover:bg-gray-50 transition-colors group"
              >
                <td class="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    v-model="selectedOrders"
                    :value="order._id"
                    class="rounded border-gray-300 text-primary focus:ring-primary-light"
                  />
                </td>
                <td class="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900 group-hover:text-primary-dark transition-colors">
                    {{ order.orderNumber }}
                  </div>
                </td>
                <td class="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">
                    {{ formatDate(order.createdAt) }}
                  </div>
                </td>
                <td class="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">
                    {{ order.user?.email }}
                  </div>
                </td>
                <td class="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                  <span
                    class="px-2 py-1 text-xs leading-5 font-semibold rounded-full inline-flex items-center"
                    :class="getStatusClass(order.status)"
                  >
                    <component
                      :is="getStatusIcon(order.status)"
                      class="w-3.5 h-3.5 mr-1"
                      :class="getStatusIconClass(order.status)"
                    />
                    {{ order.status }}
                  </span>
                </td>
                <td class="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    @click="viewOrderDetails(order._id)"
                    class="inline-flex items-center text-primary hover:text-primary-dark transition-colors"
                  >
                    <Eye class="w-4 h-4 mr-1" />
                    <span class="hidden xs:inline">Detay</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <!-- Mobile Pagination -->
          <div class="flex-1 flex justify-between sm:hidden">
            <button
              @click="previousPage"
              :disabled="!canGoPrevious"
              class="relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px] justify-center"
            >
              <ChevronLeft class="h-4 w-4 mr-1" />
              Önceki
            </button>
            <div class="mx-2 flex items-center">
              <span class="text-sm text-gray-700">
                {{ pagination.page }} / {{ pagination.pages }}
              </span>
            </div>
            <button
              @click="nextPage"
              :disabled="!canGoNext"
              class="relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px] justify-center"
            >
              Sonraki
              <ChevronRight class="h-4 w-4 ml-1" />
            </button>
          </div>
          <!-- Desktop Pagination -->
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                Toplam
                <span class="font-medium">{{ pagination.total }}</span>
                sipariş içinden
                <span class="font-medium">{{ startIndex + 1 }}</span>
                -
                <span class="font-medium">{{ endIndex }}</span>
                arası gösteriliyor
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  @click="previousPage"
                  :disabled="!canGoPrevious"
                  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span class="sr-only">Previous</span>
                  <ChevronLeft class="h-5 w-5" />
                </button>
                <button
                  v-for="pageNumber in visiblePages"
                  :key="pageNumber"
                  @click="goToPage(pageNumber)"
                  :class="[
                    'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                    pageNumber === pagination.page
                      ? 'z-10 bg-primary-light border-primary-light text-white'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50',
                    typeof pageNumber === 'string' ? 'cursor-default' : 'cursor-pointer'
                  ]"
                >
                  {{ pageNumber }}
                </button>
                <button
                  @click="nextPage"
                  :disabled="!canGoNext"
                  class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span class="sr-only">Next</span>
                  <ChevronRight class="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Bulk Actions Modal -->
    <TransitionRoot appear :show="showBulkActions" as="template">
      <Dialog as="div" @close="showBulkActions = false" class="relative z-10">
        <TransitionChild
          enter="ease-out duration-300"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="ease-in duration-200"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black bg-opacity-25" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              enter="ease-out duration-300"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="ease-in duration-200"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <DialogPanel class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900">
                  Toplu İşlem
                </DialogTitle>
                <div class="mt-4">
                  <select
                    v-model="bulkAction"
                    class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                  >
                    <option value="">İşlem Seçin</option>
                    <option
                      v-for="status in orderStatuses"
                      :key="status"
                      :value="status"
                    >
                      {{ status }}
                    </option>
                  </select>
                </div>

                <div class="mt-4">
                  <button
                    type="button"
                    class="inline-flex justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                    @click="executeBulkAction"
                    :disabled="!bulkAction || bulkOperationStatus.processing"
                  >
                    {{ bulkOperationStatus.processing ? 'İşleniyor...' : 'Uygula' }}
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useOrderStore } from '@/stores/orderStore'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import {
  Package,
  Clock,
  TrendingUp,
  AlertCircle,
  Trash2,
  Search,
  RefreshCcw,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye
} from 'lucide-vue-next'
import { ClipboardList } from 'lucide-vue-next'
import AdminOrderFilters from '@/components/admin/orders/AdminOrderFilters.vue'

// Store
const orderStore = useOrderStore()
const {
  orders,
  loading,
  error,
  filters,
  pagination,
  orderStatuses,
  selectedOrders,
  bulkOperationStatus
} = storeToRefs(orderStore)

// Router
const router = useRouter()

// Local state
const showBulkActions = ref(false)
const bulkAction = ref('')
const selectAll = ref(false)
const tableSearch = ref('')

// Table headers
const tableHeaders = [
  { key: 'orderNumber', label: 'Sipariş No' },
  { key: 'createdAt', label: 'Tarih' },
  { key: 'user', label: 'Müşteri' },
  { key: 'status', label: 'Durum' }
]

// Stats
const stats = computed(() => [
  {
    name: 'Toplam Sipariş',
    value: pagination.value.total,
    icon: Package,
    iconClass: 'text-green-500',
    bgColor: 'bg-green-100',
    trend: 10,
    trendColor: 'text-green-600'
  },
  {
    name: 'Bekleyen',
    value: orders.value.filter(o => o.status === 'PENDING_PAYMENT').length,
    icon: Clock,
    iconClass: 'text-yellow-500',
    bgColor: 'bg-yellow-100',
    trend: -5,
    trendColor: 'text-red-600'
  },
  {
    name: 'Tamamlanan',
    value: orders.value.filter(o => o.status === 'DELIVERED').length,
    icon: TrendingUp,
    iconClass: 'text-green-500',
    bgColor: 'bg-green-100',
    trend: 20,
    trendColor: 'text-green-600'
  },
  {
    name: 'İptal Edilen',
    value: orders.value.filter(o => o.status === 'CANCELLED').length,
    icon: AlertCircle,
    iconClass: 'text-red-500',
    bgColor: 'bg-red-100',
    trend: -10,
    trendColor: 'text-red-600'
  }
])

// Computed Properties
const filteredOrders = computed(() => {
  if (!orders.value) return []
  
  return orders.value.filter(order => {
    // Status filtresi
    if (filters.value.status && order.status !== filters.value.status) {
      return false
    }
    
    // Tarih filtresi
    if (filters.value.dateRange) {
      const orderDate = new Date(order.createdAt)
      const startDate = new Date(filters.value.dateRange[0])
      const endDate = new Date(filters.value.dateRange[1])
      
      if (orderDate < startDate || orderDate > endDate) {
        return false
      }
    }
    
    // Arama filtresi
    if (filters.value.search) {
      const searchTerm = filters.value.search.toLowerCase()
      const searchableFields = [
        order.orderNumber,
        order.user.email,
        order.status.toLowerCase()
      ]
      
      return searchableFields.some(field => field.includes(searchTerm))
    }
    
    // Tablo arama filtresi
    if (tableSearch.value) {
      const searchTerm = tableSearch.value.toLowerCase()
      const searchableFields = [
        order.orderNumber,
        order.user.email,
        order.status.toLowerCase()
      ]
      
      return searchableFields.some(field => field.includes(searchTerm))
    }
    
    return true
  })
})

const hasSelectedOrders = computed(() => selectedOrders.value.length > 0)
const canGoPrevious = computed(() => pagination.value.page > 1)
const canGoNext = computed(() => pagination.value.page < pagination.value.pages)
const startIndex = computed(() => (pagination.value.page - 1) * pagination.value.limit)
const endIndex = computed(() => Math.min(startIndex.value + pagination.value.limit, pagination.value.total))

const visiblePages = computed(() => {
  const total = pagination.value.pages;
  const current = pagination.value.page;
  const pages = [];
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    if (current <= 3) {
      for (let i = 1; i <= 5; i++) {
        pages.push(i);
      }
      pages.push('...', total);
    } else if (current >= total - 2) {
      pages.push(1, '...');
      for (let i = total - 4; i <= total; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1, '...');
      for (let i = current - 1; i <= current + 1; i++) {
        pages.push(i);
      }
      pages.push('...', total);
    }
  }
  
  return pages;
})

// Methods
const refreshOrders = () => {
  orderStore.fetchAllOrders()
}

const updateFilters = (newFilters) => {
  orderStore.updateFilters(newFilters)
}

const viewOrderDetails = (orderId) => {
  router.push(`/admin/orders/${orderId}`)
}

const previousPage = async () => {
  if (canGoPrevious.value) {
    await orderStore.updatePagination(pagination.value.page - 1);
  }
}

const nextPage = async () => {
  if (canGoNext.value) {
    await orderStore.updatePagination(pagination.value.page + 1);
  }
}

const goToPage = async (page) => {
  if (typeof page === 'number') {
    await orderStore.updatePagination(page);
  }
}

const executeBulkAction = async () => {
  if (!bulkAction.value) return

  try {
    await orderStore.bulkUpdateOrders(selectedOrders.value, {
      status: bulkAction.value
    })
    showBulkActions.value = false
    bulkAction.value = ''
    selectedOrders.value = []
  } catch (error) {
    console.error('Toplu işlem hatası:', error)
  }
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getStatusClass = (status) => {
  const classes = {
    'PENDING_PAYMENT': 'bg-yellow-100 text-yellow-800',
    'PROCESSING': 'bg-blue-100 text-blue-800',
    'SHIPPED': 'bg-purple-100 text-purple-800',
    'DELIVERED': 'bg-green-100 text-green-800',
    'CANCELLED': 'bg-red-100 text-red-800',
    'REFUNDED': 'bg-gray-100 text-gray-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getStatusIcon = (status) => {
  const icons = {
    pending: Clock,
    processing: RefreshCcw,
    completed: TrendingUp,
    cancelled: AlertCircle
  }
  return icons[status] || Package
}

const getStatusIconClass = (status) => {
  const classes = {
    pending: 'text-yellow-500',
    processing: 'text-blue-500',
    completed: 'text-green-500',
    cancelled: 'text-red-500'
  }
  return classes[status] || 'text-gray-500'
}

const getStatusBgClass = (status) => {
  const classes = {
    pending: 'bg-yellow-50',
    processing: 'bg-blue-50',
    completed: 'bg-green-50',
    cancelled: 'bg-red-50'
  }
  return classes[status] || 'bg-gray-50'
}

const clearAllFilters = () => {
  orderStore.clearAllFilters()
}

const refreshTable = () => {
  refreshOrders()
}

// Watch selectAll changes
watch(selectAll, (value) => {
  if (value) {
    selectedOrders.value = orders.value.map(order => order._id)
  } else {
    selectedOrders.value = []
  }
})

// Lifecycle
onMounted(() => {
  refreshOrders()
})
</script>
