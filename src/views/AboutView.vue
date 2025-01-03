<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <section class="relative bg-primary-dark py-20 text-white">
      <div class="absolute inset-0 bg-gray-100 opacity-10"></div>
      <div class="container mx-auto px-4 relative">
        <h1 class="text-4xl md:text-5xl font-bold mb-4">Mühendisler Ticaret Hakkında</h1>
        <p class="text-xl md:text-2xl text-gray-200 max-w-2xl">
          Tarımsal ürünlerde kalite ve güvenin adresi. 1950'dan beri çiftçilerimizin yanındayız.
        </p>
      </div>
    </section>

    <!-- Şirket Tanıtımı -->
    <section class="py-16 bg-white">
      <div class="container mx-auto px-4">
        <div class="flex flex-col md:flex-row gap-8 items-start">
          
          <!-- Şirket Bilgileri -->
          <div class="md:w-2/3 space-y-6">
            <h2 class="text-3xl font-bold text-gray-800">Şirket Hikayemiz</h2>
            <p class="text-gray-600 leading-relaxed">
              1950 yılında Konya'da kurulan Mühendisler Ticaret, tarım sektöründe güvenilir ve kaliteli hizmet sunma vizyonuyla yola çıktı. Bugün, modern tarım tekniklerini ve yenilikçi çözümleri çiftçilerimizle buluşturuyoruz.
            </p>
            <div class="space-y-4">
              <h3 class="text-xl font-semibold text-gray-800">Misyonumuz</h3>
              <p class="text-gray-600">
                Çiftçilerimize en kaliteli tarım ürünlerini sunarak, sürdürülebilir tarımın gelişimine katkıda bulunmak.
              </p>
              <h3 class="text-xl font-semibold text-gray-800">Vizyonumuz</h3>
              <p class="text-gray-600">
                Türkiye'nin lider tarımsal ürün tedarikçisi olmak ve çiftçilerimizin başarısına ortak olmak.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Neden Biz? -->
    <section class="py-16 bg-gray-50">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center text-gray-800 mb-12">Neden Biz?</h2>
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <!-- Kalite -->
          <div class="bg-white p-6 rounded-lg shadow-md text-center">
            <div class="w-16 h-16 mx-auto mb-4 text-primary-dark">
              <iconify-icon icon="mdi:shield-check" width="64"></iconify-icon>
            </div>
            <h3 class="text-xl font-semibold mb-2">Kalite Garantisi</h3>
            <p class="text-gray-600">En yüksek kalitede ürünler ve güvenilir tedarik zinciri</p>
          </div>

          <!-- Deneyim -->
          <div class="bg-white p-6 rounded-lg shadow-md text-center">
            <div class="w-16 h-16 mx-auto mb-4 text-primary-dark">
              <iconify-icon icon="mdi:trophy" width="64"></iconify-icon>
            </div>
            <h3 class="text-xl font-semibold mb-2">70+ Yıl Deneyim</h3>
            <p class="text-gray-600">Sektörde uzun yıllara dayanan bilgi ve tecrübe</p>
          </div>

          <!-- Ürün Çeşitliliği -->
          <div class="bg-white p-6 rounded-lg shadow-md text-center">
            <div class="w-16 h-16 mx-auto mb-4 text-primary-dark">
              <iconify-icon icon="mdi:sprout" width="64"></iconify-icon>
            </div>
            <h3 class="text-xl font-semibold mb-2">Geniş Ürün Yelpazesi</h3>
            <p class="text-gray-600">1000+ çeşit tarımsal ürün ve ekipman</p>
          </div>

          <!-- Destek -->
          <div class="bg-white p-6 rounded-lg shadow-md text-center">
            <div class="w-16 h-16 mx-auto mb-4 text-primary-dark">
              <iconify-icon icon="mdi:headset" width="64"></iconify-icon>
            </div>
            <h3 class="text-xl font-semibold mb-2">Teknik Destek</h3>
            <p class="text-gray-600">
              Uzman ekibimizden 7/24 teknik destek
            </p>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import CountUp from 'vue-countup-v3'

// Sayfa yüklendiğinde en üste scroll
onMounted(() => {
  window.scrollTo(0, 0)
})
</script>

<style scoped>
.bg-primary-dark {
  background-color: #234726;
}
</style>
