<!-- PartnerLogos.vue -->
<template>
  <section 
    aria-label="Partner Firmaları" 
    class="py-8 bg-white"
    itemscope 
    itemtype="https://schema.org/Organization"
  >
    <div class="container mx-auto px-4">
      <!-- Görünür başlık (SEO için önemli) -->
      <h2 class="sr-only" itemprop="name">Güvenilir İş Ortaklarımız</h2>
      
      <meta itemprop="name" content="E-Ticaret Sitesi İş Ortakları" />
      <meta itemprop="description" content="Türkiye'nin önde gelen tohum ve tarım ürünleri tedarikçileri ile güvenilir iş ortaklığımız" />
      
      <!-- Swiper Slider -->
      <swiper
        :modules="modules"
        :slides-per-view="slidesPerView"
        :space-between="40"
        :loop="true"
        :autoplay="{
          delay: 3000,
          disableOnInteraction: false,
        }"
        class="partner-logos-slider"
      >
        <swiper-slide 
          v-for="(partner, index) in partners" 
          :key="index"
          itemscope 
          itemtype="https://schema.org/Brand"
        >
          <figure class="logo-container">
            <a 
              :href="partner.website" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="block"
              itemprop="url"
            >
              <img
                :src="partner.logo"
                :alt="partner.description"
                class="partner-logo"
                loading="lazy"
                itemprop="logo"
              />
              <meta itemprop="name" :content="partner.name" />
              <meta itemprop="description" :content="partner.description" />
            </a>
          </figure>
        </swiper-slide>
      </swiper>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/autoplay';

const modules = [Autoplay];

const slidesPerView = computed(() => {
  const width = window.innerWidth;
  if (width < 640) return 2;
  if (width < 1024) return 3;
  if (width < 1280) return 4;
  return 5;
});

// Partner verileri - SEO için zenginleştirilmiş
const partners = ref([
  {
    name: 'BT Tohum',
    logo: '/images/partners/btlogo.jpg',
    website: 'https://www.bttohum.com.tr',
    description: 'BT Tohum - Türkiye\'nin önde gelen tohum üreticisi ve tedarikçisi'
  },
  {
    name: 'Koç Ziraat',
    logo: '/images/partners/kçlogo.jpg',
    website: 'https://www.kocziraat.com.tr',
    description: 'Koç Ziraat - Tarım ürünleri ve ekipmanları konusunda lider tedarikçi'
  },
  {
    name: 'May Tohum',
    logo: '/images/partners/mayt.png',
    website: 'https://www.may.com.tr',
    description: 'May Tohum - 40 yılı aşkın tecrübesiyle Türkiye\'nin güvenilir tohum markası'
  },
  {
    name: 'Nunhems',
    logo: '/images/partners/nunhems.jpg',
    website: 'https://www.nunhems.com/tr',
    description: 'Nunhems - Profesyonel sebze tohumu üretimi ve AR-GE çalışmaları'
  },
  {
    name: 'Vilmorin',
    logo: '/images/partners/vilmorin.png',
    website: 'https://www.vilmorin.com.tr',
    description: 'Vilmorin - Dünya çapında tanınan tohum ve tarım ürünleri markası'
  },
  {
    name: 'Zeta',
    logo: '/images/partners/zeta.png',
    website: 'https://www.zeta.com.tr',
    description: 'Zeta - Kaliteli tarım ürünleri ve gübre çözümleri'
  }
]);
</script>

<style scoped>
.partner-logos-slider {
  width: 100%;
  padding: 1.5rem 0;
}

.partner-logos-slider :deep(.swiper-slide) {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80px;
}

.logo-container {
  width: 200px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  background: white;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.partner-logo {
  max-width: 180px;
  max-height: 60px;
  width: auto;
  height: auto;
  object-fit: contain;
  transition: all 0.3s ease;
}

.logo-container:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

/* Swiper container için özel stil */
:deep(.swiper-wrapper) {
  align-items: center;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

</style>
