<!-- PaymentSummary.vue -->
<template>
  <div class="divide-y divide-gray-200">
    <!-- Adres Bilgileri -->
    <div class="p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-medium text-gray-900">Teslimat Adresi</h3>
        <button
          @click="$router.push('/user/address')"
          class="text-sm font-medium text-[#10B981] hover:text-[#059669] transition-colors"
        >
          Değiştir
        </button>
      </div>
      
      <div v-if="address" class="flex space-x-3">
        <MapPinIcon class="h-5 w-5 text-gray-400 flex-shrink-0" />
        <div class="text-sm text-gray-600">
          <p class="font-medium text-gray-900">{{ address.title }}</p>
          <p>{{ address.fullAddress }}</p>
          <p>{{ address.city }}, {{ address.country }}</p>
          <p>{{ address.postCode }}</p>
        </div>
      </div>
      
      <div v-else class="text-sm text-gray-500">
        Lütfen bir teslimat adresi seçin
      </div>
    </div>

    <!-- Sipariş Özeti -->
    <div class="p-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Sipariş Özeti</h3>
      
      <!-- Ürün Listesi -->
      <div class="space-y-4 mb-6">
        <div v-for="item in cart?.items" :key="item._id" class="flex items-center space-x-4">
          <!-- Ürün Görseli -->
          <div class="relative h-16 w-16 rounded-lg overflow-hidden bg-gray-100">
            <img
              :src="item.product.images[0]"
              :alt="item.product.name"
              class="h-full w-full object-cover"
            />
            <div class="absolute top-0 right-0 bg-[#10B981] text-white text-xs px-1.5 py-0.5 rounded-bl">
              {{ item.quantity }}
            </div>
          </div>
          
          <!-- Ürün Detayları -->
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">
              {{ item.product.name }}
            </p>
            <p class="text-sm text-gray-500">
              {{ formatPrice(item.product.price) }} × {{ item.quantity }}
            </p>
          </div>
          
          <!-- Toplam Fiyat -->
          <div class="text-sm font-medium text-gray-900">
            {{ formatPrice(item.product.price * item.quantity) }}
          </div>
        </div>
      </div>

      <!-- Fiyat Detayları -->
      <div class="space-y-3 text-sm">
        <div class="flex justify-between">
          <span class="text-gray-600">Ara Toplam</span>
          <span class="font-medium text-gray-900">{{ formatPrice(subtotal) }}</span>
        </div>
        
        <div class="flex justify-between">
          <span class="text-gray-600">Kargo</span>
          <span class="font-medium text-gray-900">{{ formatPrice(shippingCost) }}</span>
        </div>

        <div v-if="discount > 0" class="flex justify-between text-[#10B981]">
          <span>İndirim</span>
          <span>-{{ formatPrice(discount) }}</span>
        </div>

        <div class="pt-3 flex justify-between border-t border-gray-200">
          <span class="text-base font-medium text-gray-900">Toplam</span>
          <span class="text-base font-medium text-gray-900">{{ formatPrice(total) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { MapPinIcon } from 'lucide-vue-next'

// Props
const props = defineProps({
  cart: {
    type: Object,
    required: true
  },
  address: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const router = useRouter()

// Computed
const subtotal = computed(() => {
  if (!props.cart?.items) return 0
  return props.cart.items.reduce((sum, item) => {
    return sum + (item.product.price * item.quantity)
  }, 0)
})

const shippingCost = computed(() => {
  // Kargo ücreti hesaplama mantığı
  return subtotal.value > 1000 ? 0 : 29.90
})

const discount = computed(() => {
  // İndirim hesaplama mantığı
  return props.cart?.discount || 0
})

const total = computed(() => {
  return subtotal.value + shippingCost.value - discount.value
})

// Methods
const formatPrice = (price) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(price)
}
</script>
