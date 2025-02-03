<template>
  <div class="product-detail-view">
    <!-- Üst Başlık ve Bilgi Alanı -->
    <header class="mb-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold text-slate-900">
          {{ product?.name || 'Ürün Detayı' }}
        </h1>
        <div class="flex items-center gap-3">
          <button 
            @click="showDeleteModal = true"
            class="btn-danger"
            :disabled="loading"
          >
            <i class="fas fa-trash-alt mr-2"></i>
            Ürünü Sil
          </button>
          <router-link 
            to="/admin/product" 
            class="btn-secondary"
          >
            Ürün Listesine Dön
          </router-link>
        </div>
      </div>
      
      <div class="product-meta mt-2 flex gap-4 text-sm text-slate-600">
        <span v-if="product?.sku">SKU: {{ product.sku }}</span>
        <span v-if="product?.category">
          Kategori: {{ product.category.name }}
        </span>
        <span v-if="product?.createdAt">
          Oluşturulma: {{ formatDate(product.createdAt) }}
        </span>
      </div>
    </header>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
    </div>

    <template v-else>
      <!-- Error State -->
      <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p class="text-red-600">{{ error }}</p>
        <button 
          @click="fetchProduct" 
          class="mt-2 text-sm text-red-600 hover:text-red-800"
        >
          Tekrar Dene
        </button>
      </div>

      <!-- Tab Navigation -->
      <nav class="tabs" v-if="product">
        <router-link 
          :to="`/admin/product/${productId}/edit`"
          class="tab-item"
          :class="{ 'active': $route.name === 'product-edit' }"
        >
          <i class="fas fa-edit mr-2"></i>
          Ürün Bilgileri
        </router-link>
        
        <router-link 
          :to="`/admin/product/${productId}/stock`"
          class="tab-item"
          :class="{ 'active': $route.name === 'product-stock' }"
        >
          <i class="fas fa-boxes mr-2"></i>
          Stok Yönetimi
        </router-link>
      </nav>

      <!-- Tab İçeriği -->
      <div class="tab-content bg-white rounded-lg shadow-sm border border-slate-200">
        <router-view 
          v-if="product"
          :product-id="productId"
          :product="product"
          :is-editing="true"
          @product-updated="handleProductUpdate"
        />
      </div>
    </template>
  </div>

  <!-- Silme Onay Modalı -->
  <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
    <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
      <h3 class="text-lg font-semibold text-slate-900 mb-4">Ürünü Silmeyi Onayla</h3>
      <p class="text-slate-600 mb-6">
        "{{ product?.name }}" ürününü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
      </p>
      <div class="flex justify-end gap-3">
        <button 
          @click="showDeleteModal = false"
          class="btn-secondary"
          :disabled="deleteLoading"
        >
          İptal
        </button>
        <button 
          @click="handleDelete"
          class="btn-danger"
          :disabled="deleteLoading"
        >
          <i class="fas fa-spinner fa-spin mr-2" v-if="deleteLoading"></i>
          {{ deleteLoading ? 'Siliniyor...' : 'Evet, Sil' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProductStore } from '@/stores/productStore';
import { useToast } from 'vue-toastification';
import { formatDate } from '@/utils/dateUtils';

const route = useRoute();
const router = useRouter();
const productStore = useProductStore();
const toast = useToast();

// State
const product = ref(null);
const loading = ref(false);
const error = ref(null);
const productId = route.params.id;
const showDeleteModal = ref(false);
const deleteLoading = ref(false);

// Ürün bilgilerini getir
const fetchProduct = async () => {
  if (!productId || productId === 'new') return;
  
  loading.value = true;
  error.value = null;

  try {
    const response = await productStore.fetchProductById(productId);
    console.log('Backend\'den gelen ürün verisi:', response);
    
    if (response.success && response.data) {
      // Önceki veri ile karşılaştırma yapalım
      if (product.value?.price?.current !== response.data.price?.current) {
        console.log('Fiyat değişimi:', {
          eski: product.value?.price?.current,
          yeni: response.data.price?.current
        });
      }

      // Diğer değişiklikleri kontrol et
      if (JSON.stringify(product.value) !== JSON.stringify(response.data)) {
        console.log('Ürün verisinde değişiklik tespit edildi');
      }
      
      product.value = response.data;
      console.log('Ürün verisi state\'e yüklendi:', product.value);
    } else {
      throw new Error('Ürün verisi alınamadı');
    }
  } catch (err) {
    console.error('Ürün bilgileri alınamadı:', err);
    error.value = 'Ürün bilgileri yüklenirken bir hata oluştu.';
    toast.error('Ürün bilgileri alınamadı');
  } finally {
    loading.value = false;
  }
};

// Ürün güncellendiğinde
const handleProductUpdate = async (updatedProduct) => {
  try {
    console.log('Güncelleme öncesi ürün:', product.value);
    console.log('Güncellenecek ürün:', updatedProduct);
    
    // Önce local state'i güncelle
    product.value = { ...updatedProduct };
    
    // Toast mesajı göster
    toast.success('Ürün güncelleniyor...');
    
    // Backend'in işlemi tamamlaması için bekle
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Veriyi tekrar çek
    await fetchProduct();
    
    // Güncelleme sonrası kontrol
    console.log('Güncelleme sonrası ürün:', product.value);
    
    // Başarılı güncelleme mesajı
    toast.success('Ürün başarıyla güncellendi');
  } catch (error) {
    console.error('Ürün güncelleme hatası:', error);
    toast.error('Ürün güncellenirken bir hata oluştu');
    
    // Hata durumunda veriyi tekrar çek
    await fetchProduct();
  }
};

// Silme işlemi
const handleDelete = async () => {
  if (!product.value?._id) return;
  
  deleteLoading.value = true;
  
  try {
    await productStore.deleteProduct(product.value._id);
    toast.success('Ürün başarıyla silindi');
    router.push('/admin/product');
  } catch (err) {
    console.error('Ürün silinirken hata:', err);
    toast.error(err.response?.data?.message || 'Ürün silinirken bir hata oluştu');
  } finally {
    deleteLoading.value = false;
    showDeleteModal.value = false;
  }
};

// Lifecycle Hooks
onMounted(() => {
  console.log('ProductDetailView mounted. ProductId:', productId);
  fetchProduct();
});
</script>

<style scoped>
.product-detail-view {
  @apply min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8;
}

.btn-secondary {
  @apply px-4 py-2 text-sm font-medium text-slate-700 bg-white 
         border border-slate-300 rounded-lg shadow-sm 
         hover:bg-slate-50 focus:outline-none focus:ring-2 
         focus:ring-offset-2 focus:ring-emerald-500
         disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-danger {
  @apply px-4 py-2 text-sm font-medium text-white bg-red-600
         rounded-lg shadow-sm hover:bg-red-700 focus:outline-none 
         focus:ring-2 focus:ring-offset-2 focus:ring-red-500
         disabled:opacity-50 disabled:cursor-not-allowed
         transition-colors duration-200;
}

.tabs {
  @apply flex space-x-4 border-b border-slate-200 mb-6;
}

.tab-item {
  @apply px-4 py-3 text-slate-600 hover:text-slate-900 
         border-b-2 border-transparent -mb-[2px]
         flex items-center transition-colors duration-200;
}

.tab-item.active {
  @apply text-emerald-600 border-emerald-600 font-medium;
}

.tab-content {
  @apply p-6;
}
</style>
