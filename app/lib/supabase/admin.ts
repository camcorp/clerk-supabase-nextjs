import { createClient } from '@supabase/supabase-js';

// Verificar que las variables de entorno estén disponibles
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL no está definido');
}

if (!process.env.SUPABASE_SECRET_KEY) {
  throw new Error('SUPABASE_SECRET_KEY no está definido');
}

/**
 * Cliente de Supabase con rol de servicio para operaciones administrativas
 * Este cliente tiene permisos elevados y debe usarse solo en el servidor
 * Usa las nuevas API keys de Supabase (sb_secret_)
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

// Configuración y pruebas de conexión
console.log('🔧 Configuración Supabase (Nuevas API Keys):');
console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Secret Key length:', process.env.SUPABASE_SECRET_KEY?.length);
console.log('Secret Key format valid:', process.env.SUPABASE_SECRET_KEY?.startsWith('sb_secret_'));

// Probar conexión básica
supabaseAdmin.from('users').select('count').limit(1).then(result => {
  console.log('🧪 Test conexión Supabase:', result.error ? 'FAILED' : 'SUCCESS');
  if (result.error) console.error('Error:', result.error);
});

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