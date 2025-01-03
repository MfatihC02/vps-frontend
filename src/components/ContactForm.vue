<template>
  <form @submit.prevent="submitForm" class="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-xl space-y-8">
    <!-- Form başlığı -->
    <div class="text-center mb-8">
      <h2 class="text-3xl font-bold text-gray-800 mb-2">Bizimle İletişime Geçin</h2>
      <p class="text-gray-600">Size yardımcı olmaktan mutluluk duyarız</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Ad Soyad -->
      <div class="relative group">
        <label for="fullName" class="block text-sm font-medium text-gray-700 mb-1">Ad Soyad</label>
        <div class="relative">
          <input
            type="text"
            id="fullName"
            v-model="form.fullName"
            class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
            :class="{ 'border-red-500': v$.fullName.$error }"
          />
          <i class="iconify absolute right-3 top-3 text-gray-400" data-icon="mdi:account"></i>
        </div>
        <span v-if="v$.fullName.$error" class="text-sm text-red-600 mt-1 block">
          Lütfen adınızı ve soyadınızı girin
        </span>
      </div>

      <!-- E-posta -->
      <div class="relative group">
        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
        <div class="relative">
          <input
            type="email"
            id="email"
            v-model="form.email"
            class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
            :class="{ 'border-red-500': v$.email.$error }"
          />
          <i class="iconify absolute right-3 top-3 text-gray-400" data-icon="mdi:email"></i>
        </div>
        <span v-if="v$.email.$error" class="text-sm text-red-600 mt-1 block">
          Lütfen geçerli bir e-posta adresi girin
        </span>
      </div>

      <!-- Telefon -->
      <div class="relative group">
        <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
        <div class="relative">
          <input
            type="tel"
            id="phone"
            v-model="form.phone"
            class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
            :class="{ 'border-red-500': v$.phone.$error }"
          />
          <i class="iconify absolute right-3 top-3 text-gray-400" data-icon="mdi:phone"></i>
        </div>
        <span v-if="v$.phone.$error" class="text-sm text-red-600 mt-1 block">
          Lütfen telefon numaranızı girin
        </span>
      </div>

      <!-- Konu -->
      <div class="relative group">
        <label for="subject" class="block text-sm font-medium text-gray-700 mb-1">Konu</label>
        <div class="relative">
          <select
            id="subject"
            v-model="form.subject"
            class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 appearance-none"
            :class="{ 'border-red-500': v$.subject.$error }"
          >
            <option value="">Seçiniz</option>
            <option value="Ürün Bilgisi">Ürün Bilgisi</option>
            <option value="Sipariş Durumu">Sipariş Durumu</option>
            <option value="Teknik Destek">Teknik Destek</option>
            <option value="İş Birliği">İş Birliği</option>
            <option value="Diğer">Diğer</option>
          </select>
          <i class="iconify absolute right-3 top-3 text-gray-400" data-icon="mdi:chevron-down"></i>
        </div>
        <span v-if="v$.subject.$error" class="text-sm text-red-600 mt-1 block">
          Lütfen bir konu seçin
        </span>
      </div>
    </div>

    <!-- Mesaj -->
    <div class="relative group">
      <label for="message" class="block text-sm font-medium text-gray-700 mb-1">Mesajınız</label>
      <div class="relative">
        <textarea
          id="message"
          v-model="form.message"
          rows="4"
          class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
          :class="{ 'border-red-500': v$.message.$error }"
        ></textarea>
        <i class="iconify absolute right-3 top-3 text-gray-400" data-icon="mdi:message-text"></i>
      </div>
      <span v-if="v$.message.$error" class="text-sm text-red-600 mt-1 block">
        Lütfen mesajınızı girin
      </span>
    </div>

    <!-- Alert mesajları -->
    <div v-if="submitStatus.message" 
      class="transition-all duration-300 transform"
      :class="[
        'p-4 rounded-lg flex items-center',
        submitStatus.success ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
      ]"
    >
      <i class="iconify text-2xl mr-2" :data-icon="submitStatus.success ? 'mdi:check-circle' : 'mdi:alert-circle'"></i>
      {{ submitStatus.message }}
    </div>

    <!-- Gönder butonu -->
    <div>
      <button
        type="submit"
        :disabled="isSubmitting"
        class="w-full flex justify-center items-center py-3 px-6 rounded-lg text-white text-lg font-semibold transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        :class="isSubmitting ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'"
      >
        <span v-if="!isSubmitting" class="flex items-center">
          <i class="iconify text-2xl mr-2" data-icon="mdi:send"></i>
          Mesaj Gönder
        </span>
        <span v-else class="flex items-center">
          <i class="iconify text-2xl mr-2 animate-spin" data-icon="mdi:loading"></i>
          Gönderiliyor...
        </span>
      </button>
    </div>
  </form>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useVuelidate } from '@vuelidate/core'
import { required, email } from '@vuelidate/validators'
import api from '@/services/axiosInstance'

const form = reactive({
  fullName: '',
  email: '',
  phone: '',
  subject: '',
  message: ''
})

const rules = {
  fullName: { required },
  email: { required, email },
  phone: { required },
  subject: { required },
  message: { required }
}

const v$ = useVuelidate(rules, form)

const isSubmitting = ref(false)
const submitStatus = reactive({
  success: false,
  message: ''
})

const submitForm = async () => {
  try {
    // Form validasyonu
    const isValid = await v$.value.$validate()
    if (!isValid) return

    isSubmitting.value = true
    submitStatus.message = ''

    // API'ye form verilerini gönder
    const response = await api.post('/contact', form)

    // Başarılı yanıt
    submitStatus.success = true
    submitStatus.message = 'Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.'

    // Formu temizle
    Object.keys(form).forEach(key => form[key] = '')
    v$.value.$reset()

  } catch (error) {
    // Hata durumu
    submitStatus.success = false
    submitStatus.message = error.response?.data?.message || 'Mesaj gönderilirken bir hata oluştu. Lütfen tekrar deneyin.'
  } finally {
    isSubmitting.value = false

    // 5 saniye sonra durum mesajını temizle
    setTimeout(() => {
      submitStatus.message = ''
    }, 5000)
  }
}
</script>

<style scoped>
.group:hover .iconify {
  color: #059669; /* green-600 */
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

form {
  animation: slideIn 0.5s ease-out;
}
</style>
