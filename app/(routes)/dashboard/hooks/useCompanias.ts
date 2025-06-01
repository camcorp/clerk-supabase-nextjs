'use client';

import { useState, useEffect } from 'react';
import { useSupabaseCache } from './useSupabaseCache';

export interface Compania {
  id: string;
  nombrecia: string;
  periodo: string;
  total_primauf: number;
  grupo: string;
  tipo: string;
}

/**
 * Hook para obtener datos de compañías del mercado
 * @param selectedPeriodo Período seleccionado
 * @param periodos Lista de períodos disponibles
 */
// Añadir al hook useCompanias

export function useCompanias(selectedPeriodo: string, periodos: string[]) {
  const [companias, setCompanias] = useState<Compania[]>([]);
  const [actoresSalientes, setActoresSalientes] = useState<any[]>([]);
  const [historicalCompanias, setHistoricalCompanias] = useState<any[]>([]);
  const [movimientosCompanias, setMovimientosCompanias] = useState<any[]>([]);
  const [gruposPeriodo, setGruposPeriodo] = useState<any[]>([]); // Nuevo estado
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Usar nuestro hook de caché
  const { 
    getCompaniasByPeriodo,
    getEvolucionMercado,
    getHistoricalCompanias,
    getGruposByPeriodo, // Nueva función
    getHistoricalGrupos, // Nueva función
    fetchWithCache,
    supabase
  } = useSupabaseCache();
  
  useEffect(() => {
    async function loadData() {
      if (!selectedPeriodo) return;
      
      try {
        setLoading(true);
        
        // 1. Cargar compañías del período seleccionado usando caché
        const companiasData = await getCompaniasByPeriodo(selectedPeriodo) as any[] || [];
        setCompanias(companiasData as Compania[]);
        
        // 2. Cargar grupos del período seleccionado usando caché
        const gruposPeriodoData = await getGruposByPeriodo(selectedPeriodo) as any[] || [];
        setGruposPeriodo(gruposPeriodoData);
        
        // 2. Cargar evolución del mercado usando caché
        const evolucionData = await getEvolucionMercado() as any[] || [];
        
        // 3. Cargar actores salientes
        try {
          const { data: tablesData } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_name', 'actores_salientes');
            
          if (tablesData && tablesData.length > 0) {
            const actoresSalientesData = await fetchWithCache('actores_salientes', {
              eq: { fecha_salida: selectedPeriodo }
            }) as any[] || [];
            setActoresSalientes(actoresSalientesData);
          } else {
            const actoresSalientes = evolucionData
              .filter((item: any) => item.tipo_cambio === 'salida' && item.periodo === selectedPeriodo);
            setActoresSalientes(actoresSalientes);
          }
        } catch (err) {
          console.error('Error al cargar actores salientes:', err);
          try {
            const actoresSalientes = evolucionData
              .filter((item: any) => item.tipo_cambio === 'salida' && item.periodo === selectedPeriodo);
            setActoresSalientes(actoresSalientes);
          } catch (innerErr) {
            console.error('Error al procesar actores salientes alternativos:', innerErr);
            setActoresSalientes([]);
          }
        }
        
        // 4. Cargar datos históricos de compañías
        const historicalCompaniasData = await getHistoricalCompanias() as any[] || [];
        setHistoricalCompanias(historicalCompaniasData);
        
        // 5. Cargar movimientos de compañías (reutilizamos los datos de evolución)
        setMovimientosCompanias(evolucionData);
        
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
    getCompaniasByPeriodo,
    getEvolucionMercado,
    getHistoricalCompanias,
    getGruposByPeriodo, // Nueva dependencia
    fetchWithCache,
    supabase
  ]);
  
  return {
    companias,
    actoresSalientes,
    historicalCompanias,
    movimientosCompanias,
    gruposPeriodo, // Nuevo dato retornado
    loading,
    error
  };
}