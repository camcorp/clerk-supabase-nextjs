import { supabaseAdmin } from '@/lib/supabase/admin';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ transactionId: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const transactionId = resolvedParams.transactionId;
    
    if (!transactionId) {
      return NextResponse.json(
        { error: 'ID de transacción no proporcionado' },
        { status: 400 }
      );
    }

    // Obtener información del pago
    const { data, error } = await supabaseAdmin
      .from('pagos')
      .select('*')
      .eq('transaction_id', transactionId)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error obteniendo pago:', error);
      return NextResponse.json(
        { error: 'Error obteniendo información del pago' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Pago no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error obteniendo información del pago:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Error desconocido obteniendo información del pago' 
      },
      { status: 500 }
    );
  }
}