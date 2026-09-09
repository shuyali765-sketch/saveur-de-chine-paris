<template>
  <div class="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
    <h1 class="font-serif text-3xl font-semibold sm:text-4xl">
      Mes favoris
    </h1>
    <p class="mt-2 text-sm text-muted-foreground">
      Les adresses que vous avez marquées d’un cœur.
    </p>

    <p
      v-if="!isAuthReady || isLoading"
      class="mt-8 text-sm text-muted-foreground"
    >
      Chargement…
    </p>

    <p
      v-else-if="!isLoggedIn"
      class="mt-8 text-sm text-muted-foreground"
    >
      Connectez-vous pour voir vos restaurants favoris.
      <NuxtLink
        to="/login"
        class="font-medium text-primary underline-offset-4 hover:underline"
      >
        Se connecter
      </NuxtLink>
    </p>

    <p
      v-else-if="errorMessage"
      class="mt-8 text-sm text-destructive"
      role="alert"
    >
      {{ errorMessage }}
    </p>

    <div
      v-else-if="favoriteRestaurants.length > 0"
      class="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3"
    >
      <RestaurantCard
        v-for="restaurant in favoriteRestaurants"
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
      Vous n’avez pas encore de restaurant favori.
    </p>
  </div>
</template>

<script setup>
const { isLoggedIn, isAuthReady } = useAuthSession()
const {
  favoriteRestaurants,
  isLoading,
  errorMessage,
  loadFavorites,
} = useFavorites()

onMounted(() => {
  loadFavorites()
})

watch(isLoggedIn, () => {
  loadFavorites()
})

useHead({
  title: 'Mes favoris — Saveur de Chine à Paris',
})
</script>
