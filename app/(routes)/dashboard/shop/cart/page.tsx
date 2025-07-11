'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { CarritoCompras, carritoUtils, type CarritoEstado } from '@/lib/api/carrito';
import { ShoppingCart } from '@/components/shop/ShoppingCart';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingBag } from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const { user } = useUser();
  const [carritoEstado, setCarritoEstado] = useState<CarritoEstado>({
    items: [],
    subtotal: 0,
    iva: 0,
    total: 0,
    cantidadItems: 0
  });
  const [carrito] = useState(() => new CarritoCompras());

  useEffect(() => {
    // Cargar carrito desde localStorage
    const carritoGuardado = carritoUtils.cargarCarrito();
    carrito.establecerItems(carritoGuardado.items);
    setCarritoEstado(carrito.obtenerEstado());
  }, [carrito]);

  const handleActualizarCarrito = () => {
    const nuevoEstado = carrito.obtenerEstado();
    setCarritoEstado(nuevoEstado);
    carritoUtils.guardarCarrito(nuevoEstado);
  };

  const handleProcederCheckout = () => {
    if (carritoEstado.cantidadItems > 0) {
      router.push('/dashboard/shop/checkout');
    }
  };

  const handleContinuarComprando = () => {
    router.push('/dashboard/corredor/reportes');
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Acceso requerido</h2>
          <p className="text-gray-600">Debes iniciar sesión para ver tu carrito.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          onClick={handleContinuarComprando}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Continuar Comprando
        </Button>
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Carrito de Compras</h1>
        </div>
      </div>

      {carritoEstado.cantidadItems === 0 ? (
        <div className="text-center py-12">
          <ShoppingBag className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Tu carrito está vacío</h2>
          <p className="text-gray-600 mb-6">
            Explora nuestros reportes y agrega productos a tu carrito.
          </p>
          <Button onClick={handleContinuarComprando}>
            Explorar Reportes
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ShoppingCart
              carrito={carrito}
              carritoEstado={carritoEstado}
              onActualizar={handleActualizarCarrito}
            />
          </div>
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg p-6 sticky top-4">
              <h3 className="text-lg font-semibold mb-4">Resumen del Pedido</h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${carritoEstado.subtotal.toLocaleString('es-CL')}</span>
                </div>
                <div className="flex justify-between">
                  <span>IVA (19%):</span>
                  <span>${carritoEstado.iva.toLocaleString('es-CL')}</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total:</span>
                  <span>${carritoEstado.total.toLocaleString('es-CL')}</span>
                </div>
              </div>
              <Button
                onClick={handleProcederCheckout}
                className="w-full"
                size="lg"
                variant="lufthansa"
              >
                Proceder al Checkout
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}