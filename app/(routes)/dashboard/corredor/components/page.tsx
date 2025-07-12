'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useIndividualReportAccess } from '../../hooks/useIndividualReportAccess';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Building2, Users, TrendingUp } from 'lucide-react';
import LoadingSpinner from '@/app/components/ui/charts/LoadingSpinner';

function ComponentesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rut = searchParams.get('rut') || '';
  const { user, isLoaded } = useUser();
  const userId = user?.id || '';
  
  const { report, loading, error, hasAccess } = useIndividualReportAccess(userId, rut);
  
  if (!isLoaded || loading) {
    return <LoadingSpinner />;
  }
  
  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Acceso Denegado</h2>
          <p className="text-gray-600 mb-6">No tienes acceso a este reporte.</p>
          <button 
            onClick={() => router.push('/dashboard/corredor')}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Volver a Corredores
          </button>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => router.push('/dashboard/corredor')}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Volver a Corredores
          </button>
        </div>
      </div>
    );
  }
  
  const reporteData = report?.data;
  const corredor = reporteData?.datos_reporte?.corredor;
  
  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => router.push('/dashboard/corredor')}
          className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Componentes - {corredor?.nombre || 'Corredor'}
          </h1>
          <p className="text-gray-600">RUT: {corredor?.rut}</p>
        </div>
      </div>
      
      {/* Contenido Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Análisis de Componentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Análisis en Desarrollo
                </h3>
                <p className="text-gray-500">
                  Esta sección mostrará el análisis detallado de los componentes del corredor.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Métricas de Rendimiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Métricas en Desarrollo
                </h3>
                <p className="text-gray-500">
                  Aquí se mostrarán las métricas de rendimiento y KPIs del corredor.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ComponentesPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ComponentesContent />
    </Suspense>
  );
}