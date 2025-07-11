import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Building2, Target, BarChart3, PieChart, Users, Award } from 'lucide-react';
import { formatCurrency, formatUF, formatPercentage } from '@/lib/utils/formatters';
import { useSupabaseClient } from '@/lib/supabase/client';

interface ReporteDinamicoProps {
  reporte: {
    datos_reporte: {
      corredor: {
        rut: string;
        nombre: string;
        ciudad?: string;
        telefono?: string;
        region?: number;
      };
      periodo?: string;
      ramos: Array<{
        cod: string;
        primaclp: number;
        primauf: number | null;
        grupo: number;
      }>;
      companias: Array<{
        rutcia: string;
        nombrecia: string;
        primaclp: number;
        primauf: number;
        grupo: string;
      }>;
    };
  };
}

export default function ReporteDinamico({ reporte }: ReporteDinamicoProps) {
  const router = useRouter();
  const supabase = useSupabaseClient();
  const { corredor, periodo, ramos, companias } = reporte.datos_reporte;
  
  // Estados para el mapeo dinámico de ramos y visualización de tablas
  const [ramosMap, setRamosMap] = useState<{ [key: string]: string }>({});
  const [showAllCompanias, setShowAllCompanias] = useState(false);
  const [showAllRamos, setShowAllRamos] = useState(false);
  const [loadingRamos, setLoadingRamos] = useState(true);

  // Obtener nombres de ramos dinámicamente
  useEffect(() => {
    async function fetchRamosNames() {
      try {
        const { data: nombresRamos, error } = await supabase
          .from('ramos')
          .select('codigo, ramo');

        if (error) {
          console.error('Error obteniendo nombres de ramos:', error);
          return;
        }

        // Crear el mapeo dinámico
        const mapeo: { [key: string]: string } = {};
        nombresRamos?.forEach((ramo) => {
          mapeo[ramo.codigo] = ramo.ramo;
        });
        
        setRamosMap(mapeo);
      } catch (error) {
        console.error('Error al cargar nombres de ramos:', error);
      } finally {
        setLoadingRamos(false);
      }
    }

    fetchRamosNames();
  }, [supabase]);

  // Calcular totales
  const totalPrimaCLP = ramos.reduce((sum, ramo) => sum + (ramo.primaclp || 0), 0);
  const totalPrimaUF = ramos.reduce((sum, ramo) => sum + (ramo.primauf || 0), 0);
  const numCompanias = companias.length;
  const numRamos = ramos.length;

  // Ordenar ramos y compañías por prima
  const ramosOrdenados = [...ramos]
    .filter(ramo => ramo.primaclp > 0)
    .sort((a, b) => b.primaclp - a.primaclp);
  
  const companiasOrdenadas = [...companias]
    .filter(compania => compania.primaclp > 0)
    .sort((a, b) => b.primaclp - a.primaclp);

  // Funciones de formato
  const getGrowthColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getConcentrationBadge = (nivel: string) => {
    switch (nivel) {
      case 'Alta': return 'bg-red-100 text-red-800';
      case 'Moderada': return 'bg-yellow-100 text-yellow-800';
      case 'Baja': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Calcular HHI simplificado
  const calculateHHI = (items: any[], totalPrima: number) => {
    const hhi = items.reduce((sum, item) => {
      const share = (item.primaclp / totalPrima) * 100;
      return sum + (share * share);
    }, 0);
    return Math.round(hhi);
  };

  const hhiCompanias = calculateHHI(companiasOrdenadas, totalPrimaCLP);
  const hhiRamos = calculateHHI(ramosOrdenados, totalPrimaCLP);

  const getNivelConcentracion = (hhi: number) => {
    if (hhi > 2500) return 'Alta';
    if (hhi > 1500) return 'Moderada';
    return 'Baja';
  };

  // Función para obtener nombre de ramo dinámicamente
  const getNombreRamo = (codigo: string) => {
    return ramosMap[codigo] || `Ramo ${codigo}`;
  };

  // Determinar qué compañías y ramos mostrar
  const companiasAMostrar = showAllCompanias ? companiasOrdenadas : companiasOrdenadas.slice(0, 10);
  const ramosAMostrar = showAllRamos ? ramosOrdenados : ramosOrdenados.slice(0, 10);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header del Reporte */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{corredor.nombre}</h1>
              <p className="text-gray-600">RUT: {corredor.rut}</p>
              {corredor.ciudad && (
                <p className="text-gray-600">Ciudad: {corredor.ciudad}</p>
              )}
              {corredor.telefono && (
                <p className="text-gray-600">Teléfono: {corredor.telefono}</p>
              )}
            </div>
            <div className="text-right">
              <Badge variant="outline" className="text-lg px-3 py-1">
                Período: {periodo || 'N/A'}
              </Badge>
            </div>
          </div>
        </div>

        {/* KPIs Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Prima Total CLP
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalPrimaCLP)}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Producción total en pesos
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Prima Total UF
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {formatUF(totalPrimaUF)}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Producción total en UF
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Compañías
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {numCompanias}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Aseguradoras activas
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Ramos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {numRamos}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Líneas de negocio
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
                <span className="text-2xl font-bold">{hhiCompanias}</span>
                <Badge className={getConcentrationBadge(getNivelConcentracion(hhiCompanias))}>
                  {getNivelConcentracion(hhiCompanias)}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mt-1">Índice HHI</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Concentración por Ramos</h4>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold">{hhiRamos}</span>
                <Badge className={getConcentrationBadge(getNivelConcentracion(hhiRamos))}>
                  {getNivelConcentracion(hhiRamos)}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mt-1">Índice HHI</p>
            </div>
          </div>
        </div>

        {/* Detailed Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Distribución por Compañías</CardTitle>
                {companiasOrdenadas.length > 10 && (
                  <button
                    onClick={() => setShowAllCompanias(!showAllCompanias)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    {showAllCompanias ? 'Mostrar menos' : `Ver todas (${companiasOrdenadas.length})`}
                  </button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Compañía</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prima CLP</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Part.</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Evolución</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {companiasAMostrar.map((compania, index) => {
                      const participacion = (compania.primaclp / totalPrimaCLP) * 100;
                      return (
                        <tr key={compania.rutcia} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-4 text-sm font-medium text-gray-900">{compania.nombrecia}</td>
                          <td className="px-4 py-4 text-sm text-gray-500">{formatCurrency(compania.primaclp)}</td>
                          <td className="px-4 py-4 text-sm text-gray-500">{formatPercentage(participacion / 100)}</td>
                          <td className="px-4 py-4 text-sm">
                            <button
                              onClick={() => router.push(`/dashboard/corredor/evolucion/compania?rut=${encodeURIComponent(corredor.rut)}&rutcia=${encodeURIComponent(compania.rutcia)}`)}
                              className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center"
                            >
                              Ver evolución
                              <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Distribución por Ramos</CardTitle>
                {ramosOrdenados.length > 10 && (
                  <button
                    onClick={() => setShowAllRamos(!showAllRamos)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    {showAllRamos ? 'Mostrar menos' : `Ver todos (${ramosOrdenados.length})`}
                  </button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ramo</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prima CLP</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Part.</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Evolución</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {ramosAMostrar.map((ramo, index) => {
                      const participacion = (ramo.primaclp / totalPrimaCLP) * 100;
                      const nombreRamo = loadingRamos ? `Ramo ${ramo.cod}` : getNombreRamo(ramo.cod);
                      return (
                        <tr key={ramo.cod} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-4 text-sm font-medium text-gray-900">{nombreRamo}</td>
                          <td className="px-4 py-4 text-sm text-gray-500">{formatCurrency(ramo.primaclp)}</td>
                          <td className="px-4 py-4 text-sm text-gray-500">{formatPercentage(participacion / 100)}</td>
                          <td className="px-4 py-4 text-sm">
                            <button
                              onClick={() => router.push(`/dashboard/corredor/evolucion/ramo?rut=${encodeURIComponent(corredor.rut)}&ramo=${encodeURIComponent(nombreRamo)}`)}
                              className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center"
                            >
                              Ver evolución
                              <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
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
          <p className="mt-2 text-xs">Este reporte incluye análisis de concentración HHI y métricas de distribución basadas en datos del período {periodo || 'actual'}.</p>
        </div>
      </div>
    </div>
  );
}