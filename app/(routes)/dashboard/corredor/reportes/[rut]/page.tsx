'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ReporteDinamico from '../../components/ReporteDinamico';
import { useUser } from '@clerk/nextjs';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ReporteData {
  periodo: string;
  datos_reporte: {
    corredor: {
      rut: string;
      nombre: string;
      telefono?: string;
      domicilio?: string;
      ciudad?: string;
      region?: number;
    };
    periodo: string;
    indicadores: any;
    companias: any[];
    ramos: any[];
    nombresRamos: any[];
  };
  fecha_generacion: string;
  fecha_expiracion: string;
}

export default function ReportePage() {
  const params = useParams();
  const { user } = useUser();
  const [reporte, setReporte] = useState<ReporteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const rut = params.rut as string;

  useEffect(() => {
    if (!user || !rut) return;

    const fetchReporte = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/reportes/${rut}`);
        
        if (!response.ok) {
          if (response.status === 403) {
            throw new Error('No tienes acceso a este reporte. Debes comprarlo primero.');
          } else if (response.status === 404) {
            throw new Error('Reporte no encontrado.');
          } else {
            throw new Error('Error al cargar el reporte.');
          }
        }

        const data = await response.json();
        setReporte(data.reporte);
      } catch (err) {
        console.error('Error fetching reporte:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchReporte();
  }, [user, rut]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Cargando reporte...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/dashboard/corredor/reportes"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Reportes
          </Link>
        </div>
      </div>
    );
  }

  if (!reporte) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-600">Reporte no encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/dashboard/corredor/reportes"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Reportes
          </Link>
          
          <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Reporte Individual - {reporte.datos_reporte.corredor.nombre}
                </h1>
                <p className="text-gray-600">RUT: {reporte.datos_reporte.corredor.rut}</p>
                <p className="text-gray-600">Período: {reporte.periodo}</p>
              </div>
              <div className="text-right text-sm text-gray-500">
                <p>Generado: {new Date(reporte.fecha_generacion).toLocaleDateString('es-CL')}</p>
                <p>Expira: {new Date(reporte.fecha_expiracion).toLocaleDateString('es-CL')}</p>
              </div>
            </div>
          </div>
        </div>

        <ReporteDinamico reporte={reporte} />
      </div>
    </div>
  );
}