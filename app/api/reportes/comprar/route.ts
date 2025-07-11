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

    // Obtener datos del request
    const { rutCorredor, periodo } = await request.json();
    
    if (!rutCorredor) {
      return NextResponse.json(
        { error: 'RUT del corredor es requerido' },
        { status: 400 }
      );
    }

    // Procesar compra del reporte
    const resultado = await comprarReporte(userId, rutCorredor, periodo || '202412');
    
    if (!resultado.success) {
      return NextResponse.json(
        { error: resultado.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Reporte comprado exitosamente',
      data: {
        corredor: resultado.corredor,
        reporte_id: resultado.reporte?.id,
        acceso_hasta: resultado.acceso?.fecha_fin
      }
    });
  } catch (error) {
    console.error('Error en API comprar reporte:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}