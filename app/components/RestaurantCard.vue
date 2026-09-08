<script setup>
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
      <h3 class="font-serif text-xl font-semibold text-foreground">
        {{ name }}
      </h3>
      <p class="text-sm text-muted-foreground">
        {{ neighborhood }}
      </p>
      <p class="mt-1 text-sm leading-relaxed text-foreground/80">
        {{ review }}
      </p>
    </div>
  </article>
</template>
