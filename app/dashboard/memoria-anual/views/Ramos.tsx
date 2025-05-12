'use client';

import { useEffect, useState } from 'react';
import { useSupabaseClient } from '../../../../lib/supabase-client';
import ModernCard from '../components/ModernCard';
import SummaryCard from '../components/SummaryCard';
import NoData from '../components/NoData';
import ChartCard from '../components/ChartCard';
import { usePeriod } from '../context/PeriodContext';
import { inter, spaceGrotesk } from '../fonts';
import AccordeonTable from '../components/AccordeonTable';
import { formatUF } from '../utils/formatters';

// Definir la interfaz para los ramos
interface Ramo {
  id: number;
  nombre: string;
  grupo: string;
  subgrupo: string;
  primauf: number;
  primaclp?: number;
  periodo: string;
}

// Interface for summary stats
interface PeriodSummary {
  totalPrimauf: number;
  ramoCount: number;
  growth: number | null;
}

// Importar la función API
import { getRamosData } from '../api/ramos';

export default function RamosView() {
  const [ramos, setRamos] = useState<Ramo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRamo, setSelectedRamo] = useState<Ramo | null>(null);
  const [summary, setSummary] = useState<PeriodSummary>({
    totalPrimauf: 0,
    ramoCount: 0,
    growth: null
  });
  
  // Obtener el cliente de Supabase
  const supabase = useSupabaseClient();
  
  // Usar el contexto de período
  const { selectedPeriodo, periodos } = usePeriod();
  
  // Load ramos for the selected period
  useEffect(() => {
    async function loadRamos() {
      if (!selectedPeriodo) return;
      
      try {
        setLoading(true);
        
        // Usar la función API en lugar de consultar directamente
        const data = await getRamosData(selectedPeriodo);
        
        // Transformar los datos al formato esperado si es necesario
        const transformedData = data?.map((item, index) => ({
          id: index,
          grupo: item.grupo || item.grupo,
          subgrupo: item.subgrupo || item.subgrupo,
          nombre: item.nombre || item.ramo,
          primauf: item.primauf || item.total_uf,
          primaclp: item.primaclp || item.total_clp,
          periodo: item.periodo
        })) || [];
        
        // Actualizar el estado con los datos transformados
        setRamos(transformedData);
        
        // Calculate summary statistics
        if (data.length > 0) {
          const totalPrimauf = data.reduce((sum, ramo) => sum + (ramo.primauf || ramo.total_uf || 0), 0);
          const ramoCount = data.length;
          
          // Get previous period data for growth calculation
          const periodIndex = periodos.indexOf(selectedPeriodo);
          let growth = null;
          
          if (periodIndex < periodos.length - 1) {
            const prevPeriod = periodos[periodIndex + 1];
            const prevData = await getRamosData(prevPeriod);
                
            if (prevData && prevData.length > 0) {
              const prevTotalPrimauf = prevData.reduce((sum, ramo) => sum + (ramo.primauf || ramo.total_uf || 0), 0);
              if (prevTotalPrimauf > 0) {
                growth = ((totalPrimauf - prevTotalPrimauf) / prevTotalPrimauf) * 100;
              }
            }
          }
          
          setSummary({
            totalPrimauf,
            ramoCount,
            growth
          });
        }
      } catch (err) {
        console.error('Error al cargar ramos:', err);
        setError('No se pudieron cargar los ramos. Por favor, intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    }
    
    loadRamos();
  }, [supabase, selectedPeriodo, periodos]);
  
  // Format number as UF
  // Eliminar esta función y usar la importada
  // import { formatUF } from '../utils/formatters';
  
  // Función para manejar el detalle de un ramo
  const handleRamoDetail = (ramo: Ramo) => {
    setSelectedRamo(ramo);
    // Aquí podrías mostrar un modal o navegar a una página de detalle
    console.log('Detalle del ramo:', ramo);
    // También podrías implementar un modal o un panel lateral para mostrar más detalles
    alert(`Detalle del ramo: ${ramo.nombre}\nPrima UF: ${formatUF(ramo.primauf, 2)}`);
  };
  
  // Columns for data table
  const columns = [
    { 
      header: 'Grupo', 
      accessor: 'grupo' as keyof Ramo, 
      isSortable: true 
    },{ 
      header: 'Subgrupo', 
      accessor: 'subgrupo' as keyof Ramo, 
      isSortable: true 
    },{ 
      header: 'Ramo', 
      accessor: 'nombre' as keyof Ramo, 
      isSortable: true 
    },
    { 
      header: 'Prima UF', 
      accessor: 'primauf' as keyof Ramo,
      cell: (value: number) => formatUF(value, 2),
      isSortable: true,
      isNumeric: true
    }
  ];
  
  return (
    <div className={`space-y-6 ${inter.variable} ${spaceGrotesk.variable}`}>
      <div className="flex justify-between items-center">
        <h2 className={`text-xl font-semibold text-gray-900 font-sans`}>Ramos de Seguros</h2>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Cargando datos...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      ) : ramos.length === 0 ? (
        <NoData message="No hay datos de ramos disponibles para este período." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <AccordeonTable 
              data={ramos} 
              columns={columns} 
              title="Ramos de Seguros"
              groupBy="grupo"
              subGroupBy="subgrupo"
              emptyMessage="No hay datos de ramos disponibles para este período."
              showTotal={true}
              totalLabel="Total General"
              onRowDetail={handleRamoDetail}
            />
          </div>
          
          <div className="space-y-6">
            <SummaryCard
              title="Resumen del Período"
              items={[
                {
                  label: 'Total Prima UF',
                  value: formatUF(summary.totalPrimauf),
                  icon: 'currency'
                },
                {
                  label: 'Cantidad de Ramos',
                  value: summary.ramoCount.toString(),
                  icon: 'chart'
                },
                {
                  label: 'Crecimiento',
                  value: summary.growth !== null ? `${summary.growth.toFixed(2)}%` : 'N/A',
                  icon: 'trend',
                  trend: summary.growth !== null ? (summary.growth > 0 ? 'up' : 'down') : 'neutral'
                }
              ]}
            />
          </div>
        </div>
      )}
    </div>
  );
}