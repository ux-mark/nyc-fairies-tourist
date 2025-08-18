import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Set user context for Row Level Security
// setUserContext is disabled: Supabase publishable key cannot set server config
// export const setUserContext = async (phoneNumber: string) => {
//   // No-op for client-side usage
// }
