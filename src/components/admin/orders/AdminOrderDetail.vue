<template>
  <div v-if="!order" class="flex items-center justify-center min-h-[500px]">
    <div class="flex flex-col items-center gap-3">
      <Loader2 class="w-10 h-10 animate-spin text-primary-600" />
      <p class="text-sm text-gray-500">Sipariş bilgileri yükleniyor...</p>
    </div>
  </div>
  
  <div v-else class="max-w-[1400px] mx-auto">
    <!-- Header -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
      <div class="border-b border-gray-100">
        <div class="px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center">
              <Package class="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p class="text-sm text-gray-500 mb-1">Sipariş No</p>
              <h2 class="text-lg font-semibold text-gray-900">
                #{{ order?.orderNumber }}
              </h2>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <span
              :class="getStatusClass(order?.status)"
              class="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium gap-2"
            >
              <Circle class="w-2 h-2" :class="order?.status === 'DELIVERED' ? 'fill-current' : ''" />
              {{ formatStatus(order?.status) }}
            </span>
            <Menu as="div" class="relative">
              <MenuButton
                class="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors border border-gray-100"
              >
                <MoreVertical class="h-5 w-5" />
              </MenuButton>
              <transition
                enter-active-class="transition ease-out duration-100"
                enter-from-class="transform opacity-0 scale-95"
                enter-to-class="transform opacity-100 scale-100"
                leave-active-class="transition ease-in duration-75"
                leave-from-class="transform opacity-100 scale-100"
                leave-to-class="transform opacity-0 scale-95"
              >
                <MenuItems
                  class="absolute right-0 mt-2 w-48 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none divide-y divide-gray-100"
                >
                  <div class="py-1">
                    <MenuItem v-slot="{ active }">
                      <button
                        @click="printOrder"
                        :class="[
                          active ? 'bg-gray-50' : '',
                          'flex w-full items-center px-4 py-2.5 text-sm text-gray-700 transition-colors'
                        ]"
                      >
                        <Printer class="mr-3 h-4 w-4" />
                        Yazdır
                      </button>
                    </MenuItem>
                    <MenuItem v-slot="{ active }">
                      <button
                        @click="exportOrder"
                        :class="[
                          active ? 'bg-gray-50' : '',
                          'flex w-full items-center px-4 py-2.5 text-sm text-gray-700 transition-colors'
                        ]"
                      >
                        <Download class="mr-3 h-4 w-4" />
                        Dışa Aktar
                      </button>
                    </MenuItem>
                  </div>
                </MenuItems>
              </transition>
            </Menu>
          </div>
        </div>
      </div>
    </div>

    <!-- Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Sol Kolon: Sipariş Bilgileri -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Müşteri Bilgileri -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="px-6 py-4 bg-gray-50 border-b border-gray-100">
            <div class="flex items-center gap-2">
              <User class="w-4 h-4 text-gray-400" />
              <h3 class="text-sm font-medium text-gray-700">Müşteri Bilgileri</h3>
            </div>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="space-y-1.5">
                  <p class="text-sm text-gray-500">Ad Soyad</p>
                  <p class="font-medium text-gray-900">{{ order?.shippingAddress?.fullName }}</p>
                </div>
              </div>
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="space-y-1.5">
                  <p class="text-sm text-gray-500">E-posta</p>
                  <p class="font-medium text-gray-900">{{ order?.user?.email }}</p>
                </div>
              </div>
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="space-y-1.5">
                  <p class="text-sm text-gray-500">Telefon</p>
                  <p class="font-medium text-gray-900">{{ order?.shippingAddress?.phone }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Teslimat Bilgileri -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="px-6 py-4 bg-gray-50 border-b border-gray-100">
            <div class="flex items-center gap-2">
              <MapPin class="w-4 h-4 text-gray-400" />
              <h3 class="text-sm font-medium text-gray-700">Teslimat Adresi</h3>
            </div>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="bg-gray-50 rounded-lg p-4 space-y-4">
                <div class="space-y-1.5">
                  <p class="text-sm text-gray-500">Adres Başlığı</p>
                  <p class="font-medium text-gray-900">{{ order?.shippingAddress?.title }}</p>
                </div>
                <div class="space-y-1.5">
                  <p class="text-sm text-gray-500">Açık Adres</p>
                  <p class="font-medium text-gray-900">{{ order?.shippingAddress?.fullAddress }}</p>
                </div>
              </div>
              <div class="bg-gray-50 rounded-lg p-4 space-y-4">
                <div class="space-y-1.5">
                  <p class="text-sm text-gray-500">Mahalle</p>
                  <p class="font-medium text-gray-900">{{ order?.shippingAddress?.neighborhood }}</p>
                </div>
                <div class="space-y-1.5">
                  <p class="text-sm text-gray-500">İlçe / Şehir</p>
                  <p class="font-medium text-gray-900">{{ order?.shippingAddress?.district }} / {{ order?.shippingAddress?.city }}</p>
                </div>
                <div class="space-y-1.5">
                  <p class="text-sm text-gray-500">Posta Kodu</p>
                  <p class="font-medium text-gray-900">{{ order?.shippingAddress?.zipCode }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Ürün Listesi -->
        <div>
          <h3 class="text-sm font-medium text-gray-500 mb-4">Sipariş Edilen Ürünler</h3>
          <div class="bg-gray-50 rounded-lg overflow-hidden">
            <ul role="list" class="divide-y divide-gray-200">
              <li v-for="item in orderItems" :key="item.id" class="p-4">
                <div class="flex items-center space-x-4">
                  <div class="flex-shrink-0">
                    <img
                      :src="item.image"
                      :alt="item.name"
                      class="h-16 w-16 rounded-lg object-cover"
                    />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">
                      {{ item.name }}
                    </p>
                    <p class="text-sm text-gray-500">
                      {{ item.sku }}
                    </p>
                    <p class="text-sm text-gray-500">
                      Miktar: {{ item.quantity }}
                    </p>
                  </div>
                  <div class="flex-shrink-0 text-right">
                    <p class="text-sm font-medium text-gray-900">
                      {{ formatPrice(item.price) }}
                    </p>
                    <p class="text-sm text-gray-500">
                      Toplam: {{ formatPrice(item.total) }}
                    </p>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Sağ Kolon -->
      <div class="space-y-6">
        <!-- Fiyat Özeti -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="px-6 py-4 bg-gray-50 border-b border-gray-100">
            <div class="flex items-center gap-2">
              <Receipt class="w-4 h-4 text-gray-400" />
              <h3 class="text-sm font-medium text-gray-700">Fiyat Özeti</h3>
            </div>
          </div>
          <div class="p-6">
            <div class="space-y-4">
              <!-- Ürünler -->
              <div class="space-y-3">
                <div v-for="item in order?.items" :key="item._id" 
                  class="flex items-start justify-between py-3 px-4 rounded-lg bg-gray-50">
                  <div class="space-y-1">
                    <p class="text-sm font-medium text-gray-900">{{ item.product.name }}</p>
                    <p class="text-sm text-gray-500">{{ item.quantity }} {{ item.unit }} x ₺{{ item.price.toFixed(2) }}</p>
                  </div>
                  <p class="font-medium text-gray-900">₺{{ (item.price * item.quantity).toFixed(2) }}</p>
                </div>
              </div>
              
              <!-- Toplam -->
              <div class="pt-4 border-t border-gray-100">
                <div class="flex justify-between items-center px-4 py-3 bg-primary-50 rounded-lg">
                  <span class="text-base font-semibold text-gray-900">Toplam</span>
                  <span class="text-lg font-bold text-primary-600">₺{{ order?.totalAmount.toFixed(2) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Durum Güncelleme -->
        <div>
          <h3 class="text-sm font-medium text-gray-500 mb-4">Sipariş Durumu</h3>
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="space-y-4">
              <!-- Mevcut durum gösterimi -->
              <div class="flex items-center space-x-2">
                <span class="text-sm text-gray-500">Mevcut Durum:</span>
                <span
                  :class="getStatusClass(order?.status)"
                  class="px-3 py-1 rounded-full text-sm font-medium"
                >
                  {{ formatStatus(order?.status) }}
                </span>
              </div>

              <!-- Sadece değiştirilebilir durumlar için seçici -->
              <div v-if="canUpdateStatus">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Yeni Durum
                </label>
                <select
                  v-model="selectedStatus"
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  :disabled="updating"
                >
                  <option
                    v-for="status in orderStore.orderStatuses"
                    :key="status"
                    :value="status"
                    :disabled="status === order?.status"
                  >
                    {{ formatStatus(status) }}
                  </option>
                </select>

                <!-- Not ekleme alanı -->
                <div class="mt-4" v-if="statusChanged">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Durum Değişikliği Notu
                  </label>
                  <textarea
                    v-model="statusNote"
                    rows="2"
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="Durum değişikliği için not ekleyin (opsiyonel)"
                  ></textarea>
                </div>

                <!-- Güncelleme butonu -->
                <button
                  v-if="statusChanged"
                  @click="updateOrderStatus"
                  :disabled="updating"
                  class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Loader2 v-if="updating" class="animate-spin -ml-1 mr-2 h-4 w-4" />
                  {{ updating ? 'Güncelleniyor...' : 'Durumu Güncelle' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Kargo Bilgileri -->
        <div>
          <h3 class="text-sm font-medium text-gray-500 mb-4">Kargo Bilgileri</h3>
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">
                  Kargo Firması
                </label>
                <select
                  v-model="shippingDetails.company"
                  class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                >
                  <option value="">Seçiniz</option>
                  <option value="ARAS">Aras Kargo</option>
                  <option value="YK">Yurtiçi Kargo</option>
                  <option value="MNG">MNG Kargo</option>
                  <option value="PTT">PTT Kargo</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">
                  Takip Numarası
                </label>
                <input
                  type="text"
                  v-model="shippingDetails.trackingNumber"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
              <button
                @click="updateShippingDetails"
                class="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                :disabled="!shippingChanged || updating"
              >
                <Loader2 v-if="updating" class="animate-spin -ml-1 mr-2 h-4 w-4" />
                {{ updating ? 'Güncelleniyor...' : 'Kargo Bilgilerini Güncelle' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Zaman Çizelgesi -->
        <div>
          <h3 class="text-sm font-medium text-gray-500 mb-4">Sipariş Geçmişi</h3>
          <div class="bg-gray-50 rounded-lg p-4">
            <ol class="relative border-l border-gray-200 ml-3 space-y-4">
              <li v-for="(event, index) in timeline" :key="index" class="ml-6">
                <span
                  class="absolute flex items-center justify-center w-6 h-6 bg-primary-100 rounded-full -left-3 ring-8 ring-white"
                >
                  <component
                    :is="getTimelineIcon(event.icon)"
                    class="h-5 w-5"
                    :class="[event.iconBackground]"
                  />
                </span>
                <div class="flex flex-col">
                  <h3 class="text-sm font-medium text-gray-900">
                    {{ event.title }}
                  </h3>
                  <time class="text-xs text-gray-500">
                    {{ formatDate(event.date) }}
                  </time>
                  <p v-if="event.description" class="text-sm text-gray-500 mt-1">
                    {{ event.description }}
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import { 
  MoreVertical, 
  Printer, 
  Download, 
  Loader2,
  Truck,
  CheckCircle,
  XCircle,
  ShoppingCart,
  CreditCard,
  Package,
  User,
  MapPin,
  Receipt,
  Circle
} from 'lucide-vue-next'
import { useOrderStore } from '@/stores/orderStore'
import { storeToRefs } from 'pinia'
import { formatDate, formatPrice } from '@/utils/dateUtils'

const props = defineProps({
  orderId: {
    type: String,
    required: true
  }
})

// Store
const orderStore = useOrderStore()
const { currentOrder: order, loading, error, orderStatuses } = storeToRefs(orderStore)

// Load order data
onMounted(async () => {
  try {
    await orderStore.fetchOrder(props.orderId)
  } catch (error) {
    console.error('Sipariş yüklenirken hata oluştu:', error)
  }
})

// Local state
const updating = ref(false)
const selectedStatus = ref(order?.value?.status || 'CREATED')
const shippingDetails = ref({
  company: '',
  trackingNumber: ''
})
const statusNote = ref('')

// Computed
const statusChanged = computed(() => {
  if (!order.value || !selectedStatus.value) return false;
  return selectedStatus.value !== order.value.status
})

const orderItems = computed(() => {
  if (!order.value?.items) return [];
  return order.value.items.map(item => ({
    id: item._id,
    name: item.product.name,
    sku: item.product.sku,
    quantity: item.quantity,
    unit: item.unit,
    price: item.price,
    total: item.price * item.quantity,
    image: item.product.images?.[0]?.url
  }))
})

const timeline = computed(() => {
  if (!order.value?.statusHistory) return [];
  const events = []

  // Sipariş oluşturuldu
  events.push({
    title: 'Sipariş oluşturuldu',
    date: order.value.createdAt,
    icon: 'ShoppingCart'
  })

  // Ödeme durumu
  if (order.value.paymentDetails?.status === 'COMPLETED') {
    events.push({
      title: 'Ödeme alındı',
      date: order.value.updatedAt,
      icon: 'CreditCard'
    })
  }

  // Diğer durumlar için statusHistory'den al
  order.value.statusHistory?.forEach(history => {
    switch (history.status) {
      case 'PROCESSING':
        events.push({
          title: 'Sipariş hazırlanıyor',
          date: history.timestamp,
          icon: 'Package'
        })
        break
      case 'SHIPPED':
        events.push({
          title: 'Kargoya verildi',
          date: history.timestamp,
          description: order.value.shipping ? `${order.value.shipping.company} - ${order.value.shipping.trackingNumber}` : '',
          icon: 'Truck'
        })
        break
      case 'DELIVERED':
        events.push({
          title: 'Teslim edildi',
          date: history.timestamp,
          icon: 'CheckCircle'
        })
        break
      case 'CANCELLED':
        events.push({
          title: 'İptal edildi',
          date: history.timestamp,
          description: order.value.cancelReason,
          icon: 'XCircle'
        })
        break
    }
  })

  return events.sort((a, b) => new Date(b.date) - new Date(a.date))
})

const canUpdateStatus = computed(() => {
  if (!order.value) return false;
  
  // Sadece iptal edilmiş veya teslim edilmiş siparişlerin durumu değiştirilemesin
  return !['CANCELLED', 'DELIVERED'].includes(order.value.status);
})

const shippingChanged = computed(() => {
  if (!order.value?.shipping) return false;
  return (
    shippingDetails.value.company !== (order.value.shipping.company || '') ||
    shippingDetails.value.trackingNumber !== (order.value.shipping.trackingNumber || '')
  )
})

// Methods
const updateOrderStatus = async () => {
  if (!statusChanged.value) return

  updating.value = true
  try {
    await orderStore.updateOrderStatus(
      props.orderId,
      selectedStatus.value,
      statusNote.value // Yeni not alanı
    )
    
    // Başarılı güncelleme sonrası notu temizle
    statusNote.value = ''
  } catch (error) {
    console.error('Durum güncellenirken hata oluştu:', error)
  } finally {
    updating.value = false
  }
}

const updateShippingDetails = async () => {
  if (!shippingChanged.value) return

  updating.value = true
  try {
    await orderStore.updateOrderDetails(props.orderId, {
      shipping: {
        company: shippingDetails.value.company,
        trackingNumber: shippingDetails.value.trackingNumber
      }
    })
  } catch (error) {
    console.error('Kargo bilgileri güncellenirken hata oluştu:', error)
  } finally {
    updating.value = false
  }
}

const printOrder = () => {
  window.print()
}

const exportOrder = () => {
  const orderData = {
    orderNumber: order.value?.orderNumber,
    customer: order.value?.user?.email,
    status: order.value?.status,
    items: orderItems.value,
    total: order.value?.totalAmount,
    createdAt: order.value?.createdAt
  }
  
  const blob = new Blob([JSON.stringify(orderData, null, 2)], { type: 'application/json' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `order-${order.value?.orderNumber}.json`
  a.click()
  window.URL.revokeObjectURL(url)
}

const formatStatus = (status) => {
  const statusMap = {
    'CREATED': 'Oluşturuldu',
    'PENDING_PAYMENT': 'Ödeme Bekliyor',
    'PAYMENT_COMPLETED': 'Ödeme Alındı',
    'PROCESSING': 'Hazırlanıyor',
    'SHIPPED': 'Kargoya Verildi',
    'DELIVERED': 'Teslim Edildi',
    'CANCELLED': 'İptal Edildi',
    'PAYMENT_FAILED': 'Ödeme Başarısız',
    'REFUNDED': 'İade Edildi'
  }
  return statusMap[status] || status
}

const getStatusClass = (status) => {
  const statusClasses = {
    'CREATED': 'bg-gray-100 text-gray-800',
    'PENDING_PAYMENT': 'bg-yellow-100 text-yellow-800',
    'PAYMENT_COMPLETED': 'bg-green-100 text-green-800',
    'PROCESSING': 'bg-blue-100 text-blue-800',
    'SHIPPED': 'bg-indigo-100 text-indigo-800',
    'DELIVERED': 'bg-green-100 text-green-800',
    'CANCELLED': 'bg-red-100 text-red-800',
    'PAYMENT_FAILED': 'bg-red-100 text-red-800',
    'REFUNDED': 'bg-orange-100 text-orange-800'
  }
  return statusClasses[status] || 'bg-gray-100 text-gray-800'
}

const getTimelineIcon = (iconName) => {
  const iconMap = {
    'ShoppingCart': ShoppingCart,
    'CreditCard': CreditCard,
    'Package': Package,
    'Truck': Truck,
    'CheckCircle': CheckCircle,
    'XCircle': XCircle
  }
  return iconMap[iconName] || ShoppingCart
}

// Watch orderId changes
watch(
  () => props.orderId,
  (newOrderId) => {
    if (newOrderId) {
      orderStore.fetchOrder(newOrderId)
    }
  }
)

// Watch order changes
watch(
  () => order.value,
  (newOrder) => {
    if (newOrder) {
      selectedStatus.value = newOrder.status
      shippingDetails.value = {
        company: newOrder.shipping?.company || '',
        trackingNumber: newOrder.shipping?.trackingNumber || ''
      }
    }
  },
  { immediate: true }
)

// Watch order status changes to update selectedStatus
watch(
  () => order.value?.status,
  (newStatus) => {
    if (newStatus) {
      selectedStatus.value = newStatus
    }
  },
  { immediate: true }
)
</script>
