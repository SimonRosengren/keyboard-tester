<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-kq-black-300 text-kq-white">
    <div class="max-w-md w-full bg-kq-black-200 rounded-lg shadow-md p-8">
      <div class="mb-6 text-center">
        <h1 class="text-2xl font-bold">Reset Password</h1>
      </div>
      
      <div v-if="error" class="mb-4 p-4 bg-kq-red/20 text-kq-red rounded">
        {{ error }}
      </div>
      
      <div v-if="success" class="mb-4 p-4 bg-green-500/20 text-green-500 rounded">
        {{ success }}
      </div>
      
      <form v-if="!success" @submit.prevent="handleResetPassword" class="space-y-4">
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
          <button 
            type="submit"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-kq-black-200 bg-kq-yellow hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kq-yellow"
            :disabled="loading"
          >
            <span v-if="loading">Sending...</span>
            <span v-else>Send Reset Link</span>
          </button>
        </div>
      </form>
      
      <div class="mt-6 text-center">
        <NuxtLink to="/login" class="text-sm text-kq-blue hover:text-kq-blue/80">
          Back to login
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const client = useSupabaseClient()
const email = ref('')
const error = ref('')
const success = ref('')
const loading = ref(false)

async function handleResetPassword() {
  try {
    loading.value = true
    error.value = ''
    success.value = ''
    
    const { error: resetError } = await client.auth.resetPasswordForEmail(email.value, {
      redirectTo: `${window.location.origin}/update-password`,
    })
    
    if (resetError) throw resetError
    
    success.value = 'Password reset link has been sent to your email!'
    email.value = ''
  } catch (e: any) {
    error.value = e.message || 'An error occurred during password reset'
  } finally {
    loading.value = false
  }
}
definePageMeta({
  layout: 'empty'
})
</script>
