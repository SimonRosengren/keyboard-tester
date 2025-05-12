<template>
  <div class="w-full bg-kq-white/60 dark:bg-kq-yellow/10 rounded-xs h-1.5 p-px overflow-hidden">
    <div 
      class="bg-kq-black-300 dark:bg-kq-yellow h-full transition-all duration-300 ease-out"
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
