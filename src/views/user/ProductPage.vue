<template>
  <main
    class="min-h-screen bg-[#FAFAFA]"
    v-if="product && isValidProduct"
    itemscope
    itemtype="http://schema.org/Product"
  >
    <!-- Preload critical resources -->
    <link
      rel="preload"
      href="/assets/index-Dw7LCfth.css"
      as="style"
      onload="this.onload=null;this.rel='stylesheet'"
    />
    <link
      rel="preload"
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Montserrat:wght@600;700&display=swap"
      as="style"
      onload="this.onload=null;this.rel='stylesheet'"
    />
    <link
      rel="preconnect"
      href="https://res.cloudinary.com"
      crossorigin
    />
    <div class="w-full px-[10px] sm:container sm:mx-auto sm:px-4 py-4 sm:py-8">
      

      <!-- LCP Preload -->
      <link
        v-if="product?.images?.[0]?.url"
        rel="preload"
        as="image"
        :href="product.images[0].url.replace('/upload/', '/upload/f_auto,q_auto:eco,w_600,dpr_auto,c_limit/')"
        :imagesrcset="`
          ${product.images[0].url.replace('/upload/', '/upload/f_webp,q_auto:eco,w_400,dpr_auto,c_limit,e_blur:1000/')} 400w,
          ${product.images[0].url.replace('/upload/', '/upload/f_webp,q_auto:eco,w_600,dpr_auto,c_limit/')} 600w,
          ${product.images[0].url.replace('/upload/', '/upload/f_webp,q_auto:eco,w_800,dpr_auto,c_limit/')} 800w
        `"
        :imagesizes="'(max-width: 480px) 95vw, (max-width: 768px) 75vw, 600px'"
        fetchpriority="high"
      />
      <!-- SEO için yapısal veri -->
      <div itemscope itemtype="http://schema.org/Product" class="hidden">
        <meta itemprop="name" :content="product.name" />
        <meta itemprop="description" :content="product.description?.meta" />
        <meta itemprop="sku" :content="product.sku" />
        <meta itemprop="productID" :content="product._id" />
        <meta itemprop="category" :content="getCategoryName" />
        
        <!-- Ürün Resimleri -->
        <link
          v-if="product.images?.[0]?.url"
          itemprop="image"
          :content="product.images[0].url"
        />
        <meta
          v-for="(image, index) in product.images"
          :key="index"
          v-if="index > 0"
          itemprop="image"
          :content="image.url"
        />

        <!-- Marka Bilgisi -->
        <div itemprop="brand" itemscope itemtype="http://schema.org/Brand">
          <meta itemprop="name" :content="product.brand" />
        </div>

        <!-- Değerlendirme Bilgisi -->
        <div
          itemprop="aggregateRating"
          itemscope
          itemtype="http://schema.org/AggregateRating"
        >
          <meta itemprop="ratingValue" content="4.5" />
          <meta itemprop="reviewCount" content="10" />
          <meta itemprop="bestRating" content="5" />
          <meta itemprop="worstRating" content="1" />
        </div>

        <!-- Fiyat Bilgisi -->
        <div v-if="formattedPrice" itemprop="offers" itemscope itemtype="http://schema.org/Offer">
          <meta itemprop="price" :content="formattedPrice" />
          <meta itemprop="priceCurrency" content="TRY" />
          <link
            itemprop="availability"
            :href="stockInfo?.quantity > 0 ? 'http://schema.org/InStock' : 'http://schema.org/OutOfStock'"
          />
          <meta itemprop="priceValidUntil" :content="priceValidUntil" />
          <link itemprop="url" :content="currentUrl" />
          <meta itemprop="itemCondition" content="http://schema.org/NewCondition"/>

          <!-- Kargo Detayları -->
          <div itemprop="shippingDetails" itemscope itemtype="http://schema.org/OfferShippingDetails">
            <div itemprop="deliveryTime" itemscope itemtype="http://schema.org/ShippingDeliveryTime">
              <meta itemprop="handlingTime" content="P1D" />
              <meta itemprop="transitTime" content="P3D" />
            </div>
            <div itemprop="shippingDestination" itemscope itemtype="http://schema.org/DefinedRegion">
              <meta itemprop="addressCountry" content="TR" />
            </div>
          </div>

          <!-- Satıcı Bilgileri -->
          <div itemprop="seller" itemscope itemtype="http://schema.org/Organization">
            <meta itemprop="name" content="AgroSeed" />
            <meta itemprop="telephone" content="+90 545 599 36 88" />
            <meta itemprop="email" content="info@agroseed.com" />
          </div>

          <!-- İade Politikası -->
          <div itemprop="hasMerchantReturnPolicy" itemscope itemtype="http://schema.org/MerchantReturnPolicy">
            <meta itemprop="returnPolicyCategory" content="http://schema.org/MerchantReturnFiniteReturnWindow" />
            <meta itemprop="returnMethod" content="http://schema.org/ReturnByMail" />
            <meta itemprop="merchantReturnDays" content="14" />
            <meta itemprop="returnFees" content="http://schema.org/ReturnFeesCustomer" />
            <meta itemprop="applicableCountry" content="TR" />
          </div>
        </div>

      </div>
      <!-- Ürün Detayları için gizli div -->
      <div class="hidden">
        <div
          itemprop="description"
          v-if="product?.description?.detailed"
          v-html="parsedDetailedDescription"
        ></div>
      </div>

      <!-- Breadcrumb - Zenginleştirilmiş SEO -->
      <nav
        v-if="product"
        aria-label="Sayfa navigasyonu"
        class="mb-6"
        itemscope
        itemtype="https://schema.org/BreadcrumbList"
      >
        <ol class="flex flex-wrap items-center space-x-2 text-sm text-gray-600">
          <!-- Anasayfa -->
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

          <!-- Üst Kategoriler -->
          <template v-if="product.category?.ancestors">
            <li
              v-for="(ancestor, index) in product.category.ancestors"
              :key="ancestor._id"
              itemprop="itemListElement"
              itemscope
              itemtype="https://schema.org/ListItem"
              class="flex items-center"
            >
              <a
                :href="`/kategori/${ancestor.slug}`"
                itemprop="item"
                class="hover:text-[#2F5E32] transition-colors"
              >
                <span itemprop="name">{{ ancestor.name }}</span>
              </a>
              <ChevronRight size="16" class="ml-2" />
              <meta itemprop="position" :content="index + 2" />
            </li>
          </template>

          <!-- Mevcut Kategori -->
          <li
            v-if="product.category"
            itemprop="itemListElement"
            itemscope
            itemtype="https://schema.org/ListItem"
            class="flex items-center"
          >
            <a
              :href="`/kategori/${product.category.slug}`"
              itemprop="item"
              class="hover:text-[#2F5E32] transition-colors"
            >
              <span itemprop="name">{{ product.category.name }}</span>
            </a>
            <ChevronRight size="16" class="ml-2" />
            <meta
              itemprop="position"
              :content="
                product.category.ancestors
                  ? product.category.ancestors.length + 2
                  : 2
              "
            />
          </li>

          <!-- Ürün -->
          <li
            itemprop="itemListElement"
            itemscope
            itemtype="https://schema.org/ListItem"
            class="text-[#2F5E32]"
          >
            <span itemprop="name" class="sr-only">{{ product.name }}</span>
            <meta
              itemprop="position"
              :content="
                product.category?.ancestors
                  ? product.category.ancestors.length + 3
                  : 3
              "
            />
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
        class="bg-white rounded-none sm:rounded-xl shadow-sm transition-all duration-300 hover:shadow-md mx-[-10px] sm:mx-0 min-h-[800px]"
      >
        <div class="p-0 sm:p-4 lg:p-6">
          <!-- Ana grid için minimum yükseklik tanımı güncellendi -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-0 sm:gap-4 lg:gap-8">
            <!-- Sol Kolon: Ürün Galerisi -->
            <div class="w-full lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)]">
              <Suspense>
                <template #default>
                  <ProductGallery
                    :images="product?.images || []"
                    :loading="loading"
                    @image-loaded="handleImageLoad"
                  />
                </template>
                <template #fallback>
                  <div class="w-full h-[50vh] md:h-[70vh] bg-gray-50 rounded-xl animate-pulse"></div>
                </template>
              </Suspense>
            </div>

            <!-- Sağ Kolon: Ürün Detayları -->
            <div class="space-y-3 sm:space-y-4 lg:space-y-6 px-3 sm:px-0">
              <Suspense>
                <template #default>
                  <ProductDetails
                    :product="product"
                    :loading="loading"
                    @add-to-cart="handleAddToCart"
                  />
                </template>
                <template #fallback>
                  <div class="space-y-4 animate-pulse">
                    <div class="h-8 bg-gray-200 rounded w-3/4"></div>
                    <div class="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div class="h-24 bg-gray-200 rounded"></div>
                  </div>
                </template>
              </Suspense>
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
                        : 'text-gray-600 hover:text-green-600',
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
                        : 'text-gray-600 hover:text-green-600',
                    ]"
                  >
                    Değerlendirmeler
                  </button>
                </Tab>
              </TabList>

              <TabPanels class="mt-4">
                <TabPanel>
                  <ProductSpecifications
                    v-if="product.description"
                    :description="product.description"
                  />
                </TabPanel>
                <TabPanel>
                  <div
                    v-if="!product?._id"
                    class="flex justify-center items-center p-8"
                  >
                    <span
                      class="loading loading-spinner loading-md text-green-600"
                    ></span>
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
import { useStockStore } from "@/stores/stockStore";
import { marked } from "marked";
import { computed, onMounted, ref, watchEffect,onBeforeMount,nextTick  } from "vue";
import { useRoute } from "vue-router";
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from "@headlessui/vue";
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
    const stockStore = useStockStore();
    const route = useRoute();
    const retryCount = ref(0);
    const initialTitle = ref('');

    // URL'den başlığı hemen çıkar
    onBeforeMount(() => {
      initialTitle.value = route.params.slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    });

    // Store'dan reactive değerler
    const loading = computed(() => productStore.isLoading);
    const error = computed(() => productStore.getError);
    const product = computed(() => {
      const p = productStore.product;
      if (p) {
        // Başlığı güncelle
        initialTitle.value = p.name;
      }
      return p;
    });

    // Stok bilgisi
    const stockInfo = computed(() => {
      if (!product.value?._id) return null;
      return stockStore.getStockByProductId(product.value._id);
    });

    // SEO için meta veriler
    const updateMetaTags = () => {
      if (product.value) {
        const title = `${product.value.name} - Tarım Sepetim`;
        const description = product.value.description?.meta || 
          `${product.value.name} - Detaylı ürün bilgileri, özellikleri ve fiyatı`;
        
        document.title = title;
        
        // Meta description güncelleme
        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
          metaDescription = document.createElement('meta');
          metaDescription.name = 'description';
          document.head.appendChild(metaDescription);
        }
        metaDescription.content = description;

        // Open Graph meta etiketleri
        updateOpenGraphTags({
          title: title,
          description: description,
          image: product.value.images?.[0]?.url,
          url: window.location.href
        });
      }
    };

    // Open Graph meta etiketlerini güncelleme
    const updateOpenGraphTags = ({ title, description, image, url }) => {
      const ogTags = {
        'og:title': title,
        'og:description': description,
        'og:image': image,
        'og:url': url,
        'og:type': 'product',
        'og:site_name': 'Tarım Sepetim'
      };

      Object.entries(ogTags).forEach(([property, content]) => {
        if (content) {
          let metaTag = document.querySelector(`meta[property="${property}"]`);
          if (!metaTag) {
            metaTag = document.createElement('meta');
            metaTag.setAttribute('property', property);
            document.head.appendChild(metaTag);
          }
          metaTag.setAttribute('content', content);
        }
      });
    };

    // Ürün ve stok bilgisi çekme
    const fetchProduct = async () => {
      try {
        const slug = route.params.slug;
        await productStore.fetchProductBySlug(slug);
        if (product.value?._id) {
          await stockStore.fetchStockByProduct(product.value._id);
        }
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
        stock: stockInfo.value?.quantity ?? 0,
        sku: product.value.sku,
        brand: product.value.brand,
        contact: {
          phone: "+90 545 599 36 88",
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

    const priceValidUntil = computed(() => {
      const date = new Date();
      date.setDate(date.getDate() + 30);
      return date.toISOString();
    });

    const currentUrl = computed(() => {
      return window.location.href;
    });

    const parsedDetailedDescription = computed(() => {
      if (!product.value?.description?.detailed) return "";
      return marked.parse(product.value.description.detailed);
    });

    const isValidProduct = computed(() => {
      return product.value && product.value._id;
    });

    const formattedPrice = computed(() => {
      if (!product.value) return null;
      return Number(product.value.price.current).toFixed(2);
    });

    const handleImageLoad = () => {
      console.log("Image loaded");
    };

    const handleAddToCart = () => {
      console.log("Add to cart clicked");
    };

    return {
      loading,
      error,
      product,
      stockInfo,
      formattedProductDetails,
      getCategoryName,
      getCategorySlug,
      retryLoading,
      priceValidUntil,
      currentUrl,
      parsedDetailedDescription,
      handleImageLoad,
      handleAddToCart,
      isValidProduct,
      formattedPrice,
      initialTitle,
    };
  },
};
</script>
