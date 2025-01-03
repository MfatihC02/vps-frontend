<!-- Homepage.vue -->
<template>
  <div class="min-h-screen bg-white">
    <InfoBar />
    <main class="container mx-auto py-8 px-4">
      <!-- Mobil Kategori Butonu -->
      <button
        @click="isSidebarOpen = true"
        class="md:hidden mb-4 flex items-center gap-2 text-gray-600 hover:text-[#0F6735] transition-colors"
      >
        <Icon icon="heroicons:bars-3" class="w-6 h-6" />
        <span class="font-medium">Kategoriler</span>
      </button>

      <div class="relative flex flex-col md:flex-row gap-8">
        <!-- Overlay -->
        <Transition
          enter="transition-opacity duration-300"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="transition-opacity duration-300"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div
            v-if="isSidebarOpen"
            class="fixed inset-0 bg-black/50 z-40 md:hidden"
            @click="isSidebarOpen = false"
          ></div>
        </Transition>

        <!-- Kategori Sidebar -->
        <Transition
          enter="transition-transform duration-300 ease-out"
          enter-from="-translate-x-full"
          enter-to="translate-x-0"
          leave="transition-transform duration-300 ease-in"
          leave-from="translate-x-0"
          leave-to="-translate-x-full"
        >
          <div
            v-show="isSidebarOpen"
            class="fixed inset-y-0 left-0 w-80 bg-white z-50 md:hidden overflow-y-auto"
          >
            <!-- Mobil Kategori Başlığı -->
            <div class="p-4 border-b flex items-center justify-between">
              <h2 class="text-lg font-semibold text-gray-800">Kategoriler</h2>
              <button
                @click="isSidebarOpen = false"
                class="text-gray-500 hover:text-gray-700"
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
        <div class="hidden md:block">
          <CategoryList />
        </div>

        <!-- Ürün Tabları -->
        <ProductTabs />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import InfoBar from "@/components/InfoBar.vue";
import CategoryList from "@/components/CategoryList.vue";
import ProductTabs from "@/components/ProductTabs.vue";
import { Icon } from '@iconify/vue';

const isSidebarOpen = ref(false);
</script>

<style scoped>
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
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: #0F6735;
  border-radius: 3px;
}
</style>