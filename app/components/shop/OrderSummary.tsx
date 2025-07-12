'use client';

import { CarritoEstado } from '@/app/lib/api/carrito';
import { Package, Receipt } from 'lucide-react';

interface OrderSummaryProps {
  carritoEstado: CarritoEstado;
}

export function OrderSummary({ carritoEstado }: OrderSummaryProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Receipt className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Resumen del Pedido</h3>
      </div>

      {/* Lista de productos */}
      <div className="space-y-3 mb-6">
        {carritoEstado.items.map((item, index) => (
          <div
            key={`${item.productoId}-${JSON.stringify(item.metadata)}-${index}`}
            className="flex justify-between items-start text-sm"
          >
            <div className="flex-1">
              <div className="font-medium">{item.nombre}</div>
              <div className="text-gray-500 text-xs">
                {item.codigo}
                {item.metadata?.rutCorredor && (
                  <span> • RUT: {item.metadata.rutCorredor}</span>
                )}
                {item.metadata?.periodo && (
                  <span> • Período: {item.metadata.periodo}</span>
                )}
              </div>
              <div className="text-gray-600 text-xs mt-1">
                ${item.precio_bruto.toLocaleString('es-CL')} × {item.cantidad}
              </div>
            </div>
            <div className="font-medium ml-4">
              ${(item.precio_bruto * item.cantidad).toLocaleString('es-CL')}
            </div>
          </div>
        ))}
      </div>

      {/* Totales */}
      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span>Subtotal ({carritoEstado.cantidadItems} productos):</span>
          <span>${carritoEstado.subtotal.toLocaleString('es-CL')}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span>IVA (19%):</span>
          <span>${carritoEstado.iva.toLocaleString('es-CL')}</span>
        </div>
        
        <div className="border-t pt-2">
          <div className="flex justify-between font-bold text-lg">
            <span>Total:</span>
            <span className="text-green-600">
              ${carritoEstado.total.toLocaleString('es-CL')}
            </span>
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="mt-6 p-3 bg-blue-50 rounded-lg">
        <div className="flex items-start gap-2">
          <Package className="h-4 w-4 text-blue-600 mt-0.5" />
          <div className="text-xs text-blue-700">
            <div className="font-medium mb-1">Acceso Inmediato</div>
            <div>
              Una vez procesado el pago, tendrás acceso permanente a todos los reportes adquiridos.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}