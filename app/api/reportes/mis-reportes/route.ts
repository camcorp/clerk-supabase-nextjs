import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { obtenerReportesComprados } from '@/app/lib/api/reportes';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    console.log('🔍 Obteniendo reportes para usuario:', userId);

    // Obtener reportes comprados del usuario
    const reportes = await obtenerReportesComprados(userId);

    console.log('📊 Reportes encontrados:', reportes?.length || 0);

    return NextResponse.json({
      success: true,
      reportes: reportes || [],
      total: reportes?.length || 0
    });

  } catch (error) {
    console.error('❌ Error en /api/reportes/mis-reportes:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Error interno del servidor',
        reportes: [],
        total: 0
      },
      { status: 500 }
    );
  }
}

// Método OPTIONS para CORS si es necesario
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  );
}