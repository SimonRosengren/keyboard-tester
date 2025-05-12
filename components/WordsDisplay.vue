<template>
  <div class="flex flex-wrap gap-2 mb-6 relative font-mono">
    <span 
      v-for="(word, index) in words" 
      :key="index"
      :class="{
        'text-kq-white/70': index > currentWordIndex,
        'text-kq-white': index < currentWordIndex,
        'font-medium': index === currentWordIndex
      }"
      class="relative text-2xl"
    >
      <template v-if="index === currentWordIndex">
        <span v-for="(char, charIndex) in word.split('')" :key="`${index}-${charIndex}`" class="relative">
          <!-- Character with color based on correctness -->
          <span :class="{
            'text-kq-white': charIndex < currentInput.length && char === currentInput[charIndex],
            'text-kq-red': charIndex < currentInput.length && char !== currentInput[charIndex],
            'text-kq-white/70': charIndex >= currentInput.length
          }">{{ char }}</span>
          
          <!-- Cursor -->
          <span 
            v-if="charIndex === currentInput.length" 
            class="absolute left-0 bottom-0 top-0 my-auto w-[3px] h-5 bg-kq-white/60 animate-pulse"
            style="transform: translateX(-1px);"
          ></span>
        </span>
      </template>
      <template v-else>
        <span v-for="(char, charIndex) in word.split('')" :key="`${index}-${charIndex}`" class="relative">
          <span :class="{
            'text-kq-red': incorrectPositions[index]?.[charIndex],
            'text-inherit': !incorrectPositions[index]?.[charIndex]
          }">{{ char }}</span>
        </span>
      </template>
    </span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  words: string[];
  currentWordIndex: number;
  currentInput: string;
  incorrectPositions: Record<number, Record<number, boolean>>;
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
