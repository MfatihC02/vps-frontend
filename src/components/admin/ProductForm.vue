<template>
  <div class="p-6 max-w-4xl mx-auto">
    <button
      class="inline-flex items-center text-gray-600 hover:text-gray-800 mb-8"
      @click="$emit('back')"
    >
      <ArrowLeft class="w-5 h-5 mr-2" />
      Ürün Listesine Dön
    </button>

    <div class="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div class="p-6 border-b border-gray-200">
        <h2 class="text-2xl font-bold text-gray-800">
          {{ isEditing ? "Ürün Düzenle" : "Yeni Ürün Ekle" }}
        </h2>
      </div>

      <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
        <div class="grid gap-6">
          <!-- Resim Yükleme Alanı -->
          <div class="form-group">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Ürün Görseli
            </label>
            <div class="flex items-center space-x-4">
              <div
                class="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden"
              >
                <img
                  v-if="imagePreview"
                  :src="imagePreview"
                  alt="Ürün görseli"
                  class="w-full h-full object-cover"
                />
                <div v-else class="text-gray-400 text-center">
                  <span class="text-sm">Görsel Yok</span>
                </div>
              </div>
              <div class="flex flex-col space-y-2">
                <input
                  type="file"
                  ref="fileInput"
                  accept="image/*"
                  class="hidden"
                  @change="handleImageUpload"
                />
                <button
                  type="button"
                  class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  @click="$refs.fileInput.click()"
                >
                  Görsel Seç
                </button>
                <button
                  v-if="imagePreview"
                  type="button"
                  class="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                  @click="removeImage"
                >
                  Görseli Kaldır
                </button>
              </div>
            </div>
          </div>

          <!-- Kategori Seçimi -->
          <div class="form-group">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Kategori
            </label>
            <select
              v-model="formData.category"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Kategori Seçin</option>
              <option 
                v-for="category in flattenedCategories" 
                :key="category._id"
                :value="category._id"
              >
                {{ "─".repeat(category.depth) }} {{ category.name }}
              </option>
            </select>
          </div>

          <!-- Ürün Tipi -->
          <div class="form-group">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Ürün Tipi
            </label>
            <select
              v-model="formData.productType"
              :disabled="isEditing"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Tip Seçin</option>
              <option
                v-for="type in productTypes"
                :key="type.value"
                :value="type.value"
              >
                {{ type.label }}
              </option>
            </select>
          </div>

          <!-- Temel Bilgiler -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="form-group">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Ürün Adı
              </label>
              <input
                v-model="formData.name"
                type="text"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div class="form-group">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Marka
              </label>
              <input
                v-model="formData.brand"
                type="text"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          <!-- Fiyat ve Stok Bilgileri -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="form-group">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Fiyat (₺)
              </label>
              <input
                v-model.number="formData.price.current"
                type="number"
                min="0"
                step="0.01"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div class="form-group">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                İndirim (%)
              </label>
              <input
                v-model.number="formData.price.discount"
                type="number"
                min="0"
                max="100"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="form-group">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Stok Miktarı
              </label>
              <input
                v-model.number="formData.stock.quantity"
                type="number"
                min="0"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div class="form-group">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Birim
              </label>
              <select
                v-model="formData.stock.unit"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="adet">Adet</option>
                <option value="kg">Kilogram</option>
                <option value="gram">Gram</option>
              </select>
            </div>
            <div class="form-group">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Düşük Stok Uyarısı
              </label>
              <input
                v-model.number="formData.stock.lowStockAlert"
                type="number"
                min="0"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
        </div>
        <ProductDescription
  v-model="formData.description"
  ref="descriptionForm"
  class="mt-6"
/>

        <!-- Dinamik Özellikler Komponenti -->
        <component
          :is="currentSpecificationComponent"
          v-if="formData.productType && currentSpecificationComponent"
          v-model="formData.specifications"
        />

        <!-- Durum Seçimi -->
        <div class="form-group">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Durum
          </label>
          <select
            v-model="formData.status"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="draft">Taslak</option>
            <option value="active">Aktif</option>
            <option value="inactive">Pasif</option>
            <option value="outOfStock">Stok Dışı</option>
          </select>
        </div>

        <div class="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            @click="$emit('back')"
          >
            İptal
          </button>
          <button
            type="submit"
            class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            {{ isEditing ? "Güncelle" : "Kaydet" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
    
  <script setup>
import {
  ref,
  reactive,
  computed,
  onMounted,
  watch,
  defineAsyncComponent,
} from "vue";
import { ArrowLeft } from "lucide-vue-next";
import { useProductStore } from "@/stores/productStore";
import { useCategoryStore } from "@/stores/categoryStore";
import ProductDescription from './product/ProductDescription.vue';

const productStore = useProductStore();
const categoryStore = useCategoryStore();
const selectedFile = ref(null);
const descriptionForm = ref(null); // script başına eklenecek

const props = defineProps({
  product: {
    type: Object,
    required: true
  },
  isEditing: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(["back", "save", "product-updated"]);

// Resim yükleme için ref'ler
const fileInput = ref(null);
const imagePreview = ref(null);

// Form verisi
const formData = reactive({
  name: "",
  category: "",
  productType: "",
  brand: "",
  image: null,
  price: {
    current: 0,
    discount: 0,
    discountEndDate: null,
  },
  description: {
    meta: "",
    detailed: "",
    keywords: []
},

  stock: {
    quantity: 0,
    unit: "adet",
    lowStockAlert: 0,
  },
  status: "draft",
  specifications: {},
});

// Ürün verilerini forma yükle
const loadProductData = () => {
  if (props.product) {
    // Temel bilgiler
    formData.name = props.product.name || "";
    formData.brand = props.product.brand || "";
    formData.productType = props.product.productType || "";
    formData.status = props.product.status || "draft";

    // Kategori - Eğer category bir obje ise _id'sini al, değilse direkt kategori id'sini al
    formData.category = props.product.category?._id || props.product.category || "";

    // Fiyat bilgileri
    if (props.product.price) {
      formData.price = {
        current: Number(props.product.price.current) || 0,
        discount: Number(props.product.price.discount) || 0,
        discountEndDate: props.product.price.discountEndDate || null
      };
    }

    // Stok bilgileri
    if (props.product.stock) {
      formData.stock = {
        quantity: Number(props.product.stock.quantity) || 0,
        unit: props.product.stock.unit || "adet",
        lowStockAlert: Number(props.product.stock.lowStockAlert) || 0
      };
    }
// Description bilgileri
if (props.product.description) {
    formData.description = {
        meta: props.product.description.meta || '',
        detailed: props.product.description.detailed || '',
        keywords: Array.isArray(props.product.description.keywords) 
            ? [...props.product.description.keywords] 
            : []
    };
}

    // Özellikler
    if (props.product.specifications) {
      formData.specifications = { ...props.product.specifications };
    }

    // Resim
    if (props.product.images && props.product.images.length > 0) {
      imagePreview.value = props.product.images[0].url;
    }

    // Debug için konsola yazdır
    console.log('Yüklenen form verileri:', formData);
  }
};

// Watch product prop changes
watch(
  () => props.product,
  (newProduct) => {
    if (newProduct) {
      console.log('Gelen ürün verisi:', newProduct);
      loadProductData();
    }
  },
  { immediate: true, deep: true }
);

// Component yüklendiğinde
onMounted(async () => {
  try {
    // Kategori ağacını yükle
    await categoryStore.fetchCategoryTree();
    // İlk yükleme
    if (props.product) {
      console.log('Component mount edildiğinde gelen ürün:', props.product);
      loadProductData();
    }
  } catch (error) {
    console.error('Veri yükleme hatası:', error);
  }
});

// Resim işleme fonksiyonları
const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Dosya tipi kontrolü
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    console.error("Desteklenmeyen dosya formatı");
    return;
  }

  // Dosya boyutu kontrolü (5MB)
  if (file.size > 5 * 1024 * 1024) {
    console.error("Dosya boyutu 5MB'dan büyük olamaz");
    return;
  }

  selectedFile.value = file;
  formData.image = file;

  // Önizleme oluştur
  const reader = new FileReader();
  reader.onload = (e) => {
    imagePreview.value = e.target.result;
  };
  reader.onerror = (error) => {
    console.error("Dosya okuma hatası:", error);
  };
  reader.readAsDataURL(file);
};

const removeImage = () => {
  if (fileInput.value) {
    fileInput.value.value = "";
  }
  selectedFile.value = null;
  imagePreview.value = null;
  formData.image = null;
};

// Ürün tipleri
const productTypes = [
  { value: "seed", label: "Tohum" },
  { value: "seedling", label: "Fide" },
  { value: "fertilizer", label: "Gübre" },
  { value: "agriculturalTool", label: "Zirai Alet" },
];

const getInitialSpecifications = (type) => {
  switch (type) {
    case "seed":
      return {
        germinationRate: 0,
        growthPeriod: "",
        harvestTime: "",
        plantingDepth: "",
        sowingDistance: "",
        yield: "",
        season: "",
        origin: "",
        packaging: {
          weight: 0,
          unit: "",
        },
      };
    case "seedling":
      return {
        planting: {
          soil: "",
          season: "",
          spacing: "",
        },
        variety: "",
        packaging: {
          type: "",
          description: "",
        },
      };
    case "fertilizer":
      return {
        nutrientContent: {
          N: { value: 0, unit: "%" },
          P: { value: 0, unit: "%" },
          K: { value: 0, unit: "%" },
          Mg: { value: 0, unit: "%" },
          Ca: { value: 0, unit: "%" },
          S: { value: 0, unit: "%" },
        },
        applicationMethod: "",
        composition: "",
        packaging: {
          weight: 0,
          unit: "",
        },
        usage: {
          dosage: "",
          frequency: "",
          warnings: [],
        },
      };
    case "agriculturalTool":
      return {
        toolType: "",
        general: {
          brand: "",
          model: "",
          manufacturingYear: null,
          warranty: {
            duration: null,
            type: "",
          },
          origin: "",
          weight: {
            value: null,
            unit: "kg",
          },
          dimensions: {
            length: null,
            width: null,
            height: null,
            unit: "cm",
          },
        },
        technical: {
          engine: {
            type: "",
            power: {
              value: null,
              unit: "",
            },
            fuelType: "",
            fuelCapacity: null,
          },
          sprayer: {
            tankCapacity: {
              value: null,
              unit: "",
            },
            sprayDistance: {
              value: null,
              unit: "",
            },
            pressureRange: {
              min: null,
              max: null,
              unit: "",
            },
            nozzleTypes: [],
          },
          hoeMachine: {
            workingWidth: {
              value: null,
              unit: "",
            },
            workingWidth: {
              value: null,
              unit: "",
            },
            workingDepth: {
              value: null,
              unit: "",
            },
            bladeCount: null,
            gearSystem: "",
          },
        },
        maintenance: {
          spareParts: [],
          serviceInfo: {
            available: false,
            coverage: [],
            instructions: "",
          },
        },
        usage: {
          applications: [],
          safety: [],
          instructions: "",
        },
      };
    default:
      return {};
  }
};

// Kategori ağacını düzleştirme fonksiyonu
const flattenedCategories = computed(() => {
  const flatten = (categories, depth = 0) => {
    return categories.reduce((acc, category) => {
      acc.push({ ...category, depth });
      if (category.children && category.children.length > 0) {
        acc.push(...flatten(category.children, depth + 1));
      }
      return acc;
    }, []);
  };
  return flatten(categoryStore.categoryTree);
});

// Dinamik özellikler komponenti
const currentSpecificationComponent = computed(() => {
  if (!formData.productType) return null;

  // Dinamik import kullanarak ilgili komponenti yükle
  switch (formData.productType) {
    case "seed":
      return defineAsyncComponent(() =>
        import("@/components/admin/specifications/SeedSpecifications.vue")
      );
    case "seedling":
      return defineAsyncComponent(() =>
        import("@/components/admin/specifications/SeedlingSpecifications.vue")
      );
    case "fertilizer":
      return defineAsyncComponent(() =>
        import("@/components/admin/specifications/FertilizerSpecifications.vue")
      );
    case "agriculturalTool":
      return defineAsyncComponent(() =>
        import("@/components/admin/specifications/ToolSpecifications.vue")
      );
    default:
      return null;
  }
});

// Ürün tipi değiştiğinde özellikleri sıfırla
watch(
  () => formData.productType,
  (newType) => {
    formData.specifications = getInitialSpecifications(newType);
  }
);

// Form gönderme işlemi
const handleSubmit = async () => {
  try {
    // Form validasyonu
    if (!formData.name?.trim()) {
      throw new Error("Ürün adı zorunludur");
    }
    if (!formData.category?.trim()) {
      throw new Error("Kategori seçimi zorunludur");
    }
    if (!formData.price?.current || formData.price.current <= 0) {
      throw new Error("Lütfen geçerli bir fiyat giriniz");
    }
    if (!descriptionForm.value?.validate()) {
    throw new Error("Lütfen açıklama alanlarını kontrol edin");
}

    console.log('Form gönderilmeden önce formData:', formData);

    // Güncelleme ve yeni ürün için farklı veri yapıları
    if (props.isEditing && props.product?._id) {
      // Güncelleme için düz nesne kullan
      const updateData = {
        name: formData.name.trim(),
        category: formData.category,
        productType: formData.productType,
        brand: formData.brand?.trim() || "",
        status: formData.status,
        price: {
          current: Number(formData.price.current),
          discount: Number(formData.price.discount),
          discountEndDate: formData.price.discountEndDate
        },
        stock: {
          quantity: Number(formData.stock.quantity),
          unit: formData.stock.unit,
          lowStockAlert: Number(formData.stock.lowStockAlert)
        },
        description: {
    meta: formData.description.meta,
    detailed: formData.description.detailed,
    keywords: formData.description.keywords
},

        specifications: formData.specifications
      };

      console.log('Güncellenecek veriler:', updateData);
      
      const response = await productStore.updateProduct(props.product._id, updateData);
      console.log('Güncelleme yanıtı:', response);
      if (response.success) {
        emit('product-updated', response.data);
      }
    } else {
      // Yeni ürün için FormData kullan
      const productData = new FormData();
      productData.append("name", formData.name.trim());
      productData.append("category", formData.category);
      productData.append("productType", formData.productType);
      productData.append("brand", formData.brand?.trim() || "");
      productData.append("status", formData.status);

      if (formData.image instanceof File) {
        productData.append("image", formData.image);
      }

      productData.append("price", JSON.stringify({
        current: Number(formData.price.current),
        discount: Number(formData.price.discount),
        discountEndDate: formData.price.discountEndDate
      }));

      productData.append("stock", JSON.stringify({
        quantity: Number(formData.stock.quantity),
        unit: formData.stock.unit,
        lowStockAlert: Number(formData.stock.lowStockAlert)
      }));
      productData.append("description", JSON.stringify({
    meta: formData.description.meta,
    detailed: formData.description.detailed,
    keywords: formData.description.keywords
}));

      productData.append("specifications", JSON.stringify(formData.specifications));

      const response = await productStore.createProduct(productData);
      emit('save', response.data);
    }
  } catch (error) {
    console.error("Form gönderme hatası:", error);
    throw error;
  }
};

// Watch product prop changes
watch(
  () => props.product,
  (newProduct) => {
    if (newProduct) {
      console.log('Product değişti, yeni değer:', newProduct);
      loadProductData();
    }
  },
  { immediate: true, deep: true }
);

</script>