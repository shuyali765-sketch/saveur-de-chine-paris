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

  if (text.includes('password')) {
    return 'Le mot de passe est trop faible ou ne respecte pas les règles.'
  }

  if (text.includes('rate limit') || text.includes('too many')) {
    return 'Trop de tentatives. Veuillez réessayer plus tard.'
  }

  return 'Une erreur est survenue. Veuillez réessayer.'
}

export async function loadUserProfile() {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const userStore = useUserStore()
  const userId = user.value?.id || user.value?.sub

  if (!supabase || !userId) {
    userStore.clearAuthProfile()
    return { profile: null, error: null }
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .select('id, first_name, email')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    userStore.setProfileError('Impossible de charger votre profil.')
    return { profile: null, error }
  }

  userStore.setProfileError('')

  if (data) {
    userStore.setProfile(data.first_name || '', data.email || user.value.email || '')
  }

  return { profile: data, error: null }
}

export async function upsertOwnProfile({ id, firstName, email }) {
  const supabase = useSupabaseClient()

  if (!supabase || !id) {
    return { error: { message: 'unavailable' } }
  }

  const { error } = await supabase
    .from('user_profiles')
    .upsert({
      id,
      first_name: firstName || '',
      email: email || '',
    })

  return { error }
}

export async function signInWithEmail(email, password) {
  const supabase = useSupabaseClient()

  if (!supabase) {
    return {
      ok: false,
      error: 'Impossible de joindre la base de données. Ce n’est pas un problème de mot de passe.',
    }
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { ok: false, error: supabaseAuthMessage(error) }
  }

  await ensureUserProfile()
  return { ok: true, error: null }
}

export async function signUpWithEmail({ email, password, firstName }) {
  const supabase = useSupabaseClient()

  if (!supabase) {
    return { ok: false, error: 'Inscription indisponible. Réessayez plus tard.' }
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
      },
    },
  })

  if (error) {
    return { ok: false, error: supabaseAuthMessage(error) }
  }

  if (data.user?.id && data.session) {
    const { error: profileError } = await upsertOwnProfile({
      id: data.user.id,
      firstName,
      email,
    })

    if (profileError) {
      return {
        ok: false,
        error: 'Le compte a été créé, mais le profil n’a pas pu être enregistré. Essayez de vous connecter.',
      }
    }
  }

  return {
    ok: true,
    error: null,
    session: data.session,
  }
}

export async function ensureUserProfile() {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const userStore = useUserStore()
  const userId = user.value?.id || user.value?.sub

  if (!supabase || !userId) {
    userStore.clearAuthProfile()
    return { profile: null, error: null }
  }

  const loaded = await loadUserProfile()
  if (loaded.profile) {
    userStore.setProfileError('')
    return loaded
  }

  const firstName = String(user.value.user_metadata?.first_name || '').trim()
  const email = user.value.email || ''

  const { error: upsertError } = await upsertOwnProfile({
    id: userId,
    firstName,
    email,
  })

  if (upsertError) {
    userStore.setProfile(firstName, email)
    userStore.setProfileError('Impossible d’enregistrer votre profil. Veuillez réessayer.')
    return { profile: { id: userId, first_name: firstName, email }, error: upsertError }
  }

  return loadUserProfile()
}
