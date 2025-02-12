// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useUserStore } from '@/stores/userStore'

// Eager loading components
import DashboardPage from '@/views/user/dashboardPage.vue'
import LoginPage from '@/views/user/loginPage.vue'
import RegisterPage from '@/views/user/registerPage.vue'
import HomePage from '@/views/user/homepage.vue'
import AboutView from '@/views/AboutView.vue'
import ReturnPolicyContract from '@/components/contracts/ReturnPolicyContract.vue'
import PrivacyPolicyContract from '@/components/contracts/PrivacyPolicyContract.vue'

// Lazy loading for admin pages and cart
const AdminDashboard = () => import('@/views/admin/AdminDashboard.vue')
const CreateCategory = () => import('@/views/admin/createCategory.vue')
const ProductManagement = () => import('@/views/admin/ProductManagement.vue')
const ProductDetailView = () => import('@/views/admin/ProductDetailView.vue')
const ProductForm = () => import('@/components/admin/ProductForm.vue')
const StockManagementView = () => import('@/views/admin/StockManagementView.vue')
const AdminOrdersDashboard = () => import('@/views/admin/AdminOrdersDashboard.vue')
const AdminOrderDetail = () => import('@/components/admin/orders/AdminOrderDetail.vue')
const UserManagement = () => import('@/views/admin/UserManagement.vue')
const ProductDetail = () => import('@/views/user/ProductPage.vue')
const CartPage = () => import('@/views/user/cart.vue')
const AddressPage = () => import('@/views/user/address.vue')
const PaymentView = () => import('@/views/payment/PaymentView.vue')
const PaymentSuccess = () => import('@/views/payment/PaymentSuccess.vue')
const OrdersView = () => import('@/views/user/OrdersView.vue')
const ContactView = () => import('@/views/user/ContactView.vue')

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomePage,
    meta: {
      title: 'Ana Sayfa',
      description: 'Profesyonel sera ve tarım üretimi için kaliteli tohumlar. En iyi tohum çeşitleri, uygun fiyatlar ve ücretsiz kargo avantajıyla sizlerle.'
    }
  },
  {
    path: '/gizlilik-politikasi',
    name: 'privacy-policy',
    component: PrivacyPolicyContract,
    meta: {
      title: 'Gizlilik Politikası ve KVKK',
      description: 'Kişisel verilerin korunması, gizlilik politikası ve KVKK kapsamında haklarınız. Verilerinizin nasıl işlendiği, korunduğu ve haklarınız hakkında detaylı bilgi.',
      keywords: 'gizlilik politikası, KVKK, kişisel veriler, veri güvenliği, veri işleme, veri koruma'
    }
  },
  {
    path: '/iade-ve-iptal-kosullari',
    name: 'return-policy',
    component: ReturnPolicyContract,
    meta: {
      title: 'İade ve İptal Koşulları',
      description: 'Ürün iade ve iptal koşulları, cayma hakkı ve müşteri hakları hakkında detaylı bilgi. 14 gün içinde koşulsuz iade garantisi.',
      keywords: 'iade koşulları, iptal şartları, cayma hakkı, müşteri hakları, ürün iade'
    }
  },
  {
    path: '/hakkimizda',
    name: 'about',
    component: AboutView,
    meta: {
      title: 'Hakkımızda',
      description: 'Türkiye\'nin güvenilir tohum tedarikçisi. Kaliteli ürünler, profesyonel hizmet ve uzman kadromuzla çiftçilerimizin yanındayız.'
    }
  },
  {
    path: '/sepet',
    name: 'cart',
    component: CartPage,
    meta: {
      requiresAuth: true,
      title: 'Sepetim',
      description: 'Alışveriş sepetiniz. Seçtiğiniz kaliteli tohumları inceleyin, güvenli ödeme seçenekleriyle siparişinizi tamamlayın.'
    }
  },
  {
    path: '/adres',
    name: 'address',
    component: AddressPage,
    meta: {
      requiresAuth: true,
      title: 'Teslimat Adresi'
    }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardPage,
    meta: {
      requiresAuth: true,
      title: 'Dashboard'
    }
  },
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
    meta: {
      guestOnly: true,
      title: 'Giriş Yap'
    }
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterPage,
    meta: {
      guestOnly: true,
      title: 'Kayıt Ol'
    }
  },
  {
    path: '/urun/:slug',
    name: 'product-detail',
    component: ProductDetail,
    props: true,
    meta: {
      title: route => `${route.params.slug} | Ürün Detayı`,
      description: route => `${route.params.slug} ürününün detaylı bilgileri ve özellikleri`
    }
  },
  {
    path: '/kategori/:path(.*)*',
    name: 'category-detail',
    component: () => import('@/views/user/subCategories.vue'),
    props: route => ({
      path: route.params.path ?
        (Array.isArray(route.params.path) ?
          route.params.path :
          route.params.path.split('/'))
        : []
    })
  },
  {
    path: '/admin',
    name: 'admin-dashboard',
    component: AdminDashboard,
    meta: {
      requiresAuth: true,
      requiresAdmin: true,
      title: 'Admin Panel',
      description: 'Yönetici kontrol paneli. Ürün yönetimi, stok kontrolü, sipariş takibi ve kullanıcı yönetimi.'
    }
  },
  {
    path: '/admin/category',
    name: 'create-category',
    component: CreateCategory,
    meta: {
      requiresAuth: true,
      requiresAdmin: true,
      title: 'Kategori Oluştur',
      description: 'Yeni kategori oluşturma ve düzenleme paneli. Kategori hiyerarşisi ve ürün organizasyonu yönetimi.'
    }
  },
  {
    path: '/admin/product',
    name: 'admin-product',
    component: ProductManagement,
    meta: {
      requiresAuth: true,
      requiresAdmin: true,
      title: 'Ürünleri Yönet',
      description: 'Ürün yönetim paneli. Yeni ürün ekleme, düzenleme, stok yönetimi ve ürün detayları.'
    }
  },
  {
    path: '/admin/product/new',
    name: 'product-new',
    component: ProductForm,
    meta: {
      requiresAuth: true,
      requiresAdmin: true,
      title: 'Yeni Ürün Ekle'
    }
  },
  {
    path: '/admin/product/:id',
    component: ProductDetailView,
    meta: {
      requiresAuth: true,
      requiresAdmin: true,
      title: route => `Ürün #${route.params.id}`
    },
    children: [
      {
        path: 'edit',
        name: 'product-edit',
        component: ProductForm,
        props: true,
        meta: {
          title: route => `Ürün Düzenle #${route.params.id}`
        }
      },
      {
        path: 'stock',
        name: 'product-stock',
        component: StockManagementView,
        props: true,
        meta: {
          title: route => `Stok Yönetimi #${route.params.id}`
        }
      }
    ]
  },
  {
    path: '/admin/orders',
    name: 'admin-orders',
    component: AdminOrdersDashboard,
    meta: {
      requiresAuth: true,
      requiresAdmin: true,
      title: 'Siparişleri Yönet',
      description: 'Sipariş yönetim paneli. Sipariş takibi, durum güncellemesi ve müşteri siparişlerinin yönetimi.'
    }
  },
  {
    path: '/admin/orders/:orderId',
    name: 'admin-order-detail',
    component: AdminOrderDetail,
    props: true,
    meta: {
      requiresAuth: true,
      requiresAdmin: true,
      title: route => `Sipariş Detayı #${route.params.orderId}`
    }
  },
  {
    path: '/admin/users',
    name: 'admin-users',
    component: UserManagement,
    meta: {
      requiresAuth: true,
      requiresAdmin: true,
      title: 'Kullanıcı Yönetimi',
      description: 'Kullanıcı yönetim paneli. Müşteri hesapları, yetkiler ve kullanıcı bilgilerinin yönetimi.'
    }
  },
  {
    path: '/odeme',
    name: 'payment',
    component: PaymentView,
    meta: {
      requiresAuth: true,
      title: 'Ödeme',
      description: 'Güvenli ödeme sayfası. Kredi kartı, havale/EFT ve diğer ödeme seçenekleriyle güvenle alışverişinizi tamamlayın.',
      requiresCart: true
    }
  },
  {
    path: '/payment/success',
    name: 'payment-success',
    component: PaymentSuccess,
    meta: {
      requiresAuth: true,
      title: 'Ödeme Başarılı',
      description: 'Siparişiniz başarıyla tamamlandı. Sipariş detaylarınızı görüntüleyin ve kargo takibini başlatın.'
    }
  },
  {
    path: '/siparislerim',
    name: 'orders',
    component: OrdersView,
    meta: {
      requiresAuth: true,
      title: 'Siparişlerim',
      description: 'Tüm siparişlerinizi takip edin. Sipariş durumu, kargo takibi ve geçmiş siparişlerinize kolayca ulaşın.'
    }
  },
  {
    path: '/iletisim',
    name: 'contact',
    component: ContactView,
    meta: {
      title: 'İletişim',
      description: '7/24 müşteri hizmetleri, teknik destek ve satış ekibimizle yanınızdayız. Adres bilgilerimiz ve iletişim kanallarımız için tıklayın.'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: { name: 'home' }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Auth check fonksiyonu
const checkAuth = async (authStore) => {
  if (!authStore.initialCheckDone && !authStore.loading) {
    try {
      await authStore.checkAuth();
      return authStore.isAuthenticated;
    } catch (error) {
      console.error('Auth check failed:', error);
      return false;
    }
  }
  return authStore.isAuthenticated;
};

// Navigation Guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const userStore = useUserStore();

  document.title = to.meta.title
    ? `${to.meta.title} | E-Ticaret`
    : 'E-Ticaret';

  try {
    const isAuthenticated = await checkAuth(authStore);

    if (to.matched.some(record => record.meta.requiresAdmin)) {
      if (!isAuthenticated || userStore.role !== 'admin') {
        return next({
          name: 'home',
          query: {
            error: 'unauthorized',
            message: 'Bu sayfaya erişim yetkiniz bulunmamaktadır.'
          }
        });
      }
    }

    if (to.matched.some(record => record.meta.requiresAuth)) {
      if (!isAuthenticated) {
        return next({
          name: 'login',
          query: {
            redirect: to.fullPath,
            message: 'Bu sayfaya erişmek için giriş yapmalısınız.'
          }
        });
      }
    }

    if (to.matched.some(record => record.meta.guestOnly)) {
      if (isAuthenticated) {
        return next({ name: 'home' });
      }
    }

    return next();
  } catch (error) {
    console.error('Navigation guard error:', error);

    if (to.name !== 'login') {
      return next({
        name: 'login',
        query: {
          error: 'auth_error',
          message: 'Oturum doğrulama hatası, lütfen tekrar giriş yapın.',
          redirect: to.fullPath
        }
      });
    }

    return next();
  }
});

router.afterEach((to) => {
  if (to.query.error && to.query.message) {
    console.log('Router Error:', to.query.message);
  }
});

export default router;