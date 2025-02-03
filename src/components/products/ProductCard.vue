<template>
  <router-link
    :to="{ name: 'product-detail', params: { slug: product.slug || slugify(product.name) }}"
    class="group bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden
           shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]
           transition-all duration-500 ease-out hover:-translate-y-2 
           focus:outline-none focus:ring-2 focus:ring-emerald-500/30 
           flex flex-col h-full relative border border-gray-100/20"
  >
    <!-- Görsel alanı -->
    <div class="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 w-full">      <img
        v-if="product.images?.length"
        :src="product.images[0].url"
        :alt="product.name"
        class="w-full h-full object-cover transition-all duration-700 
               group-hover:scale-105 group-hover:brightness-[1.02]"
        loading="lazy"
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
          v-if="isNewProduct(product)"
          class="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white 
                 px-4 py-1.5 rounded-full text-xs font-medium tracking-wide
                 shadow-lg shadow-emerald-500/20 backdrop-blur-sm
                 animate-fadeIn transform hover:scale-105 
                 transition-all duration-300"
        >Yeni</span>
        <span
          v-if="product.price?.discount > 0"
          class="bg-gradient-to-r from-red-500 to-red-600 text-white 
                 px-4 py-1.5 rounded-full text-xs font-medium tracking-wide
                 shadow-lg shadow-red-500/20 backdrop-blur-sm
                 animate-fadeIn transform hover:scale-105
                 transition-all duration-300"
        >%{{ product.price.discount }}</span>
        <span
          v-if="product.productType"
          class="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white 
                 px-4 py-1.5 rounded-full text-xs font-medium tracking-wide
                 shadow-lg shadow-emerald-500/20 backdrop-blur-sm
                 animate-fadeIn transform hover:scale-105 
                 transition-all duration-300"
        >{{ formatProductType(product.productType) }}</span>
      </div>

      <!-- Hover overlay -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/30 via-black/5 to-transparent 
                  opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    </div>
    
    <!-- İçerik alanı -->
    <div class="pt-3 px-4 pb-3 flex flex-col flex-grow bg-gradient-to-b from-white/50 to-white min-h-0">
      <div class="space-y-2 flex-grow">
        <!-- Ürün Adı -->
        <h3 class="font-medium text-gray-800 line-clamp-2 group-hover:text-emerald-600
                   transition-colors duration-300 text-sm leading-tight tracking-wide">
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
              class="text-xs text-gray-400 line-through"
            >
              {{ formatPrice(product.price?.original) }} TL
            </span>
          </div>
          <span class="text-[11px] text-gray-400 font-normal tracking-tight whitespace-nowrap">
            (KDV Dahil)
          </span>
        </div>
      </div>

      <!-- Detay butonu -->
      <button
        class="w-full mt-2 bg-gradient-to-r from-emerald-50 to-emerald-100/80
               text-emerald-600 py-2 rounded-xl flex items-center 
               justify-center gap-2 transition-all duration-300 
               hover:from-emerald-600 hover:to-emerald-500 hover:text-white 
               group/btn text-sm font-medium tracking-wide
               focus:outline-none focus:ring-2 focus:ring-emerald-500/30
               shadow-sm"
        @click.stop
      >
        Detayları Gör
        <i class="fas fa-arrow-right text-xs transition-transform duration-300 
                 group-hover/btn:translate-x-1"></i>
      </button>
    </div>
  </router-link>
</template>

<script>
export default {
  name: 'ProductCard',
  props: {
    product: {
      type: Object,
      required: true
    }
  },
  methods: {
    formatPrice(price) {
      return Number(price || 0).toLocaleString('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    },
    formatProductType(type) {
      const typeMap = {
        'seed': 'Tohum',
        'seedling': 'Fide',
        'agriculturalTool': 'Tarım Aleti',
        'fertilizer': 'Gübre'
      };
      return typeMap[type] || type;
    },
  },
  setup() {
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
      return text
        ?.toLowerCase()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "") || "";
    };

    const getCategoryRoute = (category) => {
      if (!category) return { name: "home" };

      const path = buildCategoryPath(category);
      return {
        name: "category-detail",
        params: { path }
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
      isNewProduct,
      getCategoryName,
      slugify,
      getCategoryRoute
    };
  }
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
</style>
