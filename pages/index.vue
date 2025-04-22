<template>
  <div class="min-h-screen bg-kq-white dark:bg-kq-black-300 text-kq-black-300 dark:text-kq-white flex flex-col items-center justify-center">
    <!-- WPM Counter and High Score -->
    <div class="mb-6 text-xl flex gap-6">
      <div>
        <span class="font-semibold">WPM:</span> {{ state.wpm }}
      </div>
      <div v-if="highScore">
        <span class="font-semibold">High Score:</span> {{ highScore }}
      </div>
    </div>
    
    <!-- Words Container -->
    <div
      class="max-w-2xl w-full p-6 mb-6 relative"
    >
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
        class="absolute inset-0 backdrop-blur-sm flex items-center justify-center"
        @click="focusInput"
      >
        <div class="text-center bg-kq-pink p-6 border-2 rounded-lg border-kq-yellow shadow-md">
          <p class="text-lg text-kq-black font-medium mb-2">Focus lost</p>
          <p class="text-kq-black">Press <span class="font-bold">enter</span> to continue typing</p>
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

const { state, highScore, handleInput, handleKeyDown, resetTest } = useTypingTest();
const inputRef = ref(null);
const isFocused = ref(true);

// Track focus state
const handleFocusChange = (focused: boolean) => {
  isFocused.value = focused;
};

const focusInput = () => {
  if (inputRef.value) {
    inputRef.value.inputRef.value.focus();
  }
};
</script>
