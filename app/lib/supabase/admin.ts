import { createClient } from '@supabase/supabase-js';

// Verificar que las variables de entorno estén disponibles
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL no está definido');
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY no está definido');
}

/**
 * Cliente de Supabase con rol de servicio para operaciones administrativas
 * Este cliente tiene permisos elevados y debe usarse solo en el servidor
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Función para sincronizar datos de usuario entre Clerk y Supabase
 * @param clerkUser Usuario de Clerk
 */
export async function createSupabaseUserFromClerk(clerkUser: any) {
  return supabaseAdmin
    .from('users')
    .upsert({
      id: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress,
      first_name: clerkUser.firstName,
      last_name: clerkUser.lastName,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();
}