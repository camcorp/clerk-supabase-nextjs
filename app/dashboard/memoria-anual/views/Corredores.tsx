'use client';

import { useEffect, useState } from 'react';
import { useSupabaseClient } from '../../../../lib/supabase-client';
import ModernCard from '../components/ModernCard';
import SummaryCard from '../components/SummaryCard';
import DataTable from '../components/DataTable';
import NoData from '../components/NoData';
import ChartCard from '../components/ChartCard';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { usePeriod } from '../context/PeriodContext';
import { inter, spaceGrotesk } from '../fonts';
import { getCorredoresData, getHistoricalCorredoresData } from '../api/corredores';
import { formatUF } from '../utils/formatters';
import { colors } from '../utils/systemcolors';
import ChartMovimientos from '../components/ChartMovimientos';
import ChartCountEvolution from '../components/ChartCountEvolution';
import ChartPrimaEvolution from '../components/ChartPrimaEvolution';
import ChartHHIEvolution from '../components/ChartHHIEvolution';

// Definir interfaces
interface Corredor {
  id: number;
  periodo: string;
  total_clp: number;
  total_uf: number;
  num_corredores: number;
  hhi_general?: number;
  concentracion?: any[];
}

interface PeriodSummary {
  totalPrimauf: number;
  totalPrimaclp: number;
  corredorCount: number;
  growth: number | null;
  hhi?: number;
}

// Define interface for historical data
interface HistoricalDataItem {
  periodo: string;
  total_clp: number;
  total_uf: number;
  num_corredores: number;
  variacion_num_corredores: number | null;
  variacion_total_uf: number | null;
}

interface ConcentracionItem {
  hhi_general: number;
  hhi_grupo: number;
  periodo: any;
  grupo: any;
}

interface MovimientoItem {
  periodo: string;
  entradas: number;
  salidas: number;
  neto: number;
}

interface CompleteHistoricalData {
  evolution: HistoricalDataItem[];
  concentracion: ConcentracionItem[];
  movimientos: MovimientoItem[];
}

export default function CorredoresView() {
  const [corredores, setCorredores] = useState<Corredor[]>([]);
  const [historicalData, setHistoricalData] = useState<CompleteHistoricalData>({
    evolution: [],
    concentracion: [],
    movimientos: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<PeriodSummary>({
    totalPrimauf: 0,
    totalPrimaclp: 0,
    corredorCount: 0,
    growth: null,
    hhi: 0
  });
  
  // Obtener el cliente de Supabase
  const supabase = useSupabaseClient();
  
  // Usar el contexto de período
  const { selectedPeriodo, periodos } = usePeriod();
  
  // Cargar datos históricos para gráficos
  useEffect(() => {
    async function loadHistoricalData() {
      try {
        const data = await getHistoricalCorredoresData();
        setHistoricalData(data);
      } catch (err) {
        console.error('Error al cargar datos históricos:', err);
      }
    }
    
    loadHistoricalData();
  }, []);
  
  // Cargar datos del período seleccionado
  useEffect(() => {
    async function loadCorredores() {
      if (!selectedPeriodo) return;
      
      try {
        setLoading(true);
        
        const data = await getCorredoresData(selectedPeriodo);
        setCorredores(data);
        
        // Filtrar los datos del período seleccionado para el resumen
        const currentPeriodData = data.find(item => item.periodo === selectedPeriodo);
        
        if (currentPeriodData) {
          // Calcular crecimiento respecto al período anterior
          const periodIndex = periodos.indexOf(selectedPeriodo);
          let growth = null;
          
          if (periodIndex < periodos.length - 1) {
            const prevPeriod = periodos[periodIndex + 1];
            const prevPeriodData = data.find(item => item.periodo === prevPeriod);
              
            if (prevPeriodData && prevPeriodData.total_uf > 0) {
              growth = ((currentPeriodData.total_uf - prevPeriodData.total_uf) / prevPeriodData.total_uf) * 100;
            }
          }
          
          setSummary({
            totalPrimauf: currentPeriodData.total_uf,
            totalPrimaclp: currentPeriodData.total_clp,
            corredorCount: currentPeriodData.num_corredores,
            growth,
            hhi: currentPeriodData.hhi_general
          });
        }
        
        // Cargar datos históricos
        const { data: historicalDataResult, error: historicalError } = await supabase
          .from('vista_corredores_periodo')
          .select('*')
          .order('periodo', { ascending: false });
      
        if (historicalError) throw historicalError;
        
        // Actualizar el estado con los datos históricos si es necesario
        // Nota: Esto podría no ser necesario si ya estás cargando datos históricos en el otro useEffect
        
      } catch (err) {
        console.error('Error al cargar corredores:', err);
        setError('No se pudieron cargar los corredores. Por favor, intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    }
    
    loadCorredores();
  }, [supabase, selectedPeriodo, periodos]);
  
  // Dentro del componente CorredoresView, reemplazar los gráficos existentes
  return (
    <div className={`${inter.variable} ${spaceGrotesk.variable} font-sans`}>
      <h2 className="text-2xl font-bold mb-6">Corredores de Seguros</h2>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
          {error}
        </div>
      ) : corredores.length === 0 ? (
        <NoData message="No hay datos de corredores disponibles para este período." />
      ) : (
        <div className="space-y-8">
          {/* Resumen del período */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <SummaryCard
              title="Total Prima UF"
              value={formatUF(summary.totalPrimauf) + " UF"}
            />
            <SummaryCard
              title="Cantidad de Corredores"
              value={summary.corredorCount.toString()}
            />
            <SummaryCard
              title="Crecimiento"
              value={summary.growth !== null ? formatUF(summary.growth, 2) + "%" : "N/A"}
              trend={summary.growth !== null ? summary.growth : 0}
            />
            <SummaryCard
              title="Índice HHI"
              value={Math.trunc(summary.hhi || 0).toString()}
              tooltip="Índice Herfindahl-Hirschman. Valores mayores indican mayor concentración del mercado."
            />
          </div>
          
          {/* Gráfico 1: Evolución del número de corredores */}
          {historicalData.evolution && historicalData.evolution.length > 0 ? (
            <ChartCountEvolution 
              data={historicalData.evolution}
              countKey="num_corredores"
              title="Evolución del Número de Corredores"
              subtitle="Cantidad de corredores a lo largo del tiempo"
              color="#82ca9d"
            />
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-[#E9ECEF] p-6">
              <h3 className="text-lg font-semibold text-[#0F3460] font-['Space_Grotesk']">Evolución del Número de Corredores</h3>
              <div className="flex justify-center items-center h-64">
                <p className="text-gray-500">No hay datos históricos disponibles</p>
              </div>
            </div>
          )}
          
          {/* Gráfico 2: Evolución de primas */}
          {historicalData.evolution && historicalData.evolution.length > 0 ? (
            <ChartPrimaEvolution
              data={historicalData.evolution}
              title="Evolución de Corredores"
              subtitle="Evolución histórica de corredores"
              periodos={periodos}
              valueField="total_uf"
              growthField="variacion_total_uf"
              color={colors.corredores.primary}
            />
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-[#E9ECEF] p-6">
              <h3 className="text-lg font-semibold text-[#0F3460] font-['Space_Grotesk']">Evolución de Primas</h3>
              <div className="flex justify-center items-center h-64">
                <p className="text-gray-500">No hay datos históricos disponibles</p>
              </div>
            </div>
          )}
          
          {/* Gráfico 3: Concentración del mercado */}
          {historicalData.concentracion && historicalData.concentracion.length > 0 ? (
            <ChartHHIEvolution 
              data={historicalData.concentracion}
              title="Concentración del Mercado de Corredores"
              subtitle="Índice Herfindahl-Hirschman por grupo de ramos"
              threshold={1000}
            />
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-[#E9ECEF] p-6">
              <h3 className="text-lg font-semibold text-[#0F3460] font-['Space_Grotesk']">Concentración del Mercado</h3>
              <div className="flex justify-center items-center h-64">
                <p className="text-gray-500">No hay datos de concentración disponibles</p>
              </div>
            </div>
          )}
          
          {/* Gráfico 4: Entradas y salidas de corredores */}
          {/* Reemplazar el gráfico de movimientos existente */}
          {historicalData.movimientos && historicalData.movimientos.length > 0 ? (
            <ChartMovimientos 
              data={historicalData.movimientos}
              tipo="corredores"
              title="Movimientos de Corredores"
              subtitle="Entradas y salidas de corredores por período"
              showNeto={true}
            />
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-[#E9ECEF] p-6">
              <h3 className="text-lg font-semibold text-[#0F3460] font-['Space_Grotesk']">Movimientos de Corredores</h3>
              <div className="flex justify-center items-center h-64">
                <p className="text-gray-500">No hay datos de movimientos disponibles</p>
              </div>
            </div>
          )}
          
          {/* Tabla de datos del período seleccionado */}
          <ModernCard title="Corredores de Seguros">
            <DataTable
              columns={[
                { header: 'Período', accessor: 'periodo' },
                { 
                  header: 'Prima UF', 
                  accessor: 'total_uf',
                  cell: (value) => formatUF(value, 0) + " UF"
                },
                { 
                  header: 'Número de Corredores', 
                  accessor: 'num_corredores' 
                },
                { 
                  header: 'Índice HHI', 
                  accessor: 'hhi_general',
                  cell: (value) => Math.trunc(value || 0).toString()
                }
              ]}
              data={corredores}
            />
          </ModernCard>
        </div>
      )}
    </div>
  );
}