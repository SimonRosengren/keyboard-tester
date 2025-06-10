<template>
  <div class="min-h-screen w-full flex text-kq-white">
    <div class="w-full bg-gradient-to-b from-kq-black-300 to-kq-blue/30 max-lg:hidden">
      <div class="w-full h-full flex flex-col justify-center text-center items-center bg-gradient-to-br from-kq-pink/30 to-kq-black-300">
        <div class="w-full mb-12 shadow-2xl">
          <div class="h-px w-full bg-gradient-to-r from-transparent via-kq-pink to-transparent" />
          <div class="flex items-center justify-center py-8 bg-kq-black-300 w-full">
            <IconsLogo class="h-20 w-auto" />
          </div>
          <div class="h-px w-full bg-gradient-to-r from-transparent via-kq-pink to-transparent" />
        </div>
        <div class="flex flex-col items-center px-28">
          <h1 class="text-5xl font-medium md:text-6xl mb-8 text-kq-yellow uppercase">Making typing a competition</h1>
          <h2 class="text-lg">Sign up or login to compete with others from around the world. See how fast at typing you really are.</h2>
        </div>
      </div>
    </div>
    <div class="w-full bg-kq-black-300 rounded-lg shadow-md pt-12 flex flex-col items-center justify-center">
      <div class="mb-8 text-center">
        <h1 class="text-3xl font-bold uppercase text-kq-yellow">{{ isSignUp ? 'Sign up to Keyquake' : 'Sign in to keyquake' }}</h1>
      </div>

      <div class="w-full max-w-sm mb-4">
        <div class="mb-6">
          <button 
            @click="handleGoogleLogin"
            class="w-full flex justify-center transition-colors cursor-pointer gap-3 items-center py-2 px-4 border border-kq-black-100 rounded-md shadow-sm bg-kq-black-200 text-sm font-medium text-kq-white hover:bg-kq-black-100"
          >
            <Icon name="logos:google-icon" class="-ml-3" />
            Google
          </button>
          <!-- <button  -->
          <!--   @click="handleGithubLogin" -->
          <!--   class="w-full flex justify-center py-2 px-4 border border-kq-black-100 rounded-md shadow-sm bg-kq-black-200 text-sm font-medium text-kq-white hover:bg-kq-black-100" -->
          <!-- > -->
          <!--   GitHub -->
          <!-- </button> -->
        </div>
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-kq-black-100"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-kq-black-200 text-kq-white/70">Or continue with</span>
          </div>
        </div>
        
      </div>
      
      <div v-if="error" class="mb-4 p-4 bg-kq-red/20 text-kq-red rounded">
        {{ error }}
      </div>
      
      <!-- Email/Password Login -->
      <form @submit.prevent="handleEmailLogin" class="space-y-4 max-w-sm mx-auto w-full">
        <div>
          <label class="block text-sm font-medium">Email</label>
          <input 
            v-model="email" 
            type="email" 
            required
            class="mt-1 block w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-kq-blue focus:border-kq-blue bg-kq-black-100/60 border border-kq-black-100/90 text-kq-white"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium">Password</label>
          <input 
            v-model="password" 
            type="password" 
            required
            class="mt-1 block w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-kq-blue focus:border-kq-blue bg-kq-black-100/60 border border-kq-black-100/90 text-kq-white"
          />
          <div class="mt-1 text-right">
            <NuxtLink to="/reset-password" class="text-xs text-kq-blue hover:text-kq-blue/80">
              Forgot password?
            </NuxtLink>
          </div>
        </div>
        
        <div>
          <Button 
            type="submit"
            size="M"
            theme="YELLOW"
            class="w-full"
          >
            <template #main>{{ isSignUp ? 'Sign up' : 'Sign in' }}</template>
          </Button>
        </div>
      </form>
      

      
      <div class="mt-6 text-center">
        <p class="text-sm text-kq-white/70">
          {{ isSignUp ? 'Already have an account?' : 'Don\'t have an account?' }}
          <button @click="isSignUp = !isSignUp" class="font-medium text-kq-blue hover:text-kq-blue/80">
            {{ isSignUp ? 'Sign in instead' : 'Sign up' }}
          </button>
        </p>
      </div>
      <div class="mt-6 text-center">
        <NuxtLink to="/" class="flex items-center text-kq-white/90 group">
          <Icon name="solar:arrow-left-linear" class="w-7 h-7 mr-2 group-hover:-translate-x-1.5 transition-all" />
          Back to typing
        </NuxtLink>
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

definePageMeta({
  layout: 'empty'
})
</script>
