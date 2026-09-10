import { createClient } from '@supabase/supabase-js'

/** @typedef {import('~/types/database.types').Database} Database */

export function useSupabaseClient() {
  const nuxtApp = useNuxtApp()

  if (nuxtApp.$supabase) {
    return nuxtApp.$supabase
  }

  if (import.meta.server) {
    return null
  }

  const config = useRuntimeConfig().public
  const url = String(config.supabaseUrl || '').trim()
  const key = String(config.supabaseKey || '').trim()

  if (!/^https?:\/\//i.test(url) || !key) {
    return null
  }

  /** @type {import('@supabase/supabase-js').SupabaseClient<Database>} */
  const client = createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })
  nuxtApp.provide('supabase', client)
  return client
}
