import { restaurants as localRestaurantData } from '~/utils/restaurants'

const quartierByRestaurantName = {
  'Le Bourgeon 花杞厨': 'Châtelet',
}

function textValue(value) {
  if (Array.isArray(value)) {
    return value
      .filter(Boolean)
      .map((item) => String(item).trim())
      .filter(Boolean)
      .join(', ')
  }

  if (value == null) {
    return ''
  }

  return String(value).trim()
}

export function formatNeighborhoodLabel(row) {
  const name = textValue(row.name || row.nom || row.titre || row.title)
  const quartier = textValue(row.quartier) || quartierByRestaurantName[name] || ''
  const arrondissement = textValue(row.arrondissement)
  const neighborhood = textValue(row.neighborhood)
  const address = textValue(row.adresse || row.address || row.location)

  if (quartier && arrondissement && !arrondissement.toLowerCase().includes(quartier.toLowerCase())) {
    return `${quartier}, ${arrondissement}`
  }

  if (quartier && neighborhood && !neighborhood.toLowerCase().includes(quartier.toLowerCase())) {
    return `${quartier}, ${neighborhood}`
  }

  return neighborhood || quartier || arrondissement || address || ''
}

export function getRestaurantId(row) {
  if (!row || typeof row !== 'object') {
    return null
  }

  const preferredKeys = ['id', 'restaurant_id', 'id_restaurant', 'uuid', 'nom', 'name', 'titre', 'title']

  for (const key of preferredKeys) {
    if (row[key] != null && row[key] !== '') {
      return row[key]
    }
  }

  return null
}

export function formatCuisineLabel(cuisine) {
  if (Array.isArray(cuisine)) {
    return cuisine.filter(Boolean).join(' · ')
  }

  return cuisine || ''
}

function toList(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean)
  }

  const text = textValue(value)
  if (!text) {
    return []
  }

  return [text]
}

function normalizeSearchText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function toSearchWords(value) {
  if (Array.isArray(value)) {
    return value.flatMap((item) => toSearchWords(item))
  }

  return normalizeSearchText(value)
    .split(/[^a-z0-9\u4e00-\u9fff]+/)
    .filter(Boolean)
}

function frenchStem(word) {
  if (word.length <= 3) {
    return word
  }

  if (word.endsWith('s') && !word.endsWith('ss')) {
    return word.slice(0, -1)
  }

  if (word.endsWith('x')) {
    return word.slice(0, -1)
  }

  return word
}

function tokenMatchesWord(token, word) {
  if (!token || !word) {
    return false
  }

  if (word.includes(token) || (token.length >= 3 && word.length >= 3 && token.includes(word))) {
    return true
  }

  return frenchStem(word) === frenchStem(token)
}

export function filterRestaurantsByQuery(restaurants, query) {
  const tokens = toSearchWords(query)

  if (tokens.length === 0) {
    return restaurants
  }

  return restaurants.filter((restaurant) => {
    const words = toSearchWords([
      restaurant.name,
      restaurant.cuisine,
      restaurant.neighborhood,
      restaurant.quartier,
      restaurant.review,
    ])

    return tokens.every((token) => words.some((word) => tokenMatchesWord(token, word)))
  })
}

export function mapRestaurant(row) {
  if (!row) {
    return null
  }

  const id = getRestaurantId(row)
  const name = row.name || row.nom || row.titre || row.title || ''

  if (id == null) {
    return null
  }

  return {
    id,
    name,
    cuisine: formatCuisineLabel(row.cuisine || row.category || row.type_cuisine || ''),
    neighborhood: formatNeighborhoodLabel(row),
    quartier: textValue(row.quartier) || quartierByRestaurantName[name] || '',
    arrondissement: textValue(row.arrondissement),
    address: textValue(row.adresse || row.address || row.location),
    priceRange: textValue(row.price_range || row.prix),
    rating: row.rating == null || row.rating === '' ? '' : String(row.rating),
    googleMapsUrl: textValue(row.google_maps_url || row.maps_url),
    recommendedDishes: toList(row.recommanded_dishes || row.recommended_dishes || row.plats_recommandes),
    review: row.review || row.description || row.avis || row.texte || '',
    image: row.image || row.image_url || row.photo || row.photo_url || row.cover || '/images/plats-chinois.jpg',
    alt: row.alt || name || 'Restaurant chinois à Paris',
  }
}

function localRestaurantCards() {
  return localRestaurantData.map((item) => ({
    id: item.id || item.name,
    name: item.name,
    cuisine: formatCuisineLabel(item.cuisine),
    neighborhood: item.neighborhood,
    quartier: item.quartier || '',
    arrondissement: item.arrondissement || '',
    address: item.address || item.adresse || '',
    priceRange: item.priceRange || '',
    rating: item.rating == null ? '' : String(item.rating),
    googleMapsUrl: item.googleMapsUrl || '',
    recommendedDishes: toList(item.recommendedDishes),
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
    restaurantList.value = []

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

    const cached = restaurantList.value.find((item) => String(item.id) === String(id))
    if (cached) {
      return { restaurant: cached, error: null }
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
