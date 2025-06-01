'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Definir tipos para el caché
interface CacheItem<T> {
  data: T;
  timestamp: number;
}

interface CacheState {
  [table: string]: {
    [key: string]: CacheItem<any>;
  };
}

interface CacheConfig {
  ttl: number; // Tiempo de vida en milisegundos
  maxSize: number; // Número máximo de entradas por tabla
}

// Configuración predeterminada
const DEFAULT_CONFIG: CacheConfig = {
  ttl: 5 * 60 * 1000, // 5 minutos
  maxSize: 100 // 100 entradas por tabla
};

// Caché global para compartir entre hooks
const globalCache: Record<string, CacheItem<any>> = {};

// Tiempo de expiración por defecto: 5 minutos
const DEFAULT_EXPIRATION = 5 * 60 * 1000;

/**
 * Hook personalizado para cachear consultas a Supabase
 * @param config Configuración opcional del caché
 */
export function useSupabaseCache(config: Partial<CacheConfig> = {}) {
  const supabase = createClientComponentClient();
  
  // Añadir logs para verificar la conexión con Supabase
  console.log('Estado de conexión Supabase:', supabase ? 'Disponible' : 'No disponible');
  
  // Verificar la sesión de autenticación (esto debe ejecutarse en un useEffect)
  useEffect(() => {
    const checkAuth = async () => {
      const { data, error } = await supabase.auth.getSession();
      console.log('Sesión de autenticación:', data, error ? `Error: ${error.message}` : 'Sin errores');
    };
    checkAuth();
  }, [supabase]);
  
  // Función para obtener datos del caché o de Supabase
  const getCachedData = useCallback(async (
    table: string,
    query: any,
    cacheKey: string = table,
    ttl: number = DEFAULT_EXPIRATION
  ) => {
    // Verificar si hay datos en caché y si son válidos
    const cachedItem = globalCache[cacheKey];
    const now = Date.now();
    
    if (cachedItem && (now - cachedItem.timestamp) < ttl) {
      console.log(`Usando datos en caché para ${cacheKey}`);
      return cachedItem.data;
    }
    
    // Si no hay datos en caché o están expirados, hacer la consulta
    console.log(`Obteniendo datos frescos para ${cacheKey}`);
    
    try {
      const { data, error } = await query;
      
      if (error) {
        console.error(`Error al obtener datos para ${cacheKey}:`, error);
        throw error;
      }
      
      // Guardar en caché
      globalCache[cacheKey] = {
        data,
        timestamp: now
      };
      
      return data;
    } catch (err) {
      console.error(`Error en consulta para ${cacheKey}:`, err);
      throw err;
    }
  }, []); // Removed supabase from dependency array
  
  // Función para limpiar el caché
  const clearCache = useCallback((cacheKey?: string) => {
    if (cacheKey) {
      delete globalCache[cacheKey];
    } else {
      // Limpiar todo el caché
      Object.keys(globalCache).forEach(key => {
        delete globalCache[key];
      });
    }
  }, []);
  
  // Función para obtener compañías por período
  const getCompaniasByPeriodo = useCallback(async (periodo: string) => {
    return getCachedData(
      'companias',
      supabase
        .from('companias')
        .select('*')
        .eq('periodo', periodo)
        .order('total_primauf', { ascending: false }),
      `companias_${periodo}`
    );
  }, [getCachedData, supabase]);
  
  // Función para obtener la evolución del mercado
  const getEvolucionMercado = useCallback(async () => {
    return getCachedData(
      'evolucion_mercado',
      supabase
        .from('evolucion_mercado')
        .select('*')
        .order('periodo'),
      'evolucion_mercado'
    );
  }, [getCachedData, supabase]);
  
  // Función para obtener datos históricos de compañías
  const getHistoricalCompanias = useCallback(async () => {
    return getCachedData(
      'historical_companias',
      supabase
        .from('historical_companias')
        .select('*')
        .order('periodo'),
      'historical_companias'
    );
  }, [getCachedData, supabase]);
  
  // Función para obtener datos de corredores
  const getCorredoresByPeriodo = useCallback(async (periodo: string) => {
    return getCachedData(
      'corredores',
      supabase
        .from('corredores')
        .select('*')
        .eq('periodo', periodo)
        .order('total_primauf', { ascending: false }),
      `corredores_${periodo}`
    );
  }, [getCachedData, supabase]);
  
  // Función para obtener datos de ramos
  const getRamosByPeriodo = useCallback(async (periodo: string) => {
    return getCachedData(
      'ramos',
      supabase
        .from('ramos')
        .select('*')
        .eq('periodo', periodo)
        .order('total_primauf', { ascending: false }),
      `ramos_${periodo}`
    );
  }, [getCachedData, supabase]);
  
  // Función para obtener datos de HHI
  const getHHIData = useCallback(async () => {
    return getCachedData(
      'hhi_data',
      supabase
        .from('hhi_data')
        .select('*')
        .order('periodo'),
      'hhi_data'
    );
  }, [getCachedData, supabase]);
  
  // Función para obtener datos de memoria anual
  const getMemoriaAnualData = useCallback(async (periodo: string) => {
    return getCachedData(
      'memoria_anual',
      supabase
        .from('memoria_anual')
        .select('*')
        .eq('periodo', periodo),
      `memoria_anual_${periodo}`
    );
  }, [getCachedData, supabase]);
  
  // Función para obtener datos de movimientos de compañías
  const getMovimientosCompanias = useCallback(async () => {
    return getCachedData(
      'movimientos_companias',
      supabase
        .from('movimientos_companias')
        .select('*')
        .order('periodo'),
      'movimientos_companias'
    );
  }, [getCachedData, supabase]);
  
  // Función para obtener datos de movimientos de corredores
  const getMovimientosCorredores = useCallback(async () => {
    return getCachedData(
      'movimientos_corredores',
      supabase
        .from('movimientos_corredores')
        .select('*')
        .order('periodo'),
      'movimientos_corredores'
    );
  }, [getCachedData, supabase]);
  
  // Función para obtener períodos disponibles
  const getPeriodos = useCallback(async () => {
    return getCachedData(
      'periodos',
      supabase
        .from('periodos')
        .select('*')
        .order('periodo', { ascending: false }),
      'periodos'
    );
  }, [getCachedData, supabase]);
  
  // Función para cargar datos iniciales
  const loadData = useCallback(async () => {
    try {
      // Cargar períodos
      const periodos = await getPeriodos();
      
      // Si hay períodos, cargar datos del último período
      if (periodos && periodos.length > 0) {
        const ultimoPeriodo = periodos[0].periodo;
        
        // Cargar datos en paralelo
        await Promise.all([
          getCompaniasByPeriodo(ultimoPeriodo),
          getCorredoresByPeriodo(ultimoPeriodo),
          getRamosByPeriodo(ultimoPeriodo),
          getEvolucionMercado(),
          getHHIData(),
          getHistoricalCompanias(),
          getMovimientosCompanias(),
          getMovimientosCorredores()
        ]);
        
        console.log('Datos iniciales cargados correctamente');
      }
    } catch (err) {
      console.error('Error al cargar datos iniciales:', err);
    }
  }, [
    getPeriodos,
    getCompaniasByPeriodo,
    getCorredoresByPeriodo,
    getRamosByPeriodo,
    getEvolucionMercado,
    getHHIData,
    getHistoricalCompanias,
    getMovimientosCompanias,
    getMovimientosCorredores
  ]);
  
  // Cargar datos iniciales al montar el componente
  useEffect(() => {
    loadData();
  }, [loadData]);
  
  // Función para obtener datos de concentración del mercado
  const getConcentracionMercado = useCallback(async (periodo: string) => {
    return getCachedData(
      'concentracion_mercado',
      supabase
        .from('vista_concentracion_mercado')
        .select('*')
        .eq('periodo', periodo),
      `concentracion_mercado_${periodo}`
    );
  }, [getCachedData, supabase]);
  
  // Función para obtener datos históricos de concentración
  const getHistoricalConcentracion = useCallback(async () => {
    return getCachedData(
      'historical_concentracion',
      supabase
        .from('historical_concentracion')
        .select('*')
        .order('periodo'),
      'historical_concentracion'
    );
  }, [getCachedData, supabase]);
  
  // Función genérica para obtener datos con caché
  const fetchWithCache = useCallback(async (
    table: string,
    filters: Record<string, any> = {},
    cacheKey?: string
  ) => {
    const key = cacheKey || table;
    
    let query = supabase.from(table).select('*');
    
    // Aplicar filtros
    if (filters.eq) {
      Object.entries(filters.eq).forEach(([column, value]) => {
        query = query.eq(column, value);
      });
    }
    
    if (filters.order) {
      query = query.order(filters.order.column, { ascending: filters.order.ascending });
    }
    
    return getCachedData(table, query, key);
  }, [getCachedData, supabase]);
  
  return {
    getCompaniasByPeriodo,
    getCorredoresByPeriodo,
    getRamosByPeriodo,
    getEvolucionMercado,
    getHHIData,
    getHistoricalCompanias,
    getMemoriaAnualData,
    getMovimientosCompanias,
    getMovimientosCorredores,
    getPeriodos,
    clearCache,
    // Add the missing methods
    fetchWithCache,
    getConcentracionMercado,
    getHistoricalConcentracion,
    supabase
  };
}

export default useSupabaseCache;