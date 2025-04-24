export default defineNuxtPlugin({
  name: 'pinia-user-plugin',
  enforce: 'default', // Run before other plugins
  async setup() {
    const userStore = useUserStore()
    const supabaseUser = useSupabaseUser()
    
    // Initialize user store with current auth state
    watch(supabaseUser, (newUser) => {
      if (newUser) { 
        console.log(newUser)
        userStore.setUser(newUser.value)
      }
    }, { immediate: true })
  }
})
