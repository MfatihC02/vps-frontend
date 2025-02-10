<template>
  <header class="bg-white shadow-sm border-b sticky top-0 z-50">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <!-- Kategori Menü Butonu -->
        <div class="flex items-center space-x-2">
          <button
            @click="isCategoryMenuOpen = !isCategoryMenuOpen"
            class="md:hidden p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
          >
            <ListTree class="h-5 w-5" />
          </button>

          <!-- Logo ve Site Adı -->
          <router-link
            to="/"
            class="flex items-center space-x-2 text-emerald-700 hover:text-emerald-600 transition"
          >
            <Sprout class="h-7 w-7" />
            <span class="text-xl font-bold hidden sm:block">{{
              storeName
            }}</span>
          </router-link>
        </div>

        <!-- Orta Alan (Arama) -->
        <div class="hidden md:block flex-1 max-w-2xl mx-8">
          <SearchBar
            :placeholder="searchPlaceholder"
            @search="handleSearchResults"
          />
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
          <SearchBar
            :placeholder="searchPlaceholder"
            @search="handleSearchResults"
          />
        </div>
      </div>
      <div
        v-if="isCategoryMenuOpen"
        class="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden"
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
              class="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronDown class="h-5 w-5" />
            </button>
          </div>
          <CategoryList />
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
  Sprout,
  Search,
  ShoppingCart,
  User,
  ChevronDown,
  ListTree,
  UserCircle,
  Package,
  Settings,
  LogIn,
  LogOut,
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
const storeName = "Mühendisler Ticaret";
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
  // Burada arama sonuçlarıyla ilgili işlemler yapılabilir
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