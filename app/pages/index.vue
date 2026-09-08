<template>
  <div class="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
    <section class="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
      <div class="min-w-0">
        <h1 class="font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Saveur de Chine à Paris
        </h1>
        <p class="mt-3 text-lg text-primary">
          Mes adresses chinoises testées à Paris
        </p>
        <p class="mt-5 font-serif text-2xl text-gold">
          Mes premières recommandations arrivent bientôt
        </p>
        <p class="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
          Ici, je partage mes avis personnels sur les restaurants chinois
          que j’ai réellement testés à Paris : l’ambiance, les plats, et
          si j’y retournerais.
        </p>
        <div class="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button as-child size="lg" class="w-full rounded-full sm:w-auto">
            <NuxtLink to="/signup">S’inscrire</NuxtLink>
          </Button>
          <Button as-child size="lg" variant="outline" class="w-full rounded-full sm:w-auto">
            <NuxtLink to="/login">Se connecter</NuxtLink>
          </Button>
        </div>
      </div>

      <RestaurantCarousel />
    </section>

    <section class="mt-16">
      <h2 class="font-serif text-3xl font-semibold">
        Aperçu des adresses
      </h2>
      <p class="mt-2 text-sm text-muted-foreground">
        Exemples temporaires, en attendant mes vrais tests.
      </p>
      <div class="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <RestaurantCard
          v-for="restaurant in restaurants"
          :key="restaurant.name"
          :name="restaurant.name"
          :cuisine="restaurant.cuisine"
          :neighborhood="restaurant.neighborhood"
          :review="restaurant.review"
          :image="restaurant.image"
          :alt="restaurant.alt"
        />
      </div>
    </section>
  </div>
</template>

<script setup>
import { Button } from '@/components/ui/button'

const restaurants = [
  {
    name: 'Maison du Sichuan',
    cuisine: 'Cuisine du Sichuan',
    neighborhood: '13e arrondissement',
    review: 'Un mapo tofu bien relevé, et une salle simple mais chaleureuse.',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1000&q=80',
    alt: 'Bol de nouilles chinoises dans un restaurant du 13e arrondissement',
  },
  {
    name: 'Le Panier de Dim Sum',
    cuisine: 'Cuisine cantonaise',
    neighborhood: 'Opéra, 9e arrondissement',
    review: 'Des har gau délicats. Une bonne adresse pour un déjeuner.',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1000&q=80',
    alt: 'Panier de dim sum cantonais servis à Paris',
  },
  {
    name: 'Table de Shanghai',
    cuisine: 'Cuisine de Shanghai',
    neighborhood: 'Belleville, 20e arrondissement',
    review: 'Les xiao long bao valent le détour. Cadre un peu bruyant, mais sincère.',
    image: 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?auto=format&fit=crop&w=1000&q=80',
    alt: 'Xiao long bao de Shanghai dans un restaurant à Belleville',
  },
]

useHead({
  title: 'Saveur de Chine à Paris — Testé par Shuya',
})
</script>
