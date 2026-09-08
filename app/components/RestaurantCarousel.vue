<script setup>
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-icons/vue'

const images = [
  {
    src: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1400&q=80',
    alt: 'Salle d’un restaurant chinois à Paris, tables dressées sous une lumière chaude',
  },
  {
    src: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1400&q=80',
    alt: 'Assiette de raviolis chinois jiaozi, testés dans un restaurant parisien',
  },
  {
    src: 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?auto=format&fit=crop&w=1400&q=80',
    alt: 'Xiao long bao servis dans un panier en bambou, dans un restaurant chinois',
  },
  {
    src: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=1400&q=80',
    alt: 'Table ronde de restaurant chinois avec plusieurs plats à partager',
  },
]

const currentIndex = ref(0)

function goToPrevious() {
  if (currentIndex.value === 0) {
    currentIndex.value = images.length - 1
  }
  else {
    currentIndex.value = currentIndex.value - 1
  }
}

function goToNext() {
  if (currentIndex.value === images.length - 1) {
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
        :src="images[currentIndex].src"
        :alt="images[currentIndex].alt"
        class="aspect-[4/3] w-full object-cover"
      >
    </div>

    <button
      type="button"
      class="absolute top-1/2 left-3 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-cream text-foreground shadow-md ring-1 ring-border"
      aria-label="Image précédente"
      @click="goToPrevious"
    >
      <ChevronLeftIcon class="h-5 w-5" aria-hidden="true" />
    </button>

    <button
      type="button"
      class="absolute top-1/2 right-3 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-cream text-foreground shadow-md ring-1 ring-border"
      aria-label="Image suivante"
      @click="goToNext"
    >
      <ChevronRightIcon class="h-5 w-5" aria-hidden="true" />
    </button>
  </div>
</template>
