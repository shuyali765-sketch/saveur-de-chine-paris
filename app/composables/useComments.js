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

export function useComments(restaurantId) {
  const supabase = useSupabaseClient()
  const { userId, isLoggedIn } = useAuthSession()
  const comments = ref([])
  const isLoading = ref(false)
  const isSaving = ref(false)
  const errorMessage = ref('')

  async function loadComments() {
    const id = unref(restaurantId)

    if (!supabase || !id) {
      comments.value = []
      return
    }

    isLoading.value = true
    errorMessage.value = ''

    const { data, error } = await supabase
      .from('user_comments')
      .select('id, user_id, restaurant_id, content, created_at, updated_at')
      .eq('restaurant_id', id)
      .order('created_at', { ascending: false })

    if (error) {
      isLoading.value = false
      errorMessage.value = error.message || 'Impossible de charger les avis.'
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
      ...row,
      firstName: namesById[row.user_id] || '',
      createdLabel: formatCommentDate(row.created_at),
      isMine: Boolean(userId.value) && String(row.user_id) === String(userId.value),
    }))

    isLoading.value = false
  }

  async function addComment(rawContent) {
    errorMessage.value = ''
    const content = String(rawContent || '').trim()

    if (!content) {
      errorMessage.value = 'Veuillez écrire un avis avant de publier.'
      return { ok: false }
    }

    if (!isLoggedIn.value) {
      errorMessage.value = 'Connectez-vous pour publier un avis.'
      return { ok: false, needsLogin: true }
    }

    if (!supabase) {
      errorMessage.value = 'Publication indisponible. Réessayez plus tard.'
      return { ok: false }
    }

    isSaving.value = true

    const { error } = await supabase
      .from('user_comments')
      .insert({
        user_id: userId.value,
        restaurant_id: unref(restaurantId),
        content,
      })

    isSaving.value = false

    if (error) {
      errorMessage.value = error.message || 'Impossible de publier cet avis.'
      return { ok: false }
    }

    await loadComments()
    return { ok: true }
  }

  async function updateComment(commentId, rawContent) {
    errorMessage.value = ''
    const content = String(rawContent || '').trim()

    if (!content) {
      errorMessage.value = 'Veuillez écrire un avis avant d’enregistrer.'
      return { ok: false }
    }

    if (!isLoggedIn.value || !supabase) {
      errorMessage.value = 'Action non autorisée.'
      return { ok: false }
    }

    isSaving.value = true

    const { error } = await supabase
      .from('user_comments')
      .update({
        content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', commentId)
      .eq('user_id', userId.value)

    isSaving.value = false

    if (error) {
      errorMessage.value = error.message || 'Impossible de modifier cet avis.'
      return { ok: false }
    }

    await loadComments()
    return { ok: true }
  }

  async function deleteComment(commentId) {
    errorMessage.value = ''

    if (!isLoggedIn.value || !supabase) {
      errorMessage.value = 'Action non autorisée.'
      return { ok: false }
    }

    const { error } = await supabase
      .from('user_comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', userId.value)

    if (error) {
      errorMessage.value = error.message || 'Impossible de supprimer cet avis.'
      return { ok: false }
    }

    await loadComments()
    return { ok: true }
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
