<template>
  <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center">
        <User class="h-6 w-6 text-green-600 mr-2" />
        <h2 class="text-xl font-semibold text-gray-900">Profil Bilgileri</h2>
      </div>
      <button
        v-if="!isEditMode"
        @click="handleEditProfile"
        class="premium-button flex items-center"
      >
        Düzenle
        <ArrowRight class="ml-2 h-4 w-4" />
      </button>
    </div>

    <!-- View Mode -->
    <div v-if="!isEditMode" class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div v-for="(value, key) in updatedProfile" :key="key" class="space-y-1">
        <label class="text-sm font-medium text-gray-500 capitalize">
          {{ key }}
        </label>
        <p class="text-gray-900">{{ value || '-' }}</p>
      </div>
    </div>

    <!-- Edit Mode -->
    <form v-else @submit.prevent="handleUpdateProfile" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div v-for="(value, key) in updatedProfile" :key="key">
          <label :for="key" class="block text-sm font-medium text-gray-700 capitalize mb-1">
            {{ key }}
          </label>
          <input
            :id="key"
            v-model="updatedProfile[key]"
            type="text"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600"
            :placeholder="`${key} giriniz`"
          />
        </div>
      </div>
      
      <div class="flex justify-end space-x-4">
        <button
          type="button"
          @click="isEditMode = false"
          class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          İptal
        </button>
        <button type="submit" class="premium-button">
          Kaydet
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { ArrowRight, User } from 'lucide-vue-next';

const userStore = useUserStore();
const isEditMode = ref(false);
const emit = defineEmits(['success', 'error']);

const updatedProfile = ref({
  username: '',
  email: '',
  firstName: '',
  lastName: '',
  phone: ''
});

onMounted(async () => {
  try {
    await userStore.fetchProfile();
    const user = userStore.userProfile;
    updatedProfile.value = {
      username: user.username || '',
      email: user.email || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: user.phone || ''
    };
  } catch (error) {
    emit('error', error.message);
  }
});

const handleEditProfile = () => {
  isEditMode.value = true;
};

const handleUpdateProfile = async () => {
  try {
    await userStore.updateProfile(updatedProfile.value);
    isEditMode.value = false;
    emit('success', 'Profil başarıyla güncellendi');
  } catch (error) {
    emit('error', error.message);
  }
};
</script>

<style scoped>
.premium-button {
  @apply bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-300;
}
</style>
