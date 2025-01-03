<template>
  <main
    class="min-h-screen bg-[#FAFAFA]"
    itemscope
    itemtype="http://schema.org/Product"
  >
    <div class="container mx-auto px-4 py-8">
      <!-- SEO için yapısal veri -->
      <meta itemprop="name" :content="product?.name" />
      <meta itemprop="description" :content="product?.description" />
      <meta itemprop="brand" :content="product?.brand" />
      <meta itemprop="sku" :content="product?.sku" />

      <!-- Breadcrumb - Zenginleştirilmiş SEO -->
      <nav
        v-if="product"
        aria-label="Sayfa navigasyonu"
        class="mb-6"
        itemscope
        itemtype="https://schema.org/BreadcrumbList"
      >
        <ol class="flex items-center space-x-2 text-sm text-gray-600">
          <li
            itemprop="itemListElement"
            itemscope
            itemtype="https://schema.org/ListItem"
            class="flex items-center"
          >
            <a
              href="/"
              itemprop="item"
              class="hover:text-[#2F5E32] transition-colors"
            >
              <span itemprop="name">Anasayfa</span>
            </a>
            <ChevronRight size="16" class="ml-2" />
            <meta itemprop="position" content="1" />
          </li>
          <li
            itemprop="itemListElement"
            itemscope
            itemtype="https://schema.org/ListItem"
            class="flex items-center"
          >
            <a
              :href="`/kategoriler/${getCategorySlug}`"
              itemprop="item"
              class="hover:text-[#2F5E32] transition-colors"
            >
              <span itemprop="name">{{ getCategoryName }}</span>
            </a>
            <ChevronRight size="16" class="ml-2" />
            <meta itemprop="position" content="2" />
          </li>
          <li
            itemprop="itemListElement"
            itemscope
            itemtype="https://schema.org/ListItem"
            class="text-[#2F5E32]"
          >
            <span itemprop="name">{{ product.name }}</span>
            <meta itemprop="position" content="3" />
          </li>
        </ol>
      </nav>

      <!-- Yükleme Durumu -->
      <div
        v-if="loading"
        class="flex justify-center items-center min-h-[400px]"
        role="status"
        aria-label="Ürün yükleniyor"
      >
        <span class="loading loading-spinner loading-lg text-[#2F5E32]">
          <span class="sr-only">Yükleniyor...</span>
        </span>
      </div>

      <!-- Hata Durumu -->
      <div
        v-else-if="error"
        class="text-center p-8 bg-red-50 rounded-xl"
        role="alert"
      >
        <h2 class="text-xl font-semibold text-red-700 mb-2">Bir Hata Oluştu</h2>
        <p class="text-red-600">{{ error }}</p>
        <button
          @click="retryLoading"
          class="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Tekrar Dene
        </button>
      </div>

      <!-- Ana İçerik -->
      <article
        v-else-if="product"
        class="bg-white rounded-xl shadow-sm transition-all duration-300 hover:shadow-md"
      >
        <div class="p-4 lg:p-8">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <!-- Ürün Galerisi -->
            <ProductGallery
              :images="product?.images"
              :loading="loading"
              class="lg:sticky lg:top-4"
            />

            <!-- Ürün Detayları -->
            <div class="flex flex-col space-y-8">
              <ProductDetails
                :product="formattedProductDetails"
                :productId="product?._id"
                class="flex-grow"
              />
            </div>
          </div>

          <!-- Tab Sistemi -->
          <div class="mt-8 border-t pt-8">
            <TabGroup>
              <TabList class="flex space-x-1 border-b">
                <Tab v-slot="{ selected }" as="template">
                  <button
                    :class="[
                      'px-4 py-2.5 text-sm font-medium leading-5 focus:outline-none transition-all duration-200',
                      selected
                        ? 'text-green-700 border-b-2 border-green-600'
                        : 'text-gray-600 hover:text-green-600'
                    ]"
                  >
                    Ürün Özellikleri
                  </button>
                </Tab>
                <Tab v-slot="{ selected }" as="template">
                  <button
                    :class="[
                      'px-4 py-2.5 text-sm font-medium leading-5 focus:outline-none transition-all duration-200',
                      selected
                        ? 'text-green-700 border-b-2 border-green-600'
                        : 'text-gray-600 hover:text-green-600'
                    ]"
                  >
                    Değerlendirmeler
                  </button>
                </Tab>
              </TabList>

              <TabPanels class="mt-4">
                <TabPanel>
                  <ProductSpecifications
                    :productType="product.productType"
                    :specs="product.specifications"
                    :productName="product.name"
                    :brand="product.brand"
                  />
                </TabPanel>
                <TabPanel>
                  <div v-if="!product?._id" class="flex justify-center items-center p-8">
                    <span class="loading loading-spinner loading-md text-green-600"></span>
                  </div>
                  <ProductReviews 
                    v-else
                    :key="product._id"
                    :productId="product._id" 
                  />
                </TabPanel>
              </TabPanels>
            </TabGroup>
          </div>
        </div>
      </article>
    </div>
  </main>
</template>

<script>
import { ChevronRight } from "lucide-vue-next";
import { useProductStore } from "@/stores/productStore";
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from '@headlessui/vue';
import ProductGallery from "@/components/products/ProductGallery.vue";
import ProductDetails from "@/components/products/ProductDetails.vue";
import ProductSpecifications from "@/components/products/ProductSpecifications.vue";
import ProductReviews from "@/views/user/ProductReviews.vue";

export default {
  name: "ProductPage",
  components: {
    ChevronRight,
    ProductGallery,
    ProductDetails,
    ProductSpecifications,
    ProductReviews,
    TabGroup,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
  },

  setup() {
    const productStore = useProductStore();
    const route = useRoute();
    const retryCount = ref(0);

    // Store'dan reactive değerler
    const loading = computed(() => productStore.isLoading);
    const error = computed(() => productStore.getError);
    const product = computed(() => productStore.product);

    // SEO için meta veriler
    const updateMetaTags = () => {
      if (product.value) {
        document.title = `${product.value.name} - Zirai Ürünler`;
        const metaDescription = document.querySelector(
          'meta[name="description"]'
        );
        if (metaDescription) {
          metaDescription.setAttribute(
            "content",
            product.value.description ||
              `${product.value.name} - Kaliteli zirai ürün çeşitleri uygun fiyatlarla`
          );
        }
      }
    };

    // Ürün bilgisi çekme
    const fetchProduct = async () => {
      try {
        const slug = route.params.slug;
        await productStore.fetchProductBySlug(slug);
        updateMetaTags();
      } catch (err) {
        console.error("Ürün yüklenirken hata:", err);
      }
    };

    // Yeniden deneme fonksiyonu
    const retryLoading = async () => {
      if (retryCount.value < 3) {
        retryCount.value++;
        await fetchProduct();
      }
    };

    onMounted(fetchProduct);

    // Computed properties
    const formattedProductDetails = computed(() => {
      if (!product.value) return null;

      return {
        title: product.value.name,
        price: product.value.price.current,
        oldPrice: product.value.price.discount
          ? product.value.price.current /
            (1 - product.value.price.discount / 100)
          : null,
        discount: product.value.price.discount,
        stock: product.value.stock.quantity,
        sku: product.value.sku,
        brand: product.value.brand,
        contact: {
          phone: "+90 555 123 4567",
          email: "info@agroseed.com",
          workHours: "09:00 - 18:00",
        },
      };
    });

    const getCategoryName = computed(() => {
      if (!product.value?.category) return "";
      return product.value.category.name || "";
    });

    const getCategorySlug = computed(() => {
      if (!product.value?.category) return "";
      return product.value.category.slug || "";
    });

    return {
      loading,
      error,
      product,
      formattedProductDetails,
      getCategoryName,
      getCategorySlug,
      retryLoading,
    };
  },
};
</script>