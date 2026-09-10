<script setup>
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-icons/vue'

const coverSlide = {
  src: '/images/plats-chinois.jpg',
  alt: 'Illustration de plats chinois : raviolis, nouilles, dim sum et spécialités',
  contain: true,
}

const { restaurants } = useRestaurants()

const images = computed(() => {
  const seen = new Set([coverSlide.src])
  const slides = [coverSlide]

  for (const restaurant of restaurants.value) {
    const src = restaurant.image

    if (!src || seen.has(src)) {
      continue
    }

    seen.add(src)
    slides.push({
      src,
      alt: restaurant.alt || restaurant.name || 'Restaurant chinois à Paris',
      contain: false,
    })
  }

  return slides
})

const currentIndex = ref(0)
const currentSlide = computed(() => images.value[currentIndex.value] || coverSlide)

watch(images, (slides) => {
  if (currentIndex.value >= slides.length) {
    currentIndex.value = 0
  }
})

function goToPrevious() {
  if (currentIndex.value === 0) {
    currentIndex.value = images.value.length - 1
  }
  else {
    currentIndex.value = currentIndex.value - 1
  }
}

function goToNext() {
  if (currentIndex.value === images.value.length - 1) {
    currentIndex.value = 0
  }
  else {
    currentIndex.value = currentIndex.value + 1
  }
}
</script>

<template>
  <div class="relative w-full min-w-0">
    <div class="overflow-hidden rounded-3xl bg-muted ring-1 ring-gold/30">
      <img
        :src="currentSlide.src"
        :alt="currentSlide.alt"
        class="aspect-[4/3] w-full"
        :class="currentSlide.contain ? 'object-contain bg-[#f6ebe0]' : 'object-cover'"
      >
    </div>

    <button
      v-if="images.length > 1"
      type="button"
      class="absolute top-1/2 left-3 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-cream text-foreground shadow-md ring-1 ring-border"
      aria-label="Image précédente"
      @click="goToPrevious"
    >
      <ChevronLeftIcon class="h-5 w-5" aria-hidden="true" />
    </button>

    <button
      v-if="images.length > 1"
      type="button"
      class="absolute top-1/2 right-3 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-cream text-foreground shadow-md ring-1 ring-border"
      aria-label="Image suivante"
      @click="goToNext"
    >
      <ChevronRightIcon class="h-5 w-5" aria-hidden="true" />
    </button>
  </div>
</template>
