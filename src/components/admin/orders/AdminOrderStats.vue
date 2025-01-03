<template>
  <div class="space-y-6">
    <!-- Ana İstatistikler -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div
        v-for="stat in mainStats"
        :key="stat.name"
        class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
      >
        <div class="flex items-center">
          <div
            class="w-12 h-12 rounded-lg flex items-center justify-center"
            :class="stat.iconBg"
          >
            <component
              :is="stat.icon"
              class="w-6 h-6"
              :class="stat.iconColor"
            />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">{{ stat.name }}</p>
            <div class="flex items-center">
              <p class="text-2xl font-semibold text-gray-900">
                {{ stat.value }}
              </p>
              <span
                v-if="stat.change"
                class="ml-2 text-sm font-medium"
                :class="stat.change > 0 ? 'text-green-600' : 'text-red-600'"
              >
                {{ stat.change > 0 ? '+' : '' }}{{ stat.change }}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Grafik ve Analiz Bölümü -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Satış Grafiği -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-medium text-gray-900">Satış Grafiği</h3>
          <select
            v-model="selectedPeriod"
            class="text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            @change="updateChartData"
          >
            <option value="daily">Günlük</option>
            <option value="weekly">Haftalık</option>
            <option value="monthly">Aylık</option>
          </select>
        </div>
        <div class="h-80">
          <LineChart
            :chart-data="chartData"
            :options="chartOptions"
          />
        </div>
      </div>

      <!-- Kategori Dağılımı -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-6">Kategori Dağılımı</h3>
        <div class="h-80">
          <DoughnutChart
            :chart-data="categoryData"
            :options="doughnutOptions"
          />
        </div>
      </div>

      <!-- En Çok Satan Ürünler -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-6">En Çok Satan Ürünler</h3>
        <div class="space-y-4">
          <div
            v-for="product in topProducts"
            :key="product.id"
            class="flex items-center"
          >
            <img
              :src="product.image"
              :alt="product.name"
              class="w-12 h-12 rounded-lg object-cover"
            />
            <div class="ml-4 flex-1">
              <p class="text-sm font-medium text-gray-900">{{ product.name }}</p>
              <p class="text-sm text-gray-500">{{ product.category }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm font-medium text-gray-900">
                {{ formatPrice(product.totalSales) }}
              </p>
              <p class="text-sm text-gray-500">{{ product.quantity }} adet</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Bölgesel Satışlar -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-6">Bölgesel Satışlar</h3>
        <div class="space-y-4">
          <div
            v-for="region in regionalSales"
            :key="region.city"
            class="flex items-center"
          >
            <div class="flex-1">
              <div class="flex items-center">
                <span class="text-sm font-medium text-gray-900">
                  {{ region.city }}
                </span>
                <span
                  class="ml-2 text-xs font-medium"
                  :class="region.growth > 0 ? 'text-green-600' : 'text-red-600'"
                >
                  {{ region.growth > 0 ? '+' : '' }}{{ region.growth }}%
                </span>
              </div>
              <div class="mt-1 flex items-center">
                <div class="flex-1">
                  <div class="h-2 bg-gray-100 rounded-full">
                    <div
                      class="h-2 bg-primary-500 rounded-full"
                      :style="{ width: `${region.percentage}%` }"
                    ></div>
                  </div>
                </div>
                <span class="ml-2 text-sm text-gray-500">
                  {{ region.percentage }}%
                </span>
              </div>
            </div>
            <div class="ml-4 text-right">
              <p class="text-sm font-medium text-gray-900">
                {{ formatPrice(region.sales) }}
              </p>
              <p class="text-sm text-gray-500">{{ region.orders }} sipariş</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  ShoppingBag,
  TrendingUp,
  Users,
  CreditCard
} from 'lucide-vue-next'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js'
import { Line as LineChart, Doughnut as DoughnutChart } from 'vue-chartjs'
import { useOrderStore } from '@/stores/orderStore'
import { storeToRefs } from 'pinia'

// Chart.js kayıt
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

// Store
const orderStore = useOrderStore()
const { adminStats } = storeToRefs(orderStore)

// Local state
const selectedPeriod = ref('daily')

// Ana istatistikler
const mainStats = computed(() => [
  {
    name: 'Toplam Satış',
    value: formatPrice(adminStats.value.totalSales),
    change: 12.5,
    icon: ShoppingBag,
    iconBg: 'bg-primary-100',
    iconColor: 'text-primary-600'
  },
  {
    name: 'Sipariş Sayısı',
    value: adminStats.value.totalOrders,
    change: 8.2,
    icon: TrendingUp,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600'
  },
  {
    name: 'Aktif Müşteriler',
    value: adminStats.value.activeCustomers,
    change: -2.4,
    icon: Users,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600'
  },
  {
    name: 'Ortalama Sepet',
    value: formatPrice(adminStats.value.averageOrderValue),
    change: 4.3,
    icon: CreditCard,
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-600'
  }
])

// Grafik verileri
const chartData = computed(() => ({
  labels: adminStats.value.salesChart?.labels || [],
  datasets: [
    {
      label: 'Satışlar',
      data: adminStats.value.salesChart?.data || [],
      borderColor: '#16a34a',
      backgroundColor: 'rgba(22, 163, 74, 0.1)',
      tension: 0.4,
      fill: true
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        display: true,
        color: 'rgba(0, 0, 0, 0.05)'
      }
    },
    x: {
      grid: {
        display: false
      }
    }
  }
}

// Kategori verileri
const categoryData = computed(() => ({
  labels: adminStats.value.categoryDistribution?.map(c => c.name) || [],
  datasets: [
    {
      data: adminStats.value.categoryDistribution?.map(c => c.value) || [],
      backgroundColor: [
        '#16a34a',
        '#2563eb',
        '#d97706',
        '#dc2626',
        '#7c3aed',
        '#db2777'
      ]
    }
  ]
}))

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom'
    }
  }
}

// En çok satan ürünler
const topProducts = computed(() => adminStats.value.topProducts || [])

// Bölgesel satışlar
const regionalSales = computed(() => adminStats.value.regionalSales || [])

// Methods
const updateChartData = () => {
  orderStore.fetchOrderStats({ period: selectedPeriod.value })
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(price)
}

// Lifecycle
onMounted(() => {
  updateChartData()
})
</script>
