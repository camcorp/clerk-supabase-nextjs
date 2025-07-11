import { supabaseAdmin } from '@/lib/supabase/admin';
import { generarReporteIndividual } from '@/lib/api/reportes';
import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-flow-signature');
    
    // Verificar firma de Flow.cl
    const secretKey = process.env.FLOW_SECRET_KEY!;
    const expectedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(body)
      .digest('hex');
    
    if (signature !== expectedSignature) {
      return NextResponse.json({ error: 'Firma inválida' }, { status: 401 });
    }
    
    const data = JSON.parse(body);
    
    // Procesar confirmación de pago
    if (data.status === 'completed') {
      await confirmarPagoFlow(data);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error en webhook Flow:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

async function confirmarPagoFlow(flowData: any) {
  try {
    // 1. Obtener información del pago
    const { data: pago, error: pagoError } = await supabaseAdmin
      .from('pagos')
      .select('*')
      .eq('flow_token', flowData.token)
      .single();
    
    if (pagoError || !pago) {
      console.error('Error obteniendo pago:', pagoError);
      return;
    }
    
    // 2. Actualizar estado del pago
    const { error: updateError } = await supabaseAdmin
      .from('pagos')
      .update({
        estado: 'completed',
        flow_status: flowData.status,
        flow_payment_date: new Date().toISOString()
      })
      .eq('flow_token', flowData.token);
      
    if (updateError) {
      console.error('Error actualizando pago:', updateError);
      return;
    }
    
    console.log('Pago confirmado exitosamente:', pago.id);
    
    // 3. Generar reporte individual
    const periodo = '202412'; // O extraer del pago si está almacenado
    // CAMBIAR: const reporte = await generarReporteIndividual(pago.user_id, pago.rut, periodo);
    const reporte = await generarReporteIndividual(pago.user_id, pago.rut_factura, periodo);
    
    if (reporte) {
      console.log('Reporte generado exitosamente:', reporte.id);
    } else {
      console.error('Error generando reporte para pago:', pago.id);
    }
    
  } catch (error) {
    console.error('Error en confirmarPagoFlow:', error);
  }
}