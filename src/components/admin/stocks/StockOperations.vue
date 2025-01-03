<template>
  <div class="stock-operations">
    <h2 class="text-lg font-semibold text-slate-800 mb-6">
      Stok İşlemleri
    </h2>

    <!-- Stok Yok - İlk Stok Oluşturma -->
    <div v-if="!hasExistingStock" class="space-y-6">
      <div class="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div class="flex items-start">
          <AlertTriangle class="w-5 h-5 text-amber-500 mt-0.5 mr-3" />
          <div>
            <h3 class="text-sm font-medium text-amber-800">
              Stok Kaydı Bulunamadı
            </h3>
            <p class="mt-1 text-sm text-amber-700">
              Bu ürün için henüz stok kaydı oluşturulmamış. Lütfen ilk stok kaydını oluşturun.
            </p>
          </div>
        </div>
      </div>

      <form @submit.prevent="handleCreateStock" class="space-y-6">
        <!-- Miktar -->
        <div class="form-group">
          <label class="block text-sm font-medium text-slate-700 mb-1">
            Başlangıç Stok Miktarı
          </label>
          <div class="relative">
            <input
              v-model.number="initialStock.quantity"
              type="number"
              min="0"
              required
              class="w-full pl-4 pr-12 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Miktar giriniz"
            />
            <span class="absolute right-4 top-2 text-slate-500">
              {{ initialStock.unit }}
            </span>
          </div>
        </div>

        <!-- Birim -->
        <div class="form-group">
          <label class="block text-sm font-medium text-slate-700 mb-1">
            Stok Birimi
          </label>
          <select
            v-model="initialStock.unit"
            required
            class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="adet">Adet</option>
            <option value="kg">Kilogram</option>
            <option value="lt">Litre</option>
            <option value="mt">Metre</option>
          </select>
        </div>

        <!-- Kritik Stok Seviyesi -->
        <div class="form-group">
          <label class="block text-sm font-medium text-slate-700 mb-1">
            Kritik Stok Seviyesi
          </label>
          <div class="relative">
            <input
              v-model.number="initialStock.lowStockThreshold"
              type="number"
              min="0"
              required
              class="w-full pl-4 pr-12 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Kritik seviye giriniz"
            />
            <span class="absolute right-4 top-2 text-slate-500">
              {{ initialStock.unit }}
            </span>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="flex justify-end">
          <button
            type="submit"
            :disabled="loading || !isValidInitialStock"
            class="inline-flex items-center px-6 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            :class="[
              loading ? 'bg-slate-400' : 'bg-emerald-600 hover:bg-emerald-700',
              'text-white shadow-sm'
            ]"
          >
            <Loader2 
              v-if="loading" 
              class="w-4 h-4 mr-2 animate-spin"
            />
            <PackagePlus v-else class="w-4 h-4 mr-2" />
            {{ loading ? 'Oluşturuluyor...' : 'Stok Kaydı Oluştur' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Stok Var - Stok İşlemleri -->
    <div v-else>
      <!-- İşlem Tipi Seçimi -->
      <div class="flex space-x-2 mb-6">
        <button
          v-for="type in operationTypes"
          :key="type.value"
          @click="selectedType = type.value"
          :class="[
            'flex-1 py-2 px-4 rounded-lg font-medium transition-colors duration-200',
            selectedType === type.value
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          ]"
        >
          <div class="flex items-center justify-center space-x-2">
            <component :is="type.icon" class="w-5 h-5" />
            <span>{{ type.label }}</span>
          </div>
        </button>
      </div>

      <!-- İşlem Formu -->
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Miktar -->
        <div class="form-group">
          <label class="block text-sm font-medium text-slate-700 mb-1">
            {{ selectedType === 'add' ? 'Eklenecek Miktar' : 'Çıkarılacak Miktar' }}
          </label>
          <div class="relative">
            <input
              v-model.number="quantity"
              type="number"
              min="0"
              :max="selectedType === 'remove' ? currentStock : undefined"
              required
              class="w-full pl-4 pr-12 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              :placeholder="'Miktar giriniz'"
            />
            <span class="absolute right-4 top-2 text-slate-500">
              {{ stockUnit }}
            </span>
          </div>
          <!-- Miktar Validasyon Mesajı -->
          <p v-if="quantityError" class="mt-1 text-sm text-red-500">
            {{ quantityError }}
          </p>
        </div>

        <!-- İşlem Nedeni -->
        <div class="form-group">
          <label class="block text-sm font-medium text-slate-700 mb-1">
            İşlem Nedeni
          </label>
          <select
            v-model="reason"
            required
            class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">Neden Seçiniz</option>
            <template v-if="selectedType === 'add'">
              <option value="purchase">Satın Alma</option>
              <option value="return">İade</option>
              <option value="correction">Stok Düzeltme</option>
            </template>
            <template v-else>
              <option value="sale">Satış</option>
              <option value="damage">Hasar/Kayıp</option>
              <option value="expired">Son Kullanma Tarihi</option>
              <option value="correction">Stok Düzeltme</option>
            </template>
          </select>
        </div>

        <!-- Not -->
        <div class="form-group">
          <label class="block text-sm font-medium text-slate-700 mb-1">
            Not (Opsiyonel)
          </label>
          <textarea
            v-model="note"
            rows="3"
            class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="İşlem hakkında not ekleyin..."
          ></textarea>
        </div>

        <!-- İşlem Özeti -->
        <div class="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <h3 class="text-sm font-medium text-slate-700 mb-2">İşlem Özeti</h3>
          <div class="space-y-1 text-sm">
            <p class="text-slate-600">
              Mevcut Stok: {{ currentStock }} {{ stockUnit }}
            </p>
            <p class="text-slate-600">
              {{ selectedType === 'add' ? 'Eklenecek' : 'Çıkarılacak' }} Miktar: 
              {{ quantity || 0 }} {{ stockUnit }}
            </p>
            <p class="font-medium text-slate-700">
              İşlem Sonrası Stok: 
              {{ calculateFinalStock }} {{ stockUnit }}
            </p>
          </div>
        </div>

        <!-- Submit Butonu -->
        <div class="flex justify-end">
          <button
            type="submit"
            :disabled="loading || !isValid"
            class="inline-flex items-center px-6 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            :class="[
              loading ? 'bg-slate-400' : 'bg-emerald-600 hover:bg-emerald-700',
              'text-white shadow-sm'
            ]"
          >
            <Loader2 
              v-if="loading" 
              class="w-4 h-4 mr-2 animate-spin"
            />
            <component 
              v-else 
              :is="selectedType === 'add' ? 'PlusCircle' : 'MinusCircle'"
              class="w-4 h-4 mr-2"
            />
            {{ loading ? 'İşleniyor...' : 'İşlemi Tamamla' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { PlusCircle, MinusCircle, Loader2, AlertTriangle, PackagePlus } from 'lucide-vue-next';
import { useStockStore } from '@/stores/stockStore';
import { useToast } from 'vue-toastification';

const toast = useToast();
const stockStore = useStockStore();

// Props
const props = defineProps({
  productId: {
    type: String,
    required: true
  },
  currentStock: {
    type: Number,
    default: 0
  },
  stockUnit: {
    type: String,
    default: 'adet'
  }
});

// Emit
const emit = defineEmits(['stock-updated']);

// State
const loading = ref(false);
const hasExistingStock = ref(false);
const selectedType = ref('add');
const quantity = ref(null);
const reason = ref('');
const note = ref('');

// İlk stok oluşturma state
const initialStock = ref({
  quantity: null,
  unit: 'adet',
  lowStockThreshold: null
});

// İşlem tipleri
const operationTypes = [
  { 
    value: 'add', 
    label: 'Stok Ekle',
    icon: PlusCircle
  },
  { 
    value: 'remove', 
    label: 'Stok Çıkar',
    icon: MinusCircle
  }
];

// Computed
const quantityError = computed(() => {
  if (!quantity.value) return '';
  if (quantity.value <= 0) return 'Miktar 0\'dan büyük olmalıdır';
  if (selectedType.value === 'remove' && quantity.value > props.currentStock) {
    return 'Çıkarılacak miktar mevcut stoktan fazla olamaz';
  }
  return '';
});

const isValid = computed(() => {
  return quantity.value > 0 && 
         reason.value && 
         !quantityError.value &&
         (selectedType.value === 'add' || quantity.value <= props.currentStock);
});

const isValidInitialStock = computed(() => {
  return initialStock.value.quantity > 0 && 
         initialStock.value.unit && 
         initialStock.value.lowStockThreshold >= 0;
});

const calculateFinalStock = computed(() => {
  if (!quantity.value) return props.currentStock;
  return selectedType.value === 'add'
    ? props.currentStock + quantity.value
    : props.currentStock - quantity.value;
});

// Methods
const checkExistingStock = async () => {
  try {
    const stockData = await stockStore.fetchStockByProduct(props.productId);
    hasExistingStock.value = !!stockData;
  } catch (error) {
    hasExistingStock.value = false;
  }
};

const handleCreateStock = async () => {
  if (!isValidInitialStock.value) return;

  try {
    loading.value = true;
    await stockStore.createStock(props.productId, initialStock.value);
    
    toast.success('Stok kaydı başarıyla oluşturuldu');
    emit('stock-updated');
    
    // Stok durumunu güncelle
    await checkExistingStock();
  } catch (error) {
    toast.error(error.response?.data?.message || 'Stok kaydı oluşturulamadı');
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  if (!isValid.value) return;

  try {
    loading.value = true;

    const operation = {
      quantity: quantity.value,
      type: selectedType.value,
      reason: reason.value,
      note: note.value || undefined
    };

    await stockStore.updateStock(props.productId, operation);

    // İşlem başarılı
    toast.success(`${quantity.value} ${props.stockUnit} stok ${selectedType.value === 'add' ? 'eklendi' : 'çıkarıldı'}`);
    
    // Form temizle
    quantity.value = null;
    reason.value = '';
    note.value = '';

    // Parent'ı bilgilendir
    emit('stock-updated');

  } catch (error) {
    toast.error(error.response?.data?.message || 'İşlem başarısız');
  } finally {
    loading.value = false;
  }
};

// Lifecycle Hooks
onMounted(() => {
  checkExistingStock();
});
</script>