<template>
  <header class="bg-white shadow-sm border-b sticky top-0 z-50">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <!-- Logo ve Site Adı -->
        <router-link
          to="/"
          class="flex items-center space-x-2 text-emerald-700 hover:text-emerald-600 transition"
        >
          <Sprout class="h-7 w-7" />
          <span class="text-xl font-bold hidden sm:block">{{ storeName }}</span>
        </router-link>

        <!-- Orta Alan (Arama) -->
        <div class="hidden md:block flex-1 max-w-2xl mx-8">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="searchPlaceholder"
              class="w-full px-4 py-2 pl-10 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition"
              @input="handleSearch"
            />
            <Search class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <!-- Sağ Alan (Navigasyon) -->
        <nav class="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
          <!-- Mobil Arama Butonu -->
          <button
            @click="showMobileSearch = !showMobileSearch"
            class="md:hidden p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
          >
            <Search class="h-5 w-5" />
          </button>

          <!-- Sepet -->
          <router-link
            to="/sepet"
            class="relative flex items-center space-x-1 p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
          >
            <ShoppingCart class="h-5 w-5" />
            <span class="hidden lg:block text-sm">Sepet</span>
            <span
              v-if="cartItemCount > 0"
              class="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full"
            >
              {{ cartItemCount }}
            </span>
          </router-link>

          <!-- Kullanıcı Menüsü -->
          <div
            v-if="isAuthenticated"
            class="relative"
            v-click-outside="closeUserMenu"
          >
            <button
              @click="isUserMenuOpen = !isUserMenuOpen"
              class="flex items-center space-x-1 p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
            >
              <User class="h-5 w-5" />
              <span class="hidden lg:block text-sm">{{ username }}</span>
              <ChevronDown class="h-4 w-4" />
            </button>

            <!-- Kullanıcı Dropdown -->
            <div
              v-if="isUserMenuOpen"
              class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1"
            >
              <router-link
                to="/dashboard"
                class="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                <UserCircle class="h-4 w-4" />
                <span>Profilim</span>
              </router-link>
              <router-link
                to="/siparislerim"
                class="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                <Package class="h-4 w-4" />
                <span>Siparişlerim</span>
              </router-link>
              <router-link
                v-if="isAdmin"
                to="/admin"
                class="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                <Settings class="h-4 w-4" />
                <span>Admin Panel</span>
              </router-link>
              <button
                @click="handleLogout"
                class="w-full flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50"
              >
                <LogOut class="h-4 w-4" />
                <span>Çıkış Yap</span>
              </button>
            </div>
          </div>

          <!-- Giriş Butonu -->
          <router-link
            v-else
            to="/login"
            class="inline-flex items-center space-x-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition"
          >
            <LogIn class="h-5 w-5" />
            <span class="hidden sm:block">{{ loginButtonText }}</span>
          </router-link>
        </nav>
      </div>

      <!-- Mobil Arama Alanı -->
      <div v-if="showMobileSearch" class="py-3 md:hidden">
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="searchPlaceholder"
            class="w-full px-4 py-2 pl-10 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
            @input="handleSearch"
          />
          <Search class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { useUserStore } from "@/stores/userStore";
import {
  Sprout,
  Search,
  ShoppingCart,
  User,
  UserCircle,
  Package,
  Settings,
  LogIn,
  LogOut,
  ChevronDown,
  ListTree,
} from "lucide-vue-next";

// Store'ları başlat
const authStore = useAuthStore();
const userStore = useUserStore();
const router = useRouter();

// Reactive state
const searchQuery = ref("");
const showMobileSearch = ref(false);
const isUserMenuOpen = ref(false);

// Constants
const storeName = "Mühendisler Ticaret";
const searchPlaceholder = "Ürün veya kategori ara...";
const loginButtonText = "Giriş Yap";
const cartItemCount = ref(0); // Sepetteki ürün sayısı (store'dan alınabilir)

// Computed properties
const isAuthenticated = computed(() => authStore.isAuthenticated);
const username = computed(() => userStore.username);
const isAdmin = computed(() => userStore.role === "admin");

// Methods
const handleSearch = () => {
  // Arama işlemi
  console.log("Arama yapılıyor:", searchQuery.value);
};

const handleLogout = async () => {
  try {
    await authStore.logout();
    router.push("/login");
  } catch (error) {
    console.error("Logout error:", error);
  }
};

const closeUserMenu = () => {
  isUserMenuOpen.value = false;
};

// Click outside direktifi
const vClickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value();
      }
    };
    document.addEventListener("click", el.clickOutsideEvent);
  },
  unmounted(el) {
    document.removeEventListener("click", el.clickOutsideEvent);
  },
};
</script>