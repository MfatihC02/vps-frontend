<template>
  <router-link
    :to="{
      name: 'product-detail',
      params: { slug: product.slug || slugify(product.name) },
    }"
    class="group bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-500 ease-out hover:-translate-y-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 flex flex-col h-full relative border border-gray-100/20 product-card"
  >
    <!-- Görsel alanı -->
    <div
      class="relative product-image-container overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 w-full"
      :class="{
        'aspect-ratio-seed':
          product.type === 'seed' || product.type === 'seedling',
        'aspect-ratio-tool': product.type === 'agriculturalTool',
      }"
    >
      <img
        v-if="product.images?.length"
        :src="getOptimizedImageUrl(product.images[0].url, product.type)"
        :alt="product.name"
        class="w-full h-full object-contain hover:scale-105 transition-all duration-700"
        loading="lazy"
        decoding="async"
        :width="getImageWidth(product.type)"
        :height="getImageHeight(product.type)"
      />
      <div
        v-else
        class="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-50 to-gray-100"
      >
        <i class="fas fa-image text-4xl opacity-30"></i>
      </div>

      <!-- Rozetler -->
      <div class="absolute top-4 left-4 flex gap-2">
        <span
          v-if="product.price?.discount > 0"
          class="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-1.5 rounded-full text-xs font-medium tracking-wide shadow-lg shadow-red-500/20 backdrop-blur-sm animate-fadeIn transform hover:scale-105 transition-all duration-300"
          >%{{ product.price.discount }}</span
        >
      </div>

      <!-- Hover overlay -->
      <div
        class="absolute inset-0 bg-gradient-to-t from-black/30 via-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      ></div>
    </div>

    <!-- İçerik alanı -->
    <div
      class="pt-3 px-4 pb-3 flex flex-col flex-grow bg-gradient-to-b from-white/50 to-white min-h-0 product-content"
    >
      <div class="space-y-2 flex-grow">
        <!-- Ürün Adı -->
        <h3
          class="font-medium text-gray-800 line-clamp-2 group-hover:text-emerald-600 transition-colors duration-300 text-sm leading-tight tracking-wide"
        >
          {{ product.name }}
        </h3>

        <!-- Fiyat alanı -->
        <div class="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <div class="flex items-baseline gap-2 flex-wrap">
            <span class="font-semibold text-emerald-600 text-lg tracking-tight">
              {{ formatPrice(product.price?.current) }} TL
            </span>
            <span
              v-if="product.price?.discount > 0"
              class="text-xs text-gray-400 line-through font-medium"
            >
              {{ formatPrice(calculateOriginalPrice(product.price)) }} TL
            </span>
          </div>
          <span
            class="text-[11px] text-gray-400 font-normal tracking-tight whitespace-nowrap"
          >
            (KDV Dahil)
          </span>
        </div>
      </div>

      <!-- Detay butonu -->
      <button
        class="w-full mt-2 bg-gradient-to-r from-emerald-50 to-emerald-100/80 text-emerald-600 py-2 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 hover:from-emerald-600 hover:to-emerald-500 hover:text-white group/btn text-sm font-medium tracking-wide focus:outline-none focus:ring-2 focus:ring-emerald-500/30 shadow-sm"
        @click.stop
      >
        Detayları Gör
        <i
          class="fas fa-arrow-right text-xs transition-transform duration-300 group-hover/btn:translate-x-1"
        ></i>
      </button>
    </div>
  </router-link>
</template>

<script>
import { useWindowSize } from "@vueuse/core"; // VueUse kütüphanesi için gerekli

export default {
  name: "ProductCard",
  props: {
    product: {
      type: Object,
      required: true,
    },
  },
  setup() {
    const { width } = useWindowSize();
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;
    const isDesktop = width >= 1024;

    const isNewProduct = (product) => {
      if (!product.createdAt) return false;
      const createdAt = new Date(product.createdAt);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return createdAt >= thirtyDaysAgo;
    };

    const getCategoryName = (product) => {
      return product.category?.name || "Kategorisiz";
    };

    const slugify = (text) => {
      return (
        text
          ?.toLowerCase()
          .replace(/[^a-z0-9-]/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "") || ""
      );
    };

    const getCategoryRoute = (category) => {
      if (!category) return { name: "home" };

      const path = buildCategoryPath(category);
      return {
        name: "category-detail",
        params: { path },
      };
    };

    const buildCategoryPath = (category) => {
      const path = [];
      let currentCategory = category;

      while (currentCategory) {
        path.unshift(slugify(currentCategory.name));
        currentCategory = currentCategory.parent;
      }

      return path;
    };

    return {
      isMobile,
      isTablet,
      isDesktop,
      isNewProduct,
      getCategoryName,
      slugify,
      getCategoryRoute,
    };
  },
  methods: {
    getOptimizedImageUrl(url, type, device = "desktop") {
      if (url.includes("cloudinary")) {
        const baseUrl = url.split("/upload/")[0] + "/upload";
        const imagePath = url.split("/upload/")[1];
        let transformations = "f_auto,q_auto:good"; // Otomatik format (WebP/AVIF) ve otomatik kalite

        if (type === "seed" || type === "seedling") {
          if (device === "mobile") transformations += ",w_200,h_250,c_fill";
          else if (device === "tablet")
            transformations += ",w_300,h_375,c_fill";
          else transformations += ",w_400,h_500,c_fill";
        } else if (type === "agriculturalTool") {
          if (device === "mobile") transformations += ",w_300,h_200,c_fill";
          else if (device === "tablet")
            transformations += ",w_450,h_300,c_fill";
          else transformations += ",w_600,h_400,c_fill";
        }

        return `${baseUrl}/${transformations}/` + imagePath;
      }
      return url;
    },
    getImageWidth(type) {
      if (type === "seed" || type === "seedling")
        return this.isMobile ? 200 : this.isTablet ? 300 : 400;
      if (type === "agriculturalTool")
        return this.isMobile ? 300 : this.isTablet ? 450 : 600;
      return 400; // Varsayılan
    },
    getImageHeight(type) {
      if (type === "seed" || type === "seedling")
        return this.isMobile ? 250 : this.isTablet ? 375 : 500;
      if (type === "agriculturalTool")
        return this.isMobile ? 200 : this.isTablet ? 300 : 400;
      return 500; // Varsayılan
    },
    calculateOriginalPrice(price) {
      if (!price?.current || !price?.discount) return price?.current;
      return price.current / (1 - price.discount / 100);
    },
    formatPrice(price) {
      return Number(price || 0).toLocaleString("tr-TR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    },
    formatProductType(type) {
      const typeMap = {
        seed: "Tohum",
        seedling: "Fide",
        agriculturalTool: "Tarım Aleti",
        fertilizer: "Gübre",
      };
      return typeMap[type] || type;
    },
  },
};
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.product-image-container {
  width: 100%;
  overflow: hidden;
  flex-shrink: 0; /* Görselin kartın geri kalanından bağımsız olmasını sağlar */
}

.aspect-ratio-seed {
  aspect-ratio: 4 / 5; /* Tohumlar için dikey oran */
  padding: clamp(0.5rem, 2vw, 1.5rem);
}

.aspect-ratio-tool {
  aspect-ratio: 3 / 2; /* Ekipmanlar için yatay oran (örneğin, çapa makineleri) */
  padding: clamp(0.5rem, 2vw, 1rem);
}

/* Kart düzeni için genel ayarlar */
.product-card {
  min-height: 400px; /* Sabit minimum yükseklik */
  max-height: 500px; /* Maksimum yükseklik (isteğe bağlı) */
  display: flex;
  flex-direction: column;
  height: 100%; /* Kartların aynı yükseklikte olmasını sağlar */
}

.product-content {
  flex-grow: 1; /* İçeriğin kartın geri kalanını doldurmasını sağlar */
  min-height: 100px; /* Minimum içerik yüksekliği */
}

/* Mobil ve Tablet için media queries */
@media (max-width: 768px) {
  .aspect-ratio-seed {
    aspect-ratio: 3 / 4;
    padding: 0.5rem;
  }

  .aspect-ratio-tool {
    aspect-ratio: 3 / 2;
    padding: 0.5rem;
  }

  .product-card {
    min-height: 350px; /* Mobil için daha küçük minimum yükseklik */
  }

  .product-content {
    min-height: 80px; /* Mobil için daha küçük minimum içerik yüksekliği */
  }
}

@media (max-width: 480px) {
  .aspect-ratio-seed {
    aspect-ratio: 3 / 4;
    padding: 0.25rem;
  }

  .aspect-ratio-tool {
    aspect-ratio: 3 / 2;
    padding: 0.25rem;
  }

  .product-card {
    min-height: 300px; /* Mobil için daha küçük minimum yükseklik */
  }

  .product-content {
    min-height: 60px; /* Mobil için daha küçük minimum içerik yüksekliği */
  }
}

/* Ürün türlerine göre padding (isteğe bağlı, gerekirse) */
.product-image-container img[src*="tohum"],
.product-image-container img[src*="fide"] {
  padding: clamp(0.5rem, 2vw, 1.5rem) clamp(1rem, 4vw, 3rem);
}

.product-image-container img[src*="ekipman"] {
  padding: clamp(0.5rem, 2vw, 1rem);
}
</style>