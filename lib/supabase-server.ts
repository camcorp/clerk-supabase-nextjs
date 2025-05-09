import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { auth } from '@clerk/nextjs';

// Create a single supabase client for server components
export async function createServerSupabaseClient() {
  const { getToken } = auth();
  const token = await getToken({ template: 'supabase' });
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    }
  );
}