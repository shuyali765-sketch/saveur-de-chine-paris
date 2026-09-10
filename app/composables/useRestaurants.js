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

  const preferredKeys = ['restaurant_id', 'id', 'id_restaurant', 'uuid']

  for (const key of preferredKeys) {
    if (row[key] != null && row[key] !== '') {
      return row[key]
    }
  }

  return null
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

export function restaurantMatchesSearchQuery(row, query) {
  const tokens = toSearchWords(query)

  if (tokens.length === 0) {
    return true
  }

  const cuisine = Array.isArray(row.cuisine)
    ? row.cuisine
    : (row.cuisine || '')

  const words = toSearchWords([
    row.name,
    row.arrondissement,
    row.adresse,
    cuisine,
  ])

  return tokens.every((token) => words.some((word) => tokenMatchesWord(token, word)))
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
    cuisine: Array.isArray(row.cuisine) ? row.cuisine : (row.cuisine || ''),
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

async function fetchRestaurantRows() {
  const supabase = useSupabaseClient()

  if (!supabase) {
    return {
      rows: [],
      error: 'Impossible de joindre la base de données. Veuillez réessayer plus tard.',
    }
  }

  const { data, error } = await supabase
    .from('restaurants')
    .select('*')

  if (error) {
    return {
      rows: [],
      error: 'Impossible de charger les restaurants. Veuillez réessayer plus tard.',
    }
  }

  return {
    rows: data || [],
    error: null,
  }
}

function sortRestaurants(list) {
  return list.sort((a, b) => a.name.localeCompare(b.name, 'fr'))
}

export function useRestaurants() {
  const restaurantList = useState('restaurants-list', () => [])
  const isLoading = useState('restaurants-loading', () => false)
  const errorMessage = useState('restaurants-error', () => '')

  async function loadRestaurants() {
    isLoading.value = true
    errorMessage.value = ''
    restaurantList.value = []

    try {
      const { rows, error } = await fetchRestaurantRows()

      if (error) {
        errorMessage.value = error
        return
      }

      restaurantList.value = sortRestaurants(
        rows.map(mapRestaurant).filter(Boolean),
      )
    }
    catch {
      errorMessage.value = 'Impossible de charger les restaurants. Veuillez réessayer plus tard.'
      restaurantList.value = []
    }
    finally {
      isLoading.value = false
    }
  }

  async function loadRestaurantById(id) {
    if (!id) {
      return { restaurant: null, error: 'Restaurant introuvable.' }
    }

    try {
      const { rows, error } = await fetchRestaurantRows()

      if (error) {
        return {
          restaurant: null,
          error: error.includes('joindre')
            ? error
            : 'Impossible de charger le restaurant. Veuillez réessayer plus tard.',
        }
      }

      const row = rows.find((item) => String(getRestaurantId(item)) === String(id))
      if (row) {
        return { restaurant: mapRestaurant(row), error: null }
      }

      return { restaurant: null, error: 'Restaurant introuvable.' }
    }
    catch {
      return { restaurant: null, error: 'Impossible de charger le restaurant. Veuillez réessayer plus tard.' }
    }
  }

  async function searchRestaurants(query) {
    try {
      const { rows, error } = await fetchRestaurantRows()

      if (error) {
        return {
          restaurants: [],
          error,
        }
      }

      return {
        restaurants: sortRestaurants(
          rows
            .filter((row) => restaurantMatchesSearchQuery(row, query))
            .map(mapRestaurant)
            .filter(Boolean),
        ),
        error: null,
      }
    }
    catch {
      return {
        restaurants: [],
        error: 'Impossible de charger les restaurants. Veuillez réessayer plus tard.',
      }
    }
  }

  return {
    restaurants: restaurantList,
    isLoading,
    errorMessage,
    loadRestaurants,
    loadRestaurantById,
    searchRestaurants,
  }
}
