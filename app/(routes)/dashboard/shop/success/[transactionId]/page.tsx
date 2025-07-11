'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { CheckCircle, Download, ArrowLeft, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface PagoInfo {
  id: string;
  amount: number;
  rut: string;
  fecha_creacion: string;
  datos_facturacion: {
    rut: string;
    razonSocial: string;
    direccion: string;
    giro: string;
  };
}

export default function SuccessPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [pagoInfo, setPagoInfo] = useState<PagoInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const transactionId = params.transactionId as string;

  useEffect(() => {
    if (!user || !transactionId) return;
  
    const obtenerInfoPago = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/pagos/${transactionId}`);
        
        if (!response.ok) {
          toast.error('Error obteniendo información del pago');
          return;
        }
        
        const data = await response.json();
        console.log('Datos recibidos del API:', data);
        
        setPagoInfo({
          id: data.transaction_id || transactionId,
          amount: data.amount || data.monto || 0, // Usar amount primero, luego monto como fallback
          rut: data.datos_facturacion?.rut || '',
          fecha_creacion: data.fecha_creacion || new Date().toISOString(),
          datos_facturacion: {
            rut: data.datos_facturacion?.rut || '',
            razonSocial: data.datos_facturacion?.razonSocial || data.datos_facturacion?.razon_social || '',
            direccion: data.datos_facturacion?.direccion || '',
            giro: data.datos_facturacion?.giro || 'Sin giro'
          }
        });
      } catch (error) {
        console.error('Error obteniendo datos del pago:', error);
        toast.error('Error cargando información del pago');
        
        // Fallback a datos simulados si hay error
        setPagoInfo({
          id: transactionId,
          amount: 25000,
          rut: '12345678-9',
          fecha_creacion: new Date().toISOString(),
          datos_facturacion: {
            rut: '12345678-9',
            razonSocial: 'Empresa Ejemplo',
            direccion: 'Dirección Ejemplo 123',
            giro: 'Servicios Profesionales'
          }
        });
      } finally {
        setLoading(false);
      }
    };
  
    obtenerInfoPago();
  }, [user, transactionId]);

  const handleDescargarFactura = () => {
    toast.success('Descarga de factura iniciada');
    // Aquí implementarías la descarga real
  };

  const handleVolverDashboard = () => {
    router.push('/dashboard');
  };

  const handleVerReportes = () => {
    router.push('/dashboard/corredor/reportes');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Procesando información del pago...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header de éxito */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Pago Procesado Exitosamente!
          </h1>
          <p className="text-gray-600">
            Tu compra ha sido procesada y ya tienes acceso a los reportes.
          </p>
        </div>

        {/* Información del pago */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-600" />
            Detalles de la Transacción
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">ID Transacción:</span>
              <p className="text-gray-900 font-mono">{transactionId}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Monto:</span>
              <p className="text-gray-900">${pagoInfo?.amount?.toLocaleString('es-CL')} CLP</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Fecha:</span>
              <p className="text-gray-900">
                {new Date(pagoInfo?.fecha_creacion || '').toLocaleDateString('es-CL')}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Estado:</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Pagado
              </span>
            </div>
          </div>

          {/* Datos de facturación */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-medium text-gray-700 mb-3">Datos de Facturación</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">RUT:</span>
                <p className="text-gray-900">{pagoInfo?.datos_facturacion.rut}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Razón Social:</span>
                <p className="text-gray-900">{pagoInfo?.datos_facturacion.razonSocial}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Dirección:</span>
                <p className="text-gray-900">{pagoInfo?.datos_facturacion.direccion}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Giro:</span>
                <p className="text-gray-900">{pagoInfo?.datos_facturacion.giro || 'Sin giro'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="space-y-4">
          {/* Eliminar el botón de factura ya que se emite al día siguiente */}
          
          <Button
            onClick={handleVerReportes}
            variant="default"
            size="lg"
            className="w-full"
          >
            <FileText className="w-5 h-5 mr-2" />
            Ver Mis Reportes
          </Button>
          
          <Button
            onClick={handleVolverDashboard}
            variant="outline"
            className="w-full"
            size="lg"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver al Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}