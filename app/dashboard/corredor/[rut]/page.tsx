'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useIndividualReportAccess } from '../../hooks/useIndividualReportAccess';

// Modificar la definición de PageProps para que coincida con lo que Next.js espera
interface PageProps {
  params: {
    rut: string;
  };
  searchParams?: Record<string, string | string[] | undefined>;
}

export default function CorredorDetailPage({ params }: PageProps) {
  const { rut } = params;
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const userId = user?.id || '';
  
  const { report, loading, error, hasAccess } = useIndividualReportAccess(userId, rut);
  const [decodedRut, setDecodedRut] = useState(rut);

  useEffect(() => {
    // Decodificar el RUT si viene codificado en la URL
    try {
      setDecodedRut(decodeURIComponent(rut));
    } catch (e) {
      console.error('Error al decodificar RUT:', e);
    }
  }, [rut]);

  // Redirigir si no está autenticado
  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in');
    }
  }, [isLoaded, user, router]);

  // Redirigir si no tiene acceso al informe
  useEffect(() => {
    if (!loading && !hasAccess) {
      router.push('/dashboard/corredor');
    }
  }, [loading, hasAccess, router]);

  if (!isLoaded || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-3">Cargando informe...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Error al cargar el informe: {error}
              </p>
            </div>
          </div>
        </div>
        <button 
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => router.push('/dashboard/corredor')}
        >
          Volver a la búsqueda
        </button>
      </div>
    );
  }

  if (!hasAccess) {
    return null; // Se redirigirá por el useEffect
  }

  // Extraer datos del informe
  const reportData = report?.data || {};
  
  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Informe de Corredor</h1>
        <button 
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
          onClick={() => router.push('/dashboard/corredor')}
        >
          Volver a la búsqueda
        </button>
      </div>
      
      {/* Información básica del corredor */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Información del Corredor</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">RUT:</p>
            <p className="font-medium">{decodedRut}</p>
          </div>
          <div>
            <p className="text-gray-600">Nombre:</p>
            <p className="font-medium">{reportData.nombre || 'No disponible'}</p>
          </div>
          {reportData.telefono && (
            <div>
              <p className="text-gray-600">Teléfono:</p>
              <p className="font-medium">{reportData.telefono}</p>
            </div>
          )}
          {reportData.ciudad && (
            <div>
              <p className="text-gray-600">Ciudad:</p>
              <p className="font-medium">{reportData.ciudad}</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Resumen de producción */}
      {reportData.produccion && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Resumen de Producción</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Producción Total</h3>
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-gray-600">Prima CLP:</p>
                <p className="text-2xl font-bold">
                  {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' })
                    .format(reportData.produccion.total_primaclp || 0)}
                </p>
                <p className="text-gray-600 mt-2">Prima UF:</p>
                <p className="text-xl font-semibold">
                  {new Intl.NumberFormat('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    .format(reportData.produccion.total_primauf || 0)} UF
                </p>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Indicadores</h3>
              <div className="bg-gray-50 p-4 rounded">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600">Ranking:</p>
                    <p className="font-bold">{reportData.produccion.ranking_general || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Crecimiento:</p>
                    <p className="font-bold">
                      {reportData.produccion.crecimiento_clp 
                        ? `${(reportData.produccion.crecimiento_clp * 100).toFixed(2)}%` 
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Compañías:</p>
                    <p className="font-bold">{reportData.produccion.num_companias || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Ramos:</p>
                    <p className="font-bold">{reportData.produccion.num_ramos || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Distribución por compañías */}
      {reportData.companias && reportData.companias.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Distribución por Compañías</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Compañía
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prima CLP
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prima UF
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participación
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.companias.map((compania: any, index: number) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {compania.nombrecia}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' })
                        .format(compania.primaclp || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Intl.NumberFormat('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                        .format(compania.primauf || 0)} UF
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {compania.participacion 
                        ? `${(compania.participacion * 100).toFixed(2)}%` 
                        : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Distribución por ramos */}
      {reportData.ramos && reportData.ramos.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Distribución por Ramos</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ramo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prima CLP
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prima UF
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participación
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.ramos.map((ramo: any, index: number) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {ramo.ramo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' })
                        .format(ramo.primaclp || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Intl.NumberFormat('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                        .format(ramo.primauf || 0)} UF
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {ramo.participacion 
                        ? `${(ramo.participacion * 100).toFixed(2)}%` 
                        : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Información de validez */}
      <div className="bg-gray-50 p-4 rounded-md text-sm text-gray-600">
        <p>Informe generado el: {new Date(report?.fecha_generacion || '').toLocaleDateString()}</p>
        <p>Válido hasta: {new Date(report?.fecha_expiracion || '').toLocaleDateString()}</p>
      </div>
    </div>
  );
}

// Definir interfaces para los datos que vamos a obtener
interface ReporteIndividual {
  id: string;
  user_id: string;
  rut: string;
  periodo: string;
  data: any; // jsonb en la base de datos
  fecha_generacion: string;
  fecha_expiracion: string;
  activo: boolean;
}

interface Pago {
  id: string;
  user_id: string;
  rut: string;
  producto_id: string;
  orden_comercio: string;
  amount: number;
  estado: string;
  fecha_creacion: string;
  token: string;
  url_pago: string;
}