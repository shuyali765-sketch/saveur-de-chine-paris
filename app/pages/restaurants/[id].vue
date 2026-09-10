<template>
  <div class="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
    <NuxtLink
      to="/"
      class="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
    >
      ← Retour à l’accueil
    </NuxtLink>

    <p
      v-if="isLoading"
      class="mt-8 text-sm text-muted-foreground"
    >
      Chargement du restaurant…
    </p>

    <p
      v-else-if="pageError"
      class="mt-8 text-sm text-destructive"
      role="alert"
    >
      {{ pageError }}
    </p>

    <template v-else-if="restaurant">
      <div class="mt-8">
        <RestaurantCard
          :id="restaurant.id"
          :name="restaurant.name"
          :cuisine="restaurant.cuisine"
          :neighborhood="restaurant.neighborhood"
          :review="restaurant.review"
          :image="restaurant.image"
          :alt="restaurant.alt"
          :show-details-link="false"
        />
      </div>

      <section
        v-if="hasExtraDetails"
        class="mt-8 rounded-2xl border border-border bg-card p-4 sm:p-5"
      >
        <h2 class="font-serif text-2xl font-semibold sm:text-3xl">
          Fiche du restaurant
        </h2>
        <dl class="mt-5 space-y-4 text-sm">
          <div v-if="restaurant.address">
            <dt class="font-medium text-foreground">
              Adresse
            </dt>
            <dd class="mt-1 text-muted-foreground">
              {{ restaurant.address }}
            </dd>
          </div>
          <div v-if="restaurant.quartier">
            <dt class="font-medium text-foreground">
              Quartier
            </dt>
            <dd class="mt-1 text-muted-foreground">
              {{ restaurant.quartier }}
            </dd>
          </div>
          <div v-if="restaurant.arrondissement">
            <dt class="font-medium text-foreground">
              Arrondissement
            </dt>
            <dd class="mt-1 text-muted-foreground">
              {{ restaurant.arrondissement }}
            </dd>
          </div>
          <div v-if="restaurant.priceRange">
            <dt class="font-medium text-foreground">
              Prix
            </dt>
            <dd class="mt-1 text-muted-foreground">
              {{ restaurant.priceRange }}
            </dd>
          </div>
          <div v-if="restaurant.rating">
            <dt class="font-medium text-foreground">
              Note
            </dt>
            <dd class="mt-1 text-muted-foreground">
              {{ restaurant.rating }}
            </dd>
          </div>
          <div v-if="restaurant.recommendedDishes.length">
            <dt class="font-medium text-foreground">
              Plats recommandés
            </dt>
            <dd class="mt-1">
              <ul class="list-disc space-y-1 pl-5 text-muted-foreground">
                <li
                  v-for="dish in restaurant.recommendedDishes"
                  :key="dish"
                >
                  {{ dish }}
                </li>
              </ul>
            </dd>
          </div>
          <div v-if="restaurant.googleMapsUrl">
            <dt class="font-medium text-foreground">
              Itinéraire
            </dt>
            <dd class="mt-1">
              <a
                :href="restaurant.googleMapsUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="font-medium text-primary underline-offset-4 hover:underline"
              >
                Voir sur Google Maps
              </a>
            </dd>
          </div>
        </dl>
      </section>

      <RestaurantComments :restaurant-id="restaurant.id" />
    </template>

    <p
      v-else
      class="mt-8 text-sm text-muted-foreground"
    >
      Restaurant introuvable.
    </p>
  </div>
</template>

<script setup>
const route = useRoute()
const { loadRestaurantById } = useRestaurants()

const restaurant = ref(null)
const isLoading = ref(true)
const pageError = ref('')

const hasExtraDetails = computed(() => {
  if (!restaurant.value) {
    return false
  }

  return Boolean(
    restaurant.value.address
    || restaurant.value.quartier
    || restaurant.value.arrondissement
    || restaurant.value.priceRange
    || restaurant.value.rating
    || restaurant.value.googleMapsUrl
    || restaurant.value.recommendedDishes?.length,
  )
})

async function loadPage() {
  isLoading.value = true
  pageError.value = ''

  try {
    const result = await loadRestaurantById(route.params.id)
    restaurant.value = result.restaurant
    pageError.value = result.error || ''
  }
  catch {
    restaurant.value = null
    pageError.value = 'Impossible de charger le restaurant. Veuillez réessayer plus tard.'
  }
  finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadPage()
})

watch(() => route.params.id, () => {
  loadPage()
})

useHead({
  title: () => restaurant.value
    ? `${restaurant.value.name} — Saveur de Chine à Paris`
    : 'Restaurant — Saveur de Chine à Paris',
})
</script>
