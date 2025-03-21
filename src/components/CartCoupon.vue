<template>
  <div class="mt-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
    <h3 class="text-base font-medium text-gray-900 mb-4">Kupon Kodu</h3>

    <!-- Kupon yokken gösterilen giriş alanı -->
    <div v-if="!cartStore.hasCoupon" class="space-y-3">
      <div class="flex items-center space-x-2">
        <div class="flex-1 relative">
          <input
            type="text"
            placeholder="Kupon kodunuzu girin"
            v-model="couponCode"
            class="w-full rounded-md border border-gray-300 shadow-sm pl-10 pr-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 transition-all"
            :disabled="isApplyingCoupon"
            @keyup.enter="applyCoupon"
          />
          <span class="absolute left-3 top-2 text-gray-400">
            <i class="bi bi-ticket-perforated"></i>
          </span>
        </div>
        <button
          @click="applyCoupon"
          class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="!couponCode || isApplyingCoupon"
        >
          <span v-if="isApplyingCoupon">
            <i class="bi bi-arrow-repeat animate-spin mr-1"></i>
            İşleniyor
          </span>
          <span v-else>Uygula</span>
        </button>
      </div>

      <!-- Kupon ipucu -->
      <p class="text-xs text-gray-500 mt-1">
        <i class="bi bi-info-circle mr-1"></i>
        İndirim kuponları sepet tutarına göre uygulanır. Geçerli kuponlarınız
        listelenmektedir.
      </p>

      <!-- Mevcut kuponlar listesi -->
      <div v-if="availableCoupons.length > 0" class="mt-4">
        <p class="text-sm font-medium text-gray-700 mb-2">
          Kullanılabilir Kuponlar:
        </p>
        <div class="space-y-2 max-h-48 overflow-y-auto pr-1">
          <div
            v-for="coupon in availableCoupons"
            :key="coupon.code"
            @click="selectCoupon(coupon.code)"
            class="flex items-center justify-between p-2 bg-white border border-gray-200 rounded-md hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all"
          >
            <div>
              <p class="text-sm font-medium text-gray-800">
                {{ coupon.description || "İndirim Kuponu" }}
              </p>
              <p class="text-xs text-gray-500">Kod: {{ coupon.code }}</p>
            </div>
            <button
              class="text-blue-600 hover:text-blue-800 p-1 text-sm"
              @click.stop="selectCoupon(coupon.code)"
            >
              Seç
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Uygulanan kupon bilgisi -->
    <div v-else>
      <div
        class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-md p-4 border border-blue-100 relative"
      >
        <div
          class="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-8 bg-white rounded-full border-r border-blue-200"
        ></div>
        <div
          class="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-8 bg-white rounded-full border-l border-blue-200"
        ></div>

        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-semibold text-blue-800">
              {{ cartStore.cart?.coupon?.description || "İndirim Kuponu" }}
            </p>
            <div class="flex items-center mt-1">
              <span
                class="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded mr-2"
              >
                {{ cartStore.cart?.coupon?.code }}
              </span>
              <span class="text-xs text-green-600 font-medium">
                {{ formatDiscountType(cartStore.cart?.coupon) }}
              </span>
            </div>
          </div>
          <div class="flex flex-col items-end">
            <p class="text-lg font-bold text-green-600">
              -₺{{ formatPrice(cartStore.cart?.discountAmount || 0) }}
            </p>
            <p class="text-xs text-gray-500 mt-1">İndirim Tutarı</p>
          </div>
        </div>

        <!-- Kupon detayları ve işlemler -->
        <div
          class="flex justify-between items-center mt-3 pt-3 border-t border-blue-100"
        >
          <div class="text-xs text-gray-500">
            <span v-if="cartStore.cart?.coupon?.endDate">
              Son Kullanım: {{ formatDate(cartStore.cart?.coupon?.endDate) }}
            </span>
          </div>
          <div class="flex space-x-2">
            <button
              @click="removeCoupon"
              class="text-xs text-red-600 hover:text-red-800 px-2 py-1 border border-red-300 rounded hover:bg-red-50 transition-colors"
              :disabled="isApplyingCoupon"
            >
              <i class="bi bi-x-circle mr-1"></i>
              Kaldır
            </button>
          </div>
        </div>
      </div>

      <!-- İndirim özeti -->
      <div class="mt-3 p-3 bg-white rounded-md border border-gray-200">
        <div class="flex justify-between items-center">
          <span class="text-sm text-gray-600">Ürünler Toplamı:</span>
          <span class="text-sm text-gray-900"
            >₺{{ formatPrice(cartStore.cart?.totalAmount || 0) }}</span
          >
        </div>
        <div class="flex justify-between items-center mt-2 text-green-600">
          <span class="text-sm font-medium">Kupon İndirimi:</span>
          <span class="text-sm font-medium"
            >-₺{{ formatPrice(cartStore.cart?.discountAmount || 0) }}</span
          >
        </div>
        <div
          class="flex justify-between items-center mt-2 pt-2 border-t border-gray-100"
        >
          <span class="text-sm font-medium text-gray-900"
            >İndirimli Tutar:</span
          >
          <span class="text-sm font-bold text-gray-900"
            >₺{{
              formatPrice(cartStore.cart?.discountedTotalAmount || 0)
            }}</span
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useCartStore } from "@/stores/cartStore";
import { useCouponStore } from "@/stores/couponStore";
import { useToast } from "vue-toastification";
import api from "@/services/axiosInstance.js";

const toast = useToast();
const cartStore = useCartStore();
const couponStore = useCouponStore();

const couponCode = ref("");
const isApplyingCoupon = ref(false);
const availableCoupons = ref([]);

// Kullanılabilir kuponları yükle
onMounted(async () => {
  await loadAvailableCoupons();
});

// Kuponları yükle
const loadAvailableCoupons = async () => {
  try {
    const result = await couponStore.fetchCoupons();
    if (result.success) {
      availableCoupons.value = result.data;
      console.log("Kullanılabilir kuponlar:", availableCoupons.value);
    }
  } catch (err) {
    console.error("Kuponları yükleme hatası:", err);
  }
};

// Kupon seç
const selectCoupon = (code) => {
  couponCode.value = code;
  applyCoupon();
};

// Kuponu değiştir
const changeCoupon = async () => {
  // Önce mevcut kuponu kaldır
  await removeCoupon();
  // Biraz bekle ve kupon listesini yeniden yükle
  setTimeout(() => {
    loadAvailableCoupons();
  }, 300);
};

// Kupon uygulama
const applyCoupon = async () => {
  if (!couponCode.value) return;

  try {
    isApplyingCoupon.value = true;

    // '/api/coupons/apply' rotasını kullanarak kuponu doğrudan uygula
    const response = await api.post("/coupons/apply", {
      couponCode: couponCode.value,
    });

    if (response.data.success) {
      toast.success("Kupon başarıyla uygulandı");
      couponCode.value = ""; // Input alanını temizle

      // Sepet verilerini güncelleyelim
      await cartStore.fetchCart();

      // CouponStore'u da güncelle
      if (couponStore && cartStore.cart) {
        couponStore.updateWithCartData(cartStore.cart);
      }

      console.log("Kupon uygulandı, güncel sepet:", {
        cart: cartStore.cart,
        discount: cartStore.discountAmount,
        total: cartStore.discountedTotalAmount,
      });
    } else {
      toast.error(response.data.message || "Kupon uygulanamadı");
    }
  } catch (err) {
    console.error("Kupon uygulama hatası:", err);
    toast.error(
      err.response?.data?.message || "Kupon uygulanırken bir hata oluştu"
    );
  } finally {
    isApplyingCoupon.value = false;
  }
};

// Kuponu kaldırma
const removeCoupon = async () => {
  try {
    isApplyingCoupon.value = true;

    // '/api/coupons/remove' rotasını kullanarak kuponu doğrudan kaldır
    const response = await api.delete("/coupons/remove");

    if (response.data.success) {
      toast.success("Kupon kaldırıldı");

      // Sepet verilerini güncelleyelim
      await cartStore.fetchCart();

      // CouponStore'u da güncelle
      if (couponStore) {
        couponStore.appliedCoupon = null;
        couponStore.discountAmount = 0;
        couponStore.couponDetails = null;
      }

      console.log("Kupon kaldırıldı, güncel sepet:", {
        cart: cartStore.cart,
        coupon: cartStore.coupon,
      });
    } else {
      toast.error(response.data.message || "Kupon kaldırılamadı");
    }
  } catch (err) {
    console.error("Kupon kaldırma hatası:", err);
    toast.error(
      err.response?.data?.message || "Kupon kaldırılırken bir hata oluştu"
    );
  } finally {
    isApplyingCoupon.value = false;
  }
};

// Fiyat formatlama
const formatPrice = (price) => {
  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
};

// Tarih formatlama
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("tr-TR");
};

// İndirim tipini formatla
const formatDiscountType = (coupon) => {
  if (!coupon) return "";

  if (coupon.discountType === "PERCENTAGE") {
    return `%${coupon.discountValue} indirim`;
  } else if (coupon.discountType === "FIXED") {
    return `₺${coupon.discountValue} indirim`;
  }

  return "";
};
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style> 