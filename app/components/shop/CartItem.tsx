'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { ItemCarrito } from '@/lib/api/carrito';

interface CartItemProps {
  item: ItemCarrito;
  onActualizarCantidad: (productoId: string, nuevaCantidad: number, metadata?: any) => void;
  onEliminar: (productoId: string, metadata?: any) => void;
}

export function CartItem({ item, onActualizarCantidad, onEliminar }: CartItemProps) {
  const [cantidad, setCantidad] = useState(item.cantidad);

  const handleCantidadChange = (nuevaCantidad: number) => {
    if (nuevaCantidad < 1) return;
    setCantidad(nuevaCantidad);
    onActualizarCantidad(item.productoId, nuevaCantidad, item.metadata);
  };

  const handleEliminar = () => {
    onEliminar(item.productoId, item.metadata);
  };

  const subtotalItem = item.precio_bruto * item.cantidad;

  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg bg-white">
      {/* Información del producto */}
      <div className="flex-1">
        <h3 className="font-semibold text-lg">{item.nombre}</h3>
        <p className="text-gray-600 text-sm mb-2">{item.descripcion}</p>
        
        {/* Metadata específica (ej: para reportes) */}
        {item.metadata && (
          <div className="text-xs text-gray-500 space-y-1">
            {item.metadata.rutCorredor && (
              <div>RUT Corredor: {item.metadata.rutCorredor}</div>
            )}
            {item.metadata.nombreCorredor && (
              <div>Corredor: {item.metadata.nombreCorredor}</div>
            )}
            {item.metadata.periodo && (
              <div>Período: {item.metadata.periodo}</div>
            )}
          </div>
        )}
        
        <div className="flex items-center gap-2 mt-2">
          <span className="text-sm text-gray-500">Código:</span>
          <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
            {item.codigo}
          </span>
        </div>
      </div>

      {/* Precio unitario */}
      <div className="text-right">
        <div className="text-sm text-gray-500">Precio unitario</div>
        <div className="font-semibold">
          ${item.precio_bruto.toLocaleString('es-CL')}
        </div>
        {item.precio_neto !== item.precio_bruto && (
          <div className="text-xs text-gray-400">
            Neto: ${item.precio_neto.toLocaleString('es-CL')}
          </div>
        )}
      </div>

      {/* Controles de cantidad */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleCantidadChange(cantidad - 1)}
          disabled={cantidad <= 1}
        >
          <Minus className="h-4 w-4" />
        </Button>
        
        <span className="w-12 text-center font-semibold">
          {cantidad}
        </span>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleCantidadChange(cantidad + 1)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Subtotal */}
      <div className="text-right min-w-[100px]">
        <div className="text-sm text-gray-500">Subtotal</div>
        <div className="font-bold text-lg">
          ${subtotalItem.toLocaleString('es-CL')}
        </div>
      </div>

      {/* Botón eliminar */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleEliminar}
        className="text-red-500 hover:text-red-700 hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}