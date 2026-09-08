<script setup lang="ts">
import { Button } from '@/components/ui/button'

const props = defineProps<{
  mode: 'login' | 'signup'
}>()

const isSignup = computed(() => props.mode === 'signup')

const submitted = ref(false)
const form = reactive({
  name: '',
  email: '',
  password: '',
  confirm: '',
})

function onSubmit() {
  submitted.value = true
}

const title = computed(() => (isSignup.value ? 'Créer un compte' : 'Se connecter'))
const subtitle = computed(() => (
  isSignup.value
    ? 'Rejoignez Saveur de Chine pour suivre les prochaines adresses.'
    : 'Bon retour. Entrez vos identifiants pour continuer.'
))
const submitLabel = computed(() => (isSignup.value ? 'S’inscrire' : 'Se connecter'))
</script>

<template>
  <div class="w-full rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
    <p class="text-xs font-medium uppercase tracking-[0.18em] text-primary">
      Saveur de Chine
    </p>
    <h1 class="mt-2 font-serif text-3xl font-semibold tracking-tight">
      {{ title }}
    </h1>
    <p class="mt-2 text-sm leading-relaxed text-muted-foreground">
      {{ subtitle }}
    </p>

    <form class="mt-8 space-y-4" @submit.prevent="onSubmit">
      <div v-if="isSignup" class="space-y-1.5">
        <label for="auth-name" class="text-sm font-medium">Nom</label>
        <input
          id="auth-name"
          v-model="form.name"
          type="text"
          name="name"
          autocomplete="name"
          required
          class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
        >
      </div>

      <div class="space-y-1.5">
        <label for="auth-email" class="text-sm font-medium">Adresse e-mail</label>
        <input
          id="auth-email"
          v-model="form.email"
          type="email"
          name="email"
          autocomplete="email"
          required
          class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
        >
      </div>

      <div class="space-y-1.5">
        <label for="auth-password" class="text-sm font-medium">Mot de passe</label>
        <input
          id="auth-password"
          v-model="form.password"
          type="password"
          name="password"
          :autocomplete="isSignup ? 'new-password' : 'current-password'"
          required
          minlength="8"
          class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
        >
      </div>

      <div v-if="isSignup" class="space-y-1.5">
        <label for="auth-confirm" class="text-sm font-medium">Confirmer le mot de passe</label>
        <input
          id="auth-confirm"
          v-model="form.confirm"
          type="password"
          name="confirm"
          autocomplete="new-password"
          required
          minlength="8"
          class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
        >
      </div>

      <Button type="submit" class="mt-2 w-full rounded-full">
        {{ submitLabel }}
      </Button>
    </form>

    <p
      v-if="submitted"
      class="mt-4 rounded-md bg-secondary px-3 py-2 text-sm text-secondary-foreground"
      role="status"
    >
      Interface de démonstration : aucune donnée n’est enregistrée, aucun compte n’est créé.
    </p>

    <p class="mt-6 text-center text-sm text-muted-foreground">
      <template v-if="isSignup">
        Déjà un compte ?
        <NuxtLink to="/login" class="font-medium text-primary underline-offset-4 hover:underline">
          Se connecter
        </NuxtLink>
      </template>
      <template v-else>
        Pas encore de compte ?
        <NuxtLink to="/signup" class="font-medium text-primary underline-offset-4 hover:underline">
          S’inscrire
        </NuxtLink>
      </template>
    </p>
  </div>
</template>
