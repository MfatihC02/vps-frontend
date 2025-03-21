<template>
  <div class="p-5">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-2xl font-bold">Kupon Yönetimi</h2>
      <router-link
        to="/admin/coupons/create"
        class="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center"
      >
        <i class="bi bi-plus-lg mr-1"></i> Yeni Kupon
      </router-link>
    </div>

    <!-- Filtreler -->
    <div class="bg-white rounded-lg shadow-sm mb-4 p-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Durum</label
          >
          <select
            v-model="filters.status"
            class="w-full rounded-md border border-gray-300 shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            @change="loadCoupons()"
          >
            <option value="">Tümü</option>
            <option value="active">Aktif</option>
            <option value="inactive">Pasif</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Sayfa Başına</label
          >
          <select
            v-model="pagination.limit"
            class="w-full rounded-md border border-gray-300 shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            @change="loadCoupons()"
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
        <div class="md:col-span-2 flex items-end">
          <div class="flex w-full">
            <input
              type="text"
              class="w-full rounded-l-md border border-gray-300 shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Kupon kodu ara..."
              v-model="searchQuery"
              @keyup.enter="loadCoupons()"
            />
            <button
              class="bg-gray-200 hover:bg-gray-300 px-4 rounded-r-md border-t border-r border-b border-gray-300"
              type="button"
              @click="loadCoupons()"
            >
              <i class="bi bi-search"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Kupon Tablosu -->
    <div class="bg-white rounded-lg shadow-sm">
      <div class="p-4 overflow-x-auto">
        <div v-if="isLoading" class="text-center my-5">
          <div
            class="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"
          ></div>
          <p class="mt-2 text-gray-600">Kuponlar yükleniyor...</p>
        </div>

        <div v-else-if="coupons.length === 0" class="text-center my-5">
          <i class="bi bi-ticket-perforated text-6xl text-gray-400"></i>
          <p class="mt-3 text-gray-500">Henüz kupon bulunmuyor.</p>
          <router-link
            to="/admin/coupons/create"
            class="inline-block mt-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
          >
            İlk Kuponu Oluştur
          </router-link>
        </div>

        <table v-else class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Kupon Kodu
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Açıklama
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                İndirim
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Kullanım
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Geçerlilik
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Durum
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[320px]"
              >
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="coupon in coupons"
              :key="coupon._id"
              class="hover:bg-gray-50"
            >
              <td class="px-6 py-4 whitespace-nowrap font-medium">
                {{ coupon.code }}
              </td>
              <td class="px-6 py-4">{{ coupon.description }}</td>
              <td class="px-6 py-4">
                {{
                  coupon.discountType === "PERCENTAGE"
                    ? `%${coupon.discountValue}`
                    : `${coupon.discountValue} TL`
                }}
                <small
                  v-if="coupon.minimumPurchaseAmount > 0"
                  class="block text-gray-500 text-xs"
                >
                  Min: {{ coupon.minimumPurchaseAmount }} TL
                </small>
              </td>
              <td class="px-6 py-4">
                {{ coupon.usedCount }}/{{ coupon.maxUsageCount }}
                <div class="w-full bg-gray-200 rounded-full h-1 mt-2">
                  <div
                    class="bg-blue-600 h-1 rounded-full"
                    :style="{
                      width:
                        (coupon.usedCount / coupon.maxUsageCount) * 100 + '%',
                    }"
                  ></div>
                </div>
              </td>
              <td class="px-6 py-4">
                <small class="text-xs">
                  {{ formatDate(coupon.startDate) }} -
                  {{ formatDate(coupon.endDate) }}
                </small>
                <span
                  class="block text-xs"
                  :class="
                    isExpired(coupon)
                      ? 'text-red-600'
                      : isActive(coupon)
                      ? 'text-green-600'
                      : 'text-yellow-600'
                  "
                >
                  {{ getDateStatus(coupon) }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span
                  class="px-2 py-1 text-xs rounded-full"
                  :class="
                    coupon.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  "
                >
                  {{ coupon.isActive ? "Aktif" : "Pasif" }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex flex-wrap gap-2">
                  <button
                    class="flex flex-col items-center justify-center p-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md min-w-[70px]"
                    @click="viewDetails(coupon._id)"
                    title="Kupon detaylarını görüntüle"
                  >
                    <i class="bi bi-eye text-lg mb-1"></i>
                    <span class="text-xs">Detaylar</span>
                  </button>
                  <router-link
                    :to="`/admin/coupons/edit/${coupon._id}`"
                    class="flex flex-col items-center justify-center p-2 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-md min-w-[70px]"
                    title="Kuponu düzenle"
                  >
                    <i class="bi bi-pencil text-lg mb-1"></i>
                    <span class="text-xs">Düzenle</span>
                  </router-link>
                  <button
                    class="flex flex-col items-center justify-center p-2 rounded-md min-w-[70px]"
                    :class="
                      coupon.isActive
                        ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    "
                    @click="toggleStatus(coupon._id)"
                    :title="
                      coupon.isActive ? 'Kuponu pasif yap' : 'Kuponu aktif yap'
                    "
                  >
                    <i
                      class="bi text-lg mb-1"
                      :class="
                        coupon.isActive ? 'bi-toggle-on' : 'bi-toggle-off'
                      "
                    ></i>
                    <span class="text-xs">{{
                      coupon.isActive ? "Pasif Yap" : "Aktif Yap"
                    }}</span>
                  </button>
                  <button
                    class="flex flex-col items-center justify-center p-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-md min-w-[70px]"
                    @click="confirmDelete(coupon)"
                    title="Kuponu sil"
                  >
                    <i class="bi bi-trash text-lg mb-1"></i>
                    <span class="text-xs">Sil</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Sayfalama -->
        <div v-if="totalPages > 1" class="flex justify-center mt-4">
          <nav
            class="relative z-0 inline-flex shadow-sm -space-x-px rounded-md"
          >
            <a
              href="#"
              class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              :class="{ 'opacity-50 cursor-not-allowed': currentPage === 1 }"
              @click.prevent="changePage(currentPage - 1)"
            >
              <i class="bi bi-chevron-left"></i>
            </a>
            <template v-for="(page, index) in paginationRange">
              <span
                v-if="page === '...'"
                :key="`ellipsis-${index}`"
                class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                >...</span
              >
              <a
                v-else
                :key="`page-${page}`"
                href="#"
                class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium"
                :class="
                  page === currentPage
                    ? 'bg-blue-50 border-blue-500 text-blue-600 z-10'
                    : 'bg-white text-gray-500 hover:bg-gray-50'
                "
                @click.prevent="changePage(page)"
                >{{ page }}</a
              >
            </template>
            <a
              href="#"
              class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              :class="{
                'opacity-50 cursor-not-allowed': currentPage === totalPages,
              }"
              @click.prevent="changePage(currentPage + 1)"
            >
              <i class="bi bi-chevron-right"></i>
            </a>
          </nav>
        </div>
      </div>
    </div>

    <!-- Silme Onay Modalı - Tailwind için yeniden yapılandırıldı -->
    <div v-if="isModalOpen" class="fixed inset-0 z-50 overflow-y-auto">
      <div
        class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
      >
        <div class="fixed inset-0 transition-opacity">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <!-- Modal panel -->
        <div
          class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-headline"
        >
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div
                class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10"
              >
                <i class="bi bi-exclamation-triangle text-red-600"></i>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3
                  class="text-lg leading-6 font-medium text-gray-900"
                  id="modal-headline"
                >
                  Kuponu Sil
                </h3>
                <div class="mt-2" v-if="couponToDelete">
                  <p class="text-sm text-gray-500">
                    <strong>{{ couponToDelete.code }}</strong> kodlu kuponu
                    silmek istediğinize emin misiniz?
                  </p>
                  <p class="text-sm text-gray-500 mt-1">
                    {{ couponToDelete.description }}
                  </p>
                  <div
                    class="mt-3 p-3 bg-yellow-50 text-yellow-700 text-sm rounded-md"
                  >
                    <i class="bi bi-exclamation-triangle mr-2"></i>
                    Bu işlem geri alınamaz!
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
              @click="deleteCoupon"
              :disabled="isDeleting"
            >
              <span
                v-if="isDeleting"
                class="mr-2 inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"
              ></span>
              {{ isDeleting ? "Siliniyor..." : "Evet, Sil" }}
            </button>
            <button
              type="button"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              @click="closeModal"
            >
              İptal
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useCouponStore } from "@/stores/couponStore";

export default {
  name: "CouponList",
  setup() {
    const router = useRouter();
    const couponStore = useCouponStore();

    // Referanslar
    const deleteModal = ref(null);
    const isModalOpen = ref(false);

    // Durum değişkenleri
    const coupons = computed(() => couponStore.adminCoupons);
    const isLoading = computed(() => couponStore.isAdminLoading);
    const error = computed(() => couponStore.adminErrorMessage);
    const totalPages = computed(() => couponStore.pagination.totalPages);

    const couponToDelete = ref(null);
    const isDeleting = ref(false);
    const searchQuery = ref("");

    // Filtreler ve sayfalama
    const filters = ref({
      status: "",
    });

    const pagination = ref({
      page: 1,
      limit: 10,
    });

    const currentPage = computed(() => couponStore.pagination.page);

    // Sayfalama aralığını hesapla (maksimum 5 sayfa göster)
    const paginationRange = computed(() => {
      const total = totalPages.value;
      const current = currentPage.value;
      const delta = 2; // Sayfa numaralarının her iki tarafında kaç sayfa gösterileceği

      let range = [];

      // Sayfa sayısı 5 veya daha az ise tüm sayfaları göster
      if (total <= 5) {
        range = [...Array(total)].map((_, i) => i + 1);
      } else {
        // İlk sayfa her zaman gösterilir
        range.push(1);

        // Mevcut sayfa etrafındaki sayfaları hesapla
        const start = Math.max(2, current - delta);
        const end = Math.min(total - 1, current + delta);

        // Başlangıç sayfasından önce boşluk varsa "..." ekle
        if (start > 2) {
          range.push("...");
        }

        // Aralık içindeki sayfaları ekle
        for (let i = start; i <= end; i++) {
          range.push(i);
        }

        // Bitiş sayfasından sonra boşluk varsa "..." ekle
        if (end < total - 1) {
          range.push("...");
        }

        // Son sayfa her zaman gösterilir
        range.push(total);
      }

      return range;
    });

    // Yaşam döngüsü
    onMounted(() => {
      loadCoupons();
    });

    // Metodlar
    const loadCoupons = async () => {
      await couponStore.fetchAdminCoupons({
        page: pagination.value.page,
        limit: pagination.value.limit,
        status: filters.value.status,
        search: searchQuery.value,
      });
    };

    const changePage = (page) => {
      if (page < 1 || page > totalPages.value) return;
      pagination.value.page = page;
      loadCoupons();
    };

    const viewDetails = (couponId) => {
      router.push(`/admin/coupons/details/${couponId}`);
    };

    const toggleStatus = async (couponId) => {
      await couponStore.toggleCouponStatus(couponId);
      loadCoupons();
    };

    const confirmDelete = (coupon) => {
      couponToDelete.value = coupon;
      isModalOpen.value = true;
    };

    const closeModal = () => {
      isModalOpen.value = false;
    };

    const deleteCoupon = async () => {
      if (!couponToDelete.value) return;

      isDeleting.value = true;

      try {
        const success = await couponStore.deleteCoupon(
          couponToDelete.value._id
        );

        if (success) {
          isModalOpen.value = false;
          loadCoupons();
        }
      } finally {
        isDeleting.value = false;
      }
    };

    // Yardımcı fonksiyonlar
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString("tr-TR");
    };

    const isExpired = (coupon) => {
      return new Date(coupon.endDate) < new Date();
    };

    const isActive = (coupon) => {
      const now = new Date();
      return (
        new Date(coupon.startDate) <= now && new Date(coupon.endDate) >= now
      );
    };

    const getDateStatus = (coupon) => {
      if (isExpired(coupon)) {
        return "Süresi doldu";
      } else if (isActive(coupon)) {
        return "Aktif dönemde";
      } else {
        return "Henüz başlamadı";
      }
    };

    return {
      coupons,
      isLoading,
      error,
      filters,
      pagination,
      searchQuery,
      currentPage,
      totalPages,
      paginationRange,
      couponToDelete,
      isDeleting,
      deleteModal,
      isModalOpen,
      loadCoupons,
      changePage,
      viewDetails,
      toggleStatus,
      confirmDelete,
      closeModal,
      deleteCoupon,
      formatDate,
      isExpired,
      isActive,
      getDateStatus,
    };
  },
};
</script>

<style scoped>
.coupon-list {
  padding: 20px;
}

.progress {
  height: 4px;
  margin-top: 5px;
}

.badge {
  padding: 6px 12px;
  font-weight: normal;
}
</style> 