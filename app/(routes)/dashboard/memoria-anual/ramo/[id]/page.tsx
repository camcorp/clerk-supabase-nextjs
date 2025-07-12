'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { usePeriod } from '../../context/PeriodContext';
import SummaryCard from '@/app/components/ui/charts/SummaryCard';
import ModernCard from '@/app/components/ui/charts/ModernCard';
import ChartDualAxis from '@/app/components/ui/charts/common/ChartDualAxis';
import LoadingSpinner from '@/app/components/ui/charts/LoadingSpinner';
import NoData from '@/app/components/ui/charts/NoData';
import { formatUF, formatCLP, formatPercent } from '@/lib/utils/formatters';
import { colors } from '@/app/lib/utils/colors';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function RamoDetailPage() {
  const params = useParams();
  const ramoId = params.id as string;
  const supabase = createClientComponentClient();
  const { selectedPeriodo, periodos } = usePeriod();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ramo, setRamo] = useState<any>(null);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [companias, setCompanias] = useState<any[]>([]);
  
  useEffect(() => {
    async function loadRamoData() {
      if (!ramoId || !selectedPeriodo) return;
      
      try {
        setLoading(true);
        
        // 1. Cargar datos del ramo
        const ramoIdDecoded = decodeURIComponent(ramoId);
        console.log('ID del ramo decodificado:', ramoIdDecoded);
        
        // Extraer el código del ramo
        // En lugar de extraer solo una parte, usar el ID completo
        // const parts = ramoIdDecoded.split('-');
        // const codRamo = parts[1];
        const codRamo = ramoIdDecoded; // Usar el ID completo
        console.log('Código del ramo extraído:', codRamo);
        
        // Intentar buscar por el campo 'cod' que es el código del ramo
        const { data: ramoData, error: ramoError } = await supabase
          .from('vista_ramos_periodo')
          .select('*')
          .eq('cod', codRamo)
          .eq('periodo', selectedPeriodo)
          .single();
          
        if (ramoError) throw ramoError;
        setRamo(ramoData);
        
        // 2. Cargar datos históricos
        const { data: historicalData, error: historicalError } = await supabase
          .from('vista_ramos_periodo')
          .select('*')
          .eq('cod', codRamo)
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
        
        // 3. Cargar compañías que operan en este ramo
        const { data: companiasData, error: companiasError } = await supabase
          .from('ranking_ramos')
          .select('rut, primaclp')
          .eq('ramo_cod', codRamo) // Usar directamente el código extraído
          .eq('periodo', selectedPeriodo)
          .order('primaclp', { ascending: false });
          
        console.log('Consulta de compañías para ramo_cod:', codRamo);
          
        if (companiasError) throw companiasError;
        
        // Obtener nombres de compañías
        if (companiasData && companiasData.length > 0) {
          const ruts = companiasData.map(c => c.rut);
          const { data: nombresData, error: nombresError } = await supabase
            .from('vista_companias_periodo')
            .select('rutcia, nombrecia')
            .in('rutcia', ruts)
            .eq('periodo', selectedPeriodo);
            
          if (nombresError) throw nombresError;
          
          // Combinar datos
          const companiasCompletas = companiasData.map(compania => {
            const nombreInfo = nombresData?.find(n => n.rutcia === compania.rut);
            return {
              ...compania,
              nombrecia: nombreInfo?.nombrecia || 'Compañía sin nombre',
              primaclp: compania.primaclp || 0,
              primauf: compania.primaclp / 30000 // Conversión aproximada a UF
            };
          });
          
          setCompanias(companiasCompletas);
        } else {
          setCompanias([]);
        }
        
      } catch (err: any) {
        console.error('Error al cargar datos del ramo:', err);
        // Proporcionar un mensaje de error más descriptivo
        setError(`Error al cargar datos del ramo: ${JSON.stringify(err.message || err)}`);
      } finally {
        setLoading(false);
      }
    }
    
    loadRamoData();
  }, [supabase, ramoId, selectedPeriodo]);
  
  if (loading) return <LoadingSpinner />;
  if (error) return <NoData message={error} />;
  if (!ramo) return <NoData message="No se encontró el ramo solicitado" />;
  
  // Columnas para la tabla de compañías
  const columnsCompanias = [
    {
      header: 'Compañía',
      accessor: 'nombrecia',
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
          {ramo.ramo}
        </h1>
        <div className="text-sm text-gray-500">
          Período: <span className="font-semibold">{selectedPeriodo}</span>
        </div>
      </div>
      
      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          title="Prima Total UF"
          value={formatUF(ramo.total_primauf)}
          trend={ramo.crecimiento_clp} // Usamos crecimiento_clp como aproximación
          trendLabel="vs período anterior"
        />
        <SummaryCard
          title="Prima Total CLP"
          value={formatCLP(ramo.total_primaclp)}
          trend={ramo.crecimiento_clp}
          trendLabel="vs período anterior"
        />
        <SummaryCard
          title="Participación de Mercado"
          value={formatPercent(ramo.participacion_clp || 0, 2)}
          trend={ramo.variacion_clp_pp}
          trendLabel="puntos porcentuales"
        />
      </div>
      
      {/* Gráfico de evolución con doble eje */}
      <ChartDualAxis
        data={historicalData}
        title="Evolución de Prima y Crecimiento"
        subtitle="Prima UF y porcentaje de crecimiento por período"
        primaryColor={colors.ramos.primary}
        secondaryColor={colors.status.info}
        valueLabel="Prima UF"
        growthLabel="Crecimiento %"
      />
      
      {/* Tabla de compañías */}
      <ModernCard title="Compañías que operan en este ramo">
        {companias.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {columnsCompanias.map((column, index) => (
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
                {companias.map((compania, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {compania.nombrecia}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                      {formatUF(compania.primauf, 2)}
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
                    {formatUF(companias.reduce((sum, c) => sum + c.primauf, 0), 2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-4">No hay compañías asociadas a este ramo</p>
        )}
      </ModernCard>
    </div>
  );
}