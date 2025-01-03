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
  
      <!-- Ana Register Kartı -->
      <div class="w-full max-w-md">
        <!-- Logo ve Başlık Alanı -->
        <div class="text-center mb-8">
          <div class="mb-6">
            <div
              class="mx-auto w-20 h-20 bg-gradient-to-r from-primary to-primary-dark rounded-xl flex items-center justify-center"
            >
              <UserPlus class="h-12 w-12 text-white" />
            </div>
          </div>
          <h2 class="text-3xl font-bold text-gray-900 mb-2">Kayıt Ol</h2>
          <p class="text-gray-600">Tarım E-ticaret Platformu</p>
        </div>
  
        <!-- Register Kartı -->
        <div
          class="bg-white rounded-2xl shadow-xl p-8 space-y-6 border border-gray-100"
        >
          <!-- Form -->
          <form @submit.prevent="handleRegister" class="space-y-6">
            <!-- Username Input -->
            <div class="space-y-2">
              <label for="username" class="block text-sm font-medium text-gray-700">
                Kullanıcı Adı
              </label>
              <div class="relative">
                <div
                  class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                >
                  <User class="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  type="text"
                  v-model="username"
                  required
                  :disabled="auth.loading"
                  class="pl-10 w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                  placeholder="kullaniciadi"
                />
              </div>
            </div>
  
            <!-- Email Input -->
            <div class="space-y-2">
              <label for="email" class="block text-sm font-medium text-gray-700">
                E-posta Adresi
              </label>
              <div class="relative">
                <div
                  class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                >
                  <Mail class="h-5 w-5 text-gray-400" />
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
              <label for="password" class="block text-sm font-medium text-gray-700">
                Şifre
              </label>
              <div class="relative">
                <div
                  class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                >
                  <Lock class="h-5 w-5 text-gray-400" />
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
  
            <!-- Error Message -->
            <div
              v-if="auth.error"
              class="bg-red-50 text-red-500 p-4 rounded-lg text-sm flex items-center space-x-2"
            >
              <AlertCircle class="h-5 w-5" />
              <span>{{ auth.error }}</span>
            </div>
  
            <!-- Register Button -->
            <button
              type="submit"
              class="w-full py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg hover:from-primary-dark hover:to-primary transition-all duration-300 font-semibold text-lg flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="auth.loading"
            >
              <Loader2
                v-if="auth.loading"
                class="w-5 h-5 animate-spin"
              />
              <span>{{ auth.loading ? "Kayıt yapılıyor..." : "Kayıt Ol" }}</span>
            </button>
          </form>
  
          <!-- Giriş Yap Link -->
          <div class="text-center">
            <p class="text-sm text-gray-600">
              Zaten hesabınız var mı?
              <router-link
                to="/login"
                class="font-medium text-primary hover:text-primary-dark transition-colors"
              >
                Giriş Yapın
              </router-link>
            </p>
          </div>
        </div>
  
        <!-- Güvenlik Rozetleri -->
        <div class="mt-8 flex items-center justify-center space-x-4">
          <div class="flex items-center text-gray-500 text-sm">
            <Shield class="h-5 w-5 mr-1" />
            SSL Güvenli
          </div>
          <div class="flex items-center text-gray-500 text-sm">
            <CreditCard class="h-5 w-5 mr-1" />
            Güvenli Ödeme
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from "vue";
  import { useRouter } from "vue-router";
  import { useAuthStore } from "@/stores/authStore";
  import { UserPlus, Mail, Lock, User, Shield, CreditCard, AlertCircle, Loader2 } from 'lucide-vue-next';
  
  const router = useRouter();
  const auth = useAuthStore();
  
  const username = ref("");
  const email = ref("");
  const password = ref("");
  
  const handleRegister = async () => {
    try {
      await auth.register({
        username: username.value,
        email: email.value,
        password: password.value,
      });
      router.push("/dashboard");
    } catch (error) {
      // Error handling is managed by the store
    }
  };
  </script>
  
  <style>
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