'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import SummaryCard from '@/components/ui/charts/cards/SummaryCard';
import ModernCard from '@/components/ui/charts/cards/ModernCard';
// Cambiar esta importación
import DualAxisChart from '@/components/ui/charts/simplified/DualAxisChart';
import AccordeonTable from '@/components/ui/charts/AccordeonTable';
import LoadingSpinner from '@/components/ui/charts/LoadingSpinner';
import NoData from '@/components/ui/charts/NoData';
import { formatUF, formatCLP, formatPercent } from '@/lib/utils/formatters';
import { colors } from '@/lib/utils/colors';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { usePeriod } from '../../context/PeriodContext';

export default function CompaniaDetailPage() {
  const params = useParams();
  const companiaId = params.id as string;
  const supabase = createClientComponentClient();
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
          .eq('rutcia', decodeURIComponent(companiaId))
          .eq('periodo', selectedPeriodo)
          .single();
          
        if (companiaError) throw companiaError;
        
        // 2. Calcular participación de mercado
        const { data: totalMercado, error: totalError } = await supabase
          .from('vista_companias_periodo')
          .select('total_primauf')
          .eq('periodo', selectedPeriodo);
          
        if (totalError) throw totalError;
        
        const totalMercadoUF = totalMercado?.reduce((sum, item) => sum + (item.total_primauf || 0), 0) || 0;
        const participacionUF = totalMercadoUF > 0 ? (companiaData.total_primauf / totalMercadoUF) * 100 : 0;
        
        // 3. Calcular variación de participación vs período anterior
        let variacionUFPP = null;
        const periodoAnterior = periodos[periodos.indexOf(selectedPeriodo) - 1];
        
        if (periodoAnterior) {
          const { data: companiaAnterior } = await supabase
            .from('vista_companias_periodo')
            .select('total_primauf')
            .eq('rutcia', decodeURIComponent(companiaId))
            .eq('periodo', periodoAnterior)
            .single();
            
          const { data: totalMercadoAnterior } = await supabase
            .from('vista_companias_periodo')
            .select('total_primauf')
            .eq('periodo', periodoAnterior);
            
          if (companiaAnterior && totalMercadoAnterior) {
            const totalAnteriorUF = totalMercadoAnterior.reduce((sum, item) => sum + (item.total_primauf || 0), 0);
            const participacionAnterior = totalAnteriorUF > 0 ? (companiaAnterior.total_primauf / totalAnteriorUF) * 100 : 0;
            variacionUFPP = participacionUF - participacionAnterior;
          }
        }
        
        // Agregar campos calculados
        const companiaConParticipacion = {
          ...companiaData,
          participacion_uf: participacionUF,
          variacion_uf_pp: variacionUFPP
        };
        
        setCompania(companiaConParticipacion);
        
        // 2. Cargar datos históricos hasta el período seleccionado
        const { data: historicalData, error: historicalError } = await supabase
          .from('vista_companias_periodo')
          .select('*')
          .eq('rutcia', decodeURIComponent(companiaId))
          .lte('periodo', selectedPeriodo) // Solo períodos <= al seleccionado
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
          .select('rut, nombrecia, periodo, primauf, primaclp')
          .eq('rutcia', decodeURIComponent(companiaId))
          .eq('periodo', selectedPeriodo)
          .order('primauf', { ascending: false });
          
        if (corredoresError) throw corredoresError;
        
        // Obtener datos del período anterior para calcular crecimiento
        // Remove this line: const periodoAnterior = periodos[periodos.indexOf(selectedPeriodo) - 1];
        let corredoresAnterior: any[] = [];
        
        if (periodoAnterior) {
          const { data: corredoresAntData } = await supabase
            .from('intercia')
            .select('rut, primauf, primaclp')
            .eq('rutcia', decodeURIComponent(companiaId))
            .eq('periodo', periodoAnterior);
          corredoresAnterior = corredoresAntData || [];
        }
        
        // Obtener nombres de corredores
        if (corredoresData && corredoresData.length > 0) {
          const ruts = corredoresData.map(c => c.rut);
          const { data: nombresData, error: nombresError } = await supabase
            .from('corredores')
            .select('rut, nombre')
            .in('rut', ruts);
            
          if (nombresError) throw nombresError;
          
          // Combinar datos y calcular crecimiento
          const corredoresCompletos = corredoresData.map(corredor => {
            const nombreInfo = nombresData?.find(n => n.rut === corredor.rut);
            const anteriorInfo = corredoresAnterior.find(c => c.rut === corredor.rut);
            
            // Calcular crecimiento UF
            let crecimientoUF = null;
            if (anteriorInfo && anteriorInfo.primauf > 0) {
              crecimientoUF = ((corredor.primauf - anteriorInfo.primauf) / anteriorInfo.primauf) * 100;
            }
            
            // Calcular crecimiento CLP (este es el que se mostrará en la tabla)
            let crecimientoCLP = null;
            if (anteriorInfo && anteriorInfo.primaclp > 0) {
              crecimientoCLP = ((corredor.primaclp - anteriorInfo.primaclp) / anteriorInfo.primaclp) * 100;
            }
            
            return {
              ...corredor,
              nombre: nombreInfo?.nombre || 'Corredor sin nombre',
              primauf: corredor.primauf || 0,
              primaclp: corredor.primaclp || 0,
              crecimientoUF,
              crecimientoCLP
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
      width: 'w-2/5'
    },
    {
      header: 'Prima UF',
      accessor: 'primauf',
      isNumeric: true,
      formatter: (value: number) => formatUF(value, 2),
      width: 'w-1/5'
    },
    {
      header: 'Prima CLP (Millones)',
      accessor: 'primaclp',
      isNumeric: true,
      formatter: (value: number) => formatCLP(value / 1000, true, 0), // Fix: add includeSymbol parameter
      width: 'w-1/5'
    },
    {
      header: 'Crecimiento CLP',
      accessor: 'crecimientoCLP', // Cambiar de crecimientoUF a crecimientoCLP
      isNumeric: true,
      formatter: (value: number | null) => {
        if (value === null || value === undefined) return '-';
        const formatted = value.toFixed(1) + '%';
        return value >= 0 ? `+${formatted}` : formatted;
      },
      width: 'w-1/10'
    }
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-4">
        <Link 
          href="/dashboard/memoria-anual?section=companias"
          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver a Compañías
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
          trend={typeof compania.crecimiento_uf === 'number' ? compania.crecimiento_uf : undefined}
          trendLabel="vs período anterior"
        />
        <SummaryCard
          title="Prima Total CLP"
          value={formatCLP(compania.total_primaclp)}
          trend={typeof compania.crecimiento_clp === 'number' ? compania.crecimiento_clp : undefined}
          trendLabel="vs período anterior"
        />
        <SummaryCard
          title="Participación de Mercado"
          value={formatPercent(compania.participacion_uf || 0, 2)}
          trend={typeof compania.variacion_uf_pp === 'number' ? compania.variacion_uf_pp : undefined}
          trendLabel="puntos porcentuales"
        />
      </div>
      
      {/* Gráfico de evolución con doble eje */}
      <DualAxisChart
        data={historicalData.map(item => ({
          ...item,
          valor: item.total_primaclp, // Usar CLP en lugar de UF
          crecimiento: item.crecimiento
        }))}
        xAxisKey="periodo"
        title="Evolución de Prima CLP y Crecimiento"
        subtitle="Prima CLP y porcentaje de crecimiento por período"
        Y1dataKey="valor"
        Y1valueLabel="Prima CLP"
        Y1valueType="CLP"
        Y1color={colors.companias.primary}
        Y2dataKey="crecimiento"
        Y2valueLabel="Crecimiento"
        Y2valueType="PERCENT"
        Y2color={colors.status.info}
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
                      {formatUF(corredor.primauf, 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                      {formatCLP(corredor.primaclp / 1000, true, 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      {corredor.crecimientoCLP !== null && corredor.crecimientoCLP !== undefined ? (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          corredor.crecimientoCLP >= 0 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {corredor.crecimientoCLP >= 0 ? '+' : ''}{corredor.crecimientoCLP.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
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
                    {formatUF(corredores.reduce((sum, c) => sum + c.primauf, 0), 0)}
                  </td>
                  <td className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    -
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