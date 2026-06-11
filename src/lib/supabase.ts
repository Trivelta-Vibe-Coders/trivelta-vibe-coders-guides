import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { authEnabled } from './auth';

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!authEnabled()) {
    throw new Error('Supabase auth is not configured');
  }

  if (!client) {
    client = createClient(
      import.meta.env.PUBLIC_SUPABASE_URL,
      import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: {
          storageKey: 'vibe-coders-guides-auth',
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      },
    );
  }

  return client;
}
