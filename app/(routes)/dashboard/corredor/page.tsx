'use client';

import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useAccessCheck } from '../hooks/useAccessCheck';
import { useIndividualReportAccess } from '../hooks/useIndividualReportAccess';
import ProcesoPago from './components/ProcesoPago';
import SearchBox from '@/components/ui/SearchBox';

type Corredor = {
  id: number;
  rut: string;
  nombre: string;
  telefono?: string;
  ciudad?: string;
};

export default function CorredorPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [selectedCorredor, setSelectedCorredor] = useState<Corredor | null>(null);
  const [showProcesoPago, setShowProcesoPago] = useState(false);
  
  const userId = user?.id || '';
  const { hasAccess, loading: accessLoading } = useAccessCheck(userId, 'corredores');
  const { report, loading: reportLoading, hasAccess: hasReportAccess } = 
    useIndividualReportAccess(userId, selectedCorredor?.rut || '');

  const handleSelectCorredor = (corredor: Corredor) => {
    setSelectedCorredor(corredor);
  };

  const handleProceedToPayment = () => {
    setShowProcesoPago(true);
  };

  const handlePaymentCancel = () => {
    setShowProcesoPago(false);
  };

  const handlePaymentSuccess = () => {
    setShowProcesoPago(false);
    // Refrescar los datos del informe después del pago exitoso
    if (selectedCorredor) {
      router.push(`/dashboard/corredor/detalle?rut=${encodeURIComponent(selectedCorredor.rut)}`);
    } else {
      router.push('/dashboard/corredor');
    }
  };

  // Renderizado personalizado para los resultados de búsqueda de corredores
  const renderCorredorItem = (corredor: Corredor, isSelected: boolean) => (
    <div className={`w-full text-left px-6 py-4 hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">{corredor.nombre}</p>
          <p className="text-sm text-gray-500">RUT: {corredor.rut}</p>
          {corredor.ciudad && (
            <p className="text-sm text-gray-500">{corredor.ciudad}</p>
          )}
        </div>
        <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </div>
    </div>
  );

  // Mostrar pantalla de carga mientras verificamos el acceso
  if (!isLoaded || accessLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-3">Verificando acceso...</p>
      </div>
    );
  }

  // Redirigir si no tiene acceso al módulo
  if (!hasAccess) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                No tienes acceso al módulo de corredores. Para obtener acceso, debes adquirir una suscripción.
              </p>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Acceso al Módulo de Corredores</h1>
          <p className="mb-6">Obtén acceso a información detallada de corredores con nuestra suscripción premium.</p>
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => router.push('/dashboard/acceso-completo')}
          >
            Ver planes de suscripción
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Búsqueda de Corredores</h1>
      
      {/* Buscador parametrizado */}
      <div className="mb-8">
        <SearchBox
          tableName="corredores"
          searchField="rut"
          displayFields={["id", "rut", "nombre", "telefono", "ciudad"]}
          placeholder="Ingrese RUT del corredor"
          limit={10}
          orderBy={{
            field: "nombre",
            ascending: true
          }}
          onSelect={(result) => handleSelectCorredor(result as Corredor)}
          renderResultItem={(result, isSelected) => renderCorredorItem(result as Corredor, isSelected)}
        />
      </div>
      
      {/* Corredor seleccionado */}
      {selectedCorredor && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Informe de Corredor</h2>
          <div className="mb-6">
            <p className="text-lg font-medium">{selectedCorredor.nombre}</p>
            <p className="text-gray-600">RUT: {selectedCorredor.rut}</p>
            {selectedCorredor.telefono && (
              <p className="text-gray-600">Teléfono: {selectedCorredor.telefono}</p>
            )}
            {selectedCorredor.ciudad && (
              <p className="text-gray-600">Ciudad: {selectedCorredor.ciudad}</p>
            )}
          </div>
          
          {reportLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mr-2"></div>
              <p>Verificando acceso al informe...</p>
            </div>
          ) : hasReportAccess ? (
            <div>
              <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">
                      Ya tienes acceso a este informe. Válido hasta {new Date(report?.fecha_expiracion || '').toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
                onClick={() => router.push(`/dashboard/corredor/detalle?rut=${encodeURIComponent(selectedCorredor.rut)}`)}
              >
                Ver informe completo
              </button>
            </div>
          ) : (
            <div>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      No tienes acceso a este informe. Para acceder, debes realizar el pago correspondiente.
                    </p>
                  </div>
                </div>
              </div>
              
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
              
              <button
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full"
                onClick={handleProceedToPayment}
              >
                Comprar informe - $9.990
              </button>
              
              {showProcesoPago && selectedCorredor && (
                <ProcesoPago 
                  corredor={selectedCorredor}
                  onCancel={handlePaymentCancel}
                  onSuccess={handlePaymentSuccess}
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}