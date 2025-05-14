'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSupabaseClient } from '@/lib/supabase-client';
import { usePeriod } from '../context/PeriodContext';
import { DASHBOARD_COLORS } from '../../constants/colors';

// Componentes
import SummaryCard from '../components/SummaryCard';
import ChartPrimaEvolution from '../components/ChartPrimaEvolution';
import AccordeonTable from '../components/AccordeonTable';
import LoadingSpinner from '../components/LoadingSpinner';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// Reemplazar la importación de colores
import { colors } from '../utils/systemcolors';

export default function RamoDetail() {
  const params = useParams();
  const codRamo = params.id as string;
  const { selectedPeriodo, periodos } = usePeriod();
  const supabase = useSupabaseClient();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ramo, setRamo] = useState<any>(null);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [companiasData, setCompaniasData] = useState<any[]>([]);
  
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        
        // Cargar datos del ramo
        const { data: ramoData, error: ramoError } = await supabase
          .from('vista_ramos_periodo')
          .select('*')
          .eq('cod', codRamo)
          .eq('periodo', selectedPeriodo)
          .single();
        
        if (ramoError) throw ramoError;
        setRamo(ramoData);
        
        // Cargar datos históricos
        const { data: historicalData, error: historicalError } = await supabase
          .from('vista_ramos_periodo')
          .select('*')
          .eq('cod', codRamo)
          .order('periodo', { ascending: false });
        
        if (historicalError) throw historicalError;
        setHistoricalData(historicalData || []);
        
        // Cargar datos de compañías asociadas
        const { data: companiasData, error: companiasError } = await supabase
          .from('vista_companias_periodo')
          .select('*')
          .eq('periodo', selectedPeriodo)
          .order('total_primauf', { ascending: false });
        
        if (companiasError) throw companiasError;
        setCompaniasData(companiasData || []);
        
      } catch (err: any) {
        console.error('Error al cargar datos:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    if (codRamo && selectedPeriodo) {
      loadData();
    }
  }, [codRamo, selectedPeriodo, supabase]);
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }
  
  if (!ramo) {
    return (
      <div className="bg-yellow-50 p-4 rounded-md">
        <p className="text-yellow-500">No se encontraron datos para este ramo.</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-6">
          <Link 
            href="/dashboard/memoria-anual/ramos"
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver a Ramos
          </Link>
        </div>
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900" style={{ color: colors.ramos.primary }}>
            {ramo.ramo}
          </h1>
          
          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium" 
              style={{ 
                backgroundColor: colors.ramos.background,
                color: colors.ramos.primary 
              }}
            >
              {ramo.grupo}
            </span>
          </div>
        </div>
        
        {/* Tarjeta de resumen */}
        <div className="mb-6">
          <SummaryCard 
            title="Resumen de Producción"
            data={[
              { label: 'Prima Total', value: ramo.total_primauf, format: 'uf' },
              { label: 'Participación', value: ramo.participacion_clp, format: 'percent' },
              { label: 'Crecimiento', value: ramo.crecimiento_clp, format: 'percent' },
              { label: 'Ranking General', value: ramo.ranking_general, format: 'number' },
              { label: 'Ranking Grupo', value: ramo.ranking_grupo, format: 'number' }
            ]}
            color={colors.ramos.primary}
          />
        </div>
        
        {/* Gráfico de evolución */}
        <div className="mb-6">
          <ChartPrimaEvolution 
            title="Evolución Histórica"
            data={historicalData}
            periodos={periodos}
            valueField="total_primauf"
            growthField="crecimiento_clp"
            color={colors.ramos.primary}
          />
        </div>
        
        {/* Tabla de compañías */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Compañías</h2>
          <AccordeonTable 
            data={companiasData}
            columns={[
              { header: 'Compañía', accessor: 'nombrecia' },
              { header: 'Prima UF', accessor: 'total_primauf', isNumeric: true, formatter: (value) => `UF ${Number(value).toLocaleString('es-CL')}` }
            ]}
            groupBy="grupo"
            detailPath="/dashboard/memoria-anual/companias"
          />
        </div>
      </div>
    </div>
  );
}