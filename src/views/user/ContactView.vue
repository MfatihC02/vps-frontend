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
                <p class="text-gray-600">Şükran Mah. Sahibi Ata Cad. No:38</p>
                <p class="text-gray-600">Meram, Konya</p>
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
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d196.8530322395173!2d32.49953041739535!3d37.86851383552356!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14d085044c52cb69%3A0xc90d2033b9571d37!2sSahibiata%20Cd.%20No%3A38!5e0!3m2!1str!2str!4v1735197374559!5m2!1str!2str" 
                width="100%" 
                height="300" 
                style="border:0;" 
                allowfullscreen="" 
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
                class="rounded-lg"
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
