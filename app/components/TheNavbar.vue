<template>
    <header class="border-b border-border/80">
        <nav class="mx-auto flex w-full max-w-6xl items-start justify-between gap-3 px-4 py-4 sm:items-center sm:px-6">
            <NuxtLink
                to="/"
                class="min-w-0 flex-1 font-serif text-base font-semibold leading-snug tracking-tight text-pretty text-foreground sm:flex-none sm:text-2xl"
            >
                Saveurs de Chine à Paris
            </NuxtLink>

            <div class="flex shrink-0 flex-wrap items-center justify-end gap-x-3 gap-y-2 text-sm sm:gap-x-5">
                <NuxtLink
                    to="/"
                    class="whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground"
                    :class="{ 'font-medium text-foreground': route.path === '/' }"
                >
                    Accueil
                </NuxtLink>

                <template v-if="!userStore.authReady">
                    <span class="text-sm text-muted-foreground">Chargement…</span>
                </template>

                <template v-else-if="isLoggedIn">
                    <span
                        v-if="userStore.hasProfile"
                        class="whitespace-nowrap text-foreground"
                    >
                        Bonjour, {{ userStore.profile.firstName }}
                    </span>
                    <NuxtLink
                        to="/favoris"
                        class="whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground"
                        :class="{ 'font-medium text-foreground': route.path === '/favoris' }"
                    >
                        Mes favoris
                    </NuxtLink>
                    <button
                        type="button"
                        class="whitespace-nowrap rounded-full border border-border px-3 py-1 text-sm transition-colors hover:bg-accent"
                        :disabled="isLoggingOut"
                        @click="handleLogout"
                    >
                        Se déconnecter
                    </button>
                </template>

                <template v-else>
                    <NuxtLink
                        to="/signup"
                        class="whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground"
                        :class="{ 'font-medium text-foreground': route.path === '/signup' }"
                    >
                        S’inscrire
                    </NuxtLink>
                    <NuxtLink
                        to="/login"
                        class="whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground"
                        :class="{ 'font-medium text-foreground': route.path === '/login' }"
                    >
                        Se connecter
                    </NuxtLink>
                </template>

                <client-only>
                    <button
                        type="button"
                        class="flex rounded-md px-1 py-1 text-muted-foreground transition-colors hover:text-foreground"
                        aria-label="Basculer le thème"
                        @click="toggleDark()"
                    >
                        <svg
                            v-if="isDark"
                            class="h-7 w-7 p-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                        >
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <svg
                            v-else
                            class="h-7 w-7 p-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                        >
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                    </button>
                </client-only>
            </div>
        </nav>
    </header>
</template>

<script setup>
const route = useRoute()
const userStore = useUserStore()
const { isLoggedIn } = useAuthSession()
const isDark = useDark()
const toggleDark = useToggle(isDark)
const isLoggingOut = ref(false)

async function handleLogout() {
    if (isLoggingOut.value) {
        return
    }

    isLoggingOut.value = true
    const supabase = useSupabaseClient()

    if (supabase) {
        const { error } = await supabase.auth.signOut()
        userStore.clearAuthProfile()
        isLoggingOut.value = false

        if (error) {
            return
        }
    }
    else {
        userStore.clearAuthProfile()
        isLoggingOut.value = false
    }

    await navigateTo('/login')
}
</script>

<style lang="postcss" scoped>

</style>
