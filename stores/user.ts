import { defineStore } from 'pinia'
import type { User } from '~/types'

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const isLoggedIn = computed(() => !!user.value)
  const email = computed(() => user.value?.email || '')

  function setUser(newUser: User | null) {
    user.value = newUser
  }

  async function logout() {
    const client = useSupabaseClient()
    await client.auth.signOut()
    user.value = null
  }

  return {
    user,
    isLoggedIn,
    email,
    setUser,
    logout
  }
})
