<template>
  <nav class="bg-kq-black-300 text-kq-white py-6">
    <div class="flex justify-between items-center cursor-pointer">
      <div class="font-bold text-xl" @click="async () => await navigateTo('/')">
        <IconsLogo class="h-8 w-auto" />
      </div>
      <div class="flex gap-8 items-center">
        <NuxtLink to="/" class="hover:text-kq-yellow transition-colors">Play</NuxtLink>
        <NuxtLink to="/highscore" class="hover:text-kq-yellow transition-colors">Highscore</NuxtLink>
        
        <!-- Sync status -->
        <SyncStatus v-if="userStore.isLoggedIn" />
        
        <!-- Auth section -->
        <div class="ml-6 flex items-center">
          <template v-if="userStore.isLoggedIn">
            <div class="flex items-center gap-4">
              <img v-if="userStore.user?.user_metadata?.avatar_url" :src="userStore.user.user_metadata?.avatar_url" class="rounded-full w-7 h-7" />
              <Icon v-else name="solar:user-circle-bold" class="text-kq-yellow !w-7 !h-7" />
              <Button 
                @click="handleLogout" 
                size="S"
                theme="YELLOW"
              >
                <template #main>Logout</template>
                <template #trailing><IconsLogin class="w-4 h-4" /></template>
              </Button>
            </div>
          </template>
          <template v-else>
            <Button 
              @click="async () => await navigateTo('/login')"
              size="S"
              theme="YELLOW"
            >
              <template #main> Login</template>
              <template #trailing><IconsLogin class="w-4 h-4" /></template>
            </Button>
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
