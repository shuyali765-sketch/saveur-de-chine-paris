export function getRestaurantId(row) {
  if (!row || typeof row !== 'object') {
    return null
  }

  const preferredKeys = ['id', 'restaurant_id', 'id_restaurant', 'uuid', 'nom', 'name']

  for (const key of preferredKeys) {
    if (row[key] != null && row[key] !== '') {
      return row[key]
    }
  }

  return null
}

export function mapRestaurant(row) {
  if (!row) {
    return null
  }

  const id = getRestaurantId(row)
  const name = row.name || row.nom || ''

  if (id == null) {
    return null
  }

  return {
    id,
    name,
    cuisine: row.cuisine || row.category || '',
    neighborhood: row.neighborhood || row.quartier || row.arrondissement || '',
    review: row.review || row.description || row.avis || '',
    image: row.image || row.image_url || row.photo || '/images/plats-chinois.jpg',
    alt: row.alt || name || 'Restaurant chinois à Paris',
  }
}

export function useRestaurants() {
  const supabase = useSupabaseClient()
  const restaurants = useState('restaurants-list', () => [])
  const isLoading = useState('restaurants-loading', () => false)
  const errorMessage = useState('restaurants-error', () => '')

  async function loadRestaurants() {
    if (!supabase) {
      errorMessage.value = 'Connexion à Supabase indisponible.'
      restaurants.value = []
      return
    }

    isLoading.value = true
    errorMessage.value = ''

    const { data, error } = await supabase
      .from('restaurants')
      .select('*')

    isLoading.value = false

    if (error) {
      errorMessage.value = error.message || 'Impossible de charger les restaurants.'
      restaurants.value = []
      return
    }

    restaurants.value = (data || [])
      .map(mapRestaurant)
      .filter(Boolean)
      .sort((a, b) => a.name.localeCompare(b.name, 'fr'))
  }

  async function loadRestaurantById(id) {
    if (!supabase || !id) {
      return { restaurant: null, error: 'Restaurant introuvable.' }
    }

    const cached = restaurants.value.find((item) => String(item.id) === String(id))
    if (cached) {
      return { restaurant: cached, error: null }
    }

    const { data, error } = await supabase
      .from('restaurants')
      .select('*')

    if (error) {
      return { restaurant: null, error: error.message || 'Restaurant introuvable.' }
    }

    const row = (data || []).find((item) => String(getRestaurantId(item)) === String(id))

    if (!row) {
      return { restaurant: null, error: 'Restaurant introuvable.' }
    }

    return { restaurant: mapRestaurant(row), error: null }
  }

  return {
    restaurants,
    isLoading,
    errorMessage,
    loadRestaurants,
    loadRestaurantById,
  }
}
