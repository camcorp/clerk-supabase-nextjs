'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Building2, Target, Award, BarChart3 } from 'lucide-react';

interface ReporteIndividualProps {
  corredor: {
    rut: string;
    nombre: string;
    ciudad?: string;
    telefono?: string;
  };
  reportData: {
    periodo: string;
    produccion: {
      total_primaclp: number;
      total_primauf: number;
      ranking_general: number;
      num_companias: number;
      num_ramos: number;
      crecimiento_anual: number;
      participacion_mercado: number;
    };
    rankings: {
      general: number;
      por_compania: Array<{
        compania: string;
        ranking: number;
        total_corredores: number;
      }>;
      por_ramo: Array<{
        ramo: string;
        ranking: number;
        total_corredores: number;
      }>;
    };
    companias: Array<{
      nombrecia: string;
      primaclp: number;
      primauf: number;
      participacion: number;
      crecimiento: number;
      ranking_corredor: number;
    }>;
    ramos: Array<{
      nombre: string;
      primaclp: number;
      primauf: number;
      participacion: number;
      crecimiento: number;
      ranking_corredor: number;
    }>;
    concentracion: {
      hhi_companias: number;
      hhi_ramos: number;
      nivel_concentracion_companias: string;
      nivel_concentracion_ramos: string;
    };
    top_performers: {
      ramos_mayor_crecimiento: Array<{
        ramo: string;
        crecimiento: number;
        prima_actual: number;
      }>;
      ramos_mayor_decrecimiento: Array<{
        ramo: string;
        crecimiento: number;
        prima_actual: number;
      }>;
      companias_mayor_crecimiento: Array<{
        compania: string;
        crecimiento: number;
        prima_actual: number;
      }>;
      companias_mayor_decrecimiento: Array<{
        compania: string;
        crecimiento: number;
        prima_actual: number;
      }>;
    };
  };
}

export default function ReporteIndividualMockup({ corredor, reportData }: ReporteIndividualProps) {
  const router = useRouter();
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);
  
  const formatUF = (value: number) => 
    new Intl.NumberFormat('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  
  const formatPercentage = (value: number) => 
    `${(value * 100).toFixed(2)}%`;

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (growth < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return null;
  };

  const getConcentrationBadge = (level: string) => {
    const colors = {
      'Baja': 'bg-green-100 text-green-800',
      'Moderada': 'bg-yellow-100 text-yellow-800',
      'Alta': 'bg-red-100 text-red-800'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reporte Individual de Corredor</h1>
            <p className="text-lg text-gray-600 mt-2">{corredor.nombre}</p>
            <p className="text-sm text-gray-500">RUT: {corredor.rut} | Período: {reportData.periodo}</p>
            {corredor.ciudad && <p className="text-sm text-gray-500">{corredor.ciudad}</p>}
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2">
              <Award className="h-6 w-6 text-yellow-500" />
              <span className="text-2xl font-bold text-gray-900">#{reportData.produccion.ranking_general}</span>
            </div>
            <p className="text-sm text-gray-500">Ranking General</p>
          </div>
        </div>
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prima Total CLP</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(reportData.produccion.total_primaclp)}</div>
            <div className={`flex items-center text-xs ${getGrowthColor(reportData.produccion.crecimiento_anual)}`}>
              {getGrowthIcon(reportData.produccion.crecimiento_anual)}
              <span className="ml-1">{formatPercentage(reportData.produccion.crecimiento_anual)} vs año anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prima Total UF</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatUF(reportData.produccion.total_primauf)} UF</div>
            <p className="text-xs text-muted-foreground">
              {formatPercentage(reportData.produccion.participacion_mercado)} del mercado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compañías</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.produccion.num_companias}</div>
            <p className="text-xs text-muted-foreground">
              Diversificación por aseguradoras
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ramos</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.produccion.num_ramos}</div>
            <p className="text-xs text-muted-foreground">
              Líneas de negocio activas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Rankings por Compañía</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reportData.rankings.por_compania.slice(0, 5).map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium">{item.compania}</span>
                  <div className="text-right">
                    <span className="text-lg font-bold">#{item.ranking}</span>
                    <p className="text-xs text-gray-500">de {item.total_corredores}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rankings por Ramo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reportData.rankings.por_ramo.slice(0, 5).map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium">{item.ramo}</span>
                  <div className="text-right">
                    <span className="text-lg font-bold">#{item.ranking}</span>
                    <p className="text-xs text-gray-500">de {item.total_corredores}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Análisis de Concentración */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Análisis de Concentración</h2>
          <button
            onClick={() => router.push(`/dashboard/corredor/concentracion?rut=${encodeURIComponent(corredor.rut)}`)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
          >
            Ver análisis detallado
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-2">Concentración por Compañías</h4>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold">{reportData.concentracion.hhi_companias.toFixed(0)}</span>
              <Badge className={getConcentrationBadge(reportData.concentracion.nivel_concentracion_companias)}>
                {reportData.concentracion.nivel_concentracion_companias}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mt-1">Índice HHI</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Concentración por Ramos</h4>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold">{reportData.concentracion.hhi_ramos.toFixed(0)}</span>
              <Badge className={getConcentrationBadge(reportData.concentracion.nivel_concentracion_ramos)}>
                {reportData.concentracion.nivel_concentracion_ramos}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mt-1">Índice HHI</p>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span>Mayor Crecimiento</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2">Ramos</h4>
                {reportData.top_performers.ramos_mayor_crecimiento.map((ramo, index) => (
                  <div key={index} className="flex justify-between items-center py-2">
                    <span className="text-sm">{ramo.ramo}</span>
                    <div className="text-right">
                      <span className="text-green-600 font-semibold">{formatPercentage(ramo.crecimiento)}</span>
                      <p className="text-xs text-gray-500">{formatCurrency(ramo.prima_actual)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2">Compañías</h4>
                {reportData.top_performers.companias_mayor_crecimiento.map((compania, index) => (
                  <div key={index} className="flex justify-between items-center py-2">
                    <span className="text-sm">{compania.compania}</span>
                    <div className="text-right">
                      <span className="text-green-600 font-semibold">{formatPercentage(compania.crecimiento)}</span>
                      <p className="text-xs text-gray-500">{formatCurrency(compania.prima_actual)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              <span>Mayor Decrecimiento</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2">Ramos</h4>
                {reportData.top_performers.ramos_mayor_decrecimiento.map((ramo, index) => (
                  <div key={index} className="flex justify-between items-center py-2">
                    <span className="text-sm">{ramo.ramo}</span>
                    <div className="text-right">
                      <span className="text-red-600 font-semibold">{formatPercentage(ramo.crecimiento)}</span>
                      <p className="text-xs text-gray-500">{formatCurrency(ramo.prima_actual)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2">Compañías</h4>
                {reportData.top_performers.companias_mayor_decrecimiento.map((compania, index) => (
                  <div key={index} className="flex justify-between items-center py-2">
                    <span className="text-sm">{compania.compania}</span>
                    <div className="text-right">
                      <span className="text-red-600 font-semibold">{formatPercentage(compania.crecimiento)}</span>
                      <p className="text-xs text-gray-500">{formatCurrency(compania.prima_actual)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Compañías</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Compañía</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prima CLP</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Part.</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Crec.</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Evolución</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.companias.slice(0, 10).map((compania, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">{compania.nombrecia}</td>
                      <td className="px-4 py-4 text-sm text-gray-500">{formatCurrency(compania.primaclp)}</td>
                      <td className="px-4 py-4 text-sm text-gray-500">{formatPercentage(compania.participacion)}</td>
                      <td className={`px-4 py-4 text-sm ${getGrowthColor(compania.crecimiento)}`}>
                        {formatPercentage(compania.crecimiento)}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <button
                          onClick={() => router.push(`/dashboard/corredor/evolucion/compania?rut=${encodeURIComponent(corredor.rut)}&compania=${encodeURIComponent(compania.nombrecia)}`)}
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center"
                        >
                          Ver evolución
                          <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribución por Ramos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ramo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prima CLP</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Part.</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Crec.</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Evolución</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.ramos.slice(0, 10).map((ramo, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">{ramo.nombre}</td>
                      <td className="px-4 py-4 text-sm text-gray-500">{formatCurrency(ramo.primaclp)}</td>
                      <td className="px-4 py-4 text-sm text-gray-500">{formatPercentage(ramo.participacion)}</td>
                      <td className={`px-4 py-4 text-sm ${getGrowthColor(ramo.crecimiento)}`}>
                        {formatPercentage(ramo.crecimiento)}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <button
                          onClick={() => router.push(`/dashboard/corredor/evolucion/ramo?rut=${encodeURIComponent(corredor.rut)}&ramo=${encodeURIComponent(ramo.nombre)}`)}
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center"
                        >
                          Ver evolución
                          <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 p-4 rounded-md text-sm text-gray-600">
        <p>Informe generado el: {new Date().toLocaleDateString()}</p>
        <p>Válido hasta: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
        <p className="mt-2 text-xs">Este reporte incluye análisis de concentración HHI, rankings comparativos y métricas de crecimiento basadas en datos del período {reportData.periodo}.</p>
      </div>
    </div>
  );
}