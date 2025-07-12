'use client';

import { CarritoCompras, CarritoEstado } from '@/app/lib/api/carrito';
import { CartItem } from './CartItem';
import { Button } from '@/app/components/ui/button';
import { ShoppingBag, Trash2 } from 'lucide-react';

interface ShoppingCartProps {
  carrito: CarritoCompras;
  carritoEstado: CarritoEstado;
  onActualizar: () => void;
}

export function ShoppingCart({ carrito, carritoEstado, onActualizar }: ShoppingCartProps) {
  const handleActualizarCantidad = (productoId: string, nuevaCantidad: number, metadata?: any) => {
    carrito.actualizarCantidad(productoId, nuevaCantidad, metadata);
    onActualizar();
  };

  const handleEliminarItem = (productoId: string, metadata?: any) => {
    carrito.eliminarItem(productoId, metadata);
    onActualizar();
  };

  const handleLimpiarCarrito = () => {
    carrito.limpiarCarrito();
    onActualizar();
  };

  if (carritoEstado.items.length === 0) {
    return (
      <div className="text-center py-8">
        <ShoppingBag className="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">
          Tu carrito está vacío
        </h3>
        <p className="text-gray-500">
          Agrega algunos productos para comenzar tu compra.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header del carrito */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          Productos en tu carrito ({carritoEstado.cantidadItems})
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLimpiarCarrito}
          className="text-red-500 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Limpiar carrito
        </Button>
      </div>

      {/* Lista de items */}
      <div className="space-y-3">
        {carritoEstado.items.map((item, index) => (
          <CartItem
            key={`${item.productoId}-${JSON.stringify(item.metadata)}-${index}`}
            item={item}
            onActualizarCantidad={handleActualizarCantidad}
            onEliminar={handleEliminarItem}
          />
        ))}
      </div>

      {/* Resumen rápido */}
      <div className="border-t pt-4">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>Total de productos:</span>
          <span>{carritoEstado.cantidadItems}</span>
        </div>
        <div className="flex justify-between items-center text-lg font-semibold mt-2">
          <span>Total:</span>
          <span>${carritoEstado.total.toLocaleString('es-CL')}</span>
        </div>
      </div>
    </div>
  );
}