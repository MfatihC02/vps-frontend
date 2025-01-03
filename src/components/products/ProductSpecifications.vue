<template>
  <div class="w-full space-y-6">
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
          selectedTab === 'specs' ? 'w-[calc(50%-0.5rem)] left-[0.375rem]' : 'w-[calc(50%-0.5rem)] left-[calc(50%+0.125rem)]'
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
      <!-- Specifications Tab -->
      <div 
        v-show="selectedTab === 'specs'"
        class="space-y-6 transition-all duration-300"
        :class="[
          selectedTab === 'specs' ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 absolute inset-0'
        ]"
      >
        <div
          v-for="(section, index) in currentSpecSections"
          :key="index"
          :ref="el => { if (el) sectionRefs[index] = el }"
          class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md group opacity-0"
        >
          <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2 group-hover:text-[#2F5E32] transition-colors duration-200">
            <component :is="section.icon" class="w-5 h-5 text-[#2F5E32]" />
            <span>{{ section.title }}</span>
          </h3>

          <div class="grid gap-3">
            <div
              v-for="(item, key) in section.items"
              :key="key"
              class="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-50 transition-all duration-200 group/item relative"
              :title="item.tooltip"
            >
              <div class="flex items-center space-x-2">
                <component 
                  :is="item.icon" 
                  class="w-4 h-4 text-gray-400 group-hover/item:text-[#2F5E32] transition-colors duration-200" 
                />
                <span class="text-gray-600 group-hover/item:text-gray-900 transition-colors duration-200">{{ key }}</span>
              </div>
              <span
                class="text-gray-900 font-medium px-3 py-1 rounded-md transition-all duration-200"
                :class="{ 
                  'bg-[#2F5E32]/10 text-[#2F5E32] group-hover/item:bg-[#2F5E32]/20': isHighlightedValue(item.value),
                  'bg-gray-100 group-hover/item:bg-gray-200': !isHighlightedValue(item.value)
                }"
              >
                {{ item.value }}
              </span>

              <!-- Tooltip -->
              <div 
                class="tooltip absolute invisible group-hover/item:visible opacity-0 group-hover/item:opacity-100 transition-all duration-200 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded whitespace-nowrap z-10"
                role="tooltip"
              >
                {{ item.tooltip }}
                <div class="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
          v-html="enrichedDescription"
        ></div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { 
  Sprout, 
  Calendar, 
  Package, 
  Ruler, 
  Leaf, 
  Box,
  FileText,
  List,
  Thermometer,
  Clock,
  Sun,
  Shovel,
  Weight,
  MapPin,
  Beaker,
  Droplets,
  Timer,
  Wrench,
  Settings,
  ShieldCheck,
  HelpCircle
} from "lucide-vue-next";

export default {
  name: "ProductSpecifications",

  components: {
    Sprout,
    Calendar,
    Package,
    Ruler,
    Leaf,
    Box,
    FileText,
    List,
    Thermometer,
    Clock,
    Sun,
    Shovel,
    Weight,
    MapPin,
    Beaker,
    Droplets,
    Timer,
    Wrench,
    Settings,
    ShieldCheck,
    HelpCircle
  },

  props: {
    productType: {
      type: String,
      required: true,
      validator: (value) =>
        ["seed", "seedling", "fertilizer", "agriculturalTool"].includes(value),
    },
    specs: {
      type: Object,
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
  },

  setup(props) {
    const selectedTab = ref("specs");
    const isTabChanging = ref(false);
    const observer = ref(null);
    const sectionRefs = ref([]);

    const tabs = [
      { id: "specs", name: "Özellikler", icon: "List" },
      { id: "details", name: "Detaylar", icon: "FileText" },
    ];

    // Performans optimizasyonu için debounce fonksiyonu
    const debounce = (fn, wait) => {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          fn(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    };

    // Tab değişimi için geliştirilmiş fonksiyon
    const handleTabChange = debounce((tabId) => {
      if (selectedTab.value === tabId) return;
      
      isTabChanging.value = true;
      selectedTab.value = tabId;
      
      setTimeout(() => {
        isTabChanging.value = false;
      }, 300);
    }, 200);

    // Markdown işleme fonksiyonu
    const renderMarkdown = (text) => {
      if (!text) return '';
      const rawHtml = marked.parse(text);
      return DOMPurify.sanitize(rawHtml);
    };

    const seedSpecSections = computed(() => {
      const specs = props.specs;
      return [
        {
          title: "Temel Özellikler",
          icon: "Sprout",
          items: {
            "Çimlenme Oranı": {
              value: specs.germinationRate ? `${specs.germinationRate}%` : "Belirtilmemiş",
              icon: "Thermometer",
              tooltip: "Tohumların çimlenme başarı oranı"
            },
            "Büyüme Süresi": {
              value: specs.growthPeriod || "Belirtilmemiş",
              icon: "Clock",
              tooltip: "Çimlenmeden hasada kadar geçen süre"
            },
            "Hasat Zamanı": {
              value: specs.harvestTime || "Belirtilmemiş",
              icon: "Sun",
              tooltip: "Tahmini hasat dönemi"
            }
          },
        },
        {
          title: "Ekim Bilgileri",
          icon: "Calendar",
          items: {
            "Ekim Derinliği": {
              value: specs.plantingDepth || "Belirtilmemiş",
              icon: "Shovel",
              tooltip: "Önerilen ekim derinliği"
            },
            "Ekim Mesafesi": {
              value: specs.sowingDistance || "Belirtilmemiş",
              icon: "Ruler",
              tooltip: "Tohumlar arası önerilen mesafe"
            },
            "Mevsim": {
              value: specs.season || "Belirtilmemiş",
              icon: "Sun",
              tooltip: "En uygun ekim mevsimi"
            }
          },
        },
        {
          title: "Paketleme",
          icon: "Package",
          items: {
            "Ağırlık": {
              value: specs.packaging?.weight ? `${specs.packaging.weight} ${specs.packaging.unit}` : "Belirtilmemiş",
              icon: "Weight",
              tooltip: "Paket ağırlığı"
            },
            "Menşei": {
              value: specs.origin || "Belirtilmemiş",
              icon: "MapPin",
              tooltip: "Üretim yeri"
            }
          },
        },
      ];
    });

    const seedlingSpecSections = computed(() => {
      const specs = props.specs;
      return [
        {
          title: "Dikim Bilgileri",
          icon: "Leaf",
          items: {
            "Toprak Tipi": {
              value: specs.planting?.soil || "Belirtilmemiş",
              icon: "Shovel",
              tooltip: "Önerilen toprak türü"
            },
            "Dikim Sezonu": {
              value: specs.planting?.season || "Belirtilmemiş",
              icon: "Sun",
              tooltip: "En uygun dikim mevsimi"
            },
            "Dikim Aralığı": {
              value: specs.planting?.spacing || "Belirtilmemiş",
              icon: "Ruler",
              tooltip: "Fideler arası önerilen mesafe"
            }
          },
        },
        {
          title: "Ürün Detayları",
          icon: "Box",
          items: {
            "Çeşit": {
              value: specs.variety || "Belirtilmemiş",
              icon: "Leaf",
              tooltip: "Fide çeşidi"
            },
            "Paketleme": {
              value: formatPackaging(specs.packaging) || "Belirtilmemiş",
              icon: "Package",
              tooltip: "Paketleme detayları"
            }
          },
        },
      ];
    });

    const fertilizerSpecSections = computed(() => {
      const specs = props.specs;
      return [
        {
          title: "İçerik Analizi",
          icon: "Beaker",
          items: {
            "Besin Değerleri": {
              value: formatNutrients(specs.nutrientContent) || "Belirtilmemiş",
              icon: "Droplets",
              tooltip: "Besin elementi oranları"
            },
            "Bileşim": {
              value: specs.composition || "Belirtilmemiş",
              icon: "Beaker",
              tooltip: "Kimyasal bileşenler"
            }
          },
        },
        {
          title: "Kullanım Bilgileri",
          icon: "Wrench",
          items: {
            "Uygulama Yöntemi": {
              value: specs.applicationMethod || "Belirtilmemiş",
              icon: "Shovel",
              tooltip: "Nasıl uygulanmalı"
            },
            "Dozaj": {
              value: specs.usage?.dosage || "Belirtilmemiş",
              icon: "Weight",
              tooltip: "Önerilen kullanım miktarı"
            },
            "Kullanım Sıklığı": {
              value: specs.usage?.frequency || "Belirtilmemiş",
              icon: "Timer",
              tooltip: "Ne sıklıkta uygulanmalı"
            }
          },
        },
      ];
    });

    const toolSpecSections = computed(() => {
      const specs = props.specs;
      return [
        {
          title: "Teknik Özellikler",
          icon: "Settings",
          items: {
            "Model": {
              value: specs.general?.model || "Belirtilmemiş",
              icon: "Wrench",
              tooltip: "Ürün modeli"
            },
            "Güç": {
              value: formatPower(specs.technical?.engine?.power) || "Belirtilmemiş",
              icon: "Settings",
              tooltip: "Motor gücü"
            },
            "Boyutlar": {
              value: formatDimensions(specs.general?.dimensions) || "Belirtilmemiş",
              icon: "Ruler",
              tooltip: "Ürün boyutları"
            }
          },
        },
        {
          title: "Garanti ve Bakım",
          icon: "ShieldCheck",
          items: {
            "Garanti": {
              value: formatWarranty(specs.general?.warranty) || "Belirtilmemiş",
              icon: "ShieldCheck",
              tooltip: "Garanti süresi ve kapsamı"
            },
            "Servis Desteği": {
              value: specs.maintenance?.serviceInfo?.available ? "Mevcut" : "Belirtilmemiş",
              icon: "HelpCircle",
              tooltip: "Teknik servis desteği"
            }
          },
        },
      ];
    });

    const currentSpecSections = computed(() => {
      const sections = {
        seed: seedSpecSections.value,
        seedling: seedlingSpecSections.value,
        fertilizer: fertilizerSpecSections.value,
        agriculturalTool: toolSpecSections.value,
      };
      return sections[props.productType] || [];
    });

    const enrichedDescription = computed(() => {
      const productTypeDesc = getProductTypeDescription(props.productType);
      const detailedDesc = getDetailedDescription(props.productType, props.specs);
      
      const markdownContent = `
### ${props.productName}

**${props.brand}** markasının ${productTypeDesc}

${detailedDesc}

#### Öne Çıkan Özellikler

${getHighlights(props.productType, props.specs)}

#### Kullanım Önerileri

${getUsageRecommendations(props.productType, props.specs)}
      `;

      return renderMarkdown(markdownContent);
    });

    // Yardımcı fonksiyonlar
    const formatValue = (value) => {
      if (value === null || value === undefined) return "Belirtilmemiş";
      if (typeof value === "boolean") return value ? "Evet" : "Hayır";
      return value.toString();
    };

    const isHighlightedValue = (value) => {
      return value && value !== "Belirtilmemiş";
    };

    const formatPackaging = (packaging) => {
      if (!packaging) return null;
      return `${packaging.type} - ${
        packaging.description || "Standart Paketleme"
      }`;
    };

    const formatNutrients = (nutrients) => {
      if (!nutrients) return null;
      return Object.entries(nutrients)
        .map(([key, value]) => `${key}: ${value.value}${value.unit}`)
        .join(", ");
    };

    const formatPower = (power) => {
      if (!power) return null;
      return `${power.value} ${power.unit}`;
    };

    const formatDimensions = (dimensions) => {
      if (!dimensions) return null;
      return `${dimensions.length}x${dimensions.width}x${dimensions.height} ${dimensions.unit}`;
    };

    const formatWarranty = (warranty) => {
      if (!warranty) return null;
      return `${warranty.duration} ${warranty.type}`;
    };

    const getProductTypeDescription = (type) => {
      const descriptions = {
        seed: "yüksek kaliteli tohum ürünlerinden biridir.",
        seedling: "sağlıklı ve verimli fide çeşitlerindendir.",
        fertilizer: "etkili gübre çözümlerindendir.",
        agriculturalTool: "profesyonel tarım ekipmanlarındandır.",
      };
      return descriptions[type] || "";
    };

    const getDetailedDescription = (type, specs) => {
      const descriptions = {
        seedling: `
Bu fide çeşidi, ${specs.variety || "belirtilmemiş"} türünde olup, 
${specs.planting?.season || "belirtilmemiş"} dikime uygundur.

#### Dikim Özellikleri
- **Dikim Aralığı:** ${specs.planting?.spacing || "Belirtilmemiş"}
- **Toprak Tipi:** ${specs.planting?.soil || "Belirtilmemiş"}
- **Dikim Mevsimi:** ${specs.planting?.season || "Belirtilmemiş"}

#### Bakım Bilgileri
- **Sulama İhtiyacı:** ${specs.care?.watering || "Belirtilmemiş"}
- **Gübreleme:** ${specs.care?.fertilizing || "Belirtilmemiş"}
- **Özel Bakım:** ${specs.care?.special || "Belirtilmemiş"}
`,
        seed: `
Bu tohum çeşidi, ${specs.variety || "belirtilmemiş"} türünde olup,
${specs.season || "belirtilmemiş"} ekimi için uygundur.

#### Ekim Özellikleri
- **Ekim Derinliği:** ${specs.plantingDepth || "Belirtilmemiş"}
- **Sıra Arası Mesafe:** ${specs.sowingDistance || "Belirtilmemiş"}
- **Ekim Mevsimi:** ${specs.season || "Belirtilmemiş"}

#### Verim Bilgileri
- **Çimlenme Oranı:** ${specs.germinationRate ? `${specs.germinationRate}%` : "Belirtilmemiş"}
- **Büyüme Süresi:** ${specs.growthPeriod || "Belirtilmemiş"}
- **Hasat Zamanı:** ${specs.harvestTime || "Belirtilmemiş"}
`,
        fertilizer: `
Bu gübre, ${specs.composition || "belirtilmemiş"} içerikli formülasyona sahiptir.

#### Kullanım Talimatları
- **Uygulama Yöntemi:** ${specs.applicationMethod || "Belirtilmemiş"}
- **Dozaj:** ${specs.usage?.dosage || "Belirtilmemiş"}
- **Kullanım Sıklığı:** ${specs.usage?.frequency || "Belirtilmemiş"}

#### İçerik Bilgileri
- **Besin Değerleri:** ${formatNutrients(specs.nutrientContent) || "Belirtilmemiş"}
- **pH Değeri:** ${specs.ph || "Belirtilmemiş"}
- **Form:** ${specs.form || "Belirtilmemiş"}
`,
        agriculturalTool: `
${specs.general?.model || "Bu ürün"}, profesyonel tarım ekipmanları serisinden
${specs.general?.category || "belirtilmemiş"} kategorisinde yer almaktadır.

#### Teknik Özellikler
- **Motor Gücü:** ${formatPower(specs.technical?.engine?.power) || "Belirtilmemiş"}
- **Boyutlar:** ${formatDimensions(specs.general?.dimensions) || "Belirtilmemiş"}
- **Ağırlık:** ${specs.general?.weight || "Belirtilmemiş"}

#### Garanti ve Servis
- **Garanti Süresi:** ${formatWarranty(specs.general?.warranty) || "Belirtilmemiş"}
- **Servis Ağı:** ${specs.maintenance?.serviceInfo?.available ? "Mevcut" : "Belirtilmemiş"}
- **Bakım Periyodu:** ${specs.maintenance?.period || "Belirtilmemiş"}
`
      };
      return descriptions[type] || "";
    };

    const getHighlights = (type, specs) => {
      const highlights = {
        seed: [
          specs.germinationRate && `- **${specs.germinationRate}%** çimlenme oranı`,
          specs.growthPeriod && `- **${specs.growthPeriod}** büyüme süresi`,
          specs.season && `- **${specs.season}** ekimi için ideal`,
        ],
        seedling: [
          specs.variety && `- **${specs.variety}** türünde özel üretim`,
          specs.planting?.soil && `- **${specs.planting.soil}** toprak yapısında optimum gelişim`,
          specs.planting?.season && `- **${specs.planting.season}** dikimi için ideal`,
        ],
        fertilizer: [
          specs.composition && `- **${specs.composition}** içerikli formül`,
          specs.usage?.dosage && `- **${specs.usage.dosage}** kullanım dozajı`,
          specs.applicationMethod && `- **${specs.applicationMethod}** uygulama yöntemi`,
        ],
        agriculturalTool: [
          specs.general?.model && `- **${specs.general.model}** profesyonel model`,
          specs.technical?.engine?.power && `- **${formatPower(specs.technical.engine.power)}** güç kapasitesi`,
          specs.general?.warranty && `- **${formatWarranty(specs.general.warranty)}** garanti`,
        ],
      };

      const filteredHighlights = (highlights[type] || [])
        .filter(Boolean)
        .join('\n');

      return filteredHighlights || '- Öne çıkan özellikler belirtilmemiş';
    };

    const getUsageRecommendations = (type, specs) => {
      const recommendations = {
        seed: [
          `- **Ekim Derinliği:** ${specs.plantingDepth || "Belirtilmemiş"}`,
          `- **Sıra Arası Mesafe:** ${specs.sowingDistance || "Belirtilmemiş"}`,
          `- **En Uygun Ekim Mevsimi:** ${specs.season || "Belirtilmemiş"}`,
        ],
        seedling: [
          `- **Dikim Aralığı:** ${specs.planting?.spacing || "Belirtilmemiş"}`,
          `- **Toprak Tipi:** ${specs.planting?.soil || "Belirtilmemiş"}`,
          `- **Dikim Mevsimi:** ${specs.planting?.season || "Belirtilmemiş"}`,
        ],
        fertilizer: [
          `- **Uygulama Sıklığı:** ${specs.usage?.frequency || "Belirtilmemiş"}`,
          `- **Önerilen Dozaj:** ${specs.usage?.dosage || "Belirtilmemiş"}`,
          `- **Uygulama Yöntemi:** ${specs.applicationMethod || "Belirtilmemiş"}`,
        ],
        agriculturalTool: [
          `- **Kullanım Öncesi:** Güvenlik talimatlarını okuyunuz`,
          `- **Periyodik Bakım:** ${specs.maintenance?.period || "Üretici talimatlarına göre"}`,
          `- **Garanti Kapsamı:** ${formatWarranty(specs.general?.warranty) || "Belirtilmemiş"}`,
        ],
      };

      return recommendations[type]?.join('\n') || '- Kullanım önerileri belirtilmemiş';
    };

    // Intersection Observer kurulumu
    onMounted(() => {
      observer.value = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('fade-in');
            }
          });
        },
        { threshold: 0.1 }
      );

      // Seksiyon elementlerini gözlemle
      sectionRefs.value.forEach((el) => {
        if (el) observer.value.observe(el);
      });
    });

    // Cleanup
    onUnmounted(() => {
      if (observer.value) {
        observer.value.disconnect();
      }
    });

    return {
      selectedTab,
      isTabChanging,
      tabs,
      currentSpecSections,
      enrichedDescription,
      formatValue,
      isHighlightedValue,
      handleTabChange,
      sectionRefs
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
}

:deep(.prose p) {
  margin-top: 1em;
  margin-bottom: 1em;
  line-height: 1.75;
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
}

:deep(.prose h4) {
  color: #2F5E32;
  font-weight: 600;
  margin-top: 1.5em;
  margin-bottom: 0.75em;
  font-size: 1.1em;
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
}

:deep(.prose li::before) {
  content: "•";
  color: #2F5E32;
  font-weight: bold;
  position: absolute;
  left: 0;
}

/* Tooltip Animation */
@keyframes tooltipFade {
  from {
    opacity: 0;
    transform: translate(-50%, 0.5rem);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

[class*="group-hover\:"] .tooltip {
  animation: tooltipFade 0.2s ease-out forwards;
}

/* Fade In Animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}

/* Loading Placeholder Animation */
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.loading-placeholder {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
</style>