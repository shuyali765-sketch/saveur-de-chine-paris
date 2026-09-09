export function supabaseAuthMessage(error) {
  const text = (error?.message || '').toLowerCase()

  if (text.includes('invalid login') || text.includes('invalid credentials')) {
    return 'Adresse e-mail ou mot de passe incorrect.'
  }

  if (text.includes('already registered') || text.includes('already been registered')) {
    return 'Cette adresse e-mail est déjà utilisée.'
  }

  if (text.includes('email not confirmed')) {
    return 'Veuillez d’abord confirmer votre adresse e-mail.'
  }

  return error?.message || 'Une erreur est survenue. Veuillez réessayer.'
}

export async function loadUserProfile() {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const userStore = useUserStore()

  if (!user.value) {
    userStore.clearAuthProfile()
    return { profile: null, error: null }
  }

  const { data, error } = await supabase
    .from('user_profile')
    .select('first_name, email')
    .eq('id', user.value.id)
    .maybeSingle()

  if (error) {
    return { profile: null, error }
  }

  if (data) {
    userStore.setProfile(data.first_name || '', data.email || user.value.email || '')
  }

  return { profile: data, error: null }
}
