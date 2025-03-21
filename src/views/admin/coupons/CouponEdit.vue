<template>
  <div class="p-5">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-2xl font-bold">Kupon Düzenle</h2>
      <div class="flex space-x-2">
        <router-link
          :to="`/admin/coupons/details/${couponId}`"
          class="inline-flex items-center px-4 py-2 border border-blue-500 text-blue-500 bg-white rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <i class="bi bi-eye mr-1"></i> Detaylar
        </router-link>
        <router-link
          to="/admin/coupons"
          class="inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <i class="bi bi-arrow-left mr-1"></i> Kupon Listesine Dön
        </router-link>
      </div>
    </div>

    <div v-if="isLoading" class="text-center my-5">
      <div
        class="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"
      ></div>
      <p class="mt-2 text-gray-600">Kupon bilgileri yükleniyor...</p>
    </div>

    <div
      v-else-if="error"
      class="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md"
    >
      <i class="bi bi-exclamation-triangle mr-2"></i>
      {{ error }}
    </div>

    <div
      v-else-if="!coupon"
      class="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md"
    >
      <i class="bi bi-exclamation-triangle mr-2"></i>
      Kupon bulunamadı.
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Form -->
      <div class="md:col-span-2">
        <div class="bg-white rounded-lg shadow-sm">
          <div class="p-6">
            <form @submit.prevent="updateCoupon">
              <!-- Temel Bilgiler -->
              <h5 class="text-lg font-semibold mb-4">Temel Bilgiler</h5>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <div class="mb-3">
                    <label
                      for="code"
                      class="block text-sm font-medium text-gray-700 mb-1"
                      >Kupon Kodu</label
                    >
                    <input
                      type="text"
                      id="code"
                      class="w-full rounded-md border border-gray-300 shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-100 cursor-not-allowed"
                      v-model="formData.code"
                      disabled
                    />
                    <div class="text-gray-500 text-sm mt-1">
                      Kupon kodu düzenlenemez.
                    </div>
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
                      v-model="formData.description"
                      :class="{ 'border-red-500': errors.description }"
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
                      >İndirim Tipi</label
                    >
                    <input
                      type="text"
                      id="discountType"
                      class="w-full rounded-md border border-gray-300 shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-100 cursor-not-allowed"
                      :value="
                        formData.discountType === 'PERCENTAGE'
                          ? 'Yüzdelik İndirim (%)'
                          : 'Sabit Tutar (TL)'
                      "
                      disabled
                    />
                    <div class="text-gray-500 text-sm mt-1">
                      İndirim tipi düzenlenemez.
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
                        v-model="formData.discountValue"
                        :class="{ 'border-red-500': errors.discountValue }"
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
                      v-model="formData.minimumPurchaseAmount"
                      :class="{
                        'border-red-500': errors.minimumPurchaseAmount,
                      }"
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
                      v-model="formData.maximumDiscountAmount"
                      :class="{
                        'border-red-500': errors.maximumDiscountAmount,
                      }"
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
                      v-model="formData.maxUsageCount"
                      :class="{ 'border-red-500': errors.maxUsageCount }"
                      min="1"
                    />
                    <div
                      class="text-red-600 text-sm mt-1"
                      v-if="errors.maxUsageCount"
                    >
                      {{ errors.maxUsageCount }}
                    </div>
                    <div class="text-gray-500 text-sm mt-1">
                      Şu ana kadar {{ coupon.usedCount }} kez kullanıldı.
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
                      v-model="formData.maxUsagePerUser"
                      :class="{ 'border-red-500': errors.maxUsagePerUser }"
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
                      >Başlangıç Tarihi</label
                    >
                    <input
                      type="datetime-local"
                      id="startDate"
                      class="w-full rounded-md border border-gray-300 shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                      v-model="formData.startDate"
                      :disabled="isStartDatePassed"
                      :class="{
                        'border-red-500': errors.startDate,
                        'bg-gray-100 cursor-not-allowed': isStartDatePassed,
                      }"
                    />
                    <div
                      class="text-red-600 text-sm mt-1"
                      v-if="errors.startDate"
                    >
                      {{ errors.startDate }}
                    </div>
                    <div
                      class="text-gray-500 text-sm mt-1"
                      v-if="isStartDatePassed"
                    >
                      Başlangıç tarihi geçmiş olduğu için düzenlenemez.
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
                      v-model="formData.endDate"
                      :class="{ 'border-red-500': errors.endDate }"
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
                          class="form-checkbox h-5 w-5 text-blue-600 rounded"
                          type="checkbox"
                          id="isActive"
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
                  class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 mr-2"
                  @click="resetForm"
                >
                  <i class="bi bi-arrow-clockwise mr-1"></i> Değişiklikleri Geri
                  Al
                </button>
                <button
                  type="submit"
                  class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  :disabled="isSubmitting"
                >
                  <span
                    v-if="isSubmitting"
                    class="mr-1 inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                  ></span>
                  {{
                    isSubmitting ? "Kaydediliyor..." : "Değişiklikleri Kaydet"
                  }}
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
                {{ formData.code }}
              </div>
              <div class="mt-2 text-gray-600">
                {{ formData.description }}
              </div>
              <div class="mt-3">
                <span class="text-red-600 text-2xl font-bold">
                  {{
                    formData.discountType === "PERCENTAGE"
                      ? `%${formData.discountValue}`
                      : `${formData.discountValue} TL`
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
                      >{{ formatDate(formData.startDate) }} -
                      {{ formatDate(formData.endDate) }}</b
                    ></small
                  >
                </div>
                <div>
                  <small
                    >Kullanım limiti: <b>{{ formData.maxUsageCount }}</b></small
                  >
                </div>
                <div>
                  <small
                    >Kişi başı kullanım:
                    <b>{{ formData.maxUsagePerUser }} kez</b></small
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
import { useRoute, useRouter } from "vue-router";
import { useCouponStore } from "@/stores/couponStore";
import { useToast } from "vue-toastification";

export default {
  name: "CouponEdit",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const couponStore = useCouponStore();
    const toast = useToast();

    // URL'den kupon ID'sini al
    const couponId = computed(() => route.params.id);

    // Durum değişkenleri
    const isLoading = ref(true);
    const isSubmitting = ref(false);
    const error = ref("");
    const coupon = ref(null);
    const errors = reactive({});

    // Form verisi
    const formData = reactive({
      code: "",
      description: "",
      discountType: "PERCENTAGE",
      discountValue: 0,
      minimumPurchaseAmount: 0,
      maximumDiscountAmount: null,
      validProducts: [],
      validCategories: [],
      excludedProducts: [],
      maxUsageCount: 0,
      maxUsagePerUser: 1,
      startDate: "",
      endDate: "",
      isActive: true,
      emailTemplate: "SPECIAL_OFFER",
    });

    // Başlangıç tarihi geçmiş mi kontrolü
    const isStartDatePassed = computed(() => {
      if (!formData.startDate) return false;
      return new Date(formData.startDate) < new Date();
    });

    // Kupon verilerini yükle
    const loadCoupon = async () => {
      isLoading.value = true;
      error.value = "";

      try {
        const couponData = await couponStore.fetchAdminCouponDetails(
          couponId.value
        );

        if (couponData) {
          coupon.value = couponData.coupon;

          // Form verilerini doldur
          Object.assign(formData, {
            code: coupon.value.code,
            description: coupon.value.description,
            discountType: coupon.value.discountType,
            discountValue: coupon.value.discountValue,
            minimumPurchaseAmount: coupon.value.minimumPurchaseAmount,
            maximumDiscountAmount: coupon.value.maximumDiscountAmount,
            validProducts: coupon.value.validProducts || [],
            validCategories: coupon.value.validCategories || [],
            excludedProducts: coupon.value.excludedProducts || [],
            maxUsageCount: coupon.value.maxUsageCount,
            maxUsagePerUser: coupon.value.maxUsagePerUser,
            startDate: formatDateTimeForInput(coupon.value.startDate),
            endDate: formatDateTimeForInput(coupon.value.endDate),
            isActive: coupon.value.isActive,
            emailTemplate: coupon.value.emailTemplate,
          });
        } else {
          error.value = "Kupon bilgileri alınamadı";
        }
      } catch (err) {
        console.error("Kupon yükleme hatası:", err);
        error.value =
          err.message || "Kupon bilgileri yüklenirken bir hata oluştu";
      } finally {
        isLoading.value = false;
      }
    };

    // Form validasyonu
    const validateForm = () => {
      errors.description = "";
      errors.discountValue = "";
      errors.minimumPurchaseAmount = "";
      errors.maximumDiscountAmount = "";
      errors.maxUsageCount = "";
      errors.maxUsagePerUser = "";
      errors.endDate = "";

      let isValid = true;

      // Açıklama kontrolü
      if (!formData.description || formData.description.trim() === "") {
        errors.description = "Açıklama gereklidir";
        isValid = false;
      } else if (formData.description.length < 5) {
        errors.description = "Açıklama en az 5 karakter olmalıdır";
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

      // Kullanım limiti kontrolü - Mevcut kullanımdan az olmamalı
      if (!formData.maxUsageCount || formData.maxUsageCount < 1) {
        errors.maxUsageCount = "Toplam kullanım limiti en az 1 olmalıdır";
        isValid = false;
      } else if (
        coupon.value &&
        formData.maxUsageCount < coupon.value.usedCount
      ) {
        errors.maxUsageCount = `Toplam kullanım limiti mevcut kullanımdan (${coupon.value.usedCount}) az olamaz`;
        isValid = false;
      }

      // Kişi başı kullanım limiti kontrolü
      if (!formData.maxUsagePerUser || formData.maxUsagePerUser < 1) {
        errors.maxUsagePerUser = "Kişi başı kullanım limiti en az 1 olmalıdır";
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
    const updateCoupon = async () => {
      if (!validateForm()) {
        toast.error("Formu kontrol edin");
        return;
      }

      isSubmitting.value = true;

      try {
        // Güncellenecek verileri hazırla
        const updateData = {
          description: formData.description,
          discountValue: formData.discountValue,
          minimumPurchaseAmount: formData.minimumPurchaseAmount,
          maximumDiscountAmount: formData.maximumDiscountAmount,
          validProducts: formData.validProducts,
          validCategories: formData.validCategories,
          excludedProducts: formData.excludedProducts,
          maxUsageCount: formData.maxUsageCount,
          maxUsagePerUser: formData.maxUsagePerUser,
          endDate: formData.endDate,
          isActive: formData.isActive,
          emailTemplate: formData.emailTemplate,
        };

        // Başlangıç tarihi değiştirilebilir durumdaysa ekle
        if (!isStartDatePassed.value) {
          updateData.startDate = formData.startDate;
        }

        const updatedCoupon = await couponStore.updateCoupon(
          couponId.value,
          updateData
        );

        if (updatedCoupon) {
          toast.success("Kupon başarıyla güncellendi");
          // Kupon verilerini yeniden yükle
          loadCoupon();
        }
      } catch (err) {
        console.error("Kupon güncelleme hatası:", err);
        toast.error(err.message || "Kupon güncellenirken bir hata oluştu");
      } finally {
        isSubmitting.value = false;
      }
    };

    // Formu sıfırla (orijinal değerlere döndür)
    const resetForm = () => {
      if (!coupon.value) return;

      Object.assign(formData, {
        code: coupon.value.code,
        description: coupon.value.description,
        discountType: coupon.value.discountType,
        discountValue: coupon.value.discountValue,
        minimumPurchaseAmount: coupon.value.minimumPurchaseAmount,
        maximumDiscountAmount: coupon.value.maximumDiscountAmount,
        validProducts: coupon.value.validProducts || [],
        validCategories: coupon.value.validCategories || [],
        excludedProducts: coupon.value.excludedProducts || [],
        maxUsageCount: coupon.value.maxUsageCount,
        maxUsagePerUser: coupon.value.maxUsagePerUser,
        startDate: formatDateTimeForInput(coupon.value.startDate),
        endDate: formatDateTimeForInput(coupon.value.endDate),
        isActive: coupon.value.isActive,
        emailTemplate: coupon.value.emailTemplate,
      });

      // Hataları temizle
      Object.keys(errors).forEach((key) => {
        errors[key] = "";
      });

      toast.info("Form orijinal değerlere döndürüldü");
    };

    // Tarih formatı için yardımcı fonksiyonlar
    function formatDateTimeForInput(date) {
      if (!date) return "";
      const d = new Date(date);

      // ISO formatında tarih-saat oluştur (YYYY-MM-DDTHH:MM)
      return d.toISOString().slice(0, 16);
    }

    function formatDate(dateString) {
      if (!dateString) return "";
      return new Date(dateString).toLocaleDateString("tr-TR");
    }

    // Sayfa yüklendiğinde verileri getir
    onMounted(() => {
      loadCoupon();
    });

    return {
      couponId,
      coupon,
      formData,
      errors,
      isLoading,
      isSubmitting,
      error,
      isStartDatePassed,
      updateCoupon,
      resetForm,
      formatDate,
    };
  },
};
</script>

<style scoped>
.coupon-edit {
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