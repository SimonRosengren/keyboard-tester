<template>
  <div>
    <!-- Hidden Input Field -->
    <input
      v-if="!completed"
      ref="inputRef"
      type="text"
      :value="currentInput"
      @input="$emit('input', $event)"
      @keydown="$emit('keydown', $event)"
      class="absolute opacity-0 h-0"
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="false"
      autofocus
    />
    
    <!-- Completed Message -->
    <div v-else class="text-center mt-6">
      <p class="text-green-600 text-xl mb-4">Test completed!</p>
      <p class="mb-4">Your typing speed: <span class="font-bold">{{ wpm }} WPM</span></p>
      <button 
        @click="$emit('reset')" 
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none"
      >
        Try Again
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const props = defineProps<{
  currentInput: string;
  completed: boolean;
  wpm: number;
}>();

const emit = defineEmits<{
  (e: 'input', event: Event): void;
  (e: 'keydown', event: KeyboardEvent): void;
  (e: 'reset'): void;
  (e: 'focus', focused: boolean): void;
  (e: 'blur', focused: boolean): void;
}>();

const inputRef = ref<HTMLInputElement | null>(null);

// Focus the input field
const focusInput = () => {
  if (inputRef.value && !props.completed) {
    inputRef.value.focus();
  }
};

onMounted(() => {
  if (process.client && inputRef.value) {
    document.addEventListener('keydown', (e) => {
      if (document.activeElement?.tagName !== 'INPUT') {
        if ((e.key === 'Enter') && !props.completed) {
          focusInput();
          e.preventDefault();
        }
      }
    });

    inputRef.value.addEventListener('focus', () => {
      emit('focus', true);
    });
    
    inputRef.value.addEventListener('blur', () => {
      emit('blur', false);
    });

    focusInput();
  }
});

defineExpose({ inputRef });
</script>
