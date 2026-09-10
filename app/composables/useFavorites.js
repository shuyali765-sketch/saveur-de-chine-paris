export function useFavorites() {
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
    const supabase = useSupabaseClient()
    loginHint.value = ''

    if (!supabase || !isLoggedIn.value) {
      favoriteIds.value = []
      favoriteRestaurants.value = []
      isLoading.value = false
      return
    }

    isLoading.value = true
    errorMessage.value = ''

    try {
      const { data: favs, error } = await supabase
        .from('user_favori')
        .select('restaurant_id, created_at')
        .eq('user_id', userId.value)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      const ids = (favs || []).map((row) => row.restaurant_id).filter(Boolean)
      favoriteIds.value = ids

      if (ids.length === 0) {
        favoriteRestaurants.value = []
        return
      }

      const { data: restaurantRows, error: restaurantError } = await supabase
        .from('restaurants')
        .select('*')

      if (restaurantError) {
        throw restaurantError
      }

      const byId = {}
      for (const row of restaurantRows || []) {
        const mapped = mapRestaurant(row)
        if (mapped?.id != null) {
          byId[String(mapped.id)] = mapped
        }
      }

      favoriteRestaurants.value = ids
        .map((id) => byId[String(id)])
        .filter(Boolean)
    }
    catch (error) {
      errorMessage.value = error?.message || 'Impossible de charger vos favoris.'
      favoriteIds.value = []
      favoriteRestaurants.value = []
    }
    finally {
      isLoading.value = false
    }
  }

  async function toggleFavorite(restaurantId) {
    const supabase = useSupabaseClient()
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

    const looksLikeUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(restaurantId))
    if (!looksLikeUuid) {
      errorMessage.value = 'Ce restaurant n’est pas encore enregistré dans la table restaurants de Supabase.'
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

      if ((error.message || '').includes('invalid input syntax for type uuid')) {
        errorMessage.value = 'Ce restaurant n’est pas encore enregistré dans la table restaurants de Supabase.'
        return { ok: false }
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
