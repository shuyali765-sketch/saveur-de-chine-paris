import { mapRestaurant } from '~/composables/useRestaurants'

function favoriteErrorMessage(error, fallback) {
  const code = error?.code || ''
  const text = String(error?.message || '').toLowerCase()

  if (code === '42501' || text.includes('row-level security') || text.includes('permission')) {
    return 'Action non autorisée. Veuillez vous reconnecter.'
  }

  if (code === '23503' || text.includes('foreign key')) {
    return 'Ce restaurant est introuvable dans la base de données.'
  }

  if (code === '22P02' || text.includes('invalid input syntax')) {
    return 'Ce restaurant est introuvable dans la base de données.'
  }

  if (text.includes('jwt') || text.includes('not authenticated')) {
    return 'Votre session a expiré. Veuillez vous reconnecter.'
  }

  return fallback
}

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
        .select('user_id, restaurant_id, created_at')
        .eq('user_id', userId.value)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      const ids = (favs || []).map((row) => row.restaurant_id).filter(Boolean)
      favoriteIds.value = [...new Set(ids.map((id) => String(id)))]

      if (favoriteIds.value.length === 0) {
        favoriteRestaurants.value = []
        return
      }

      const { data: restaurantRows, error: restaurantError } = await supabase
        .from('restaurants')
        .select('*')
        .in('restaurant_id', favoriteIds.value)

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

      favoriteRestaurants.value = favoriteIds.value
        .map((id) => byId[String(id)])
        .filter(Boolean)
    }
    catch (error) {
      errorMessage.value = favoriteErrorMessage(
        error,
        'Impossible de charger vos favoris. Veuillez réessayer.',
      )
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

    if (pendingId.value) {
      return { ok: false }
    }

    if (!supabase || !userId.value || !restaurantId) {
      errorMessage.value = 'Action indisponible. Veuillez réessayer plus tard.'
      return { ok: false }
    }

    const restaurantKey = String(restaurantId)
    const looksLikeUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(restaurantKey)
    if (!looksLikeUuid) {
      errorMessage.value = 'Ce restaurant est introuvable dans la base de données.'
      return { ok: false }
    }

    pendingId.value = restaurantKey

    try {
      if (isFavorite(restaurantKey)) {
        const { error } = await supabase
          .from('user_favori')
          .delete()
          .eq('user_id', userId.value)
          .eq('restaurant_id', restaurantKey)

        if (error) {
          errorMessage.value = favoriteErrorMessage(
            error,
            'Impossible de retirer ce restaurant des favoris.',
          )
          return { ok: false }
        }

        await loadFavorites()
        return { ok: true }
      }

      const { error } = await supabase
        .from('user_favori')
        .insert({
          user_id: userId.value,
          restaurant_id: restaurantKey,
        })

      if (error) {
        if (error.code === '23505') {
          await loadFavorites()
          return { ok: true }
        }

        errorMessage.value = favoriteErrorMessage(
          error,
          'Impossible d’ajouter ce restaurant aux favoris.',
        )
        return { ok: false }
      }

      await loadFavorites()
      return { ok: true }
    }
    finally {
      pendingId.value = null
    }
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
