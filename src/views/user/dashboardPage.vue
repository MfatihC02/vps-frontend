<template>
  <main class="container mx-auto px-4 py-8">
    <!-- Header Section -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Profil Yönetimi</h1>
      <p class="text-gray-600">
        Hesap bilgilerinizi görüntüleyin ve güncelleyin
      </p>
    </div>

    <!-- Loading State -->
    <div
      v-if="userStore.isLoading"
      class="flex items-center justify-center p-8"
    >
      <Loader2 class="animate-spin h-8 w-8 text-green-600" />
    </div>

    <!-- Success Message -->
    <div v-if="successMessage" class="mb-4">
      <div
        class="bg-green-50 border-l-4 border-green-600 p-4 flex items-center"
      >
        <CheckCircle class="h-5 w-5 text-green-600 mr-2" />
        <span class="text-green-700">{{ successMessage }}</span>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="formError" class="mb-4">
      <div class="bg-red-50 border-l-4 border-red-600 p-4 flex items-center">
        <AlertCircle class="h-5 w-5 text-red-600 mr-2" />
        <span class="text-red-700">{{ formError }}</span>
      </div>
    </div>

    <!-- Tab Navigation -->
    <div class="mb-6">
      <nav class="flex space-x-4 border-b border-gray-200" aria-label="Tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            activeTab === tab.id
              ? 'border-green-600 text-green-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            'group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200',
          ]"
        >
          <component
            :is="tab.icon"
            :class="[
              activeTab === tab.id
                ? 'text-green-600'
                : 'text-gray-400 group-hover:text-gray-500',
              'h-5 w-5 mr-2',
            ]"
          />
          {{ tab.name }}
        </button>
      </nav>
    </div>

    <!-- Tab Panels -->
    <div class="bg-white rounded-xl shadow-sm">
      <div
        v-show="activeTab === 'profile'"
        class="transition-opacity duration-200"
      >
        <UserProfileComponent @success="handleSuccess" @error="handleError" />
      </div>

      <div
        v-show="activeTab === 'address'"
        class="transition-opacity duration-200"
      >
        <AddressManagementComponent
          @success="handleSuccess"
          @error="handleError"
        />
      </div>

      <div
        v-show="activeTab === 'security'"
        class="transition-opacity duration-200 p-6"
      >
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center">
            <Lock class="h-6 w-6 text-green-600 mr-2" />
            <h2 class="text-xl font-semibold text-gray-900">
              Güvenlik Ayarları
            </h2>
          </div>
        </div>

        <div class="space-y-6">
          <div class="border-b border-gray-200 pb-6">
            <h3 class="text-lg font-medium text-gray-900 mb-2">
              Şifre Değiştirme
            </h3>
            <p class="text-gray-600 mb-4">
              Hesabınızın güvenliği için düzenli olarak şifrenizi değiştirmenizi
              öneririz.
            </p>
            <button
              @click="isPasswordMode = true"
              class="premium-button flex items-center"
            >
              Şifre Değiştir
              <ArrowRight class="ml-2 h-4 w-4" />
            </button>
          </div>

          <div v-if="isPasswordMode" class="space-y-4">
            <form @submit.prevent="handleChangePassword" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Mevcut Şifre
                </label>
                <input
                  v-model="passwordForm.currentPassword"
                  type="password"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600"
                  placeholder="Mevcut şifrenizi giriniz"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Yeni Şifre
                </label>
                <input
                  v-model="passwordForm.newPassword"
                  type="password"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600"
                  placeholder="Yeni şifrenizi giriniz"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Yeni Şifre Tekrar
                </label>
                <input
                  v-model="passwordForm.confirmPassword"
                  type="password"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600"
                  placeholder="Yeni şifrenizi tekrar giriniz"
                />
              </div>
              <div class="flex justify-end space-x-4">
                <button
                  type="button"
                  @click="isPasswordMode = false"
                  class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  İptal
                </button>
                <button type="submit" class="premium-button">
                  Şifreyi Güncelle
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref } from "vue";
import { useUserStore } from "@/stores/userStore";
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  User,
  MapPin,
  Lock,
  ArrowRight,
} from "lucide-vue-next";
import UserProfileComponent from "@/components/UserProfileComponent.vue";
import AddressManagementComponent from "@/components/AddressManagementComponent.vue";

const userStore = useUserStore();
const successMessage = ref("");
const formError = ref("");
const activeTab = ref("profile");
const isPasswordMode = ref(false);

const tabs = [
  { id: "profile", name: "Profil Bilgileri", icon: User },
  { id: "address", name: "Adres Bilgileri", icon: MapPin },
  { id: "security", name: "Güvenlik", icon: Lock },
];

const passwordForm = ref({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const handleSuccess = (message) => {
  successMessage.value = message;
  setTimeout(() => {
    successMessage.value = "";
  }, 3000);
};

const handleError = (error) => {
  formError.value = error;
  setTimeout(() => {
    formError.value = "";
  }, 3000);
};

const handleChangePassword = async () => {
  try {
    if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
      throw new Error("Yeni şifreler eşleşmiyor");
    }

    await userStore.changePassword({
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword,
    });

    handleSuccess("Şifre başarıyla güncellendi");
    isPasswordMode.value = false;
    passwordForm.value = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };
  } catch (error) {
    handleError(error.message);
  }
};
</script>

<style scoped>
.premium-button {
  @apply bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-300;
}
</style>