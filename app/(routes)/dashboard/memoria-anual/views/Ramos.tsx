'use client';

import { useEffect, useState } from 'react';
import { useSupabaseClient } from '@/lib/supabase/client';
import ModernCard from '@/components/ui/charts/ModernCard';
import SummaryCard from '@/components/ui/charts/SummaryCard';
import NoData from '@/components/ui/charts/NoData';
import ChartCard from '@/components/ui/charts/common/ChartCard';
import { usePeriod } from '../context/PeriodContext';
import { inter, spaceGrotesk } from '../fonts';
import AccordeonTable from '@/components/ui/charts/AccordeonTable';
import { formatUF } from '@/lib/utils/formatters';

// Definir la interfaz para los ramos
interface Ramo {
  id: number;
  nombre: string;
  grupo: string;
  subgrupo: string;
  primauf: number;
  total_uf?: number; // Campo alternativo que puede estar presente
  primaclp?: number;
  periodo: string;
}

// Interface for summary stats
interface PeriodSummary {
  totalPrimauf: number;
  ramoCount: number;
  growth: number | null;
}

// Importar las funciones API
import { getRamosData } from '../api/ramos';

// Importar el nuevo sistema de colores
import { colors } from '@/lib/utils/colors';

// Eliminada la interfaz HistoricalData que no corresponde a ramos

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
  
  // Eliminada la declaración de historicalData que no corresponde a ramos
  
  // Obtener el cliente de Supabase
  const supabase = useSupabaseClient();
  
  // Usar el contexto de período
  const { selectedPeriodo, periodos } = usePeriod();
  
  // Eliminado el useEffect para cargar datos históricos de movimientos que no corresponden a ramos

  // Load ramos for the selected period
  useEffect(() => {
    async function loadRamos() {
      if (!selectedPeriodo) return;
      
      try {
        setLoading(true);
        
        // Usar la función API en lugar de consultar directamente
        const data = await getRamosData(selectedPeriodo);
        
        // Transformar los datos al formato esperado si es necesario
        // Add types for the item and index parameters
        const transformedData = data?.map((item: any, index: number) => {
        // Asegurar que todos los valores numéricos estén correctamente procesados
        const primauf = typeof item.total_primauf === 'string' ? parseFloat(item.total_primauf) : 
                     Number(item.total_primauf || 0);
        
        return {
          id: item.id || item.cod || index,
          grupo: item.grupo,
          subgrupo: item.subgrupo,
          nombre: item.nombre || item.ramo,
          primauf: primauf,
          total_uf: primauf, // Asegurar que total_uf tenga el mismo valor que primauf
          primaclp: typeof item.total_primaclp === 'string' ? parseFloat(item.total_primaclp) : Number(item.total_primaclp || 0),
          periodo: item.periodo,
          participacion: typeof item.participacion_clp === 'string' ? parseFloat(item.participacion_clp) : Number(item.participacion_clp || 0),
          crecimiento: typeof item.crecimiento_clp === 'string' ? parseFloat(item.crecimiento_clp) : Number(item.crecimiento_clp || 0)
        };
        }) || [];
        
        // Actualizar el estado con los datos transformados
        setRamos(transformedData);
        
        // Calculate summary statistics
        if (data && data.length > 0) {
          // Calcular el total de primas UF sumando todos los valores
          let totalPrimauf = 0;
          data.forEach(ramo => {
            const valor = typeof ramo.total_primauf === 'string' ? parseFloat(ramo.total_primauf) : Number(ramo.total_primauf || 0);
            if (!isNaN(valor)) {
              totalPrimauf += valor;
            }
          });
          
          console.log('Total Prima UF calculado:', totalPrimauf);
          
          const ramoCount = data.length;
          
          // Get previous period data for growth calculation
          const periodIndex = periodos.indexOf(selectedPeriodo);
          let growth = null;
          
          if (periodIndex < periodos.length - 1) {
            const prevPeriod = periodos[periodIndex + 1];
            const prevData = await getRamosData(prevPeriod);
                
            if (prevData && prevData.length > 0) {
              let prevTotalPrimauf = 0;
              prevData.forEach(ramo => {
                const valor = typeof ramo.total_primauf === 'string' ? parseFloat(ramo.total_primauf) : Number(ramo.total_primauf || 0);
                if (!isNaN(valor)) {
                  prevTotalPrimauf += valor;
                }
              });
              
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
  // Create an interface for the Ramo type
  interface Ramo {
    id: string | number;
    grupo?: string;
    subgrupo?: string;
    nombre: string;
    primauf: number;
    total_uf: number;
    primaclp: number;
    periodo: string;
    participacion: number;
    crecimiento: number;
  }
  
  // Fix the implicit 'any' type for ramo parameter
  const handleRamoDetail = (ramo: Ramo) => {
    setSelectedRamo(ramo);
    // Aquí podrías mostrar un modal o navegar a una página de detalle
    console.log('Detalle del ramo:', ramo);
    // También podrías implementar un modal o un panel lateral para mostrar más detalles
    alert(`Detalle del ramo: ${ramo.nombre}\nPrima UF: ${formatUF(ramo.primauf, 2)}`);
  };
  
  // Add type for the other ramo parameter
  const renderRamoItem = (ramo: Ramo) => {
    // Aquí podrías mostrar un modal o navegar a una página de detalle
    console.log('Detalle del ramo:', ramo);
    // También podrías implementar un modal o un panel lateral para mostrar más detalles
    alert(`Detalle del ramo: ${ramo.nombre}\nPrima UF: ${formatUF(ramo.primauf, 2)}`);
  };
  
  // Columns for data table
  const columns = [
    { 
      header: 'Grupo/Subgrupo/Ramo', 
      accessor: 'nombre' as keyof Ramo, 
      isSortable: true 
    },
    { 
      header: 'Prima UF', 
      accessor: 'primauf' as keyof Ramo,
      cell: (value: number) => formatUF(value || 0, 2),
      isSortable: true,
      isNumeric: true,
      formatter: (value: number) => formatUF(value || 0, 2)
    },
    { 
      header: 'Participación (%)', 
      accessor: 'participacion' as keyof Ramo,
      cell: (value: number) => value ? `${value.toFixed(2)}%` : '0.00%',
      isSortable: true,
      isNumeric: true,
      formatter: (value: number) => value ? `${value.toFixed(2)}%` : '0.00%'
    },
    { 
      header: 'Crecimiento (%)', 
      accessor: 'crecimiento' as keyof Ramo,
      cell: (value: number) => value ? `${value.toFixed(2)}%` : '0.00%',
      isSortable: true,
      isNumeric: true,
      formatter: (value: number) => value ? `${value.toFixed(2)}%` : '0.00%'
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
        <div className="space-y-6">
          {/* Tarjeta de resumen en la parte superior */}
          <SummaryCard
            title="Resumen del Período"
            items={[
              {
                label: 'Total Prima UF',
                value: formatUF(summary.totalPrimauf),
                icon: 'currency',
                tooltip: 'Suma total de primas en UF para todos los ramos en el período'
              },
              {
                label: 'Cantidad de Ramos',
                value: summary.ramoCount.toString(),
                icon: 'chart',
                tooltip: 'Número total de ramos registrados en el período'
              },
              {
                label: 'Crecimiento (%)',
                value: summary.growth !== null ? `${summary.growth.toFixed(2)}%` : 'N/A',
                icon: 'trend',
                trend: summary.growth !== null ? (summary.growth > 0 ? 'up' : 'down') : 'neutral',
                tooltip: 'Variación porcentual respecto al período anterior'
              }
            ]}
          />
          
          {/* Eliminado el gráfico de movimientos que no corresponde a ramos */}
          
          {/* Tabla acordeón que ocupa todo el ancho */}
          {/* El formato de URL para la navegación a detalles de ramos es: /dashboard/memoria-anual/ramo/[id] */}
          {/* donde [id] representa el código del ramo (ejemplo: 210-200, donde 210 es el grupo y 200 es el código del ramo) */}
          <AccordeonTable 
            data={ramos} 
            columns={columns} 
            groupBy="grupo"
            subGroupBy="subgrupo"
            detailPath="/dashboard/memoria-anual/ramo"
            idField="id"
            formatGroupTotal={(items) => {
              const total = items.reduce((sum, item) => sum + (item.primauf || 0), 0);
              return formatUF(total, 0);
            }}
          />
        </div>
      )}
    </div>
  );
}