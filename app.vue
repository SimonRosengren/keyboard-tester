<template>
  <div class="min-h-screen bg-kq-white dark:bg-kq-black-300 text-kq-black dark:text-kq-white flex flex-col">
    <NavBar />
    <div class="flex-1">
      <NuxtPage />
    </div>
  </div>
</template>

<script setup>
import NavBar from '~/components/NavBar.vue';
</script>
