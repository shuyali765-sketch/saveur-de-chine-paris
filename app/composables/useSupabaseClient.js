import { createClient } from '@supabase/supabase-js'

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

  const client = createClient(url, key)
  nuxtApp.provide('supabase', client)
  return client
}
