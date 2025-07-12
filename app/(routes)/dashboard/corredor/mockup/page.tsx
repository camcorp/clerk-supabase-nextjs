'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useIndividualReportAccess } from '../../hooks/useIndividualReportAccess';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Layout, Palette, Monitor, Smartphone } from 'lucide-react';
import LoadingSpinner from '@/app/components/ui/charts/LoadingSpinner';

function MockupContent() {
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
            Mockups y Prototipos - {corredor?.nombre || 'Corredor'}
          </h1>
          <p className="text-gray-600">RUT: {corredor?.rut}</p>
        </div>
      </div>
      
      {/* Contenido Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layout className="h-5 w-5" />
              Diseños de Layout
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <Layout className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-700 mb-2">Layouts</h4>
              <p className="text-sm text-gray-500">
                Prototipos de diseño de interfaz
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Paleta de Colores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <Palette className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-700 mb-2">Colores</h4>
              <p className="text-sm text-gray-500">
                Esquemas de color y branding
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Vista Desktop
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <Monitor className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-700 mb-2">Desktop</h4>
              <p className="text-sm text-gray-500">
                Mockups para pantallas grandes
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Vista Mobile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <Smartphone className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-700 mb-2">Mobile</h4>
              <p className="text-sm text-gray-500">
                Diseños responsivos móviles
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Sección de Galería de Mockups */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Galería de Prototipos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-16">
            <div className="max-w-lg mx-auto">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-100 rounded-lg p-8 flex items-center justify-center">
                  <Layout className="h-8 w-8 text-gray-400" />
                </div>
                <div className="bg-gray-100 rounded-lg p-8 flex items-center justify-center">
                  <Monitor className="h-8 w-8 text-gray-400" />
                </div>
                <div className="bg-gray-100 rounded-lg p-8 flex items-center justify-center">
                  <Smartphone className="h-8 w-8 text-gray-400" />
                </div>
                <div className="bg-gray-100 rounded-lg p-8 flex items-center justify-center">
                  <Palette className="h-8 w-8 text-gray-400" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-4">
                Prototipos en Desarrollo
              </h3>
              <p className="text-gray-500 mb-6">
                Esta sección contendrá mockups interactivos, wireframes y prototipos 
                de alta fidelidad para el diseño de reportes de corredores.
              </p>
              <div className="flex gap-2 justify-center">
                <Badge variant="outline" className="text-purple-600 border-purple-600">
                  Diseño UX/UI
                </Badge>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Prototipado
                </Badge>
                <Badge variant="outline" className="text-blue-600 border-blue-600">
                  Wireframes
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function MockupPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <MockupContent />
    </Suspense>
  );
}