<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
        <!-- Progress Steps -->
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-4">
            <div class="flex items-center">
              <div class="w-8 h-8 rounded-full bg-[#10B981] text-white flex items-center justify-center">
                1
              </div>
              <div class="ml-2 font-medium text-[#10B981]">Adres</div>
            </div>
            <div class="h-0.5 w-16 bg-gray-200"></div>
            <div class="flex items-center">
              <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                2
              </div>
              <div class="ml-2 font-medium text-gray-500">Ödeme</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Address List -->
      <div v-if="!addressStore.loading">
        <div v-if="addressStore.addresses.length > 0" class="bg-white rounded-lg shadow-sm p-4">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-medium">Kayıtlı Adreslerim</h2>
            <button
              @click="showAddressForm = true"
              class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#10B981] hover:bg-[#059669] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#10B981]"
            >
              Yeni Adres Ekle
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="address in addressStore.addresses"
              :key="address._id"
              class="border rounded-lg p-4 relative hover:shadow-lg transition-shadow"
              :class="{ 'border-[#10B981]': selectedAddress?._id === address._id }"
            >
              <div class="absolute top-2 right-2 flex space-x-2">
                <button @click="editAddress(address)" class="text-blue-600 hover:text-blue-800">
                  <i class="fas fa-edit"></i>
                </button>
                <button @click="deleteAddressConfirm(address._id)" class="text-red-600 hover:text-red-800">
                  <i class="fas fa-trash"></i>
                </button>
              </div>

              <div class="mb-2 flex items-center">
                <span class="font-semibold">{{ address.title }}</span>
                <span
                  v-if="address.isDefault"
                  class="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded"
                >
                  Varsayılan
                </span>
              </div>

              <p class="text-sm text-gray-600 mb-1">{{ address.fullName }}</p>
              <p class="text-sm text-gray-600 mb-1">{{ address.phone }}</p>
              <p class="text-sm text-gray-600 mb-1">
                {{ address.city }} / {{ address.district }} / {{ address.neighborhood }}
              </p>
              <p class="text-sm text-gray-600">{{ address.fullAddress }}</p>
              <p class="text-sm text-gray-600">{{ address.zipCode }}</p>
              <p class="text-sm text-gray-600">TC: {{ address.maskedIdentityNumber }}</p>

              <div class="mt-3 pt-3 border-t flex justify-between items-center">
                <button
                  v-if="!address.isDefault"
                  @click="addressStore.updateAddress(address._id, { ...address, isDefault: true })"
                  class="text-[#10B981] hover:text-[#059669] text-sm"
                >
                  Varsayılan Yap
                </button>
                <button
                  @click="selectAddress(address)"
                  class="px-3 py-1 text-sm rounded-md"
                  :class="selectedAddress?._id === address._id ? 'bg-[#10B981] text-white' : 'border border-[#10B981] text-[#10B981]'"
                >
                  {{ selectedAddress?._id === address._id ? 'Seçili' : 'Seç' }}
                </button>
              </div>
            </div>
          </div>

          <div class="mt-6 flex justify-end">
            <button
              @click="continueToPayment"
              class="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-[#10B981] hover:bg-[#059669] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#10B981]"
            >
              Ödemeye Geç
            </button>
          </div>
        </div>

        <div
          v-else
          class="bg-white rounded-lg shadow-sm p-8 text-center"
        >
          <MapPin class="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">Kayıtlı Adres Bulunamadı</h3>
          <p class="text-gray-500 mb-4">Henüz kayıtlı bir adresiniz bulunmamaktadır.</p>
          <button
            @click="showAddressForm = true"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#10B981] hover:bg-[#059669] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#10B981]"
          >
            Yeni Adres Ekle
          </button>
        </div>
      </div>
      <div v-else class="bg-white rounded-lg shadow-sm p-8 text-center">
        <i class="fas fa-spinner fa-spin text-gray-500 text-3xl mb-4"></i>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Adresler Yükleniyor</h3>
        <p class="text-gray-500 mb-4">Lütfen bekleyiniz...</p>
      </div>
    </div>
  </div>

  <!-- Address Form Modal -->
  <TransitionRoot appear :show="showAddressForm" as="template">
    <Dialog as="div" @close="closeAddressForm" class="relative z-10">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black bg-opacity-25" />
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
            <DialogPanel class="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
              <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900 mb-4">
                {{ editMode ? 'Adresi Düzenle' : 'Yeni Adres Ekle' }}
              </DialogTitle>

              <form @submit.prevent="saveAddress" class="space-y-4">
                <!-- Adres Başlığı -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Adres Başlığı</label>
                  <input
                    v-model="formData.title"
                    type="text"
                    class="w-full px-3 py-2 border rounded-md focus:ring-[#10B981] focus:border-[#10B981]"
                    :class="{ 'border-red-500': addressStore.error }"
                    placeholder="Ev, İş vb."
                  >
                </div>

                <!-- Ad Soyad -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Ad Soyad</label>
                  <input
                    v-model="formData.fullName"
                    type="text"
                    class="w-full px-3 py-2 border rounded-md focus:ring-[#10B981] focus:border-[#10B981]"
                    :class="{ 'border-red-500': addressStore.error }"
                    placeholder="Ad Soyad"
                  >
                </div>

                <!-- Telefon -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Telefon Numarası</label>
                  <input
                    v-model="formData.phone"
                    type="text"
                    class="w-full px-3 py-2 border rounded-md focus:ring-[#10B981] focus:border-[#10B981]"
                    :class="{ 'border-red-500': addressStore.error }"
                    placeholder="5XX XXX XX XX"
                    @input="formatPhoneNumber"
                  >
                </div>

                <!-- TC Kimlik Numarası -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">TC Kimlik Numarası</label>
                  <input
                    v-model="formData.identityNumber"
                    type="text"
                    class="w-full px-3 py-2 border rounded-md focus:ring-[#10B981] focus:border-[#10B981]"
                    :class="{ 'border-red-500': addressStore.error }"
                    placeholder="11 haneli TC Kimlik No"
                    maxlength="11"
                    @input="formatIdentityNumber"
                  >
                </div>

                <!-- Şehir ve İlçe -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Şehir</label>
                    <select
                      v-model="formData.city"
                      @change="handleCityChange"
                      class="w-full px-3 py-2 border rounded-md focus:ring-[#10B981] focus:border-[#10B981]"
                      :class="{ 'border-red-500': addressStore.error }"
                    >
                      <option value="">Şehir Seçiniz</option>
                      <option v-for="city in addressStore.cities" :key="city" :value="city">
                        {{ city }}
                      </option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">İlçe</label>
                    <select
                      v-model="formData.district"
                      class="w-full px-3 py-2 border rounded-md focus:ring-[#10B981] focus:border-[#10B981]"
                      :class="{ 'border-red-500': addressStore.error }"
                      :disabled="!formData.city"
                    >
                      <option value="">İlçe Seçiniz</option>
                      <option v-for="district in addressStore.districts" :key="district" :value="district">
                        {{ district }}
                      </option>
                    </select>
                  </div>
                </div>

                <!-- Mahalle -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Mahalle</label>
                  <input
                    v-model="formData.neighborhood"
                    type="text"
                    class="w-full px-3 py-2 border rounded-md focus:ring-[#10B981] focus:border-[#10B981]"
                    :class="{ 'border-red-500': addressStore.error }"
                    placeholder="Mahalle"
                  >
                </div>

                <!-- Açık Adres -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Açık Adres</label>
                  <textarea
                    v-model="formData.fullAddress"
                    class="w-full px-3 py-2 border rounded-md focus:ring-[#10B981] focus:border-[#10B981]"
                    :class="{ 'border-red-500': addressStore.error }"
                    rows="3"
                    placeholder="Sokak, Apartman No, Daire No vb."
                  ></textarea>
                </div>

                <!-- Posta Kodu -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Posta Kodu</label>
                  <input
                    v-model="formData.zipCode"
                    type="text"
                    class="w-full px-3 py-2 border rounded-md focus:ring-[#10B981] focus:border-[#10B981]"
                    :class="{ 'border-red-500': addressStore.error }"
                    placeholder="XXXXX"
                    maxlength="5"
                  >
                </div>

                <!-- Adres Tipi ve Varsayılan -->
                <div class="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Adres Tipi</label>
                    <select
                      v-model="formData.type"
                      class="px-3 py-2 border rounded-md focus:ring-[#10B981] focus:border-[#10B981]"
                    >
                      <option value="both">Fatura ve Teslimat</option>
                      <option value="shipping">Teslimat</option>
                      <option value="billing">Fatura</option>
                    </select>
                  </div>

                  <div class="flex items-center">
                    <input
                      type="checkbox"
                      v-model="formData.isDefault"
                      id="isDefault"
                      class="rounded text-[#10B981] focus:ring-[#10B981]"
                    >
                    <label for="isDefault" class="ml-2 text-sm text-gray-700">
                      Varsayılan Adres Yap
                    </label>
                  </div>
                </div>

                <!-- Form Hataları -->
                <div v-if="addressStore.error" class="bg-red-50 text-red-600 p-3 rounded-md">
                  <ul class="list-disc list-inside">
                    <li class="text-sm">
                      {{ addressStore.error }}
                    </li>
                  </ul>
                </div>

                <!-- Submit Buttons -->
                <div class="flex justify-end space-x-4 mt-6">
                  <button
                    type="button"
                    @click="closeAddressForm"
                    class="px-4 py-2 border rounded-md hover:bg-gray-50"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    :disabled="addressStore.loading"
                    class="bg-[#10B981] text-white px-4 py-2 rounded-md hover:bg-[#059669] disabled:opacity-50"
                  >
                    <span v-if="addressStore.loading">
                      <i class="fas fa-spinner fa-spin mr-2"></i>
                      Kaydediliyor...
                    </span>
                    <span v-else>
                      {{ editMode ? 'Güncelle' : 'Kaydet' }}
                    </span>
                  </button>
                </div>
              </form>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { MapPin } from 'lucide-vue-next'
import { useAddressStore } from '@/stores/addressStore'

const router = useRouter()
const addressStore = useAddressStore()

// State
const showAddressForm = ref(false)
const editMode = ref(false)
const selectedAddress = ref(null)

const formData = ref({
  title: '',
  fullName: '',
  phone: '',
  city: '',
  district: '',
  neighborhood: '',
  fullAddress: '',
  zipCode: '',
  type: 'both',
  isDefault: false,
  identityNumber: ''
})

// Methods
const resetForm = () => {
  formData.value = {
    title: '',
    fullName: '',
    phone: '',
    city: '',
    district: '',
    neighborhood: '',
    fullAddress: '',
    zipCode: '',
    type: 'both',
    isDefault: false,
    identityNumber: ''
  }
  editMode.value = false
  addressStore.error = null
}

const closeAddressForm = () => {
  showAddressForm.value = false
  resetForm()
}

const editAddress = (address) => {
  formData.value = { ...address }
  editMode.value = true
  showAddressForm.value = true
}

// Şehir değiştiğinde ilçeleri getir
const handleCityChange = async () => {
  formData.value.district = ''
  if (formData.value.city) {
    await addressStore.fetchDistricts(formData.value.city)
  }
}

// Telefon numarası formatla
const formatPhoneNumber = () => {
  let phone = formData.value.phone.replace(/\D/g, '')
  if (phone.length > 10) phone = phone.slice(0, 10)
  formData.value.phone = phone
}

// TC Kimlik numarası formatla
const formatIdentityNumber = () => {
  let value = formData.value.identityNumber.replace(/\D/g, '')
  if (value.length > 11) value = value.slice(0, 11)
  formData.value.identityNumber = value
}

const saveAddress = async () => {
  try {
    const isValid = addressStore.validateAddressData(formData.value)
    if (!isValid) return

    if (editMode.value) {
      const success = await addressStore.updateAddress(formData.value._id, formData.value)
      if (success) {
        closeAddressForm()
      }
    } else {
      const success = await addressStore.createAddress(formData.value)
      if (success) {
        closeAddressForm()
      }
    }
  } catch (error) {
    console.error('Adres kaydedilirken hata:', error)
  }
}

const deleteAddressConfirm = async (addressId) => {
  if (confirm('Bu adresi silmek istediğinizden emin misiniz?')) {
    try {
      await addressStore.deleteAddress(addressId)
    } catch (error) {
      console.error('Adres silinirken hata:', error)
    }
  }
}

const selectAddress = (address) => {
  // Eğer adres zaten varsayılan ise sadece seç
  if (address.isDefault) {
    selectedAddress.value = address
    return
  }
  
  // Eğer varsayılan değilse, varsayılan yap ve güncelle
  selectedAddress.value = address
  addressStore.updateAddress(address._id, { ...address, isDefault: true })
}

const continueToPayment = () => {
  if (!selectedAddress.value) {
    toast.error('Lütfen bir adres seçin')
    return
  }
  router.push('/odeme')
}

// Lifecycle
onMounted(async () => {
  try {
    await Promise.all([
      addressStore.fetchAddresses(),
      addressStore.fetchCities()
    ])
  } catch (error) {
    console.error('Veriler yüklenirken hata:', error)
  }
})
</script>
