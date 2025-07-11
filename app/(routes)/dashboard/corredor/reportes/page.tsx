'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import BuscadorCorredores from '../components/BuscadorCorredores';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Eye, Calendar, Loader2, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { CarritoCompras } from '@/lib/api/carrito';

interface ReporteComprado {
  rut: string;
  nombre: string;
  periodo: string;
  fecha_compra: string;
  fecha_expiracion: string;
  activo: boolean;
}

export default function ReportesCorredoresPage() {
  const { user } = useUser();
  const [reportesComprados, setReportesComprados] = useState<ReporteComprado[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'comprados' | 'buscar'>('comprados');
  const [carrito] = useState(() => new CarritoCompras());
  const [itemsCarrito, setItemsCarrito] = useState(0);

  // Actualizar contador del carrito
  useEffect(() => {
    const actualizarCarrito = () => {
      setItemsCarrito(carrito.obtenerItems().length);
    };
    
    // Actualizar inicialmente
    actualizarCarrito();
    
    // Escuchar cambios en localStorage
    const interval = setInterval(actualizarCarrito, 1000);
    
    return () => clearInterval(interval);
  }, [carrito]);

  // Cargar reportes comprados
  useEffect(() => {
    if (!user) return;

    const fetchReportesComprados = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/reportes/mis-reportes');
        if (response.ok) {
          const data = await response.json();
          setReportesComprados(data.reportes || []);
        }
      } catch (error) {
        console.error('Error cargando reportes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReportesComprados();
  }, [user]);

  // Callback cuando se compra un nuevo reporte
  const handleReporteComprado = (rut: string) => {
    // Recargar la lista de reportes comprados
    if (user) {
      fetch('/api/reportes/mis-reportes')
        .then(response => response.json())
        .then(data => {
          setReportesComprados(data.reportes || []);
          setActiveTab('comprados'); // Cambiar a la pestaña de comprados
        })
        .catch(console.error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header con carrito */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Reportes Individuales de Corredores
          </h1>
          <p className="text-gray-600">
            Gestiona tus reportes comprados y busca nuevos reportes de corredores
          </p>
        </div>
        
        {itemsCarrito > 0 && (
          <div className="flex items-center gap-4">
            <Badge variant="default" className="text-sm">
              {itemsCarrito} item(s) en carrito
            </Badge>
            <Link href="/dashboard/shop/cart">
              <Button className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Ver Carrito (${carrito.calcularTotal().toLocaleString('es-CL')})
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Navegación por pestañas */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('comprados')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'comprados'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Mis Reportes ({reportesComprados.length})
            </button>
            <button
              onClick={() => setActiveTab('buscar')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'buscar'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Buscar Nuevos Reportes
            </button>
          </nav>
        </div>
      </div>

      {/* Contenido de pestañas */}
      {activeTab === 'comprados' && (
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Cargando tus reportes...</p>
            </div>
          ) : reportesComprados.length > 0 ? (
            <div className="grid gap-4">
              {reportesComprados.map((reporte) => (
                <Card key={`${reporte.rut}-${reporte.periodo}`} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg text-gray-900">
                            {reporte.nombre}
                          </h3>
                          <Badge variant="outline">
                            RUT: {reporte.rut}
                          </Badge>
                          <Badge variant={reporte.activo ? 'success' : 'outline'}>
                            {reporte.activo ? 'Activo' : 'Expirado'}
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-gray-600 space-y-1">
                          <p className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span className="font-medium">Período:</span> {reporte.periodo}
                          </p>
                          <p>
                            <span className="font-medium">Comprado:</span> {new Date(reporte.fecha_compra).toLocaleDateString('es-CL')}
                          </p>
                          <p>
                            <span className="font-medium">Expira:</span> {new Date(reporte.fecha_expiracion).toLocaleDateString('es-CL')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        {reporte.activo ? (
                          <Link href={`/dashboard/corredor/reportes/${reporte.rut}`}>
                            <Button className="flex items-center gap-2">
                              <Eye className="h-4 w-4" />
                              Ver Reporte
                            </Button>
                          </Link>
                        ) : (
                          <Button disabled variant="secondary" className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Expirado
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No tienes reportes comprados
                </h3>
                <p className="text-gray-600 mb-4">
                  Busca y compra tu primer reporte de corredor para comenzar
                </p>
                <Button onClick={() => setActiveTab('buscar')}>
                  Buscar Reportes
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'buscar' && (
        <BuscadorCorredores onReporteComprado={handleReporteComprado} />
      )}
    </div>
  );
}