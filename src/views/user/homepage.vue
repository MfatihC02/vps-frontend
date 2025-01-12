<!-- Homepage.vue -->
<template>
  <div class="min-h-screen bg-white transition-colors duration-300">
    <InfoBar /> <br>
    <main class="container mx-auto max-w-[1920px] transition-all duration-300">
      <!-- Mobil Kategori Butonu -->
      <button
        @click="isSidebarOpen = true"
        class="md:hidden mb-4 ml-4 flex items-center gap-2 text-gray-600 hover:text-[#0F6735] transition-colors group"
      >
        <Icon icon="heroicons:bars-3" class="w-6 h-6 group-hover:scale-110 transition-transform" />
        <span class="font-medium">Kategoriler</span>
      </button>

      <div class="relative flex flex-col md:flex-row gap-6 px-4 md:px-6">
        <!-- Overlay -->
        <Transition
          enter="transition-opacity duration-500"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="transition-opacity duration-300"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div
            v-if="isSidebarOpen"
            class="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            @click="isSidebarOpen = false"
          ></div>
        </Transition>

        <!-- Kategori Sidebar -->
        <Transition
          enter="transition-transform duration-500 ease-out"
          enter-from="-translate-x-full"
          enter-to="translate-x-0"
          leave="transition-transform duration-300 ease-in"
          leave-from="translate-x-0"
          leave-to="-translate-x-full"
        >
          <div
            v-show="isSidebarOpen"
            class="fixed inset-y-0 left-0 w-72 bg-white z-50 md:hidden overflow-y-auto shadow-2xl"
          >
            <!-- Mobil Kategori Başlığı -->
            <div class="p-4 border-b flex items-center justify-between bg-gradient-to-r from-[#0F6735] to-[#90A955]">
              <h2 class="text-lg font-semibold text-white">Kategoriler</h2>
              <button
                @click="isSidebarOpen = false"
                class="text-white/80 hover:text-white transition-colors"
              >
                <Icon icon="heroicons:x-mark" class="w-6 h-6" />
              </button>
            </div>
            <div class="p-4">
              <CategoryList />
            </div>
          </div>
        </Transition>

        <!-- Desktop Kategori Listesi -->
        <div class="hidden md:block w-64 flex-shrink-0 transition-all duration-300">
          <div class="bg-gray-50/80 backdrop-blur-sm rounded-lg shadow-sm border border-gray-100">
            <h2 class="text-lg font-semibold text-gray-800 p-4 border-b border-gray-100">
              Kategoriler
            </h2>
            <div class="w-full">
              <CategoryList />
            </div>
          </div>
        </div>

        <!-- Sağ İçerik Alanı -->
        <div class="flex-1 min-w-0 -mx-4 md:mx-0">
          <TabNavigation />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import InfoBar from "@/components/InfoBar.vue";
import CategoryList from "@/components/CategoryList.vue";
import { Icon } from '@iconify/vue'
import TabNavigation from '@/components/products/TabNavigation.vue';

const isSidebarOpen = ref(false);
</script>

<style scoped>
/* Smooth Scroll */
html {
  scroll-behavior: smooth;
}

/* Sidebar scroll stilini özelleştirme */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: #0F6735 #f3f4f6;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: #0F6735;
  border-radius: 3px;
  transition: background-color 0.3s;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background-color: #0a4c28;
}

/* Sayfa geçiş animasyonları */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>