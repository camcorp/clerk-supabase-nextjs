'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';
import ChartPrimaEvolution from '@/components/ui/charts/ChartPrimaEvolution';

interface EvolucionRamoData {
  periodo: string;
  primaclp: number;
  primauf: number;
  participacion: number;
  crecimiento: number;
  mercado_primaclp: number;
  mercado_primauf: number;
  segmento_primaclp: number;
  segmento_primauf: number;
  total_clp: number;
  total_uf: number;
}

function EvolucionRamoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rut = searchParams.get('rut');
  const ramo = searchParams.get('ramo');
  const [evolucionData, setEvolucionData] = useState<EvolucionRamoData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular datos de evolución para el ramo
    const mockData: EvolucionRamoData[] = [
      {
        periodo: '2020',
        primaclp: 28000000,
        primauf: 950,
        participacion: 18.5,
        crecimiento: 12.5,
        mercado_primaclp: 1800000000,
        mercado_primauf: 61000,
        segmento_primaclp: 320000000,
        segmento_primauf: 10800,
        total_clp: 28000000,
        total_uf: 950
      },
      {
        periodo: '2021',
        primaclp: 32000000,
        primauf: 1065,
        participacion: 19.8,
        crecimiento: 14.3,
        mercado_primaclp: 2000000000,
        mercado_primauf: 66500,
        segmento_primaclp: 355000000,
        segmento_primauf: 11800,
        total_clp: 32000000,
        total_uf: 1065
      },
      {
        periodo: '2022',
        primaclp: 36500000,
        primauf: 1180,
        participacion: 21.2,
        crecimiento: 14.1,
        mercado_primaclp: 2200000000,
        mercado_primauf: 71000,
        segmento_primaclp: 385000000,
        segmento_primauf: 12500,
        total_clp: 36500000,
        total_uf: 1180
      },
      {
        periodo: '2023',
        primaclp: 41800000,
        primauf: 1295,
        participacion: 22.8,
        crecimiento: 14.5,
        mercado_primaclp: 2450000000,
        mercado_primauf: 75500,
        segmento_primaclp: 420000000,
        segmento_primauf: 13200,
        total_clp: 41800000,
        total_uf: 1295
      }
    ];

    setEvolucionData(mockData);
    setLoading(false);
  }, [rut, ramo]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatUF = (value: number) => {
    return new Intl.NumberFormat('es-CL', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value) + ' UF';
  };

  const formatPercentage = (value: number) => {
    return value.toFixed(1) + '%';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#0F3460]"></div>
      </div>
    );
  }

  const latestData = evolucionData[evolucionData.length - 1];
  const previousData = evolucionData[evolucionData.length - 2];
  const participacionChange = latestData && previousData ? 
    latestData.participacion - previousData.participacion : 0;
  const crecimientoChange = latestData && previousData ? 
    latestData.crecimiento - previousData.crecimiento : 0;

  return (
    <div className="space-y-6">
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
            Evolución por Ramo - {ramo}
          </h1>
        </div>
      </div>

      {/* Información del Corredor */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-[#0F3460]">Información del Corredor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">RUT</p>
              <p className="font-semibold">{rut}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Ramo</p>
              <p className="font-semibold">{ramo}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Prima Total (CLP)</p>
                <p className="text-2xl font-bold text-[#0F3460]">
                  {latestData ? formatCurrency(latestData.primaclp) : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Prima Total (UF)</p>
                <p className="text-2xl font-bold text-[#0F3460]">
                  {latestData ? formatUF(latestData.primauf) : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Participación</p>
                <p className="text-2xl font-bold text-[#0F3460]">
                  {latestData ? formatPercentage(latestData.participacion) : 'N/A'}
                </p>
              </div>
              <div className="flex items-center">
                {participacionChange > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <Badge 
                  variant={participacionChange > 0 ? "success" : "danger"}
                  className="ml-2"
                >
                  {participacionChange > 0 ? '+' : ''}{formatPercentage(participacionChange)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Crecimiento</p>
                <p className="text-2xl font-bold text-[#0F3460]">
                  {latestData ? formatPercentage(latestData.crecimiento) : 'N/A'}
                </p>
              </div>
              <div className="flex items-center">
                {crecimientoChange > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <Badge 
                  variant={crecimientoChange > 0 ? "success" : "danger"}
                  className="ml-2"
                >
                  {crecimientoChange > 0 ? '+' : ''}{formatPercentage(crecimientoChange)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Evolución */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-[#0F3460]">Evolución de Primas</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartPrimaEvolution 
            data={evolucionData}
            periodos={evolucionData.map(d => d.periodo)}
            valueField="total_clp"
            growthField="crecimiento"
            color="#0F3460"
          />
        </CardContent>
      </Card>

      {/* Tabla de Datos Históricos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-[#0F3460]">Datos Históricos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-semibold text-[#0F3460]">Período</th>
                  <th className="text-right p-2 font-semibold text-[#0F3460]">Prima CLP</th>
                  <th className="text-right p-2 font-semibold text-[#0F3460]">Prima UF</th>
                  <th className="text-right p-2 font-semibold text-[#0F3460]">Participación</th>
                  <th className="text-right p-2 font-semibold text-[#0F3460]">Crecimiento</th>
                </tr>
              </thead>
              <tbody>
                {evolucionData.map((item, index) => (
                  <tr key={item.periodo} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{item.periodo}</td>
                    <td className="p-2 text-right">{formatCurrency(item.primaclp)}</td>
                    <td className="p-2 text-right">{formatUF(item.primauf)}</td>
                    <td className="p-2 text-right">{formatPercentage(item.participacion)}</td>
                    <td className="p-2 text-right">
                      <span className={item.crecimiento > 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatPercentage(item.crecimiento)}
                      </span>
                    </td>
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

export default function EvolucionRamoPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EvolucionRamoContent />
    </Suspense>
  );
}