<template>
  <div class="space-y-6">
    <!-- Tab Navigation -->
    <nav 
      class="relative flex space-x-1 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-1.5 shadow-sm" 
      role="tablist"
    >
      <!-- Aktif Tab Göstergesi -->
      <div
        class="absolute h-[85%] top-[7.5%] transition-all duration-300 ease-spring"
        :class="[
          'rounded-lg bg-white shadow-sm border border-gray-200',
          selectedTab === 'details' ? 'w-full left-[0.375rem]' : 'w-full left-[0.375rem]'
        ]"
      ></div>

      <!-- Tab Butonları -->
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="handleTabChange(tab.id)"
        class="relative z-10 w-full py-2.5 text-sm font-medium leading-5 transition-all duration-200"
        :class="[
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F5E32] focus-visible:ring-offset-2',
          selectedTab === tab.id
            ? 'text-[#2F5E32]'
            : 'text-gray-600 hover:text-[#2F5E32]'
        ]"
        :aria-selected="selectedTab === tab.id"
        role="tab"
      >
        <div class="flex items-center justify-center space-x-2">
          <component 
            :is="tab.icon" 
            class="w-4 h-4"
            :class="selectedTab === tab.id ? 'text-[#2F5E32]' : 'text-gray-400'"
          />
          <span>{{ tab.name }}</span>
        </div>
      </button>
    </nav>

    <!-- Tab Content -->
    <div class="relative mt-6">
      <!-- Details Tab -->
      <div
        v-show="selectedTab === 'details'"
        class="transition-all duration-300"
        :class="[
          selectedTab === 'details' ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 absolute inset-0'
        ]"
      >
        <div
          class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 prose prose-green max-w-none hover:shadow-md transition-all duration-300"
          v-html="content"
        ></div>

        <!-- Anahtar Kelimeler -->
        <section v-if="description?.keywords?.length" class="mt-8 pt-6 border-t">
          <h4 class="text-lg font-semibold text-gray-900 mb-4 font-montserrat">İlgili Anahtar Kelimeler</h4>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="keyword in description.keywords"
              :key="keyword"
              class="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium"
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
import { ref, computed } from "vue";
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { FileText } from "lucide-vue-next";

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

    const tabs = [
      { id: "details", name: "Detaylar", icon: "FileText" },
    ];

    // Tab değişimi için fonksiyon
    const handleTabChange = (tabId) => {
      if (selectedTab.value === tabId) return;
      selectedTab.value = tabId;
    };

    // Markdown işleme
    const content = computed(() => {
      const detailedContent = props.description?.detailed;
      console.log('Detailed Content:', detailedContent);
      if (!detailedContent) return '';
      
      const rawHtml = marked.parse(detailedContent);
      console.log('Parsed HTML:', rawHtml);
      return DOMPurify.sanitize(rawHtml);
    });

    return {
      selectedTab,
      isTabChanging,
      tabs,
      handleTabChange,
      content
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
  font-family: 'Source Serif Pro', Georgia, serif;
}

:deep(.prose p) {
  margin-top: 1em;
  margin-bottom: 1em;
  line-height: 1.75;
  font-size: 1.125rem;
}

:deep(.prose strong) {
  color: #2F5E32;
  font-weight: 600;
}

:deep(.prose h3) {
  color: #1a1a1a;
  font-weight: 700;
  margin-top: 2em;
  margin-bottom: 1em;
  font-size: 1.5rem;
  font-family: 'Montserrat', sans-serif;
}

:deep(.prose h4) {
  color: #2F5E32;
  font-weight: 600;
  margin-top: 1.5em;
  margin-bottom: 0.75em;
  font-size: 1.25rem;
  font-family: 'Montserrat', sans-serif;
}

:deep(.prose ul) {
  margin-top: 0.75em;
  margin-bottom: 1em;
  list-style-type: none;
  padding-left: 0;
}

:deep(.prose li) {
  margin-top: 0.5em;
  margin-bottom: 0.5em;
  padding-left: 1.5em;
  position: relative;
  font-size: 1.125rem;
}

:deep(.prose li::before) {
  content: "•";
  color: #2F5E32;
  font-weight: bold;
  position: absolute;
  left: 0;
}
</style>