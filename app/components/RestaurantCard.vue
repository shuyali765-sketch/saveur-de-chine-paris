<script setup>
import { HeartFilledIcon, HeartIcon } from '@radix-icons/vue'

defineProps({
  name: {
    type: String,
    required: true,
  },
  cuisine: {
    type: String,
    required: true,
  },
  neighborhood: {
    type: String,
    required: true,
  },
  review: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  alt: {
    type: String,
    required: true,
  },
})

const userStore = useUserStore()
</script>

<template>
  <article class="flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
    <img
      :src="image"
      :alt="alt"
      class="aspect-[4/3] w-full object-cover"
    >
    <div class="flex flex-1 flex-col gap-2 p-4">
      <p class="text-xs font-medium tracking-wide text-gold uppercase">
        {{ cuisine }}
      </p>
      <div class="flex items-start justify-between gap-2">
        <h3 class="font-serif text-xl font-semibold text-foreground">
          {{ name }}
        </h3>
        <button
          type="button"
          class="mt-0.5 shrink-0 rounded-full p-1 text-primary transition-colors hover:bg-secondary"
          :aria-pressed="userStore.isFavorite(name)"
          :aria-label="userStore.isFavorite(name) ? `Retirer ${name} des favoris` : `Ajouter ${name} aux favoris`"
          @click="userStore.toggleFavorite(name)"
        >
          <HeartFilledIcon
            v-if="userStore.isFavorite(name)"
            class="h-5 w-5"
            aria-hidden="true"
          />
          <HeartIcon
            v-else
            class="h-5 w-5"
            aria-hidden="true"
          />
        </button>
      </div>
      <p class="text-sm text-muted-foreground">
        {{ neighborhood }}
      </p>
      <p class="mt-1 text-sm leading-relaxed text-foreground/80">
        {{ review }}
      </p>
    </div>
  </article>
</template>
