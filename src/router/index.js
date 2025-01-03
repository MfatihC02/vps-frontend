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
    meta: { title: 'Ana Sayfa' }
  },
  {
    path: '/hakkimizda',
    name: 'about',
    component: AboutView,
    meta: { title: 'Hakkımızda' }
  },
  {
    path: '/sepet',
    name: 'cart',
    component: CartPage,
    meta: {
      requiresAuth: true,  // Sadece giriş yapmış kullanıcılar erişebilir
      title: 'Sepetim'
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
      title: 'Admin Panel'
    }
  },
  {
    path: '/admin/category',
    name: 'create-category',
    component: CreateCategory,
    meta: {
      requiresAuth: true,
      requiresAdmin: true,
      title: 'Kategori Oluştur'
    }
  },
  {
    path: '/admin/product',
    name: 'admin-product',
    component: ProductManagement,
    meta: {
      requiresAuth: true,
      requiresAdmin: true,
      title: 'Ürünleri Yönet'
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
      title: 'Siparişleri Yönet'
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
      title: 'Kullanıcı Yönetimi'
    }
  },
  {
    path: '/odeme',
    name: 'payment',
    component: PaymentView,
    meta: {
      requiresAuth: true,
      title: 'Ödeme',
      requiresCart: true // Sepet kontrolü için yeni meta field
    }
  },
  {
    path: '/payment/success',
    name: 'payment-success',
    component: PaymentSuccess,
    meta: {
      requiresAuth: true,
      title: 'Ödeme Başarılı'
    },
    // Form verilerini props olarak geçir
    props: route => ({
      orderId: route.query.orderId,
      status: route.query.status,
      paymentId: route.query.paymentId
    })
  },
  {
    path: '/siparislerim',
    name: 'orders',
    component: OrdersView,
    meta: {
      requiresAuth: true,
      title: 'Siparişlerim'
    }
  },
  {
    path: '/iletisim',
    name: 'contact',
    component: ContactView,
    meta: {
      title: 'İletişim'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: { name: 'home' }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
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