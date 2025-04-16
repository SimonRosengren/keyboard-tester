<template>
  <div class="flex flex-wrap gap-2 mb-6 relative bg-primary-400">
    <span 
      v-for="(word, index) in words" 
      :key="index"
      :class="{
        'text-gray-400': index > currentWordIndex,
        'text-black': index < currentWordIndex,
        'font-medium': index === currentWordIndex
      }"
      class="relative"
    >
      <template v-if="index === currentWordIndex">
        <span v-for="(char, charIndex) in word.split('')" :key="`${index}-${charIndex}`" class="relative">
          <!-- Character with color based on correctness -->
          <span :class="{
            'text-black': charIndex < currentInput.length && char === currentInput[charIndex],
            'text-red-500': charIndex < currentInput.length && char !== currentInput[charIndex],
            'text-gray-400': charIndex >= currentInput.length
          }">{{ char }}</span>
          
          <!-- Cursor -->
          <span 
            v-if="charIndex === currentInput.length" 
            class="absolute top-0 left-0 w-[2px] h-full bg-blue-500 animate-pulse"
            style="transform: translateX(-1px);"
          ></span>
        </span>
      </template>
      <template v-else>
        {{ word }}
      </template>
    </span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  words: string[];
  currentWordIndex: number;
  currentInput: string;
}>();
</script>

<style scoped>
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.animate-pulse {
  animation: blink 1s infinite;
}
</style>
