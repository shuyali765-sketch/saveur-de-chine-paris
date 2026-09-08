<template>
  <div class="mx-auto flex w-full max-w-md flex-col px-4 py-12 sm:px-6 sm:py-16">
    <NuxtLink
      to="/"
      class="mb-6 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
    >
      ← Retour à l’accueil
    </NuxtLink>

    <div class="w-full rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <p class="text-xs font-medium uppercase tracking-[0.18em] text-primary">
        Saveur de Chine
      </p>
      <h1 class="mt-2 font-serif text-3xl font-semibold tracking-tight">
        Se connecter
      </h1>
      <p class="mt-2 text-sm leading-relaxed text-muted-foreground">
        Formulaire de démonstration : aucune authentification réelle n’est
        encore en place.
      </p>

      <form
        class="mt-8 space-y-4"
        novalidate
        @submit.prevent="handleLogin"
      >
        <div class="space-y-1.5">
          <label for="login-email" class="text-sm font-medium">Adresse e-mail</label>
          <input
            id="login-email"
            v-model="email"
            type="email"
            name="email"
            autocomplete="email"
            :aria-invalid="Boolean(errors.email)"
            :class="inputClass(errors.email)"
          >
          <p v-if="errors.email" class="text-sm text-destructive" role="alert">
            {{ errors.email }}
          </p>
        </div>

        <div class="space-y-1.5">
          <label for="login-password" class="text-sm font-medium">Mot de passe</label>
          <input
            id="login-password"
            v-model="password"
            type="password"
            name="password"
            autocomplete="current-password"
            :aria-invalid="Boolean(errors.password)"
            :class="inputClass(errors.password)"
          >
          <p v-if="errors.password" class="text-sm text-destructive" role="alert">
            {{ errors.password }}
          </p>
        </div>

        <p
          v-if="successMessage"
          class="rounded-md bg-secondary px-3 py-2 text-sm text-secondary-foreground"
          role="status"
        >
          {{ successMessage }}
        </p>

        <Button type="submit" class="mt-2 w-full rounded-full">
          Se connecter
        </Button>
      </form>

      <p class="mt-6 text-center text-sm text-muted-foreground">
        Pas encore de compte ?
        <NuxtLink to="/signup" class="font-medium text-primary underline-offset-4 hover:underline">
          S’inscrire
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { Button } from '@/components/ui/button'

useHead({
  title: 'Se connecter — Saveur de Chine à Paris',
})

const email = ref('')
const password = ref('')
const successMessage = ref('')

const errors = ref({
  email: '',
  password: '',
})

function inputClass(errorMessage) {
  const base = 'h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring'

  if (errorMessage) {
    return `${base} border-destructive`
  }

  return `${base} border-input`
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function handleLogin() {
  successMessage.value = ''
  errors.value = {
    email: '',
    password: '',
  }

  let isValid = true

  if (!email.value.trim() || !isValidEmail(email.value.trim())) {
    errors.value.email = 'Veuillez saisir une adresse e-mail valide.'
    isValid = false
  }

  if (!password.value.trim()) {
    errors.value.password = 'Veuillez saisir votre mot de passe.'
    isValid = false
  }

  if (!isValid) {
    return
  }

  successMessage.value = 'Formulaire de connexion valide. L’authentification réelle sera ajoutée ultérieurement.'
}
</script>
