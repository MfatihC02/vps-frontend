<template>
  <div class="space-y-4 sm:space-y-6">

    <!-- Tab Content -->
    <div class="relative mt-4 sm:mt-6">
      <!-- Details Tab -->
      <div
        v-show="selectedTab === 'details'"
        class="transition-all duration-200"
        :class="[
          selectedTab === 'details' ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 absolute inset-0'
        ]"
      >
        <div
          class="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 prose prose-green max-w-none hover:shadow-md transition-all duration-200"
          v-html="sanitizedContent"
        ></div>

        <!-- Anahtar Kelimeler -->
        <section v-if="description?.keywords?.length" class="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t">
          <h4 class="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 font-montserrat">İlgili Anahtar Kelimeler</h4>
          <div class="flex flex-wrap gap-1.5 sm:gap-2">
            <span
              v-for="keyword in description.keywords"
              :key="keyword"
              class="px-2.5 sm:px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs sm:text-sm font-medium"
            >
              {{ keyword }}
            </span>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { FileText } from "lucide-vue-next";

// Marked ayarlarını optimize et
marked.setOptions({
  gfm: true,
  breaks: true,
  smartLists: true,
  smartypants: true
});

export default {
  name: "ProductSpecifications",

  components: {
    FileText
  },

  props: {
    description: {
      type: Object,
      required: true,
      validator(value) {
        return value.hasOwnProperty('detailed');
      }
    }
  },

  setup(props) {
    const selectedTab = ref("details");
    const isTabChanging = ref(false);
    const contentCache = ref(null);

    const tabs = [
      { id: "details", name: "Detaylar", icon: "FileText" },
    ];

    // Tab değişimi için fonksiyon
    const handleTabChange = (tabId) => {
      if (selectedTab.value === tabId) return;
      selectedTab.value = tabId;
    };

    // Markdown işleme ve önbellekleme
    const sanitizedContent = computed(() => {
      if (!props.description?.detailed) return '';
      
      if (!contentCache.value) {
        const rawHtml = marked.parse(props.description.detailed);
        contentCache.value = DOMPurify.sanitize(rawHtml);
      }
      
      return contentCache.value;
    });

    // Önbelleği temizle
    onMounted(() => {
      contentCache.value = null;
    });

    return {
      selectedTab,
      isTabChanging,
      tabs,
      handleTabChange,
      sanitizedContent
    };
  },
};
</script>

<style scoped>
.ease-spring {
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.prose) {
  max-width: none;
  font-family: system-ui, -apple-system, sans-serif;
}

:deep(.prose p) {
  margin-top: 0.75em;
  margin-bottom: 0.75em;
  line-height: 1.625;
  font-size: 0.9375rem;
  
  @media (min-width: 640px) {
    margin-top: 1em;
    margin-bottom: 1em;
    line-height: 1.75;
    font-size: 1.125rem;
  }
}

:deep(.prose strong) {
  color: #2F5E32;
  font-weight: 600;
}

:deep(.prose h3) {
  color: #1a1a1a;
  font-weight: 700;
  margin-top: 1.5em;
  margin-bottom: 0.75em;
  font-size: 1.25rem;
  font-family: system-ui, -apple-system, sans-serif;
  
  @media (min-width: 640px) {
    margin-top: 2em;
    margin-bottom: 1em;
    font-size: 1.5rem;
  }
}

:deep(.prose h4) {
  color: #2F5E32;
  font-weight: 600;
  margin-top: 1.25em;
  margin-bottom: 0.5em;
  font-size: 1.125rem;
  font-family: system-ui, -apple-system, sans-serif;
  
  @media (min-width: 640px) {
    margin-top: 1.5em;
    margin-bottom: 0.75em;
    font-size: 1.25rem;
  }
}

:deep(.prose ul) {
  margin-top: 0.5em;
  margin-bottom: 0.75em;
  list-style-type: none;
  padding-left: 0;
  
  @media (min-width: 640px) {
    margin-top: 0.75em;
    margin-bottom: 1em;
  }
}

:deep(.prose li) {
  margin-top: 0.375em;
  margin-bottom: 0.375em;
  padding-left: 1.25em;
  position: relative;
  font-size: 0.9375rem;
  
  @media (min-width: 640px) {
    margin-top: 0.5em;
    margin-bottom: 0.5em;
    padding-left: 1.5em;
    font-size: 1.125rem;
  }
}

:deep(.prose li::before) {
  content: "•";
  color: #2F5E32;
  font-weight: bold;
  position: absolute;
  left: 0;
}

/* Mobil optimizasyonları */
@media (max-width: 640px) {
  :deep(.prose) {
    content-visibility: auto;
    contain: content;
  }
  
  :deep(.prose *) {
    transition-duration: 200ms;
  }
}
</style>
