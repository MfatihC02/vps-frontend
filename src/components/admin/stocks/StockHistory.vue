<template>
  <div class="stock-history">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-semibold text-slate-800">
        Stok Hareketleri
      </h2>
      
      <!-- Filtreler -->
      <div class="flex items-center space-x-4">
        <!-- İşlem Tipi Filtresi -->
        <select
          v-model="filters.type"
          class="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        >
          <option value="">Tüm İşlemler</option>
          <option value="add">Ekleme</option>
          <option value="remove">Çıkarma</option>
        </select>

        <!-- Tarih Filtresi -->
        <select
          v-model="filters.date"
          class="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        >
          <option value="">Tüm Tarihler</option>
          <option value="today">Bugün</option>
          <option value="week">Bu Hafta</option>
          <option value="month">Bu Ay</option>
        </select>
      </div>
    </div>

    <!-- Tablo -->
    <div class="relative overflow-x-auto rounded-lg border border-slate-200">
      <table class="w-full text-sm text-left">
        <thead class="text-xs uppercase bg-slate-50">
          <tr>
            <th scope="col" class="px-4 py-3 text-slate-700">
              Tarih
            </th>
            <th scope="col" class="px-4 py-3 text-slate-700">
              İşlem
            </th>
            <th scope="col" class="px-4 py-3 text-slate-700">
              Miktar
            </th>
            <th scope="col" class="px-4 py-3 text-slate-700">
              Neden
            </th>
            <th scope="col" class="px-4 py-3 text-slate-700">
              Not
            </th>
            <th scope="col" class="px-4 py-3 text-slate-700">
              Kalan Stok
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-if="!loading && filteredMovements.length">
            <tr 
              v-for="movement in filteredMovements" 
              :key="movement._id"
              class="border-b border-slate-200 hover:bg-slate-50"
            >
              <td class="px-4 py-3 text-slate-600">
                {{ formatDate(movement.date) }}
              </td>
              <td class="px-4 py-3">
                <span 
                  class="px-2 py-1 text-xs font-medium rounded-full"
                  :class="[
                    movement.type === 'add' 
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                  ]"
                >
                  {{ movement.type === 'add' ? 'Ekleme' : 'Çıkarma' }}
                </span>
              </td>
              <td class="px-4 py-3 text-slate-600">
                {{ movement.quantity }} {{ movement.unit }}
              </td>
              <td class="px-4 py-3 text-slate-600">
                {{ formatReason(movement.reason) }}
              </td>
              <td class="px-4 py-3 text-slate-600">
                {{ movement.note || '-' }}
              </td>
              <td class="px-4 py-3 font-medium" 
                :class="[
                  movement.remainingStock <= lowStockThreshold
                    ? 'text-red-600'
                    : 'text-slate-700'
                ]"
              >
                {{ movement.remainingStock }} {{ movement.unit }}
              </td>
            </tr>
          </template>
          
          <!-- Yükleniyor -->
          <tr v-if="loading">
            <td colspan="6" class="px-4 py-8">
              <div class="flex items-center justify-center">
                <Loader2 class="w-6 h-6 text-emerald-600 animate-spin" />
                <span class="ml-2 text-slate-600">Yükleniyor...</span>
              </div>
            </td>
          </tr>

          <!-- Veri Yok -->
          <tr v-if="!loading && !filteredMovements.length">
            <td colspan="6" class="px-4 py-8">
              <div class="text-center text-slate-600">
                <History class="w-8 h-8 mx-auto mb-2 text-slate-400" />
                <p>Henüz stok hareketi bulunmuyor</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Sayfalama -->
    <div v-if="totalPages > 1" class="flex justify-center mt-6">
      <nav class="flex items-center space-x-2">
        <button
          @click="currentPage > 1 && (currentPage--)"
          :disabled="currentPage === 1"
          class="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50"
        >
          <ChevronLeft class="w-5 h-5 text-slate-600" />
        </button>
        
        <span class="text-sm text-slate-600">
          Sayfa {{ currentPage }} / {{ totalPages }}
        </span>
        
        <button
          @click="currentPage < totalPages && (currentPage++)"
          :disabled="currentPage === totalPages"
          class="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50"
        >
          <ChevronRight class="w-5 h-5 text-slate-600" />
        </button>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { Loader2, History, ChevronLeft, ChevronRight } from 'lucide-vue-next';
import { useStockStore } from '@/stores/stockStore';
import { useToast } from 'vue-toastification';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const toast = useToast();
const stockStore = useStockStore();

// Props
const props = defineProps({
  productId: {
    type: String,
    required: true
  }
});

// State
const loading = ref(false);
const movements = ref([]);
const currentPage = ref(1);
const itemsPerPage = 10;
const lowStockThreshold = ref(0);

const filters = ref({
  type: '',
  date: ''
});

// Computed
const filteredMovements = computed(() => {
  let filtered = [...movements.value];

  // İşlem tipi filtresi
  if (filters.value.type) {
    filtered = filtered.filter(m => m.type === filters.value.type);
  }

  // Tarih filtresi
  if (filters.value.date) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

    filtered = filtered.filter(m => {
      const moveDate = new Date(m.date);
      switch (filters.value.date) {
        case 'today':
          return moveDate >= today;
        case 'week':
          return moveDate >= weekAgo;
        case 'month':
          return moveDate >= monthAgo;
        default:
          return true;
      }
    });
  }

  return filtered;
});

const paginatedMovements = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredMovements.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredMovements.value.length / itemsPerPage);
});

// Methods
const fetchStockMovements = async () => {
  try {
    loading.value = true;
    const response = await stockStore.fetchStockMovements(props.productId);
    movements.value = response.movements;
    lowStockThreshold.value = response.lowStockThreshold;
  } catch (error) {
    toast.error('Stok hareketleri yüklenirken bir hata oluştu');
  } finally {
    loading.value = false;
  }
};

const formatDate = (date) => {
  return format(new Date(date), 'dd MMM yyyy HH:mm', { locale: tr });
};

const formatReason = (reason) => {
  const reasons = {
    purchase: 'Satın Alma',
    return: 'İade',
    correction: 'Düzeltme',
    sale: 'Satış',
    damage: 'Hasar/Kayıp',
    expired: 'Son Kullanma'
  };
  return reasons[reason] || reason;
};

// Watchers
watch(filters, () => {
  currentPage.value = 1;
}, { deep: true });

// Lifecycle
onMounted(async () => {
  await fetchStockMovements();
});
</script>
