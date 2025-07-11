'use client';

import { useEffect, useState, Suspense } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { useIndividualReportAccess } from '../../hooks/useIndividualReportAccess';
import ReporteIndividualMockup from '../components/ReporteIndividualMockup';

// Componente interno que usa useSearchParams
function CorredorDetailContent() {
  const searchParams = useSearchParams();
  const rut = searchParams.get('rut') || '';
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const userId = user?.id || '';
  
  const { report, loading, error, hasAccess } = useIndividualReportAccess(userId, rut);
  const [decodedRut, setDecodedRut] = useState(rut);

  // Mock data structure that matches the expected interface
  const mockReportData = {
    periodo: '2024',
    produccion: {
      total_primaclp: 150000000,
      total_primauf: 5000,
      ranking_general: 15,
      num_companias: 8,
      num_ramos: 12,
      crecimiento_anual: 0.15,
      participacion_mercado: 0.025
    },
    rankings: {
      general: 15,
      por_compania: [
        { compania: 'Seguros Generales', ranking: 5, total_corredores: 120 },
        { compania: 'Vida Seguros', ranking: 8, total_corredores: 95 }
      ],
      por_ramo: [
        { ramo: 'Incendio', ranking: 3, total_corredores: 85 },
        { ramo: 'Automóviles', ranking: 7, total_corredores: 180 }
      ]
    },
    companias: [
      {
        nombrecia: 'Seguros Generales',
        primaclp: 45000000,
        primauf: 1500,
        participacion: 0.30,
        crecimiento: 0.18,
        ranking_corredor: 5
      },
      {
        nombrecia: 'Vida Seguros',
        primaclp: 35000000,
        primauf: 1200,
        participacion: 0.23,
        crecimiento: 0.12,
        ranking_corredor: 8
      }
    ],
    ramos: [
      {
        nombre: 'Incendio',
        primaclp: 40000000,
        primauf: 1350,
        participacion: 0.27,
        crecimiento: 0.22,
        ranking_corredor: 3
      },
      {
        nombre: 'Automóviles',
        primaclp: 35000000,
        primauf: 1200,
        participacion: 0.23,
        crecimiento: 0.10,
        ranking_corredor: 7
      }
    ],
    concentracion: {
      hhi_companias: 2250,
      hhi_ramos: 1850,
      nivel_concentracion_companias: 'Moderada',
      nivel_concentracion_ramos: 'Baja'
    },
    top_performers: {
      ramos_mayor_crecimiento: [
        { ramo: 'Incendio', crecimiento: 0.22, prima_actual: 40000000 },
        { ramo: 'Vida', crecimiento: 0.15, prima_actual: 30000000 }
      ],
      ramos_mayor_decrecimiento: [
        { ramo: 'Transporte', crecimiento: -0.08, prima_actual: 8000000 }
      ],
      companias_mayor_crecimiento: [
        { compania: 'Seguros Generales', crecimiento: 0.18, prima_actual: 45000000 },
        { compania: 'Seguros del Sur', crecimiento: 0.15, prima_actual: 25000000 }
      ],
      companias_mayor_decrecimiento: [
        { compania: 'Aseguradora Nacional', crecimiento: -0.05, prima_actual: 17000000 }
      ]
    }
  };

  const mockCorrector = {
    rut: decodedRut,
    nombre: 'Juan Pérez Corredor',
    ciudad: 'Santiago',
    telefono: '+56912345678'
  };

  useEffect(() => {
    // Verificar que tenemos el parámetro RUT
    if (!rut) {
      router.push('/dashboard/corredor');
      return;
    }
    
    // Decodificar el RUT si viene codificado en la URL
    try {
      setDecodedRut(decodeURIComponent(rut));
    } catch (e) {
      console.error('Error al decodificar RUT:', e);
    }
  }, [rut, router]);

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#0F3460] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando información del corredor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error al cargar el informe</p>
          <button 
            onClick={() => router.push('/dashboard/corredor')}
            className="bg-[#0F3460] text-white px-4 py-2 rounded hover:bg-[#0F3460]/90"
          >
            Volver al listado
          </button>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No tienes acceso a este informe</p>
          <button 
            onClick={() => router.push('/dashboard/corredor')}
            className="bg-[#0F3460] text-white px-4 py-2 rounded hover:bg-[#0F3460]/90"
          >
            Volver al listado
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ReporteIndividualMockup 
        corredor={mockCorrector}
        reportData={mockReportData}
      />
    </div>
  );
}

export default function CorredorDetallePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CorredorDetailContent />
    </Suspense>
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