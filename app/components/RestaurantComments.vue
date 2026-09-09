<script setup>
import { Button } from '@/components/ui/button'

const props = defineProps({
  restaurantId: {
    required: true,
  },
})

const { isLoggedIn } = useAuthSession()
const {
  comments,
  isLoading,
  isSaving,
  errorMessage,
  loadComments,
  addComment,
  updateComment,
  deleteComment,
} = useComments(toRef(props, 'restaurantId'))

const draft = ref('')
const editingId = ref(null)
const editDraft = ref('')

onMounted(() => {
  loadComments()
})

watch(() => props.restaurantId, () => {
  loadComments()
})

async function handlePublish() {
  const result = await addComment(draft.value)
  if (result.ok) {
    draft.value = ''
  }
}

function startEdit(comment) {
  editingId.value = comment.id
  editDraft.value = comment.content
}

function cancelEdit() {
  editingId.value = null
  editDraft.value = ''
}

async function handleSaveEdit() {
  const result = await updateComment(editingId.value, editDraft.value)
  if (result.ok) {
    cancelEdit()
  }
}

async function handleDelete(comment) {
  if (!window.confirm('Supprimer cet avis ?')) {
    return
  }

  await deleteComment(comment.id)
}
</script>

<template>
  <section class="mt-10 min-w-0">
    <h2 class="font-serif text-2xl font-semibold sm:text-3xl">
      Avis de la communauté
    </h2>

    <form
      v-if="isLoggedIn"
      class="mt-6 space-y-3 rounded-2xl border border-border bg-card p-4 sm:p-5"
      @submit.prevent="handlePublish"
    >
      <label
        for="new-comment"
        class="text-sm font-medium"
      >
        Votre avis
      </label>
      <textarea
        id="new-comment"
        v-model="draft"
        rows="4"
        class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
        placeholder="Partagez votre expérience dans ce restaurant…"
      />
      <Button
        type="submit"
        class="rounded-full"
        :disabled="isSaving"
      >
        {{ isSaving ? 'Publication…' : 'Publier mon avis' }}
      </Button>
    </form>

    <p
      v-else
      class="mt-6 text-sm text-muted-foreground"
    >
      Connectez-vous pour publier un avis.
      <NuxtLink
        to="/login"
        class="font-medium text-primary underline-offset-4 hover:underline"
      >
        Se connecter
      </NuxtLink>
    </p>

    <p
      v-if="errorMessage"
      class="mt-4 text-sm text-destructive"
      role="alert"
    >
      {{ errorMessage }}
    </p>

    <p
      v-if="isLoading"
      class="mt-6 text-sm text-muted-foreground"
    >
      Chargement des avis…
    </p>

    <ul
      v-else-if="comments.length > 0"
      class="mt-6 space-y-4"
    >
      <li
        v-for="comment in comments"
        :key="comment.id"
        class="rounded-2xl border border-border bg-card p-4"
      >
        <div class="flex flex-wrap items-baseline justify-between gap-2">
          <p class="text-sm font-medium text-foreground">
            {{ comment.firstName || 'Utilisateur' }}
          </p>
          <p class="text-xs text-muted-foreground">
            {{ comment.createdLabel }}
          </p>
        </div>

        <div v-if="editingId === comment.id" class="mt-3 space-y-3">
          <textarea
            v-model="editDraft"
            rows="3"
            class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
          />
          <div class="flex flex-wrap gap-2">
            <Button
              type="button"
              class="rounded-full"
              size="sm"
              :disabled="isSaving"
              @click="handleSaveEdit"
            >
              Enregistrer
            </Button>
            <Button
              type="button"
              variant="outline"
              class="rounded-full"
              size="sm"
              @click="cancelEdit"
            >
              Annuler
            </Button>
          </div>
        </div>

        <p
          v-else
          class="mt-3 text-sm leading-relaxed text-foreground/80"
        >
          {{ comment.content }}
        </p>

        <div
          v-if="comment.isMine && editingId !== comment.id"
          class="mt-3 flex flex-wrap gap-3"
        >
          <button
            type="button"
            class="text-sm font-medium text-primary underline-offset-4 hover:underline"
            @click="startEdit(comment)"
          >
            Modifier
          </button>
          <button
            type="button"
            class="text-sm font-medium text-destructive underline-offset-4 hover:underline"
            @click="handleDelete(comment)"
          >
            Supprimer
          </button>
        </div>
      </li>
    </ul>

    <p
      v-else
      class="mt-6 text-sm text-muted-foreground"
    >
      Aucun avis pour le moment. Soyez le premier à partager votre expérience.
    </p>
  </section>
</template>
