<template>
  <Transition
    enter-active-class="transition ease-out duration-200"
    enter-from-class="transform opacity-0 -translate-y-4"
    enter-to-class="transform opacity-100 translate-y-0"
    leave-active-class="transition ease-in duration-150"
    leave-from-class="transform opacity-100 translate-y-0"
    leave-to-class="transform opacity-0 -translate-y-4"
  >
    <div v-if="showBanner" class="fixed top-[40px] left-0 right-0 z-[60]">
      <div class="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between gap-x-6 bg-gradient-to-r from-purple-600 to-indigo-600 p-4 shadow-lg rounded-lg">
          <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
            <p class="text-sm leading-6 text-white">
              <strong class="font-semibold">🎉 Özel Fırsat!</strong>
              <svg viewBox="0 0 2 2" class="mx-2 inline h-0.5 w-0.5 fill-current" aria-hidden="true"><circle cx="1" cy="1" r="1" /></svg>
              Yeni üyelere özel indirim kuponu! İlk 30 kişiye özel fırsatı kaçırmayın!
            </p>
            <router-link
              :to="{ name: 'register' }"
              class="flex-none rounded-full bg-white/10 px-3.5 py-1 text-sm font-semibold text-white shadow-sm hover:bg-white/20 transition-all duration-300"
            >
              Hemen Üye Ol <span aria-hidden="true">&rarr;</span>
            </router-link>
          </div>
          <button 
            type="button" 
            class="-m-1.5 flex-none p-1.5 text-white hover:text-white/80" 
            @click="closeBanner"
          >
            <span class="sr-only">Kapat</span>
            <X class="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/authStore';
import { X } from 'lucide-vue-next';

// Auth store ve state'leri al
const authStore = useAuthStore();
const { isAuthenticated, initialCheckDone } = storeToRefs(authStore);

// Banner gösterim durumu
const showBanner = ref(false);
const BANNER_STORAGE_KEY = 'campaign_banner_closed'; // session anahtar adı

// İzleyici ile oturum durumunu ve initial check'i takip et
watch(
  [isAuthenticated, initialCheckDone],
  ([newAuth, checkDone]) => {
    if (checkDone) { // Sadece initial check tamamlandıktan sonra işlem yap
      if (!newAuth.value && !sessionStorage.getItem(BANNER_STORAGE_KEY)) {
        setTimeout(() => {
          showBanner.value = true; // Banner'ı göster
        }, 15000); // 15 saniye gecikme
      } else {
        showBanner.value = false; // Banner'ı gizle
      }
    }
  },
  { immediate: true } // Hemen çalıştır
);

// Banner'ı kapatma fonksiyonu
const closeBanner = () => {
  showBanner.value = false; // Banner'ı gizle
  sessionStorage.setItem(BANNER_STORAGE_KEY, 'true'); // session'da kaydet
};
</script>