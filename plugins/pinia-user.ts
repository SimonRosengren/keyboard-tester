export default defineNuxtPlugin({
  name: 'pinia-user-plugin',
  enforce: 'default', // Run before other plugins
  setup() {
    const userStore = useUserStore()
    const supabaseUser = useSupabaseUser()
    
    // Initialize user store with current auth state
    // Using watchEffect instead of watch to avoid lifecycle issues
    watchEffect(() => {
      if (supabaseUser.value) {
        userStore.setUser(supabaseUser.value)
      }
    })

    return {}
  }
})
