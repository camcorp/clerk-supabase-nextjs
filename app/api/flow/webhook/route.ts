import { NextRequest, NextResponse } from 'next/server';
import { procesarWebhookFlow } from '@/app/lib/flow/webhook';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar firma del webhook si es necesario
    const signature = request.headers.get('x-flow-signature');
    
    const resultado = await procesarWebhookFlow(body, signature);
    
    return NextResponse.json({ success: true, data: resultado });
  } catch (error) {
    console.error('Error procesando webhook de Flow:', error);
    return NextResponse.json(
      { error: 'Error procesando webhook' },
      { status: 500 }
    );
  }
}