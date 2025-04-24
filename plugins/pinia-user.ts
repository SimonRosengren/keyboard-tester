export default defineNuxtPlugin({
  name: 'pinia-user-plugin',
  enforce: 'pre', // Run before other plugins
  async setup() {
    const userStore = useUserStore()
    const supabaseUser = useSupabaseUser()
    
    // Initialize user store with current auth state
    watch(supabaseUser, (newUser) => {
      userStore.setUser(newUser.value)
    }, { immediate: true })
  }
})
