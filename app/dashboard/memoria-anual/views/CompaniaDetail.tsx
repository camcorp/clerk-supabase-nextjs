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

export default function CompaniaDetail() {
  const params = useParams();
  const rutcia = params.id as string;
  const { selectedPeriodo, periodos } = usePeriod();
  const supabase = useSupabaseClient();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [compania, setCompania] = useState<any>(null);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [corredoresData, setCorredoresData] = useState<any[]>([]);
  const [ramosData, setRamosData] = useState<any[]>([]);
  
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        
        // Cargar datos de la compañía
        const { data: companiaData, error: companiaError } = await supabase
          .from('vista_companias_periodo')
          .select('*')
          .eq('rutcia', rutcia)
          .eq('periodo', selectedPeriodo)
          .single();
        
        if (companiaError) throw companiaError;
        setCompania(companiaData);
        
        // Cargar datos históricos
        const { data: historicalData, error: historicalError } = await supabase
          .from('vista_companias_periodo')
          .select('*')
          .eq('rutcia', rutcia)
          .order('periodo', { ascending: false });
        
        if (historicalError) throw historicalError;
        setHistoricalData(historicalData || []);
        
        // Cargar datos de corredores asociados
        const { data: corredoresData, error: corredoresError } = await supabase
          .from('vista_corredores_periodo')
          .select('*')
          .eq('periodo', selectedPeriodo)
          .order('total_uf', { ascending: false });
        
        if (corredoresError) throw corredoresError;
        setCorredoresData(corredoresData || []);
        
        // Cargar datos de ramos
        const { data: ramosData, error: ramosError } = await supabase
          .from('vista_ramos_periodo')
          .select('*')
          .eq('periodo', selectedPeriodo)
          .order('total_uf', { ascending: false });
        
        if (ramosError) throw ramosError;
        setRamosData(ramosData || []);
        
      } catch (err: any) {
        console.error('Error al cargar datos:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    if (rutcia && selectedPeriodo) {
      loadData();
    }
  }, [rutcia, selectedPeriodo, supabase]);
  
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
  
  if (!compania) {
    return (
      <div className="bg-yellow-50 p-4 rounded-md">
        <p className="text-yellow-500">No se encontraron datos para esta compañía.</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-6">
          <Link 
            href="/dashboard/memoria-anual/companias"
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver a Compañías
          </Link>
        </div>
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900" style={{ color: colors.companias.primary }}>
            {compania.nombrecia}
          </h1>
          
          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium" 
              style={{ 
                backgroundColor: colors.companias.light,
                color: colors.companias.primary 
              }}
            >
              {compania.grupo}
            </span>
          </div>
        </div>
        
        {/* Tarjeta de resumen */}
        <div className="mb-6">
          <SummaryCard 
            title="Resumen de Producción"
            data={[
              { label: 'Prima Total', value: compania.total_primauf, format: 'uf' },
              { label: 'Participación', value: compania.participacion_uf, format: 'percent' },
              { label: 'Crecimiento', value: compania.crecimiento_uf, format: 'percent' },
              { label: 'Ranking General', value: compania.ranking_general, format: 'number' },
              { label: 'Ranking Grupo', value: compania.ranking_grupo, format: 'number' }
            ]}
            color={colors.companias.primary}
          />
        </div>
        
        {/* Gráfico de evolución */}
        <div className="mb-6">
          <ChartPrimaEvolution 
            title="Evolución Histórica"
            data={historicalData}
            periodos={periodos} // Changed from periodo to periodos
            valueField="total_primauf"
            growthField="crecimiento_uf"
            color={colors.companias.primary}
          />
        </div>
        
        {/* Tabla de ramos */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Ramos</h2>
          <AccordeonTable 
            data={ramosData}
            columns={[
              { header: 'Ramo', accessor: 'ramo' },
              { header: 'Prima UF', accessor: 'total_uf', isNumeric: true, formatter: (value) => `UF ${Number(value).toLocaleString('es-CL')}` }
            ]}
            groupBy="grupo"
            subGroupBy="subgrupo"
            detailPath="/dashboard/memoria-anual/ramos"
          />
        </div>
        
        {/* Tabla de corredores */}
        <div 
          className="p-6 rounded-lg shadow-md" 
          style={{ backgroundColor: colors.companias.light }}
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Corredores</h2>
          <AccordeonTable 
            data={corredoresData}
            columns={[
              { header: 'Corredor', accessor: 'nombre' },
              { header: 'Prima UF', accessor: 'total_uf', isNumeric: true, formatter: (value) => `UF ${Number(value).toLocaleString('es-CL')}` }
            ]}
            groupBy="segmento"
            detailPath="/dashboard/memoria-anual/corredores"
          />
        </div>
      </div>
    </div>
  );
}