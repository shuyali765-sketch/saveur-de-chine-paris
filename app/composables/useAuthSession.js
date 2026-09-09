export function useAuthSession() {
  const user = useSupabaseUser()
  const userStore = useUserStore()

  const userId = computed(() => user.value?.id || user.value?.sub || null)
  const isLoggedIn = computed(() => Boolean(userId.value))
  const isAuthReady = computed(() => userStore.authReady)

  return {
    user,
    userId,
    isLoggedIn,
    isAuthReady,
    userStore,
  }
}
