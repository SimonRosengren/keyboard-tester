<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-kq-black-100 text-kq-white">
    <div class="text-center">
      <h1 class="text-2xl font-bold mb-4">Confirming your login...</h1>
      <div class="animate-spin h-10 w-10 border-4 border-kq-blue rounded-full border-t-transparent mx-auto"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
const user = useSupabaseUser()
const router = useRouter()

// Redirect to home page once user is authenticated
watchEffect(() => {
  if (user.value) {
    router.push('/')
  }
})
</script>
