<template>
  <div class="bg-white rounded-xl shadow-sm p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center">
        <MapPin class="h-6 w-6 text-green-600 mr-2" />
        <h2 class="text-xl font-semibold text-gray-900">Adres Yönetimi</h2>
      </div>
      <button
        v-if="!isAddMode"
        @click="startAddMode"
        class="premium-button flex items-center"
      >
        Yeni Adres Ekle
        <Plus class="ml-2 h-4 w-4" />
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="addressStore.isLoading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
    </div>

    <!-- Address List -->
    <div v-else-if="!isAddMode && !editingAddress" class="space-y-4">
      <div v-for="address in addressStore.getAddresses" :key="address._id" 
        class="bg-white border border-gray-200 rounded-lg p-6 hover:border-green-500 transition-all duration-300 shadow-sm hover:shadow-md">
        <div class="flex justify-between items-start">
          <div class="space-y-3 flex-1">
            <div class="flex items-center space-x-3">
              <h3 class="font-medium text-gray-900">{{ address.title }}</h3>
              <span v-if="address.isDefault" class="px-2 py-1 text-xs font-medium text-green-700 bg-green-50 rounded-full">
                Varsayılan
              </span>
              <span class="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full capitalize">
                {{ address.type === 'both' ? 'Fatura & Teslimat' : address.type }}
              </span>
            </div>
            <div class="space-y-1">
              <p class="font-medium text-gray-800">{{ address.fullName }}</p>
              <p class="text-gray-600">{{ address.fullAddress }}</p>
              <p class="text-gray-600">{{ address.neighborhood }}, {{ address.district }}/{{ address.city }}</p>
              <p class="text-gray-600">{{ address.phone }}</p>
            </div>
          </div>
          <div class="flex space-x-2">
            <button @click="handleEdit(address)" 
              class="p-2 text-gray-600 hover:text-green-600 transition-colors hover:bg-green-50 rounded-lg">
              <Edit2 class="h-5 w-5" />
            </button>
            <button @click="handleDelete(address._id)"
              class="p-2 text-gray-600 hover:text-red-600 transition-colors hover:bg-red-50 rounded-lg">
              <Trash2 class="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Form -->
    <form v-else @submit.prevent="handleSubmit" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Adres Başlığı -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Adres Başlığı
          </label>
          <input
            v-model="addressForm.title"
            type="text"
            class="form-input"
            :class="{ 'border-red-500': formErrors.title }"
            placeholder="Ev, İş vb."
          />
          <p v-if="formErrors.title" class="mt-1 text-sm text-red-600">
            {{ formErrors.title }}
          </p>
        </div>

        <!-- Ad Soyad -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Ad Soyad
          </label>
          <input
            v-model="addressForm.fullName"
            type="text"
            class="form-input"
            :class="{ 'border-red-500': formErrors.fullName }"
            placeholder="Ad Soyad"
          />
          <p v-if="formErrors.fullName" class="mt-1 text-sm text-red-600">
            {{ formErrors.fullName }}
          </p>
        </div>

        <!-- Telefon -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Telefon
          </label>
          <input
            v-model="addressForm.phone"
            type="tel"
            class="form-input"
            :class="{ 'border-red-500': formErrors.phone }"
            placeholder="5XX XXX XX XX"
            maxlength="10"
            @input="formatPhoneNumber"
          />
          <p v-if="formErrors.phone" class="mt-1 text-sm text-red-600">
            {{ formErrors.phone }}
          </p>
        </div>

        <!-- Şehir -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Şehir
          </label>
          <select
            v-model="addressForm.city"
            class="form-select"
            :class="{ 'border-red-500': formErrors.city }"
            @change="handleCityChange"
          >
            <option value="">Şehir Seçin</option>
            <option v-for="city in addressStore.getCities" :key="city" :value="city">
              {{ city }}
            </option>
          </select>
          <p v-if="formErrors.city" class="mt-1 text-sm text-red-600">
            {{ formErrors.city }}
          </p>
        </div>

        <!-- İlçe -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            İlçe
          </label>
          <select
            v-model="addressForm.district"
            class="form-select"
            :class="{ 'border-red-500': formErrors.district }"
            :disabled="!addressForm.city"
          >
            <option value="">İlçe Seçin</option>
            <option v-for="district in addressStore.getDistricts" :key="district" :value="district">
              {{ district }}
            </option>
          </select>
          <p v-if="formErrors.district" class="mt-1 text-sm text-red-600">
            {{ formErrors.district }}
          </p>
        </div>

        <!-- Mahalle -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Mahalle
          </label>
          <input
            v-model="addressForm.neighborhood"
            type="text"
            class="form-input"
            :class="{ 'border-red-500': formErrors.neighborhood }"
            placeholder="Mahalle adı"
          />
          <p v-if="formErrors.neighborhood" class="mt-1 text-sm text-red-600">
            {{ formErrors.neighborhood }}
          </p>
        </div>

        <!-- Açık Adres -->
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Açık Adres
          </label>
          <textarea
            v-model="addressForm.fullAddress"
            rows="3"
            class="form-input"
            :class="{ 'border-red-500': formErrors.fullAddress }"
            placeholder="Sokak, Cadde, Bina No, Daire No vb."
          ></textarea>
          <p v-if="formErrors.fullAddress" class="mt-1 text-sm text-red-600">
            {{ formErrors.fullAddress }}
          </p>
        </div>

        <!-- Posta Kodu -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Posta Kodu
          </label>
          <input
            v-model="addressForm.zipCode"
            type="text"
            class="form-input"
            :class="{ 'border-red-500': formErrors.zipCode }"
            placeholder="34100"
            maxlength="5"
          />
          <p v-if="formErrors.zipCode" class="mt-1 text-sm text-red-600">
            {{ formErrors.zipCode }}
          </p>
        </div>

        <!-- Adres Tipi -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Adres Tipi
          </label>
          <select
            v-model="addressForm.type"
            class="form-select"
            :class="{ 'border-red-500': formErrors.type }"
          >
            <option value="both">Fatura & Teslimat</option>
            <option value="billing">Fatura</option>
            <option value="shipping">Teslimat</option>
          </select>
          <p v-if="formErrors.type" class="mt-1 text-sm text-red-600">
            {{ formErrors.type }}
          </p>
        </div>

        <!-- Varsayılan Adres -->
        <div class="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isDefault"
            v-model="addressForm.isDefault"
            class="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
          />
          <label for="isDefault" class="text-sm font-medium text-gray-700">
            Varsayılan Adres
          </label>
        </div>
      </div>

      <!-- Form Buttons -->
      <div class="flex justify-end space-x-4">
        <button
          type="button"
          @click="cancelForm"
          class="secondary-button"
        >
          İptal
        </button>
        <button 
          type="submit" 
          class="premium-button"
          :disabled="addressStore.isLoading"
        >
          <span v-if="addressStore.isLoading" class="flex items-center">
            <span class="animate-spin h-4 w-4 mr-2 border-b-2 border-white"></span>
            {{ editingAddress ? 'Güncelleniyor...' : 'Kaydediliyor...' }}
          </span>
          <span v-else>
            {{ editingAddress ? 'Güncelle' : 'Kaydet' }}
          </span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useAddressStore } from '@/stores/addressStore';
import { MapPin, Plus, Edit2, Trash2 } from 'lucide-vue-next';
import { useToast } from 'vue-toastification';

const toast = useToast();
const addressStore = useAddressStore();
const isAddMode = ref(false);
const editingAddress = ref(null);
const formErrors = ref({});

const addressForm = ref({
  title: '',
  fullName: '',
  phone: '',
  city: '',
  district: '',
  neighborhood: '',
  fullAddress: '',
  zipCode: '',
  type: 'both',
  isDefault: false
});

onMounted(async () => {
  try {
    await Promise.all([
      addressStore.fetchAddresses(),
      addressStore.fetchCities()
    ]);
  } catch (error) {
    handleError(error);
  }
});

const startAddMode = () => {
  isAddMode.value = true;
  formErrors.value = {};
};

const handleCityChange = async () => {
  addressForm.value.district = '';
  if (addressForm.value.city) {
    await addressStore.fetchDistricts(addressForm.value.city);
  }
};

const handleEdit = async (address) => {
  editingAddress.value = address;
  addressForm.value = { ...address };
  formErrors.value = {};
  if (address.city) {
    await addressStore.fetchDistricts(address.city);
  }
};

const handleDelete = async (addressId) => {
  if (confirm('Bu adresi silmek istediğinize emin misiniz?')) {
    try {
      const result = await addressStore.deleteAddress(addressId);
      if (result) {
        toast.success('Adres başarıyla silindi');
      }
    } catch (error) {
      handleError(error);
    }
  }
};

const handleSubmit = async () => {
  try {
    formErrors.value = {};
    
    // Store'daki validasyon fonksiyonunu kullan
    if (!addressStore.validateAddressData(addressForm.value)) {
      return;
    }

    if (editingAddress.value) {
      await addressStore.updateAddress(editingAddress.value._id, addressForm.value);
    } else {
      await addressStore.createAddress(addressForm.value);
    }
    
    cancelForm();
  } catch (error) {
    handleError(error);
  }
};

const handleError = (error) => {
  if (error.response?.data?.errors) {
    formErrors.value = error.response.data.errors.reduce((acc, err) => {
      acc[err.field] = err.message;
      return acc;
    }, {});
  }
};

const cancelForm = () => {
  isAddMode.value = false;
  editingAddress.value = null;
  formErrors.value = {};
  addressForm.value = {
    title: '',
    fullName: '',
    phone: '',
    city: '',
    district: '',
    neighborhood: '',
    fullAddress: '',
    zipCode: '',
    type: 'both',
    isDefault: false
  };
};

const formatPhoneNumber = (event) => {
  // Sadece rakamları al ve başındaki 0'ı kaldır
  let value = event.target.value.replace(/\D/g, '').replace(/^0+/, '');
  
  // Maksimum 10 karakter olacak şekilde kes
  value = value.slice(0, 10);
  
  // Telefon numarasını güncelle
  addressForm.value.phone = value;
};

// Watch city changes
watch(() => addressForm.value.city, async (newCity) => {
  if (newCity) {
    await addressStore.fetchDistricts(newCity);
  }
});
</script>

<style scoped>
.form-input {
  @apply w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-colors;
}

.form-select {
  @apply w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-colors;
}

.premium-button {
  @apply bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed;
}

.secondary-button {
  @apply px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors;
}
</style>