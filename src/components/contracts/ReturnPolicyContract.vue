<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8">
      <h1 class="text-3xl font-bold text-center text-gray-900 mb-8">İADE VE İPTAL SÖZLEŞMESİ</h1>
      
      <!-- Madde 1: Taraflar -->
      <div class="mb-8">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Madde 1: Taraflar</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-3">
            <h3 class="font-medium text-gray-700">Satıcı:</h3>
            <p class="text-gray-600">Ünvanı: Mühendisler Ticaret Kollektif Şirketi</p>
            <p class="text-gray-600">Adresi: Şükran Mah. Sahibi Ata Cad. 38 Meram, Konya</p>
            <p class="text-gray-600">Telefon: 03323513128</p>
            <p class="text-gray-600">E-posta: iletisim@tarimsepetim.com.tr</p>
          </div>
        </div>
      </div>

      <!-- Diğer Maddeler -->
      <div class="space-y-8">
        <div v-for="(madde, index) in maddeler" :key="index" class="border-t pt-6">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">{{ madde.baslik }}</h2>
          <div class="prose prose-gray max-w-none" v-html="madde.icerik"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ReturnPolicyContract',
  data() {
    return {
      maddeler: [
        {
          baslik: 'Madde 2: Sözleşmenin Konusu',
          icerik: 'Bu sözleşme, Alıcı\'nın Satıcı\'ya ait [Web Sitesi Adresi] internet sitesinden elektronik ortamda siparişini yaptığı zirai ürünlerin (tohum, gübre, zirai aletler vb.) satışı ve teslimi ile ilgili olarak tarafların hak ve yükümlülüklerini düzenler.'
        },
        {
          baslik: 'Madde 3: Tanımlar',
          icerik: `
            <p class="mb-3">Ürün: Satıcı tarafından satışa sunulan zirai ürünler.</p>
            <p>Cayma Hakkı: Alıcı'nın, herhangi bir gerekçe göstermeksizin ve cezai şart ödemeksizin sözleşmeden dönme hakkı.</p>
          `
        },
        {
          baslik: 'Madde 4: Cayma Hakkı',
          icerik: `
            <p class="mb-3">4.1. Alıcı, sözleşme konusu ürünün kendisine veya gösterdiği adresteki kişi/kuruluşa tesliminden itibaren 14 (on dört) gün içinde cayma hakkını kullanabilir.</p>
            <p>4.2. Cayma hakkının kullanılması için bu süre içinde Satıcı'ya [E-posta Adresi] üzerinden yazılı bildirimde bulunulması ve ürünün işbu sözleşmede belirtilen iade şartlarına uygun olması gerekmektedir.</p>
          `
        },
        {
          baslik: 'Madde 5: İade Şartları',
          icerik: `
            <p class="mb-3">5.1. İade edilecek ürünlerin, orijinal ambalajında, kullanılmamış, hasarsız ve tekrar satılabilirlik özelliğini kaybetmemiş olması gerekmektedir.</p>
            <p class="mb-3">5.2. Ürünlerin orijinalliğinin ve bütünlüğünün korunması amacıyla, ürünler üzerinde Satıcı tarafından uygulanan belirli kontroller ve işaretlemeler bulunmaktadır. İade işlemlerinde, bu kontroller ve işaretlemelerin doğruluğu esas alınacaktır.</p>
            <p>5.3. İade işlemi sırasında, ürünle birlikte orijinal fatura ve varsa tüm aksesuarların eksiksiz olarak gönderilmesi zorunludur.</p>
          `
        },
        {
          baslik: 'Madde 6: İade Prosedürü',
          icerik: `
            <p class="mb-3">6.1. Alıcı, iade talebini [E-posta Adresi] üzerinden Satıcı'ya iletmelidir.</p>
            <p class="mb-3">6.2. İade talebinin onaylanmasının ardından, ürün, Alıcı tarafından belirlenen kargo firması aracılığıyla Satıcı'ya gönderilmelidir. İade kargo masrafları Alıcı'ya aittir.</p>
            <p>6.3. Satıcı, iade edilen ürünü teslim aldıktan sonra, ürünün iade şartlarına uygunluğunu kontrol eder ve uygun olması halinde, cayma bildiriminin kendisine ulaştığı tarihten itibaren en geç 14 (on dört) gün içinde ürün bedelini Alıcı'ya iade eder.</p>
          `
        },
        {
          baslik: 'Madde 7: Cayma Hakkının Kullanılamayacağı Durumlar',
          icerik: `
            <p class="mb-3">7.1. Niteliği itibarıyla iade edilemeyecek ürünler, hızlı bozulan veya son kullanma tarihi geçme ihtimali olan ürünler, tek kullanımlık ürünler, hijyenik nedenlerle iadesi uygun olmayan ürünler cayma hakkı kapsamında değildir.</p>
            <p>7.2. Ambalajı açılmış, kullanılmış, tahrip edilmiş, ürün paketi üstündeki işaret veya işaretler sökülmüş,tahrib edilmiş veya bu işaretler yoksa  veya orijinalliğini kaybetmiş ürünlerin iadesi kabul edilmez.</p>
          `
        },
        {
          baslik: 'Madde 8: Uyuşmazlıkların Çözümü',
          icerik: 'Taraflar arasında işbu sözleşmeden doğabilecek uyuşmazlıkların çözümünde, Konya Tüketici Hakem Heyetleri ve Tüketici Mahkemeleri yetkilidir.'
        },
        {
          baslik: 'Madde 9: Ek Garantiler ve Sorumluluk Reddi',
          icerik: `
            <p class="mb-3">9.1. Satıcı, ürünlerin orijinalliğini ve kalitesini garanti eder. Ancak, ürünlerin yanlış kullanımı, depolanması veya taşınmasından kaynaklanan hasar ve kayıplardan sorumlu değildir.</p>
            <p>9.2. Satıcı, ürünlerin kullanımından doğabilecek dolaylı veya dolaysız zararlardan sorumluluk kabul etmez.</p>
          `
        },
        {
          baslik: 'Madde 10: Yürürlük',
          icerik: 'Bu sözleşme, elektronik ortamda onaylandığı tarihte yürürlüğe girer.'
        }
      ]
    }
  }
}
</script>
