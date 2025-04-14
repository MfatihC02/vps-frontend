<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <!-- Hero Section -->
    <div class="relative bg-green-700 text-white py-16 mb-12">
      <div class="absolute inset-0 bg-black opacity-40"></div>
      <div class="relative container mx-auto px-4">
        <div class="max-w-4xl mx-auto text-center">
          <h1 class="text-4xl md:text-5xl font-bold mb-4">İletişim</h1>
          <p class="text-lg md:text-xl opacity-90">Sorularınız için bize ulaşın</p>
        </div>
      </div>
    </div>

    <div class="container mx-auto px-4">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
        <!-- İletişim Bilgileri -->
        <div class="space-y-8">
          <div class="bg-white rounded-2xl shadow-xl p-8 space-y-6">
            <h2 class="text-2xl font-bold text-gray-800 mb-6">İletişim Bilgileri</h2>
            
            <!-- Firma Adı -->
            <div class="flex items-start space-x-4">
              <div class="bg-green-100 p-3 rounded-lg">
                <i class="iconify text-2xl text-green-600" data-icon="mdi:office-building"></i>
              </div>
              <div>
                <h3 class="font-semibold text-gray-800">Firma</h3>
                <p class="text-gray-600">MÜHENDİSLER TİCARET - MÜHENDİSLER TİC.KOLL.ŞTİ.</p>
              </div>
            </div>

            <!-- Adres -->
            <div class="flex items-start space-x-4">
              <div class="bg-green-100 p-3 rounded-lg">
                <i class="iconify text-2xl text-green-600" data-icon="mdi:map-marker"></i>
              </div>
              <div>
                <h3 class="font-semibold text-gray-800">Adres</h3>
                <p class="text-gray-600"> MUSALLA BAĞLARI MAH, Yeni İstanbul Cd. NO:8</p>
                <p class="text-gray-600">Selçuklu, Konya</p>
              </div>
            </div>

            <!-- Telefon -->
            <div class="flex items-start space-x-4">
              <div class="bg-green-100 p-3 rounded-lg">
                <i class="iconify text-2xl text-green-600" data-icon="mdi:phone"></i>
              </div>
              <div>
                <h3 class="font-semibold text-gray-800">Telefon</h3>
                <a href="tel:03323513128" class="text-gray-600 hover:text-green-600 transition-colors">0332 351 31 28</a>
              </div>
            </div>

            <!-- E-posta -->
            <div class="flex items-start space-x-4">
              <div class="bg-green-100 p-3 rounded-lg">
                <i class="iconify text-2xl text-green-600" data-icon="mdi:email"></i>
              </div>
              <div>
                <h3 class="font-semibold text-gray-800">E-posta</h3>
                <a href="mailto:iletisim@tarimsepetim.com.tr" class="text-gray-600 hover:text-green-600 transition-colors">
                  iletisim@tarimsepetim.com.tr
                </a>
              </div>
            </div>
          </div>

          <!-- Harita -->
          <div class="bg-white rounded-2xl shadow-xl p-8">
            <h2 class="text-2xl font-bold text-gray-800 mb-6">Konum</h2>
            <div class="rounded-lg overflow-hidden">
                            <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3148.548490639054!2d32.497233!3d37.894240499999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cfe07b0899d54f%3A0x436192197f0a8702!2sM%C3%BChendisler%20Tar%C4%B1m%20Ticaret!5e0!3m2!1str!2str!4v1744633619560!5m2!1str!2str"
                width="300"
                height="300"
                style="border: 0"
                allowfullscreen=""
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>

        <!-- İletişim Formu -->
        <div>
          <ContactForm />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import ContactForm from '@/components/ContactForm.vue'
</script>

<style scoped>
.container {
  max-width: 1280px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.grid > div {
  animation: fadeIn 0.6s ease-out forwards;
}

.grid > div:nth-child(2) {
  animation-delay: 0.2s;
}
</style>
