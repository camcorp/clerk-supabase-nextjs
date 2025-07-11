import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { obtenerReportesComprados } from '@/lib/api/reportes';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    console.log('🔍 Obteniendo reportes para userId:', userId);
    const reportes = await obtenerReportesComprados(userId);
    console.log('📊 Reportes encontrados:', reportes.length);
    
    // Logging mejorado para debugging
    if (reportes.length > 0) {
      const primerReporte = reportes[0];
      console.log('🔍 Estructura del primer reporte:');
      console.log('- RUT:', primerReporte.rut);
      console.log('- Nombre:', primerReporte.nombre);
      console.log('- Período:', primerReporte.periodo);
      console.log('- Fecha compra:', primerReporte.fecha_compra);
      console.log('- Fecha expiración:', primerReporte.fecha_expiracion);
      console.log('- Activo:', primerReporte.activo);
      console.log('- Reporte disponible:', primerReporte.reporte_disponible);
    }
    
    return NextResponse.json({
      success: true,
      reportes
    });
  } catch (error) {
    console.error('Error obteniendo reportes comprados:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Opcional: Agregar otros métodos HTTP si los necesitas
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Lógica para crear un nuevo reporte
    
    return NextResponse.json({
      success: true,
      message: 'Reporte creado exitosamente'
    });
    
  } catch (error) {
    console.error('Error en POST /api/reportes/mis-reportes:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}