<template>
  <div
    class="w-full bg-gray-100 text-gray-700 py-2 px-2 sm:px-4 supports-[backdrop-filter]:bg-gray-100/95 supports-[backdrop-filter]:backdrop-blur-sm transition-all duration-300"
  >
    <div class="container mx-auto">
      <div class="flex items-center justify-between max-w-7xl mx-auto">
        <!-- Sol taraf - WhatsApp İletişim -->
        <div class="flex items-center">
          <a
            href="https://wa.me/905516419012"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-1 hover:text-green-600 transition-colors duration-200 group"
          >
            <Icon
              icon="mdi:whatsapp"
              class="text-xl text-green-600 shrink-0 transform transition-transform duration-300 group-hover:scale-110"
              aria-hidden="true"
            />
            <span class="text-sm sm:text-base font-bold whitespace-nowrap hidden xs:inline text-green-600">
              WhatsApp Sipariş
            </span>
          </a>
        </div>

        <!-- Orta taraf - Navigasyon Linkleri -->
        <div class="flex items-center space-x-3 sm:space-x-4">
          <router-link
            to="/hakkimizda"
            class="text-xs sm:text-sm hover:text-green-600 transition-colors duration-200"
          >
            Hakkımızda
          </router-link>
          <router-link
            to="/iletisim"
            class="text-xs sm:text-sm hover:text-green-600 transition-colors duration-200"
          >
            İletişim
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";

export default {
  name: "InfoBar",
  components: {
    Icon,
  }
};
</script>

<style scoped>
/* Responsive düzenlemeler */
@media (max-width: 640px) {
  .container {
    width: 100%;
  }
}

/* Extra small devices için özel stil */
@media (max-width: 475px) {
  .xs\:inline {
    display: inline;
  }
}

/* Yüksek DPI ekranlar için */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  :deep(.iconify) {
    width: 1.25em;
    height: 1.25em;
  }
}

/* Icon optimizasyonu */
:deep(.iconify) {
  width: 1em;
  height: 1em;
  vertical-align: -0.125em;
  display: inline-block;
}
</style>
