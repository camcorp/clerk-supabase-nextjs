import { NextRequest, NextResponse } from 'next/server';
import { getProductoPorCodigo } from '@/app/lib/api/reportes';

export async function GET(
  request: NextRequest,
  { params }: { params: { codigo: string } }
) {
  try {
    const { codigo } = params;

    if (!codigo) {
      return NextResponse.json(
        { error: 'Código de producto requerido' },
        { status: 400 }
      );
    }

    const producto = await getProductoPorCodigo(codigo);

    if (!producto) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: producto
    });

  } catch (error) {
    console.error('Error obteniendo producto:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}