<!-- OrdersView.vue -->
<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Başlık ve Özet Bilgiler -->
    <div class="mb-8">
      <h1 class="text-2xl font-semibold text-gray-900 mb-4">Siparişlerim</h1>
    </div>

    <!-- Filtreler -->
    <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div class="flex flex-wrap gap-4 items-center">
        <!-- Durum Filtresi -->
        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Sipariş Durumu
          </label>
          <select
            v-model="selectedStatus"
            class="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          >
            <option value="">Tümü</option>
            <option v-for="status in orderStatuses" :key="status" :value="status">
              {{ getStatusText(status) }}
            </option>
          </select>
        </div>

        <!-- Tarih Filtresi -->
        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Tarih Aralığı
          </label>
          <select
            v-model="selectedDateRange"
            class="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          >
            <option value="all">Tümü</option>
            <option value="last7days">Son 7 Gün</option>
            <option value="last30days">Son 30 Gün</option>
            <option value="last3months">Son 3 Ay</option>
          </select>
        </div>

        <!-- Arama -->
        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Sipariş Ara
          </label>
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Sipariş numarası ile ara..."
              class="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 pl-10"
            />
            <Search class="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>
    </div>

    <!-- Sipariş Listesi -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
    </div>

    <div v-else-if="filteredOrders.length === 0" class="text-center py-12">
      <Package class="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 mb-2">Sipariş Bulunamadı</h3>
      <p class="text-gray-500">
        {{ searchQuery ? 'Arama kriterlerinize uygun sipariş bulunamadı.' : 'Henüz hiç siparişiniz bulunmuyor.' }}
      </p>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <OrderCard
        v-for="order in filteredOrders"
        :key="order._id"
        :order="order"
        @click="showOrderDetail(order)"
        class="cursor-pointer"
      />
    </div>

    <!-- Pagination -->
    <OrderPagination
      v-if="orders.length"
      :current-page="orderStore.pagination.page"
      :total-pages="orderStore.pagination.pages"
      :total-items="orderStore.pagination.total"
      :items-per-page="orderStore.pagination.limit"
      @page-change="handlePageChange"
    />

    <!-- Sipariş Detay Modalı -->
    <OrderDetail
      v-if="selectedOrder"
      v-model:is-open="isDetailModalOpen"
      :order="selectedOrder"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useOrderStore } from '@/stores/orderStore'
import { Package, Timer, Wallet, Search } from 'lucide-vue-next'
import OrderCard from '@/components/orders/OrderCard.vue'
import OrderDetail from '@/components/orders/OrderDetail.vue'
import OrderPagination from '@/components/orders/OrderPagination.vue'

// Store
const orderStore = useOrderStore()
const { orders, loading, orderStatuses } = storeToRefs(orderStore)

// State
const isDetailModalOpen = ref(false)
const selectedOrder = ref(null)
const selectedStatus = ref('')
const selectedDateRange = ref('all')
const searchQuery = ref('')

// Computed
const activeOrders = computed(() => {
  return orders.value.filter(order => 
    !['DELIVERED', 'CANCELLED', 'REFUNDED'].includes(order.status)
  )
})

const filteredOrders = computed(() => {
  let filtered = [...orders.value]

  // Status filter
  if (selectedStatus.value) {
    filtered = filtered.filter(order => order.status === selectedStatus.value)
  }

  // Date range filter
  if (selectedDateRange.value !== 'all') {
    const now = new Date()
    const ranges = {
      'last7days': 7,
      'last30days': 30,
      'last3months': 90
    }
    const days = ranges[selectedDateRange.value]
    const cutoffDate = new Date(now.setDate(now.getDate() - days))

    filtered = filtered.filter(order => new Date(order.createdAt) >= cutoffDate)
  }

  // Search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(order => 
      order.orderNumber.toLowerCase().includes(query)
    )
  }

  return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})

// Methods
const showOrderDetail = (order) => {
  selectedOrder.value = order
  isDetailModalOpen.value = true
}

const handlePageChange = async (page) => {
  orderStore.pagination.page = page
  await orderStore.fetchUserOrders()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(price)
}

const getStatusText = (status) => {
  const statusTexts = {
    'CREATED': 'Oluşturuldu',
    'PENDING_PAYMENT': 'Ödeme Bekliyor',
    'PAYMENT_COMPLETED': 'Ödeme Tamamlandı',
    'PROCESSING': 'Hazırlanıyor',
    'SHIPPED': 'Kargoya Verildi',
    'DELIVERED': 'Teslim Edildi',
    'CANCELLED': 'İptal Edildi',
    'REFUNDED': 'İade Edildi'
  }
  return statusTexts[status] || status
}

// Lifecycle
onMounted(async () => {
  await orderStore.fetchUserOrders()
})
</script>
