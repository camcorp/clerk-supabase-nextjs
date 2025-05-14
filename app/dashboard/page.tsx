'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePeriod } from './memoria-anual/context/PeriodContext';
import { useMarketData } from './hooks/useMarketData';

// Importar componentes
import MaCardSummary from './components/MaCardSummary';
import MaChartEvol from './components/MaChartEvol';
import MaTableCompanias from './components/MaTableCompanias';
import MaChartPieGrupo from './components/MaChartPieGrupo';
import MaChartMove from './components/MaChartMove';
import MaChartMovimientos from './components/MaChartMovimientos';
import MaChartMoveCorredores from './components/MaChartMoveCorredores';
import MaEstructuraMercado from './components/MaEstructuraMercado';
import MaChartHHI from './components/MaChartHHI'; // Importación del componente HHI
import MaLoading from './components/MaLoading';

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
    summary
  } = useMarketData(selectedPeriodo, periodos);

  return (
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

        {/* Tarjetas de resumen */}
        <MaCardSummary summary={summary} loading={loading} />

        {/* Mostrar mensaje de carga o error */}
        {loading && <MaLoading error={null} />}
        {error && <MaLoading error={error} />}

        {!loading && !error && (
          <>
            {/* Gráfico de evolución */}
            {historicalCompanias && historicalCompanias.length > 0 ? (
              <MaChartEvol
                periodos={periodos}
                historicalCompanias={historicalCompanias}
              />
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6 p-4">
                <p className="text-gray-500 text-center">No hay datos históricos disponibles</p>
              </div>
            )}

            {/* Gráfico de participación de mercado */}
            {concentracionMercado && Array.isArray(concentracionMercado) && concentracionMercado.length > 0 ? (
              <div className="mb-6">
                <MaChartPieGrupo concentracionMercado={concentracionMercado} />
              </div>
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6 p-4">
                <p className="text-gray-500 text-center">No hay datos de concentración disponibles</p>
              </div>
            )}

            {/* Estructura de mercado sin HHI */}
            {concentracionMercado && Array.isArray(concentracionMercado) && concentracionMercado.length > 0 ? (
              <div className="mb-6">
                <MaEstructuraMercado
                  grupoGenerales={concentracionMercado.filter(item => item && item.tipo === 'GENERALES')}
                  grupoVida={concentracionMercado.filter(item => item && item.tipo === 'VIDA')}
                  selectedPeriodo={selectedPeriodo}
                  periodos={periodos}
                  historicalConcentracion={historicalConcentracion || []}
                  concentracionMercado={concentracionMercado}
                />
              </div>
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6 p-4">
                <p className="text-gray-500 text-center">No hay datos de concentración disponibles</p>
              </div>
            )}

            {/* Gráfico HHI independiente */}
            {historicalConcentracion && historicalConcentracion.length > 0 ? (
              <div className="mb-6">
                <MaChartHHI historicalConcentracion={historicalConcentracion || []} />
              </div>
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6 p-4">
                <p className="text-gray-500 text-center">No hay datos de concentración histórica disponibles</p>
              </div>
            )}

            {/* Gráficos de movimientos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {evolucionMercado && evolucionMercado.length > 0 ? (
                <MaChartMovimientos
                  datos={evolucionMercado}
                  periodos={periodos}
                  tipo="companias"
                />
              ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg p-4">
                  <p className="text-gray-500 text-center">No hay datos de evolución de compañías disponibles</p>
                </div>
              )}

              {/* Verificación de datos (sin console.log en JSX) */}
              {(() => {
                // Podemos ejecutar el console.log aquí sin afectar el renderizado
                console.log('Datos de evolución de corredores:', evolucionCorredores);
                console.log('Longitud de datos:', evolucionCorredores?.length || 0);
                return null; // No renderiza nada
              })()}
              
              {evolucionCorredores && evolucionCorredores.length > 0 ? (
                <MaChartMovimientos
                  datos={evolucionCorredores}
                  periodos={periodos}
                  tipo="corredores"
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
              />
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6 p-4">
                <p className="text-gray-500 text-center">No hay datos de compañías disponibles</p>
              </div>
            )}
            {/* Depuración de datos de evolución de corredores */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6 p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Datos de evolución de corredores (Debug)</h3>
              <pre className="text-xs overflow-auto max-h-40">
                {JSON.stringify(evolucionCorredores, null, 2)}
              </pre>
            </div>
          </>
        )}
      </div>
    </div>
  );
}