<template>
  <div class="min-h-screen bg-gray-50 flex flex-col items-center p-8">
    <h1 class="text-3xl font-bold mb-8">Typing Speed Test</h1>
    
    <!-- WPM Counter -->
    <div class="mb-6 text-xl">
      <span class="font-semibold">WPM:</span> {{ state.wpm }}
    </div>
    
    <!-- Words Container -->
    <div class="max-w-2xl w-full bg-white p-6 rounded-lg shadow-md mb-6 relative" @click="focusInput">
      <WordsDisplay 
        :words="state.words" 
        :currentWordIndex="state.currentWordIndex"
        :currentInput="state.currentInput"
      />
      
      <TypingInput 
        ref="inputRef"
        :currentInput="state.currentInput"
        :completed="state.completed"
        :wpm="state.wpm"
        @input="handleInput"
        @keydown="handleKeyDown"
        @reset="resetTest"
        @focus="handleFocusChange(true)"
        @blur="handleFocusChange(false)"
      />
      
      <!-- Focus Overlay -->
      <div 
        v-if="!state.completed && !isFocused" 
        class="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center"
        @click="focusInput"
      >
        <div class="text-center p-4 bg-blue-50 rounded-lg shadow-md">
          <p class="text-lg font-medium text-blue-800 mb-2">Focus lost</p>
          <p class="text-gray-600">Press <span class="font-bold">space</span> or <span class="font-bold">enter</span> to continue typing</p>
        </div>
      </div>
    </div>
    
    <!-- Instructions -->
    <div class="text-sm text-gray-600 max-w-2xl">
      <p>Type the words above. Press space to move to the next word. Your WPM (words per minute) will be calculated as you type.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue';
import WordsDisplay from '~/components/WordsDisplay.vue';
import TypingInput from '~/components/TypingInput.vue';

const { state, handleInput, handleKeyDown, resetTest } = useTypingTest();
const inputRef = ref(null);
const isFocused = ref(true);

// Focus the input field
const focusInput = () => {
  if (inputRef.value && !state.completed) {
    inputRef.value.inputRef.value.focus();
    isFocused.value = true;
  }
};

// Track focus state
const handleFocusChange = (focused: boolean) => {
  isFocused.value = focused;
};

// Focus input on mount
onMounted(() => {
  nextTick(() => {
    focusInput();
  });
  
  // Set up a key event listener on the document to ensure focus is maintained
  // Only add event listeners on the client side
  if (process.client) {
    document.addEventListener('keydown', (e) => {
    // Only handle if not in an input field already
    if (document.activeElement?.tagName !== 'INPUT') {
      // For space or enter, always focus
      if ((e.key === 'Enter') && !state.completed) {
        focusInput();
        e.preventDefault();
      }
      // For other keys, only focus if they're typing characters
      else if (!e.ctrlKey && !e.altKey && !e.metaKey && 
          e.key.length === 1 && !state.completed) {
        focusInput();
      }
    }
    });
  }
  
  // No longer need to manually track focus/blur events here as they're now emitted from the component
});
</script>
