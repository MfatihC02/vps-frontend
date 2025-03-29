<template>
  <div class="flex flex-col min-h-screen w-full">
    <!-- InfoBar: Sabit üst çubuk -->
    <div class="fixed top-0 left-0 right-0 z-50">
      <Header class="flex-shrink-0 w-full" />

    </div>

    <!-- Kampanya Banner -->
    <CampaignBanner />

    <!-- Ana İçerik: Header, Main ve Footer -->
    <div class="flex flex-col flex-grow w-full mt-[70px]">
      <InfoBar />

      <main class="flex-grow w-full">
        <router-view v-slot="{ Component }">
          <div>
            <component :is="Component" />
          </div>
        </router-view>
      </main>
      <Footer class="flex-shrink-0 footer w-full" />
    </div>
  </div>
</template>

<script>
import { onMounted } from 'vue';
import { useAuthStore } from './stores/authStore';
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";
import InfoBar from "@/components/InfoBar.vue";
import CampaignBanner from "@/components/CampaignBanner.vue";

export default {
  name: "App",
  components: {
    Header,
    Footer,
    InfoBar,
    CampaignBanner,
  },
  setup() {
    const authStore = useAuthStore();

    // Uygulama başlangıcında oturum kontrolü yap
    onMounted(() => {
      authStore.checkAuth();
    });
  }
};
</script>

<style>
/* Temel layout stilleri */
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  overflow-x: hidden; /* Yatay kaymayı önle */
}

/* Layout shift önleme */
main {
  flex: 1 0 auto;
  min-height: 500px;
  width: 100%;
  contain: layout; /* Layout shift'i azalt */
  content-visibility: auto; /* Görünür olmayan içeriği optimize et */
}

.footer {
  flex-shrink: 0;
  min-height: 400px; /* Minimum yükseklik */
  width: 100%;
  display: grid; /* Grid layout kullanarak içeriği düzenle */
  grid-template-rows: auto 1fr; /* İçeriği otomatik boyutlandır */
  contain: layout; /* Sadece layout containment uygula */
  content-visibility: auto; /* Görünür olmayan içeriği optimize et */
  contain-intrinsic-size: 0 400px; /* Tahmini boyut belirt */
}

/* Sayfa geçiş animasyonları */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease;
  will-change: opacity; /* GPU hızlandırma */
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}

/* Mobil optimizasyonları */
@media (max-width: 768px) {
  main {
    min-height: 300px;
  }
  
  .footer {
    min-height: auto; /* Otomatik yükseklik */
    padding-bottom: env(safe-area-inset-bottom, 0); /* Safe area desteği */
    contain-intrinsic-size: 0 300px; /* Mobil için tahmini boyut */
  }

  /* Touch cihazlar için scroll optimizasyonu */
  * {
    -webkit-overflow-scrolling: touch;
  }

  /* Mobil için daha küçük boşluk */
  .mt-[60px] {
    margin-top: 40px;
  }
}
</style>
