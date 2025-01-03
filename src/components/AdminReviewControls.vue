<template>
  <div class="admin-review-controls">
    <!-- Admin İşlem Butonları -->
    <div class="flex items-center gap-2">
      <button
        @click="showReplyForm = !showReplyForm"
        class="btn-secondary inline-flex items-center px-3 py-1.5 text-sm"
      >
        <i class="fas fa-reply mr-1"></i>
        {{ review.adminReply ? 'Yanıtı Düzenle' : 'Yanıtla' }}
      </button>

      <button
        @click="confirmDelete"
        class="btn-danger inline-flex items-center px-3 py-1.5 text-sm"
      >
        <i class="fas fa-trash mr-1"></i>
        Sil
      </button>
    </div>

    <!-- Yanıt Formu -->
    <div v-if="showReplyForm" class="mt-4">
      <div class="bg-gray-50 p-4 rounded-lg space-y-3">
        <label class="block">
          <span class="text-sm font-medium text-gray-700">Admin Yanıtı</span>
          <textarea
            v-model="replyText"
            rows="3"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
            placeholder="Yanıtınızı yazın..."
          ></textarea>
        </label>

        <div class="flex justify-end gap-2">
          <button
            @click="showReplyForm = false"
            class="btn-secondary"
          >
            İptal
          </button>
          <button
            @click="handleReply"
            :disabled="!replyText.trim()"
            class="btn-primary"
          >
            {{ review.adminReply ? 'Güncelle' : 'Yanıtla' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Silme Onay Dialogu -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <h3 class="text-lg font-medium text-gray-900">Yorumu Sil</h3>
        <p class="mt-2 text-gray-500">Bu yorumu silmek istediğinizden emin misiniz?</p>
        <div class="mt-4 flex justify-end gap-2">
          <button
            @click="showDeleteConfirm = false"
            class="btn-secondary"
          >
            İptal
          </button>
          <button
            @click="handleDelete"
            class="btn-danger"
          >
            Sil
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useReviewStore } from '@/stores/reviewStore';
import { useToast } from 'vue-toastification';
import { Icon } from '@iconify/vue';

const props = defineProps({
  review: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['updated', 'deleted']);

const reviewStore = useReviewStore();
const toast = useToast();

const showReplyForm = ref(false);
const showDeleteConfirm = ref(false);
const replyText = ref(props.review.adminReply || '');

// Silme işlemi
const confirmDelete = () => {
  showDeleteConfirm.value = true;
};

const handleDelete = async () => {
  try {
    await reviewStore.deleteReviewAdmin(props.review._id);
    toast.success('Yorum başarıyla silindi');
    emit('deleted', props.review._id);
  } catch (error) {
    toast.error(error.response?.data?.message || 'Yorum silinirken bir hata oluştu');
  } finally {
    showDeleteConfirm.value = false;
  }
};

// Yanıt işlemi
const handleReply = async () => {
  if (!replyText.value.trim()) return;

  try {
    const response = await reviewStore.updateReviewAdmin(props.review._id, {
      adminReply: replyText.value,
      adminReplyDate: new Date()
    });

    if (response.success) {
      toast.success(props.review.adminReply ? 'Yanıt güncellendi' : 'Yanıt eklendi');
      showReplyForm.value = false;
      emit('updated', response.data);
    }
  } catch (error) {
    toast.error(error.response?.data?.message || 'İşlem sırasında bir hata oluştu');
  }
};
</script>

<style scoped>
.btn-secondary {
  @apply px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors;
}

.btn-primary {
  @apply px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-danger {
  @apply px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors;
}
</style>
