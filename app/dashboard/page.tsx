'use client';

import { useEffect, useState } from 'react';
import { useSupabaseClient } from '../../lib/supabase-client';

// Definir la interfaz para las compañías
interface Compania {
  id: number;
  nombrecia: string;
  primauf: number;
  periodo: string;
  // Puedes añadir más campos según tu esquema de base de datos
}

// Interface for summary stats
interface PeriodSummary {
  totalPrimauf: number;
  companyCount: number;
  growth: number | null;
}

export default function Dashboard() {
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
          .order('periodo', { ascending: false })
          .distinct();
        
        if (error) throw error;
        
        const availablePeriods = data.map(item => item.periodo);
        setPeriodos(availablePeriods);
        
        // Set default selected period to the most recent one
        if (availablePeriods.length > 0 && !selectedPeriodo) {
          setSelectedPeriodo(availablePeriods[0]);
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
  
  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Total Primauf Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Total Primauf
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {formatCurrency(summary.totalPrimauf)}
              </dd>
            </div>
          </div>
          
          {/* Company Count Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Número de Compañías
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {summary.companyCount}
              </dd>
            </div>
          </div>
          
          {/* Growth Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Crecimiento vs Periodo Anterior
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {summary.growth !== null ? (
                  <span className={summary.growth >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {summary.growth >= 0 ? '+' : ''}{summary.growth.toFixed(2)}%
                  </span>
                ) : (
                  'N/A'
                )}
              </dd>
            </div>
          </div>
        </div>
        
        {/* Mostrar mensaje de carga */}
        {loading && (
          <div className="text-center py-4">
            <p className="text-gray-500">Cargando compañías...</p>
          </div>
        )}
        
        {/* Mostrar mensaje de error */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
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
        )}
        
        {/* Mostrar lista de compañías */}
        {!loading && !error && (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {companias.length > 0 ? (
                companias.map((compania) => (
                  <li key={compania.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-blue-600 truncate">
                          {compania.nombrecia}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Primauf: {formatCurrency(compania.primauf)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
                  No hay compañías disponibles para este periodo
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}