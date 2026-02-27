import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    if (!supabaseUrl || !supabaseKey) {
        // Return a dummy client during build / pre-rendering when env vars aren't available.
        // All actual data fetches will happen at runtime in the browser where vars ARE available.
        return {
            auth: {
                getSession: async () => ({ data: { session: null }, error: null }),
                onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
                signInWithPassword: async () => ({ data: null, error: { message: 'Not configured' } }),
                signUp: async () => ({ data: null, error: { message: 'Not configured' } }),
                signOut: async () => ({}),
            },
            from: () => ({
                select: () => ({ order: () => ({ data: null, error: null }), eq: () => ({ order: () => ({ limit: () => ({ data: null, error: null }) }) }) }),
            }),
        } as any;
    }

    return createBrowserClient(supabaseUrl, supabaseKey);
}
