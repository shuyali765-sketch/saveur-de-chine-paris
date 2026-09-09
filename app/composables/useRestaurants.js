import { restaurants as localRestaurantData } from '~/utils/restaurants'

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

function localRestaurantCards() {
  return localRestaurantData.map((item) => ({
    id: item.id || item.name,
    name: item.name,
    cuisine: item.cuisine,
    neighborhood: item.neighborhood,
    review: item.review,
    image: item.image,
    alt: item.alt,
  }))
}

export function useRestaurants() {
  const restaurantList = useState('restaurants-list', () => [])
  const isLoading = useState('restaurants-loading', () => false)
  const errorMessage = useState('restaurants-error', () => '')

  async function loadRestaurants() {
    const supabase = useSupabaseClient()
    isLoading.value = true
    errorMessage.value = ''

    if (supabase) {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')

      if (!error) {
        const mapped = (data || [])
          .map(mapRestaurant)
          .filter(Boolean)
          .sort((a, b) => a.name.localeCompare(b.name, 'fr'))

        if (mapped.length > 0) {
          restaurantList.value = mapped
          isLoading.value = false
          return
        }
      }
    }

    restaurantList.value = localRestaurantCards()
    isLoading.value = false
  }

  async function loadRestaurantById(id) {
    if (!id) {
      return { restaurant: null, error: 'Restaurant introuvable.' }
    }

    const cached = restaurantList.value.find((item) => String(item.id) === String(id))
    if (cached) {
      return { restaurant: cached, error: null }
    }

    const supabase = useSupabaseClient()

    if (supabase) {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')

      if (!error) {
        const row = (data || []).find((item) => String(getRestaurantId(item)) === String(id))
        if (row) {
          return { restaurant: mapRestaurant(row), error: null }
        }
      }
    }

    const local = localRestaurantCards().find((item) => String(item.id) === String(id))
    if (local) {
      return { restaurant: local, error: null }
    }

    return { restaurant: null, error: 'Restaurant introuvable.' }
  }

  return {
    restaurants: restaurantList,
    isLoading,
    errorMessage,
    loadRestaurants,
    loadRestaurantById,
  }
}
