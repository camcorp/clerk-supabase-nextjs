'use client';

import { useEffect, useState } from 'react';
import { useSupabaseClient } from '../../../../lib/supabase-client';
import DataCard from '../components/DataCard';
import SummaryCard from '../components/SummaryCard';
import DataTable from '../components/DataTable';
import NoData from '../components/NoData';
import ChartCard from '../components/ChartCard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Definir la interfaz para las compañías
interface Compania {
  id: number;
  nombrecia: string;
  primauf: number;
  periodo: string;
}

// Interface for summary stats
interface PeriodSummary {
  totalPrimauf: number;
  companyCount: number;
  growth: number | null;
}

export default function CompaniasView() {
  const [companias, setCompanias] = useState<Compania[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [periodos, setPeriodos] = useState<string[]>([]);
  const [selectedPeriodo, setSelectedPeriodo] = useState<string>('');
  const [summary, setSummary] = useState<PeriodSummary>({
    totalPrimauf: 0,
    companyCount: 0,
    growth: null
  });
  
  // Obtener el cliente de Supabase
  const supabase = useSupabaseClient();
  
  // Load available periods
  useEffect(() => {
    async function loadPeriodos() {
      try {
        const { data, error } = await supabase
          .from('companias')
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
  
  // Load companies for the selected period
  useEffect(() => {
    async function loadCompanias() {
      if (!selectedPeriodo) return;
      
      try {
        setLoading(true);
        
        // Realizar la consulta a Supabase
        const { data, error } = await supabase
          .from('companias')
          .select('id, nombrecia, primauf, periodo')
          .eq('periodo', selectedPeriodo)
          .order('nombrecia', { ascending: true });
        
        if (error) {
          throw error;
        }
        
        // Actualizar el estado con los datos
        setCompanias(data || []);
        
        // Calculate summary statistics
        if (data) {
          const totalPrimauf = data.reduce((sum, company) => sum + (company.primauf || 0), 0);
          const companyCount = data.length;
          
          // Get previous period data for growth calculation
          const periodIndex = periodos.indexOf(selectedPeriodo);
          let growth = null;
          
          if (periodIndex < periodos.length - 1) {
            const prevPeriod = periodos[periodIndex + 1];
            const { data: prevData, error: prevError } = await supabase
              .from('companias')
              .select('primauf')
              .eq('periodo', prevPeriod);
              
            if (!prevError && prevData) {
              const prevTotalPrimauf = prevData.reduce((sum, company) => sum + (company.primauf || 0), 0);
              if (prevTotalPrimauf > 0) {
                growth = ((totalPrimauf - prevTotalPrimauf) / prevTotalPrimauf) * 100;
              }
            }
          }
          
          setSummary({
            totalPrimauf,
            companyCount,
            growth
          });
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
  
  // Format number as currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(value);
  };
  
  // Columns for data table
  const columns = [
    { header: 'Compañía', accessor: 'nombrecia' },
    { 
      header: 'Prima UF', 
      accessor: 'primauf',
      cell: (value: number) => formatCurrency(value)
    }
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-[#0F3460] font-['Space_Grotesk']">Compañías de Seguros</h2>
        
        {/* Period selector */}
        <div className="flex items-center">
          <label htmlFor="periodo" className="mr-2 text-sm font-medium text-[#6C757D]">
            Periodo:
          </label>
          <select
            id="periodo"
            value={selectedPeriodo}
            onChange={(e) => setSelectedPeriodo(e.target.value)}
            className="block w-40 pl-3 pr-10 py-2 text-base border-[#E9ECEF] focus:outline-none focus:ring-[#1A7F8E] focus:border-[#1A7F8E] sm:text-sm rounded-md"
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
          icon={
            <svg className="w-6 h-6 text-[#1A7F8E]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <SummaryCard 
          title="Número de Compañías" 
          value={summary.companyCount.toString()} 
          icon={
            <svg className="w-6 h-6 text-[#8D7AE6]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
        />
        <SummaryCard 
          title="Crecimiento vs Periodo Anterior" 
          value={summary.growth !== null ? `${summary.growth >= 0 ? '+' : ''}${summary.growth.toFixed(2)}%` : 'N/A'} 
          trend={summary.growth !== null ? summary.growth : undefined}
          trendLabel="vs periodo anterior"
          icon={
            <svg className="w-6 h-6 text-[#F39C12]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />
      </div>
      
      {/* Chart and Data Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DataCard 
          title="Distribución de Primas por Compañía"
          footer={
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#6C757D]">Actualizado: {selectedPeriodo}</span>
              <button className="text-[#3498DB] text-sm font-medium hover:text-[#0F3460] transition-colors">
                Ver detalles
              </button>
            </div>
          }
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={companias.slice(0, 10)}>
                <XAxis dataKey="nombrecia" tick={{fontSize: 10}} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="primauf" fill="#1A7F8E" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </DataCard>
        
        <DataCard 
          title="Resumen de Primas"
          footer={
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#6C757D]">Periodo: {selectedPeriodo}</span>
            </div>
          }
        >
          <div className="space-y-4 py-4">
            <div>
              <p className="text-sm text-[#6C757D]">Total en UF</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-[#0F3460] to-[#1A7F8E] bg-clip-text text-transparent">
                {formatCurrency(summary.totalPrimauf)}
              </p>
            </div>
            <div>
              <p className="text-sm text-[#6C757D]">Total en CLP (aprox.)</p>
              <p className="text-2xl font-bold text-[#0F3460]">
                {formatCurrency(summary.totalPrimauf * 30000)}
              </p>
            </div>
          </div>
        </DataCard>
      </div>
      
      {/* Data Table */}
      {loading ? (
        <div className="text-center py-4">
          <p className="text-[#6C757D]">Cargando compañías...</p>
        </div>
      ) : error ? (
        <div className="bg-[#E74C3C]/10 border-l-4 border-[#E74C3C] p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-[#E74C3C]" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-[#E74C3C]">{error}</p>
            </div>
          </div>
        </div>
      ) : companias.length > 0 ? (
        <DataCard title="Listado de Compañías">
          <DataTable 
            data={companias} 
            columns={columns}
          />
        </DataCard>
      ) : (
        <NoData message="No hay compañías disponibles para este periodo" />
      )}
    </div>
  );
}