'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';
import ChartPrimaEvolution from '@/components/ui/charts/ChartPrimaEvolution';

import { useSeriesHistoricasAgrupadas, useSeriesHistoricasExpandidas } from '@/app/hooks/useSeriesHistoricasAgrupadas';

interface EvolucionData {
  periodo: string;
  prima_clp: number;  // ✅ Cambiado de primaclp a prima_clp
  prima_uf: number;   // ✅ Cambiado de primauf a prima_uf
  participacion: number;
  crecimiento: number;
  mercado_prima_clp: number;  // ✅ Cambiado de mercado_primaclp
  mercado_prima_uf: number;   // ✅ Cambiado de mercado_primauf
  segmento_prima_clp: number; // ✅ Cambiado de segmento_primaclp
  segmento_prima_uf: number;  // ✅ Cambiado de segmento_primauf
}

function EvolucionCompaniaContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rut = searchParams.get('rut');
  const compania = searchParams.get('compania');
  const rutcia = searchParams.get('rutcia');
  const [evolucionData, setEvolucionData] = useState<EvolucionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companiaName, setCompaniaName] = useState<string>('');
  const [rawCompanias, setRawCompanias] = useState<any[]>([]);

  // ✅ USAR LOS HOOKS EN EL NIVEL SUPERIOR
  const companiasConSeries = useSeriesHistoricasAgrupadas(rawCompanias);
  const seriesExpandidas = useSeriesHistoricasExpandidas(companiasConSeries);

  useEffect(() => {
    async function loadReportData() {
      if (!rut || !rutcia) return;
      
      console.log('🔍 Cargando datos de evolución para:', { rut, rutcia });
      
      try {
        setLoading(true);
        
        // Primero intentar obtener datos procesados de sessionStorage
        const datosGuardados = sessionStorage.getItem('evolucion_data');
        if (datosGuardados) {
          console.log('📦 Usando datos procesados de sessionStorage');
          const datosParseados = JSON.parse(datosGuardados);
          
          if (datosParseados.rutcia === rutcia && datosParseados.datos) {
            setCompaniaName(datosParseados.nombrecia);
            
            // Calcular crecimiento en los datos
            const datosConCrecimiento = datosParseados.datos.map((item: any, index: number) => {
              if (index > 0) {
                const actual = item.prima_clp;
                const anterior = datosParseados.datos[index - 1].prima_clp;
                if (anterior > 0) {
                  item.crecimiento = ((actual - anterior) / anterior) * 100;
                }
              }
              return item;
            });
            
            setEvolucionData(datosConCrecimiento);
            // Limpiar sessionStorage después de usar
            sessionStorage.removeItem('evolucion_data');
            setLoading(false);
            return;
          }
        }
        
        // Fallback: cargar desde API si no hay datos en sessionStorage
        console.log('📡 Cargando desde API como fallback');
        const response = await fetch(`/api/reportes/${rut}?periodo=202412`);
        
        if (!response.ok) {
          if (response.status === 403) {
            throw new Error('No tienes acceso a este reporte. Debes comprarlo primero.');
          } else if (response.status === 404) {
            throw new Error('Reporte no encontrado.');
          } else {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
          }
        }
        
        const reportData = await response.json();
        const datosReporte = reportData.success ? reportData.reporte?.datos_reporte : reportData.datos_reporte;
        
        if (!datosReporte || !datosReporte.companias) {
          throw new Error('No se encontró estructura de datos válida');
        }
        
        // Buscar la compañía específica
        const companiaData = datosReporte.companias.find((comp: any) => comp.rutcia === rutcia);
        
        if (companiaData) {
          setCompaniaName(companiaData.nombrecia);
          
          // Procesar series históricas o usar fallback
          if (companiaData.series_historicas && companiaData.series_historicas.length > 0) {
            const evolucionDataProcessed = companiaData.series_historicas.map((item: any) => ({
              periodo: item.periodo,
              prima_clp: item.prima_clp || 0,
              prima_uf: item.prima_uf || 0,
              participacion: 0,
              crecimiento: 0,
              mercado_prima_clp: (item.prima_clp || 0) * 20,
              mercado_prima_uf: (item.prima_uf || 0) * 20,
              segmento_prima_clp: (item.prima_clp || 0) * 8,
              segmento_prima_uf: (item.prima_uf || 0) * 8
            }));
            
            // Calcular crecimiento
            for (let i = 1; i < evolucionDataProcessed.length; i++) {
              const actual = evolucionDataProcessed[i].prima_clp;
              const anterior = evolucionDataProcessed[i - 1].prima_clp;
              if (anterior > 0) {
                evolucionDataProcessed[i].crecimiento = ((actual - anterior) / anterior) * 100;
              }
            }
            
            setEvolucionData(evolucionDataProcessed);
          } else {
            // Fallback con datos actuales
            const fallbackData = [{
              periodo: '202412',
              prima_clp: companiaData.prima_clp || companiaData.primaclp || 0,
              prima_uf: companiaData.prima_uf || companiaData.primauf || 0,
              participacion: 0,
              crecimiento: 0,
              mercado_prima_clp: (companiaData.prima_clp || companiaData.primaclp || 0) * 20,
              mercado_prima_uf: (companiaData.prima_uf || companiaData.primauf || 0) * 20,
              segmento_prima_clp: (companiaData.prima_clp || companiaData.primaclp || 0) * 8,
              segmento_prima_uf: (companiaData.prima_uf || companiaData.primauf || 0) * 8
            }];
            setEvolucionData(fallbackData);
          }
        } else {
          setError(`No se encontró la compañía con rutcia: ${rutcia}`);
        }
      } catch (err: any) {
        console.error('Error loading report data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    loadReportData();
  }, [rut, rutcia]);

  // ✅ PROCESAR LOS DATOS CUANDO LOS HOOKS HAYAN TERMINADO
  useEffect(() => {
    if (companiasConSeries.length > 0 && (compania || rutcia)) {
      const companiaData = companiasConSeries.find(
        (comp: any) => {
          if (rutcia) {
            return comp.rutcia === rutcia;
          }
          return comp.nombrecia === compania || comp.nombre === compania;
        }
      );
      
      if (companiaData) {
        const nombreCompania = companiaData.nombrecia || compania || rutcia;
        setCompaniaName(nombreCompania);
        
        // Filtrar las series expandidas para esta compañía específica
        const seriesDeEstaCompania = seriesExpandidas.filter(
          (item: any) => item.rutcia === companiaData.rutcia
        );
        
        if (seriesDeEstaCompania.length > 0) {
          // En el useEffect donde se procesan los datos
          const evolucionDataProcessed = seriesDeEstaCompania.map((item: any) => ({
            periodo: item.periodo,
            prima_clp: item.prima_clp_periodo || 0,  // ✅ Mantener prima_clp
            prima_uf: item.prima_uf_periodo || 0,    // ✅ Mantener prima_uf
            participacion: (item.participacion || 0) * 100,
            crecimiento: item.crecimiento,
            mercado_prima_clp: (item.prima_clp_periodo || 0) * 20,  // ✅ Nomenclatura consistente
            mercado_prima_uf: (item.prima_uf_periodo || 0) * 20,    // ✅ Nomenclatura consistente
            segmento_prima_clp: (item.prima_clp_periodo || 0) * 8,  // ✅ Nomenclatura consistente
            segmento_prima_uf: (item.prima_uf_periodo || 0) * 8     // ✅ Nomenclatura consistente
          }));
          
          // Ordenar por periodo (más antiguo primero)
          evolucionDataProcessed.sort((a, b) => {
            const yearA = parseInt(a.periodo);
            const yearB = parseInt(b.periodo);
            return yearA - yearB;
          });
          
          setEvolucionData(evolucionDataProcessed);
        } else {
          // Fallback con datos actuales
          console.log('⚠️ No se encontraron series históricas, usando solo datos actuales');
          const fallbackData = [{
            periodo: '202412',
            prima_clp: companiaData.prima_clp || 0,  // ✅ Usar prima_clp directamente
            prima_uf: companiaData.prima_uf || 0,    // ✅ Usar prima_uf directamente
            participacion: (companiaData.participacion || 0) * 100,
            crecimiento: 0,
            mercado_prima_clp: (companiaData.prima_clp || 0) * 20,  // ✅ Nomenclatura consistente
            mercado_prima_uf: (companiaData.prima_uf || 0) * 20,    // ✅ Nomenclatura consistente
            segmento_prima_clp: (companiaData.prima_clp || 0) * 8,  // ✅ Nomenclatura consistente
            segmento_prima_uf: (companiaData.prima_uf || 0) * 8     // ✅ Nomenclatura consistente
          }];
          setEvolucionData(fallbackData);
        }
      } else {
        setError(`No se encontró la compañía con rutcia: ${rutcia} o nombre: ${compania}`);
      }
    }
  }, [companiasConSeries, seriesExpandidas, compania, rutcia]);

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Cargando evolución de {companiaName || compania}...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    );
  }

  const latestData = evolucionData[evolucionData.length - 1];
  if (!latestData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">No hay datos disponibles para {companiaName || compania}</div>
      </div>
    );
  }

  const displayName = companiaName || compania || rutcia;

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver al reporte
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Evolución de {displayName}
            </h1>
            <p className="text-gray-600">RUT: {rut} | RUT CIA: {rutcia}</p>
          </div>
        </div>
      </div>

      {/* Summary Cards - MANTENIDAS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Prima Actual (CLP)</p>
                <p className="text-lg font-semibold">{formatCurrency(latestData.prima_clp)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Prima Actual (UF)</p>
                <p className="text-lg font-semibold">{latestData.prima_uf.toLocaleString()} UF</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Participación</p>
                <p className="text-lg font-semibold">{formatPercentage(latestData.participacion)}</p>
              </div>
              <Badge variant="info">{formatPercentage(latestData.participacion)}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Crecimiento</p>
                <p className={`text-lg font-semibold ${getGrowthColor(latestData.crecimiento)}`}>
                  {formatPercentage(latestData.crecimiento)}
                </p>
              </div>
              {latestData.crecimiento >= 0 ? 
                <TrendingUp className="w-8 h-8 text-green-500" /> : 
                <TrendingDown className="w-8 h-8 text-red-500" />
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Evolution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Evolución Prima - {displayName}</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartPrimaEvolution 
            data={evolucionData.map(item => ({
              periodo: item.periodo,
              total_clp: item.prima_clp,  // ✅ Usar prima_clp
              total_uf: item.prima_uf     // ✅ Usar prima_uf
            }))}
            periodos={evolucionData.map(item => item.periodo)}
            valueField="total_clp"
            growthField="crecimiento"
            color="#1A7F8E"
            showTitle={false}
          />
        </CardContent>
      </Card>

      {/* Market Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Comparación con Mercado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {evolucionData.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="font-medium">{item.periodo}</span>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Compañía: {formatCurrency(item.prima_clp)}</div>
                  <div className="text-sm text-gray-600">Mercado: {formatCurrency(item.mercado_prima_clp)}</div>
                  <div className="text-sm text-gray-600">Promedio Segmento: {formatCurrency(item.segmento_prima_clp)}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Evolution Table */}
      <Card>
        <CardHeader>
          <CardTitle>Evolución Detallada</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Período</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prima CLP</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prima UF</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Participación</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Crecimiento</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">vs Mercado</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {evolucionData.map((item, index) => {
                  const marketShare = item.mercado_prima_clp > 0 ? (item.prima_clp / item.mercado_prima_clp) * 100 : 0;
                  return (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">{item.periodo}</td>
                      <td className="px-4 py-4 text-sm text-gray-500">{formatCurrency(item.prima_clp)}</td>
                      <td className="px-4 py-4 text-sm text-gray-500">{item.prima_uf.toLocaleString()} UF</td>
                      <td className="px-4 py-4 text-sm text-gray-500">{formatPercentage(item.participacion)}</td>
                      <td className={`px-4 py-4 text-sm ${getGrowthColor(item.crecimiento)}`}>
                        {formatPercentage(item.crecimiento)}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">{formatPercentage(marketShare)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function EvolucionCompaniaPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EvolucionCompaniaContent />
    </Suspense>
  );
}

const processEvolucionData = (reportData: any): EvolucionData[] => {
  console.log('🔍 Estructura datos_reporte:', reportData.reporte?.datos_reporte);
  
  // Acceso directo a reportData.companias
  const companias = reportData.reporte?.datos_reporte?.reportData?.companias || [];
  
  console.log(`📊 COMPANIAS encontradas: ${companias.length}`);
  console.log('📊 Compañías disponibles:', companias.length);
  
  return companias.map((comp: any, index: number) => {
    console.log(`📊 Compañía ${index + 1}:`, {
      rutcia: comp.rutcia,
      nombrecia: comp.nombrecia,
      prima_clp: comp.prima_clp,
      prima_uf: comp.prima_uf,
      tiene_series_historicas: !!comp.series_historicas,
      cantidad_series: comp.series_historicas?.length || 0
    });
    
    if (comp.series_historicas) {
      console.log(`  📈 Series históricas:`, comp.series_historicas);
    } else {
      console.log(`  ❌ ${comp.nombrecia} NO tiene series_historicas`);
    }

    // Procesar series históricas directamente
    const seriesData = comp.series_historicas || [];
    const periodos = seriesData.map((s: any) => s.periodo).sort();
    
    return {
      compania: comp.nombrecia,
      rut: comp.rutcia,
      primaActualCLP: comp.prima_clp || 0,
      primaActualUF: comp.prima_uf || 0,
      participacion: comp.participacion || 0,
      ranking: comp.ranking || 0,
      crecimiento: seriesData.length >= 2 ? 
        ((seriesData[0]?.prima_uf - seriesData[1]?.prima_uf) / seriesData[1]?.prima_uf * 100) || 0 : 0,
      periodos,
      seriesHistoricas: seriesData.map((s: any) => ({
        periodo: s.periodo,
        prima_clp: s.prima_clp || 0,
        prima_uf: s.prima_uf || 0
      }))
    };
  }).filter(comp => comp.seriesHistoricas.length > 0);
};

