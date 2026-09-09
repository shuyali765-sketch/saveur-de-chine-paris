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
        Créer un compte
      </h1>
      <p class="mt-2 text-sm leading-relaxed text-muted-foreground">
        Créez un compte avec votre e-mail. Le prénom est enregistré
        dans votre profil Supabase.
      </p>

      <form
        class="mt-8 space-y-4"
        novalidate
        @submit.prevent="handleSignup"
      >
        <div class="space-y-1.5">
          <label for="signup-firstname" class="text-sm font-medium">Prénom</label>
          <input
            id="signup-firstname"
            v-model="firstName"
            type="text"
            name="firstName"
            autocomplete="given-name"
            :aria-invalid="Boolean(errors.firstName)"
            :class="inputClass(errors.firstName)"
          >
          <p v-if="errors.firstName" class="text-sm text-destructive" role="alert">
            {{ errors.firstName }}
          </p>
        </div>

        <div class="space-y-1.5">
          <label for="signup-email" class="text-sm font-medium">Adresse e-mail</label>
          <input
            id="signup-email"
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
          <label for="signup-password" class="text-sm font-medium">Mot de passe</label>
          <input
            id="signup-password"
            v-model="password"
            type="password"
            name="password"
            autocomplete="new-password"
            :aria-invalid="Boolean(errors.password)"
            :class="inputClass(errors.password)"
          >
          <p v-if="errors.password" class="text-sm text-destructive" role="alert">
            {{ errors.password }}
          </p>
        </div>

        <div class="space-y-1.5">
          <label for="signup-confirm" class="text-sm font-medium">Confirmation du mot de passe</label>
          <input
            id="signup-confirm"
            v-model="confirmPassword"
            type="password"
            name="confirmPassword"
            autocomplete="new-password"
            :aria-invalid="Boolean(errors.confirmPassword)"
            :class="inputClass(errors.confirmPassword)"
          >
          <p v-if="errors.confirmPassword" class="text-sm text-destructive" role="alert">
            {{ errors.confirmPassword }}
          </p>
        </div>

        <div class="space-y-1.5">
          <label for="signup-preference" class="text-sm font-medium">
            Quelle cuisine chinoise préférez-vous ?
          </label>
          <select
            id="signup-preference"
            v-model="foodPreference"
            name="foodPreference"
            :aria-invalid="Boolean(errors.foodPreference)"
            :class="inputClass(errors.foodPreference)"
          >
            <option value="" disabled>
              Choisissez une cuisine
            </option>
            <option value="cuisine sichuanaise">Sichuanaise</option>
            <option value="cuisine cantonaise">Cantonaise</option>
            <option value="cuisine pékinoise">Pékinoise</option>
            <option value="cuisine du Nord-Est">Cuisine du Nord-Est</option>
            <option value="nouilles et raviolis">Nouilles et raviolis</option>
            <option value="toutes les cuisines chinoises">Je souhaite tout découvrir</option>
          </select>
          <p v-if="errors.foodPreference" class="text-sm text-destructive" role="alert">
            {{ errors.foodPreference }}
          </p>
        </div>

        <div class="rounded-xl border border-gold/40 bg-secondary/60 p-4">
          <p class="text-xs font-medium tracking-wide text-gold uppercase">
            Aperçu en direct
          </p>
          <p class="mt-2 text-sm leading-relaxed text-foreground" aria-live="polite">
            {{ previewMessage }}
          </p>
        </div>

        <p
          v-if="formError"
          class="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {{ formError }}
        </p>

        <p
          v-if="successMessage"
          class="rounded-md bg-secondary px-3 py-2 text-sm text-secondary-foreground"
          role="status"
        >
          {{ successMessage }}
        </p>

        <Button type="submit" class="mt-2 w-full rounded-full" :disabled="isLoading">
          {{ isLoading ? 'Inscription…' : 'S’inscrire' }}
        </Button>
      </form>

      <p class="mt-6 text-center text-sm text-muted-foreground">
        Déjà un compte ?
        <NuxtLink to="/login" class="font-medium text-primary underline-offset-4 hover:underline">
          Se connecter
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { Button } from '@/components/ui/button'

useHead({
  title: 'S’inscrire — Saveur de Chine à Paris',
})

const supabase = useSupabaseClient()

const firstName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const foodPreference = ref('')
const successMessage = ref('')
const formError = ref('')
const isLoading = ref(false)

const errors = ref({
  firstName: '',
  email: '',
  password: '',
  confirmPassword: '',
  foodPreference: '',
})

const previewMessage = computed(() => {
  const name = firstName.value.trim()

  if (!name) {
    return 'Bonjour ! Indiquez votre prénom pour personnaliser votre expérience.'
  }

  if (!foodPreference.value) {
    return `Bonjour ${name} ! Choisissez une cuisine pour voir un message personnalisé.`
  }

  return `Bonjour ${name} ! Nous mettrons en avant nos recommandations de ${foodPreference.value}.`
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

async function handleSignup() {
  if (isLoading.value) {
    return
  }

  successMessage.value = ''
  formError.value = ''
  errors.value = {
    firstName: '',
    email: '',
    password: '',
    confirmPassword: '',
    foodPreference: '',
  }

  let isValid = true

  if (!firstName.value.trim()) {
    errors.value.firstName = 'Veuillez saisir votre prénom.'
    isValid = false
  }

  if (!email.value.trim() || !isValidEmail(email.value.trim())) {
    errors.value.email = 'Veuillez saisir une adresse e-mail valide.'
    isValid = false
  }

  if (password.value.length < 6) {
    errors.value.password = 'Le mot de passe doit contenir au moins 6 caractères.'
    isValid = false
  }

  if (confirmPassword.value !== password.value) {
    errors.value.confirmPassword = 'Les mots de passe ne correspondent pas.'
    isValid = false
  }

  if (!isValid) {
    return
  }

  isLoading.value = true

  const { error } = await supabase.auth.signUp({
    email: email.value.trim(),
    password: password.value,
    options: {
      data: {
        first_name: firstName.value.trim(),
      },
    },
  })

  isLoading.value = false

  if (error) {
    formError.value = supabaseAuthMessage(error)
    return
  }

  successMessage.value = 'Inscription réussie. Vérifiez votre adresse e-mail.'
}
</script>
