'use client';

import { createBrowserClient } from '@supabase/ssr';
import { createClerkSupabaseClient } from '@clerk/supabase';
import { useAuth } from '@clerk/nextjs';

// Cliente de Supabase para el lado del cliente
export function useSupabaseClient() {
  const { userId } = useAuth();
  
  // Si no hay usuario autenticado, devolver un cliente anónimo
  if (!userId) {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  // Si hay un usuario autenticado, devolver un cliente con el wrapper de Clerk
  return createClerkSupabaseClient({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    authInfo: { userId },
    options: {
      auth: {
        persistSession: false,
      },
    },
  });
}