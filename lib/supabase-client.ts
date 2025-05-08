'use client';

import { createBrowserClient } from '@supabase/ssr';
import { useAuth } from '@clerk/nextjs';

export function useSupabaseClient() {
  const { userId, getToken } = useAuth();
  
  const supabaseClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: async (url, options = {}) => {
          if (userId) {
            const token = await getToken({ template: 'supabase' });
            options.headers = {
              ...options.headers,
              Authorization: `Bearer ${token}`
            };
          }
          return fetch(url, options);
        }
      }
    }
  );

  return supabaseClient;
}