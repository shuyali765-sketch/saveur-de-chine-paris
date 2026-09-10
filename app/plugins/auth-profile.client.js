export default defineNuxtPlugin({
  name: 'auth-profile',
  dependsOn: ['supabase'],
  async setup() {
    const supabase = useSupabaseClient()
    const userStore = useUserStore()
    const { loadFavorites } = useFavorites()

    async function syncProfile() {
      await ensureUserProfile()
      await loadFavorites()
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

