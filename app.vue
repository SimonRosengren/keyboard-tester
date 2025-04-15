<template>
  <div class="min-h-screen bg-gray-50 flex flex-col items-center p-8">
    <h1 class="text-3xl font-bold mb-8">Typing Speed Test</h1>
    
    <!-- WPM Counter -->
    <div class="mb-6 text-xl">
      <span class="font-semibold">WPM:</span> {{ state.wpm }}
    </div>
    
    <!-- Words Container -->
    <div class="max-w-2xl w-full bg-white p-6 rounded-lg shadow-md mb-6">
      <div class="flex flex-wrap gap-2 mb-6">
        <span 
          v-for="(word, index) in state.words" 
          :key="index"
          :class="{
            'text-gray-400': index > state.currentWordIndex,
            'text-black': index < state.currentWordIndex,
            'text-blue-600 font-medium': index === state.currentWordIndex
          }"
        >
          {{ word }}
        </span>
      </div>
      <Test />     
      <!-- Input Field -->
      <input
        v-if="!state.completed"
        ref="inputRef"
        type="text"
        v-model="state.currentInput"
        @input="handleInput"
        @keydown="handleKeyDown"
        class="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Type here..."
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        spellcheck="false"
        autofocus
      />
      
      <!-- Completed Message -->
      <div v-else class="text-center">
        <p class="text-green-600 text-xl mb-4">Test completed!</p>
        <p class="mb-4">Your typing speed: <span class="font-bold">{{ state.wpm }} WPM</span></p>
        <button 
          @click="resetTest" 
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none"
        >
          Try Again
        </button>
      </div>
    </div>
    
    <!-- Instructions -->
    <div class="text-sm text-gray-600 max-w-2xl">
      <p>Type the words above. Press space to move to the next word. Your WPM (words per minute) will be calculated as you type.</p>
    </div>
  </div>
</template>

<script setup lang="ts">

const { state, inputRef, handleInput, handleKeyDown, resetTest } = useTypingTest();
</script>
