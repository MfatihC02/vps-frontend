<!-- PaymentForm.vue -->
<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Kart Numarası -->
    <div class="space-y-1">
      <label for="cardNumber" class="block text-sm font-medium text-gray-700">
        Kart Numarası
      </label>
      <div class="relative">
        <input
          id="cardNumber"
          v-model="formData.cardNumber"
          type="text"
          :maxlength="19"
          @input="formatCardNumber"
          placeholder="0000 0000 0000 0000"
          class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981] transition-colors"
          :class="{ 'border-red-300': v$.cardNumber.$error }"
        />
        <!-- Kart Tipi İkonu -->
        <div class="absolute inset-y-0 right-0 flex items-center pr-3">
          <CreditCardIcon v-if="!cardType" class="h-5 w-5 text-gray-400" />
          <img 
            v-else
            :src="getCardTypeIcon"
            :alt="cardType"
            class="h-6"
          />
        </div>
      </div>
      <p v-if="v$.cardNumber.$error" class="text-sm text-red-600">
        {{ v$.cardNumber.$errors[0].$message }}
      </p>
    </div>

    <!-- Kart Sahibi -->
    <div class="space-y-1">
      <label for="cardHolderName" class="block text-sm font-medium text-gray-700">
        Kart Sahibi
      </label>
      <input
        id="cardHolderName"
        v-model="formData.cardHolderName"
        type="text"
        placeholder="Kart üzerindeki isim"
        class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981] transition-colors uppercase"
        :class="{ 'border-red-300': v$.cardHolderName.$error }"
      />
      <p v-if="v$.cardHolderName.$error" class="text-sm text-red-600">
        {{ v$.cardHolderName.$errors[0].$message }}
      </p>
    </div>

    <!-- Son Kullanma Tarihi ve CVV -->
    <div class="grid grid-cols-2 gap-4">
      <!-- Son Kullanma Tarihi -->
      <div class="space-y-1">
        <label for="expiryDate" class="block text-sm font-medium text-gray-700">
          Son Kullanma Tarihi
        </label>
        <input
          id="expiryDate"
          v-model="formData.expiryDate"
          type="text"
          placeholder="AA/YY"
          maxlength="5"
          @input="formatExpiryDate"
          class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981] transition-colors"
          :class="{ 'border-red-300': v$.expiryMonth.$error || v$.expiryYear.$error }"
        />
        <p v-if="v$.expiryMonth.$error || v$.expiryYear.$error" class="text-sm text-red-600">
          Geçerli bir son kullanma tarihi girin
        </p>
      </div>

      <!-- CVV -->
      <div class="space-y-1">
        <label for="cvv" class="block text-sm font-medium text-gray-700">
          CVV
          <span 
            class="ml-1 inline-block" 
            @mouseenter="showCvvTooltip = true"
            @mouseleave="showCvvTooltip = false"
          >
            <HelpCircleIcon class="h-4 w-4 text-gray-400 inline" />
          </span>
        </label>
        <div class="relative">
          <input
            id="cvv"
            v-model="formData.cvv"
            type="text"
            placeholder="000"
            maxlength="3"
            class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981] transition-colors"
            :class="{ 'border-red-300': v$.cvv.$error }"
          />
          <!-- CVV Tooltip -->
          <div
            v-if="showCvvTooltip"
            class="absolute z-10 -top-2 right-0 transform translate-y-[-100%] w-48 p-2 bg-gray-900 text-white text-xs rounded shadow-lg"
          >
            Kartınızın arkasındaki 3 haneli güvenlik kodu
          </div>
        </div>
        <p v-if="v$.cvv.$error" class="text-sm text-red-600">
          {{ v$.cvv.$errors[0].$message }}
        </p>
      </div>
    </div>

    <!-- Kart Tipi -->
    <div class="space-y-1">
      <label class="block text-sm font-medium text-gray-700">Kart Tipi</label>
      <div class="grid grid-cols-3 gap-4">
        <button
          v-for="type in cardTypes"
          :key="type.value"
          type="button"
          @click="selectCardType(type.value)"
          class="flex items-center justify-center p-3 border rounded-lg transition-all"
          :class="[
            formData.cardType === type.value
              ? 'border-[#10B981] bg-[#10B981]/10'
              : 'border-gray-200 hover:border-[#10B981]'
          ]"
        >
          <img :src="type.icon" :alt="type.value" class="h-6" />
        </button>
      </div>
      <p v-if="v$.cardType.$error" class="text-sm text-red-600">
        {{ v$.cardType.$errors[0].$message }}
      </p>
    </div>

    <!-- Submit Button -->
    <button
      type="submit"
      :disabled="loading"
      class="w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-[#10B981] hover:bg-[#059669] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#10B981] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <LoaderIcon v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
      {{ loading ? 'İşleminiz Yapılıyor...' : 'Ödeme Yap' }}
    </button>
  </form>
  <!-- 3D Secure Form (gizli) -->
  <form
    v-if="paymentStore.threeDSecureData.isProcessing"
    ref="threeDSecureForm"
    :action="paymentStore.threeDSecureData.formAction"
    method="POST"
    target="_self"
    class="hidden"
    @mounted="() => console.log('3D Secure Form Mounted:', {
      formElement: $refs.threeDSecureForm,
      action: paymentStore.threeDSecureData.formAction,
      hasInputs: Object.keys(paymentStore.threeDSecureData.formInputs || {}).length
    })"
  >
    <input
      v-for="(value, name) in paymentStore.threeDSecureData.formInputs"
      :key="name"
      type="hidden"
      :name="name"
      :value="value"
    />
    <button type="submit" ref="submitButton" style="display: none;">
      Submit
    </button>
  </form>

</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue'
import { useVuelidate } from '@vuelidate/core'
import { required, minLength, maxLength } from '@vuelidate/validators'
import { CreditCardIcon, HelpCircleIcon, LoaderIcon } from 'lucide-vue-next'
import { usePaymentStore } from '@/stores/paymentStore'
import { useUserStore } from '@/stores/userStore'
import { useAddressStore } from '@/stores/addressStore'

// Props
const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['submit'])

// Store instances
const paymentStore = usePaymentStore()
const userStore = useUserStore()
const addressStore = useAddressStore()
const threeDSecureForm = ref(null)
// Reactive state
const showCvvTooltip = ref(false)
const formData = reactive({
  cardNumber: '',
  cardHolderName: '',
  expiryDate: '',
  expiryMonth: '',
  expiryYear: '',
  cvv: '',
  cardType: ''
})

// Kart tipleri
const cardTypes = [
  { value: 'VISA', icon: '/images/visa.png' },
  { value: 'MASTERCARD', icon: '/images/mastercard.png' },
  { value: 'TROY', icon: '/images/troy.png' }
]

// Validation rules
const rules = {
  cardNumber: { 
    required,
    validCard: {
      $validator: (value) => {
        // Boşlukları kaldır
        const cardNumber = value.replace(/\s/g, '')
        console.log('Validating card:', {
          number: cardNumber,
          type: formData.cardType,
          length: cardNumber.length,
          luhn: validateLuhn(cardNumber)
        })
        
        // Kart numarası 16 haneli olmalı (boşluklar hariç)
        if (cardNumber.length !== 16) {
          return false
        }
        
        // Kart tipine göre başlangıç kontrolü
        const firstDigit = cardNumber[0]
        const firstTwoDigits = parseInt(cardNumber.substring(0, 2))
        
        let isValidPrefix = false
        
        switch(formData.cardType) {
          case 'VISA':
            isValidPrefix = firstDigit === '4'
            break
          case 'MASTERCARD':
            isValidPrefix = firstTwoDigits >= 51 && firstTwoDigits <= 55
            break
          case 'TROY':
            isValidPrefix = firstDigit === '9'
            break
        }
        
        if (!isValidPrefix) {
          return false
        }
        
        // Luhn algoritması kontrolü
        const isValidLuhn = validateLuhn(cardNumber)
        console.log('Luhn validation result:', isValidLuhn)
        return isValidLuhn
      },
      $message: () => {
        const cardNumber = formData.cardNumber.replace(/\s/g, '')
        if (cardNumber.length !== 16) {
          return 'Kart numarası 16 haneli olmalıdır'
        }
        if (!validateLuhn(cardNumber)) {
          return 'Geçersiz kart numarası'
        }
        return 'Kart numarası seçilen kart tipi ile uyuşmuyor'
      }
    }
  },
  cardHolderName: { 
    required,
    minLength: minLength(5)
  },
  expiryMonth: { 
    required,
    validMonth: (value) => {
      const month = parseInt(value)
      return month >= 1 && month <= 12
    }
  },
  expiryYear: { 
    required,
    validYear: (value) => {
      const currentYear = new Date().getFullYear() % 100
      const year = parseInt(value)
      return year >= currentYear && year <= currentYear + 10
    }
  },
  cvv: { 
    required,
    validCvv: (value) => /^\d{3}$/.test(value)
  },
  cardType: { required }
}

const v$ = useVuelidate(rules, formData)

// Computed
const cardType = computed(() => {
  const number = formData.cardNumber.replace(/\s/g, '')
  if (number.startsWith('4')) return 'VISA'
  if (/^5[1-5]/.test(number)) return 'MASTERCARD'
  if (/^9/.test(number)) return 'TROY'
  return null
})

const getCardTypeIcon = computed(() => {
  const type = cardTypes.find(t => t.value === cardType.value)
  return type ? type.icon : null
})

// Billing bilgileri için computed property
const billingInfo = computed(() => {
  const defaultAddress = addressStore.getDefaultAddress
  return {
    email: userStore.email,
    phone: defaultAddress?.phone,
    city: defaultAddress?.city,
    state: defaultAddress?.district,
    addressLine: defaultAddress?.addressLine,
    postCode: defaultAddress?.postCode
  }
})

// Loading state
const loading = ref(false)

// 3D Secure form kontrolü için yeni ref
const formSubmitAttempted = ref(false)

// Form submit kontrolü için yeni fonksiyon
const ensure3DSecureFormSubmit = async () => {
  if (!threeDSecureForm.value || formSubmitAttempted.value) return
  
  formSubmitAttempted.value = true
  console.log('3D Secure form submit başlatılıyor')
  
  await nextTick()
  
  try {
    if (threeDSecureForm.value) {
      console.log('Form özellikleri:', {
        action: threeDSecureForm.value.action,
        method: threeDSecureForm.value.method,
        inputCount: threeDSecureForm.value.querySelectorAll('input[type="hidden"]').length
      })
      threeDSecureForm.value.submit()
      console.log('Form submit başarılı')
    }
  } catch (error) {
    console.error('Form submit hatası:', error)
    formSubmitAttempted.value = false
  }
}

// 3D Secure durumunu izle
watch(
  () => paymentStore.threeDSecureData.isProcessing,
  async (isProcessing) => {
    if (isProcessing) {
      await nextTick()
      ensure3DSecureFormSubmit()
    } else {
      formSubmitAttempted.value = false
    }
  },
  { immediate: true }
)

// Methods
const formatCardNumber = (event) => {
  // Önce tüm boşlukları ve rakam olmayan karakterleri kaldır
  let value = event.target.value.replace(/\D/g, '')
  
  // Sadece ilk 16 karakteri al
  value = value.substring(0, 16)
  
  // Her 4 rakamdan sonra boşluk ekle (görsel amaçlı)
  value = value.replace(/(\d{4})/g, '$1 ').trim()
  
  formData.cardNumber = value
  
  // Otomatik kart tipi seçimi
  const detectedType = cardType.value
  console.log('Detected card type:', detectedType)
  
  if (detectedType) {
    formData.cardType = detectedType
    console.log('Updated card type:', formData.cardType)
  }
}

const formatExpiryDate = (event) => {
  let value = event.target.value.replace(/\D/g, '')
  
  if (value.length >= 2) {
    const month = value.slice(0, 2)
    const year = value.slice(2)
    value = `${month}/${year}`
    
    // Ay ve yıl değerlerini güncelle
    formData.expiryMonth = month
    formData.expiryYear = year
  }
  
  formData.expiryDate = value
}

const selectCardType = (type) => {
  formData.cardType = type
}

const validateLuhn = (number) => {
  let sum = 0
  let isEven = false

  // Boş string kontrolü
  if (!number) return false

  for (let i = number.length - 1; i >= 0; i--) {
    let digit = parseInt(number[i])

    if (isEven) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }

    sum += digit
    isEven = !isEven
  }

  return sum % 10 === 0
}

const handleSubmit = async () => {
  loading.value = true
  try {
    const result = await v$.value.$validate()
    if (!result) {
      throw new Error('Form validasyonu başarısız')
    }

    // Clean card number
    const cleanCardNumber = formData.cardNumber.replace(/\s/g, '')
    
    // Log data
    console.log('Form data before validation:', {
      cardNumber: cleanCardNumber,
      cardType: formData.cardType,
    })
    
    // Prepare payment data
    const paymentData = {
      cardNumber: cleanCardNumber,
      cardHolderName: formData.cardHolderName.trim().toUpperCase(),
      expiryMonth: formData.expiryMonth,
      expiryYear: formData.expiryYear,
      cvv: formData.cvv,
      cardType: formData.cardType,
      billingInfo: billingInfo.value
    }

    // Emit the event
    emit('submit', paymentData)

    // Initiate payment with store
    const response = await paymentStore.initiatePayment(paymentData)

    // 3D Secure kontrolü
    if (paymentStore.threeDSecureData.isProcessing) {
      console.log('3D Secure yönlendirmesi başlatılıyor')
    } else {
      // Normal ödeme başarılı
      emit('success', response)
    }

  } catch (error) {
    console.error('Ödeme başlatılırken hata:', error)
    emit('error', error)
  } finally {
    loading.value = false
  }
}
// Component mounted hook
onMounted(async () => {
  try {
    await Promise.all([
      userStore.fetchProfile(),
      addressStore.fetchDefaultAddress()
    ])
  } catch (error) {
    console.error('Kullanıcı bilgileri yüklenirken hata:', error)
  }
})
</script>
