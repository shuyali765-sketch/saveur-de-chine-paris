<template>
  <div class="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
    <h1 class="font-serif text-3xl font-semibold sm:text-4xl">
      Mes favoris
    </h1>
    <p class="mt-2 text-sm text-muted-foreground">
      Les adresses que vous avez marquées d’un cœur.
    </p>

    <div
      v-if="favoriteRestaurants.length > 0"
      class="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3"
    >
      <RestaurantCard
        v-for="restaurant in favoriteRestaurants"
        :key="restaurant.name"
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
      Vous n’avez pas encore de restaurant favori. Cliquez sur le cœur à côté du nom pour en ajouter.
    </p>
  </div>
</template>

<script setup>
const userStore = useUserStore()

const favoriteRestaurants = computed(() => {
  return restaurants.filter((restaurant) => userStore.isFavorite(restaurant.name))
})

useHead({
  title: 'Mes favoris — Saveur de Chine à Paris',
})
</script>
