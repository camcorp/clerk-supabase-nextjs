'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { CarritoCompras, carritoUtils, type CarritoEstado } from '@/lib/api/carrito';
import { OrderSummary } from '@/components/shop/OrderSummary';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CreditCard, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CheckoutPage() {
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
  const [procesandoPago, setProcesandoPago] = useState(false);
  
  // Estados para los campos de facturación
  const [datosFacturacion, setDatosFacturacion] = useState({
    rut: '',
    razonSocial: '',
    direccion: '',
    giro: ''
  });

  useEffect(() => {
    // Cargar carrito desde localStorage
    const carritoGuardado = carritoUtils.cargarCarrito();
    if (carritoGuardado.cantidadItems === 0) {
      router.push('/dashboard/shop/cart');
      return;
    }
    carrito.establecerItems(carritoGuardado.items);
    setCarritoEstado(carrito.obtenerEstado());
  }, [carrito, router]);

  const handleInputChange = (campo: string, valor: string) => {
    setDatosFacturacion(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const validarDatosFacturacion = () => {
    if (!datosFacturacion.rut.trim()) {
      toast.error('El RUT es obligatorio para emitir la factura');
      return;
    }
    if (!datosFacturacion.razonSocial.trim()) {
      toast.error('La razón social es obligatoria para emitir la factura');
      return false;
    }
    if (!datosFacturacion.direccion.trim()) {
      toast.error('La dirección es obligatoria para emitir la factura');
      return false;
    }
    return true;
  };

  const handleProcesarPago = async () => {
    console.log('🔄 Iniciando handleProcesarPago');
    
    if (!user) {
      console.log('❌ Usuario no autenticado');
      toast.error('Debes iniciar sesión para procesar el pago');
      return;
    }
  
    // Verificar que el carrito no esté vacío
    const items = carrito.obtenerItems();
    if (!items || items.length === 0) {
      console.log('❌ Carrito vacío');
      toast.error('El carrito está vacío');
      router.push('/dashboard/shop/cart');
      return;
    }
  
    console.log('✅ Usuario autenticado:', user.id);
    console.log('🛒 Items en carrito:', items);
  
    // Validar datos de facturación antes de procesar
    if (!validarDatosFacturacion()) {
      console.log('❌ Datos de facturación inválidos');
      return;
    }
  
    console.log('✅ Datos de facturación válidos:', datosFacturacion);
  
    setProcesandoPago(true);
    try {
      console.log('🚀 Llamando a carrito.procesarCompra...');
      
      const resultado = await carrito.procesarCompra(user.id, datosFacturacion);
      
      console.log('📋 Resultado completo:', resultado);
      
      if (resultado.success && resultado.transactionId) {
        console.log('✅ Compra exitosa, transactionId:', resultado.transactionId);
        
        // Actualizar el estado local del carrito después de la limpieza
        setCarritoEstado(carrito.obtenerEstado());
        
        console.log('🔄 Redirigiendo a página de éxito...');
        const successUrl = `/dashboard/shop/success/${resultado.transactionId}`;
        console.log('🎯 URL de redirección:', successUrl);
        
        router.push(successUrl);
        toast.success('¡Compra procesada exitosamente!');
      } else {
        console.log('❌ Error en resultado:', resultado.error);
        toast.error(resultado.error || 'Error procesando la compra');
      }
    } catch (error) {
      console.error('💥 Error en catch:', error);
      console.error('💥 Stack trace:', error.stack);
      toast.error('Error inesperado procesando la compra');
    } finally {
      console.log('🏁 Finalizando procesamiento');
      setProcesandoPago(false);
    }
  };

  const handleVolverCarrito = () => {
    router.push('/dashboard/shop/cart');
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Acceso requerido</h2>
          <p className="text-gray-600">Debes iniciar sesión para proceder con el checkout.</p>
        </div>
      </div>
    );
  }

  if (carritoEstado.cantidadItems === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Carrito vacío</h2>
          <p className="text-gray-600 mb-4">No hay productos en tu carrito.</p>
          <Button onClick={() => router.push('/dashboard/corredor/reportes')}>
            Explorar Reportes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          onClick={handleVolverCarrito}
          className="flex items-center gap-2"
          disabled={procesandoPago}
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al Carrito
        </Button>
        <div className="flex items-center gap-2">
          <CreditCard className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Checkout</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-6">Información de Facturación</h2>
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={user.emailAddresses[0]?.emailAddress || ''}
                  disabled
                  className="w-full p-3 border rounded-lg bg-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  RUT <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={datosFacturacion.rut}
                  onChange={(e) => handleInputChange('rut', e.target.value)}
                  placeholder="Ej: 12.345.678-9"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Razón Social <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={datosFacturacion.razonSocial}
                  onChange={(e) => handleInputChange('razonSocial', e.target.value)}
                  placeholder="Nombre de la empresa o persona"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Dirección <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={datosFacturacion.direccion}
                  onChange={(e) => handleInputChange('direccion', e.target.value)}
                  placeholder="Dirección completa"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Giro</label>
                <input
                  type="text"
                  value={datosFacturacion.giro}
                  onChange={(e) => handleInputChange('giro', e.target.value)}
                  placeholder="Sin giro (opcional)"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Si no tiene giro específico, puede dejarlo vacío o escribir "Sin giro"
                </p>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Método de Pago</h3>
              <p className="text-sm text-blue-700">
                Esta es una compra simulada. Al procesar el pago, se creará automáticamente el acceso a los reportes seleccionados y se generará la factura con los datos proporcionados.
              </p>
            </div>
            
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <span className="font-medium">Importante:</span> Los campos marcados con * son obligatorios para la emisión de la factura.
              </p>
            </div>
          </div>
        </div>

        <div>
          <OrderSummary carritoEstado={carritoEstado} />
          
          <div className="mt-6">
            <Button
              onClick={handleProcesarPago}
              disabled={procesandoPago}
              variant="success" // Usar la nueva variante
              size="lg"
              className="w-full"
            >
              {procesandoPago ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Procesando Pago...
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5 mr-2" />
                  Pagar
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}