'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useSupabaseClient } from '@/lib/supabase-client';

type ProcesoPagoProps = {
  corredor: {
    id: number;
    rut: string;
    nombre: string;
  };
  onCancel: () => void;
  onSuccess: () => void;
};

export default function ProcesoPago({ corredor, onCancel, onSuccess }: ProcesoPagoProps) {
  const { user } = useUser();
  const router = useRouter();
  const supabase = useSupabaseClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagoExitoso, setPagoExitoso] = useState(false);
  
  // Precio fijo para el informe (en producción real, esto podría venir de una tabla de productos)
  const precio = 9990;
  const productoId = 'rp_001'; // ID del producto para informes de corredores

  const procesarPago = async () => {
    if (!user?.id) {
      setError('Debes iniciar sesión para realizar esta operación');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Registrar el pago en la tabla pagos
      const { data: pago, error: errorPago } = await supabase
        .from('pagos')
        .insert({
          user_id: user.id,
          rut: corredor.rut,
          producto_id: productoId,
          orden_comercio: `ORD-${Date.now()}`, // Generar un ID de orden único
          amount: precio,
          estado: 'pagado', // En un entorno real, esto sería 'pendiente' hasta confirmar el pago
          fecha_creacion: new Date().toISOString(),
          token: `TKN-${Math.random().toString(36).substring(2, 15)}`, // Token simulado
          url_pago: '' // En un entorno real, aquí iría la URL de pago del proveedor
        })
        .select()
        .single();

      if (errorPago) throw new Error(errorPago.message);

      // 2. Crear el reporte individual (en un entorno real, esto se haría después de confirmar el pago)
      const fechaExpiracion = new Date();
      fechaExpiracion.setMonth(fechaExpiracion.getMonth() + 1); // Acceso por 1 mes

      const { error: errorReporte } = await supabase
        .from('reporte_individual')
        .insert({
          user_id: user.id,
          rut: corredor.rut,
          periodo: new Date().toISOString().substring(0, 7), // YYYY-MM
          data: {
            nombre: corredor.nombre,
            // En un entorno real, aquí se incluirían todos los datos del informe
            produccion: {
              total_primaclp: 0,
              total_primauf: 0,
              ranking_general: 0,
              num_companias: 0,
              num_ramos: 0
            },
            companias: [],
            ramos: []
          },
          fecha_generacion: new Date().toISOString(),
          fecha_expiracion: fechaExpiracion.toISOString(),
          activo: true
        });

      if (errorReporte) throw new Error(errorReporte.message);

      // Simular un pequeño retraso para mostrar el proceso
      setTimeout(() => {
        setPagoExitoso(true);
        setLoading(false);
        
        // Notificar al componente padre después de un breve retraso
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }, 1500);

    } catch (err: any) {
      console.error('Error al procesar el pago:', err.message);
      setError('Error al procesar el pago. Por favor intente nuevamente.');
      setLoading(false);
    }
  };

  if (pagoExitoso) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="mt-2 text-lg font-medium text-gray-900">¡Pago exitoso!</h3>
            <p className="mt-1 text-sm text-gray-500">
              Tu informe ha sido generado correctamente y ya está disponible para su consulta.
            </p>
            <div className="mt-4">
              <button
                type="button"
                className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                onClick={onSuccess}
              >
                Ver informe
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Proceso de Pago</h2>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-500"
            onClick={onCancel}
          >
            <span className="sr-only">Cerrar</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <h3 className="font-medium text-gray-900">Resumen de compra</h3>
          <div className="mt-2 bg-gray-50 p-4 rounded-md">
            <p className="text-sm text-gray-600">Informe de Corredor:</p>
            <p className="font-medium">{corredor.nombre}</p>
            <p className="text-sm text-gray-600 mt-2">RUT:</p>
            <p className="font-medium">{corredor.rut}</p>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex justify-between">
                <p className="font-medium">Total a pagar:</p>
                <p className="font-bold text-lg">
                  {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(precio)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gray-50 p-4 rounded-md mb-4">
          <p className="font-medium mb-2">Beneficios del informe:</p>
          <ul className="list-disc pl-5 text-sm text-gray-600">
            <li>Análisis detallado de la cartera del corredor</li>
            <li>Evolución histórica de primas</li>
            <li>Distribución por compañías y ramos</li>
            <li>Indicadores de concentración y diversificación</li>
            <li>Comparativa con el mercado</li>
          </ul>
        </div>

        <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm"
            onClick={procesarPago}
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Procesando...
              </>
            ) : 'Pagar ahora'}
          </button>
          <button
            type="button"
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}