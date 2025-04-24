<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-4 bg-kq-black-100 text-kq-white">
    <div class="max-w-md w-full bg-kq-black-200 rounded-lg shadow-md p-6">
      <div v-if="loading" class="text-center">
        <div class="mb-4">
          <div class="animate-spin h-10 w-10 border-4 border-kq-blue rounded-full border-t-transparent mx-auto"></div>
        </div>
        <p>Verifying your email...</p>
      </div>
      
      <div v-else-if="error" class="text-center">
        <div class="mb-4 text-red-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 class="text-xl font-bold mb-2">Verification Failed</h2>
        <p class="mb-4">{{ error }}</p>
        <NuxtLink to="/login" class="text-kq-blue hover:text-kq-blue-light">
          Return to login
        </NuxtLink>
      </div>
      
      <div v-else class="text-center">
        <div class="mb-4 text-green-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 class="text-xl font-bold mb-2">Email Verified!</h2>
        <p class="mb-4">Your email has been successfully verified.</p>
        <NuxtLink to="/" class="inline-block bg-kq-blue hover:bg-kq-blue-light text-white font-medium py-2 px-4 rounded transition-colors">
          Start Typing
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const client = useSupabaseClient();
const user = useSupabaseUser();
const router = useRouter();
const loading = ref(true);
const error = ref<string | null>(null);
const success = ref(false);

onMounted(async () => {
  // Check if we have a token in the URL
  const token = route.query.token as string;
  const type = route.query.type as string;
  
  if (token && type === 'email_confirmation') {
    try {
      // Verify the email
      const { error: verifyError } = await client.auth.verifyOtp({
        token_hash: token,
        type: 'email_confirmation'
      });
      
      if (verifyError) {
        throw verifyError;
      }
      
      success.value = true;
    } catch (err: any) {
      error.value = err.message || 'Failed to verify email';
    } finally {
      loading.value = false;
    }
  } else if (user.value) {
    // User is already logged in, redirect to home
    router.push('/');
  } else {
    // No token and no user, check for hash fragment
    const hash = window.location.hash;
    if (hash && hash.includes('type=email_confirmation')) {
      // Extract token from hash
      const hashParams = new URLSearchParams(hash.substring(1));
      const hashToken = hashParams.get('access_token');
      const hashType = hashParams.get('type');
      
      if (hashToken && hashType === 'email_confirmation') {
        try {
          // Verify the email
          const { error: verifyError } = await client.auth.verifyOtp({
            token_hash: hashToken,
            type: 'email_confirmation'
          });
          
          if (verifyError) {
            throw verifyError;
          }
          
          success.value = true;
        } catch (err: any) {
          error.value = err.message || 'Failed to verify email';
        } finally {
          loading.value = false;
        }
      } else {
        error.value = 'Invalid verification link';
        loading.value = false;
      }
    } else {
      // Just waiting for auth to complete
      setTimeout(() => {
        if (!user.value) {
          error.value = 'Authentication failed';
          loading.value = false;
        }
      }, 3000);
    }
  }
});

// Redirect to home page once user is authenticated
watchEffect(() => {
  if (user.value && !loading.value) {
    router.push('/');
  }
});
</script>
