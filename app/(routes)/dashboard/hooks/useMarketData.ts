'use client';

import { useState, useEffect } from 'react';
import { useSupabaseCache } from './useSupabaseCache';
import { useMarketTotal, PeriodSummary } from './useMarketTotal';
import { useCompanias, Compania } from './useCompanias';
import { useCorredores, Corredor, CorredorEvolucionItem } from './useCorredores';
// Importar el hook de ramos
import { useRamos, Ramo, ConcentracionRamo } from './useRamos';

/**
 * Hook principal que integra todos los datos del mercado
 * Este hook ahora actúa como un wrapper que utiliza los hooks modulares
 * @param selectedPeriodo Período seleccionado
 * @param periodos Lista de períodos disponibles
 */
export function useMarketData(selectedPeriodo: string, periodos: string[]) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Usar los hooks modulares
  const marketTotal = useMarketTotal(selectedPeriodo, periodos);
  const companiasData = useCompanias(selectedPeriodo, periodos);
  const corredoresHookData = useCorredores(selectedPeriodo, periodos);
  const ramosData = useRamos(selectedPeriodo, periodos); // Añadir hook de ramos
  
  // Actualizar el estado de carga y error basado en los hooks modulares
  useEffect(() => {
    const isLoading = marketTotal.loading || companiasData.loading || corredoresHookData.loading || ramosData.loading;
    setLoading(isLoading);
    
    const firstError = marketTotal.error || companiasData.error || corredoresHookData.error || ramosData.error;
    setError(firstError);
  }, [marketTotal, companiasData, corredoresHookData, ramosData]);
  
  // Retornar todos los datos combinados de los hooks modulares
  return {
    // Datos de compañías
    companias: companiasData.companias,
    actoresSalientes: companiasData.actoresSalientes,
    historicalCompanias: companiasData.historicalCompanias,
    movimientosCompanias: companiasData.movimientosCompanias,
    gruposPeriodo: companiasData.gruposPeriodo,
    
    // Datos del mercado total
    evolucionMercado: marketTotal.evolucionMercado,
    concentracionMercado: marketTotal.concentracionMercado,
    historicalConcentracion: marketTotal.historicalConcentracion,
    summary: marketTotal.summary,
    
    // Datos de corredores
    evolucionCorredores: corredoresHookData.evolucionCorredores,
    corredoresData: corredoresHookData.corredoresData,
    historicalCorredores: corredoresHookData.historicalCorredores,
    corredoresRegion: corredoresHookData.corredoresRegion,
    corredoresTipoPersona: corredoresHookData.corredoresTipoPersona,
    
    // Datos de ramos
    ramos: ramosData.ramos,
    historicalRamos: ramosData.historicalRamos,
    concentracionRamos: ramosData.concentracionRamos,
    
    // Estado general
    loading,
    error
  };
}

// Re-exportar las interfaces para mantener compatibilidad
export type { PeriodSummary, Compania, Ramo, ConcentracionRamo };