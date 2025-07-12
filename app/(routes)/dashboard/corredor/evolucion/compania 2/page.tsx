'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';
import ChartPrimaEvolution from '@/components/ui/charts/ChartPrimaEvolution';

interface EvolucionData {
  periodo: string;
  primaclp: number;
  primauf: number;
  participacion: number;
  crecimiento: number;
  mercado_primaclp: number;
  mercado_primauf: number;
  segmento_primaclp: number;
  segmento_primauf: number;
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

  useEffect(() => {
    async function loadAndProcessData() {
      if (!rut || (!compania && !rutcia)) return;
      
      console.log('🔍 Cargando datos para:', { rut, compania, rutcia });
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/reportes/${rut}?periodo=202412`);
        console.log('📡 Respuesta de la API:', response.status, response.statusText);
        
        if (!response.ok) {
          console.error('❌ Error en la respuesta:', response.status, response.statusText);
          if (response.status === 403) {
            throw new Error('No tienes acceso a este reporte. Debes comprarlo primero.');
          } else if (response.status === 404) {
            throw new Error('Reporte no encontrado.');
          } else {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
          }
        }
        
        const reportData = await response.json();
        console.log('📊 Datos completos recibidos:', reportData);
        
        // Acceder a la estructura correcta
        const reporteData = reportData.success ? reportData.reporte : reportData;
        if (!reporteData) {
          throw new Error('No se pudo obtener el reporte');
        }
        
        // Acceder directamente a las compañías
        const companiasArray = reporteData?.datos_reporte?.companias;
        
        if (!Array.isArray(companiasArray)) {
          throw new Error('No se encontró array de compañías válido en la estructura de datos');
        }
        
        console.log('📊 Total compañías recibidas:', companiasArray.length);
        
        // ✅ BUSCAR DIRECTAMENTE LA COMPAÑÍA ESPECÍFICA
        const companiaEspecifica = companiasArray.find((comp: any) => {
          if (rutcia) {
            return comp.rutcia === rutcia;
          }
          return comp.nombrecia === compania || comp.nombre === compania;
        });
        
        if (!companiaEspecifica) {
          throw new Error(`No se encontró la compañía con rutcia: ${rutcia} o nombre: ${compania}`);
        }
        
        console.log('🎯 Compañía encontrada:', {
          rutcia: companiaEspecifica.rutcia,
          nombrecia: companiaEspecifica.nombrecia,
          prima_clp: companiaEspecifica.prima_clp,
          prima_uf: companiaEspecifica.prima_uf,
          tiene_series_historicas: !!companiaEspecifica.series_historicas,
          cantidad_series: companiaEspecifica.series_historicas?.length || 0
        });
        
        const nombreCompania = companiaEspecifica.nombrecia || compania || rutcia;
        setCompaniaName(nombreCompania);
        
        // ✅ PROCESAR SERIES HISTÓRICAS DIRECTAMENTE
        if (companiaEspecifica.series_historicas && Array.isArray(companiaEspecifica.series_historicas)) {
          console.log('📈 Procesando series históricas:', companiaEspecifica.series_historicas);
          
          // Ordenar series por periodo (más antiguo primero)
          const seriesOrdenadas = [...companiaEspecifica.series_historicas].sort((a, b) => {
            return a.periodo.localeCompare(b.periodo);
          });
          
          // Calcular crecimiento y transformar datos
          const evolucionDataProcessed = seriesOrdenadas.map((serie: any, index: number) => {
            const prevSerie = index > 0 ? seriesOrdenadas[index - 1] : null;
            const crecimiento = prevSerie && prevSerie.prima_clp > 0 ? 
              ((serie.prima_clp - prevSerie.prima_clp) / prevSerie.prima_clp) * 100 : 0;
            
            return {
              periodo: serie.periodo,
              primaclp: serie.prima_clp || 0,
              primauf: serie.prima_uf || 0,
              participacion: (companiaEspecifica.participacion || 0) * 100,
              crecimiento,
              mercado_primaclp: (serie.prima_clp || 0) * 20, // Simulación del mercado
              mercado_primauf: (serie.prima_uf || 0) * 20,
              segmento_primaclp: (serie.prima_clp || 0) * 8, // Simulación del segmento
              segmento_primauf: (serie.prima_uf || 0) * 8
            };
          });
          
          console.log('✅ Datos de evolución procesados:', evolucionDataProcessed);
          setEvolucionData(evolucionDataProcessed);
        } else {
          // Fallback con datos actuales solamente
          console.log('⚠️ No se encontraron series históricas, usando solo datos actuales');
          const fallbackData = [{
            periodo: '202412',
            primaclp: companiaEspecifica.prima_clp || 0,
            primauf: companiaEspecifica.prima_uf || 0,
            participacion: (companiaEspecifica.participacion || 0) * 100,
            crecimiento: 0,
            mercado_primaclp: (companiaEspecifica.prima_clp || 0) * 20,
            mercado_primauf: (companiaEspecifica.prima_uf || 0) * 20,
            segmento_primaclp: (companiaEspecifica.prima_clp || 0) * 8,
            segmento_primauf: (companiaEspecifica.prima_uf || 0) * 8
          }];
          setEvolucionData(fallbackData);
        }
        
      } catch (err: any) {
        console.error('Error loading report data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    loadAndProcessData();
  }, [rut, compania, rutcia]); // ✅ DEPENDENCIAS ESTABLES

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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Prima Actual (CLP)</p>
                <p className="text-lg font-semibold">{formatCurrency(latestData.primaclp)}</p>
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
                <p className="text-lg font-semibold">{latestData.primauf.toLocaleString()} UF</p>
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
              total_clp: item.primaclp,
              total_uf: item.primauf
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
                  <div className="text-sm text-gray-600">Compañía: {formatCurrency(item.primaclp)}</div>
                  <div className="text-sm text-gray-600">Mercado: {formatCurrency(item.mercado_primaclp)}</div>
                  <div className="text-sm text-gray-600">Promedio Segmento: {formatCurrency(item.segmento_primaclp)}</div>
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
                  const marketShare = item.mercado_primaclp > 0 ? (item.primaclp / item.mercado_primaclp) * 100 : 0;
                  return (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">{item.periodo}</td>
                      <td className="px-4 py-4 text-sm text-gray-500">{formatCurrency(item.primaclp)}</td>
                      <td className="px-4 py-4 text-sm text-gray-500">{item.primauf.toLocaleString()} UF</td>
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

