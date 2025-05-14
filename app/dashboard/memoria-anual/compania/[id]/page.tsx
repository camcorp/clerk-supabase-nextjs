'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSupabaseClient } from '../../../../../lib/supabase-client';
import { usePeriod } from '../../context/PeriodContext';
import SummaryCard from '../../components/SummaryCard';
import ModernCard from '../../components/ModernCard';
import AccordeonTable from '../../components/AccordeonTable';
import ChartDualAxis from '../../components/ChartDualAxis';
import LoadingSpinner from '../../components/LoadingSpinner';
import NoData from '../../components/NoData';
import { formatUF, formatCLP, formatPercent } from '../../utils/formatters';
import { colors } from '../../utils/colors';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function CompaniaDetailPage() {
  const params = useParams();
  const companiaId = params.id as string;
  const supabase = useSupabaseClient();
  const { selectedPeriodo, periodos } = usePeriod();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [compania, setCompania] = useState<any>(null);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [corredores, setCorredores] = useState<any[]>([]);
  
  useEffect(() => {
    async function loadCompaniaData() {
      if (!companiaId || !selectedPeriodo) return;
      
      try {
        setLoading(true);
        
        // 1. Cargar datos de la compañía
        const { data: companiaData, error: companiaError } = await supabase
          .from('vista_companias_periodo')
          .select('*')
          .eq('nombrecia', decodeURIComponent(companiaId))
          .eq('periodo', selectedPeriodo)
          .single();
          
        if (companiaError) throw companiaError;
        setCompania(companiaData);
        
        // 2. Cargar datos históricos
        const { data: historicalData, error: historicalError } = await supabase
          .from('vista_companias_periodo')
          .select('*')
          .eq('nombrecia', decodeURIComponent(companiaId))
          .order('periodo', { ascending: true });
          
        if (historicalError) throw historicalError;
        
        // Calcular crecimiento para cada período
        const dataWithGrowth = historicalData.map((item, index, arr) => {
          let crecimiento = null;
          if (index > 0 && arr[index-1].total_primauf > 0) {
            crecimiento = ((item.total_primauf - arr[index-1].total_primauf) / arr[index-1].total_primauf) * 100;
          }
          return {
            ...item,
            periodo: item.periodo,
            valor: item.total_primauf,
            crecimiento
          };
        });
        
        setHistoricalData(dataWithGrowth);
        
        // 3. Cargar corredores que trabajan con esta compañía
        const { data: corredoresData, error: corredoresError } = await supabase
          .from('intercia')
          .select('rut, nombrecia, periodo, primauf')
          .eq('nombrecia', decodeURIComponent(companiaId))
          .eq('periodo', selectedPeriodo)
          .order('primauf', { ascending: false });
          
        if (corredoresError) throw corredoresError;
        
        // Obtener nombres de corredores
        if (corredoresData && corredoresData.length > 0) {
          const ruts = corredoresData.map(c => c.rut);
          const { data: nombresData, error: nombresError } = await supabase
            .from('corredores')
            .select('rut, nombre')
            .in('rut', ruts);
            
          if (nombresError) throw nombresError;
          
          // Combinar datos
          const corredoresCompletos = corredoresData.map(corredor => {
            const nombreInfo = nombresData?.find(n => n.rut === corredor.rut);
            return {
              ...corredor,
              nombre: nombreInfo?.nombre || 'Corredor sin nombre',
              primauf: corredor.primauf || 0
            };
          });
          
          setCorredores(corredoresCompletos);
        } else {
          setCorredores([]);
        }
        
      } catch (err: any) {
        console.error('Error al cargar datos de compañía:', err);
        setError(err.message || 'Error al cargar datos');
      } finally {
        setLoading(false);
      }
    }
    
    loadCompaniaData();
  }, [supabase, companiaId, selectedPeriodo]);
  
  if (loading) return <LoadingSpinner />;
  if (error) return <NoData message={error} />;
  if (!compania) return <NoData message="No se encontró la compañía solicitada" />;
  
  // Columnas para la tabla de corredores
  const columnsCorredores = [
    {
      header: 'Corredor',
      accessor: 'nombre',
      width: 'w-2/3'
    },
    {
      header: 'Prima UF',
      accessor: 'primauf',
      isNumeric: true,
      formatter: (value: number) => formatUF(value, 2),
      width: 'w-1/3'
    }
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-4">
        <Link href="/dashboard/memoria-anual" className="text-blue-600 hover:text-blue-800">
          <ArrowLeft className="h-4 w-4 inline mr-1" />
          Volver
        </Link>
      </div>
      
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#0F3460]">
          {compania.nombrecia}
        </h1>
        <div className="text-sm text-gray-500">
          Período: <span className="font-semibold">{selectedPeriodo}</span>
        </div>
      </div>
      
      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          title="Prima Total UF"
          value={formatUF(compania.total_primauf)}
          trend={compania.crecimiento_uf}
          trendLabel="vs período anterior"
        />
        <SummaryCard
          title="Prima Total CLP"
          value={formatCLP(compania.total_primaclp)}
          trend={compania.crecimiento_clp}
          trendLabel="vs período anterior"
        />
        <SummaryCard
          title="Participación de Mercado"
          value={formatPercent(compania.participacion_uf || 0, 2)}
          trend={compania.variacion_uf_pp}
          trendLabel="puntos porcentuales"
        />
      </div>
      
      {/* Gráfico de evolución con doble eje */}
      <ChartDualAxis
        data={historicalData}
        title="Evolución de Prima y Crecimiento"
        subtitle="Prima UF y porcentaje de crecimiento por período"
        primaryColor={colors.companias.primary}
        secondaryColor={colors.status.info}
        valueLabel="Prima UF"
        growthLabel="Crecimiento %"
      />
      
      {/* Tabla de corredores */}
      <ModernCard title="Corredores que operan con esta compañía">
        {corredores.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {columnsCorredores.map((column, index) => (
                    <th
                      key={index}
                      scope="col"
                      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                        column.isNumeric ? 'text-right' : ''
                      } ${column.width || ''}`}
                    >
                      {column.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {corredores.map((corredor, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {corredor.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                      {formatUF(corredor.primauf, 2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50">
                  <td className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </td>
                  <td className="px-6 py-3 text-right text-xs font-medium text-gray-900 uppercase tracking-wider">
                    {formatUF(corredores.reduce((sum, c) => sum + c.primauf, 0), 2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-4">No hay corredores asociados a esta compañía</p>
        )}
      </ModernCard>
    </div>
  );
}