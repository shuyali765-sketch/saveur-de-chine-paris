export default defineNuxtPlugin({
  name: 'auth-profile',
  async setup() {
    const supabase = useSupabaseClient()
    const userStore = useUserStore()

    async function syncProfile() {
      await loadUserProfile()
      userStore.setAuthReady(true)
    }

    await syncProfile()

    supabase.auth.onAuthStateChange(async () => {
      await syncProfile()
    })
  },
})
