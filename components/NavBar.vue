<template>
  <nav class="bg-kq-black-200 text-kq-white p-4">
    <div class="max-w-6xl mx-auto flex justify-between items-center">
      <div class="font-bold text-xl"><IconsLogo class="h-8 w-auto" /></div>
      <div class="flex gap-4 items-center">
        <NuxtLink to="/" class="hover:text-kq-yellow">Test</NuxtLink>
        <NuxtLink to="/history" class="hover:text-kq-yellow">History</NuxtLink>
        
        <!-- Sync status -->
        <SyncStatus v-if="userStore.isLoggedIn" />
        
        <!-- Auth section -->
        <div class="ml-6 flex items-center">
          <template v-if="userStore.isLoggedIn">
            <div class="flex items-center gap-4">
              <span class="text-sm">{{ userStore.email }}</span>
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
const router = useRouter()
const userStore = useUserStore()
const supabaseUser = useSupabaseUser()

// // Watch for Supabase user changes and update the store
// watch(supabaseUser, (newUser) => {
//   userStore.setUser(newUser.value)
// }, { immediate: true })

async function handleLogout() {
  await userStore.logout()
  router.push('/')
}
</script>
