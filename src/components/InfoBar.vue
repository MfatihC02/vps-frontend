<!-- components/layout/InfoBar.vue -->
<template>
  <div class="border-b bg-gradient-to-r from-emerald-50/50 to-white">
    <div class="container mx-auto py-4 lg:py-6 px-3 lg:px-4">
      <!-- Mobile Auto Sliding View -->
      <div class="block lg:hidden">
        <div class="relative h-[90px]">
          <TransitionGroup name="slide" tag="div" class="relative w-full h-full">
            <div
              v-for="item in visibleItems"
              :key="item.id"
              v-show="item.isActive"
              class="absolute inset-0 w-full h-full"
            >
              <div
                class="flex items-center h-full gap-3 group cursor-pointer bg-white/50 backdrop-blur-sm rounded-xl p-3 shadow-sm"
                @click="navigateToInfo(item.link)"
              >
                <div class="relative flex-none">
                  <div
                    class="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-emerald-50 to-green-50 group-hover:from-emerald-100 group-hover:to-green-100 transition-colors duration-300"
                  >
                    <component
                      :is="item.icon"
                      class="w-5 h-5 text-emerald-600 group-hover:text-emerald-700"
                    />
                  </div>
                </div>

                <div class="flex-1 min-w-0">
                  <p
                    class="font-medium text-gray-900 group-hover:text-emerald-700 text-sm truncate"
                  >
                    {{ item.title }}
                  </p>
                  <p class="text-xs text-gray-500 group-hover:text-gray-600 truncate">
                    {{ item.description }}
                  </p>
                </div>
              </div>
            </div>
          </TransitionGroup>
        </div>

        <!-- Slide Indicators -->
        <div class="flex justify-center gap-1.5 mt-2">
          <button
            v-for="(item, index) in infoItems"
            :key="item.id"
            class="w-1.5 h-1.5 rounded-full transition-all duration-300"
            :class="[
              currentIndex === index
                ? 'bg-emerald-500 w-3'
                : 'bg-emerald-200 hover:bg-emerald-300',
            ]"
            @click="setCurrentSlide(index)"
          />
        </div>
      </div>

      <!-- Desktop Grid View -->
      <div class="hidden lg:grid grid-cols-4 gap-6">
        <div
          v-for="item in infoItems"
          :key="item.id"
          class="flex items-center gap-4 group cursor-pointer transform transition-all duration-300 hover:-translate-y-0.5"
          @click="navigateToInfo(item.link)"
        >
          <div class="relative flex-none">
            <div
              class="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-emerald-50 to-green-50 group-hover:from-emerald-100 group-hover:to-green-100 transition-colors duration-300"
            >
              <component
                :is="item.icon"
                class="w-6 h-6 text-emerald-600 group-hover:text-emerald-700"
              />
            </div>
            <div
              class="absolute inset-0 bg-emerald-500 rounded-full opacity-0 group-hover:opacity-5 transition-opacity duration-300 animate-ping"
            ></div>
          </div>

          <div class="flex-1">
            <p
              class="font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors duration-300"
            >
              {{ item.title }}
            </p>
            <p
              class="text-sm text-gray-500 group-hover:text-gray-600 transition-colors duration-300"
            >
              {{ item.description }}
            </p>
          </div>

          <ChevronRight
            class="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import {
  Clock,
  ShieldCheck,
  ChevronRight,
  History,
  Shield,
} from "lucide-vue-next";

const infoItems = [
  {
    id: 1,
    icon: History,
    title: "70+ Yıllık Tecrübe",
    description: "Tarım sektöründe güvenilir hizmet",
    link: "/about-us",
  },
  {
    id: 2,
    icon: Clock,
    title: "Hızlı Teslimat",
    link: "/delivery-info",
  },
  {
    id: 3,
    icon: Shield,
    title: "Güvenli Alışveriş",
    description: "100% Güvenli Ödeme",
    link: "/security",
  },
  {
    id: 4,
    icon: ShieldCheck,
    title: "Kalite Garantisi",
    description: "Sertifikalı Ürünler",
    link: "/quality",
  },
];

const currentIndex = ref(0);
let autoSlideInterval = null;

const visibleItems = computed(() => {
  return infoItems.map((item, index) => ({
    ...item,
    isActive: index === currentIndex.value,
  }));
});

const setCurrentSlide = (index) => {
  currentIndex.value = index;
  resetAutoSlideTimer();
};

const nextSlide = () => {
  currentIndex.value = (currentIndex.value + 1) % infoItems.length;
};

const resetAutoSlideTimer = () => {
  if (autoSlideInterval) {
    clearInterval(autoSlideInterval);
  }
  autoSlideInterval = setInterval(nextSlide, 4000);
};

const navigateToInfo = (link) => {
  console.log(`Navigating to ${link}`);
};

onMounted(() => {
  resetAutoSlideTimer();
});

onBeforeUnmount(() => {
  if (autoSlideInterval) {
    clearInterval(autoSlideInterval);
  }
});
</script>

<style scoped>
.slide-move {
  transition: all 0.5s ease;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.5s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}

.slide-enter-from,
.slide-leave-to {
  position: absolute;
}
</style>