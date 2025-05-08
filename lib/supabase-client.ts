'use client';

import { createBrowserClient } from '@supabase/ssr';
import { useAuth } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';

// Cliente de Supabase para el lado del cliente
export function useSupabaseClient() {
  const { userId, getToken } = useAuth();
  
  // Si no hay usuario autenticado, devolver un cliente anónimo
  if (!userId) {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  // Si hay un usuario autenticado, crear un cliente con el token JWT de Clerk
  const supabaseClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${userId}`,
        },
      },
      auth: {
        persistSession: false,
      },
    }
  );

  return supabaseClient;
}