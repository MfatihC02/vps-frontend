<template>
  <div class="flex flex-col min-h-screen w-full">
    <!-- InfoBar: Sabit üst çubuk -->
    <div class="fixed top-0 left-0 right-0 z-50">
      <Header class="flex-shrink-0 w-full" />

    </div>

 

    <!-- Ana İçerik: Header, Main ve Footer -->
    <div class="flex flex-col flex-grow w-full mt-[70px]">
      <InfoBar />

      <main class="flex-grow min-h-[calc(100vh-100px)]">
        <router-view v-slot="{ Component }">
          <div>
            <component :is="Component" />
          </div>
        </router-view>
      </main>
      <Footer class="flex-shrink-0 h-[700px]" />
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
  overflow-x: hidden;
}

/* Layout shift önleme */
main {
  flex: 1 0 auto;
  width: 100%;
  contain: layout;
  content-visibility: auto;
}

.footer {
  height: 300px;
  flex-shrink: 0;
  contain: size layout;
  content-visibility: auto;
}

/* Sayfa geçiş animasyonları */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease;
  will-change: opacity;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}

/* Mobil optimizasyonları */
@media (max-width: 768px) {
  main {
    min-height: calc(100vh - 370px);
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

/* Mobilde boşlukları azalt */
@media (max-width: 640px) {
  .mt-[70px], .mt-[60px] {
    margin-top: 16px !important;
  }
  .mb-6, .mb-4, .mb-8, .my-6, .my-8 {
    margin-bottom: 12px !important;
    margin-top: 12px !important;
  }
  .p-6, .px-6, .py-6 {
    padding: 12px !important;
  }
  .rounded-xl, .rounded-lg {
    border-radius: 0.75rem;
  }
  .shadow-sm, .shadow-md {
    box-shadow: 0 1px 6px 0 rgba(0,0,0,0.06);
  }
  .card, .info-card, .feature-card {
    margin-bottom: 12px !important;
    margin-top: 0 !important;
  }
  .campaign-banner {
    margin-bottom: 8px !important;
  }
}
</style>
