<template>
  <div class="flex flex-wrap gap-2 mb-6">
    <span 
      v-for="(word, index) in words" 
      :key="index"
      :class="{
        'text-gray-400': index > currentWordIndex,
        'text-black': index < currentWordIndex,
        'text-blue-600 font-medium': index === currentWordIndex
      }"
    >
      {{ word }}
    </span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  words: string[];
  currentWordIndex: number;
}>();
</script>
