<template>
  <div class="w-full py-6 md:max-w-4xl md:mx-auto">
    <!-- Swiper Carousel (Mobil ve Desktop için) -->
    <div class="px-4 md:px-0">
      <swiper-container ref="swiperEl" init="false">
        <swiper-slide v-for="(badge, index) in badges" :key="index">
          <div class="flex items-center justify-center p-4 bg-gray-50 rounded-lg h-20">
            <component :is="badge.icon" class="w-6 h-6 mr-3 text-emerald-600 shrink-0" />
            <span class="text-sm text-gray-700 text-center">{{ badge.text }}</span>
          </div>
        </swiper-slide>
      </swiper-container>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
// Swiper Web Component'i import et
import { register } from 'swiper/element/bundle';
// Gerekli Lucide ikonlarını import et
import { ShieldCheck, Truck, BadgeCheck, MessageSquareHeart } from 'lucide-vue-next';

// Swiper elementlerini kaydet
register();

const swiperEl = ref(null);

// Güven rozetleri verisi (İkonları ve metinleri buradan değiştirebilirsiniz)
const badges = ref([
  { icon: ShieldCheck, text: 'Güvenli Ödeme ile %100 Koruma' },
  { icon: Truck, text: 'Hızlı ve Güvenilir Kargo İmkanı' },
  { icon: BadgeCheck, text: 'Yüksek Kalite ve Güven Garantisi' },
  { icon: MessageSquareHeart, text: 'Müşteri Memnuniyeti Odaklı Hizmet' },
  // İhtiyaca göre daha fazla rozet eklenebilir
]);

// Swiper yapılandırması
const swiperOptions = {
  // Varsayılan (mobil) ayarlar
  slidesPerView: 1,
  spaceBetween: 16,
  pagination: {
    clickable: true,
  },
  loop: true,
  autoplay: {
    delay: 5000,
    disableOnInteraction: false,
  },
  // Breakpoint'ler ile desktop ayarları
  breakpoints: {
    // 768px (md) ve üzeri ekranlar için
    768: {
      slidesPerView: 3, // Orta ekranlarda 3 rozet göster
      spaceBetween: 20
    },
    // 1024px (lg) ve üzeri ekranlar için
    1024: {
      slidesPerView: 4, // Geniş ekranlarda 4 rozet göster
      spaceBetween: 24
    }
  },
  injectStyles: [ // Pagination noktalarının stillerini özelleştirmek için
    `
    :host .swiper-pagination-bullet {
      background-color: #10b981; /* Emerald-600 */
      opacity: 0.5;
      transition: opacity 0.3s;
    }
    :host .swiper-pagination-bullet-active {
      opacity: 1;
    }
    `,
  ],
};

onMounted(() => {
  if (swiperEl.value) {
    // Swiper yapılandırmasını ata
    Object.assign(swiperEl.value, swiperOptions);
    // Swiper'ı başlat
    swiperEl.value.initialize();
  }
});
</script>

<style scoped>
/* Swiper Container'a ek stil gerekirse buraya eklenebilir */
swiper-container {
  width: 100%;
  padding-bottom: 30px; /* Pagination için yer aç */
}

swiper-slide {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
