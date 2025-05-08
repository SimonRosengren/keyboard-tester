<template>
  <div class="min-h-screen bg-kq-white dark:bg-kq-black-300 max-sm:px-4
    text-kq-black dark:text-kq-white grid grid-cols-4 sm:grid-cols-8 md:grid-cols-12">
    <NavBar class="col-span-full sm:col-span-6 sm:col-start-2 md:col-start-4" />
    <div class="col-span-full sm:col-span-6 sm:col-start-2 md:col-start-4">
      <slot />
    </div>
  </div>
</template>
