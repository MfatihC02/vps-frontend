<template>
  <div class="bg-white rounded-xl shadow-sm p-6 md:p-6 sm:p-4 xs:p-2 mb-6">
    <div class="flex justify-between items-center mb-6 flex-wrap gap-2">
      <div class="flex items-center">
        <User class="h-6 w-6 text-green-600 mr-2" />
        <h2 class="text-xl md:text-xl sm:text-lg xs:text-base font-semibold text-gray-900">Profil Bilgileri</h2>
      </div>
      <button
        v-if="!isEditMode"
        @click="handleEditProfile"
        class="premium-button flex items-center text-sm md:text-base px-4 py-2 md:px-6 md:py-2"
      >
        Düzenle
        <ArrowRight class="ml-2 h-4 w-4" />
      </button>
    </div>

    <!-- View Mode -->
    <div v-if="!isEditMode" class="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
      <div class="space-y-1">
        <label class="text-sm font-medium text-gray-500">Kullanıcı Adı</label>
        <p class="text-gray-900">{{ updatedProfile.username || '-' }}</p>
      </div>
      <div class="space-y-1">
        <label class="text-sm font-medium text-gray-500">E-posta</label>
        <p class="text-gray-900">{{ updatedProfile.email || '-' }}</p>
      </div>
      <div class="space-y-1">
        <label class="text-sm font-medium text-gray-500">Kayıt Tarihi</label>
        <p class="text-gray-900">{{ formatDate(updatedProfile.createdAt) || '-' }}</p>
      </div>
      <div class="space-y-1">
        <label class="text-sm font-medium text-gray-500">Son Giriş</label>
        <p class="text-gray-900">{{ formatDate(updatedProfile.lastLogin) || '-' }}</p>
      </div>
    </div>

    <!-- Edit Mode -->
    <form v-else @submit.prevent="handleUpdateProfile" class="space-y-6">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Kullanıcı Adı
          </label>
          <input
            v-model="updatedProfile.username"
            type="text"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 text-sm sm:text-base"
            placeholder="Kullanıcı adı giriniz"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            E-posta
          </label>
          <input
            v-model="updatedProfile.email"
            type="email"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 text-sm sm:text-base"
            placeholder="E-posta giriniz"
          />
        </div>
      </div>
      <div class="flex flex-col sm:flex-row justify-end sm:space-x-4 gap-2 sm:gap-0">
        <button
          type="button"
          @click="isEditMode = false"
          class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors w-full sm:w-auto"
        >
          İptal
        </button>
        <button type="submit" class="premium-button w-full sm:w-auto">
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
  createdAt: '',
  lastLogin: ''
});

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

onMounted(async () => {
  try {
    await userStore.fetchProfile();
    const user = userStore.userProfile;
    updatedProfile.value = {
      username: user.username || '',
      email: user.email || '',
      createdAt: user.createdAt || '',
      lastLogin: user.lastLogin || ''
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

@media (max-width: 640px) {
  .rounded-lg, .rounded-xl {
    border-radius: 0.75rem;
  }
  .shadow-sm, .shadow-md {
    box-shadow: 0 1px 6px 0 rgba(0,0,0,0.06);
  }
  .premium-button {
    font-size: 1rem;
    padding: 0.75rem 1.25rem;
  }
}
</style>
