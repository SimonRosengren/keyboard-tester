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
    
    <!-- Hidden input even when completed -->
    <input
      v-else
      ref="inputRef"
      type="text"
      class="absolute opacity-0 h-0"
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="false"
    />
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

    // Listen for the custom reset event
    document.addEventListener('typing-test-reset', () => {
      focusInput();
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
