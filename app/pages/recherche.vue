<template>
  <div class="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
    <NuxtLink
      to="/"
      class="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
    >
      ← Retour à l’accueil
    </NuxtLink>

    <h1 class="mt-6 font-serif text-3xl font-semibold sm:text-4xl">
      Restaurants recommandés
    </h1>
    <p class="mt-2 text-sm text-muted-foreground">
      <template v-if="query">
        Résultats pour « {{ query }} »
      </template>
      <template v-else>
        Saisissez un nom de restaurant, une cuisine ou un quartier.
      </template>
    </p>

    <form
      class="mt-8 flex w-full max-w-xl flex-col gap-3 rounded-3xl bg-secondary px-4 py-3 sm:flex-row sm:items-center sm:rounded-full sm:px-5"
      role="search"
      @submit.prevent="submitSearch"
    >
      <label class="sr-only" for="results-search">
        Rechercher un restaurant, une cuisine ou un quartier
      </label>
      <input
        id="results-search"
        v-model="searchQuery"
        type="search"
        placeholder="Rechercher un restaurant, une cuisine ou un quartier..."
        class="min-w-0 w-full flex-1 bg-transparent px-1 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
      >
      <Button type="submit" class="w-full rounded-full sm:w-auto">
        Rechercher
      </Button>
    </form>

    <p
      v-if="isLoading"
      class="mt-8 text-sm text-muted-foreground"
    >
      Chargement des restaurants…
    </p>
    <p
      v-else-if="errorMessage"
      class="mt-8 text-sm text-destructive"
      role="alert"
    >
      {{ errorMessage }}
    </p>
    <div
      v-else-if="matchedRestaurants.length > 0"
      class="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3"
    >
      <RestaurantCard
        v-for="restaurant in matchedRestaurants"
        :key="restaurant.id"
        :id="restaurant.id"
        :name="restaurant.name"
        :cuisine="restaurant.cuisine"
        :neighborhood="restaurant.neighborhood"
        :review="restaurant.review"
        :image="restaurant.image"
        :alt="restaurant.alt"
      />
    </div>
    <p
      v-else
      class="mt-8 text-sm text-muted-foreground"
    >
      {{ emptyMessage }}
    </p>
  </div>
</template>

<script setup>
import { Button } from '@/components/ui/button'

const route = useRoute()
const { restaurants, isLoading, errorMessage, loadRestaurants } = useRestaurants()

const searchQuery = ref(String(route.query.q || ''))

const query = computed(() => String(route.query.q || '').trim())

const matchedRestaurants = computed(() => {
  return filterRestaurantsByQuery(restaurants.value, query.value)
})

const emptyMessage = computed(() => {
  if (!query.value) {
    return 'Saisissez un mot-clé pour voir des restaurants recommandés.'
  }

  return 'Aucune adresse ne correspond à cette recherche.'
})

function submitSearch() {
  const q = searchQuery.value.trim()

  navigateTo({
    path: '/recherche',
    query: q ? { q } : {},
  })
}

watch(
  () => route.query.q,
  (value) => {
    searchQuery.value = String(value || '')
  },
)

onMounted(() => {
  loadRestaurants()
})

useHead({
  title: computed(() => {
    if (query.value) {
      return `Recherche : ${query.value} — Saveur de Chine à Paris`
    }

    return 'Recherche — Saveur de Chine à Paris'
  }),
})
</script>
