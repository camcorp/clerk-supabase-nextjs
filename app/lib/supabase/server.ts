'use server';

import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

/**
 * Crea un cliente de Supabase para componentes del lado del servidor
 * Utiliza la autenticación de Clerk para obtener el token JWT
 */
export async function createServerSupabaseClient() {
  try {
    const authObject = await auth();
    const { userId } = authObject;
    
    // Si no hay usuario autenticado, devolver un cliente anónimo
    if (!userId) {
      return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
    }
    
    // Si hay un usuario autenticado, obtener el token JWT de Clerk
    const jwt = await authObject.getToken({ template: 'supabase' });
    
    // Crear un cliente con el token JWT
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        },
      }
    );
  } catch (error) {
    // En caso de error, devolver un cliente sin autenticación
    console.error('Error al obtener la autenticación de Clerk:', error);
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
}

// Exportar una función simple para crear un cliente de Supabase sin autenticación
export async function createAnonymousServerClient() { // <--- Añadido 'async'
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}