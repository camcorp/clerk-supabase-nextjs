'use client';

import { useEffect, useState } from 'react';
import { useSupabaseClient } from '../../lib/supabase-client';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';

// Definir las interfaces para los datos
interface Compania {
  id: number;
  nombrecia: string;
  primauf: number;
  periodo: string;
}

interface EvolucionMercado {
  periodo: string;
  rutcia: string;
  nombrecia: string;
  tipo_cambio: 'entrada' | 'salida' | 'fusión';
  motivo: string;
}

interface ConcentracionMercado {
  periodo: string;
  grupo: string;
  total_clp: number;
  total_uf: number;
  participacion_porcentaje: number;
  varianza_anual: number | null;
}

interface ActorSaliente {
  id: number;
  rutcia: string;
  nombrecia: string;
  motivo: string;
  fecha_salida: string;
}

// Interface for summary stats
interface PeriodSummary {
  totalPrimauf: number;
  companyCount: number;
  growth: number | null;
  entradasCount: number;
  salidasCount: number;
}

// Colores para gráficos
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function Dashboard() {
  const [companias, setCompanias] = useState<Compania[]>([]);
  const [evolucionMercado, setEvolucionMercado] = useState<EvolucionMercado[]>([]);
  const [concentracionMercado, setConcentracionMercado] = useState<ConcentracionMercado[]>([]);
  const [actoresSalientes, setActoresSalientes] = useState<ActorSaliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [periodos, setPeriodos] = useState<string[]>([]);
  const [selectedPeriodo, setSelectedPeriodo] = useState<string>('');
  const [summary, setSummary] = useState<PeriodSummary>({
    totalPrimauf: 0,
    companyCount: 0,
    growth: null,
    entradasCount: 0,
    salidasCount: 0
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
  
  // Load data for the selected period
  useEffect(() => {
    async function loadData() {
      if (!selectedPeriodo) return;
      
      try {
        setLoading(true);
        
        // 1. Cargar compañías
        const { data: companiasData, error: companiasError } = await supabase
          .from('companias')
          .select('id, nombrecia, primauf, periodo')
          .eq('periodo', selectedPeriodo)
          .order('nombrecia', { ascending: true });
        
        if (companiasError) throw companiasError;
        
        // 2. Cargar evolución del mercado
        const { data: evolucionData, error: evolucionError } = await supabase
          .from('vista_evolucion_mercado')
          .select('*')
          .eq('periodo', selectedPeriodo);
          
        if (evolucionError) throw evolucionError;
        
        // 3. Cargar concentración del mercado
        const { data: concentracionData, error: concentracionError } = await supabase
          .from('vista_concentracion_mercado')
          .select('*')
          .eq('periodo', selectedPeriodo);
          
        if (concentracionError) throw concentracionError;
        
        // 4. Cargar actores salientes
        const { data: actoresSalientesData, error: actoresSalientesError } = await supabase
          .from('actores_salientes')
          .select('*');
          
        if (actoresSalientesError) throw actoresSalientesError;
        
        // Actualizar estados
        setCompanias(companiasData || []);
        setEvolucionMercado(evolucionData || []);
        setConcentracionMercado(concentracionData || []);
        setActoresSalientes(actoresSalientesData || []);
        
        // Calculate summary statistics
        if (companiasData) {
          const totalPrimauf = companiasData.reduce((sum, company) => sum + (company.primauf || 0), 0);
          const companyCount = companiasData.length;
          
          // Contar entradas y salidas
          const entradas = evolucionData ? evolucionData.filter(item => item.tipo_cambio === 'entrada').length : 0;
          const salidas = evolucionData ? evolucionData.filter(item => item.tipo_cambio === 'salida').length : 0;
          
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
            growth,
            entradasCount: entradas,
            salidasCount: salidas
          });
        }
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('No se pudieron cargar los datos. Por favor, intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
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
          <h1 className="text-2xl font-semibold text-gray-900">Memoria Anual del Mercado Asegurador</h1>
          
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
          {/* Total Primauf Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Total Prima UF
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
          
          {/* Entradas Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Nuevas Entradas
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-green-600">
                +{summary.entradasCount}
              </dd>
            </div>
          </div>
          
          {/* Salidas Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Salidas
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-red-600">
                -{summary.salidasCount}
              </dd>
            </div>
          </div>
        </div>
        
        {/* Mostrar mensaje de carga */}
        {loading && (
          <div className="text-center py-4">
            <p className="text-gray-500">Cargando datos...</p>
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
        
        {!loading && !error && (
          <>
            {/* Sección: Evolución del Mercado */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Evolución del Mercado</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Análisis de la evolución de compañías en términos de entradas, salidas y fusiones.
                </p>
              </div>
              
              <div className="px-4 py-5 sm:p-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { 
                          name: selectedPeriodo, 
                          entradas: evolucionMercado.filter(e => e.tipo_cambio === 'entrada').length,
                          salidas: evolucionMercado.filter(e => e.tipo_cambio === 'salida').length,
                          fusiones: evolucionMercado.filter(e => e.tipo_cambio === 'fusión').length
                        }
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="entradas" name="Entradas" fill="#4ade80" />
                      <Bar dataKey="salidas" name="Salidas" fill="#f87171" />
                      <Bar dataKey="fusiones" name="Fusiones" fill="#60a5fa" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            {/* Sección: Cambios en la estructura de mercado */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Cambios en la Estructura de Mercado</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Identificación de cambios en la concentración del mercado y tendencias significativas.
                </p>
              </div>
              
              <div className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="h-80">
                    <h4 className="text-md font-medium text-gray-700 mb-2">Participación por Grupo</h4>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={concentracionMercado}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="total_uf"
                          nameKey="grupo"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {concentracionMercado.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div>
                    <h4 className="text-md font-medium text-gray-700 mb-2">Concentración del Mercado</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grupo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participación</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variación</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {concentracionMercado.map((item, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.grupo}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.participacion_porcentaje.toFixed(2)}%</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {item.varianza_anual !== null ? (
                                  <span className={item.varianza_anual >= 0 ? 'text-green-600' : 'text-red-600'}>
                                    {item.varianza_anual >= 0 ? '+' : ''}{item.varianza_anual.toFixed(2)}%
                                  </span>
                                ) : 'N/A'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sección: Tendencias por Grupo */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Tendencias por Grupo</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Comparación entre Seguros Generales y Vida.
                </p>
              </div>
              
              <div className="px-4 py-5 sm:p-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={concentracionMercado}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="grupo" />
                      <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                      <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Legend />
                      <Bar yAxisId="left" dataKey="total_uf" name="Prima UF" fill="#8884d8" />
                      <Bar yAxisId="right" dataKey="participacion_porcentaje" name="Participación %" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            {/* Sección: Tabla de Salidas */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Tabla de Salidas</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Listado de actores que han dejado el mercado, incluyendo motivo.
                </p>
              </div>
              
              <div className="px-4 py-5 sm:p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Compañía</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RUT</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Motivo</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Salida</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {actoresSalientes.length > 0 ? (
                        actoresSalientes.map((actor) => (
                          <tr key={actor.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{actor.nombrecia}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{actor.rutcia}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{actor.motivo}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(actor.fecha_salida).toLocaleDateString('es-CL')}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                            No hay registros de salidas disponibles
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}