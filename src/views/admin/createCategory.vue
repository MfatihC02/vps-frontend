<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold flex items-center gap-2">
        <FolderTree class="h-6 w-6" />
        Kategori Yönetimi
      </h1>
      <button
        @click="
          () => {
            showForm = true;
            resetForm();
          }
        "
        class="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
      >
        <FolderPlus class="h-5 w-5" />
        Yeni Kategori
      </button>
    </div>

    <!-- Error Alert -->
    <div
      v-if="error"
      class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4"
    >
      <div class="flex items-center">
        <AlertCircle class="h-5 w-5 mr-2" />
        <p>{{ error }}</p>
      </div>
    </div>

    <!-- Category List -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                <div class="flex items-center gap-2">
                  <span>Kategori</span>
                  <ArrowUpDown class="h-4 w-4" />
                </div>
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Durum
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Alt Kategori
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Ürün Sayısı
              </th>
              <th
                class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="category in flattenedCategories" :key="category._id">
              <td class="px-6 py-4">
                <div class="flex items-center">
                  <div
                    :style="{ marginLeft: `${category.depth * 20}px` }"
                    class="flex items-center"
                  >
                    <ChevronRight
                      v-if="category.depth > 0"
                      class="h-4 w-4 text-gray-400 mr-2"
                    />
                    <img
                      v-if="category.image"
                      :src="category.image"
                      class="h-8 w-8 rounded-full object-cover mr-3"
                    />
                    <div
                      v-else
                      class="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-3"
                    >
                      <ImageIcon class="h-4 w-4 text-gray-400" />
                    </div>
                    <div>
                      <div class="text-sm font-medium text-gray-900">
                        {{ category.name }}
                      </div>
                      <div class="text-sm text-gray-500">
                        {{ category.description }}
                      </div>
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span
                  :class="[
                    'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                    category.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800',
                  ]"
                >
                  {{ category.isActive ? "Aktif" : "Pasif" }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">
                {{ category.subCategoryCount }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">
                {{ category.productCount }}
              </td>
              <td class="px-6 py-4 text-right text-sm font-medium">
                <div class="flex justify-end gap-2">
                  <button
                    @click="openEditForm(category)"
                    class="text-indigo-600 hover:text-indigo-900"
                  >
                    <Edit class="h-5 w-5" />
                  </button>
                  <button
                    @click="handleDelete(category._id)"
                    class="text-red-600 hover:text-red-900"
                  >
                    <Trash2 class="h-5 w-5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Category Form Modal -->
    <div
      v-if="showForm"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full"
    >
      <div
        class="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white"
      >
        <div class="flex justify-between items-center pb-3">
          <h3 class="text-xl font-semibold">
            {{ editMode ? "Kategori Düzenle" : "Yeni Kategori" }}
          </h3>
          <button
            @click="showForm = false"
            class="text-gray-400 hover:text-gray-500"
          >
            <X class="h-6 w-6" />
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700"
                >Kategori Adı</label
              >
              <input
                v-model="form.name"
                type="text"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>

            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700"
                >Açıklama</label
              >
              <textarea
                v-model="form.description"
                rows="3"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              ></textarea>
            </div>

            <div class="col-span-1">
              <label class="block text-sm font-medium text-gray-700"
                >Üst Kategori</label
              >
              <select
                v-model="form.parent"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option :value="null">Ana Kategori</option>
                <option
                  v-for="category in flattenedCategories"
                  :key="category._id"
                  :value="category._id"
                >
                  {{ "─".repeat(category.depth) }} {{ category.name }}
                </option>
              </select>
            </div>

            <div class="col-span-1">
              <label class="block text-sm font-medium text-gray-700"
                >Sıralama</label
              >
              <input
                v-model.number="form.order"
                type="number"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700"
                >Görsel</label
              >
              <div class="mt-1 flex items-center">
                <div v-if="imagePreview" class="relative">
                  <img
                    :src="imagePreview"
                    class="h-32 w-32 object-cover rounded-lg"
                  />
                  <button
                    @click="
                      () => {
                        imagePreview = null;
                        form.image = null;
                      }
                    "
                    class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <X class="h-4 w-4" />
                  </button>
                </div>
                <input
                  type="file"
                  @change="handleImageChange"
                  accept="image/*"
                  class="ml-5 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>
            </div>

            <div class="col-span-2 space-y-4">
              <div class="flex items-center">
                <input
                  v-model="form.isActive"
                  type="checkbox"
                  class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label class="ml-2 block text-sm text-gray-900">Aktif</label>
              </div>

              <div class="flex items-center">
                <input
                  v-model="form.seasonalProducts"
                  type="checkbox"
                  class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label class="ml-2 block text-sm text-gray-900"
                  >Mevsimlik Ürünler</label
                >
              </div>
            </div>

            <!-- SEO Metadata -->
            <div class="col-span-2 border-t pt-4">
              <h4 class="font-medium text-gray-900 mb-4">SEO Bilgileri</h4>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700"
                    >Meta Başlık</label
                  >
                  <input
                    v-model="form.metadata.title"
                    type="text"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700"
                    >Meta Açıklama</label
                  >
                  <textarea
                    v-model="form.metadata.description"
                    rows="2"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  ></textarea>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700"
                    >Anahtar Kelimeler</label
                  >
                  <div class="mt-1">
                    <input
                      v-model="form.metadata.keywords"
                      type="text"
                      placeholder="Virgülle ayırarak yazın"
                      class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      @input="
                        (e) => {
                          form.metadata.keywords = e.target.value
                            .split(',')
                            .map((k) => k.trim());
                        }
                      "
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
                          class="ml-1 inline-flex items-center p-0.5 text-indigo-400 hover:text-indigo-600"
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
            <div class="col-span-2 flex justify-end space-x-3 border-t pt-4">
              <button
                type="button"
                @click="showForm = false"
                class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                İptal
              </button>
              <button
                type="submit"
                :disabled="loading"
                class="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
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
    const { categories, categoryTree, loading, error } =
      storeToRefs(categoryStore);

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
      form.value = {
        ...category,
        parent: category.parent?._id || null,
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
