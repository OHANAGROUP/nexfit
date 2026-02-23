import { createBrowserClient } from '@supabase/ssr'
import { createSafeProxy } from './data'

export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
        return createSafeProxy('BrowserClient')
    }

    return createBrowserClient(
        supabaseUrl,
        supabaseAnonKey
    )
}
