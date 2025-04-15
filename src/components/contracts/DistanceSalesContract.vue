<template>
  <div v-if="buyerInfo && orderDetails" class="contract-container text-sm">
    <h2 class="text-xl font-semibold mb-6">MESAFELİ SATIŞ SÖZLEŞMESİ</h2>

    <!-- 1. TARAFLAR -->
    <section class="mb-6">
      <h3 class="text-lg font-medium mb-4">1. TARAFLAR</h3>

      <div class="mb-4">
        <h4 class="font-medium mb-2">1.1. SATICI</h4>
        <div class="grid grid-cols-1 gap-2">
          <p>
            <span class="font-medium">Ünvanı:</span>
            {{ props.sellerInfo.companyName }}
          </p>
          <p>
            <span class="font-medium">Adresi:</span>
            {{ props.sellerInfo.address }}
          </p>
          <p>
            <span class="font-medium">Telefon:</span>
            {{ props.sellerInfo.phone }}
          </p>
          <p>
            <span class="font-medium">E-posta:</span>
            {{ props.sellerInfo.email }}
          </p>
          <p>
            <span class="font-medium">Vergi Dairesi</span>
            {{ props.sellerInfo.taxInfo }}
          </p>
        </div>
      </div>

      <div v-if="buyerInfo" class="mb-4">
        <h4 class="font-medium mb-2">1.2. ALICI</h4>
        <div class="grid grid-cols-1 gap-2">
          <p>
            <span class="font-medium">Adı Soyadı/Ünvanı:</span>
            {{ buyerInfo.fullName }}
          </p>
          <p>
            <span class="font-medium">Adresi:</span> {{ buyerInfo.address }}
          </p>
          <p><span class="font-medium">Telefon:</span> {{ buyerInfo.phone }}</p>
          <p><span class="font-medium">E-posta:</span> {{ buyerInfo.email }}</p>
        </div>
      </div>
    </section>

    <!-- 2. SÖZLEŞME KONUSU VE KAPSAMI -->
    <section class="mb-6">
      <h3 class="text-lg font-medium mb-4">2. SÖZLEŞME KONUSU VE KAPSAMI</h3>
      <p class="mb-4">
        2.1. İşbu sözleşmenin konusu, ALICI'nın SATICI'ya ait
        {{ props.sellerInfo.website }} internet sitesinden elektronik ortamda
        siparişini verdiği aşağıda nitelikleri ve satış fiyatı belirtilen
        ürün/ürünlerin satışı ve teslimi ile ilgili olarak 6502 sayılı
        Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği
        hükümleri gereğince tarafların hak ve yükümlülüklerinin belirlenmesidir.
      </p>
    </section>

    <!-- 3. SÖZLEŞME KONUSU ÜRÜN/ÜRÜNLER -->
    <section class="mb-6">
      <h3 class="text-lg font-medium mb-4">3. SÖZLEŞME KONUSU ÜRÜN/ÜRÜNLER</h3>
      <div class="mb-4">
        <h4 class="font-medium mb-2">3.1. Ürünlerin Temel Özellikleri</h4>
        <div v-if="orderDetails" class="border rounded-lg overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr class="text-xs md:text-sm">
                <th class="px-2 md:px-4 py-2 text-left">Ürün Adı</th>
                <th class="px-2 md:px-4 py-2 text-left hidden sm:table-cell">
                  Ürün Kodu
                </th>
                <th class="px-2 md:px-4 py-2 text-right">Adet</th>
                <th class="px-2 md:px-4 py-2 text-right hidden md:table-cell">
                  Birim Fiyat
                </th>
                <th class="px-2 md:px-4 py-2 text-right">Toplam</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="item in orderDetails.items"
                :key="item._id"
                class="text-xs md:text-sm hover:bg-gray-50"
              >
                <td class="px-2 md:px-4 py-2">
                  <div>{{ item.product.name }}</div>
                  <div class="text-gray-500 text-xs sm:hidden">
                    {{ item.product.sku }}
                  </div>
                  <div class="text-gray-500 text-xs md:hidden">
                    ₺{{ formatPrice(item.priceWithoutVAT) }} (Birim)
                  </div>
                </td>
                <td class="px-2 md:px-4 py-2 hidden sm:table-cell">
                  {{ item.product.sku }}
                </td>
                <td class="px-2 md:px-4 py-2 text-right">
                  {{ item.quantity }}
                </td>
                <td class="px-2 md:px-4 py-2 text-right hidden md:table-cell">
                  ₺{{ formatPrice(item.priceWithoutVAT) }}
                </td>
                <td class="px-2 md:px-4 py-2 text-right">
                  ₺{{ formatPrice(item.totalPriceWithoutVAT) }}
                </td>
              </tr>
            </tbody>
            <tfoot class="bg-gray-50 text-xs md:text-sm">
              <tr>
                <td colspan="2" class="hidden md:table-cell"></td>
                <td
                  colspan="2"
                  class="px-2 md:px-4 py-2 text-right font-medium"
                >
                  Ara Toplam:
                </td>
                <td class="px-2 md:px-4 py-2 text-right font-medium">
                  ₺{{ formatPrice(subtotal) }}
                </td>
              </tr>
              <!-- KDV Detayları için Açılır Panel -->
              <tr class="border-t border-gray-200">
                <td colspan="5" class="px-2 md:px-4 py-2">
                  <div class="flex flex-col space-y-2">
                    <div
                      v-if="uniqueProductTypes.includes('seedling')"
                      class="flex justify-between items-center"
                    >
                      <span class="font-medium">KDV (%1) - Fide:</span>
                      <span
                        >₺{{
                          formatPrice(getVatAmountByType("seedling"))
                        }}</span
                      >
                    </div>
                    <div
                      v-if="uniqueProductTypes.includes('seed')"
                      class="flex justify-between items-center"
                    >
                      <span class="font-medium">KDV (%1) - Tohum:</span>
                      <span
                        >₺{{ formatPrice(getVatAmountByType("seed")) }}</span
                      >
                    </div>
                    <div
                      v-if="uniqueProductTypes.includes('fertilizer')"
                      class="flex justify-between items-center"
                    >
                      <span class="font-medium">KDV (%1) - Gübre:</span>
                      <span
                        >₺{{
                          formatPrice(getVatAmountByType("fertilizer"))
                        }}</span
                      >
                    </div>
                    <div
                      v-if="uniqueProductTypes.includes('agriculturalTool')"
                      class="flex justify-between items-center"
                    >
                      <span class="font-medium">KDV (%20) - Zirai Alet:</span>
                      <span
                        >₺{{
                          formatPrice(getVatAmountByType("agriculturalTool"))
                        }}</span
                      >
                    </div>
                  </div>
                </td>
              </tr>
              <tr class="border-t border-gray-200">
                <td colspan="2" class="hidden md:table-cell"></td>
                <td
                  colspan="2"
                  class="px-2 md:px-4 py-2 text-right font-medium"
                >
                  Toplam KDV:
                </td>
                <td class="px-2 md:px-4 py-2 text-right font-medium">
                  ₺{{ formatPrice(totalVAT) }}
                </td>
              </tr>
              <tr class="border-t border-gray-200">
                <td colspan="2" class="hidden md:table-cell"></td>
                <td
                  colspan="2"
                  class="px-2 md:px-4 py-2 text-right font-medium"
                >
                  Kargo:
                </td>
                <td class="px-2 md:px-4 py-2 text-right font-medium">
                  {{
                    cartStore.shipping === 0
                      ? "Ücretsiz"
                      : `₺${formatPrice(cartStore.shipping)}`
                  }}
                </td>
              </tr>
              <tr class="font-bold border-t border-gray-200">
                <td colspan="2" class="hidden md:table-cell"></td>
                <td colspan="2" class="px-2 md:px-4 py-2 text-right">
                  Genel Toplam:
                </td>
                <td class="px-2 md:px-4 py-2 text-right">
                  ₺{{ formatPrice(total) }}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </section>

    <!-- 4. İLGİLİ SÖZLEŞME VE POLİTİKALAR -->
    <section class="mb-6">
      <h3 class="text-lg font-medium mb-4">
        4. İLGİLİ SÖZLEŞME VE POLİTİKALAR
      </h3>
      <p class="mb-4">
        4.1. Aşağıdaki konulara ilişkin detaylı bilgiler ilgili sözleşme ve
        politikalarda yer almaktadır:
      </p>
      <ul class="list-disc ml-6 mb-4">
        <li>
          Teslimat, iptal, iade ve değişim koşulları için "Teslimat ve İade
          Koşulları Sözleşmesi"
        </li>
        <li>
          Kişisel verilerin işlenmesi ve korunması için "Kişisel Verilerin
          Korunması ve Gizlilik Politikası"
        </li>
        <li>
          Ödeme koşulları ve güvenliği için "Ödeme ve Güvenlik Politikası"
        </li>
      </ul>
      <p class="mb-4">
        4.2. İşbu sözleşmenin ayrılmaz parçası olan yukarıdaki sözleşme ve
        politikalar {{ props.sellerInfo.website }}
        adresinde yer almakta olup, ALICI tarafından incelenmiş ve kabul
        edilmiştir.
      </p>
    </section>

    <!-- 5. UYUŞMAZLIK ÇÖZÜMÜ -->
    <section class="mb-6">
      <h3 class="text-lg font-medium mb-4">5. UYUŞMAZLIK ÇÖZÜMÜ</h3>
      <p class="mb-4">
        5.1. İşbu sözleşmeden doğan uyuşmazlıklarda, Gümrük ve Ticaret
        Bakanlığınca ilan edilen değere kadar Tüketici Hakem Heyetleri, bu
        değerin üzerindeki uyuşmazlıklarda Tüketici Mahkemeleri yetkilidir.
      </p>
    </section>

    <!-- 6. YÜRÜRLÜK -->
    <section class="mb-6">
      <h3 class="text-lg font-medium mb-4">6. YÜRÜRLÜK</h3>
      <p class="mb-4">
        6.1. 6 (altı) maddeden ibaret bu sözleşme, taraflarca okunarak
        {{ formatDate(currentDate) }}
        tarihinde ALICI tarafından elektronik ortamda onaylanmak suretiyle
        yürürlüğe girmiştir.
      </p>
      <p class="mb-4">
        6.2. Bu sözleşmenin bir nüshası {{ formatDate(currentDate) }} tarihinde
        ALICI'ya elektronik ortamda iletilmiştir.
      </p>
    </section>

    <!-- İmzalar -->
    <section class="grid grid-cols-2 gap-4 mt-8">
      <div class="text-center">
        <p class="font-medium mb-2">SATICI</p>
        <p>{{ props.sellerInfo.companyName }}</p>
        <p class="text-sm text-gray-500">Kaşe/İmza</p>
      </div>
      <div class="text-center">
        <p class="font-medium mb-2">ALICI</p>
        <p>{{ buyerInfo.fullName }}</p>
        <p class="text-sm text-gray-500">Elektronik onay</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAddressStore } from "@/stores/addressStore";
import { useCartStore } from "@/stores/cartStore";

const addressStore = useAddressStore();
const cartStore = useCartStore();

const props = defineProps({
  sellerInfo: {
    type: Object,
    required: false,
    default: () => ({
      companyName: "Mühendisler Ticaret Kollektif Şirketi",
      address:
        "MUSALLA BAĞLARI MAH, Yeni İstanbul Cd. NO:8, 42000 Selçuklu/Konya",
      phone: "0332 235 11 28",
      email: "iletisim@tarimsepetim.com.tr",
      taxInfo: "Mevlana Vergi Dairesi ",
      website: "www.tarimsepetim.com.tr",
    }),
  },
});

// Alıcı bilgilerini addressStore'dan al
const buyerInfo = computed(() => {
  const activeAddress = addressStore.activeAddress;
  if (!activeAddress) return null;

  // Tüm alanların var olduğundan emin ol
  if (
    !activeAddress.fullName ||
    !activeAddress.fullAddress ||
    !activeAddress.neighborhood ||
    !activeAddress.district ||
    !activeAddress.city ||
    !activeAddress.zipCode
  ) {
    return null;
  }

  return {
    fullName: activeAddress.fullName,
    address: `${activeAddress.fullAddress}, ${activeAddress.neighborhood}, ${activeAddress.district}/${activeAddress.city} ${activeAddress.zipCode}`,
    phone: activeAddress.phone || "-",
    email: activeAddress.email || "-",
  };
});

// KDV oranları
const VAT_RATES = {
  seed: 0.01, // %1
  seedling: 0.01, // %1
  fertilizer: 0.01, // %1
  agriculturalTool: 0.2, // %20
};

// Debug için log ekleyelim
const logVatCalculation = (item, vatRate, priceWithoutVAT) => {
  console.log("KDV Hesaplama Detayları:", {
    productName: item.product.name,
    productType: item.product.productType,
    vatRate: vatRate,
    originalPrice: item.price,
    priceWithoutVAT: priceWithoutVAT,
    vatAmount: item.price - priceWithoutVAT,
  });
};

// Sipariş detaylarını cartStore'dan al
const orderDetails = computed(() => {
  if (!cartStore.items || cartStore.items.length === 0) return null;

  console.log(
    "Cart Items:",
    cartStore.items.map((item) => ({
      name: item.product.name,
      type: item.product.productType,
      fullProduct: item.product,
    }))
  );

  return {
    items: cartStore.items.map((item) => {
      // KDV oranını belirle
      const productType = item.product.productType;
      console.log("Product Type for", item.product.name, ":", productType);

      const vatRate = VAT_RATES[productType] ?? 0.18;
      console.log("VAT Rate:", vatRate, "for type:", productType);

      // KDV'siz fiyat = KDV'li fiyat / (1 + KDV oranı)
      const priceWithoutVAT = item.price / (1 + vatRate);

      // Debug için log
      logVatCalculation(item, vatRate, priceWithoutVAT);

      return {
        ...item,
        vatRate,
        priceWithoutVAT,
        vatAmount: item.price - priceWithoutVAT,
        totalPriceWithoutVAT: priceWithoutVAT * item.quantity,
        totalVAT: (item.price - priceWithoutVAT) * item.quantity,
        totalPrice: item.price * item.quantity,
      };
    }),
  };
});

// Sayfa yüklendiğinde gerekli verileri getir
onMounted(async () => {
  try {
    await Promise.all([
      addressStore.fetchDefaultAddress(),
      cartStore.fetchCart(),
    ]);
  } catch (error) {
    console.error("Veriler yüklenirken hata oluştu:", error);
  }
});

const currentDate = ref(new Date());

// Hesaplanan değerler
const subtotal = computed(() => {
  if (!orderDetails.value?.items) return 0;
  const total = orderDetails.value.items.reduce(
    (sum, item) => sum + item.totalPriceWithoutVAT,
    0
  );
  console.log("Ara Toplam (KDV Hariç):", total);
  return total;
});

const totalVAT = computed(() => {
  if (!orderDetails.value?.items) return 0;
  const total = orderDetails.value.items.reduce(
    (sum, item) => sum + item.totalVAT,
    0
  );
  console.log("Toplam KDV:", total);
  return total;
});

const total = computed(() => {
  if (!orderDetails.value?.items) return 0;
  const total =
    orderDetails.value.items.reduce((sum, item) => sum + item.totalPrice, 0) +
    cartStore.shipping;
  console.log("Genel Toplam (KDV Dahil):", total);
  return total;
});

const uniqueProductTypes = computed(() => {
  if (!orderDetails.value?.items) return [];
  return [
    ...new Set(
      orderDetails.value.items.map((item) => item.product.productType)
    ),
  ];
});

const getVatAmountByType = (productType) => {
  if (!orderDetails.value?.items) return 0;
  return orderDetails.value.items
    .filter((item) => item.product.productType === productType)
    .reduce((sum, item) => sum + item.totalVAT, 0);
};

const formatPrice = (price) => {
  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
};

const formatDate = (date) => {
  return new Intl.DateTimeFormat("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
};
</script>

<style scoped>
.contract-container {
  @apply max-w-4xl mx-auto p-6 bg-white rounded-lg shadow;
}

@media print {
  .contract-container {
    @apply shadow-none p-0;
  }
}

/* Responsive tablo stilleri */
@media (max-width: 639px) {
  .overflow-x-auto {
    @apply -mx-6;
  }

  table {
    @apply w-full;
  }

  td,
  th {
    @apply whitespace-normal;
  }
}

@media (min-width: 640px) and (max-width: 767px) {
  .overflow-x-auto {
    @apply -mx-4;
  }
}
</style>
