<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Mega Header -->
    <div class="bg-gradient-to-r from-green-700 to-green-500 text-white relative overflow-hidden">
      <div class="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
      <div class="max-w-7xl mx-auto py-16 px-4 relative">
        <h1 class="text-5xl font-bold mb-4">
          {{ currentCategory?.name || "Kategoriler" }}
        </h1>
        <p class="text-xl opacity-90 max-w-2xl">
          Profesyonel üreticiler için özenle seçilmiş, yüksek kaliteli
          {{ currentCategory?.name?.toLowerCase() || "ürünler" }}
        </p>
        <!-- Breadcrumb -->
        <div class="flex items-center gap-2 mt-6 text-sm">
          <router-link to="/" class="hover:text-white/80"
            >Ana Sayfa</router-link
          >
          <ChevronRight class="w-4 h-4" />
          <template v-if="categoryPath && categoryPath.length">
            <div v-for="(category, index) in categoryPath" :key="category.slug">
              <router-link
                :to="`/category/${categoryPath
                  .slice(0, index + 1)
                  .map((c) => c.slug)
                  .join('/')}`"
                class="hover:text-white/80"
              >
                {{ category.name }}
              </router-link>
              <ChevronRight
                v-if="index < categoryPath.length - 1"
                class="w-4 h-4"
              />
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Alt kategori varsa kategori listesi, yoksa ürün listesi göster -->
    <template v-if="hasSubCategories">
      <!-- Kontrol Paneli -->
      <div class="sticky top-0 bg-white border-b z-10 backdrop-blur-sm bg-white/90">
        <div class="max-w-7xl mx-auto px-4 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <span class="text-gray-500">
                Toplam {{ totalProducts }} alt kategori
              </span>
            </div>

            <div class="flex items-center gap-3">
              <div class="relative">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Kategori ara..."
                  class="w-64 pl-10 pr-4 py-2 rounded-full border focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  @input="filterCategories"
                />
                <Search class="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Ana İçerik - Kategoriler -->
      <div class="max-w-7xl mx-auto px-4 py-8">
        <div class="space-y-8">
          <div v-for="orderGroup in groupedCategories" :key="orderGroup.order" 
               class="category-group">
            <div class="space-y-6">
              <h3 class="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <component :is="getCategoryIcon(orderGroup.order)" class="w-5 h-5 text-green-600" />
                {{ getOrderGroupTitle(orderGroup.order) }}
              </h3>

              <div class="grid grid-cols-1 gap-6">
                <div v-for="category in orderGroup.categories" 
                     :key="category._id"
                     class="category-card bg-white rounded-2xl overflow-hidden flex group">
                  <!-- Resim Alanı -->
                  <div class="relative w-1/3 overflow-hidden">
                    <img :src="category.image || '/api/placeholder/400/300'"
                         :alt="category.name"
                         class="category-image w-full h-full object-cover" />
                    <div class="gradient-overlay"></div>
                    <div class="absolute bottom-4 left-4 flex gap-2">
                      <span class="px-3 py-1 bg-white/90 rounded-full text-sm font-medium">
                        {{ getCategoryLevel(category.level) }}
                      </span>
                    </div>
                  </div>

                  <!-- İçerik Alanı -->
                  <div class="p-6 w-2/3">
                    <div class="flex items-center justify-between mb-4">
                      <h2 class="text-2xl font-bold">{{ category.name }}</h2>
                      <span class="text-green-600 font-medium">
                        {{ category.productCount || 0 }} Ürün
                      </span>
                    </div>

                    <div class="flex flex-wrap gap-2 mb-6">
                      <span
                        v-for="feature in getCategoryFeatures(category)"
                        :key="feature"
                        class="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm"
                      >
                        {{ feature }}
                      </span>
                    </div>

                    <div v-if="category.children?.length" 
                         class="space-y-3 mb-6 custom-scrollbar max-h-48 overflow-y-auto">
                      <div v-for="child in category.children"
                           :key="child._id"
                           class="flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg cursor-pointer group"
                           @click="navigateToCategory(child)">
                        <span class="text-gray-700 flex items-center gap-2">
                          <component :is="getCategoryTypeIcon(child)" 
                                   class="w-4 h-4 text-gray-400" />
                          {{ child.name }}
                        </span>
                        <div class="flex items-center gap-2">
                          <span class="text-sm text-gray-500">
                            {{ child.productCount || 0 }} ürün
                          </span>
                          <ArrowRight class="w-4 h-4 text-green-600 opacity-0 group-hover:opacity-100 
                                           transition-opacity transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </div>

                    <!-- İnceleme Butonu -->
                    <button @click="navigateToCategory(category)"
                            class="w-full bg-green-600 text-white py-3 rounded-xl 
                                   hover:bg-green-700 transition-all duration-300 
                                   transform hover:scale-[1.02] flex items-center 
                                   justify-center gap-2 group">
                      <span>Tüm Ürünleri İncele</span>
                      <ChevronRight class="w-4.5 h-4.5 transform group-hover:translate-x-1 
                                         transition-transform" />
                    </button>
                  </div>
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
  Folder
} from "lucide-vue-next";
import CategoryProduct from "@/views/user/CategoryProducts.vue";

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

  // Order'a göre grupla
  const grouped = filteredCategories.reduce((acc, category) => {
    const orderGroup = acc.find((group) => group.order === category.order);
    if (orderGroup) {
      orderGroup.categories.push(category);
    } else {
      acc.push({
        order: category.order,
        categories: [category],
      });
    }
    return acc;
  }, []);

  return grouped
    .map((group) => ({

      ...group,
      categories: group.categories.sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => a.order - b.order);
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
/* Kart Animasyonları */
.category-card {
  @apply transition-all duration-300 hover:shadow-xl;
}

.category-card:hover .category-image {
  @apply scale-105;
}

.category-card .category-image {
  @apply transition-transform duration-300;
}

/* Loading Skeleton */
.skeleton {
  @apply animate-pulse bg-gray-200;
}

/* Özel Scrollbar */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #22c55e #e5e7eb;
}

.custom-scrollbar::-webkit-scrollbar {
  @apply w-2;
}

.custom-scrollbar::-webkit-scrollbar-track {
  @apply bg-gray-200 rounded-full;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  @apply bg-green-500 rounded-full hover:bg-green-600;
}

/* Fade Animasyonları */
.fade-enter-active,
.fade-leave-active {
  @apply transition-opacity duration-300;
}

.fade-enter-from,
.fade-leave-to {
  @apply opacity-0;
}

/* Tooltip */
.tooltip {
  @apply invisible absolute;
}

.has-tooltip:hover .tooltip {
  @apply visible z-50;
}

/* Badge */
.badge {
  @apply absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full;
}

/* Gradient Overlay */
.gradient-overlay {
  @apply absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent;
}
</style>