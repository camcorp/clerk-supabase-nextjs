'use client';

import { useEffect, useState } from 'react';
import { useSupabaseClient } from '../../../../lib/supabase-client';
import DataCard from '../components/DataCard';
import SummaryCard from '../components/SummaryCard';
import DataTable from '../components/DataTable';
import NoData from '../components/NoData';
import ChartCard from '../components/ChartCard';

// Definir la interfaz para los ramos
interface Ramo {
  id: number;
  nombre: string;
  primauf: number;
  periodo: string;
}

// Interface for summary stats
interface PeriodSummary {
  totalPrimauf: number;
  ramoCount: number;
  growth: number | null;
}

export default function RamosView() {
  const [ramos, setRamos] = useState<Ramo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [periodos, setPeriodos] = useState<string[]>([]);
  const [selectedPeriodo, setSelectedPeriodo] = useState<string>('');
  const [summary, setSummary] = useState<PeriodSummary>({
    totalPrimauf: 0,
    ramoCount: 0,
    growth: null
  });
  
  // Obtener el cliente de Supabase
  const supabase = useSupabaseClient();
  
  // Load available periods
  useEffect(() => {
    async function loadPeriodos() {
      try {
        const { data, error } = await supabase
          .from('ramos')
          .select('periodo')
          .order('periodo', { ascending: false });
        
        if (error) throw error;
        
        // Usamos un enfoque alternativo para obtener valores únicos
        const uniquePeriods = Array.from(
          new Map(data.map(item => [item.periodo, item.periodo])).values()
        );
        setPeriodos(uniquePeriods);
        
        // Set default selected period to the most recent one
        if (uniquePeriods.length > 0 && !selectedPeriodo) {
          setSelectedPeriodo(uniquePeriods[0]);
        }
      } catch (err) {
        console.error('Error al cargar periodos:', err);
      }
    }
    
    loadPeriodos();
  }, [supabase, selectedPeriodo]);
  
  // Load ramos for the selected period
  useEffect(() => {
    async function loadRamos() {
      if (!selectedPeriodo) return;
      
      try {
        setLoading(true);
        
        // Realizar la consulta a Supabase
        const { data, error } = await supabase
          .from('ramos')
          .select('id, nombre, primauf, periodo')
          .eq('periodo', selectedPeriodo)
          .order('nombre', { ascending: true });
        
        if (error) {
          throw error;
        }
        
        // Actualizar el estado con los datos
        setRamos(data || []);
        
        // Calculate summary statistics
        if (data) {
          const totalPrimauf = data.reduce((sum, ramo) => sum + (ramo.primauf || 0), 0);
          const ramoCount = data.length;
          
          // Get previous period data for growth calculation
          const periodIndex = periodos.indexOf(selectedPeriodo);
          let growth = null;
          
          if (periodIndex < periodos.length - 1) {
            const prevPeriod = periodos[periodIndex + 1];
            const { data: prevData, error: prevError } = await supabase
              .from('ramos')
              .select('primauf')
              .eq('periodo', prevPeriod);
              
            if (!prevError && prevData) {
              const prevTotalPrimauf = prevData.reduce((sum, ramo) => sum + (ramo.primauf || 0), 0);
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
  
  // Format number as currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(value);
  };
  
  // Columns for data table
  const columns = [
    { header: 'Ramo', accessor: 'nombre' },
    { 
      header: 'Prima UF', 
      accessor: 'primauf',
      cell: (value: number) => formatCurrency(value)
    }
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Ramos de Seguros</h2>
        
        {/* Period selector */}
        <div className="flex items-center">
          <label htmlFor="periodo" className="mr-2 text-sm font-medium text-gray-700">
            Periodo:
          </label>
          <select
            id="periodo"
            value={selectedPeriodo}
            onChange={(e) => setSelectedPeriodo(e.target.value)}
            className="block w-40 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            {periodos.map((periodo) => (
              <option key={periodo} value={periodo}>
                {periodo}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard 
          title="Total Prima UF" 
          value={formatCurrency(summary.totalPrimauf)} 
        />
        <SummaryCard 
          title="Número de Ramos" 
          value={summary.ramoCount.toString()} 
        />
        <SummaryCard 
          title="Crecimiento vs Periodo Anterior" 
          value={summary.growth !== null ? `${summary.growth >= 0 ? '+' : ''}${summary.growth.toFixed(2)}%` : 'N/A'} 
          valueColor={summary.growth !== null ? (summary.growth >= 0 ? 'text-green-600' : 'text-red-600') : ''}
        />
      </div>
      
      {/* Chart and Data Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Distribución de Primas por Ramo" data={ramos} />
        <DataCard 
          title="Resumen de Primas" 
          clp={summary.totalPrimauf * 30000} // Ejemplo de conversión, ajustar según valor real de UF
          uf={summary.totalPrimauf} 
        />
      </div>
      
      {/* Data Table */}
      {loading ? (
        <div className="text-center py-4">
          <p className="text-gray-500">Cargando ramos...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      ) : ramos.length > 0 ? (
        <DataTable 
          data={ramos} 
          columns={columns} 
          title="Listado de Ramos" 
        />
      ) : (
        <NoData message="No hay ramos disponibles para este periodo" />
      )}
    </div>
  );
}