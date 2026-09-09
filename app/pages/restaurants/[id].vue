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
        />
      </div>

      <RestaurantComments :restaurant-id="restaurant.id" />
    </template>
  </div>
</template>

<script setup>
const route = useRoute()
const { loadRestaurantById } = useRestaurants()

const restaurant = ref(null)
const isLoading = ref(true)
const pageError = ref('')

async function loadPage() {
  isLoading.value = true
  pageError.value = ''
  const result = await loadRestaurantById(route.params.id)
  restaurant.value = result.restaurant
  pageError.value = result.error || ''
  isLoading.value = false
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
