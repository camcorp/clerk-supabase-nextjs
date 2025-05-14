'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSupabaseClient } from '@/lib/supabase-client';
import { usePeriod } from '../context/PeriodContext';
// Reemplazar la importación de colores
import { colors } from '../utils/systemcolors';

// Componentes
import SummaryCard from '../components/SummaryCard';
import ChartPrimaEvolution from '../components/ChartPrimaEvolution';
import AccordeonTable from '../components/AccordeonTable';
import LoadingSpinner from '../components/LoadingSpinner';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function CorredorDetail() {
  const params = useParams();
  const rutCorredor = params.id as string;
  const { selectedPeriodo, periodos } = usePeriod();
  const supabase = useSupabaseClient();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [corredor, setCorredor] = useState<any>(null);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [companiasData, setCompaniasData] = useState<any[]>([]);
  const [ramosData, setRamosData] = useState<any[]>([]);
  
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        
        // Cargar datos del corredor
        const { data: corredorData, error: corredorError } = await supabase
          .from('vista_corredores_periodo')
          .select('*')
          .eq('rut', rutCorredor)
          .eq('periodo', selectedPeriodo)
          .single();
        
        if (corredorError) throw corredorError;
        setCorredor(corredorData);
        
        // Cargar datos históricos
        const { data: historicalData, error: historicalError } = await supabase
          .from('vista_corredores_periodo')
          .select('*')
          .eq('rut', rutCorredor)
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
        
        // Cargar datos de ramos
        const { data: ramosData, error: ramosError } = await supabase
          .from('vista_ramos_periodo')
          .select('*')
          .eq('periodo', selectedPeriodo)
          .order('total_primauf', { ascending: false });
        
        if (ramosError) throw ramosError;
        setRamosData(ramosData || []);
        
      } catch (err: any) {
        console.error('Error al cargar datos:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    if (rutCorredor && selectedPeriodo) {
      loadData();
    }
  }, [rutCorredor, selectedPeriodo, supabase]);
  
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
  
  if (!corredor) {
    return (
      <div className="bg-yellow-50 p-4 rounded-md">
        <p className="text-yellow-500">No se encontraron datos para este corredor.</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-6">
          <Link 
            href="/dashboard/memoria-anual/corredores"
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver a Corredores
          </Link>
        </div>
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900" style={{ color: colors.corredores.primary }}>
            {corredor.nombre}
          </h1>
          
          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium" 
              style={{ 
                backgroundColor: colors.corredores.background,
                color: colors.corredores.primary 
              }}
            >
              {corredor.segmento}
            </span>
          </div>
        </div>
        
        {/* Tarjeta de resumen */}
        <div className="mb-6">
          <SummaryCard 
            title="Resumen de Producción"
            data={[
              { label: 'Prima Total', value: corredor.total_uf, format: 'uf' },
              { label: 'Participación', value: corredor.participacion || 0, format: 'percent' },
              { label: 'Crecimiento', value: corredor.crecimiento || 0, format: 'percent' }
            ]}
            color={colors.corredores.primary}
          />
        </div>
        
        {/* Gráfico de evolución */}
        <div className="mb-6">
          <ChartPrimaEvolution 
            title="Evolución Histórica"
            data={historicalData}
            periodos={periodos}
            valueField="total_uf"
            growthField="crecimiento"
            color={colors.corredores.primary}
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
        
        {/* Tabla de ramos */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Ramos</h2>
          <AccordeonTable 
            data={ramosData}
            columns={[
              { header: 'Ramo', accessor: 'ramo' },
              { header: 'Prima UF', accessor: 'total_primauf', isNumeric: true, formatter: (value) => `UF ${Number(value).toLocaleString('es-CL')}` }
            ]}
            groupBy="grupo"
            subGroupBy="subgrupo"
            detailPath="/dashboard/memoria-anual/ramos"
          />
        </div>
      </div>
    </div>
  );
}