<template>
  <div class="bg-white rounded-xl shadow-sm p-6">
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center">
        <MapPin class="h-6 w-6 text-green-600 mr-2" />
        <h2 class="text-xl font-semibold text-gray-900">Adres Yönetimi</h2>
      </div>
      <button
        v-if="!isAddMode"
        @click="isAddMode = true"
        class="premium-button flex items-center"
      >
        Yeni Adres Ekle
        <Plus class="ml-2 h-4 w-4" />
      </button>
    </div>

    <!-- Address List -->
    <div v-if="!isAddMode && !editingAddress" class="space-y-4">
      <div v-for="address in addressStore.addresses" :key="address._id" 
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
              <p class="text-gray-600">{{ formatPhoneNumber(address.phone) }}</p>
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
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Adres Başlığı
          </label>
          <input
            v-model="addressForm.title"
            type="text"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600"
            placeholder="Ev, İş vb."
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Ad Soyad
          </label>
          <input
            v-model="addressForm.fullName"
            type="text"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600"
            placeholder="Ad Soyad"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Telefon
          </label>
          <input
            v-model="addressForm.phone"
            type="text"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600"
            placeholder="5XX XXX XX XX"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Şehir
          </label>
          <input
            v-model="addressForm.city"
            type="text"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600"
            placeholder="Şehir"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            İlçe
          </label>
          <input
            v-model="addressForm.district"
            type="text"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600"
            placeholder="İlçe"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Mahalle
          </label>
          <input
            v-model="addressForm.neighborhood"
            type="text"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600"
            placeholder="Mahalle"
          />
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Açık Adres
          </label>
          <textarea
            v-model="addressForm.fullAddress"
            rows="3"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600"
            placeholder="Açık adres"
          ></textarea>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Adres Tipi
          </label>
          <select
            v-model="addressForm.type"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600"
          >
            <option value="both">Fatura & Teslimat</option>
            <option value="billing">Fatura</option>
            <option value="shipping">Teslimat</option>
          </select>
        </div>
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

      <div class="flex justify-end space-x-4">
        <button
          type="button"
          @click="cancelForm"
          class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          İptal
        </button>
        <button type="submit" class="premium-button">
          {{ editingAddress ? 'Güncelle' : 'Kaydet' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAddressStore } from '@/stores/addressStore';
import { MapPin, Plus, Edit2, Trash2 } from 'lucide-vue-next';

const addressStore = useAddressStore();
const isAddMode = ref(false);
const editingAddress = ref(null);
const emit = defineEmits(['success', 'error']);

const addressForm = ref({
  title: '',
  fullName: '',
  phone: '',
  city: '',
  district: '',
  neighborhood: '',
  fullAddress: '',
  type: 'both',
  isDefault: false
});

onMounted(async () => {
  try {
    await addressStore.fetchAddresses();
  } catch (error) {
    emit('error', error.message);
  }
});

const handleEdit = (address) => {
  editingAddress.value = address;
  addressForm.value = { ...address };
};

const handleDelete = async (addressId) => {
  if (confirm('Bu adresi silmek istediğinize emin misiniz?')) {
    try {
      await addressStore.deleteAddress(addressId);
      emit('success', 'Adres başarıyla silindi');
    } catch (error) {
      emit('error', error.message);
    }
  }
};

const handleSubmit = async () => {
  try {
    if (editingAddress.value) {
      await addressStore.updateAddress(editingAddress.value._id, addressForm.value);
      emit('success', 'Adres başarıyla güncellendi');
    } else {
      await addressStore.addAddress(addressForm.value);
      emit('success', 'Adres başarıyla eklendi');
    }
    cancelForm();
  } catch (error) {
    emit('error', error.message);
  }
};

const cancelForm = () => {
  isAddMode.value = false;
  editingAddress.value = null;
  addressForm.value = {
    title: '',
    fullName: '',
    phone: '',
    city: '',
    district: '',
    neighborhood: '',
    fullAddress: '',
    type: 'both',
    isDefault: false
  };
};

const formatPhoneNumber = (phone) => {
  return phone.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4');
};
</script>

<style scoped>
.premium-button {
  @apply bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-300;
}
</style>
