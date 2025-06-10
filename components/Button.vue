<template>
  <button class="flex items-center justify-center 
    gap-2 transition-all font-semibold rounded-full cursor-pointer"
    :class="[
    size === 'S' && 'h-10 p-4  text-sm',
    size === 'M' && 'h-14 p-6 text-md',
    size === 'L' && 'h-24 p-12 text-lg',
    theme === 'YELLOW' && 'bg-kq-yellow-400 hover:bg-kq-yellow-300 active:bg-kq-yellow-500 text-kq-black-100'
  ]">
    <slot name="leading" />
    <slot name="main" />
    <slot name="trailing" />
  </button>
</template>
<script setup lang="ts">
interface IButton {
  size: 'S' | 'M' | 'L',
  theme: 'YELLOW' | 'BLACK' | 'WHITE'
}
defineProps<IButton>();
</script>
