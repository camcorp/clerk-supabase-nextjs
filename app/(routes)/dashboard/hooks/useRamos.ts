'use client';

import { useState, useEffect } from 'react';
import { useSupabaseCache } from './useSupabaseCache';

export interface Ramo {
  codigo: string;
  ramo: string;
  grupo: string;
  subgrupo: string;
  total_primaclp: number;
  total_primauf: number;
  crecimiento_clp: number | null;
  participacion_clp: number;
  ranking_general: number;
}

export interface ConcentracionRamo {
  periodo: string;
  grupo?: string;
  hhi_grupo?: number;
  subgrupo?: string;
  hhi_subgrupo?: number;
  hhi_general: number;
}

/**
 * Hook para obtener datos de ramos del mercado
 * @param selectedPeriodo Período seleccionado
 * @param periodos Lista de períodos disponibles
 */
export function useRamos(selectedPeriodo: string, periodos: string[]) {
  const [ramos, setRamos] = useState<Ramo[]>([]);
  const [historicalRamos, setHistoricalRamos] = useState<any[]>([]);
  const [concentracionRamos, setConcentracionRamos] = useState<ConcentracionRamo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Usar nuestro hook de caché
  const { 
    fetchWithCache,
    getConcentracionRamos,
    supabase
  } = useSupabaseCache();
  
  useEffect(() => {
    async function loadData() {
      if (!selectedPeriodo) return;
      
      try {
        setLoading(true);
        
        // 1. Cargar datos de ramos para el período seleccionado
        try {
          const ramosData = await fetchWithCache('vista_ramos_periodo', {
            eq: { periodo: selectedPeriodo }
          }) as Ramo[] || [];
          
          setRamos(ramosData);
        } catch (err) {
          console.error('Error al obtener datos de vista_ramos_periodo:', err);
          setRamos([]);
        }
        
        // 2. Cargar datos históricos de ramos para todos los períodos
        try {
          const historicalRamosData = await fetchWithCache('vista_ramos_periodo', {
            order: { periodo: { ascending: false } }
          }) as any[] || [];
          
          setHistoricalRamos(historicalRamosData);
        } catch (err) {
          console.error('Error al obtener datos históricos de ramos:', err);
          setHistoricalRamos([]);
        }
        
        // 3. Cargar datos de concentración de ramos para el período seleccionado
        try {
          console.log('Llamando a getConcentracionRamos con periodo:', selectedPeriodo);
          const concentracionData = await getConcentracionRamos(selectedPeriodo);
          console.log('Datos de concentración obtenidos en useRamos:', {
            tipo: typeof concentracionData,
            esArray: Array.isArray(concentracionData),
            longitud: Array.isArray(concentracionData) ? concentracionData.length : 'N/A',
            datos: concentracionData
          });
          
          // Asegurarse de que concentracionData es un array antes de asignarlo
          setConcentracionRamos(Array.isArray(concentracionData) ? concentracionData : []);
        } catch (err) {
          console.error('Error al obtener datos de concentración de ramos:', err);
          setConcentracionRamos([]);
        }
        
      } catch (err: any) {
        console.error('Error detallado:', err);
        setError(err.message || 'Error desconocido');
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [
    selectedPeriodo,
    periodos,
    fetchWithCache,
    getConcentracionRamos,
    supabase
  ]);
  
  return {
    ramosData: ramos,
    concentracionRamos,
    loading,
    error
  };
}