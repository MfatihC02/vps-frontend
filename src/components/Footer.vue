<template>
  <footer class="bg-gray-900 text-gray-300 h-[600px] md:h-[500px] w-full flex flex-col">
    <!-- Üst Footer -->
    <div class="container mx-auto px-4 py-8 flex-1">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 flex-grow">
        <!-- Kurumsal -->
        <div class="space-y-4">
          <button 
            @click="toggleSection('kurumsal')" 
            class="w-full flex items-center justify-between text-lg font-semibold text-white mb-4 sm:cursor-default"
          >
            <span>Kurumsal</span>
            <iconify-icon
              icon="mdi:chevron-down"
              :class="{'rotate-180': sections.kurumsal}"
              class="sm:hidden transition-transform duration-300"
              width="24"
            ></iconify-icon>
          </button>
          <ul :class="{'hidden sm:block': !sections.kurumsal}" class="space-y-2">
            <li>
              <router-link
                to="/hakkimizda"
                class="hover:text-green-500 transition-colors duration-200 flex items-center"
              >
                <iconify-icon
                  icon="mdi:chevron-right"
                  class="text-green-500"
                  width="16"
                ></iconify-icon>
                Hakkımızda
              </router-link>
            </li>
            <li>
              <router-link
                to="/iletisim"
                class="hover:text-green-500 transition-colors duration-200 flex items-center"
              >
                <iconify-icon
                  icon="mdi:chevron-right"
                  class="text-green-500"
                  width="16"
                ></iconify-icon>
                İletişim
              </router-link>
            </li>
            <li>
              <router-link
                to="/career"
                class="hover:text-green-500 transition-colors duration-200 flex items-center"
              >
                <iconify-icon
                  icon="mdi:chevron-right"
                  class="text-green-500"
                  width="16"
                ></iconify-icon>
                Kariyer
              </router-link>
            </li>
            <li>
              <router-link
                to="/blog"
                class="hover:text-green-500 transition-colors duration-200 flex items-center"
              >
                <iconify-icon
                  icon="mdi:chevron-right"
                  class="text-green-500"
                  width="16"
                ></iconify-icon>
                Blog
              </router-link>
            </li>
          </ul>
        </div>

        <!-- Müşteri Hizmetleri -->
        <div class="space-y-4">
          <button 
            @click="toggleSection('musteri')" 
            class="w-full flex items-center justify-between text-lg font-semibold text-white mb-4 sm:cursor-default"
          >
            <span>Müşteri Hizmetleri</span>
            <iconify-icon
              icon="mdi:chevron-down"
              :class="{'rotate-180': sections.musteri}"
              class="sm:hidden transition-transform duration-300"
              width="24"
            ></iconify-icon>
          </button>
          <ul :class="{'hidden sm:block': !sections.musteri}" class="space-y-2">
            <li>
              <router-link
                to="/faq"
                class="hover:text-green-500 transition-colors duration-200 flex items-center"
              >
                <iconify-icon
                  icon="mdi:chevron-right"
                  class="text-green-500"
                  width="16"
                ></iconify-icon>
                Sıkça Sorulan Sorular
              </router-link>
            </li>
            <li>
              <router-link
                :to="{ name: 'return-policy' }"
                class="hover:text-green-500 transition-colors duration-200 flex items-center"
              >
                <iconify-icon
                  icon="mdi:chevron-right"
                  class="text-green-500"
                  width="16"
                ></iconify-icon>
                İade ve Değişim Politikası
              </router-link>
            </li>
            <li>
              <router-link
                :to="{ name: 'privacy-policy' }"
                class="hover:text-green-500 transition-colors duration-200 flex items-center"
              >
                <iconify-icon
                  icon="mdi:chevron-right"
                  class="text-green-500"
                  width="16"
                ></iconify-icon>
                Gizlilik Politikası
              </router-link>
            </li>
          </ul>
        </div>

        <!-- İletişim Bilgileri -->
        <div class="space-y-4">
          <button 
            @click="toggleSection('iletisim')" 
            class="w-full flex items-center justify-between text-lg font-semibold text-white mb-4 sm:cursor-default"
          >
            <span>İletişim Bilgileri</span>
            <iconify-icon
              icon="mdi:chevron-down"
              :class="{'rotate-180': sections.iletisim}"
              class="sm:hidden transition-transform duration-300"
              width="24"
            ></iconify-icon>
          </button>
          <ul :class="{'hidden sm:block': !sections.iletisim}" class="space-y-3">
            <li class="flex items-start space-x-3">
              <iconify-icon
                icon="mdi:map-marker"
                class="text-green-500"
                width="20"
              ></iconify-icon>
              <span>Şükran Mah. Sahibi Ata Cad. No:38 Meram, Konya</span>
            </li>
            <li>
              <a 
                href="tel:03323513128"
                class="flex items-center space-x-3 hover:text-green-500 transition-colors duration-200"
              >
                <iconify-icon
                  icon="mdi:phone"
                  class="text-green-500"
                  width="20"
                ></iconify-icon>
                <span>0332 351 31 28</span>
              </a>
            </li>
            <li>
              <a 
                href="mailto:iletisim@tarimsepetim.com.tr"
                class="flex items-center space-x-3 hover:text-green-500 transition-colors duration-200"
              >
                <iconify-icon
                  icon="mdi:email"
                  class="text-green-500"
                  width="20"
                ></iconify-icon>
                <span>iletisim@tarimsepetim.com.tr</span>
              </a>
            </li>
            <li class="flex items-start space-x-3">
              <iconify-icon
                icon="mdi:clock"
                class="text-green-500"
                width="20"
              ></iconify-icon>
              <div>
                <p>Pazartesi - Cumartesi</p>
                <p>09:00 - 18:00</p>
              </div>
            </li>
          </ul>
        </div>

        <!-- Sosyal Medya -->
        <div class="block w-full">
          <h3 class="text-lg font-semibold text-white mb-6">Sosyal Medya</h3>
          <!-- Sosyal Medya İkonları -->
          <div class="flex space-x-4 mb-6">
            <a 
              href="https://www.instagram.com/tarimsepetim"
              class="transform hover:scale-110 transition-transform duration-200"
            >
              <iconify-icon
                icon="mdi:instagram"
                class="text-[#e4405f]"
                width="28"
              ></iconify-icon>
            </a>
            <a
              href="#"
              class="transform hover:scale-110 transition-transform duration-200"
            >
              <iconify-icon
                icon="mdi:linkedin"
                class="text-[#0a66c2]"
                width="28"
              ></iconify-icon>
            </a>
            <a 
              href="#"
              class="transform hover:scale-110 transition-transform duration-200"
            >
              <iconify-icon
                icon="mdi:youtube"
                class="text-[#ff0000]"
                width="28"
              ></iconify-icon>
            </a>
          </div>
          <!-- WhatsApp Button -->
          <a 
            href="https://wa.me/905516419012"
            target="_blank"
            rel="noopener noreferrer"
            class="whatsapp-button flex items-center gap-3 bg-[#25D366] hover:bg-[#20BD5A] text-white p-3 rounded-lg w-full justify-center sm:justify-start"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="28" 
              height="28" 
              viewBox="0 0 24 24" 
              class="fill-current"
            >
              <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91c0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23c-1.48 0-2.93-.39-4.19-1.15l-.3-.17l-3.12.82l.83-3.04l-.2-.32a8.188 8.188 0 0 1-1.26-4.38c.01-4.54 3.7-8.24 8.25-8.24M8.53 7.33c-.16 0-.43.06-.66.31c-.22.25-.87.86-.87 2.07c0 1.22.89 2.39 1 2.56c.14.17 1.76 2.67 4.25 3.73c.59.27 1.05.42 1.41.53c.59.19 1.13.16 1.56.1c.48-.07 1.46-.6 1.67-1.18c.21-.58.21-1.07.15-1.18c-.07-.1-.23-.16-.48-.27c-.25-.14-1.47-.74-1.69-.82c-.23-.08-.37-.12-.56.12c-.16.25-.64.81-.78.97c-.15.17-.29.19-.53.07c-.26-.13-1.06-.39-2-1.23c-.74-.66-1.23-1.47-1.38-1.72c-.12-.24-.01-.39.11-.5c.11-.11.27-.29.37-.44c.13-.14.17-.25.25-.41c.08-.17.04-.31-.02-.43c-.06-.11-.56-1.35-.77-1.84c-.2-.48-.4-.42-.56-.43c-.14 0-.3-.01-.47-.01z"/>
            </svg>
            <span class="font-semibold text-base" style="contain: content;">WhatsApp'tan Sipariş Ver</span>
          </a>
        </div>
      </div>
    </div>

    <!-- Alt Footer -->
    <div class="border-t border-gray-800 mt-auto">
      <div class="container mx-auto px-4 py-4">
        <!-- Ödeme Yöntemleri -->
        <div class="flex justify-center md:justify-start space-x-6 mb-4">
          <iconify-icon icon="logos:visa" width="36"></iconify-icon>
          <iconify-icon icon="logos:mastercard" width="36"></iconify-icon>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="36"
            height="24"
            viewBox="0 0 36 24"
          >
            <path
              fill="currentColor"
              d="M33.6 24H2.4A2.4 2.4 0 0 1 0 21.6V2.4A2.4 2.4 0 0 1 2.4 0h31.2A2.4 2.4 0 0 1 36 2.4v19.2a2.4 2.4 0 0 1-2.4 2.4M24.911 8.679a7 7 0 0 0-.865.024l.027-.002c-.01.03.542 1.996 1.066 3.83l.064.224c1.114 3.896 1.114 3.896.937 4.274a1.67 1.67 0 0 1-.686.729l-.008.004l-.231.116l-.994.019c-.96.02-.998.024-1.12.111c-.228.164-.315.425-.489 1.467c-.09.55-.16.982-.16 1.006a2.4 2.4 0 0 0 .741.037l-.01.001c.214 0 .48 0 .812-.006a6.4 6.4 0 0 0 1.975-.132l-.043.008a4.62 4.62 0 0 0 2.55-1.852l.01-.016c.197-.286 5.257-9.732 5.257-9.814a4 4 0 0 0-.822-.029l.012-.001h-.594l-1.4.011l-.266.132a1.3 1.3 0 0 0-.385.274c-.067.08-.528 1.088-1.12 2.445a18.5 18.5 0 0 1-1.083 2.33l.049-.096c-.022-.046-.218-1.266-.378-2.282c-.187-1.218-.366-2.27-.4-2.346a.68.68 0 0 0-.349-.372l-.004-.002c-.151-.08-.223-.08-1.539-.095h-.553zm-3.77.131c-.043 0-.052.027-.062.071c-.027.123-.418 2.354-.418 2.386a.5.5 0 0 0 .148.117l.003.001c.41.281.69.725.746 1.237l.001.008a1.69 1.69 0 0 1-1.261 1.771l-.012.003c-.136.032-.19.067-.203.131c-.035.168-.418 2.357-.418 2.39c0 .006.023.015.179.015c.07 0 .16 0 .25-.007a4.205 4.205 0 0 0 3.9-3.417l.004-.026a5.4 5.4 0 0 0-.041-1.607l.005.032a4.18 4.18 0 0 0-2.423-2.964l-.027-.01a1.5 1.5 0 0 0-.364-.129l-.01-.002zM4.175 8.674c-.167 0-.603 0-.612.008s-.025.13-.058.32l-.137.758c-.104.588-.179 1.074-.167 1.082s.32.012.621.012h.596l-.012.091c0 .026-.037.211-.085.489l-.185 1.058a7.7 7.7 0 0 0-.258 2.515l-.001-.021c.182 1.082 1.114 1.766 2.624 1.925c.198.021.466.031.701.031a1.8 1.8 0 0 0 .528-.042l-.012.002c.022-.027.413-2.182.418-2.306c0-.052-.069-.068-.386-.088c-.778-.043-1.126-.297-1.126-.823c0-.16.367-2.381.457-2.763c.013-.059.032-.075.433-.075h.606a4 4 0 0 0 .691-.03l-.019.002c.025-.042.378-2 .378-2.099c0-.037-.198-.047-.847-.047h-.846l.107-.609c.195-1.063.149-1.32-.278-1.527c-.214-.107-.231-.107-1.152-.123l-.953-.012l-.024.111c-.012.064-.096.525-.183 1.03s-.171.96-.183 1.022l-.024.112zm6-.008l-.025.111c-.04.186-1.415 8.014-1.415 8.053a11 11 0 0 0 1.387.035l-.019.001h1.369l.04-.21c.025-.111.16-.871.302-1.686c.14-.8.297-1.6.342-1.75a2.61 2.61 0 0 1 1.727-1.805l.018-.005a2.3 2.3 0 0 1 .833-.09h-.007c.499 0 .53-.005.545-.08c.045-.195.452-2.57.445-2.593a.7.7 0 0 0-.292-.031h.003h-.021q-.24 0-.47.038l.017-.002a3.45 3.45 0 0 0-1.603.813l.003-.003q-.44.406-.756.912l-.011.019a.4.4 0 0 1-.094.144c.015-.157.037-.297.066-.435l-.004.024c.166-.885.076-1.192-.4-1.371a5.3 5.3 0 0 0-1.067-.071h.008zm9.704-.026h-.141q-.354 0-.691.064l.023-.004a4.13 4.13 0 0 0-2.869 2.195l-.011.024a3.5 3.5 0 0 0-.429 1.84v-.007l-.002.139q0 .393.069.767l-.004-.026a4.18 4.18 0 0 0 1.879 2.674l.018.01c.276.177.595.325.933.427l.027.007c.025-.018.139-.633.247-1.233l.218-1.213l-.103-.08a2 2 0 0 1-.635-.721l-.005-.011a1.1 1.1 0 0 1-.147-.722l-.001.006a1.15 1.15 0 0 1 .131-.698l-.003.006c.228-.47.651-.815 1.161-.931l.011-.002c.08-.008.151-.031.151-.052c0-.054.4-2.314.422-2.394c-.015-.056-.07-.064-.249-.064z"
            />
          </svg>
        </div>

        <!-- Copyright -->
        <div class="border-t border-gray-700 pt-4 mt-2">
          <div class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div class="text-sm text-gray-400">
              &copy; {{ new Date().getFullYear() }} TARİMSEPETİM -
              Mühendisler Ticaret Kollektif Şirketi'nin tescilli markasıdır.
              Tüm hakları saklıdır.
            </div>
            <div class="flex items-center space-x-2 text-sm text-gray-400">
             
              <span class="mr-2">Tasarım & Geliştirme:</span>
              <a 
                href="https://www.linkedin.com/in/fatih-%C3%A7a%C4%9F%C4%B1rgan-151b892a5/"
                target="_blank"
                rel="noopener noreferrer"
                class="text-green-500 hover:text-green-400 transition-colors duration-200 font-semibold"
              >
                Fatih Çağırgan
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Yukarı Çık Butonu -->
    <button
      @click="scrollToTop"
      v-show="showScrollTop"
      class="fixed bottom-8 right-8 bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-110"
    >
      <iconify-icon
        icon="mdi:arrow-up"
        class="text-white"
        width="24"
      ></iconify-icon>
    </button>
  </footer>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const showScrollTop = ref(false);

// Dropdown sections state
const sections = ref({
  kurumsal: false,
  musteri: false,
  iletisim: false
});

// Toggle section visibility
const toggleSection = (section) => {
  if (window.innerWidth < 640) { // Sadece mobil görünümde çalışsın
    sections.value[section] = !sections.value[section];
  }
};

// Scroll to top functions
const checkScroll = () => {
  showScrollTop.value = window.pageYOffset > 300;
};

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

// Lifecycle hooks
onMounted(() => {
  window.addEventListener("scroll", checkScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", checkScroll);
});
</script>

<style scoped>
/* Sadece spin animasyonu için gerekli stil */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.icon-[fontisto--loading] {
  animation: spin 1s linear infinite;
}
</style>
