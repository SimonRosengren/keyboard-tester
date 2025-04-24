export default defineNuxtPlugin({
  name: 'auth-plugin',
  enforce: 'pre', // Run before other plugins
  async setup() {
    const user = useSupabaseUser()
    const { updateUserIdForScores } = useIndexedDB()
    const { syncAllScores } = useSyncScores()
    const route = useRoute()
    const router = useRouter()
    
    // Handle email confirmation and password reset redirects
    if (process.client) {
      const hash = window.location.hash
      if (hash) {
        // Extract token from hash
        const hashParams = new URLSearchParams(hash.substring(1))
        const token = hashParams.get('access_token')
        const type = hashParams.get('type')
        
        if (token && type === 'email_confirmation') {
          // Redirect to confirmation page with token
          router.push(`/confirm?token=${token}&type=${type}`)
          return
        }
        
        if (token && type === 'recovery') {
          // For password reset, we don't need to redirect as the update-password page
          // will handle it directly through the Supabase client
          console.log('Password reset flow detected')
        }
      }
    }
    
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
