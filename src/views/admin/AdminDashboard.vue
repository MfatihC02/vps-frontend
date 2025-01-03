<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Sidebar -->
    <aside
      @mouseenter="expandSidebar"
      @mouseleave="collapseSidebar"
      :class="[
        'fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-in-out',
        isSidebarExpanded ? 'w-64' : 'w-20',
        'bg-white border-r border-gray-200 overflow-hidden'
      ]"
    >
      <div class="flex h-16 items-center px-4 border-b">
        <h1 
          class="text-xl font-semibold text-gray-800 whitespace-nowrap transition-opacity duration-300"
          :class="isSidebarExpanded ? 'opacity-100' : 'opacity-0'"
        >
          Admin Panel
        </h1>
        <div 
          class="flex justify-center items-center w-full transition-opacity duration-300"
          :class="isSidebarExpanded ? 'opacity-0' : 'opacity-100'"
        >
          <Settings class="h-6 w-6 text-gray-500" />
        </div>
      </div>
      <nav class="p-4 space-y-2">
        <router-link
          v-for="(item, index) in menuItems"
          :key="index"
          :to="item.path"
          class="flex items-center p-3 rounded-lg hover:bg-gray-100 text-gray-700 group"
          :class="{ 'bg-gray-100': $route.path === item.path }"
        >
          <component :is="item.icon" class="h-5 w-5 flex-shrink-0" />
          <span 
            class="ml-3 whitespace-nowrap transition-all duration-300"
            :class="isSidebarExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'"
          >
            {{ item.name }}
          </span>
          <span
            v-if="item.badge"
            class="ml-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 transition-all duration-300"
            :class="isSidebarExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'"
          >
            {{ item.badge }}
          </span>
        </router-link>
      </nav>
    </aside>

    <!-- Main Content -->
    <div 
      :class="[
        'transition-all duration-300',
        'min-h-screen',
        'pl-20 lg:pl-20', 
        isSidebarExpanded ? 'lg:pl-64' : 'lg:pl-20', 
      ]"
    >
      <!-- Top Bar -->
      <header class="bg-white border-b border-gray-200 fixed top-0 right-0 left-0 z-30"
        :class="[
          'transition-all duration-300',
          'pl-20 lg:pl-20', 
          isSidebarExpanded ? 'lg:pl-64' : 'lg:pl-20', 
        ]"
      >
        <div class="flex h-16 items-center justify-between px-4">
          <div class="flex items-center gap-4">
            <button class="lg:hidden" @click="toggleSidebar">
              <Menu class="h-6 w-6 text-gray-500" />
            </button>
            <h2 class="text-xl font-semibold text-gray-800">Dashboard</h2>
          </div>
          <div class="flex items-center gap-4">
            <button class="relative">
              <Bell class="h-6 w-6 text-gray-500" />
              <span class="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                {{ notifications }}
              </span>
            </button>
            <button>
              <User class="h-6 w-6 text-gray-500" />
            </button>
          </div>
        </div>
      </header>

      <!-- Dashboard Content -->
      <div class="p-4 mt-16"> 
        <!-- İstatistik Kartları -->
        <div class="grid gap-4 md:grid-cols-4 mb-6">
          <div v-for="(stat, index) in stats" :key="index" class="bg-white p-6 rounded-lg shadow">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">{{ stat.title }}</p>
                <p class="text-2xl font-semibold text-gray-900">{{ stat.value }}</p>
                <p class="text-sm text-gray-600">
                  <span :class="stat.trend >= 0 ? 'text-green-600' : 'text-red-600'">
                    {{ stat.trend >= 0 ? '+' : '' }}{{ stat.trend }}%
                  </span>
                  <span class="text-gray-600 ml-1">vs geçen ay</span>
                </p>
              </div>
              <div :class="`p-3 rounded-full ${stat.iconBg}`">
                <component :is="stat.icon" class="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <!-- Kritik Stok Seviyeleri -->
        <div class="bg-white rounded-lg shadow mb-6">
          <div class="p-4 border-b">
            <h2 class="text-lg font-semibold text-gray-800">Kritik Stok Seviyeleri</h2>
            <p class="text-sm text-gray-600">Stok seviyesi düşük olan ürünler</p>
          </div>
          <div class="p-4">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ürün</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mevcut Stok</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kritik Seviye</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="stock in lowStockProducts" :key="stock.product._id">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                          <img 
                            :src="stock.product.images[0]" 
                            :alt="stock.product.name"
                            class="h-10 w-10 rounded-full object-cover"
                          >
                        </div>
                        <div class="ml-4">
                          <div class="text-sm font-medium text-gray-900">{{ stock.product.name }}</div>
                          <div class="text-sm text-gray-500">{{ stock.product.sku }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900">{{ stock.quantity }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900">{{ stock.lowStockThreshold }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span 
                        class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                        :class="{
                          'bg-red-100 text-red-800': stock.quantity === 0,
                          'bg-yellow-100 text-yellow-800': stock.quantity > 0 && stock.quantity <= stock.lowStockThreshold
                        }"
                      >
                        {{ stock.quantity === 0 ? 'Stokta Yok' : 'Kritik Seviye' }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Son Siparişler -->
        <div class="bg-white rounded-lg shadow">
          <div class="p-4 border-b">
            <h2 class="text-lg font-semibold text-gray-800">Son Siparişler</h2>
            <p class="text-sm text-gray-600">Son 24 saat içinde gelen siparişler</p>
          </div>
          <div class="p-4">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sipariş No</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Müşteri</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ürünler</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tutar</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <template v-if="isOrdersLoading">
                    <tr v-for="i in 3" :key="i">
                      <td colspan="6" class="px-6 py-4 whitespace-nowrap">
                        <div class="animate-pulse flex space-x-4">
                          <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                      </td>
                    </tr>
                  </template>
                  <template v-else>
                    <tr v-for="order in recentOrders" :key="order.id">
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">#{{ order.id }}</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">{{ order.customer }}</div>
                      </td>
                      <td class="px-6 py-4">
                        <div class="text-sm text-gray-900">
                          <div v-for="item in order.items" :key="item.name" class="mb-1">
                            {{ item.name }} ({{ item.quantity }})
                          </div>
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">{{ order.date }}</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">{{ order.amount }}</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                          :class="{
                            'bg-green-100 text-green-800': order.status === 'COMPLETED',
                            'bg-yellow-100 text-yellow-800': ['PROCESSING', 'PENDING'].includes(order.status),
                            'bg-red-100 text-red-800': order.status === 'CANCELLED'
                          }">
                          {{ order.status }}
                        </span>
                      </td>
                    </tr>
                  </template>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, computed } from "vue";
import { useOrderStore } from '@/stores/orderStore';
import { useProductStore } from '@/stores/productStore';
import { useStockStore } from '@/stores/stockStore';
import {
  Home,
  Users,
  FolderTree,
  Settings,
  Bell,
  User,
  Menu,
  X,
  TrendingUp,
  Users2,
  ShoppingCart,
  DollarSign,
  BarChart3,
  PieChart,
  Package,
  Archive,
  ClipboardList
} from "lucide-vue-next";

const orderStore = useOrderStore();
const productStore = useProductStore();
const stockStore = useStockStore();

const notifications = ref(3);
const isLoading = ref(true);
const stats = ref([]);
const recentOrders = ref([]);
const isOrdersLoading = ref(false);
const isSidebarExpanded = ref(false);

// Kritik stok seviyesindeki ürünleri al
const lowStockProducts = computed(() => stockStore.getLowStockProducts);

// Sidebar kontrolleri
const expandSidebar = () => {
  isSidebarExpanded.value = true;
};

const collapseSidebar = () => {
  isSidebarExpanded.value = false;
};

// İstatistikleri yükle
const loadDashboardStats = async () => {
  try {
    isLoading.value = true;
    const response = await orderStore.fetchOrderStats();
    console.log('API Response:', response);
    
    const statsData = response.data;
    console.log('Stats Data:', statsData);

    // Para birimi formatı
    const formatCurrency = (num) => {
      return `₺${Number(num || 0).toLocaleString('tr-TR')}`;
    };

    // Durum bazlı sipariş sayılarını hesapla
    const activeStatuses = ['PROCESSING', 'PENDING_PAYMENT', 'PAYMENT_COMPLETED'];
    
    const activeOrdersData = statsData.statusBreakdown
      .filter(item => activeStatuses.includes(item._id));
    
    const activeOrders = activeOrdersData
      .reduce((sum, item) => sum + (Number(item.count) || 0), 0);
    
    const processingAmount = activeOrdersData
      .reduce((sum, item) => sum + (Number(item.totalAmount) || 0), 0);

    console.log('Calculated Values:', {
      totalOrders: statsData.totalOrders,
      activeOrders,
      processingAmount,
      totalRevenue: statsData.totalRevenue
    });

    stats.value = [
      {
        title: "Toplam Sipariş",
        value: Number(statsData.totalOrders || 0).toLocaleString('tr-TR'),
        icon: ShoppingCart,
        trend: 'up'
      },
      {
        title: "Aktif Siparişler",
        value: Number(activeOrders).toLocaleString('tr-TR'),
        icon: TrendingUp,
        trend: 'up'
      },
      {
        title: "İşlemdeki Tutar",
        value: formatCurrency(processingAmount),
        icon: Package,
        trend: 'up'
      },
      {
        title: "Toplam Gelir",
        value: formatCurrency(statsData.totalRevenue),
        icon: DollarSign,
        trend: 'up'
      }
    ];

    console.log('Final Stats:', JSON.parse(JSON.stringify(stats.value)));
  } catch (error) {
    console.error('İstatistikler yüklenirken hata:', error);
    stats.value = [
      {
        title: "Toplam Sipariş",
        value: "0",
        change: "0",
        icon: ShoppingCart,
        trend: 'up'
      },
      {
        title: "Aktif Siparişler",
        value: "0",
        change: "0",
        icon: TrendingUp,
        trend: 'up'
      },
      {
        title: "İşlemdeki Tutar",
        value: "₺0",
        change: "0",
        icon: Package,
        trend: 'up'
      },
      {
        title: "Toplam Gelir",
        value: "₺0",
        change: "0",
        icon: DollarSign,
        trend: 'up'
      }
    ];
  } finally {
    isLoading.value = false;
  }
};

// Son siparişleri yükle
const loadRecentOrders = async () => {
  try {
    isOrdersLoading.value = true;
    
    // Store'da filtreleri ayarla
    orderStore.filters.sortBy = 'createdAt';
    orderStore.filters.sortOrder = 'desc';
    orderStore.pagination.limit = 5;
    orderStore.pagination.page = 1;
    
    // Siparişleri getir
    await orderStore.fetchAllOrders();
    const orders = orderStore.orders || [];
    console.log('Orders from store:', orders);
    
    if (!orders.length) {
      console.warn('Sipariş verisi bulunamadı');
      return;
    }

    // Siparişleri formatlayarak state'e kaydet
    recentOrders.value = orders.map(order => {
      console.log('İşlenen sipariş:', order);
      
      const formattedOrder = {
        id: order.orderNumber,
        customer: order.user?.email || 'Misafir',
        date: new Date(order.createdAt).toLocaleDateString('tr-TR', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        amount: new Intl.NumberFormat('tr-TR', {
          style: 'currency',
          currency: 'TRY'
        }).format(order.totalAmount),
        status: order.status,
        items: order.items.map(item => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.price
        }))
      };

      console.log('Formatlanmış sipariş:', formattedOrder);
      return formattedOrder;
    });

    console.log('Final recentOrders:', recentOrders.value);
  } catch (error) {
    console.error('Son siparişler yüklenirken hata:', error);
    recentOrders.value = [];
  } finally {
    isOrdersLoading.value = false;
  }
};

// Sipariş durumlarını Türkçe'ye çevir
const mapOrderStatus = (status) => {
  const statusMap = {
    'CREATED': 'Oluşturuldu',
    'PENDING_PAYMENT': 'Ödeme Bekliyor',
    'PAYMENT_COMPLETED': 'Ödeme Tamamlandı',
    'PROCESSING': 'İşleniyor',
    'SHIPPED': 'Kargoya Verildi',
    'DELIVERED': 'Teslim Edildi',
    'CANCELLED': 'İptal Edildi',
    'FAILED': 'Başarısız'
  };
  return statusMap[status] || status;
};

// Sayfa yüklendiğinde verileri getir
onMounted(() => {
  loadDashboardStats();
  loadRecentOrders();
});

// Menü öğeleri
const menuItems = ref([
  { 
    name: 'Dashboard', 
    icon: Home, 
    path: '/admin',
    badge: null
  },
  { 
    name: 'Kullanıcılar', 
    icon: Users, 
    path: '/admin/users',
    badge: null
  },
  { 
    name: 'Ürünler', 
    icon: Package, 
    path: '/admin/product',
    badge: null
  },
  { 
    name: 'Kategoriler', 
    icon: FolderTree, 
    path: '/admin/category',
    badge: null
  },
  { 
    name: 'Siparişler', 
    icon: ClipboardList, 
    path: '/admin/orders',
    badge: null
  },
]);

const toggleSidebar = () => {
  isSidebarExpanded.value = !isSidebarExpanded.value;
};
</script>
