// app/api/guardar-datos-empresa/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // usa la service role para escritura segura
);

export async function POST(req: Request) {
  const body = await req.json();

  const { user_id, email, empresa, rut_empresa } = body;

  const { error } = await supabase.from('registro_empresa').insert([
    { user_id, email, empresa, rut_empresa }
  ]);

  if (error) {
    console.error('Error al insertar:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}