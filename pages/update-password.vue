<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-kq-black-100 text-kq-white">
    <div class="max-w-md w-full bg-kq-black-200 rounded-lg shadow-md p-8">
      <div class="mb-6 text-center">
        <h1 class="text-2xl font-bold">Update Password</h1>
      </div>
      
      <div v-if="error" class="mb-4 p-4 bg-kq-red/20 text-kq-red rounded">
        {{ error }}
      </div>
      
      <div v-if="success" class="mb-4 p-4 bg-green-500/20 text-green-500 rounded">
        {{ success }}
      </div>
      
      <form v-if="!success" @submit.prevent="handleUpdatePassword" class="space-y-4">
        <div>
          <label class="block text-sm font-medium">New Password</label>
          <input 
            v-model="password" 
            type="password" 
            required
            minlength="6"
            class="mt-1 block w-full px-3 py-2 border border-kq-black-100 rounded-md shadow-sm focus:outline-none focus:ring-kq-blue focus:border-kq-blue bg-kq-black-300 text-kq-white"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium">Confirm Password</label>
          <input 
            v-model="confirmPassword" 
            type="password" 
            required
            minlength="6"
            class="mt-1 block w-full px-3 py-2 border border-kq-black-100 rounded-md shadow-sm focus:outline-none focus:ring-kq-blue focus:border-kq-blue bg-kq-black-300 text-kq-white"
          />
        </div>
        
        <div>
          <button 
            type="submit"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-kq-black-200 bg-kq-yellow hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kq-yellow"
            :disabled="loading"
          >
            <span v-if="loading">Updating...</span>
            <span v-else>Update Password</span>
          </button>
        </div>
      </form>
      
      <div v-if="success" class="mt-6 text-center">
        <NuxtLink to="/login" class="inline-block bg-kq-blue hover:bg-kq-blue-light text-white font-medium py-2 px-4 rounded transition-colors">
          Go to Login
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const client = useSupabaseClient()
const router = useRouter()
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const success = ref('')
const loading = ref(false)

async function handleUpdatePassword() {
  try {
    loading.value = true
    error.value = ''
    
    // Check if passwords match
    if (password.value !== confirmPassword.value) {
      error.value = 'Passwords do not match'
      return
    }
    
    const { error: updateError } = await client.auth.updateUser({
      password: password.value
    })
    
    if (updateError) throw updateError
    
    success.value = 'Password has been updated successfully!'
    password.value = ''
    confirmPassword.value = ''
    
    // Sign out the user after password change
    setTimeout(async () => {
      await client.auth.signOut()
    }, 3000)
    
  } catch (e: any) {
    error.value = e.message || 'An error occurred during password update'
  } finally {
    loading.value = false
  }
}
</script>
