<!-- components/shared/CategoryList.vue -->
<template>
  <div class="w-full">
    <!-- Kategori Listesi -->
    <div class="divide-y divide-gray-100">
      <div v-for="category in processedCategories"
           :key="category._id"
           class="relative group">
        <!-- Ana Kategori Butonu -->
        <button @click="handleCategoryClick(category)"
                class="w-full flex items-center justify-between px-4 py-3 transition-all duration-200 hover:bg-gray-50"
                :class="{
                  'bg-emerald-50': openCategories.includes(category._id),
                  'text-emerald-600 font-medium': isActiveCategory(category.slug),
                }">
          <div class="flex items-center gap-2.5">
            <Icon :icon="getCategoryIcon(category.name)"
                  class="w-5 h-5 text-gray-400 group-hover:text-emerald-500 transition-colors"
                  :class="{ 'text-emerald-500': isActiveCategory(category.slug) }" />
            <span class="text-sm text-gray-700 group-hover:text-gray-900 transition-colors truncate max-w-[150px]">
              {{ category.name }}
            </span>
          </div>
          <div class="flex items-center"
               :class="{ 'gap-2': category.children?.length }">
            <span class="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors"
                  :class="{ 'mr-2': !category.children?.length }">
              {{ category.totalProductCount }}
            </span>
            <Icon v-if="category.children?.length"
                  :icon="openCategories.includes(category._id) ? 'heroicons:chevron-up' : 'heroicons:chevron-right'"
                  class="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-all duration-200"
                  :class="{ 'rotate-90': openCategories.includes(category._id) }" />
          </div>
        </button>

        <!-- Alt Kategoriler -->
        <Transition
          enter="transition-all duration-200 ease-out"
          enter-from="transform -translate-y-1 opacity-0"
          enter-to="transform translate-y-0 opacity-100"
          leave="transition-all duration-150 ease-in"
          leave-from="transform translate-y-0 opacity-100"
          leave-to="transform -translate-y-1 opacity-0"
        >
          <div v-if="openCategories.includes(category._id) && category.children"
               class="bg-gray-50">
            <div v-for="subCategory in category.children"
                 :key="subCategory._id"
                 class="relative group">
              <!-- Alt Kategori Butonu -->
              <button @click="handleCategoryClick(subCategory)"
                      class="w-full flex items-center justify-between px-4 py-2.5 pl-10 transition-all duration-200 hover:bg-gray-100"
                      :class="{
                        'bg-emerald-50': openSubCategories.includes(subCategory._id),
                        'text-emerald-600 font-medium': isActiveCategory(subCategory.slug),
                      }">
                <span class="text-sm text-gray-600 group-hover:text-gray-900 transition-colors truncate max-w-[150px]">
                  {{ subCategory.name }}
                </span>
                <div class="flex items-center gap-2 flex-shrink-0">
                  <span class="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                    {{ subCategory.totalProductCount }}
                  </span>
                  <Icon v-if="subCategory.children?.length"
                        :icon="openSubCategories.includes(subCategory._id) ? 'heroicons:chevron-up' : 'heroicons:chevron-right'"
                        class="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-all duration-200"
                        :class="{ 'rotate-90': openSubCategories.includes(subCategory._id) }" />
                </div>
              </button>

              <!-- 3. Seviye Kategoriler -->
              <Transition
                enter="transition-all duration-200 ease-out"
                enter-from="transform -translate-y-1 opacity-0"
                enter-to="transform translate-y-0 opacity-100"
                leave="transition-all duration-150 ease-in"
                leave-from="transform translate-y-0 opacity-100"
                leave-to="transform -translate-y-1 opacity-0"
              >
                <div v-if="openSubCategories.includes(subCategory._id) && subCategory.children"
                     class="bg-gray-100">
                  <button v-for="childCategory in subCategory.children"
                          :key="childCategory._id"
                          @click="handleCategoryClick(childCategory)"
                          class="w-full flex items-center justify-between px-4 py-2.5 pl-12 transition-all duration-200 hover:bg-gray-200 group"
                          :class="{
                            'text-emerald-600 font-medium': isActiveCategory(childCategory.slug),
                          }">
                    <span class="text-sm text-gray-600 group-hover:text-gray-900 transition-colors truncate max-w-[150px]">
                      {{ childCategory.name }}
                    </span>
                    <span class="text-xs px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-500 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors flex-shrink-0">
                      {{ childCategory.totalProductCount }}
                    </span>
                  </button>
                </div>
              </Transition>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useCategoryStore } from "@/stores/categoryStore.js";
import { Transition } from '@vue/runtime-dom';
import { Icon } from '@iconify/vue';

const route = useRoute();
const router = useRouter();
const categoryStore = useCategoryStore();
const openCategories = ref([]);
const openSubCategories = ref([]);

// Kategorileri işleyip hierarchical yapıya dönüştüren computed property
const processedCategories = computed(() => {
  return categoryStore.categoryTree.map(category => ({
    ...category,
    totalProductCount: calculateTotalProducts(category)
  }));
});

// Toplam ürün sayısını hesaplayan yardımcı fonksiyon
const calculateTotalProducts = (category) => {
  let total = category.productCount || 0
  if (category.children) {
    category.children.forEach(child => {
      total += calculateTotalProducts(child)
    })
  }
  return total
}

// Kategori ikonlarını belirleyen yardımcı fonksiyon
const getCategoryIcon = (categoryName) => {
  const iconMap = {
    Gübreler: "game-icons:fertilizer-bag",
    "Tarım Aletleri": "material-symbols:agriculture",
    Tohumlar: "game-icons:seed",
    Fide: "mdi:sprout",
  };
  return iconMap[categoryName] || "heroicons:folder";
};

// Parent kategoriyi bulan yardımcı fonksiyon
const findParentCategory = (categorySlug) => {
  const findInCategories = (categories) => {
    for (const cat of categories) {
      if (cat.children) {
        for (const child of cat.children) {
          if (child.slug === categorySlug) return cat;
          const found = findInCategories([child]);
          if (found) return found;
        }
      }
    }
    return null;
  };

  return findInCategories(categoryStore.categoryTree);
};

// Kategori path'ini oluşturan yardımcı fonksiyon
const buildCategoryPath = (category) => {
  const path = [];
  let currentCategory = category;
  path.unshift(currentCategory.slug);

  while (true) {
    const parent = findParentCategory(currentCategory.slug);
    if (!parent) break;
    path.unshift(parent.slug);
    currentCategory = parent;
  }

  return path;
};

// Aktif kategoriyi kontrol eden fonksiyon
const isActiveCategory = (slug) => {
  if (!route.params.path) return false;
  const pathArray = Array.isArray(route.params.path)
    ? route.params.path
    : [route.params.path];
  return pathArray.includes(slug);
};

// Alt kategori bulma yardımcı fonksiyonu
const findCategoryBySlug = (slug, categories = categoryStore.categoryTree) => {
  for (const category of categories) {
    if (category.slug === slug) return category;
    if (category.children?.length) {
      const found = findCategoryBySlug(slug, category.children);
      if (found) return found;
    }
  }
  return null;
};

// Kategori tıklama işleyicisi
const handleCategoryClick = async (category) => {
  // Alt kategorileri toggle
  if (category.children?.length > 0) {
    if (category.level === 0) {
      const index = openCategories.value.indexOf(category._id);
      if (index === -1) {
        openCategories.value.push(category._id);
      } else {
        openCategories.value.splice(index, 1);
        // Alt kategorileri kapat
        openSubCategories.value = openSubCategories.value.filter((id) => {
          const subCategory = findSubCategory(category, id);
          return !subCategory;
        });
      }
    } else {
      const index = openSubCategories.value.indexOf(category._id);
      if (index === -1) {
        openSubCategories.value.push(category._id);
      } else {
        openSubCategories.value.splice(index, 1);
      }
    }
  }

  // Kategori yolunu oluştur ve yönlendir
  const categoryPath = buildCategoryPath(category);
  await router.push({
    name: "category-detail",
    params: { path: categoryPath },
  });
};

// Yardımcı fonksiyon: Alt kategori bulma
const findSubCategory = (parentCategory, subCategoryId) => {
  if (!parentCategory.children) return null;
  for (const sub of parentCategory.children) {
    if (sub._id === subCategoryId) return sub;
    const found = findSubCategory(sub, subCategoryId);
    if (found) return found;
  }
  return null;
};

// Aktif kategoriyi route'a göre otomatik aç
const openActiveCategory = async () => {
  if (!route.params.path) return;

  const pathArray = Array.isArray(route.params.path)
    ? route.params.path
    : [route.params.path];

  for (const slug of pathArray) {
    const category = findCategoryBySlug(slug);
    if (category) {
      if (category.parent) {
        openCategories.value.push(category.parent);
      }
      if (category.children?.length) {
        openCategories.value.push(category._id);
      }
    }
  }
};

// Kategori verilerini yenileme
const refreshCategoryData = async (forceUpdate = false) => {
  try {
    if (forceUpdate) {
      await categoryStore.fetchCategoryTree();
    }
    await openActiveCategory();
  } catch (error) {
    console.error("Kategori verileri güncellenirken hata oluştu:", error);
  }
};

// Route değişimini izle
watch(
  () => route.params.path,
  async () => {
    await refreshCategoryData(false);
  },
  { immediate: true }
);

// Component mount olduğunda
onMounted(async () => {
  try {
    await refreshCategoryData(true); // İlk yüklemede force update
    categoryStore.initializeSocketListeners();
  } catch (error) {
    console.error("Kategoriler yüklenirken hata oluştu:", error);
  }
});

// Socket event handler'ları
const handleCategoryUpdate = async () => {
  await refreshCategoryData(true); // Socket güncellemelerinde force update
};

// Socket dinleyicilerini ekle
watch(
  () => categoryStore.socketListeners,
  (newListeners) => {
    if (newListeners) {
      Object.entries(newListeners).forEach(([event]) => {
        categoryStore.socketListeners[event] = handleCategoryUpdate;
      });
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.list-leave-active {
  position: absolute;
}
</style>