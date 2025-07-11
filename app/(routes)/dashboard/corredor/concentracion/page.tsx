'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import ChartHHIEvolution from '@/components/ui/charts/ChartHHIEvolution';
import ChartPrimaEvolution from '@/components/ui/charts/ChartPrimaEvolution';

interface ConcentracionData {
  periodo: string;
  hhi_companias: number;
  hhi_ramos: number;
  top3_companias_participacion: number;
  top5_ramos_participacion: number;
  mercado_hhi_companias: number;
  mercado_hhi_ramos: number;
  segmento_hhi_companias: number;
  segmento_hhi_ramos: number;
}

interface CompaniaEvolucion {
  compania: string;
  data: Array<{
    periodo: string;
    total_clp: number;
    total_uf: number;
  }>;
}

function ConcentracionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rut = searchParams.get('rut');
  const [concentracionData, setConcentracionData] = useState<ConcentracionData[]>([]);
  const [companiasEvolucion, setCompaniasEvolucion] = useState<CompaniaEvolucion[]>([]);
  const [selectedCompania, setSelectedCompania] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular datos de concentración
    const mockConcentracion: ConcentracionData[] = [
      {
        periodo: '2020',
        hhi_companias: 2850,
        hhi_ramos: 2200,
        top3_companias_participacion: 72.5,
        top5_ramos_participacion: 87.3,
        mercado_hhi_companias: 1850,
        mercado_hhi_ramos: 1650,
        segmento_hhi_companias: 3200,
        segmento_hhi_ramos: 2800
      },
      // ... rest of mock data
    ];

    const mockCompaniasEvolucion: CompaniaEvolucion[] = [
      {
        compania: 'Compañía A',
        data: [
          { periodo: '2020', total_clp: 15000000000, total_uf: 500000 },
          { periodo: '2021', total_clp: 18000000000, total_uf: 580000 },
          { periodo: '2022', total_clp: 22000000000, total_uf: 650000 },
          { periodo: '2023', total_clp: 25000000000, total_uf: 720000 }
        ]
      },
      // ... rest of mock data
    ];

    setConcentracionData(mockConcentracion);
    setCompaniasEvolucion(mockCompaniasEvolucion);
    setSelectedCompania(mockCompaniasEvolucion[0]?.compania || '');
    setLoading(false);
  }, [rut]);

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  const getConcentrationLevel = (hhi: number) => {
    if (hhi < 1500) return { level: 'Baja', color: 'text-green-600', bg: 'bg-green-50' };
    if (hhi < 2500) return { level: 'Moderada', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { level: 'Alta', color: 'text-red-600', bg: 'bg-red-50' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Cargando análisis de concentración...</div>
      </div>
    );
  }

  const latestData = concentracionData[concentracionData.length - 1];
  const companiaConcentration = getConcentrationLevel(latestData.hhi_companias);
  const ramoConcentration = getConcentrationLevel(latestData.hhi_ramos);
  const selectedCompaniaData = companiasEvolucion.find(c => c.compania === selectedCompania);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="flex items-center text-[#0F3460] hover:text-[#0F3460]/80"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Volver
          </button>
          <h1 className="text-2xl font-bold text-[#0F3460]">
            Análisis de Concentración - RUT: {rut}
          </h1>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">HHI Compañías</p>
                <p className="text-lg font-semibold">{latestData.hhi_companias}</p>
                <Badge className={`${companiaConcentration.bg} ${companiaConcentration.color} text-xs`}>
                  {companiaConcentration.level}
                </Badge>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">HHI Ramos</p>
                <p className="text-lg font-semibold">{latestData.hhi_ramos}</p>
                <Badge className={`${ramoConcentration.bg} ${ramoConcentration.color} text-xs`}>
                  {ramoConcentration.level}
                </Badge>
              </div>
              <BarChart3 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Top 3 Compañías</p>
                <p className="text-lg font-semibold">{formatPercentage(latestData.top3_companias_participacion)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Top 5 Ramos</p>
                <p className="text-lg font-semibold">{formatPercentage(latestData.top5_ramos_participacion)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Market Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Comparación con Mercado y Segmento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Concentración de Compañías (HHI)</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                  <span className="font-medium">Corredor</span>
                  <span className="font-bold text-blue-700">{latestData.hhi_companias}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium">Mercado</span>
                  <span className="font-bold text-gray-700">{latestData.mercado_hhi_companias}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                  <span className="font-medium">Segmento</span>
                  <span className="font-bold text-purple-700">{latestData.segmento_hhi_companias}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Concentración de Ramos (HHI)</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                  <span className="font-medium">Corredor</span>
                  <span className="font-bold text-green-700">{latestData.hhi_ramos}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium">Mercado</span>
                  <span className="font-bold text-gray-700">{latestData.mercado_hhi_ramos}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                  <span className="font-medium">Segmento</span>
                  <span className="font-bold text-purple-700">{latestData.segmento_hhi_ramos}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* HHI Evolution Charts */}
      <Card>
        <CardHeader>
          <CardTitle>Evolución HHI - Concentración por Compañías</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartHHIEvolution 
            data={concentracionData.map(item => ({
              periodo: item.periodo,
              hhi_general: item.hhi_companias,
              hhi: item.hhi_companias,
              mercado_hhi: item.mercado_hhi_companias,
              segmento_hhi: item.segmento_hhi_companias
            }))}
            showTitle={false}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Evolución HHI - Concentración por Ramos</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartHHIEvolution 
            data={concentracionData.map(item => ({
              periodo: item.periodo,
              hhi_general: item.hhi_ramos,
              hhi: item.hhi_ramos,
              mercado_hhi: item.mercado_hhi_ramos,
              segmento_hhi: item.segmento_hhi_ramos
            }))}
            showTitle={false}
          />
        </CardContent>
      </Card>

      {/* Company Evolution */}
      <Card>
        <CardHeader>
          <CardTitle>Evolución Prima por Compañía - {selectedCompania}</CardTitle>
          <div className="flex flex-wrap gap-2 mt-2">
            {companiasEvolucion.map((compania) => (
              <button
                key={compania.compania}
                onClick={() => setSelectedCompania(compania.compania)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  selectedCompania === compania.compania
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {compania.compania}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {selectedCompaniaData && (
            <ChartPrimaEvolution 
              data={selectedCompaniaData.data}
              periodos={['2020', '2021', '2022', '2023']}
              valueField="total_clp"
              growthField="crecimiento"
              color="#1A7F8E"
              showTitle={false}
            />
          )}
        </CardContent>
      </Card>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Evolución Detallada de Concentración</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Período</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">HHI Compañías</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">HHI Ramos</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Top 3 Compañías</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Top 5 Ramos</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {concentracionData.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">{item.periodo}</td>
                    <td className="px-4 py-4 text-sm text-gray-500">{item.hhi_companias}</td>
                    <td className="px-4 py-4 text-sm text-gray-500">{item.hhi_ramos}</td>
                    <td className="px-4 py-4 text-sm text-gray-500">{formatPercentage(item.top3_companias_participacion)}</td>
                    <td className="px-4 py-4 text-sm text-gray-500">{formatPercentage(item.top5_ramos_participacion)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ConcentracionPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConcentracionContent />
    </Suspense>
  );
}