export function useFavorites() {
  const supabase = useSupabaseClient()
  const { userId, isLoggedIn } = useAuthSession()
  const favoriteIds = useState('favorite-ids', () => [])
  const favoriteRestaurants = useState('favorite-restaurants', () => [])
  const isLoading = useState('favorites-loading', () => false)
  const errorMessage = useState('favorites-error', () => '')
  const loginHint = useState('favorites-login-hint', () => '')
  const pendingId = useState('favorites-pending-id', () => null)

  function isFavorite(restaurantId) {
    return favoriteIds.value.some((id) => String(id) === String(restaurantId))
  }

  async function loadFavorites() {
    loginHint.value = ''

    if (!supabase || !isLoggedIn.value) {
      favoriteIds.value = []
      favoriteRestaurants.value = []
      return
    }

    isLoading.value = true
    errorMessage.value = ''

    let { data, error } = await supabase
      .from('user_favori')
      .select('restaurant_id, restaurants(*)')
      .eq('user_id', userId.value)
      .order('created_at', { ascending: false })

    if (error) {
      const fallback = await supabase
        .from('user_favori')
        .select('restaurant_id')
        .eq('user_id', userId.value)
        .order('created_at', { ascending: false })

      data = fallback.data
      error = fallback.error

      if (!error && data?.length) {
        const ids = data.map((row) => row.restaurant_id)
        const { data: restaurantRows } = await supabase
          .from('restaurants')
          .select('*')

        const byId = {}
        for (const row of restaurantRows || []) {
          const restaurantId = getRestaurantId(row)
          if (restaurantId != null) {
            byId[String(restaurantId)] = row
          }
        }

        data = data.map((row) => ({
          restaurant_id: row.restaurant_id,
          restaurants: byId[String(row.restaurant_id)] || null,
        }))
      }
    }

    isLoading.value = false

    if (error) {
      errorMessage.value = error.message || 'Impossible de charger vos favoris.'
      favoriteIds.value = []
      favoriteRestaurants.value = []
      return
    }

    const rows = data || []
    favoriteIds.value = rows.map((row) => row.restaurant_id)
    favoriteRestaurants.value = rows
      .map((row) => mapRestaurant(row.restaurants))
      .filter(Boolean)
  }

  async function toggleFavorite(restaurantId) {
    loginHint.value = ''
    errorMessage.value = ''

    if (!isLoggedIn.value) {
      loginHint.value = 'Connectez-vous pour ajouter ce restaurant à vos favoris.'
      return { ok: false, needsLogin: true }
    }

    if (!supabase || !restaurantId) {
      errorMessage.value = 'Action indisponible. Réessayez plus tard.'
      return { ok: false }
    }

    pendingId.value = restaurantId

    if (isFavorite(restaurantId)) {
      const { error } = await supabase
        .from('user_favori')
        .delete()
        .eq('user_id', userId.value)
        .eq('restaurant_id', restaurantId)

      pendingId.value = null

      if (error) {
        errorMessage.value = error.message || 'Impossible de retirer ce favori.'
        return { ok: false }
      }

      await loadFavorites()
      return { ok: true }
    }

    const { error } = await supabase
      .from('user_favori')
      .insert({
        user_id: userId.value,
        restaurant_id: restaurantId,
      })

    pendingId.value = null

    if (error) {
      if (error.code === '23505') {
        await loadFavorites()
        return { ok: true }
      }

      errorMessage.value = error.message || 'Impossible d’ajouter ce favori.'
      return { ok: false }
    }

    await loadFavorites()
    return { ok: true }
  }

  return {
    favoriteIds,
    favoriteRestaurants,
    isLoading,
    errorMessage,
    loginHint,
    pendingId,
    isFavorite,
    loadFavorites,
    toggleFavorite,
  }
}
