<template>
  <nav class="bg-kq-black-200 text-kq-white p-4">
    <div class="max-w-6xl mx-auto flex justify-between items-center">
      <div class="font-bold text-xl"><IconsLogo class="h-8 w-auto" /></div>
      <div class="flex gap-4 items-center">
        <NuxtLink to="/" class="hover:text-kq-yellow">Test</NuxtLink>
        <NuxtLink to="/history" class="hover:text-kq-yellow">History</NuxtLink>
        
        <!-- Auth section -->
        <div class="ml-6 flex items-center">
          <template v-if="user">
            <div class="flex items-center gap-4">
              <span class="text-sm">{{ user.email }}</span>
              <button 
                @click="handleLogout" 
                class="px-3 py-1 text-sm font-medium text-kq-black-200 bg-kq-yellow rounded-md hover:bg-opacity-90"
              >
                Logout
              </button>
            </div>
          </template>
          <template v-else>
            <NuxtLink 
              to="/login" 
              class="px-3 py-1 text-sm font-medium text-kq-black-200 bg-kq-yellow rounded-md hover:bg-opacity-90"
            >
              Login
            </NuxtLink>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
const client = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter()

async function handleLogout() {
  await client.auth.signOut()
  router.push('/')
}
</script>
