<!-- components/shared/CategoryList.vue -->
<template>
  <div class="w-full">
    <!-- Kategori Listesi -->
    <div class="divide-y divide-gray-100/70">
      <div
        v-for="category in processedCategories"
        :key="category._id"
        class="relative group"
      >
        <!-- Ana Kategori Butonu -->
        <button
          @click="handleCategoryClick(category)"
          class="w-full flex items-center justify-between px-5 py-3.5 transition-all duration-300 ease-out hover:bg-gradient-to-r hover:from-gray-50/90 hover:to-gray-50/70 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          :class="{
            'bg-emerald-50/90 hover:bg-emerald-50/95': openCategories.includes(
              category._id
            ),
            'text-emerald-600 font-medium border-l-4 border-emerald-500 pl-4':
              isActiveCategory(category.slug),
          }"
        >
          <span
            class="text-sm text-gray-700 group-hover:text-gray-900 transition-colors duration-300 truncate max-w-[200px] font-medium"
          >
            {{ category.name }}
          </span>
          <span
            v-if="category.children?.length"
            class="text-xs px-2 py-1 rounded-full bg-gray-100/90 text-gray-500 group-hover:bg-emerald-100/90 group-hover:text-emerald-600 transition-all duration-300 ease-out shadow-sm"
          >
            {{ category.totalSubCategories }}
          </span>
        </button>

        <!-- Alt Kategoriler -->
        <Transition
          enter="transition-all duration-300 ease-out"
          enter-from="transform -translate-y-2 opacity-0"
          enter-to="transform translate-y-0 opacity-100"
          leave="transition-all duration-200 ease-in"
          leave-from="transform translate-y-0 opacity-100"
          leave-to="transform -translate-y-2 opacity-0"
        >
          <div
            v-if="openCategories.includes(category._id) && category.children"
            class="bg-gradient-to-r from-gray-50/80 to-transparent"
          >
            <div
              v-for="subCategory in category.children.filter(sub => sub.isActive)"
              :key="subCategory._id"
              class="relative group/sub"
            >
              <!-- Alt Kategori Butonu -->
              <button
                @click="handleCategoryClick(subCategory)"
                class="w-full flex items-center justify-between px-5 py-3 pl-10 transition-all duration-300 ease-out hover:bg-gradient-to-r hover:from-gray-100/90 hover:to-gray-50/70"
                :class="{
                  'bg-emerald-50/90 hover:bg-emerald-50/95':
                    openSubCategories.includes(subCategory._id),
                  'text-emerald-600 font-medium border-l-4 border-emerald-500':
                    isActiveCategory(subCategory.slug),
                }"
              >
                <span
                  class="text-sm text-gray-600 group-hover/sub:text-gray-900 transition-colors duration-300 truncate max-w-[180px]"
                >
                  {{ subCategory.name }}
                </span>
                <span
                  v-if="subCategory.children?.length"
                  class="text-xs px-2 py-1 rounded-full bg-gray-100/90 text-gray-500 group-hover/sub:bg-emerald-100/90 group-hover/sub:text-emerald-600 transition-all duration-300 ease-out shadow-sm"
                >
                  {{ subCategory.children.length }}
                </span>
              </button>

              <!-- 3. Seviye Kategoriler -->
              <div
                v-if="
                  openSubCategories.includes(subCategory._id) &&
                  subCategory.children
                "
                class="bg-gradient-to-r from-gray-100/90 to-transparent"
              >
                <button
                  v-for="childCategory in subCategory.children.filter(child => child.isActive)"
                  :key="childCategory._id"
                  @click="handleCategoryClick(childCategory)"
                  class="w-full flex items-center justify-between px-5 py-2.5 pl-12 transition-all duration-300 ease-out hover:bg-gradient-to-r hover:from-gray-200/90 hover:to-gray-100/70 group/child"
                  :class="{
                    'text-emerald-600 font-medium border-l-4 border-emerald-500':
                      isActiveCategory(childCategory.slug),
                  }"
                >
                  <span
                    class="text-sm text-gray-600 group-hover/child:text-gray-900 transition-colors duration-300 truncate max-w-[160px]"
                  >
                    {{ childCategory.name }}
                  </span>
                  <span
                    v-if="childCategory.children?.length"
                    class="text-xs px-2 py-1 rounded-full bg-gray-200/90 text-gray-500 group-hover/child:bg-emerald-100/90 group-hover/child:text-emerald-600 transition-all duration-300 ease-out shadow-sm"
                  >
                    {{ childCategory.children.length }}
                  </span>
                </button>
              </div>
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
import { Transition } from "@vue/runtime-dom";
import { Icon } from "@iconify/vue";

const route = useRoute();
const router = useRouter();
const categoryStore = useCategoryStore();
const openCategories = ref([]);
const openSubCategories = ref([]);

// Kategorileri işleyip alt kategori sayılarını hesaplayan computed property
const processedCategories = computed(() => {
  // Sadece aktif olan kategorileri filtrele ve recursive bir şekilde alt kategorileri de filtrele
  const filterActiveCategories = (categories) => {
    if (!categories) return [];
    
    return categories
      .filter(cat => cat.isActive) // Sadece aktif kategorileri seç
      .map(category => ({
        ...category,
        children: filterActiveCategories(category.children), // Alt kategorileri de filtrele
        totalSubCategories: calculateSubCategories({
          ...category,
          children: filterActiveCategories(category.children)
        })
      }));
  };
  
  return filterActiveCategories(categoryStore.categoryTree);
});

// Alt kategori sayısını hesaplayan yardımcı fonksiyon
const calculateSubCategories = (category) => {
  if (!category.children) return 0;
  
  // Sadece aktif olan alt kategorileri say
  const activeChildren = category.children.filter(cat => cat.isActive);
  
  return activeChildren.length + activeChildren.reduce((sum, child) => {
    return sum + calculateSubCategories(child);
  }, 0);
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

// Sayı formatlama yardımcı fonksiyonu
const formatCount = (count) => {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count;
};
</script>

<style scoped>
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.list-leave-active {
  position: absolute;
}
</style>
