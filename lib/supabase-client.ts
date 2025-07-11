import { createClient } from '@supabase/supabase-js';
import { useSession } from '@clerk/nextjs';

export function createClerkSupabaseClient() {
  const { session } = useSession();
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      async accessToken() {
        return session?.getToken() ?? null;
      },
    }
  );
}