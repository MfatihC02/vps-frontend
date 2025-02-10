<template>
  <div class="min-h-screen bg-gray-50/80">
    <!-- Mega Header -->
    <div class="bg-gradient-to-r from-primary-dark to-primary-light text-white relative overflow-hidden">
      <div class="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
      <div class="max-w-7xl mx-auto py-8 sm:py-12 px-4 relative">
        <h1 class="text-3xl sm:text-4xl font-montserrat font-bold mb-2">
          {{ currentCategory?.name || "Kategoriler" }}
        </h1>
        <p class="text-base sm:text-lg font-inter opacity-90 max-w-2xl">
          Profesyonel üreticiler için özenle seçilmiş, yüksek kaliteli
          {{ currentCategory?.name?.toLowerCase() || "ürünler" }}
        </p>
        <!-- Breadcrumb -->
        <nav class="flex items-center gap-1.5 mt-4 text-sm text-white/90 flex-wrap font-inter">
          <router-link to="/" 
                      class="flex items-center gap-1.5 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/10">
            <Home class="w-4 h-4" />
            <span class="hidden sm:inline">Ana Sayfa</span>
          </router-link>

          <template v-if="categoryPath && categoryPath.length">
            <div v-for="(category, index) in categoryPath" 
                 :key="category.slug" 
                 class="flex items-center">
              <ChevronRight class="w-4 h-4 opacity-70 mx-1" />
              <router-link
                :to="`/kategori/${categoryPath.slice(0, index + 1).map((c) => c.slug).join('/')}`"
                class="px-2 py-1 rounded-lg hover:bg-white/10 hover:text-white transition-colors truncate max-w-[150px] sm:max-w-[200px]"
                :title="category.name"
              >
                {{ category.name }}
              </router-link>
            </div>
          </template>
        </nav>
      </div>
    </div>

    <!-- Alt kategori varsa kategori listesi -->
    <template v-if="hasSubCategories">
      <!-- Kontrol Paneli -->
      <div class="sticky top-0 bg-white/90 border-b z-10 backdrop-blur-sm shadow-sm">
        <div class="max-w-7xl mx-auto px-4 py-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
            </div>

            <div class="flex items-center gap-3">
              <div class="relative">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Kategori ara..."
                  class="w-64 pl-10 pr-4 py-2 rounded-full border-gray-200 bg-gray-50/50
                         focus:ring-2 focus:ring-primary/20 focus:border-primary 
                         transition-all font-inter text-sm"
                  @input="filterCategories"
                />
                <Search class="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Ana İçerik - Kategoriler -->
      <div class="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        <div class="space-y-8">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div v-for="category in groupedCategories" 
                 :key="category._id"
                 class="category-card bg-white rounded-xl overflow-hidden border border-gray-100/80 
                        hover:shadow-lg hover:border-primary/10 transition-all duration-300">
              <div class="flex flex-col sm:flex-row h-full">
                <div class="relative w-full sm:w-1/3 aspect-[16/9] sm:aspect-auto overflow-hidden bg-gray-50">
                  <img :src="category.image || '/api/placeholder/400/300'"
                       :alt="category.name"
                       class="w-full h-full object-cover transition-all duration-500" />
                </div>
                
                <div class="flex-1 p-4 flex flex-col justify-between">
                  <div>
                    <div class="flex items-start justify-between mb-2">
                      <h2 class="text-lg font-semibold text-gray-800 line-clamp-2 font-montserrat">
                        {{ category.name }}
                      </h2>
                    </div>
                    
                    <!-- Meta Description -->
                    <p v-if="category.metadata?.description" 
                       class="text-sm text-gray-600 mb-2 line-clamp-2">
                      {{ category.metadata.description }}
                    </p>
                    <p v-else-if="category.description" 
                       class="text-sm text-gray-600 mb-2 line-clamp-2">
                      {{ category.description }}
                    </p>
                    <!-- Hidden Keywords for SEO -->
                    <div v-if="category.metadata?.keywords?.length" 
                        class="sr-only" 
                        aria-hidden="true">
                      <span v-for="keyword in category.metadata.keywords" 
                            :key="keyword">
                        {{ keyword }}
                      </span>
                    </div>
                    <!-- Category Stats -->
                    <div class="flex items-center gap-3 text-sm text-gray-500">
                      <span v-if="category.subCategoryCount > 0" 
                            class="flex items-center gap-1">
                        <FolderTree class="w-4 h-4" />
                        {{ category.subCategoryCount }} Alt Kategori
                      </span>
                      <span v-if="category.productCount > 0" 
                            class="flex items-center gap-1">
                        <Package class="w-4 h-4" />
                        {{ category.productCount }} Ürün
                      </span>
                    </div>
                  </div>
                  
                  <button @click="navigateToCategory(category)"
                          class="mt-4 w-full bg-primary text-white py-2.5 rounded-lg hover:bg-primary-dark 
                                 active:bg-primary-dark/90 transition-colors flex items-center justify-center gap-2 
                                 text-sm font-medium group font-inter">
                    <span>Tüm Ürünleri İncele</span>
                    <ChevronRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Alt kategori yoksa ürünleri göster -->
    <CategoryProduct v-else :category-slug="getLastSlug" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useCategoryStore } from "@/stores/categoryStore";
import { 
  ChevronRight, 
  Search, 
  ArrowRight,
  Layers,
  FolderTree,
  Star,
  Package,
  Wrench,
  Monitor,
  Box,
  Folder,
  Home
} from "lucide-vue-next";
import CategoryProduct from "@/views/user/CategoryProducts.vue";
import { useHead } from '@vueuse/head';

const route = useRoute();
const router = useRouter();
const categoryStore = useCategoryStore();
const searchQuery = ref("");

// Kategori yolu hesaplama
const categoryPath = computed(() => {
  if (!route.params.path) return [];

  const path = Array.isArray(route.params.path)
    ? route.params.path.join("/")
    : route.params.path;

  return categoryStore.getCategoryByPath(path) || [];
});

// Mevcut kategoriyi hesaplama
const currentCategory = computed(() => {
  if (!categoryPath.value.length) return null;
  return categoryPath.value[categoryPath.value.length - 1];
});

// Alt kategorisi olup olmadığını kontrol et
const hasSubCategories = computed(() => {
  return currentCategory.value?.children?.length > 0;
});

// Son URL slug'ını al
const getLastSlug = computed(() => {
  if (!route.params.path) return "";
  const paths = Array.isArray(route.params.path)
    ? route.params.path
    : [route.params.path];
  return paths[paths.length - 1];
});

// Alt kategorileri filtrele ve order'a göre grupla
const groupedCategories = computed(() => {
  if (!currentCategory.value) return [];

  const filteredCategories =
    currentCategory.value.children?.filter((category) =>
      category.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    ) || [];

  return filteredCategories;
});

// Toplam ürün sayısı
const totalProducts = computed(() => {
  return (
    currentCategory.value?.children?.reduce(
      (total, category) => total + (category.productCount || 0),
      0
    ) || 0
  );
});

// SEO meta tags
const getMetaData = computed(() => {
  if (!currentCategory.value) {
    return {
      title: 'Tüm Kategoriler | E-Ticaret',
      description: 'Profesyonel üreticiler için özenle seçilmiş, yüksek kaliteli ürünler',
      keywords: 'e-ticaret, ürünler, kategoriler'
    }
  }

  const category = currentCategory.value;
  return {
    title: category.metadata?.title || `${category.name} | E-Ticaret`,
    description: category.metadata?.description || category.description || `${category.name} kategorisinde yer alan ürünlerimizi keşfedin`,
    keywords: Array.isArray(category.metadata?.keywords) && category.metadata.keywords.length > 0
      ? category.metadata.keywords.join(', ')
      : `${category.name}, e-ticaret, ürünler`
  }
});

useHead(() => ({
  title: getMetaData.value.title,
  meta: [
    {
      name: 'description',
      content: getMetaData.value.description
    },
    {
      name: 'keywords',
      content: getMetaData.value.keywords
    }
  ]
}));

// Yardımcı fonksiyonlar
const getOrderGroupTitle = (order) => {
  const titles = {
    1: "Temel Kategoriler",
    2: "Alt Kategoriler",
    3: "Özel Kategoriler",
  };
  return titles[order] || `Grup ${order}`;
};

const getCategoryLevel = (level) => {
  const levels = {
    0: "Ana Kategori",
    1: "1. Seviye",
    2: "2. Seviye",
    3: "3. Seviye",
  };
  return levels[level] || `Seviye ${level}`;
};

const getCategoryFeatures = (category) => {
  return [
    category.isActive ? "Aktif" : "Pasif",
    `Seviye ${category.level}`,
    `${category.children?.length || 0} Alt Kategori`,
  ];
};

const navigateToCategory = (category) => {
  const newPath = categoryPath.value.length
    ? [...categoryPath.value.map((c) => c.slug), category.slug]
    : [category.slug];

  router.push({
    name: "category-detail",
    params: { path: newPath },
  });
};

// Kategori ikonlarını getir
const getCategoryIcon = (order) => {
  const icons = {
    1: Layers,
    2: FolderTree,
    3: Star,
  };
  return icons[order] || Layers;
};

// Kategori tipine göre ikon getir
const getCategoryTypeIcon = (category) => {
  const icons = {
    product: Package,
    service: Wrench,
    digital: Monitor,
    physical: Box,
  };
  return icons[category.type] || Folder;
};

// Component yüklendiğinde kategorileri getir
onMounted(async () => {
  if (!categoryStore.categories.length) {
    await categoryStore.fetchCategoryTree();
  }
});

// URL değiştiğinde kategorileri yeniden kontrol et
watch(
  () => route.params.path,
  async (newPath) => {
    if (!categoryStore.categories.length) {
      await categoryStore.fetchCategoryTree();
    }
  }
);
</script>

<style scoped>
.category-card {
  @apply transition-all duration-300;
}

.category-card:hover {
  transform: translateY(-1px);
}

.category-card:hover img {
  transform: scale(1.03);
}

.category-card img {
  @apply transition-transform duration-500;
}

/* Tipografi */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Animasyonlar */
.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Responsive */
@media (max-width: 640px) {
  .category-card {
    @apply shadow-sm;
  }
  
  .category-card:hover {
    transform: none;
  }
}
</style>