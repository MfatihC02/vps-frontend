<!-- OrderCard.vue -->
<template>
  <div
    class="order-card bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-4"
  >
    <!-- Üst Kısım: Sipariş No ve Durum -->
    <div class="flex justify-between items-center mb-4">
      <div class="space-y-1">
        <h3 class="text-sm text-gray-500">Sipariş No</h3>
        <p class="font-medium">{{ order.orderNumber }}</p>
      </div>
      <div
        :class="getStatusClass(order.status)"
        class="px-3 py-1 rounded-full text-sm font-medium"
      >
        {{ getStatusText(order.status) }}
      </div>
    </div>

    <!-- Orta Kısım: Ürün Bilgileri -->
    <div class="space-y-4 mb-4">
      <div
        v-for="item in order.items"
        :key="item._id"
        class="flex gap-4 items-center"
      >
        <div class="flex-1">
          <h4 class="font-medium text-gray-900">
            {{ item?.product?.name || "Ürün Adı Bulunamadı" }}
          </h4>
          <div class="flex items-center gap-2 text-sm text-gray-600">
            <span>{{ item?.quantity || 0 }} {{ item?.unit || "adet" }}</span>
            <span>×</span>
            <span>{{ formatPrice(item?.price || 0) }}</span>
          </div>
          <!-- Ürün Tipi İkonu -->
          <div class="flex items-center gap-1 text-sm text-gray-500 mt-1">
            <component
              :is="getProductTypeIcon(item?.product?.productType)"
              class="w-4 h-4"
            />
            <span>{{ getProductTypeText(item?.product?.productType) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Alt Kısım: Toplam Tutar ve Tarih -->
    <div
      class="flex justify-between items-center pt-4 border-t border-gray-100"
    >
      <div class="flex items-center gap-2 text-gray-500">
        <Calendar class="w-4 h-4" />
        <span class="text-sm">{{ formatDate(order.createdAt) }}</span>
      </div>
      <div class="text-right">
        <div class="text-sm text-gray-500">Toplam Tutar</div>
        <div class="font-medium text-lg text-green-600">
          {{ formatPrice(order.totalAmount) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Calendar, Sprout, Shovel, Package } from "lucide-vue-next";

const props = defineProps({
  order: {
    type: Object,
    required: true,
  },
});

// Sipariş numarasını formatla
const formatOrderNumber = (orderNumber) => {
  if (!orderNumber) return "Sipariş No Yok";
  return orderNumber.split("-")[0];
};

// Fiyat formatla
const formatPrice = (price) => {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(price);
};

// Tarih formatla
const formatDate = (date) => {
  return new Date(date).toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Durum sınıflarını getir
const getStatusClass = (status) => {
  const statusClasses = {
    CREATED: "bg-blue-100 text-blue-800",
    PENDING_PAYMENT: "bg-yellow-100 text-yellow-800",
    PAYMENT_COMPLETED: "bg-green-100 text-green-800",
    PROCESSING: "bg-purple-100 text-purple-800",
    SHIPPED: "bg-indigo-100 text-indigo-800",
    DELIVERED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  };
  return statusClasses[status] || "bg-gray-100 text-gray-800";
};

// Durum metinlerini getir
const getStatusText = (status) => {
  const statusTexts = {
    CREATED: "Oluşturuldu",
    PENDING_PAYMENT: "Ödeme Bekliyor",
    PAYMENT_COMPLETED: "Ödeme Tamamlandı",
    PROCESSING: "Hazırlanıyor",
    SHIPPED: "Kargoya Verildi",
    DELIVERED: "Teslim Edildi",
    CANCELLED: "İptal Edildi",
  };
  return statusTexts[status] || status;
};

// Ürün tipi ikonunu getir
const getProductTypeIcon = (type) => {
  const icons = {
    seedling: Sprout,
    tool: Shovel,
    default: Package,
  };
  return icons[type] || icons.default;
};

// Ürün tipi metni
const getProductTypeText = (type) => {
  const types = {
    seedling: "Fide",
    tool: "Alet",
    default: "Ürün",
  };
  return types[type] || types.default;
};
</script>
