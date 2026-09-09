export function useSupabaseUser() {
  return useState('supabase_user', () => null)
}
