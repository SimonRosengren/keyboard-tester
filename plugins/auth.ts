export default defineNuxtPlugin({
  name: 'auth-plugin',
  enforce: 'pre', // Run before other plugins
  async setup() {
    const user = useSupabaseUser()
    const { updateUserIdForScores } = useIndexedDB()
    const { syncAllScores } = useSyncScores()
    
    // Watch for user login
    watch(user, async (newUser, oldUser) => {
      if (newUser && !oldUser) {
        // User just logged in
        console.log('User logged in, updating scores and syncing')
        
        try {
          // Update anonymous scores with the user ID
          if (newUser.id) {
            await updateUserIdForScores(newUser.id)
          }
          
          // Sync all scores to Supabase
          await syncAllScores()
        } catch (error) {
          console.error('Error handling user login:', error)
        }
      }
    }, { immediate: true })
  }
})
