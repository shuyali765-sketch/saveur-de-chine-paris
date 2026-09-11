<template>
  <div class="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
    <section class="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
      <div class="min-w-0">
        <p class="max-w-xl text-sm italic leading-relaxed text-primary/75 sm:text-base">
          « La mémoire des saveurs raconte d’où nous venons. »
        </p>
        <h1 class="mt-4 font-serif text-3xl font-semibold tracking-tight text-pretty text-foreground sm:mt-5 sm:text-4xl lg:text-5xl">
          Saveurs de Chine à Paris
        </h1>
        <p class="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
          Je partage ici les restaurants chinois que j’ai personnellement
          testés à Paris : mes plats préférés, mes impressions et les
          adresses où je retournerais volontiers.
        </p>
        <form
          class="mt-8 flex w-full max-w-xl flex-col gap-3 rounded-3xl bg-secondary px-4 py-3 sm:flex-row sm:items-center sm:rounded-full sm:px-5"
          role="search"
          @submit.prevent="goToSearch"
        >
          <label class="sr-only" for="home-search">
            Rechercher un restaurant, une cuisine ou un quartier
          </label>
          <input
            id="home-search"
            v-model="searchQuery"
            type="search"
            placeholder="Rechercher un restaurant, une cuisine ou un quartier..."
            class="min-w-0 w-full flex-1 bg-transparent px-1 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
          >
          <Button type="submit" class="w-full rounded-full sm:w-auto">
            Rechercher
          </Button>
        </form>
      </div>

      <RestaurantCarousel />
    </section>

    <section id="adresses" class="mt-16 scroll-mt-8">
      <h2 class="font-serif text-3xl font-semibold">
        Aperçu des adresses
      </h2>
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
        v-else-if="restaurants.length > 0"
        class="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3"
      >
        <RestaurantCard
          v-for="restaurant in restaurants"
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
        Aucun restaurant n’est encore enregistré.
      </p>
    </section>
  </div>
</template>

<script setup>
import { Button } from '@/components/ui/button'

const searchQuery = ref('')
const { restaurants, isLoading, errorMessage, loadRestaurants } = useRestaurants()

function goToSearch() {
  const q = searchQuery.value.trim()

  if (!q) {
    document.getElementById('adresses')?.scrollIntoView({ behavior: 'smooth' })
    return
  }

  navigateTo({
    path: '/recherche',
    query: { q },
  })
}

onMounted(() => {
  loadRestaurants()
})

onActivated(() => {
  loadRestaurants()
})

useHead({
  title: 'Saveur de Chine à Paris — Testé par Shuya',
})
</script>
