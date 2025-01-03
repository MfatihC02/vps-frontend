<!-- OrderDetail.vue -->
<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" class="relative z-50" @close="closeModal">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/25" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel class="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
              <!-- Header -->
              <div class="flex justify-between items-start mb-6">
                <div>
                  <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900">
                    Sipariş Detayı
                  </DialogTitle>
                  <p class="mt-1 text-sm text-gray-500">
                    Sipariş No: {{ formatOrderNumber(order.orderNumber) }}
                  </p>
                </div>
                <button
                  type="button"
                  class="rounded-md bg-white text-gray-400 hover:text-gray-500"
                  @click="closeModal"
                >
                  <span class="sr-only">Kapat</span>
                  <X class="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              <!-- Content -->
              <div class="space-y-6">
                <!-- Sipariş Durumu -->
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="text-sm text-gray-500">Sipariş Durumu:</span>
                    <span :class="getStatusClass(order.status)" class="px-3 py-1 rounded-full text-sm font-medium">
                      {{ getStatusText(order.status) }}
                    </span>
                  </div>
                  <div class="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar class="w-4 h-4" />
                    <span>{{ formatDate(order.createdAt) }}</span>
                  </div>
                </div>

                <!-- Ürünler -->
                <div class="space-y-4">
                  <h4 class="font-medium text-gray-900">Ürünler</h4>
                  <div class="divide-y divide-gray-200">
                    <div v-for="item in order.items" :key="item._id" class="py-4 flex gap-4">
                      <div class="flex-1">
                        <h5 class="font-medium text-gray-900">{{ item.product.name }}</h5>
                        <div class="mt-1 flex items-center gap-2 text-sm text-gray-600">
                          <span>{{ item.quantity }} {{ item.unit }}</span>
                          <span>×</span>
                          <span>{{ formatPrice(item.price) }}</span>
                        </div>
                      </div>
                      <div class="text-right">
                        <div class="font-medium text-gray-900">
                          {{ formatPrice(item.price * item.quantity) }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Toplam -->
                <div class="border-t border-gray-200 pt-4">
                  <div class="flex justify-between items-center">
                    <span class="font-medium text-gray-900">Toplam Tutar</span>
                    <span class="font-medium text-xl text-green-600">
                      {{ formatPrice(order.totalAmount) }}
                    </span>
                  </div>
                </div>

                <!-- Teslimat Adresi -->
                <div v-if="order.shippingAddress">
                  <h4 class="font-medium text-gray-900 mb-2">Teslimat Adresi</h4>
                  <div class="text-sm text-gray-600">
                    {{ formatAddress(order.shippingAddress) }}
                  </div>
                </div>

                <!-- Sipariş Geçmişi -->
                <div>
                  <h4 class="font-medium text-gray-900 mb-2">Sipariş Geçmişi</h4>
                  <div class="space-y-3">
                    <div
                      v-for="(history, index) in order.statusHistory"
                      :key="index"
                      class="flex items-center gap-3 text-sm"
                    >
                      <div class="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                        <div class="w-2 h-2 rounded-full bg-green-600"></div>
                      </div>
                      <div class="flex-1">
                        <div class="font-medium text-gray-900">
                          {{ getStatusText(history.status) }}
                        </div>
                        <div class="text-gray-500">
                          {{ formatDate(history.timestamp) }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { X, Calendar } from 'lucide-vue-next'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  order: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:isOpen'])

const closeModal = () => {
  emit('update:isOpen', false)
}

// Sipariş numarasını formatla
const formatOrderNumber = (orderNumber) => {
  return orderNumber.split('-')[0]
}

// Fiyat formatla
const formatPrice = (price) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(price)
}

// Tarih formatla
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Durum sınıflarını getir
const getStatusClass = (status) => {
  const statusClasses = {
    'CREATED': 'bg-blue-100 text-blue-800',
    'PENDING_PAYMENT': 'bg-yellow-100 text-yellow-800',
    'PAYMENT_COMPLETED': 'bg-green-100 text-green-800',
    'PROCESSING': 'bg-purple-100 text-purple-800',
    'SHIPPED': 'bg-indigo-100 text-indigo-800',
    'DELIVERED': 'bg-green-100 text-green-800',
    'CANCELLED': 'bg-red-100 text-red-800'
  }
  return statusClasses[status] || 'bg-gray-100 text-gray-800'
}

// Durum metinlerini getir
const getStatusText = (status) => {
  const statusTexts = {
    'CREATED': 'Oluşturuldu',
    'PENDING_PAYMENT': 'Ödeme Bekliyor',
    'PAYMENT_COMPLETED': 'Ödeme Tamamlandı',
    'PROCESSING': 'Hazırlanıyor',
    'SHIPPED': 'Kargoya Verildi',
    'DELIVERED': 'Teslim Edildi',
    'CANCELLED': 'İptal Edildi'
  }
  return statusTexts[status] || status
}

// Adres formatla (örnek)
const formatAddress = (address) => {
  // Burada adres formatlaması yapılacak
  return address
}
</script>
