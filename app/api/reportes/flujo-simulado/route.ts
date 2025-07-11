import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { comprarReporte } from '@/lib/api/reportes';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { rutCorredor, periodo = '202412' } = await request.json();
    
    if (!rutCorredor) {
      return NextResponse.json(
        { error: 'RUT del corredor es requerido' },
        { status: 400 }
      );
    }

    console.log('🎯 Iniciando flujo simulado completo...');
    console.log(`   - Usuario: ${userId}`);
    console.log(`   - RUT Corredor: ${rutCorredor}`);
    console.log(`   - Período: ${periodo}`);

    // Paso 1: Simular selección del corredor
    console.log('📋 Paso 1: Seleccionando corredor...');
    
    // Paso 2: Simular proceso de pago
    console.log('💳 Paso 2: Procesando pago simulado...');
    
    // Paso 3: Ejecutar compra completa
    console.log('🔄 Paso 3: Ejecutando compra...');
    const resultado = await comprarReporte(userId, rutCorredor, periodo);
    
    if (!resultado.success) {
      return NextResponse.json(
        { 
          success: false,
          error: resultado.error,
          paso: 'compra'
        },
        { status: 400 }
      );
    }

    console.log('✅ Flujo simulado completado exitosamente');
    
    return NextResponse.json({
      success: true,
      message: 'Flujo de compra simulado completado exitosamente',
      data: {
        corredor: resultado.corredor,
        reporte_id: resultado.reporte?.id,
        acceso_hasta: resultado.acceso?.fecha_fin,
        pago_simulado: {
          monto: 9990,
          estado: 'aprobado',
          fecha: new Date().toISOString()
        },
        url_reporte: `/dashboard/reportes/${resultado.reporte?.id}`
      }
    });
  } catch (error) {
    console.error('❌ Error en flujo simulado:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}