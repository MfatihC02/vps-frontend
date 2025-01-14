<template>
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6">
      <h1 class="text-xl sm:text-2xl font-bold flex items-center gap-2 font-montserrat">
        <FolderTree class="h-5 sm:h-6 w-5 sm:w-6" />
        Kategori Yönetimi
      </h1>
      <button
        @click="() => { showForm = true; resetForm(); }"
        class="w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded-lg flex items-center justify-center sm:justify-start gap-2 hover:bg-green-700 transition-colors duration-200 font-inter text-sm sm:text-base"
      >
        <FolderPlus class="h-4 sm:h-5 w-4 sm:w-5" />
        Yeni Kategori
      </button>
    </div>

    <!-- Error Alert -->
    <div
      v-if="error"
      class="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 sm:p-4 mb-4 rounded-r-lg"
    >
      <div class="flex items-center">
        <AlertCircle class="h-5 w-5 mr-2 flex-shrink-0" />
        <p class="text-sm sm:text-base font-inter">{{ error }}</p>
      </div>
    </div>

    <!-- Category List -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <!-- Desktop Table View -->
      <div class="hidden sm:block overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-montserrat">
                <div class="flex items-center gap-2">
                  <span>Kategori</span>
                  <ArrowUpDown class="h-4 w-4" />
                </div>
              </th>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-montserrat">
                Durum
              </th>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-montserrat">
                Alt Kategori
              </th>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-montserrat">
                Ürün Sayısı
              </th>
              <th class="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider font-montserrat">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="category in flattenedCategories" :key="category._id" class="hover:bg-gray-50 transition-colors duration-150">
              <td class="px-4 sm:px-6 py-4">
                <div class="flex items-center">
                  <div :style="{ marginLeft: `${category.depth * 20}px` }" class="flex items-center">
                    <ChevronRight v-if="category.depth > 0" class="h-4 w-4 text-gray-400 mr-2" />
                    <img
                      v-if="category.image"
                      :src="category.image"
                      class="h-8 w-8 rounded-full object-cover mr-3"
                      :alt="category.name"
                    />
                    <div v-else class="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                      <ImageIcon class="h-4 w-4 text-gray-400" />
                    </div>
                    <div>
                      <div class="text-sm font-medium text-gray-900 font-inter">{{ category.name }}</div>
                      <div class="text-xs text-gray-500 font-inter">{{ category.description }}</div>
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-4 sm:px-6 py-4">
                <span
                  :class="[
                    'px-2 inline-flex text-xs leading-5 font-semibold rounded-full font-inter',
                    category.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  ]"
                >
                  {{ category.isActive ? "Aktif" : "Pasif" }}
                </span>
              </td>
              <td class="px-4 sm:px-6 py-4 text-sm text-gray-500 font-inter">
                {{ category.subCategoryCount }}
              </td>
              <td class="px-4 sm:px-6 py-4 text-sm text-gray-500 font-inter">
                {{ category.productCount }}
              </td>
              <td class="px-4 sm:px-6 py-4 text-right">
                <div class="flex justify-end gap-2">
                  <button
                    @click="openEditForm(category)"
                    class="text-primary hover:text-primary-dark transition-colors duration-200"
                  >
                    <Edit class="h-5 w-5" />
                  </button>
                  <button
                    @click="handleDelete(category._id)"
                    class="text-red-600 hover:text-red-700 transition-colors duration-200"
                  >
                    <Trash2 class="h-5 w-5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Card View -->
      <div class="block sm:hidden divide-y divide-gray-200">
        <div v-for="category in flattenedCategories" :key="category._id" class="p-4 hover:bg-gray-50 transition-colors duration-150">
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-start space-x-3">
              <img
                v-if="category.image"
                :src="category.image"
                class="h-10 w-10 rounded-full object-cover flex-shrink-0"
                :alt="category.name"
              />
              <div v-else class="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <ImageIcon class="h-5 w-5 text-gray-400" />
              </div>
              <div>
                <div class="flex items-center">
                  <ChevronRight v-if="category.depth > 0" class="h-4 w-4 text-gray-400 mr-1" />
                  <span class="text-sm font-medium text-gray-900 font-inter">{{ category.name }}</span>
                </div>
                <p class="text-xs text-gray-500 mt-0.5 font-inter">{{ category.description }}</p>
              </div>
            </div>
            <span
              :class="[
                'px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full font-inter',
                category.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              ]"
            >
              {{ category.isActive ? "Aktif" : "Pasif" }}
            </span>
          </div>

          <div class="grid grid-cols-2 gap-4 mb-3 text-sm font-inter">
            <div>
              <span class="text-gray-500">Alt Kategori:</span>
              <span class="font-medium text-gray-900 ml-1">{{ category.subCategoryCount }}</span>
            </div>
            <div>
              <span class="text-gray-500">Ürün Sayısı:</span>
              <span class="font-medium text-gray-900 ml-1">{{ category.productCount }}</span>
            </div>
          </div>

          <div class="flex justify-end gap-3">
            <button
              @click="openEditForm(category)"
              class="flex items-center text-primary hover:text-primary-dark transition-colors duration-200 text-sm font-medium font-inter"
            >
              <Edit class="h-4 w-4 mr-1" />
              Düzenle
            </button>
            <button
              @click="handleDelete(category._id)"
              class="flex items-center text-red-600 hover:text-red-700 transition-colors duration-200 text-sm font-medium font-inter"
            >
              <Trash2 class="h-4 w-4 mr-1" />
              Sil
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Category Form Modal -->
    <div
      v-if="showForm"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    >
      <div
        class="relative mx-auto p-4 sm:p-5 border w-11/12 sm:w-full max-w-2xl shadow-lg rounded-md bg-white my-8 sm:my-16"
      >
        <div class="flex justify-between items-center pb-3">
          <h3 class="text-lg sm:text-xl font-semibold font-montserrat">
            {{ editMode ? "Kategori Düzenle" : "Yeni Kategori" }}
          </h3>
          <button
            @click="showForm = false"
            class="text-gray-400 hover:text-gray-500 transition-colors duration-200"
          >
            <X class="h-5 sm:h-6 w-5 sm:w-6" />
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4 sm:space-y-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div class="col-span-1 sm:col-span-2">
              <label class="block text-sm font-medium text-gray-700 font-inter mb-1"
                >Kategori Adı</label
              >
              <input
                v-model="form.name"
                type="text"
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm sm:text-base"
                required
              />
            </div>

            <div class="col-span-1 sm:col-span-2">
              <label class="block text-sm font-medium text-gray-700 font-inter mb-1"
                >Açıklama</label
              >
              <textarea
                v-model="form.description"
                rows="3"
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm sm:text-base"
              ></textarea>
            </div>

            <div class="col-span-1">
              <label class="block text-sm font-medium text-gray-700 font-inter mb-1"
                >Üst Kategori</label
              >
              <select
                v-model="form.parent"
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm sm:text-base"
              >
                <option :value="null">Ana Kategori</option>
                <option
                  v-for="category in flattenedCategories"
                  :key="category._id"
                  :value="category._id"
                  class="text-sm sm:text-base"
                >
                  {{ "─".repeat(category.depth) }} {{ category.name }}
                </option>
              </select>
            </div>

            <div class="col-span-1">
              <label class="block text-sm font-medium text-gray-700 font-inter mb-1"
                >Sıralama</label
              >
              <input
                v-model.number="form.order"
                type="number"
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm sm:text-base"
              />
            </div>

            <div class="col-span-1 sm:col-span-2">
              <label class="block text-sm font-medium text-gray-700 font-inter mb-1"
                >Görsel</label
              >
              <div class="mt-1 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div v-if="imagePreview" class="relative">
                  <img
                    :src="imagePreview"
                    class="h-24 sm:h-32 w-24 sm:w-32 object-cover rounded-lg"
                  />
                  <button
                    @click="() => { imagePreview = null; form.image = null; }"
                    class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors duration-200"
                  >
                    <X class="h-4 w-4" />
                  </button>
                </div>
                <input
                  type="file"
                  @change="handleImageChange"
                  accept="image/*"
                  class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-colors duration-200"
                />
              </div>
            </div>

            <div class="col-span-1 sm:col-span-2 space-y-3">
              <div class="flex items-center">
                <input
                  v-model="form.isActive"
                  type="checkbox"
                  class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label class="ml-2 block text-sm text-gray-900 font-inter">Aktif</label>
              </div>

              <div class="flex items-center">
                <input
                  v-model="form.seasonalProducts"
                  type="checkbox"
                  class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label class="ml-2 block text-sm text-gray-900 font-inter"
                  >Mevsimlik Ürünler</label
                >
              </div>
            </div>

            <!-- SEO Metadata -->
            <div class="col-span-1 sm:col-span-2 border-t pt-4">
              <h4 class="font-medium text-gray-900 mb-4 text-base sm:text-lg font-montserrat">SEO Bilgileri</h4>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 font-inter mb-1"
                    >Meta Başlık</label
                  >
                  <input
                    v-model="form.metadata.title"
                    type="text"
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 font-inter mb-1"
                    >Meta Açıklama</label
                  >
                  <textarea
                    v-model="form.metadata.description"
                    rows="2"
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm sm:text-base"
                  ></textarea>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 font-inter mb-1"
                    >Anahtar Kelimeler</label
                  >
                  <div class="mt-1">
                    <input
                      v-model="form.metadata.keywords"
                      type="text"
                      placeholder="Virgülle ayırarak yazın"
                      class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm sm:text-base"
                      @input="(e) => { form.metadata.keywords = e.target.value.split(',').map((k) => k.trim()); }"
                    />
                    <div class="mt-2 flex flex-wrap gap-2">
                      <span
                        v-for="(keyword, index) in form.metadata.keywords"
                        :key="index"
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                      >
                        {{ keyword }}
                        <button
                          type="button"
                          @click="form.metadata.keywords.splice(index, 1)"
                          class="ml-1 inline-flex items-center p-0.5 text-indigo-400 hover:text-indigo-600 transition-colors duration-200"
                        >
                          <X class="h-3 w-3" />
                        </button>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="col-span-1 sm:col-span-2 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 border-t pt-4">
              <button
                type="button"
                @click="showForm = false"
                class="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                İptal
              </button>
              <button
                type="submit"
                :disabled="loading"
                class="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors duration-200"
              >
                <template v-if="loading">
                  <svg
                    class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Kaydediliyor...
                </template>
                <template v-else>
                  <Check class="h-5 w-5 mr-2" />
                  {{ editMode ? "Güncelle" : "Kaydet" }}
                </template>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import { useCategoryStore } from "@/stores/categoryStore.js";
import {
  FolderPlus,
  Edit,
  Trash2,
  ArrowUpDown,
  Plus,
  Image as ImageIcon,
  AlertCircle,
  ChevronRight,
  Check,
  X,
  FolderTree,
} from "lucide-vue-next";

import { storeToRefs } from "pinia";

export default {
  components: {
    FolderPlus,
    Edit,
    Trash2,
    ArrowUpDown,
    Plus,
    ImageIcon,
    AlertCircle,
    ChevronRight,
    Check,
    X,
    FolderTree,
  },

  setup() {
    const categoryStore = useCategoryStore();
    const { categories, categoryTree, loading, error } = storeToRefs(categoryStore);

    // Form states
    const showForm = ref(false);
    const editMode = ref(false);
    const selectedCategory = ref(null);
    const imagePreview = ref(null);

    const form = ref({
      name: "",
      description: "",
      parent: null,
      isActive: true,
      order: 0,
      seasonalProducts: false,
      icon: "",
      image: null,
      metadata: {
        title: "",
        description: "",
        keywords: [],
      },
    });

    // Computed properties
    const flattenedCategories = computed(() => {
      const flatten = (items, depth = 0) => {
        return items.reduce((flat, item) => {
          const { children, ...flatItem } = item;
          return [
            ...flat,
            { ...flatItem, depth },
            ...(children ? flatten(children, depth + 1) : []),
          ];
        }, []);
      };
      return flatten(categoryTree.value || []);
    });

    // Methods
    const resetForm = () => {
      form.value = {
        name: "",
        description: "",
        parent: null,
        isActive: true,
        order: 0,
        seasonalProducts: false,
        icon: "",
        image: null,
        metadata: {
          title: "",
          description: "",
          keywords: [],
        },
      };
      imagePreview.value = null;
      editMode.value = false;
      selectedCategory.value = null;
    };

    const handleImageChange = (event) => {
      const file = event.target.files[0];
      if (file) {
        form.value.image = file;
        imagePreview.value = URL.createObjectURL(file);
      }
    };

    const openEditForm = (category) => {
      selectedCategory.value = category;
      // API'den gelen parent değerini direkt kullanıyoruz
      form.value = {
        ...category,
        // Eğer parent bir string (ID) ise onu kullan, değilse null
        parent: typeof category.parent === 'string' ? category.parent : null,
        metadata: {
          ...category.metadata,
          keywords: category.metadata?.keywords || [],
        },
      };
      imagePreview.value = category.image;
      editMode.value = true;
      showForm.value = true;
    };

    const handleSubmit = async () => {
      try {
        if (editMode.value) {
          await categoryStore.updateCategory(
            selectedCategory.value._id,
            form.value
          );
        } else {
          await categoryStore.createCategory(form.value);
        }
        showForm.value = false;
        resetForm();
        await categoryStore.fetchCategoryTree();
      } catch (err) {
        console.error("Error submitting form:", err);
      }
    };

    const handleDelete = async (categoryId) => {
      if (confirm("Bu kategoriyi silmek istediğinizden emin misiniz?")) {
        try {
          await categoryStore.deleteCategory(categoryId);
          await categoryStore.fetchCategoryTree();
        } catch (err) {
          console.error("Error deleting category:", err);
        }
      }
    };

    onMounted(async () => {
      await categoryStore.fetchCategoryTree();
      categoryStore.initializeSocketListeners();
    });

    return {
      showForm,
      editMode,
      form,
      imagePreview,
      flattenedCategories,
      handleImageChange,
      handleSubmit,
      handleDelete,
      openEditForm,
      resetForm,
      loading,
      error,
    };
  },
};
</script>
