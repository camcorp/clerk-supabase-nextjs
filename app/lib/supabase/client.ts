'use client';

import { createBrowserClient } from '@supabase/ssr';
import { useAuth } from '@clerk/nextjs';
import { useMemo } from 'react';

/**
 * Cliente de Supabase para componentes del lado del cliente
 * Utiliza la autenticación de Clerk para obtener el token JWT
 */
export function useSupabaseClient() {
  const { userId, getToken } = useAuth();
  
  const supabaseClient = useMemo(() => {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          fetch: async (url, options = {}) => {
            if (userId) {
              // Usar el token JWT de Clerk
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
  }, [userId, getToken]);

  return supabaseClient;
}

// Cliente simple para uso en contextos donde no se necesita autenticación
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default supabase;