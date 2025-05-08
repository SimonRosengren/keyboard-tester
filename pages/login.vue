<template>
  <div class="min-h-screen flex items-center p-4 text-kq-white">
    <div class="max-w-md w-full bg-kq-black-200 rounded-lg shadow-md p-8">
      <div class="mb-6 text-center">
        <h1 class="text-2xl font-bold">Sign in to KeyQuake</h1>
      </div>
      
      <div v-if="error" class="mb-4 p-4 bg-kq-red/20 text-kq-red rounded">
        {{ error }}
      </div>
      
      <!-- Email/Password Login -->
      <form @submit.prevent="handleEmailLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium">Email</label>
          <input 
            v-model="email" 
            type="email" 
            required
            class="mt-1 block w-full px-3 py-2 border border-kq-black-100 rounded-md shadow-sm focus:outline-none focus:ring-kq-blue focus:border-kq-blue bg-kq-black-300 text-kq-white"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium">Password</label>
          <input 
            v-model="password" 
            type="password" 
            required
            class="mt-1 block w-full px-3 py-2 border border-kq-black-100 rounded-md shadow-sm focus:outline-none focus:ring-kq-blue focus:border-kq-blue bg-kq-black-300 text-kq-white"
          />
          <div class="mt-1 text-right">
            <NuxtLink to="/reset-password" class="text-xs text-kq-blue hover:text-kq-blue/80">
              Forgot password?
            </NuxtLink>
          </div>
        </div>
        
        <div>
          <button 
            type="submit"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-kq-black-200 bg-kq-yellow hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kq-yellow"
          >
            {{ isSignUp ? 'Sign up' : 'Sign in' }}
          </button>
        </div>
      </form>
      
      <div class="mt-6">
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-kq-black-100"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-kq-black-200 text-kq-white/70">Or continue with</span>
          </div>
        </div>
        
        <div class="mt-6 grid grid-cols-2 gap-3">
          <button 
            @click="handleGoogleLogin"
            class="w-full flex justify-center py-2 px-4 border border-kq-black-100 rounded-md shadow-sm bg-kq-black-200 text-sm font-medium text-kq-white hover:bg-kq-black-100"
          >
            Google
          </button>
          <button 
            @click="handleGithubLogin"
            class="w-full flex justify-center py-2 px-4 border border-kq-black-100 rounded-md shadow-sm bg-kq-black-200 text-sm font-medium text-kq-white hover:bg-kq-black-100"
          >
            GitHub
          </button>
        </div>
      </div>
      
      <div class="mt-6 text-center">
        <p class="text-sm text-kq-white/70">
          {{ isSignUp ? 'Already have an account?' : 'Don\'t have an account?' }}
          <button @click="isSignUp = !isSignUp" class="font-medium text-kq-blue hover:text-kq-blue/80">
            {{ isSignUp ? 'Sign in instead' : 'Sign up' }}
          </button>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const client = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref('')
const isSignUp = ref(false)

// Redirect if already logged in
watchEffect(() => {
  if (user.value) {
    router.push('/')
  }
})

async function handleEmailLogin() {
  try {
    error.value = ''
    
    if (isSignUp.value) {
      const { error: signUpError } = await client.auth.signUp({
        email: email.value,
        password: password.value,
      })
      
      if (signUpError) throw signUpError
      
      // Show confirmation message
      alert('Check your email for the confirmation link!')
    } else {
      const { error: signInError } = await client.auth.signInWithPassword({
        email: email.value,
        password: password.value,
      })
      
      if (signInError) throw signInError
    }
  } catch (e: any) {
    error.value = e.message || 'An error occurred during authentication'
  }
}

async function handleGoogleLogin() {
  try {
    const { error: authError } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/confirm`
      }
    })
    
    if (authError) throw authError
  } catch (e: any) {
    error.value = e.message || 'An error occurred during Google authentication'
  }
}

async function handleGithubLogin() {
  try {
    const { error: authError } = await client.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/confirm`
      }
    })
    
    if (authError) throw authError
  } catch (e: any) {
    error.value = e.message || 'An error occurred during GitHub authentication'
  }
}
</script>
