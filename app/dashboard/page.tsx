'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePeriod } from './memoria-anual/context/PeriodContext';
import { useMarketData } from './hooks/useMarketData';

// Importar componentes
import MaCardSummary from './components/MaCardSummary';
import MaChartEvol from './components/MaChartEvol';
import MaTableCompanias from './components/MaTableCompanias';
import MaChartMove from './components/MaChartMove';
import MaChartMoveCorredores from './components/MaChartMoveCorredores';
import MaEstructuraMercado from './components/MaEstructuraMercado';
import MaLoading from './components/MaLoading';

export default function Dashboard() {
  // Usar el contexto de período
  const { selectedPeriodo, setSelectedPeriodo, periodos } = usePeriod();
  
  // Establecer periodos como variable global
  useEffect(() => {
    if (typeof window !== 'undefined' && periodos.length > 0) {
      window.periodos = periodos;
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
            <MaChartEvol 
              periodos={periodos} 
              historicalCompanias={historicalCompanias} 
            />
            
            {/* Tabla de compañías con acordeón */}
            <MaTableCompanias 
              companias={companias}
              loading={loading}
              historicalCompanias={historicalCompanias}
              corredoresData={corredoresData}
              periodos={periodos} // Pasamos periodos como prop
            />
            
            {/* Gráficos de movimientos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <MaChartMove 
                evolucionMercado={evolucionMercado}
                periodos={periodos}
              />
              
              <MaChartMoveCorredores 
                evolucionCorredores={evolucionCorredores}
                periodos={periodos}
              />
            </div>
            
            {/* Estructura de mercado reorganizada */}
            <MaEstructuraMercado
              grupoGenerales={concentracionMercado && Array.isArray(concentracionMercado) ? concentracionMercado.filter(item => item.tipo === 'GENERALES') : []}
              grupoVida={concentracionMercado && Array.isArray(concentracionMercado) ? concentracionMercado.filter(item => item.tipo === 'VIDA') : []}
              selectedPeriodo={selectedPeriodo}
              periodos={periodos}
              historicalConcentracion={historicalConcentracion}
              concentracionMercado={concentracionMercado} // Pasa el estado o datos
            />
          </>
        )}
      </div>
    </div>
  );
}