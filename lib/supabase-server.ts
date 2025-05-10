import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

export async function createServerSupabaseClient() {
  try {
    const authObject = await auth();
    const { userId } = authObject;
    const jwt = await authObject.getToken({ template: 'supabase' });
    
    if (!userId) {
      return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
    }
    
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
