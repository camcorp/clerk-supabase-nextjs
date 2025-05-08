import { createClerkClient } from '@clerk/clerk-sdk-node';
import { createClient } from '@supabase/supabase-js';
import { createClerkSupabaseClient } from '@clerk/supabase';

// Verificar que las variables de entorno estén disponibles
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL no está definido');
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY no está definido');
}

if (!process.env.CLERK_SECRET_KEY) {
  throw new Error('CLERK_SECRET_KEY no está definido');
}

// Crear cliente de Clerk
const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

// Crear cliente de Supabase con el wrapper de Clerk
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Función para crear un cliente de Supabase autenticado con Clerk
export async function getSupabase(userId: string) {
  // Crear un cliente de Supabase con el wrapper de Clerk
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

// Hook para usar en el lado del cliente
export function createSupabaseUserFromClerk(clerkUser: any) {
  // Esta función se puede usar para sincronizar datos adicionales del usuario
  // entre Clerk y Supabase si es necesario
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