import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getReporteIndividual, verificarAccesoReporte, getCorredor } from '@/lib/api/reportes';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ rut: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { rut } = await params;
    const { searchParams } = new URL(request.url);
    const periodo = searchParams.get('periodo') || '202412';

    // Verificar acceso
    const tieneAcceso = await verificarAccesoReporte(userId, rut);
    if (!tieneAcceso) {
      return NextResponse.json(
        { error: 'No tienes acceso a este reporte' },
        { status: 403 }
      );
    }

    // Obtener reporte (ya contiene todo el JSON completo)
    const reporteRaw = await getReporteIndividual(userId, rut, periodo);
    if (!reporteRaw) {
      return NextResponse.json(
        { error: 'Reporte no encontrado' },
        { status: 404 }
      );
    }

    // El reporte ya viene completo desde la base de datos
    // Solo necesitamos estructurarlo para el frontend
    const reporte = {
      periodo: reporteRaw.periodo,
      datos_reporte: reporteRaw.datos_reporte, // Ya contiene todo: companias, ramos, corredor, etc.
      fecha_generacion: reporteRaw.fecha_generacion,
      fecha_expiracion: reporteRaw.fecha_expiracion
    };

    return NextResponse.json({
      success: true,
      reporte
    });
  } catch (error) {
    console.error('Error en API obtener reporte:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}