export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server) {
    return
  }

  const { isLoggedIn } = useAuthSession()

  if (!isLoggedIn.value) {
    return navigateTo('/login')
  }
})
