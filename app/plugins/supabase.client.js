import { createClient } from '@supabase/supabase-js'

export default defineNuxtPlugin({
  name: 'supabase',
  enforce: 'pre',
  async setup() {
    const user = useSupabaseUser()
    const config = useRuntimeConfig().public
    const url = String(config.supabaseUrl || '').trim()
    const key = String(config.supabaseKey || '').trim()

    if (!/^https?:\/\//i.test(url) || !key) {
      user.value = null
      return {
        provide: {
          supabase: null,
        },
      }
    }

    const client = createClient(url, key)

    try {
      const { data } = await client.auth.getSession()
      user.value = data.session?.user ?? null
    }
    catch {
      user.value = null
    }

    client.auth.onAuthStateChange((_event, session) => {
      user.value = session?.user ?? null
    })

    return {
      provide: {
        supabase: client,
      },
    }
  },
})
