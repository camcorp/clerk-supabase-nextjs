'use client';

import { useState, useEffect } from 'react';
import { useSupabaseCache } from '../supabase/useSupabaseCache';

export interface Compania {
  id: string;
  nombrecia: string;
  periodo: string;
  total_primauf: number;
  grupo: string;
  tipo: string;
}

export interface MarketData {
  companies?: any[];
  evolution?: any[];
  historical?: any[];
  totals?: any;
}

/**
 * Hook para obtener datos del mercado
 */
export function useMarketData(selectedPeriodo: string, periodos: string[]) {
  const [data, setData] = useState<MarketData>({
    companies: [],
    evolution: [],
    historical: []
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Usar el hook de caché
  const { 
    getCompaniasByPeriodo,
    getEvolucionMercado,
    getHistoricalCompanias
  } = useSupabaseCache();
  
  useEffect(() => {
    async function loadData() {
      if (!selectedPeriodo) return;
      
      try {
        setLoading(true);
        
        // Cargar datos de compañías
        const companiesData = await getCompaniasByPeriodo(selectedPeriodo) || [];
        
        // Cargar datos de evolución del mercado
        const evolutionData = await getEvolucionMercado() || [];
        
        // Cargar datos históricos
        const historicalData = await getHistoricalCompanias() || [];
        
        setData({
          companies: companiesData,
          evolution: evolutionData,
          historical: historicalData
        });
      } catch (err: any) {
        console.error('Error cargando datos del mercado:', err);
        setError(err.message || 'Error desconocido');
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [selectedPeriodo, periodos, getCompaniasByPeriodo, getEvolucionMercado, getHistoricalCompanias]);
  
  return {
    data,
    loading,
    error
  };
}