<template>
  <div class="min-h-screen bg-gray-50/30">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200/80">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-semibold text-gray-900">Kullanıcı Yönetimi</h1>
            <p class="mt-1 text-sm text-gray-500">Sistemdeki kullanıcıları yönetin ve rolleri düzenleyin</p>
          </div>
          <div class="flex items-center space-x-4">
            <div class="relative">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Kullanıcı ara..."
                class="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-64 text-sm"
              />
            </div>
            <button
              @click="refreshUsers"
              class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              :class="{ 'animate-spin': isRefreshing }"
            >
              <RefreshCw class="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading State -->
      <div v-if="userStore.loading" class="flex justify-center items-center min-h-[400px]">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="userStore.hasError" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex">
          <AlertCircle class="h-5 w-5 text-red-400" />
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Hata Oluştu</h3>
            <div class="mt-1 text-sm text-red-700">{{ userStore.error }}</div>
          </div>
        </div>
      </div>

      <!-- Users Table -->
      <div v-else class="bg-white rounded-lg shadow-sm border border-gray-200/80 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50/50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kullanıcı Adı
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  E-posta
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Son Giriş
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="user in filteredUsers" :key="user._id" class="hover:bg-gray-50/50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="h-10 w-10 flex-shrink-0">
                      <div class="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <User2 class="h-5 w-5 text-gray-500" />
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ user.username }}</div>
                      <div class="text-sm text-gray-500">ID: {{ user._id }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ user.email }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="{
                      'bg-blue-100 text-blue-800': user.role === 'admin',
                      'bg-gray-100 text-gray-800': user.role === 'user'
                    }">
                    {{ user.role === 'admin' ? 'Admin' : 'Kullanıcı' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ formatDate(user.lastLogin) }}</div>
                  <div class="text-xs text-gray-500">{{ formatTimeAgo(user.lastLogin) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="{
                      'bg-green-100 text-green-800': user.isActive,
                      'bg-red-100 text-red-800': !user.isActive
                    }">
                    {{ user.isActive ? 'Aktif' : 'Pasif' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button
                    @click="confirmEdit(user)"
                    class="text-blue-600 hover:text-blue-900 inline-flex items-center"
                    :disabled="!canEditUser(user)"
                  >
                    <Edit2 class="h-4 w-4 mr-1" />
                    Düzenle
                  </button>
                  <button
                    v-if="canDeleteUser(user)"
                    @click="confirmDelete(user)"
                    class="text-red-600 hover:text-red-900 inline-flex items-center"
                  >
                    <Trash2 class="h-4 w-4 mr-1" />
                    Sil
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div v-if="filteredUsers.length === 0" class="text-center py-12">
          <Users class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium text-gray-900">Kullanıcı Bulunamadı</h3>
          <p class="mt-1 text-sm text-gray-500">Arama kriterlerinize uygun kullanıcı bulunmamaktadır.</p>
        </div>
      </div>
    </main>

    <!-- Edit User Modal -->
    <TransitionRoot appear :show="isEditModalOpen" as="template">
      <Dialog as="div" @close="closeEditModal" class="relative z-10">
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black/25" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as="template"
              enter="duration-300 ease-out"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="duration-200 ease-in"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <DialogPanel class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900">
                  Kullanıcı Düzenle
                </DialogTitle>
                <div class="mt-4 space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Rol</label>
                    <select
                      v-if="editingUser"
                      v-model="editingUser.role"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                      <option value="user">Kullanıcı</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>

                <div class="mt-6 flex justify-end space-x-3">
                  <button
                    @click="closeEditModal"
                    class="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2"
                  >
                    İptal
                  </button>
                  <button
                    @click="saveUserChanges"
                    :disabled="isSaving"
                    class="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    :class="{ 'opacity-75 cursor-not-allowed': isSaving }"
                  >
                    {{ isSaving ? 'Kaydediliyor...' : 'Kaydet' }}
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Delete Confirmation Modal -->
    <TransitionRoot appear :show="isDeleteModalOpen" as="template">
      <Dialog as="div" @close="closeDeleteModal" class="relative z-10">
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black/25" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as="template"
              enter="duration-300 ease-out"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="duration-200 ease-in"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <DialogPanel class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900">
                  Kullanıcıyı Sil
                </DialogTitle>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    Bu kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                  </p>
                </div>

                <div class="mt-6 flex justify-end space-x-3">
                  <button
                    @click="closeDeleteModal"
                    class="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2"
                  >
                    İptal
                  </button>
                  <button
                    @click="deleteSelectedUser"
                    :disabled="isDeleting"
                    class="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    :class="{ 'opacity-75 cursor-not-allowed': isDeleting }"
                  >
                    {{ isDeleting ? 'Siliniyor...' : 'Sil' }}
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Onay Modalı -->
    <TransitionRoot appear :show="isConfirmModalOpen" as="template">
      <Dialog as="div" @close="closeConfirmModal" class="relative z-10">
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black/25" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as="template"
              enter="duration-300 ease-out"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="duration-200 ease-in"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <DialogPanel class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900">
                  {{ confirmModalTitle }}
                </DialogTitle>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    {{ confirmModalMessage }}
                  </p>
                </div>

                <div class="mt-6 flex justify-end space-x-3">
                  <button
                    @click="closeConfirmModal"
                    class="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2"
                  >
                    İptal
                  </button>
                  <button
                    @click="handleConfirmAction"
                    class="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Onayla
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { 
  Search, 
  RefreshCw, 
  AlertCircle, 
  User2, 
  Users,
  Edit2, 
  Trash2 
} from 'lucide-vue-next'

const userStore = useUserStore()
const users = ref([])
const searchQuery = ref('')
const isRefreshing = ref(false)
const isEditModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const isConfirmModalOpen = ref(false)
const editingUser = ref(null)
const userToDelete = ref(null)
const isSaving = ref(false)
const isDeleting = ref(false)

// Onay modalı state'leri
const confirmModalTitle = ref('')
const confirmModalMessage = ref('')
const pendingAction = ref(null)
const actionData = ref(null)

// Kullanıcıları filtrele
const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value

  const query = searchQuery.value.toLowerCase()
  return users.value.filter(user => 
    user.username.toLowerCase().includes(query) ||
    user.email.toLowerCase().includes(query) ||
    user._id.toLowerCase().includes(query)
  )
})

// Kullanıcıları getir
const fetchUsers = async () => {
  try {
    const data = await userStore.getAllUsers()
    users.value = data
  } catch (error) {
    console.error('Kullanıcılar alınamadı:', error)
  }
}

// Kullanıcıları yenile
const refreshUsers = async () => {
  isRefreshing.value = true
  await fetchUsers()
  isRefreshing.value = false
}

// Düzenleme onayı
const confirmEdit = (user) => {
  confirmModalTitle.value = 'Kullanıcı Düzenle'
  confirmModalMessage.value = `${user.username} kullanıcısının bilgilerini düzenlemek istediğinizden emin misiniz?`
  pendingAction.value = 'edit'
  actionData.value = user
  isConfirmModalOpen.value = true
}

// Silme onayı
const confirmDelete = (user) => {
  confirmModalTitle.value = 'Kullanıcı Sil'
  confirmModalMessage.value = `${user.username} kullanıcısını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`
  pendingAction.value = 'delete'
  actionData.value = user
  isConfirmModalOpen.value = true
}

// Onay modalını kapat
const closeConfirmModal = () => {
  isConfirmModalOpen.value = false
  setTimeout(() => {
    pendingAction.value = null
    actionData.value = null
  }, 200)
}

// Onaylanan işlemi gerçekleştir
const handleConfirmAction = async () => {
  if (pendingAction.value === 'edit') {
    openEditModal(actionData.value)
  } else if (pendingAction.value === 'delete') {
    userToDelete.value = actionData.value
    await deleteSelectedUser()
  }
  closeConfirmModal()
}

// Düzenleme modalını aç
const openEditModal = (user) => {
  editingUser.value = { ...user }
  isEditModalOpen.value = true
}

// Düzenleme modalını kapat
const closeEditModal = () => {
  isEditModalOpen.value = false
  // Modal kapandıktan sonra editingUser'ı sıfırla
  setTimeout(() => {
    editingUser.value = null
  }, 200) // Modal kapanma animasyonu süresi
}

// Silme modalını aç
const confirmDeleteModal = (user) => {
  userToDelete.value = user
  isDeleteModalOpen.value = true
}

// Silme modalını kapat
const closeDeleteModal = () => {
  userToDelete.value = null
  isDeleteModalOpen.value = false
}

// Kullanıcı değişikliklerini kaydet
const saveUserChanges = async () => {
  if (!editingUser.value) return

  isSaving.value = true
  try {
    await userStore.updateUserRole(editingUser.value._id, editingUser.value.role)
    await fetchUsers()
    closeEditModal()
  } catch (error) {
    console.error('Kullanıcı güncellenemedi:', error)
  } finally {
    isSaving.value = false
  }
}

// Kullanıcıyı sil
const deleteSelectedUser = async () => {
  if (!userToDelete.value) return

  isDeleting.value = true
  try {
    await userStore.deleteUser(userToDelete.value._id)
    await fetchUsers()
    closeDeleteModal()
  } catch (error) {
    console.error('Kullanıcı silinemedi:', error)
  } finally {
    isDeleting.value = false
  }
}

// Kullanıcının silinip silinemeyeceğini kontrol et
const canDeleteUser = (user) => {
  return user.role !== 'admin' && user._id !== userStore.user?._id
}

// Tarih formatlama fonksiyonları
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatTimeAgo = (date) => {
  const now = new Date()
  const loginDate = new Date(date)
  const diffTime = Math.abs(now - loginDate)
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffTime / (1000 * 60))
      return `${diffMinutes} dakika önce`
    }
    return `${diffHours} saat önce`
  }
  return `${diffDays} gün önce`
}

// Kullanıcı düzenleme yetkisi kontrolü
const canEditUser = (user) => {
  const currentUser = userStore.userProfile
  // Admin kendisini veya diğer adminleri düzenleyemez
  return currentUser && (currentUser.role === 'admin' && user.role !== 'admin')
}

// Component mount olduğunda kullanıcıları getir
onMounted(fetchUsers)
</script>
