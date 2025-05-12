<template>
  <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
    <div 
      class="bg-blue-600 dark:bg-blue-500 h-full transition-all duration-300 ease-out"
      :style="{ width: `${clampedProgress}%` }"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  progress: number;
  color?: string;
}>();

// Ensure progress is between 0 and 100
const clampedProgress = computed(() => {
  return Math.min(Math.max(props.progress, 0), 100);
});
</script>
