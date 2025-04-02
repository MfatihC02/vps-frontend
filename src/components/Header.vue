<template>
  <header class="bg-white shadow-sm border-b sticky top-0 z-50">
    <!-- Mobil Header -->
    <div class="md:hidden">
      <div class="flex items-center h-14 px-1">
        <!-- Kategori Butonu -->
        <button
          @click="isCategoryMenuOpen = !isCategoryMenuOpen"
          class="p-1.5 text-gray-600"
        >
          <Menu class="h-5 w-5" />
        </button>

        <!-- Logo -->
        <router-link to="/" class="ml-2 flex items-center">
          <picture>
            <source srcset="/rounded_logo_low.webp" type="image/webp" />
            <source srcset="/rounded_logo_low.webp" type="image/jpeg" />
            <img
              src="/rounded_logo_low.webp"
              alt="TARIM SEPETİM Logo"
              class="h-7 w-7 object-contain rounded-full"
              width="28"
              height="28"
              loading="eager"
              fetchpriority="high"
              decoding="async"
            />
          </picture>
          <span class="ml-1.5 text-xs font-medium text-emerald-700">Tarım Sepetim</span>
        </router-link>

        <!-- Arama Butonu -->
        <button
          @click="showMobileSearch = !showMobileSearch"
          class="p-1.5 ml-auto text-gray-600"
        >
          <Search class="h-5 w-5" />
        </button>

        <!-- Sepet -->
        <router-link
          to="/sepet"
          class="p-1.5 relative text-gray-600 ml-1"
        >
          <ShoppingCart class="h-5 w-5" />
          <span
            v-if="cartItemCount > 0"
            class="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full"
          >
            {{ cartItemCount }}
          </span>
        </router-link>

        <!-- Giriş/Kayıt -->
        <template v-if="!isAuthenticated">
          <div class="flex items-center ml-1">
            <router-link
              to="/register"
              class="px-2 py-1 text-xs text-gray-600"
            >
              Kayıt Ol
            </router-link>
            <router-link
              to="/login"
              class="px-2 py-1 text-xs text-emerald-600"
            >
              Giriş Yap
            </router-link>
          </div>
        </template>

        <!-- Kullanıcı Menüsü -->
        <template v-else>
          <button
            @click="toggleMobileUserMenu"
            class="p-1.5 ml-1 text-gray-600 flex items-center"
          >
            <User class="h-5 w-5" />
          </button>
        </template>
      </div>

      <!-- Mobil Arama Alanı -->
      <div v-if="showMobileSearch" class="px-2 py-2 border-t">
        <SearchBar
          :placeholder="searchPlaceholder"
          @search="handleSearchResults"
        />
      </div>

      <!-- Mobil Kullanıcı Menüsü -->
      <div v-show="isUserMenuOpen" class="fixed inset-0 bg-black/50 z-[9999]" @click="closeUserMenu">
        <div class="fixed inset-x-0 top-14 bottom-0 bg-white overflow-y-auto z-[9999]" @click.stop>
          <div class="p-4 border-b flex items-center justify-between">
            <span class="text-sm font-medium">{{ username }}</span>
            <button @click="closeUserMenu" class="p-2 text-gray-500 hover:text-gray-700">
              <X class="h-5 w-5" />
            </button>
          </div>
          <nav class="py-2">
            <router-link
              to="/dashboard"
              class="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50"
              @click="closeUserMenu"
            >
              <UserCircle class="h-5 w-5" />
              <span>Profilim</span>
            </router-link>
            <router-link
              to="/siparislerim"
              class="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50"
              @click="closeUserMenu"
            >
              <Package class="h-5 w-5" />
              <span>Siparişlerim</span>
            </router-link>
            <router-link
              v-if="isAdmin"
              to="/admin"
              class="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50"
              @click="closeUserMenu"
            >
              <Settings class="h-5 w-5" />
              <span>Admin Panel</span>
            </router-link>
            <button
              @click="handleLogout"
              class="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50"
            >
              <LogOut class="h-5 w-5" />
              <span>Çıkış Yap</span>
            </button>
          </nav>
        </div>
      </div>

      <!-- Mobil Kategori Menüsü -->
      <div
        v-if="isCategoryMenuOpen"
        class="fixed inset-0 bg-black bg-opacity-50 z-50"
        @click="isCategoryMenuOpen = false"
      >
        <div
          class="fixed left-0 top-0 h-full w-64 bg-white shadow-lg"
          @click.stop
        >
          <div class="p-4 border-b flex items-center justify-between">
            <h3 class="font-medium">Kategoriler</h3>
            <button
              @click="isCategoryMenuOpen = false"
              class="p-1.5 hover:bg-gray-100 rounded-lg"
            >
              <X class="h-5 w-5" />
            </button>
          </div>
          <CategoryList />
        </div>
      </div>
    </div>

    <!-- Desktop Header -->
    <div class="hidden md:block">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <router-link
            to="/"
            class="flex items-center space-x-2 text-emerald-700 hover:text-emerald-600 transition"
          >
            <picture>
              <source srcset="/rounded_logo_low.webp" type="image/webp" />
              <source srcset="/rounded_logo_low.webp" type="image/jpeg" />
              <img
                src="/rounded_logo_low.webp"
                alt="TARIM SEPETİM Logo"
                class="h-8 w-8 object-contain rounded-full"
                width="32"
                height="32"
                loading="eager"
                fetchpriority="high"
                decoding="async"
              />
            </picture>
            <span class="text-xl font-bold">{{ storeName }}</span>
          </router-link>

          <!-- Arama -->
          <div class="flex-1 max-w-2xl mx-8">
            <SearchBar
              :placeholder="searchPlaceholder"
              @search="handleSearchResults"
            />
          </div>

          <!-- Sağ Menü -->
          <nav class="flex items-center space-x-6">
            <router-link
              to="/sepet"
              class="relative flex items-center space-x-1 text-gray-600 hover:text-emerald-600 transition"
            >
              <ShoppingCart class="h-5 w-5" />
              <span class="text-sm">Sepet</span>
              <span
                v-if="cartItemCount > 0"
                class="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full"
              >
                {{ cartItemCount }}
              </span>
            </router-link>

            <template v-if="isAuthenticated">
              <div class="relative">
                <button
                  @click="isUserMenuOpen = !isUserMenuOpen"
                  class="flex items-center space-x-1 text-gray-600 hover:text-emerald-600 transition"
                >
                  <User class="h-5 w-5" />
                  <span class="text-sm">{{ username }}</span>
                  <ChevronDown class="h-4 w-4" />
                </button>

                <div
                  v-show="isUserMenuOpen"
                  class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 z-[9999]"
                >
                  <router-link
                    to="/dashboard"
                    class="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
                    @click="isUserMenuOpen = false"
                  >
                    <UserCircle class="h-4 w-4" />
                    <span>Profilim</span>
                  </router-link>
                  <router-link
                    to="/siparislerim"
                    class="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
                    @click="isUserMenuOpen = false"
                  >
                    <Package class="h-4 w-4" />
                    <span>Siparişlerim</span>
                  </router-link>
                  <router-link
                    v-if="isAdmin"
                    to="/admin"
                    class="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
                    @click="isUserMenuOpen = false"
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
            </template>

            <template v-else>
              <div class="flex items-center space-x-4">
                <router-link
                  to="/register"
                  class="text-sm text-gray-600 hover:text-emerald-600 transition"
                >
                  Kayıt Ol
                </router-link>
                <router-link
                  to="/login"
                  class="text-sm text-emerald-600 hover:text-emerald-700 transition"
                >
                  Giriş Yap
                </router-link>
              </div>
            </template>
          </nav>
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
import { useCartStore } from "@/stores/cartStore";
import { useProductStore } from "@/stores/productStore";
import {
  Search,
  ShoppingCart,
  User,
  ChevronDown,
  Menu,
  UserCircle,
  Package,
  Settings,
  LogOut,
  X
} from "lucide-vue-next";
import SearchBar from "./SearchBar.vue";
import CategoryList from "@/components/CategoryList.vue";

// Store'ları başlat
const authStore = useAuthStore();
const userStore = useUserStore();
const cartStore = useCartStore();
const productStore = useProductStore();
const router = useRouter();

// Reactive state
const searchQuery = ref("");
const showMobileSearch = ref(false);
const isUserMenuOpen = ref(false);
const isCategoryMenuOpen = ref(false);

// Constants
const storeName = "TARIM SEPETİM";
const searchPlaceholder = ref("Ürün veya marka ara...");
const loginButtonText = "Giriş Yap";
const cartItemCount = computed(() => cartStore.cartItemCount);

// Computed properties
const isAuthenticated = computed(() => authStore.isAuthenticated);
const username = computed(() => userStore.username);
const isAdmin = computed(() => userStore.role === "admin");

// Methods
const handleSearchResults = (results) => {
  console.log("Arama sonuçları:", results);
};

const handleLogout = async () => {
  try {
    await authStore.logout();
    router.push("/login");
    isUserMenuOpen.value = false;
  } catch (error) {
    console.error("Logout error:", error);
  }
};

const closeUserMenu = () => {
  isUserMenuOpen.value = false;
};

const toggleMobileUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value;
  console.log('Mobil menü durumu:', isUserMenuOpen.value);
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.mobile-menu {
  max-height: calc(100vh - 3.5rem);
  overflow-y: auto;
}
</style>
