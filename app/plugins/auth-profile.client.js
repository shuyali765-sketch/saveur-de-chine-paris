export default defineNuxtPlugin({
  name: 'auth-profile',
  dependsOn: ['supabase'],
  async setup() {
    const supabase = useSupabaseClient()
    const userStore = useUserStore()

    async function syncProfile() {
      await loadUserProfile()
      userStore.setAuthReady(true)
    }

    await syncProfile()

    if (!supabase) {
      return
    }

    supabase.auth.onAuthStateChange(async () => {
      await syncProfile()
    })
  },
})

