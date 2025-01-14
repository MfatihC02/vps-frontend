// main.js
import { createApp } from 'vue'
import { createHead } from '@vueuse/head'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import Toast from 'vue-toastification'
import "vue-toastification/dist/index.css"
import '@/assets/style.css'
import socketPlugin, { socketManager } from '@/plugins/socket'
import { useAuthStore } from '@/stores/authStore'
import Vuelidate from '@vuelidate/core'
import { Icon } from '@iconify/vue'

const app = createApp(App)
const head = createHead()

const pinia = createPinia()

// Toast options
const toastOptions = {
    position: "top-right",
    timeout: 3000,
    closeOnClick: true,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
    draggable: true,
    draggablePercent: 0.6,
    showCloseButtonOnHover: false,
    hideProgressBar: false,
    closeButton: "button",
    icon: true,
    rtl: false
}

app.use(pinia)
app.use(router)
app.use(socketPlugin)
app.use(Toast, toastOptions)
app.use(head)  
app.use(Vuelidate)
app.component('Icon', Icon)

// Pinia store'u başlattıktan sonra auth store'a erişim sağla
const authStore = useAuthStore()

// Eğer token varsa socket bağlantısını başlat
if (authStore.token) {
    socketManager.connect(authStore.token)
}

app.mount('#app')