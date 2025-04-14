<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8">
      <h1 class="text-3xl font-bold text-center text-gray-900 mb-8">
        KİŞİSEL VERİLERİN KORUNMASI VE GİZLİLİK SÖZLEŞMESİ
      </h1>

      <!-- Giriş -->
      <div class="prose prose-gray max-w-none mb-8">
        <p>
          Bu sözleşme ("Sözleşme"), Mühendisler Ticaret Kollektif Şirketi
          ("Şirket") tarafından, internet sitesi, mobil uygulama ve diğer
          elektronik ortamlarda toplanan kişisel verilerin işlenmesi,
          saklanması, aktarılması ve korunması hususlarında veri sahiplerine
          sunulan bilgi ve taahhütleri düzenlemek amacıyla hazırlanmıştır. İşbu
          Sözleşme; 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK")
          başta olmak üzere ilgili tüm mevzuata uygun olarak düzenlenmiştir.
        </p>
      </div>

      <!-- Maddeler -->
      <div class="space-y-8">
        <div
          v-for="(section, index) in sections"
          :key="index"
          class="border-t pt-6"
        >
          <h2 class="text-xl font-semibold text-gray-800 mb-4">
            {{ section.title }}
          </h2>
          <div
            class="prose prose-gray max-w-none"
            v-html="section.content"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "PrivacyPolicyContract",
  data() {
    return {
      sections: [
        {
          title: "1. AMAÇ VE KAPSAM",
          content: `
            <h3 class="text-lg font-medium mb-2">1.1. Amaç:</h3>
            <p class="mb-4">Bu Sözleşme; Şirket'in işletmesi kapsamında toplanan kişisel verilerin nasıl işleneceğini, hangi amaçlarla kullanılacağını, hangi hukuki dayanaklara ve saklama sürelerine tabi olacağını, veri sahiplerinin haklarını ve Şirket'in bu veriler karşısındaki sorumluluklarını açıklamak amacıyla hazırlanmıştır.</p>
            
            <h3 class="text-lg font-medium mb-2">1.2. Kapsam:</h3>
            <p>Sözleşme; Şirket'in internet sitesi, mobil uygulama ve benzeri platformlarında veri toplama, işleme, saklama, aktarma ve koruma faaliyetlerini kapsar. Sözleşme kapsamında, gerçek kişilere ait kişisel veriler (ör. ad, soyad, iletişim bilgileri, kimlik ve finansal bilgiler, IP adresi vb.) düzenlenir.</p>
          `,
        },
        {
          title: "2. VERİ SORUMLUSU",
          content: `
            <p class="mb-4">Şirket, toplanan kişisel verilerin işlenmesinde "Veri Sorumlusu" sıfatıyla hareket eder.</p>
            <p class="font-medium mb-2">İletişim Bilgileri:</p>
            <ul class="list-none space-y-2">
              <li>Şirket Ünvanı: Mühendisler Ticaret Kollektif Şirketi</li>
              <li>Adres: Musalla Bağlılar Mah, Yeni İstanbul Cd. No:8 Selçuklu, Konya</li>
              <li>E-posta: iletisim@tarimsepetim.com.tr</li>
              <li>Telefon: 0332 235 11 28</li>
            </ul>
          `,
        },
        {
          title: "3. TOPLANAN KİŞİSEL VERİLER VE HUKUKİ DAYANAKLARI",
          content: `
            <h3 class="text-lg font-medium mb-2">3.1. Toplanan Kişisel Veri Kategorileri:</h3>
            <ul class="list-disc pl-5 mb-4 space-y-2">
              <li>Kimlik ve İletişim Bilgileri: Ad, soyad, e-posta adresi, telefon numarası, teslimat adresi</li>
              <li>Finansal Bilgiler: Kredi kartı bilgileri, sipariş geçmişi, ödeme bilgileri</li>
              <li>İşlem Güvenliği Bilgileri: IP adresi, kullanıcı adı/şifre, sistem giriş/çıkış kayıtları</li>
              <li>Pazarlama ve İletişim Bilgileri: E-posta tercihleri, iletişim izinleri</li>
            </ul>

            <h3 class="text-lg font-medium mb-2">3.2. Hukuki Dayanaklar:</h3>
            <ul class="list-disc pl-5 space-y-2">
              <li>Sözleşmenin kurulması ve ifası için zorunluluk (KVKK Md. 5/2(c))</li>
              <li>Yasal yükümlülüklerin yerine getirilmesi (KVKK Md. 5/2(ç), 5/2(e))</li>
              <li>Şirket'in meşru menfaatleri kapsamında veri işlenmesi (KVKK Md. 5/2(f))</li>
              <li>Açık rıza esasına dayalı işleme (KVKK Md. 5/1) – yalnızca pazarlama ve benzeri ilave işlemler için</li>
            </ul>
          `,
        },
        {
          title: "4. KİŞİSEL VERİLERİN İŞLENME AMAÇLARI",
          content: `
            <ul class="list-disc pl-5 space-y-2">
              <li>Üyelik ve Hesap Yönetimi: Üyelik oluşturulması, hesap yönetimi, sipariş işlemleri ve teslimat süreçlerinin gerçekleştirilmesi.</li>
              <li>Ödeme İşlemleri: Ödeme süreçlerinin güvenli şekilde yürütülmesi ve mali kayıtların tutulması.</li>
              <li>Güvenlik: Platform güvenliğinin sağlanması, şüpheli işlemlerin tespiti ve önlenmesi.</li>
              <li>Yasal Yükümlülükler: Vergi, muhasebe, mesafeli satış ve diğer yasal düzenlemelere uygunluk sağlanması.</li>
              <li>Pazarlama (Açık Rıza İle): Sadece ilgili veri sahibinin açık rızası varsa pazarlama ve reklam iletişimleri.</li>
            </ul>
          `,
        },
        {
          title: "5. GÜVENLİK ÖNLEMLERİ",
          content: `
            <p class="mb-4">Şirket, kişisel verilerin korunması amacıyla;</p>
            <ul class="list-disc pl-5 space-y-2">
              <li>AES-256 şifreleme, SHA-256 hash algoritması, SSL/TLS protokolleri gibi gelişmiş teknik önlemleri uygular,</li>
              <li>Güvenlik duvarı, saldırı tespit sistemleri, düzenli sızma testleri ve güvenlik eğitimleri ile idari tedbirler alır,</li>
              <li>Erişim yetkilerini periyodik olarak gözden geçirir ve eski hesapları kapatır.</li>
            </ul>
          `,
        },
        {
          title: "6. KİŞİSEL VERİLERİN AKTARILMASI",
          content: `
            <h3 class="text-lg font-medium mb-2">6.1. Yurtiçi Aktarım:</h3>
            <p class="mb-4">Kişisel veriler, ödeme hizmeti sağlayıcıları, kargo şirketleri, hukuk büroları ve yetkili kamu kurumları gibi, yalnızca ilgili hizmetin ifası için gerekli olan üçüncü taraflara aktarılabilir.</p>

            <h3 class="text-lg font-medium mb-2">6.2. Yurtdışı Aktarım:</h3>
            <p>Şirket, kişisel verileri yurtdışına aktarmamaktadır.</p>
          `,
        },
        {
          title: "7. KİŞİSEL VERİ SAHİBİNİN HAKLARI",
          content: `
            <p class="mb-4">KVKK Madde 11 uyarınca veri sahipleri;</p>
            <ul class="list-disc pl-5 space-y-2">
              <li>Kişisel verilerinin işlenip işlenmediğini öğrenme,</li>
              <li>İşlenmişse buna ilişkin bilgi talep etme,</li>
              <li>İşlenme amacını ve kullanımın amaca uygunluğunu sorgulama,</li>
              <li>Eksik veya yanlış işlenen verilerinin düzeltilmesini isteme,</li>
              <li>Verilerinin silinmesini veya yok edilmesini talep etme,</li>
              <li>İşlemlerin üçüncü kişilere bildirilmesini isteme,</li>
              <li>Münhasıran otomatik sistemlerle analiz edilip kişinin aleyhine sonuç doğurulmasına itiraz etme,</li>
              <li>Kanuna aykırı işlenme nedeniyle zararın giderilmesini talep etme haklarına sahiptir.</li>
            </ul>
          `,
        },
        {
          title: "8. BAŞVURU VE İLETİŞİM",
          content: `
            <p class="mb-4">Veri sahipleri, kişisel verileriyle ilgili taleplerini;</p>
            <ul class="list-disc pl-5 mb-4 space-y-2">
              <li>Yazılı olarak Şirketin iletişim adresine,</li>
              <li>Sistemimizde kayıtlı e-posta adresiniz üzerinden veya</li>
              <li>Aşağıda belirtilen diğer iletişim kanalları aracılığıyla iletebilirler.</li>
            </ul>

            <p class="font-medium mb-2">İletişim Bilgileri:</p>
            <ul class="list-none space-y-2 mb-4">
              <li>Adres: Musalla Bağlılar Mah, Yeni İstanbul Cd. No:8 Selçuklu, Konya</li>
              <li>E-posta: iletisim@tarimsepetim.com.tr</li>
              <li>Telefon: 0332 235 11 28 </li>
            </ul>

            <p>Başvurulara en geç 30 gün içinde yanıt verilecektir.</p>
          `,
        },
        {
          title: "9. SORUMLULUĞUN SINIRLANMASI",
          content: `
            <h3 class="text-lg font-medium mb-2">9.1. Genel Sorumluluk:</h3>
            <p class="mb-4">Şirket, kişisel verilerin korunması için gerekli tüm teknik ve idari tedbirleri uygulamış olsa dahi, tüm özeni göstermesine rağmen meydana gelebilecek veri ihlallerinde, ancak Şirket'in kasıtlı veya ağır ihmal durumları tespit edildiğinde sorumluluğu artar.</p>

            <h3 class="text-lg font-medium mb-2">9.2. Sınırlayıcı Hüküm:</h3>
            <ul class="list-disc pl-5 mb-4 space-y-2">
              <li>Şirket, veri ihlali sonucu ortaya çıkabilecek zararlardan, kasıt veya ağır ihmalin varlığı ispatlanmadıkça, hukuki sorumluluğunu sınırlı tutar.</li>
              <li>Şirketin, KVKK kapsamında öngörülen teknik ve idari tedbirleri eksiksiz olarak uyguladığı durumlarda, ihlale bağlı dolaylı zarar ve zararın tazmini hususunda sorumluluğu, yasal sınırlar dahilinde sınırlı tutulur.</li>
            </ul>

            <h3 class="text-lg font-medium mb-2">9.3. İstisnalar:</h3>
            <ul class="list-disc pl-5 space-y-2">
              <li>Ancak, veri işleme sürecinde kasıtlı hareket veya ağır ihmal tespit edilirse, Şirketin sorumluluğu tam olarak gündeme gelebilir.</li>
              <li>Bu madde, satıcı lehine risk azaltıcı bir uygulama olarak öne çıkmakla birlikte, veri sahiplerinin KVKK'da öngörülen haklarını ihmal etmemek amacıyla, Şirket'in yükümlülüklerini tamamen ortadan kaldırmaz.</li>
            </ul>
          `,
        },
        {
          title: "10. POLİTİKANIN GÜNCELLENMESİ",
          content: `
            <p>Şirket, yasal değişiklikler, ticari kararlar veya veri işleme süreçlerindeki güncellemeler doğrultusunda işbu Sözleşme'yi güncelleyebilir. Güncellemeler, Şirket'in internet sitesi üzerinden duyurulacak ve yeni metin yayınlandığı tarihte yürürlüğe girecektir.</p>
          `,
        },
        {
          title: "11. YÜRÜRLÜK",
          content: `
            <p>İşbu Sözleşme, taraflarca elektronik ortamda onaylandığı tarihte yürürlüğe girer.</p>
          `,
        },
        {
          title: "12. DİĞER HÜKÜMLER",
          content: `
            <ul class="list-disc pl-5 space-y-2">
              <li>İşbu Sözleşme, KVKK ve ilgili mevzuat hükümleriyle çeliştiği durumlarda, mevzuat hükümleri esas alınır.</li>
              <li>Taraflar, kişisel verilerin işlenmesi ve aktarılması hususundaki uyuşmazlıkların çözümünde, ilgili mevzuata uygun olarak hareket edecektir.</li>
            </ul>
          `,
        },
      ],
    };
  },
};
</script>
