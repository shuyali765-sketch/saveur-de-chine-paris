function formatCommentDate(value) {
  if (!value) {
    return ''
  }

  return new Date(value).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function commentErrorMessage(error, fallback) {
  const code = error?.code || ''
  const text = String(error?.message || '').toLowerCase()

  if (code === '42501' || text.includes('row-level security') || text.includes('permission')) {
    return 'Action non autorisée. Veuillez vous reconnecter.'
  }

  if (code === '23503' || text.includes('foreign key')) {
    return 'Ce restaurant est introuvable dans la base de données.'
  }

  if (text.includes('jwt') || text.includes('not authenticated')) {
    return 'Votre session a expiré. Veuillez vous reconnecter.'
  }

  return fallback
}

export function useComments(restaurantId) {
  const { userId, isLoggedIn } = useAuthSession()
  const comments = ref([])
  const isLoading = ref(false)
  const isSaving = ref(false)
  const errorMessage = ref('')

  async function loadComments() {
    const supabase = useSupabaseClient()
    const id = unref(restaurantId)

    if (!id) {
      comments.value = []
      return
    }

    if (!supabase) {
      comments.value = []
      errorMessage.value = 'Impossible de joindre la base de données. Veuillez réessayer plus tard.'
      return
    }

    isLoading.value = true
    errorMessage.value = ''

    try {
      const { data, error } = await supabase
        .from('user_comments')
        .select('id, user_id, restaurant_id, content, created_at, updated_at')
        .eq('restaurant_id', id)
        .order('created_at', { ascending: false })

      if (error) {
        errorMessage.value = commentErrorMessage(
          error,
          'Impossible de charger les avis. Veuillez réessayer.',
        )
        comments.value = []
        return
      }

      const rows = data || []
      const authorIds = [...new Set(rows.map((row) => row.user_id).filter(Boolean))]
      const namesById = {}

      if (authorIds.length > 0) {
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('id, first_name')
          .in('id', authorIds)

        for (const profile of profiles || []) {
          namesById[profile.id] = profile.first_name
        }
      }

      comments.value = rows.map((row) => ({
        id: row.id,
        user_id: row.user_id,
        restaurant_id: row.restaurant_id,
        content: row.content,
        created_at: row.created_at,
        updated_at: row.updated_at,
        firstName: namesById[row.user_id] || '',
        createdLabel: formatCommentDate(row.created_at),
        isMine: Boolean(userId.value) && String(row.user_id) === String(userId.value),
      }))
    }
    catch {
      errorMessage.value = 'Impossible de charger les avis. Veuillez réessayer.'
      comments.value = []
    }
    finally {
      isLoading.value = false
    }
  }

  async function addComment(rawContent) {
    const supabase = useSupabaseClient()
    errorMessage.value = ''
    const content = String(rawContent || '').trim()
    const currentRestaurantId = unref(restaurantId)

    if (isSaving.value) {
      return { ok: false }
    }

    if (!content) {
      errorMessage.value = 'Veuillez écrire un avis avant de publier.'
      return { ok: false }
    }

    if (!isLoggedIn.value || !userId.value) {
      errorMessage.value = 'Connectez-vous pour publier un avis.'
      return { ok: false, needsLogin: true }
    }

    if (!supabase || !currentRestaurantId) {
      errorMessage.value = 'Publication indisponible. Veuillez réessayer plus tard.'
      return { ok: false }
    }

    isSaving.value = true

    try {
      const { error } = await supabase
        .from('user_comments')
        .insert({
          user_id: userId.value,
          restaurant_id: currentRestaurantId,
          content,
        })

      if (error) {
        errorMessage.value = commentErrorMessage(
          error,
          'Impossible de publier cet avis. Veuillez réessayer.',
        )
        return { ok: false }
      }

      await loadComments()
      return { ok: true }
    }
    finally {
      isSaving.value = false
    }
  }

  async function updateComment(commentId, rawContent) {
    const supabase = useSupabaseClient()
    errorMessage.value = ''
    const content = String(rawContent || '').trim()

    if (isSaving.value) {
      return { ok: false }
    }

    if (!content) {
      errorMessage.value = 'Veuillez écrire un avis avant d’enregistrer.'
      return { ok: false }
    }

    if (!isLoggedIn.value || !userId.value || !supabase || !commentId) {
      errorMessage.value = 'Action non autorisée.'
      return { ok: false }
    }

    isSaving.value = true

    try {
      const { error } = await supabase
        .from('user_comments')
        .update({
          content,
          updated_at: new Date().toISOString(),
        })
        .eq('id', commentId)
        .eq('user_id', userId.value)

      if (error) {
        errorMessage.value = commentErrorMessage(
          error,
          'Impossible de modifier cet avis. Veuillez réessayer.',
        )
        return { ok: false }
      }

      await loadComments()
      return { ok: true }
    }
    finally {
      isSaving.value = false
    }
  }

  async function deleteComment(commentId) {
    const supabase = useSupabaseClient()
    errorMessage.value = ''

    if (isSaving.value) {
      return { ok: false }
    }

    if (!isLoggedIn.value || !userId.value || !supabase || !commentId) {
      errorMessage.value = 'Action non autorisée.'
      return { ok: false }
    }

    isSaving.value = true

    try {
      const { error } = await supabase
        .from('user_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', userId.value)

      if (error) {
        errorMessage.value = commentErrorMessage(
          error,
          'Impossible de supprimer cet avis. Veuillez réessayer.',
        )
        return { ok: false }
      }

      await loadComments()
      return { ok: true }
    }
    finally {
      isSaving.value = false
    }
  }

  return {
    comments,
    isLoading,
    isSaving,
    errorMessage,
    loadComments,
    addComment,
    updateComment,
    deleteComment,
  }
}
