import { NextRequest, NextResponse } from 'next/server';
import { comprarReporte } from '@/app/lib/api/reportes';

/**
 * API endpoint para simular la compra de un reporte
 * POST /api/reportes/simular-compra
 * 
 * Body:
 * {
 *   "userId": "string",
 *   "rut": "string", 
 *   "periodo": "string"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, rut, periodo } = body;

    // Validar parámetros requeridos
    if (!userId || !rut || !periodo) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Faltan parámetros requeridos: userId, rut, periodo' 
        },
        { status: 400 }
      );
    }

    // Validar formato del RUT (básico)
    if (!/^\d{7,9}$/.test(rut)) {
      return NextResponse.json(
        { 
          success: false, 
          
          error: 'Formato de RUT inválido. Debe ser solo números sin dígito verificador' 
        },
        { status: 400 }
      );
    }

    // Validar formato del período (YYYYMM)
    if (!/^\d{6}$/.test(periodo)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Formato de período inválido. Debe ser YYYYMM (ej: 202412)' 
        },
        { status: 400 }
      );
    }

    console.log(`🚀 Simulando compra de reporte:`);
    console.log(`   - Usuario: ${userId}`);
    console.log(`   - RUT: ${rut}`);
    console.log(`   - Período: ${periodo}`);

    // Llamar a la función de compra
    const resultado = await comprarReporte(userId, rut, periodo);

    if (resultado.success) {
      console.log('✅ Compra simulada exitosamente');
      
      return NextResponse.json({
        success: true,
        message: 'Compra simulada exitosamente',
        data: {
          pago: {
            id: resultado.pago.id,
            orden_comercio: resultado.pago.orden_comercio,
            amount: resultado.pago.amount,
            estado: resultado.pago.estado,
            fecha_creacion: resultado.pago.fecha_creacion
          },
          acceso: {
            id: resultado.acceso.id,
            modulo: resultado.acceso.modulo,
            fecha_inicio: resultado.acceso.fecha_inicio,
            fecha_fin: resultado.acceso.fecha_fin,
            activo: resultado.acceso.activo
          },
          reporte: {
            id: resultado.reporte.id,
            rut: resultado.reporte.rut,
            periodo: resultado.reporte.periodo,
            fecha_generacion: resultado.reporte.fecha_generacion,
            fecha_expiracion: resultado.reporte.fecha_expiracion,
            activo: resultado.reporte.activo
          },
          url_acceso: `/dashboard/corredor/reportes/${rut}`
        }
      });
    } else {
      console.error('❌ Error en la compra:', resultado.error);
      
      return NextResponse.json(
        {
          success: false,
          error: resultado.error
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('💥 Error inesperado en simulación de compra:', error);
    
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

/**
 * GET /api/reportes/simular-compra
 * Endpoint de información sobre cómo usar la API
 */
export async function GET() {
  return NextResponse.json({
    message: 'API de Simulación de Compra de Reportes',
    description: 'Simula la compra de un reporte individual de corredor',
    method: 'POST',
    endpoint: '/api/reportes/simular-compra',
    body: {
      userId: 'string - ID del usuario que compra',
      rut: 'string - RUT del corredor (solo números)',
      periodo: 'string - Período en formato YYYYMM'
    },
    example: {
      userId: 'user_demo_123',
      rut: '762686856',
      periodo: '202412'
    },
    response: {
      success: 'boolean',
      message: 'string',
      data: {
        pago: 'object - Información del pago',
        acceso: 'object - Información del acceso',
        reporte: 'object - Información del reporte',
        url_acceso: 'string - URL para acceder al reporte'
      }
    }
  });
}