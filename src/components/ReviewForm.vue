<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Rating Section -->
    <div class="space-y-2">
      <label class="block text-sm font-medium text-gray-700">Puanınız</label>
      <div class="flex items-center gap-2">
        <template v-for="star in 5" :key="star">
          <button
            type="button"
            @click="rating = star"
            @mouseenter="hoverRating = star"
            @mouseleave="hoverRating = 0"
            class="focus:outline-none transition-transform duration-200 hover:scale-110"
          >
            <Icon
              :icon="(hoverRating || rating) >= star ? 'material-symbols:star' : 'material-symbols:star-outline'"
              class="w-8 h-8"
              :class="[
                (hoverRating || rating) >= star ? 'text-yellow-400' : 'text-gray-400',
                'hover:text-yellow-300 transition-colors duration-200'
              ]"
            />
          </button>
        </template>
        <span
          class="ml-2 text-sm"
          :class="rating ? 'text-yellow-600' : 'text-gray-500'"
        >
          {{ getRatingText(rating || hoverRating) }}
        </span>
      </div>
      <p v-if="v$.rating.$error" class="mt-1 text-sm text-red-600">
        {{ v$.rating.$errors[0].$message }}
      </p>
    </div>

    <!-- Comment Section -->
    <div class="space-y-2">
      <label
        for="comment"
        class="block text-sm font-medium text-gray-700"
      >
        Yorumunuz
      </label>
      <div class="relative">
        <textarea
          id="comment"
          v-model="comment"
          rows="4"
          :maxlength="maxCommentLength"
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm resize-none transition-all duration-200"
          :class="{
            'border-red-300 focus:border-red-500 focus:ring-red-500':
              v$.comment.$error,
          }"
          placeholder="Ürün hakkında deneyimlerinizi paylaşın..."
          @input="autoGrow"
          ref="textareaRef"
        ></textarea>
        <div
          class="absolute bottom-2 right-2 text-xs text-gray-400"
          :class="{
            'text-red-500': comment.length > maxCommentLength * 0.9,
          }"
        >
          {{ comment.length }}/{{ maxCommentLength }}
        </div>
      </div>
      <p v-if="v$.comment.$error" class="mt-1 text-sm text-red-600">
        {{ v$.comment.$errors[0].$message }}
      </p>
    </div>

    <!-- Emoji Picker -->
    <div class="flex items-center gap-2">
      <button
        type="button"
        v-for="emoji in quickEmojis"
        :key="emoji"
        @click="addEmoji(emoji)"
        class="p-1.5 hover:bg-gray-100 rounded-full transition-colors duration-200"
      >
        {{ emoji }}
      </button>
      <button
        type="button"
        @click="showEmojiPicker = !showEmojiPicker"
        class="p-1.5 hover:bg-gray-100 rounded-full transition-colors duration-200"
      >
        <Icon
          icon="material-symbols:smiley"
          class="w-5 h-5 text-gray-500"
        />
      </button>
    </div>

    <!-- Action Buttons -->
    <div class="flex items-center justify-end gap-4 pt-4">
      <button
        type="button"
        @click="$emit('cancel')"
        class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
      >
        İptal
      </button>
      <button
        type="submit"
        :disabled="isSubmitting"
        class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-green-500 border border-transparent rounded-md shadow-sm hover:from-green-700 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Icon
          v-if="isSubmitting"
          icon="material-symbols:spinner"
          class="w-4 h-4 mr-2 animate-spin"
        />
        <Icon
          v-else
          icon="material-symbols:check"
          class="w-4 h-4 mr-2"
        />
        {{ isSubmitting ? 'Gönderiliyor...' : 'Gönder' }}
      </button>
    </div>

    <!-- Success Message -->
    <TransitionRoot
      appear
      :show="showSuccess"
      as="template"
    >
      <div class="fixed bottom-4 right-4 z-50">
        <TransitionChild
          enter="transform transition duration-300"
          enter-from="translate-y-full opacity-0"
          enter-to="translate-y-0 opacity-100"
          leave="transform transition duration-200"
          leave-from="translate-y-0 opacity-100"
          leave-to="translate-y-full opacity-0"
        >
          <div class="bg-green-50 p-4 rounded-lg border border-green-200 shadow-lg">
            <div class="flex items-center">
              <Icon
                icon="material-symbols:check-circle"
                class="w-5 h-5 text-green-500 mr-2"
              />
              <p class="text-sm font-medium text-green-800">
                Yorumunuz başarıyla gönderildi!
              </p>
            </div>
          </div>
        </TransitionChild>
      </div>
    </TransitionRoot>
  </form>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Icon } from '@iconify/vue';
import { TransitionRoot, TransitionChild } from '@headlessui/vue';
import useVuelidate from '@vuelidate/core';
import { required, minLength, maxLength } from '@vuelidate/validators';
import { useToast } from 'vue-toastification';

const toast = useToast();
const props = defineProps({
  initialRating: {
    type: Number,
    default: 0
  },
  initialComment: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['submit', 'cancel', 'error']);

// Form state
const rating = ref(props.initialRating);
const comment = ref(props.initialComment);
const hoverRating = ref(0);
const isSubmitting = ref(false);
const showSuccess = ref(false);
const showEmojiPicker = ref(false);
const textareaRef = ref(null);
const maxCommentLength = 500;

// Quick emoji selection
const quickEmojis = ['👍', '❤️', '😊', '🌟', '👏'];

// Form validation rules
const rules = {
  rating: { required },
  comment: { required, minLength: minLength(2), maxLength: maxLength(maxCommentLength) }
};

const v$ = useVuelidate(rules, { rating, comment });

// Methods
const getRatingText = (value) => {
  const texts = {
    1: 'Çok Kötü',
    2: 'Kötü',
    3: 'Orta',
    4: 'İyi',
    5: 'Mükemmel'
  };
  return texts[value] || 'Puan Seçin';
};

const autoGrow = () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto';
    textareaRef.value.style.height = textareaRef.value.scrollHeight + 'px';
  }
};

const addEmoji = (emoji) => {
  comment.value += emoji;
  if (textareaRef.value) {
    textareaRef.value.focus();
  }
};

const handleSubmit = async () => {
  try {
    isSubmitting.value = true;
    const result = await v$.value.$validate();
    if (!result) {
      // Validasyon hatalarını göster
      const errors = v$.value.$errors;
      if (errors.length > 0) {
        toast.error(errors[0].$message);
      }
      return;
    }

    // Form verilerini emit et ve yanıtı bekle
    const response = await emit('submit', {
      rating: rating.value,
      comment: comment.value
    });

    // Eğer yanıt başarısızsa, işlemi sonlandır
    if (response && !response.success) {
      return;
    }

    // Formu sıfırla
    rating.value = 0;
    comment.value = '';
    v$.value.$reset();

  } catch (error) {
    // Backend'den gelen hata mesajını göster
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error('Yorum eklenirken bir hata oluştu');
    }
    // Hata durumunu üst bileşene bildir
    emit('error', error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
textarea {
  min-height: 100px;
  transition: height 0.2s ease;
}

.emoji-picker {
  position: absolute;
  bottom: 100%;
  right: 0;
  margin-bottom: 8px;
}
</style>
