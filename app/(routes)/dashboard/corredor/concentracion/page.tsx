'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useIndividualReportAccess } from '../../hooks/useIndividualReportAccess';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BarChart3, PieChart, TrendingUp } from 'lucide-react';
import LoadingSpinner from '@/app/components/ui/charts/LoadingSpinner';

function ConcentracionContent() {
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
            Análisis de Concentración - {corredor?.nombre || 'Corredor'}
          </h1>
          <p className="text-gray-600">RUT: {corredor?.rut}</p>
        </div>
      </div>
      
      {/* Contenido Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Índice HHI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Índice Herfindahl-Hirschman
              </h3>
              <p className="text-gray-500">
                Análisis de concentración del mercado basado en el índice HHI.
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Participación de Mercado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Distribución del Mercado
              </h3>
              <p className="text-gray-500">
                Análisis de la participación relativa en el mercado de seguros.
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Tendencias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Evolución Temporal
              </h3>
              <p className="text-gray-500">
                Tendencias de concentración a lo largo del tiempo.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Sección adicional */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Análisis Detallado de Concentración</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">
                Funcionalidad en Desarrollo
              </h3>
              <p className="text-gray-500 mb-6">
                Esta sección mostrará análisis avanzados de concentración del mercado, 
                incluyendo métricas de competencia y posicionamiento relativo.
              </p>
              <Badge variant="outline" className="text-blue-600 border-blue-600">
                Próximamente
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ConcentracionPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ConcentracionContent />
    </Suspense>
  );
}