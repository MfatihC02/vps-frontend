<template>
  <div class="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
    <!-- Başlık ve Özet Bilgiler -->
    <div class="mb-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 class="text-2xl font-bold text-slate-800 mb-4 sm:mb-0">
          Stok Yönetimi
        </h1>
        <!-- Hızlı Özet Kartları -->
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div class="bg-white rounded-xl shadow-sm p-4 border border-slate-200">
            <div class="flex items-center space-x-3">
              <Package class="w-8 h-8 text-emerald-600" />
              <div>
                <p class="text-sm text-slate-600">Mevcut Stok</p>
                <p class="text-xl font-semibold text-slate-800">
                  {{ currentStock }} {{ stockUnit }}
                </p>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-xl shadow-sm p-4 border border-slate-200">
            <div class="flex items-center space-x-3">
              <AlertTriangle 
                :class="[
                  'w-8 h-8',
                  isLowStock ? 'text-red-500' : 'text-amber-500'
                ]"
              />
              <div>
                <p class="text-sm text-slate-600">Kritik Seviye</p>
                <p class="text-xl font-semibold text-slate-800">
                  {{ lowStockThreshold }} {{ stockUnit }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Ana İçerik -->
    <div class="grid lg:grid-cols-2 gap-6">
      <!-- Sol Panel: Stok İşlemleri -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <Suspense>
          <template #default>
            <StockOperations 
              :productId="props.id"
              :currentStock="currentStock"
              :stockUnit="stockUnit"
              @stock-updated="handleStockUpdate"
              class="h-full"
            />
          </template>
          <template #fallback>
            <div class="flex items-center justify-center h-64">
              <Loader2 class="w-8 h-8 text-emerald-600 animate-spin" />
            </div>
          </template>
        </Suspense>
      </div>

      <!-- Sağ Panel: Stok Geçmişi -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <Suspense>
          <template #default>
            <StockHistory 
              :productId="props.id"
              class="h-full"
            />
          </template>
          <template #fallback>
            <div class="flex items-center justify-center h-64">
              <Loader2 class="w-8 h-8 text-emerald-600 animate-spin" />
            </div>
          </template>
        </Suspense>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineAsyncComponent, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { Package, AlertTriangle, Loader2 } from 'lucide-vue-next';
import { useStockStore } from '@/stores/stockStore';
import { useToast } from 'vue-toastification';

// Lazy loading için alt bileşenleri yükle
const StockOperations = defineAsyncComponent(() => 
  import('@/components/admin/stocks/StockOperations.vue')
);
const StockHistory = defineAsyncComponent(() => 
  import('@/components/admin/stocks/StockHistory.vue')
);

const route = useRoute();
const toast = useToast();
const stockStore = useStockStore();

// Props ve Route Params
const props = defineProps({
  id: {
    type: String,
    required: true
  }
});

// State
const currentStock = ref(0);
const stockUnit = ref('adet');
const lowStockThreshold = ref(0);

// Computed
const isLowStock = computed(() => {
  return currentStock.value <= lowStockThreshold.value;
});

// Methods
const fetchStockData = async () => {
  try {
    const stockData = await stockStore.fetchStockByProduct(props.id);
    if (stockData) {
      currentStock.value = stockData.quantity;
      stockUnit.value = stockData.unit;
      lowStockThreshold.value = stockData.lowStockThreshold;
    }
  } catch (error) {
    toast.error(error.response?.data?.message || 'Stok bilgisi alınamadı');
  }
};

const handleStockUpdate = async () => {
  await fetchStockData();
};

// Lifecycle Hooks
onMounted(async () => {
  await fetchStockData();
  stockStore.initializeSocketListeners();
});

onUnmounted(() => {
  stockStore.cleanup();
});
</script>
