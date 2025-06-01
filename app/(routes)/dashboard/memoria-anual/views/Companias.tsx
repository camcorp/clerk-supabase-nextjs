'use client';

import { useState, useEffect } from 'react';
import { useSupabaseClient } from '@/lib/supabase/client';
import { usePeriod } from '../context/PeriodContext';
import DataTable from '@/app/components/ui/charts/tables/DataTable';
import ChartMovimientos from '@/app/components/ui/charts/common/ChartMovimientos';
import SummaryCard from '@/app/components/ui/charts/SummaryCard';
import LoadingSpinner from '@/app/components/ui/charts/LoadingSpinner';
import NoData from '@/app/components/ui/charts/NoData';
import SearchInput from '@/app/components/ui/charts/SearchInput';
import { formatUF, formatCLP, formatNumber, formatChartTooltip } from '@/lib/utils/formatters';
// Importar componentes de recharts
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { DollarSign, Building2, TrendingUp } from 'lucide-react'; // <--- ICONOS AÑADIDOS

// Importar el nuevo sistema de colores y el componente de gráfico de movimientos
import { colors } from '@/lib/utils/colors';


import MaChartHHI from '@/app/components/ui/charts/MaChartHHI';

// Definir la interfaz para los datos de compañías
interface Compania {
  id: number;
  nombrecia: string;
  primauf: number;
  primaclp?: number;
  periodo: string;
  // Nota: primauf se mantiene para compatibilidad, pero internamente usa total_primauf
}

// Definir la interfaz para las estadísticas de resumen
interface Summary {
  totalPrimauf: number;
  totalPrimaclp: number;
  companyCount: number;
  growth: number | null;
}

// Define interface for historical data
interface HistoricalData {
  movimientos?: {
    periodo: string;
    entradas: number;  // Cambiado de ingresos a entradas
    salidas: number;   // Cambiado de egresos a salidas
    neto: number;
  }[];
  concentracion?: any[];
}

// Definir interfaz para datos de evolución por grupo
interface GrupoEvolucionData {
  periodo: string;
  total_uf_generales: number;
  total_uf_vida: number;
  total_clp_generales: number;
  total_clp_vida: number;
}

// Interfaz para los props del componente ChartPrimaEvolutionGrupos
interface ChartPrimaEvolutionGruposProps {
  data: GrupoEvolucionData[];
  title: string;
  subtitle: string;
  periodos: string[];
}

export default function CompaniasView() {
  const [companias, setCompanias] = useState<Compania[]>([]);
  const [filteredCompanias, setFilteredCompanias] = useState<Compania[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [summary, setSummary] = useState<Summary>({
    totalPrimauf: 0,
    totalPrimaclp: 0,
    companyCount: 0,
    growth: null
  });
  // Add historicalData state with proper typing
  const [historicalData, setHistoricalData] = useState<HistoricalData>({});
  // Agregar estado para datos de evolución por grupo
  const [evolucionPorGrupo, setEvolucionPorGrupo] = useState<GrupoEvolucionData[]>([]);
  
  // Obtener el cliente de Supabase
  const supabase = useSupabaseClient();
  
  // Usar el contexto de período global
  // Asegúrate de que periodos esté definido al nivel del componente
  // Si no está ya definido, añade esto cerca de la parte superior de tu componente:
  const { selectedPeriodo, periodos } = usePeriod();
  
  // Load companies for the selected period
  useEffect(() => {
    async function loadCompanias() {
      if (!selectedPeriodo) return;
      
      try {
        setLoading(true);
        
        // Realizar la consulta a Supabase usando la vista correcta
        const { data, error } = await supabase
          .from('vista_companias_periodo')
          .select('nombrecia, total_primaclp, total_primauf, periodo, grupo')
          .eq('periodo', selectedPeriodo)
          .order('nombrecia', { ascending: true });
        
        if (error) {
          console.error('Error en la consulta:', error);
          throw error;
        }
        
        // Verificar que data no sea undefined antes de procesarlo
        if (!data) {
          console.warn('No se recibieron datos de la consulta');
          setCompanias([]);
          setFilteredCompanias([]);
          return;
        }
        
        // Transformar los datos al formato esperado
        const transformedData = data.map((item, index) => ({
          id: index, // Usar índice como ID ya que no hay ID explícito
          nombrecia: item.nombrecia,
          primauf: item.total_primauf || 0,
          primaclp: item.total_primaclp || 0,
          periodo: item.periodo
        }));
        
        // Actualizar el estado con los datos transformados
        setCompanias(transformedData);
        setFilteredCompanias(transformedData);
        
        // Calculate summary statistics
        const totalPrimauf = data.reduce((sum, company) => sum + (company.total_primauf || 0), 0);
        const companyCount = data.length;
        const totalPrimaclp = data.reduce((sum, company) => sum + (company.total_primaclp || 0), 0);
        
        // Get previous period data for growth calculation
        const periodIndex = periodos.indexOf(selectedPeriodo);
        let growth = null;
        
        if (periodIndex < periodos.length - 1) {
          const prevPeriod = periodos[periodIndex + 1];
          const { data: prevData, error: prevError } = await supabase
            .from('vista_companias_periodo')
            .select('total_primauf')  // Cambiado de total_uf a total_primauf para consistencia
            .eq('periodo', prevPeriod);
            
          if (!prevError && prevData && prevData.length > 0) {
            const prevTotalPrimauf = prevData.reduce((sum, company) => sum + (company.total_primauf || 0), 0);
            if (prevTotalPrimauf > 0) {
              growth = ((totalPrimauf - prevTotalPrimauf) / prevTotalPrimauf) * 100;
            }
          }
        }
        
        setSummary({
          totalPrimauf,
          totalPrimaclp,
          companyCount,
          growth
        });
        
        // Load historical data
        const { data: historicalDataResult, error: historicalError } = await supabase
          .from('vista_companias_periodo')
          .select('*')
          .order('periodo', { ascending: false });
    
        if (historicalError) {
          console.error('Error al cargar datos históricos:', historicalError);
        } else if (historicalDataResult) {
          // Process historical data to get movements
          const movimientos = historicalDataResult.map(item => ({
            periodo: item.periodo,
            entradas: item.ingresos || 0,  // Mapear ingresos a entradas
            salidas: item.egresos || 0,    // Mapear egresos a salidas
            neto: (item.ingresos || 0) - (item.egresos || 0)
          }));
          
          // Cargar datos de concentración histórica
          try {
            const { data: concentracionData, error: concentracionError } = await supabase
              .from('vista_concentracion_mercado')
              .select('*')
              .order('periodo', { ascending: true });
              
            if (concentracionError) {
              console.error('Error al cargar datos de concentración histórica:', concentracionError);
              setHistoricalData({ movimientos });
            } else {
              setHistoricalData({ 
                movimientos,
                concentracion: concentracionData || []
              });
            }
          } catch (concentracionErr) {
            console.error('Error inesperado al cargar concentración histórica:', concentracionErr);
            setHistoricalData({ movimientos });
          }
        }
        
        // Cargar datos de evolución por grupo
        try {
          const { data: evolucionData, error: evolucionError } = await supabase
            .from('vista_companias_periodo')
            .select('periodo, grupo, total_primauf, total_primaclp')
            .order('periodo', { ascending: true });
            
          if (evolucionError) {
            console.error('Error al cargar evolución por grupo:', evolucionError);
          } else if (evolucionData && evolucionData.length > 0) {
            // Procesar datos para el gráfico de evolución por grupo
            // Agrupar datos por periodo y grupo
            const datosPorPeriodo: Record<string, GrupoEvolucionData> = {};
            
            evolucionData.forEach(item => {
              const periodo = item.periodo;
              if (!datosPorPeriodo[periodo]) {
                datosPorPeriodo[periodo] = {
                  periodo,
                  total_uf_generales: 0,
                  total_uf_vida: 0,
                  total_clp_generales: 0,
                  total_clp_vida: 0
                };
              }
              
              // Sumar valores según el grupo (1 = Generales, 2 = Vida)
              if (item.grupo === '1' || item.grupo === 'GENERALES') {
                datosPorPeriodo[periodo].total_uf_generales += item.total_primauf || 0;
                datosPorPeriodo[periodo].total_clp_generales += item.total_primaclp || 0;
              } else if (item.grupo === '2' || item.grupo === 'VIDA') {
                datosPorPeriodo[periodo].total_uf_vida += item.total_primauf || 0;
                datosPorPeriodo[periodo].total_clp_vida += item.total_primaclp || 0;
              }
            });
            
            // Convertir a array para el gráfico
            const evolucionArray = Object.values(datosPorPeriodo);
            setEvolucionPorGrupo(evolucionArray);
          }
        } catch (evolucionErr) {
          console.error('Error inesperado al cargar evolución por grupo:', evolucionErr);
        }
        
      } catch (err) {
        console.error('Error al cargar compañías:', err);
        setError('No se pudieron cargar las compañías. Por favor, intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    }
    
    loadCompanias();
  }, [supabase, selectedPeriodo, periodos]);
  
  // Filtrar compañías cuando cambia el término de búsqueda
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCompanias(companias);
    } else {
      const filtered = companias.filter(compania =>
        compania.nombrecia.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCompanias(filtered);
    }
  }, [searchTerm, companias]);
  
  // Definir las columnas para la tabla
  // Add import at the top
  import Link from 'next/link';
  import { Eye } from 'lucide-react';
  
  // Update the columns definition (around line 260):
  const columns = [
  {
  header: 'Compañía',
  accessor: 'nombrecia' as keyof Compania,
  isSortable: true,
  cell: (value: string, row: Compania) => (
  <div className="flex items-center justify-between">
  <span>{value}</span>
  <Link 
  href={`/dashboard/memoria-anual/compania/${encodeURIComponent(value)}`}
  className="ml-2 p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
  title="Ver detalle"
  >
  <Eye className="h-4 w-4" />
  </Link>
  </div>
  )
  },
  {
  header: 'Prima UF',
  accessor: 'primauf' as keyof Compania,
  isSortable: true,
  isNumeric: true,
  cell: (value: number) => formatUF(value, 2, true)
  },
  {
  header: 'Prima CLP (Miles)',
  accessor: 'primaclp' as keyof Compania,
  isSortable: true,
  isNumeric: true,
  cell: (value: number) => formatCLP(value)
  }
  ];
  
  // Formatear números para mostrar en las tarjetas de resumen
  const formatNumberValue = (value: number) => {
    return formatNumber(value);
  };
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (error) {
    return <NoData message={error} />;
  }
  
  // Dentro del componente CompaniasView, modificar la sección de la tabla
  return (
    <div className="space-y-6 font-inter">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard
          title="Prima Total"
          value={formatUF(summary.totalPrimauf)}
          trend={summary.growth}
          icon={<DollarSign className="h-5 w-5" />}
          // description="Total de primas en UF" // Propiedad 'description' eliminada
        />
        <SummaryCard
          title="Compañías"
          value={summary.companyCount.toString()}
          icon={<Building2 className="h-5 w-5" />}
          // description="Compañías activas" // Propiedad 'description' eliminada
        />
        <SummaryCard
          title="Prima Promedio"
          value={formatUF(summary.companyCount > 0 ? summary.totalPrimauf / summary.companyCount : 0)}
          icon={<TrendingUp className="h-5 w-5" />}
          // description="Prima promedio por compañía" // Propiedad 'description' eliminada
        />
      </div>
      
      {/* Rest of the component */}
      {evolucionPorGrupo && evolucionPorGrupo.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Evolución de Primas por Grupo</h2>
          <div className="bg-white rounded-xl shadow-sm border border-[#E9ECEF] overflow-hidden">
            <ChartPrimaEvolutionGrupos
              data={evolucionPorGrupo}
              title="Evolución de Primas por Grupo"
              subtitle="Seguros Generales vs Seguros de Vida"
              periodos={periodos}
            />
          </div>
        </div>
      )}

      {/* Gráfico de movimientos */}
      {historicalData && historicalData.movimientos && historicalData.movimientos.length > 0 ? (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Movimientos de Compañías</h2>
          <ChartMovimientos 
            data={historicalData.movimientos || []} 
            tipo="companias" 
            title="Movimientos de Compañías"
            subtitle="Entradas y salidas de compañías por período"
          />
        </div>
      ) : (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-center">No hay datos de movimientos disponibles</p>
        </div>
      )}

      {/* Gráfico de concentración HHI */}
      {historicalData && historicalData.concentracion && historicalData.concentracion.length > 0 ? (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Índice de Concentración HHI</h2>
          <MaChartHHI 
            historicalConcentracion={historicalData.concentracion}
          />
        </div>
      ) : (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-center">No hay datos de concentración disponibles</p>
        </div>
      )}
      
      {/* Search and Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <SearchInput
            placeholder="Buscar compañía..."
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </div>
        
        <DataTable
          columns={columns}
          data={filteredCompanias}
          selectable={true}
          showTotals={true}
          emptyMessage="No se encontraron compañías para el período seleccionado."
        />
      </div>
    </div>
  );
}

// Componente para mostrar la evolución de primas por grupo
// Replace the ChartPrimaEvolutionGrupos component (lines 401-496) with:
function ChartPrimaEvolutionGrupos({ data, title, subtitle, periodos }: ChartPrimaEvolutionGruposProps) {
  const [moneda, setMoneda] = useState<'uf' | 'clp'>('uf');
  
  // Use centralized formatting
  const formatValue = (value: number) => {
    return formatChartTooltip(value, false, moneda);
  };
  
  // Format Y-axis without decimals
  const formatYAxis = (value: number) => {
    if (moneda === 'uf') {
      return formatUF(value, 0, false); // No decimals
    } else {
      return formatCLP(value, false);
    }
  };
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-[#0F3460] font-['Space_Grotesk']">{title}</h3>
          {subtitle && <p className="text-sm text-[#6C757D]">{subtitle}</p>}
        </div>
        
        {/* Currency selector */}
        <div className="flex space-x-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setMoneda('uf')}
            className={`px-3 py-1 rounded-md text-sm ${
              moneda === 'uf' 
                ? 'bg-white shadow-sm text-[#1A7F8E]' 
                : 'text-gray-500 hover:bg-gray-200'
            }`}
          >
            UF
          </button>
          <button
            onClick={() => setMoneda('clp')}
            className={`px-3 py-1 rounded-md text-sm ${
              moneda === 'clp' 
                ? 'bg-white shadow-sm text-[#1A7F8E]' 
                : 'text-gray-500 hover:bg-gray-200'
            }`}
          >
            CLP
          </button>
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
            <XAxis 
              dataKey="periodo" 
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#E9ECEF' }}
            />
            <YAxis 
              tickFormatter={formatYAxis}
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#E9ECEF' }}
            />
            <Tooltip 
              formatter={(value: number, name: string) => [
                formatValue(value), 
                name
              ]}
              labelFormatter={(label) => `Período: ${label}`}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey={moneda === 'uf' ? "total_uf_generales" : "total_clp_generales"} 
              name="Seguros Generales" 
              stroke={colors.companias.primary} 
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6, stroke: colors.companias.primary, strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey={moneda === 'uf' ? "total_uf_vida" : "total_clp_vida"} 
              name="Seguros de Vida" 
              stroke={colors.companias.secondary} 
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6, stroke: colors.companias.secondary, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Replace the movements data fetching logic (around lines 160-180) with:
// Load historical data for movements
const { data: movimientosData, error: movimientosError } = await supabase
  .from('vista_mercado_periodo')
  .select('periodo, num_entradas, num_salidas')
  .order('periodo', { ascending: true });

if (movimientosError) {
  console.error('Error al cargar datos de movimientos:', movimientosError);
} else if (movimientosData) {
  const movimientos = movimientosData.map(item => ({
    periodo: item.periodo,
    entradas: Number(item.num_entradas || 0),
    salidas: Number(item.num_salidas || 0),
    neto: Number(item.num_entradas || 0) - Number(item.num_salidas || 0)
  }));
  
  setHistoricalData({ 
    movimientos,
    concentracion: [] // Will be loaded separately if needed
  });
}