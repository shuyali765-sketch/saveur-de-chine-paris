<script setup>
import { HeartFilledIcon, HeartIcon } from '@radix-icons/vue'

const props = defineProps({
  id: {
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  cuisine: {
    type: [String, Array],
    default: '',
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
  showDetailsLink: {
    type: Boolean,
    default: true,
  },
})

const {
  isFavorite,
  toggleFavorite,
  pendingId,
  errorMessage,
  loadFavorites,
} = useFavorites()

const localHint = ref('')
const localError = ref('')

const filled = computed(() => isFavorite(props.id))
const isBusy = computed(() => pendingId.value != null)
const cuisineLabel = computed(() => {
  if (Array.isArray(props.cuisine)) {
    return props.cuisine.filter(Boolean).join(' · ')
  }

  return props.cuisine || ''
})

onMounted(() => {
  loadFavorites()
})

async function handleFavoriteClick() {
  if (isBusy.value) {
    return
  }

  localHint.value = ''
  localError.value = ''
  const result = await toggleFavorite(props.id)

  if (result?.needsLogin) {
    localHint.value = 'Connectez-vous pour ajouter ce restaurant à vos favoris.'
    return
  }

  if (!result?.ok) {
    localError.value = errorMessage.value || 'Impossible de mettre à jour ce favori. Veuillez réessayer.'
  }
}
</script>

<template>
  <article class="flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
    <NuxtLink
      :to="`/restaurants/${id}`"
      class="block min-w-0"
    >
      <img
        :src="image"
        :alt="alt"
        class="aspect-[4/3] w-full object-cover"
      >
    </NuxtLink>
    <div class="flex flex-1 flex-col gap-2 p-4">
      <p class="text-xs font-medium tracking-wide text-gold uppercase">
        {{ cuisineLabel }}
      </p>
      <div class="flex items-start justify-between gap-2">
        <h3 class="min-w-0 font-serif text-xl font-semibold text-foreground">
          <NuxtLink
            :to="`/restaurants/${id}`"
            class="hover:underline"
          >
            {{ name }}
          </NuxtLink>
        </h3>
        <button
          type="button"
          class="mt-0.5 shrink-0 rounded-full p-1 text-primary transition-colors hover:bg-secondary disabled:opacity-60"
          :aria-pressed="filled"
          :aria-label="filled ? `Retirer ${name} des favoris` : `Ajouter ${name} aux favoris`"
          :disabled="isBusy"
          @click.stop="handleFavoriteClick"
        >
          <HeartFilledIcon
            v-if="filled"
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
      <p
        v-if="review"
        class="mt-1 text-sm leading-relaxed text-foreground/80"
      >
        {{ review }}
      </p>
      <p
        v-if="localHint"
        class="mt-2 text-sm text-primary"
        role="status"
      >
        {{ localHint }}
        <NuxtLink
          to="/login"
          class="font-medium underline-offset-4 hover:underline"
        >
          Se connecter
        </NuxtLink>
      </p>
      <p
        v-else-if="localError"
        class="mt-2 text-sm text-destructive"
        role="alert"
      >
        {{ localError }}
      </p>
      <NuxtLink
        v-if="showDetailsLink"
        :to="`/restaurants/${id}`"
        class="mt-auto pt-3 text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        Voir la fiche et les avis
      </NuxtLink>
    </div>
  </article>
</template>
