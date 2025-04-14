<template>
  <div
    class="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4 sm:px-6 lg:px-8 relative"
  >
    <!-- Dekoratif Arka Plan Desenleri -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        class="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
      ></div>
      <div
        class="absolute -bottom-24 -right-24 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"
      ></div>
    </div>

    <!-- Ana Login Kartı -->
    <div class="w-full max-w-md">
      <!-- Logo ve Başlık Alanı -->
      <div class="text-center mb-8">
        <div class="mb-6">
          <!-- Logo için yer tutucu - Kendi logonuzla değiştirin -->
          <div
            class="mx-auto w-20 h-20 bg-gradient-to-r from-primary to-primary-dark rounded-xl flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-12 w-12 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </div>
        </div>
        <h2 class="text-3xl font-bold text-gray-900 mb-2">Hoş Geldiniz</h2>
      </div>

      <!-- Login Kartı -->
      <div
        class="bg-white rounded-2xl shadow-xl p-8 space-y-6 border border-gray-100"
      >
        <!-- Form -->
        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- Email Input -->
          <div class="space-y-2">
            <label for="email" class="block text-sm font-medium text-gray-700">
              E-posta Adresi
            </label>
            <div class="relative">
              <div
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                  />
                </svg>
              </div>
              <input
                id="email"
                type="email"
                v-model="email"
                required
                :disabled="auth.loading"
                class="pl-10 w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                placeholder="ornek@email.com"
              />
            </div>
          </div>

          <!-- Şifre Input -->
          <div class="space-y-2">
            <label
              for="password"
              class="block text-sm font-medium text-gray-700"
            >
              Şifre
            </label>
            <div class="relative">
              <div
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <input
                id="password"
                type="password"
                v-model="password"
                required
                :disabled="auth.loading"
                class="pl-10 w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                placeholder="••••••••"
              />
            </div>
          </div>

          <!-- Beni Hatırla & Şifremi Unuttum -->
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label for="remember-me" class="ml-2 block text-sm text-gray-700">
                Beni hatırla
              </label>
            </div>
            <a
              href="#"
              class="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
            >
              Şifremi unuttum
            </a>
          </div>
 <!-- Kayıt Ol Link -->
 <div class="text-center">
            <p class="text-sm text-gray-600">
              Henüz hesabınız yok mu?
              <router-link
                to="/register"
                class="font-medium text-primary hover:text-primary-dark transition-colors"
              >
                Hemen Kayıt Olun
              </router-link>
            </p>
          </div>
          <!-- Login Error Message -->
          <div
            v-if="auth.error"
            class="bg-red-50 text-red-500 p-4 rounded-lg text-sm flex items-center space-x-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{{ auth.error }}</span>
          </div>

          <!-- Session Expired Message (Yönlendirme Mesajı) -->
          <div
            v-if="route.query.message"
            class="bg-yellow-50 text-yellow-700 p-4 rounded-lg text-sm flex items-center space-x-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{{ route.query.message }}</span>
          </div>

          <!-- Login Button -->
          <button
            type="submit"
            class="w-full py-3.5 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg shadow-md hover:shadow-lg hover:from-primary-dark hover:to-primary transition-all duration-300 font-bold text-xl flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="auth.loading"
          >
            <span v-if="auth.loading" class="animate-spin">
              <svg
                class="w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </span>
            <span>{{ auth.loading ? "Giriş yapılıyor..." : "Giriş Yap" }}</span>
          </button>

         

          <!-- Güvenlik Rozetleri -->
          <div class="flex items-center justify-center space-x-4">
            <div class="flex items-center text-gray-500 text-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              SSL Güvenli
            </div>
            <div class="flex items-center text-gray-500 text-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Güvenli Ödeme
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/authStore";

const router = useRouter();
const route = useRoute(); // route nesnesini kullanmak için
const auth = useAuthStore();

const email = ref("");
const password = ref("");

const handleLogin = async () => {
  try {
    await auth.login({
      email: email.value,
      password: password.value,
    });
    router.push("/dashboard");
  } catch (error) {
    console.log("Login hatası işlendi:", auth.error);
  }
};
</script>

<style>
/* Özel animasyonlar için CSS */
@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(5px);
  }
  75% {
    transform: translateX(-5px);
  }
}

.shake {
  animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}
</style>
