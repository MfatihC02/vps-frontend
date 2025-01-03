<!-- PaymentStatus.vue -->
<template>
  <div class="space-y-6">
    <!-- Status Icon -->
    <div class="flex justify-center">
      <div 
        class="w-16 h-16 rounded-full flex items-center justify-center"
        :class="statusConfig.containerClass"
      >
        <component
          :is="statusConfig.icon"
          class="w-8 h-8"
          :class="statusConfig.iconClass"
        />
      </div>
    </div>

    <!-- Status Message -->
    <div class="text-center">
      <h3 class="text-lg font-medium" :class="statusConfig.textClass">
        {{ statusConfig.title }}
      </h3>
      <p class="mt-2 text-sm text-gray-600">
        {{ statusConfig.message }}
      </p>
    </div>

    <!-- 3D Secure Frame -->
    <div v-if="status === 'REDIRECTING'" class="relative">
      <!-- Loading Overlay -->
      <div 
        v-if="loading"
        class="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10"
      >
        <LoaderIcon class="w-8 h-8 text-[#10B981] animate-spin" />
      </div>

      <!-- 3D Secure iframe -->
      <iframe
        v-if="redirectUrl"
        :src="redirectUrl"
        class="w-full h-[400px] border-2 border-gray-200 rounded-lg"
        @load="handleIframeLoad"
      ></iframe>
    </div>

    <!-- Error Details -->
    <div v-if="error" class="bg-red-50 p-4 rounded-lg">
      <div class="flex">
        <AlertCircleIcon class="h-5 w-5 text-red-400" />
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">
            Hata Detayı
          </h3>
          <div class="mt-2 text-sm text-red-700">
            <p>{{ error }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex justify-center space-x-4">
      <!-- Retry Button -->
      <button
        v-if="status === 'ERROR'"
        @click="$router.go(0)"
        class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#10B981] hover:bg-[#059669] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#10B981]"
      >
        <RefreshCwIcon class="h-4 w-4 mr-2" />
        Tekrar Dene
      </button>

      <!-- Cancel Button -->
      <button
        v-if="['PROCESSING', 'REDIRECTING'].includes(status)"
        @click="handleCancel"
        class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#10B981]"
      >
        <XIcon class="h-4 w-4 mr-2" />
        İptal Et
      </button>

      <!-- Continue Shopping -->
      <button
        v-if="status === 'SUCCESS'"
        @click="$router.push('/')"
        class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#10B981] hover:bg-[#059669] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#10B981]"
      >
        <ShoppingBagIcon class="h-4 w-4 mr-2" />
        Alışverişe Devam Et
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  LoaderIcon, AlertCircleIcon, CheckCircleIcon, 
  XCircleIcon, RefreshCwIcon, XIcon, ShoppingBagIcon 
} from 'lucide-vue-next'
import { usePaymentStore } from '@/stores/paymentStore'

// Props
const props = defineProps({
  status: {
    type: String,
    required: true,
    validator: (value) => {
      return ['PROCESSING', 'REDIRECTING', 'SUCCESS', 'ERROR'].includes(value)
    }
  },
  redirectUrl: {
    type: String,
    default: null
  },
  error: {
    type: String,
    default: null
  }
})

// Setup
const router = useRouter()
const paymentStore = usePaymentStore()
const loading = ref(true)

// Status configurations
const statusConfig = computed(() => {
  const configs = {
    PROCESSING: {
      icon: LoaderIcon,
      iconClass: 'text-[#10B981] animate-spin',
      containerClass: 'bg-[#10B981]/10',
      textClass: 'text-[#10B981]',
      title: 'Ödeme İşleniyor',
      message: 'Lütfen bekleyin, ödemeniz işleniyor...'
    },
    REDIRECTING: {
      icon: LoaderIcon,
      iconClass: 'text-[#10B981] animate-spin',
      containerClass: 'bg-[#10B981]/10',
      textClass: 'text-[#10B981]',
      title: '3D Secure Doğrulama',
      message: 'Bankanızın güvenli ödeme sayfasına yönlendiriliyorsunuz...'
    },
    SUCCESS: {
      icon: CheckCircleIcon,
      iconClass: 'text-[#10B981]',
      containerClass: 'bg-[#10B981]/10',
      textClass: 'text-[#10B981]',
      title: 'Ödeme Başarılı',
      message: 'Siparişiniz başarıyla oluşturuldu.'
    },
    ERROR: {
      icon: XCircleIcon,
      iconClass: 'text-red-600',
      containerClass: 'bg-red-100',
      textClass: 'text-red-600',
      title: 'Ödeme Başarısız',
      message: 'Ödeme işlemi sırasında bir hata oluştu.'
    }
  }

  return configs[props.status]
})

// Methods
const handleIframeLoad = () => {
  loading.value = false
}

const handleCancel = async () => {
  try {
    await paymentStore.cancelPayment()
    router.go(0) // Sayfayı yenile
  } catch (error) {
    console.error('Ödeme iptali sırasında hata:', error)
  }
}
</script>
