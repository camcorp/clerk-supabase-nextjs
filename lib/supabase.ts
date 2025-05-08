import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

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

// Crear cliente de Supabase con rol de servicio (para operaciones administrativas)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Función para crear un cliente de Supabase autenticado con Clerk (para el servidor)
export async function createServerSupabaseClient() {
  const { userId } = await auth();
  
  // Si no hay usuario autenticado, devolver un cliente anónimo
  if (!userId) {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  
  // Si hay un usuario autenticado, crear un cliente con el token JWT de Clerk
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${userId}`
        }
      }
    }
  );
}

// Función para sincronizar datos de usuario entre Clerk y Supabase
export async function createSupabaseUserFromClerk(clerkUser: any) {
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