<template>
  <div class="min-h-screen bg-gray-50 flex flex-col items-center p-8" @click="focusInput">
    <h1 class="text-3xl font-bold mb-8">Typing Speed Test</h1>
    
    <!-- WPM Counter -->
    <div class="mb-6 text-xl">
      <span class="font-semibold">WPM:</span> {{ state.wpm }}
    </div>
    
    <!-- Words Container -->
    <div class="max-w-2xl w-full bg-white p-6 rounded-lg shadow-md mb-6">
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
      />
    </div>
    
    <!-- Instructions -->
    <div class="text-sm text-gray-600 max-w-2xl">
      <p>Type the words above. Press space to move to the next word. Your WPM (words per minute) will be calculated as you type.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import WordsDisplay from '~/components/WordsDisplay.vue';
import TypingInput from '~/components/TypingInput.vue';

const { state, handleInput, handleKeyDown, resetTest } = useTypingTest();
const inputRef = ref(null);

// Focus the input field
const focusInput = () => {
  if (inputRef.value && !state.completed) {
    inputRef.value.inputRef.value.focus();
  }
};

// Focus input on mount
onMounted(() => {
  nextTick(() => {
    focusInput();
  });
  
  // Set up a key event listener on the document to ensure focus is maintained
  document.addEventListener('keydown', (e) => {
    // Only handle if not in an input field already
    if (document.activeElement?.tagName !== 'INPUT') {
      // Ignore modifier keys and special keys
      if (!e.ctrlKey && !e.altKey && !e.metaKey && 
          e.key.length === 1 && !state.completed) {
        focusInput();
      }
    }
  });
});
</script>
