<template>
  <div class="p-5">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-2xl font-bold">Yeni Kupon Oluştur</h2>
      <router-link
        to="/admin/coupons"
        class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
      >
        <i class="bi bi-arrow-left mr-1"></i> Kupon Listesine Dön
      </router-link>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Form -->
      <div class="md:col-span-2">
        <div class="bg-white rounded-lg shadow-sm">
          <div class="p-6">
            <form @submit.prevent="saveCoupon">
              <!-- Temel Bilgiler -->
              <h5 class="text-lg font-semibold mb-4">Temel Bilgiler</h5>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <div class="mb-3">
                    <label
                      for="code"
                      class="block text-sm font-medium text-gray-700 mb-1"
                      >Kupon Kodu*</label
                    >
                    <div class="flex">
                      <input
                        type="text"
                        id="code"
                        class="flex-1 rounded-l-md border border-gray-300 shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                        :class="{ 'border-red-500': errors.code }"
                        v-model="formData.code"
                        placeholder="Örn: WELCOME10"
                        maxlength="20"
                        @input="
                          formData.code = $event.target.value.toUpperCase()
                        "
                      />
                      <button
                        type="button"
                        class="px-3 rounded-r-md border-t border-r border-b border-gray-300 bg-gray-50 hover:bg-gray-100"
                        @click="generateRandomCode"
                      >
                        <i class="bi bi-shuffle"></i>
                      </button>
                    </div>
                    <div class="text-red-600 text-sm mt-1" v-if="errors.code">
                      {{ errors.code }}
                    </div>
                    <small class="text-gray-500 text-sm mt-1 block">
                      3-20 karakter, sadece harfler, rakamlar, tire ve alt çizgi
                      kullanılabilir.
                    </small>
                  </div>
                </div>
                <div>
                  <div class="mb-3">
                    <label
                      for="description"
                      class="block text-sm font-medium text-gray-700 mb-1"
                      >Açıklama*</label
                    >
                    <input
                      type="text"
                      id="description"
                      class="w-full rounded-md border border-gray-300 shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                      :class="{ 'border-red-500': errors.description }"
                      v-model="formData.description"
                      placeholder="Örn: Yeni üyelere özel %10 indirim"
                    />
                    <div
                      class="text-red-600 text-sm mt-1"
                      v-if="errors.description"
                    >
                      {{ errors.description }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- İndirim Ayarları -->
              <h5 class="text-lg font-semibold mb-4">İndirim Ayarları</h5>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <div class="mb-3">
                    <label
                      for="discountType"
                      class="block text-sm font-medium text-gray-700 mb-1"
                      >İndirim Tipi*</label
                    >
                    <select
                      id="discountType"
                      class="w-full rounded-md border border-gray-300 shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                      :class="{ 'border-red-500': errors.discountType }"
                      v-model="formData.discountType"
                    >
                      <option value="PERCENTAGE">Yüzdelik İndirim (%)</option>
                      <option value="FIXED">Sabit Tutar (TL)</option>
                    </select>
                    <div
                      class="text-red-600 text-sm mt-1"
                      v-if="errors.discountType"
                    >
                      {{ errors.discountType }}
                    </div>
                  </div>
                </div>
                <div>
                  <div class="mb-3">
                    <label
                      for="discountValue"
                      class="block text-sm font-medium text-gray-700 mb-1"
                      >İndirim Değeri*</label
                    >
                    <div class="flex">
                      <input
                        type="number"
                        id="discountValue"
                        class="flex-1 rounded-l-md border border-gray-300 shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                        :class="{ 'border-red-500': errors.discountValue }"
                        v-model="formData.discountValue"
                        min="1"
                        :max="
                          formData.discountType === 'PERCENTAGE' ? 100 : null
                        "
                        step="0.01"
                      />
                      <span
                        class="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500"
                        >{{
                          formData.discountType === "PERCENTAGE" ? "%" : "TL"
                        }}</span
                      >
                    </div>
                    <div
                      class="text-red-600 text-sm mt-1"
                      v-if="errors.discountValue"
                    >
                      {{ errors.discountValue }}
                    </div>
                  </div>
                </div>
                <div>
                  <div class="mb-3">
                    <label
                      for="minimumPurchaseAmount"
                      class="block text-sm font-medium text-gray-700 mb-1"
                      >Minimum Sepet Tutarı (TL)</label
                    >
                    <input
                      type="number"
                      id="minimumPurchaseAmount"
                      class="w-full rounded-md border border-gray-300 shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                      :class="{
                        'border-red-500': errors.minimumPurchaseAmount,
                      }"
                      v-model="formData.minimumPurchaseAmount"
                      min="0"
                      step="0.01"
                    />
                    <div
                      class="text-red-600 text-sm mt-1"
                      v-if="errors.minimumPurchaseAmount"
                    >
                      {{ errors.minimumPurchaseAmount }}
                    </div>
                  </div>
                </div>
                <div v-if="formData.discountType === 'PERCENTAGE'">
                  <div class="mb-3">
                    <label
                      for="maximumDiscountAmount"
                      class="block text-sm font-medium text-gray-700 mb-1"
                      >Maksimum İndirim Tutarı (TL)</label
                    >
                    <input
                      type="number"
                      id="maximumDiscountAmount"
                      class="w-full rounded-md border border-gray-300 shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                      :class="{
                        'border-red-500': errors.maximumDiscountAmount,
                      }"
                      v-model="formData.maximumDiscountAmount"
                      min="0"
                      step="0.01"
                      placeholder="Limitsiz için boş bırakın"
                    />
                    <div
                      class="text-red-600 text-sm mt-1"
                      v-if="errors.maximumDiscountAmount"
                    >
                      {{ errors.maximumDiscountAmount }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Kullanım Kısıtlamaları -->
              <h5 class="text-lg font-semibold mb-4">Kullanım Kısıtlamaları</h5>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <div class="mb-3">
                    <label
                      for="maxUsageCount"
                      class="block text-sm font-medium text-gray-700 mb-1"
                      >Toplam Kullanım Limiti*</label
                    >
                    <input
                      type="number"
                      id="maxUsageCount"
                      class="w-full rounded-md border border-gray-300 shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                      :class="{ 'border-red-500': errors.maxUsageCount }"
                      v-model="formData.maxUsageCount"
                      min="1"
                    />
                    <div
                      class="text-red-600 text-sm mt-1"
                      v-if="errors.maxUsageCount"
                    >
                      {{ errors.maxUsageCount }}
                    </div>
                  </div>
                </div>
                <div>
                  <div class="mb-3">
                    <label
                      for="maxUsagePerUser"
                      class="block text-sm font-medium text-gray-700 mb-1"
                      >Kişi Başı Kullanım Limiti*</label
                    >
                    <input
                      type="number"
                      id="maxUsagePerUser"
                      class="w-full rounded-md border border-gray-300 shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                      :class="{ 'border-red-500': errors.maxUsagePerUser }"
                      v-model="formData.maxUsagePerUser"
                      min="1"
                    />
                    <div
                      class="text-red-600 text-sm mt-1"
                      v-if="errors.maxUsagePerUser"
                    >
                      {{ errors.maxUsagePerUser }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Geçerlilik Süresi -->
              <h5 class="text-lg font-semibold mb-4">Geçerlilik Süresi</h5>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <div class="mb-3">
                    <label
                      for="startDate"
                      class="block text-sm font-medium text-gray-700 mb-1"
                      >Başlangıç Tarihi*</label
                    >
                    <input
                      type="datetime-local"
                      id="startDate"
                      class="w-full rounded-md border border-gray-300 shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                      :class="{ 'border-red-500': errors.startDate }"
                      v-model="formData.startDate"
                    />
                    <div
                      class="text-red-600 text-sm mt-1"
                      v-if="errors.startDate"
                    >
                      {{ errors.startDate }}
                    </div>
                  </div>
                </div>
                <div>
                  <div class="mb-3">
                    <label
                      for="endDate"
                      class="block text-sm font-medium text-gray-700 mb-1"
                      >Bitiş Tarihi*</label
                    >
                    <input
                      type="datetime-local"
                      id="endDate"
                      class="w-full rounded-md border border-gray-300 shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                      :class="{ 'border-red-500': errors.endDate }"
                      v-model="formData.endDate"
                    />
                    <div
                      class="text-red-600 text-sm mt-1"
                      v-if="errors.endDate"
                    >
                      {{ errors.endDate }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Ürün/Kategori Kısıtlamaları -->
              <h5 class="text-lg font-semibold mb-4">
                Ürün ve Kategori Kısıtlamaları
                <span class="text-sm font-normal text-gray-500"
                  >(Opsiyonel)</span
                >
              </h5>
              <div class="mb-6">
                <div class="mb-3">
                  <label class="inline-flex items-center">
                    <input
                      type="checkbox"
                      class="form-checkbox h-5 w-5 text-blue-600 rounded"
                      v-model="hasProductRestrictions"
                    />
                    <span class="ml-2 text-gray-700"
                      >Ürün Kısıtlaması Ekle</span
                    >
                  </label>
                  <small class="text-gray-500 text-sm mt-1 block">
                    Kuponun yalnızca belirli ürünlerde veya kategorilerde
                    geçerli olmasını sağlar.
                  </small>
                </div>

                <div
                  v-if="hasProductRestrictions"
                  class="mt-3 p-4 bg-blue-50 border-l-4 border-blue-400 text-blue-700 rounded-md"
                >
                  <i class="bi bi-info-circle mr-2"></i>
                  Bu kuponun hangi ürün veya kategorilerde geçerli olacağını
                  belirlemek için, detay sayfasını kullanabilirsiniz. Kupon
                  oluşturulduktan sonra düzenleme sayfasından bu bilgileri
                  ekleyebilirsiniz.
                </div>
              </div>

              <!-- Diğer Ayarlar -->
              <h5 class="text-lg font-semibold mb-4">Diğer Ayarlar</h5>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <div class="mb-3">
                    <label
                      for="emailTemplate"
                      class="block text-sm font-medium text-gray-700 mb-1"
                      >Email Şablonu</label
                    >
                    <select
                      id="emailTemplate"
                      class="w-full rounded-md border border-gray-300 shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                      v-model="formData.emailTemplate"
                    >
                      <option value="NEW_USER_COUPON">
                        Yeni Üye Hoş Geldiniz
                      </option>
                      <option value="SPECIAL_OFFER">Özel Teklif</option>
                      <option value="SEASONAL_DISCOUNT">
                        Sezonluk İndirim
                      </option>
                    </select>
                  </div>
                </div>
                <div>
                  <div class="mb-3">
                    <label
                      for="isActive"
                      class="block text-sm font-medium text-gray-700 mb-1"
                      >Durum</label
                    >
                    <div class="mt-2">
                      <label class="inline-flex items-center">
                        <input
                          type="checkbox"
                          id="isActive"
                          class="form-checkbox h-5 w-5 text-blue-600 rounded"
                          v-model="formData.isActive"
                        />
                        <span class="ml-2 text-gray-700">
                          {{ formData.isActive ? "Aktif" : "Pasif" }}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Kaydetme Alanı -->
              <div class="flex justify-end mt-6">
                <button
                  type="button"
                  class="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 mr-2"
                  @click="resetForm"
                >
                  <i class="bi bi-arrow-clockwise mr-1"></i> Sıfırla
                </button>
                <button
                  type="submit"
                  class="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  :disabled="isSubmitting"
                >
                  <span
                    v-if="isSubmitting"
                    class="mr-1 inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                  ></span>
                  {{ isSubmitting ? "Kaydediliyor..." : "Kuponu Oluştur" }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Önizleme -->
      <div class="md:col-span-1">
        <div class="bg-white rounded-lg shadow-sm sticky top-5">
          <div class="bg-blue-600 text-white p-3 rounded-t-lg">
            <h5 class="font-medium">Kupon Önizleme</h5>
          </div>
          <div class="p-4">
            <div
              class="bg-gray-50 border border-dashed border-gray-300 rounded-md p-4 text-center"
            >
              <div
                class="bg-gray-200 border-2 border-dotted border-gray-300 rounded inline-block px-5 py-3 font-mono text-lg font-bold tracking-wider text-gray-800"
              >
                {{ formData.code || "ÖRNEKKUPON" }}
              </div>
              <div class="mt-2 text-gray-600">
                {{ formData.description || "Kupon açıklaması" }}
              </div>
              <div class="mt-3">
                <span class="text-red-600 text-2xl font-bold">
                  {{
                    formData.discountType === "PERCENTAGE"
                      ? `%${formData.discountValue || 0}`
                      : `${formData.discountValue || 0} TL`
                  }}
                </span>
                <span class="text-gray-500 text-sm ml-1">indirim</span>
              </div>
              <div class="mt-3 text-left text-gray-500 text-sm">
                <div v-if="formData.minimumPurchaseAmount > 0">
                  <small
                    >Minimum sepet tutarı:
                    <b>{{ formData.minimumPurchaseAmount }} TL</b></small
                  >
                </div>
                <div
                  v-if="
                    formData.discountType === 'PERCENTAGE' &&
                    formData.maximumDiscountAmount > 0
                  "
                >
                  <small
                    >Maksimum indirim tutarı:
                    <b>{{ formData.maximumDiscountAmount }} TL</b></small
                  >
                </div>
                <div>
                  <small
                    >Geçerlilik:
                    <b
                      >{{
                        formatDateForPreview(formData.startDate) || "01.01.2023"
                      }}
                      -
                      {{
                        formatDateForPreview(formData.endDate) || "31.12.2023"
                      }}</b
                    ></small
                  >
                </div>
                <div>
                  <small
                    >Kullanım limiti:
                    <b>{{ formData.maxUsageCount || 1 }}</b></small
                  >
                </div>
                <div>
                  <small
                    >Kişi başı kullanım:
                    <b>{{ formData.maxUsagePerUser || 1 }} kez</b></small
                  >
                </div>
              </div>
              <div class="mt-3">
                <span
                  class="px-3 py-1 text-xs rounded-full"
                  :class="
                    formData.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  "
                >
                  {{ formData.isActive ? "Aktif" : "Pasif" }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useCouponStore } from "@/stores/couponStore";
import { useToast } from "vue-toastification";

export default {
  name: "CouponCreate",
  setup() {
    const router = useRouter();
    const couponStore = useCouponStore();
    const toast = useToast();

    // Durum değişkenleri
    const isSubmitting = ref(false);
    const errors = reactive({});
    const hasProductRestrictions = ref(false);

    // Form verisi
    const formData = reactive({
      code: "",
      description: "",
      discountType: "PERCENTAGE",
      discountValue: 10,
      minimumPurchaseAmount: 0,
      maximumDiscountAmount: null,
      validProducts: [],
      validCategories: [],
      excludedProducts: [],
      maxUsageCount: 100,
      maxUsagePerUser: 1,
      startDate: formatDateTimeForInput(new Date()),
      endDate: formatDateTimeForInput(
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      ), // 30 gün sonra
      isActive: true,
      emailTemplate: "SPECIAL_OFFER",
    });

    // Form validasyonu
    const validateForm = () => {
      errors.code = "";
      errors.description = "";
      errors.discountType = "";
      errors.discountValue = "";
      errors.minimumPurchaseAmount = "";
      errors.maximumDiscountAmount = "";
      errors.maxUsageCount = "";
      errors.maxUsagePerUser = "";
      errors.startDate = "";
      errors.endDate = "";

      let isValid = true;

      // Kupon kodu kontrolü
      if (!formData.code || formData.code.trim() === "") {
        errors.code = "Kupon kodu gereklidir";
        isValid = false;
      } else if (!/^[A-Z0-9_-]{3,20}$/.test(formData.code)) {
        errors.code =
          "Kupon kodu geçersiz. Sadece harfler, rakamlar, tire ve alt çizgi kullanabilirsiniz (3-20 karakter)";
        isValid = false;
      }

      // Açıklama kontrolü
      if (!formData.description || formData.description.trim() === "") {
        errors.description = "Açıklama gereklidir";
        isValid = false;
      } else if (formData.description.length < 5) {
        errors.description = "Açıklama en az 5 karakter olmalıdır";
        isValid = false;
      }

      // İndirim tipi kontrolü
      if (!formData.discountType) {
        errors.discountType = "İndirim tipi gereklidir";
        isValid = false;
      }

      // İndirim değeri kontrolü
      if (!formData.discountValue || formData.discountValue <= 0) {
        errors.discountValue = "İndirim değeri pozitif bir sayı olmalıdır";
        isValid = false;
      } else if (
        formData.discountType === "PERCENTAGE" &&
        formData.discountValue > 100
      ) {
        errors.discountValue = "Yüzde değeri 100'den büyük olamaz";
        isValid = false;
      }

      // Minimum sepet tutarı kontrolü
      if (formData.minimumPurchaseAmount < 0) {
        errors.minimumPurchaseAmount = "Minimum sepet tutarı negatif olamaz";
        isValid = false;
      }

      // Maksimum indirim tutarı kontrolü
      if (
        formData.discountType === "PERCENTAGE" &&
        formData.maximumDiscountAmount !== null &&
        formData.maximumDiscountAmount < 0
      ) {
        errors.maximumDiscountAmount = "Maksimum indirim tutarı negatif olamaz";
        isValid = false;
      }

      // Kullanım limiti kontrolü
      if (!formData.maxUsageCount || formData.maxUsageCount < 1) {
        errors.maxUsageCount = "Toplam kullanım limiti en az 1 olmalıdır";
        isValid = false;
      }

      // Kişi başı kullanım limiti kontrolü
      if (!formData.maxUsagePerUser || formData.maxUsagePerUser < 1) {
        errors.maxUsagePerUser = "Kişi başı kullanım limiti en az 1 olmalıdır";
        isValid = false;
      }

      // Başlangıç tarihi kontrolü
      if (!formData.startDate) {
        errors.startDate = "Başlangıç tarihi gereklidir";
        isValid = false;
      }

      // Bitiş tarihi kontrolü
      if (!formData.endDate) {
        errors.endDate = "Bitiş tarihi gereklidir";
        isValid = false;
      } else if (new Date(formData.endDate) <= new Date(formData.startDate)) {
        errors.endDate = "Bitiş tarihi başlangıç tarihinden sonra olmalıdır";
        isValid = false;
      }

      return isValid;
    };

    // Form gönderimi
    const saveCoupon = async () => {
      if (!validateForm()) {
        toast.error("Formu kontrol edin");
        return;
      }

      isSubmitting.value = true;

      try {
        // Hasproductrestrictions false ise ilgili alanları temizle
        if (!hasProductRestrictions.value) {
          formData.validProducts = [];
          formData.validCategories = [];
          formData.excludedProducts = [];
        }

        const newCoupon = await couponStore.createCoupon(formData);

        if (newCoupon) {
          toast.success("Kupon başarıyla oluşturuldu");
          router.push("/admin/coupons");
        }
      } catch (error) {
        console.error("Kupon oluşturma hatası:", error);
      } finally {
        isSubmitting.value = false;
      }
    };

    // Formu sıfırla
    const resetForm = () => {
      Object.assign(formData, {
        code: "",
        description: "",
        discountType: "PERCENTAGE",
        discountValue: 10,
        minimumPurchaseAmount: 0,
        maximumDiscountAmount: null,
        validProducts: [],
        validCategories: [],
        excludedProducts: [],
        maxUsageCount: 100,
        maxUsagePerUser: 1,
        startDate: formatDateTimeForInput(new Date()),
        endDate: formatDateTimeForInput(
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        ),
        isActive: true,
        emailTemplate: "SPECIAL_OFFER",
      });

      hasProductRestrictions.value = false;

      // Hataları temizle
      Object.keys(errors).forEach((key) => {
        errors[key] = "";
      });
    };

    // Rastgele kupon kodu oluştur
    const generateRandomCode = () => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let code = "";

      for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      formData.code = code;
    };

    // Tarih formatı için yardımcı fonksiyonlar
    function formatDateTimeForInput(date) {
      if (!date) return "";
      const d = new Date(date);

      // ISO formatında tarih-saat oluştur (YYYY-MM-DDTHH:MM)
      return d.toISOString().slice(0, 16);
    }

    function formatDateForPreview(dateString) {
      if (!dateString) return "";
      return new Date(dateString).toLocaleDateString("tr-TR");
    }

    return {
      formData,
      errors,
      isSubmitting,
      hasProductRestrictions,
      saveCoupon,
      resetForm,
      generateRandomCode,
      formatDateForPreview,
    };
  },
};
</script>

<style scoped>
.coupon-create {
  padding: 20px;
}

.coupon-preview {
  background-color: #f8f9fa;
  border: 1px dashed #dee2e6;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
}

.coupon-code {
  background-color: #e9ecef;
  border: 2px dotted #ced4da;
  border-radius: 4px;
  color: #212529;
  display: inline-block;
  font-family: monospace;
  font-size: 1.5rem;
  font-weight: bold;
  letter-spacing: 1px;
  padding: 10px 20px;
}

.coupon-description {
  color: #6c757d;
}

.discount-value {
  color: #dc3545;
  font-size: 2rem;
  font-weight: bold;
}

.discount-text {
  color: #6c757d;
  font-size: 1rem;
  margin-left: 5px;
}

.coupon-details {
  color: #6c757d;
  font-size: 0.875rem;
  line-height: 1.5;
  text-align: left;
}

.coupon-status {
  margin-top: 20px;
}

.badge {
  font-size: 0.875rem;
  padding: 6px 12px;
}
</style> 