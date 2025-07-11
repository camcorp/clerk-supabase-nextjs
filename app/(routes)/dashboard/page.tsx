'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePeriod } from './memoria-anual/context/PeriodContext';
import { useMarketData } from './hooks/useMarketData';

// Importar componentes
import MaCardSummary from '@/components/ui/charts/cards/MaCardSummary';
import MaChartEvol from '@/components/ui/charts/MaChartEvol'; // ✅ Ruta corregida
import MaTableCompanias from '@/components/ui/charts/MaTableCompanias';
import MaLoading from '@/components/ui/charts/MaLoading';
import MaChartPieGrupo from '@/components/ui/charts/MaChartPieGrupo';
import MaEstructuraMercado from '@/components/ui/charts/MaEstructuraMercado';
import MaChartHHI from '@/components/ui/charts/MaChartHHI';
import MaChartCorredoresMovimientos from '@/components/ui/charts/MaChartCorredoresMovimientos';
import ChartMovimientos from '@/components/ui/charts/common/ChartMovimientos'; // <<<--- AÑADIR ESTA LÍNEA

// Importar los nuevos componentes
import MaChartCorredoresRegion from '@/components/ui/charts/MaChartCorredoresRegion';
import MaChartCorredoresTipoPersona from '@/components/ui/charts/MaChartCorredoresTipoPersona';
// Importar el nuevo componente (añadir esta línea con las demás importaciones)
import MaMemoriaCard from '@/components/ui/charts/MaMemoriaCard';

// Añadir la importación del nuevo componente
import MaEstructuraRamos from '@/components/ui/charts/MaEstructuraRamos';

// Importar el nuevo componente HHIChart
import HHIChart from '@/components/ui/charts/HHIChart';

export default function Dashboard() {
  // Usar el contexto de período
  const { selectedPeriodo, setSelectedPeriodo, periodos } = usePeriod();

  // Manejar periodos de forma segura para evitar errores de hidratación
  useEffect(() => {
    // Solo ejecutar en el cliente para evitar errores de hidratación
    if (typeof window !== 'undefined' && periodos.length > 0) {
      // Usar sessionStorage en lugar de window global para evitar problemas de hidratación
      sessionStorage.setItem('periodos', JSON.stringify(periodos));
    }
  }, [periodos]);

  // Cargar datos usando el hook
  const {
    companias,
    evolucionMercado,
    evolucionCorredores,
    concentracionMercado,
    loading,
    error,
    historicalCompanias,
    historicalConcentracion,
    corredoresData,
    corredoresRegion, // Nuevos datos
    corredoresTipoPersona, // Nuevos datos
    gruposPeriodo, // Nuevos datos
    summary,
    concentracionRamos
  } = useMarketData(selectedPeriodo, periodos);

  // Añadir esto justo antes del return
  // Modificar el log existente para incluir el período seleccionado
  console.log('Período seleccionado:', selectedPeriodo);
  console.log('Períodos disponibles:', periodos);
  console.log('concentracionRamos:', concentracionRamos);

  return (
    <>
      {/* Mostrar mensaje de carga o error - MOVIDO AL PRINCIPIO */}
      {loading && <MaLoading error={null} />}
      {error && <MaLoading error={error} />}
      
      {!loading && !error && (
        <div className="flex flex-col">
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Memoria Anual del Mercado Asegurador</h1>

                <div className="flex items-center space-x-4">
                  <Link
                    href="/dashboard/memoria-anual"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Ver Memoria Completa
                  </Link>

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
              </div>
            </div>
              {/* Estructura de la Memoria Anual - MOVIDO DENTRO DEL COMPONENTE */}
              <MaMemoriaCard 
                title="Estructura de la Memoria Anual"
                sections={[
                  {
                    title: "1. Portada y Presentación",
                    items: [
                      "Título: \"Memoria Anual de Corredores de Seguros de Chile [AÑO]\"",
                      "Logo y elementos de identidad visual",
                      "Fecha de publicación"
                    ]
                  },
                  {
                    title: "2. Índice de Contenidos",
                    items: []
                  },
                  {
                    title: "3. Introducción",
                    items: [
                      "Objetivo de la memoria anual",
                      "Metodología y fuentes de información",
                      "Contexto del mercado asegurador chileno"
                    ]
                  }
                ]}
              />
            {/* Tarjetas de resumen */}
            {summary && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Primera tarjeta: Primas Totales Mercado */}
                <MaCardSummary 
                  title="Primas Totales Mercado" 
                  value={summary.totalMercado} 
                  trend={summary.crecimientoTotal} 
                  subtitle="UF" 
                />
                
                {/* Segunda tarjeta: Compañías de Seguros */}
                <MaCardSummary 
                  title="Compañías de Seguros" 
                  value={summary.companiasCount} 
                  trend={summary.entradasPeriodo - summary.salidasPeriodo} 
                  subtitle={`Entradas: ${summary.entradasPeriodo} | Salidas: ${summary.salidasPeriodo}`} 
                />
                
                {/* Tercera tarjeta: Corredores */}
                <MaCardSummary 
                  title="Corredores" 
                  value={summary.corredoresCount} 
                  trend={summary.entradasCorredores - summary.salidasCorredores} 
                  subtitle={`Entradas: ${summary.entradasCorredores} | Salidas: ${summary.salidasCorredores}`}
                />
              </div>
            )}
            
            {/* CONTENEDOR PRINCIPAL PARA TODOS LOS GRÁFICOS - MISMO ANCHO QUE LAS TARJETAS */}
            <div className="grid grid-cols-1 gap-6 mb-6">
              {/* Gráfico de evolución */}
              {historicalCompanias && historicalCompanias.length > 0 ? (
                <div className="w-full overflow-x-hidden"> 
                  <MaChartEvol
                    periodos={periodos}
                    historicalCompanias={historicalCompanias}
                  />
                </div>
              ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg p-4">
                  <p className="text-gray-500 text-center">No hay datos históricos disponibles</p>
                </div>
              )}

              {/* Gráfico de participación de mercado */}
              {concentracionMercado && Array.isArray(concentracionMercado) && concentracionMercado.length > 0 ? (
                <div>
                  <MaChartPieGrupo concentracionMercado={concentracionMercado} />
                </div>
              ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg p-4">
                  <p className="text-gray-500 text-center">No hay datos de concentración disponibles</p>
                </div>
              )}

              {/* Estructura de mercado sin HHI */}
              {concentracionMercado && Array.isArray(concentracionMercado) && concentracionMercado.length > 0 ? (
                <div>
                  <MaEstructuraMercado
                    grupoGenerales={concentracionMercado.filter(item => item && item.grupo === '1')}
                    grupoVida={concentracionMercado.filter(item => item && item.grupo === '2')}
                    selectedPeriodo={selectedPeriodo}
                    periodos={periodos}
                    historicalConcentracion={historicalConcentracion || []}
                    concentracionMercado={concentracionMercado}
                  />
                </div>
              ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg p-4">
                  <p className="text-gray-500 text-center">No hay datos de concentración disponibles</p>
                </div>
              )}
              
              {/* Estructura de concentración de ramos */}
              {concentracionRamos && Array.isArray(concentracionRamos) && concentracionRamos.length > 0 ? (
                <div>
                  <MaEstructuraMercado
                    grupoGenerales={concentracionRamos.filter(item => item && item.grupo === '1')}
                    grupoVida={concentracionRamos.filter(item => item && item.grupo === '2')}
                    selectedPeriodo={selectedPeriodo}
                    periodos={periodos}
                    historicalConcentracion={historicalConcentracion || []}
                    concentracionMercado={concentracionRamos}
                  />
                </div>
              ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg p-4">
                  <p className="text-gray-500 text-center">No hay datos de concentración de ramos disponibles</p>
                </div>
              )}

              {/* Gráfico HHI independiente */}
              {historicalConcentracion && historicalConcentracion.length > 0 ? (
                <div>
                  <HHIChart 
                    data={historicalConcentracion || []} 
                    title="Índice de Concentración HHI por Grupo"
                    subtitle="Evolución histórica del índice Herfindahl-Hirschman"
                    mode="multi"
                    threshold={1500}
                  />
                </div>
              ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg p-4">
                  <p className="text-gray-500 text-center">No hay datos de concentración histórica disponibles</p>
                </div>
              )}

              {/* Gráficos de movimientos */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gráfico de movimientos de compañías */}
                {evolucionMercado && evolucionMercado.length > 0 ? (
                  <>
                    <ChartMovimientos
                      data={evolucionMercado.map(item => ({
                        periodo: item.periodo,
                        entradas: Number(item.num_entradas || 0),
                        salidas: Number(item.num_salidas || 0)
                      }))}
                      tipo="companias"
                    />
                  </>
                ) : (
                  <div className="bg-white shadow overflow-hidden sm:rounded-lg p-4">
                    <p className="text-gray-500 text-center">No hay datos de evolución de compañías disponibles</p>
                  </div>
                )}
                
                {/* Gráfico de movimientos de corredores */}
                {evolucionCorredores && evolucionCorredores.length > 0 ? (
                  <MaChartCorredoresMovimientos
                    periodos={periodos}
                    evolucionCorredores={evolucionCorredores || []}
                  />
                ) : (
                  <div className="bg-white shadow overflow-hidden sm:rounded-lg p-4">
                    <p className="text-gray-500 text-center">No hay datos de evolución de corredores disponibles</p>
                  </div>
                )}
              </div>

              {/* Tabla de compañías con acordeón */}
              {companias && companias.length > 0 ? (
                <MaTableCompanias
                  companias={companias}
                  loading={loading}
                  historicalCompanias={historicalCompanias || []}
                  corredoresData={corredoresData || []}
                  periodos={periodos}
                  gruposPeriodo={gruposPeriodo || []}
                />
              ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg p-4">
                  <p className="text-gray-500 text-center">No hay datos de compañías disponibles</p>
                </div>
              )}
              
              {/* Distribución de Corredores por Región */}
              {corredoresRegion && corredoresRegion.length > 0 ? (
                <MaChartCorredoresRegion
                  corredoresRegion={corredoresRegion}
                  periodo={selectedPeriodo}
                />
              ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg p-4">
                  <p className="text-gray-500 text-center">No hay datos de distribución por región disponibles</p>
                </div>
              )}

              {/* Distribución de Corredores por Tipo de Persona */}
              {corredoresTipoPersona && corredoresTipoPersona.length > 0 ? (
                <MaChartCorredoresTipoPersona
                  corredoresTipoPersona={corredoresTipoPersona}
                  periodo={selectedPeriodo}
                />
              ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg p-4">
                  <p className="text-gray-500 text-center">No hay datos de distribución por tipo de persona disponibles</p>
                </div>
              )}
              

              
              {/* Depuración de datos de evolución de corredores */}
              {/* Estructura de concentración de ramos - Versión de depuración */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Datos de concentración de ramos (Debug)</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="text-md font-medium">Información de períodos:</h4>
                    <p>Período seleccionado: <strong>{selectedPeriodo}</strong></p>
                    <p>Total períodos disponibles: {periodos.length}</p>
                    <p>Períodos: {periodos.join(', ')}</p>
                  </div>
                  <div>
                    <h4 className="text-md font-medium">Estado de los datos:</h4>
                    <p>concentracionRamos existe: <strong>{concentracionRamos ? 'Sí' : 'No'}</strong></p>
                    <p>Es array: <strong>{Array.isArray(concentracionRamos) ? 'Sí' : 'No'}</strong></p>
                    <p>Longitud: <strong>{Array.isArray(concentracionRamos) ? concentracionRamos.length : 'N/A'}</strong></p>
                  </div>
                </div>
                <div>
                  <h4 className="text-md font-medium mb-2">Contenido de concentracionRamos:</h4>
                  <pre className="text-xs overflow-auto max-h-40 bg-gray-100 p-2 rounded">
                    {JSON.stringify(concentracionRamos, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


