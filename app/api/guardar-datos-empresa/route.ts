// app/api/guardar-datos-empresa/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/app/ssr/client';

export async function POST(req: Request) {
  const body = await req.json();
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { email, empresa, rut_empresa } = body;
  const supabase = createServerSupabaseClient();

  const { error } = await supabase.from('registro_empresa').insert([
    { user_id: userId, email, empresa, rut_empresa }
  ]);

  if (error) {
    console.error('Error al insertar:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}