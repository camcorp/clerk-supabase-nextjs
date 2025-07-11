import { NextResponse } from 'next/server';
import { getProductoPorCodigo } from '@/lib/api/reportes';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ codigo: string }> }
) {
  try {
    const resolvedParams = await params;
    const codigo = resolvedParams.codigo;
    const producto = await getProductoPorCodigo(codigo);
    
    if (!producto) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ producto });
  } catch (error) {
    console.error('Error obteniendo producto:', error);
    return NextResponse.json(
      { error: 'Error al obtener el producto' },
      { status: 500 }
    );
  }
}