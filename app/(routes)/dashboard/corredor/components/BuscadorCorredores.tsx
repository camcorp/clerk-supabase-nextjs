'use client';

import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, FileText, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Corredor } from '@/lib/api/reportes';
import { CarritoCompras, ItemCarrito } from '@/lib/api/carrito';
// Elimina esta importación
// import { getProductoPorCodigo, Producto } from '@/lib/api/reportes';
// Mantén solo la importación del tipo Producto
import { Producto } from '@/lib/api/reportes';
import { carritoUtils } from '@/lib/api/carrito';

interface BuscadorCorredoresProps {
  onReporteComprado?: (rut: string) => void;
}

export default function BuscadorCorredores({ onReporteComprado }: BuscadorCorredoresProps) {
  const [query, setQuery] = useState('');
  const [corredores, setCorredores] = useState<Corredor[]>([]);
  const [loading, setLoading] = useState(false);
  const [comprando, setComprando] = useState<string | null>(null);
  const [ejecutandoFlujoSimulado, setEjecutandoFlujoSimulado] = useState<string | null>(null);
  const [agregandoCarrito, setAgregandoCarrito] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);
  const [carrito] = useState(() => new CarritoCompras());

  // Buscar corredores
  const buscarCorredores = async (searchQuery: string) => {
    if (searchQuery.length < 3) {
      setCorredores([]);
      return;
    }
  
    setLoading(true); // Changed from setIsLoading to setLoading
    try {
      console.log('Iniciando búsqueda:', searchQuery);
      const response = await fetch(`/api/corredores/buscar?q=${encodeURIComponent(searchQuery)}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error en respuesta:', errorData);
        throw new Error(errorData.error || 'Error en la búsqueda');
      }
  
      const data = await response.json();
      console.log('Respuesta recibida:', data);
  
      if (data.success && Array.isArray(data.corredores)) {
        setCorredores(data.corredores);
        console.log('Corredores establecidos:', data.corredores.length);
      } else {
        console.warn('Formato de respuesta inesperado:', data);
        setCorredores([]);
      }
    } catch (error) {
      console.error('Error buscando corredores:', error);
      setCorredores([]);
    } finally {
      setLoading(false); // Changed from setIsLoading to setLoading
    }
  };

  // Comprar reporte
  const comprarReporte = async (rutCorredor: string) => {
    setComprando(rutCorredor);
    setMensaje(null);
    
    try {
      const response = await fetch('/api/reportes/comprar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rutCorredor,
          periodo: '202412'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMensaje({ 
          tipo: 'success', 
          texto: `Reporte comprado exitosamente para ${data.data.corredor.nombre}` 
        });
        onReporteComprado?.(rutCorredor);
      } else {
        setMensaje({ tipo: 'error', texto: data.error || 'Error comprando reporte' });
      }
    } catch (error) {
      setMensaje({ tipo: 'error', texto: 'Error de conexión' });
    } finally {
      setComprando(null);
    }
  };

  // Función para ejecutar flujo simulado completo
  const ejecutarFlujoSimulado = async (rutCorredor: string) => {
    setEjecutandoFlujoSimulado(rutCorredor);
    setMensaje(null);
    
    try {
      const response = await fetch('/api/reportes/flujo-simulado', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rutCorredor,
          periodo: '202412'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMensaje({ 
          tipo: 'success', 
          texto: `✅ Flujo simulado completado para ${data.data.corredor.nombre}. Redirigiendo al reporte...` 
        });
        
        // Redirigir al reporte después de 2 segundos
        setTimeout(() => {
          window.location.href = data.data.url_reporte;
        }, 2000);
      } else {
        setMensaje({ 
          tipo: 'error', 
          texto: `❌ Error en flujo simulado: ${data.error}` 
        });
      }
    } catch (error) {
      setMensaje({ 
        tipo: 'error', 
        texto: '❌ Error de conexión en flujo simulado' 
      });
    } finally {
      setEjecutandoFlujoSimulado(null);
    }
  };

  // Efecto para buscar con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        buscarCorredores(query);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);



// Agregar estado para el producto
const [producto, setProducto] = useState<Producto | null>(null);

// Cargar producto al montar el componente
useEffect(() => {
  const cargarProducto = async () => {
    try {
      // En lugar de llamar directamente a getProductoPorCodigo
      // const prod = await getProductoPorCodigo('rp_001');
      
      // Usa el endpoint API
      const response = await fetch('/api/productos/rp_001');
      if (!response.ok) {
        throw new Error('Error al cargar el producto');
      }
      const data = await response.json();
      setProducto(data.producto);
    } catch (error) {
      console.error('Error cargando producto:', error);
    }
  };
  cargarProducto();
}, []);

// Función agregarAlCarrito corregida
const agregarAlCarrito = async (corredor: any) => {
  try {
    if (!producto) {
      setMensaje({
        tipo: 'error',
        texto: 'Producto no disponible'
      });
      return;
    }

    setAgregandoCarrito(corredor.rut);
    
    const item: ItemCarrito = {
      productoId: producto.id,
      codigo: producto.codigo,
      nombre: `${producto.nombre} - ${corredor.nombre}`,
      descripcion: `${producto.descripcion} del corredor ${corredor.nombre} para el período 202412`,
      precio_neto: producto.precio_neto,
      precio_bruto: producto.precio_bruto,
      cantidad: 1,
      metadata: {
        rutCorredor: corredor.rut,
        nombreCorredor: corredor.nombre,
        periodo: '202412'
      }
    };
    
    const exito = carrito.agregarItem(item);
    
    if (exito) {
      const estadoActualizado = carrito.obtenerEstado();
      carritoUtils.guardarCarrito(estadoActualizado);
      
      setAgregandoCarrito(null);
      setMensaje({
        tipo: 'success',
        texto: `Reporte de ${corredor.nombre} agregado al carrito`
      });
    }
    
  } catch (error) {
    console.error('Error agregando al carrito:', error);
    setMensaje({
      tipo: 'error',
      texto: 'Error al agregar el reporte al carrito'
    });
  } finally {
    setAgregandoCarrito(null);
  }
};

  return (
    <div className="space-y-6">
      {/* Header con indicador de carrito */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Buscar Reportes</h2>
          <p className="text-gray-600">Encuentra y compra reportes de corredores específicos</p>
        </div>
        
        {carrito.obtenerItems().length > 0 && (
          <div className="flex items-center gap-4">
            <Badge variant="default" className="text-sm">
              {carrito.obtenerItems().length} item(s) en carrito
            </Badge>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = '/dashboard/shop/cart'}
              className="flex items-center gap-2"
            >
              <ShoppingCart className="h-4 w-4" />
              Ver Carrito
            </Button>
          </div>
        )}
      </div>

      {/* Buscador */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Corredor
          </CardTitle>
          <CardDescription>
            Ingresa el RUT o nombre del corredor para buscar reportes disponibles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Ej: 762686856 o ALPO CORREDORES"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {loading && (
            <div className="mt-4 text-center text-gray-500">
              Buscando corredores...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mensajes */}
      {mensaje && (
        <Alert className={mensaje.tipo === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          {mensaje.tipo === 'success' ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={mensaje.tipo === 'success' ? 'text-green-800' : 'text-red-800'}>
            {mensaje.texto}
          </AlertDescription>
        </Alert>
      )}

      {/* Resultados */}
      {corredores.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Corredores encontrados ({corredores.length})
          </h2>
          
          <div className="grid gap-4">
            {corredores.map((corredor) => (
              <Card key={corredor.rut} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg text-gray-900">
                          {corredor.nombre}
                        </h3>
                        <Badge variant="outline">
                          RUT: {corredor.rut}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        {corredor.ciudad && (
                          <p><span className="font-medium">Ciudad:</span> {corredor.ciudad}</p>
                        )}
                        {corredor.telefono && (
                          <p><span className="font-medium">Teléfono:</span> {corredor.telefono}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">
                          {producto ? `$${producto.precio_bruto.toLocaleString('es-CL')}` : 'Cargando...'}
                        </p>
                        <p className="text-sm text-gray-500">CLP (IVA incluido)</p>
                      </div>
                      
                      <div className="flex gap-2">
                        {/* Botón Agregar al Carrito */}
                        <Button
                          onClick={() => agregarAlCarrito(corredor)}
                          disabled={agregandoCarrito === corredor.rut}
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          {agregandoCarrito === corredor.rut ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                              Agregando...
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4" />
                              Agregar al Carrito
                            </>
                          )}
                        </Button>
                        
                        {/* Botón Comprar Ahora */}
                        <Button
                          onClick={() => comprarReporte(corredor.rut)}
                          disabled={comprando === corredor.rut}
                          className="flex items-center gap-2"
                        >
                          {comprando === corredor.rut ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Comprando...
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="h-4 w-4" />
                              Comprar Ahora
                            </>
                          )}
                        </Button>
                        
                        {/* Botón Flujo Simulado (mantener existente) */}
                        <Button
                          onClick={() => ejecutarFlujoSimulado(corredor.rut)}
                          disabled={ejecutandoFlujoSimulado === corredor.rut}
                          variant="outline"
                          className="flex items-center gap-2 bg-green-600 text-white hover:bg-green-700"
                        >
                          {ejecutandoFlujoSimulado === corredor.rut ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              🔄 Simulando...
                            </>
                          ) : (
                            '🎯 Flujo Simulado'
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Estado vacío */}
      {query.length >= 3 && !loading && corredores.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron corredores
            </h3>
            <p className="text-gray-600">
              Intenta con otro RUT o nombre de corredor
            </p>
          </CardContent>
        </Card>
      )}

      {/* Información del producto */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">¿Qué incluye el reporte?</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800">
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              Análisis detallado de producción por compañía y ramo
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              Rankings y posicionamiento en el mercado
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              Indicadores de concentración (HHI)
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              Análisis de crecimiento y tendencias
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              Acceso por 30 días desde la compra
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

