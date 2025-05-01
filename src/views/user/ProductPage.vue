<template>
  <main
    class="min-h-screen bg-[#FAFAFA]"
    v-if="product && isValidProduct"
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
      <RecommendedProducts :currentProduct="product" />
    </div>
  </main>

  <!-- Fide Kategorisi Popup -->
  <Teleport to="body">
    <div v-if="showFidePopup" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div class="relative bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
        <!-- Kapatma ikonu -->
        <button 
          @click="showFidePopup = false" 
          class="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
          aria-label="Kapat"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
        
        <!-- Popup içeriği -->
        <div class="text-center mb-2">
          <div class="bg-amber-50 inline-flex p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
        
        <h3 class="text-lg font-medium text-center text-gray-900 mb-4">Fide Ürünü Bilgilendirme</h3>
        
        <div class="text-gray-700 mb-6 space-y-3">
          <p>Değerli müşterimiz, bu fide ürünümüz hassas yapısı nedeniyle kargo ile gönderime uygun değildir. Bu tür ürünlerimiz yalnızca Konya'daki mağazamızdan teslim alınabilmektedir.</p>
          
          <p>Fide ürünlerimizin tazeliğini ve kalitesini korumak için 'Yerinde Teslim' politikası uyguluyoruz. Böylece ürünlerinizin size en sağlıklı şekilde ulaşmasını garanti ediyoruz.</p>
          
          <p>Sipariş vermek, fiyat bilgisi almak veya sorularınız için aşağıdaki WhatsApp butonuna tıklayarak bizimle iletişime geçebilirsiniz.</p>
        </div>
        
        <!-- Butonlar -->
        <div class="flex gap-3">
          <button 
            @click="showFidePopup = false" 
            class="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Kapat
          </button>
          <a 
            :href="whatsappLink" 
            target="_blank" 
            class="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
          >
            <svg class="h-5 w-5 mr-2" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            WhatsApp ile İletişim
          </a>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- Opsiyonel: Sayfa içinde hatırlatma banner'ı -->
  <div 
    v-if="isFideCategory && !loading && product" 
    class="fixed bottom-4 right-4 left-4 md:left-auto md:max-w-md bg-amber-50 border-l-4 border-amber-500 p-4 rounded-lg shadow-lg z-40"
  >
    <div class="flex">
      <div class="flex-shrink-0">
        <svg class="h-5 w-5 text-amber-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" />
        </svg>
      </div>
      <div class="ml-3 flex-1">
        <p class="text-sm text-amber-700">
          Bu ürün sadece Konya'daki mağazamızdan teslim alınabilir.
          <button @click="showFidePopup = true" class="font-medium underline text-amber-800 hover:text-amber-900">
            Detaylı bilgi
          </button>
        </p>
      </div>
      <button @click="hideBanner = true" class="text-amber-500 hover:text-amber-700 ml-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script>
import { ChevronRight } from "lucide-vue-next";
import { useProductStore } from "@/stores/productStore";
import { useStockStore } from "@/stores/stockStore";
import { marked } from "marked";
import { computed, onMounted, ref, watchEffect,onBeforeMount,nextTick  } from "vue";
import { useRoute } from "vue-router";
import { useHead } from '@vueuse/head';
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from "@headlessui/vue";
import ProductGallery from "@/components/products/ProductGallery.vue";
import ProductDetails from "@/components/products/ProductDetails.vue";
import ProductSpecifications from "@/components/products/ProductSpecifications.vue";
import ProductReviews from "@/views/user/ProductReviews.vue";
import RecommendedProducts from '@/components/products/RecommendedProducts.vue';

export default {
  name: "ProductPage",
  components: {
    ChevronRight,
    ProductGallery,
    ProductDetails,
    ProductSpecifications,
    ProductReviews,
    RecommendedProducts,
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

    // Canonical URL için computed property
    const canonicalUrl = computed(() => {
      if (!route.params.slug) return window.location.href;
      
      // Her ortamda çalışacak şekilde ayarla (local, dev, prod)
      const baseUrl = window.location.origin;
      const fullUrl = `${baseUrl}/urun/${route.params.slug}`;
      
      // URL'yi konsola yazdir
      console.log('Canonical URL:', fullUrl);
      
      return fullUrl;
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
        
        // Canonical Tag Ekleme
        useHead({
          link: [
            {
              rel: 'canonical',
              href: canonicalUrl.value,
            }
          ]
        });
        
        // Oluşan canonical tag'ı console'da göster
        console.log('Canonical tag added to head:', canonicalUrl.value);
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
        // Slug artık beforeEnter'da kullanıldığı için burada tekrar almaya gerek yok
        // const slug = route.params.slug;
        // Ürün çekme işlemi beforeEnter'da yapıldı, burada sadece stok çekilebilir
        // await productStore.fetchProductBySlug(slug);
        if (product.value?._id) {
          // Stok çekme işlemini burada bırakabiliriz veya bunu da beforeEnter'a taşıyabiliriz.
          // Şimdilik burada bırakalım.
          await stockStore.fetchStockByProduct(product.value._id);
        } else {
          // Eğer beforeEnter'dan geçilip buraya gelindiyse ama product ID yoksa bir sorun vardır.
          // Ancak beforeEnter kontrolü bunu engellemeli.
          console.warn('fetchProduct called in onMounted but product ID is missing. This should not happen.');
        }
        // Meta etiket güncellemesi artık onMounted içinde yapılacak
        // updateMetaTags();
      } catch (err) {
        // Stok çekme sırasında hata olursa burası çalışır
        console.error("Stok yüklenirken hata:", err);
      }
    };

    // Yeniden deneme fonksiyonu - beforeEnter sonrası hala stok için gerekebilir?
    // Veya hata yönetimi tamamen beforeEnter'da yapılıyorsa kaldırılabilir.
    // Şimdilik bırakalım.
    const retryLoading = async () => {
      if (retryCount.value < 3) {
        retryCount.value++;
        // Sadece stok çekmeyi tekrar dene?
        if (product.value?._id) {
          await stockStore.fetchStockByProduct(product.value._id);
        } else {
            console.warn('retryLoading called but product ID is missing.');
        }
      }
    };

    onMounted(() => {
      // Bileşen mount edildiğinde ürün verisi zaten hazır olmalı.
      // Stok bilgisini burada çekebiliriz.
      fetchProduct(); // Sadece stok çekmek için çağır
      // Meta etiketleri burada güncelleyelim, çünkü product verisi artık mevcut olmalı.
      updateMetaTags(); 
    });

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

    // Fide kategorisi için popup durumları
    const showFidePopup = ref(false);
    const hideBanner = ref(false);

    // Fide kategorisi kontrolü
    const isFideCategory = computed(() => {
      const fideSlugs = ["fide", "sebze-fidesi", "meyve-fidesi"]; // Tüm fide kategori slug'larını buraya ekleyin
      
      // Doğrudan kategori kontrolü
      if (product.value?.category && fideSlugs.includes(product.value.category.slug)) {
        return true;
      }
      
      // Üst kategorilerde kontrol
      if (product.value?.category?.ancestors && 
          product.value.category.ancestors.some(cat => fideSlugs.includes(cat.slug))) {
        return true;
      }
      
      return false;
    });

    // WhatsApp link oluşturma
    const whatsappLink = computed(() => {
      if (!product.value) return '#';
      
      const phone = '905516419012'; // İstenen numara
      const text = `Merhaba, ${product.value.name} fide ürünü hakkında bilgi almak istiyorum. Konya'dan teslim alma imkanım var.`;
      
      return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    });

    // Ürün yüklendiğinde fide kontrolü yap
    onMounted(() => {
      // Mevcut kodu koru
      fetchProduct();
      updateMetaTags();
      
      // Fide kategorisi kontrolü
      watchEffect(() => {
        if (product.value && isFideCategory.value) {
          showFidePopup.value = true;
          console.log("Fide ürünü tespit edildi:", product.value.name);
        }
      });
    });

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
      canonicalUrl, // Yeni property'yi return et (opsiyonel)
      showFidePopup,
      hideBanner,
      isFideCategory,
      whatsappLink,
    };
  },
};
</script>
