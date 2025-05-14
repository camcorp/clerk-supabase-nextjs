'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Tipo para la configuración de caché
interface CacheConfig {
  ttl: number; // Tiempo de vida en milisegundos
  maxSize?: number; // Tamaño máximo del caché (opcional)
}

// Tipo para los elementos en caché
interface CacheItem<T> {
  data: T;
  timestamp: number;
}

// Tipo para el estado del caché
interface CacheState {
  [key: string]: {
    [query: string]: CacheItem<any>;
  };
}

// Configuración predeterminada
const DEFAULT_CONFIG: CacheConfig = {
  ttl: 5 * 60 * 1000, // 5 minutos por defecto
  maxSize: 100 // Máximo 100 elementos en caché
};

export function useSupabaseCache(config: Partial<CacheConfig> = {}) {
  const supabase = createClientComponentClient();
  const [cache, setCache] = useState<CacheState>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Combinar la configuración proporcionada con los valores predeterminados
  const cacheConfig: CacheConfig = {
    ...DEFAULT_CONFIG,
    ...config
  };
  
  // Función para generar una clave de caché basada en la tabla y los parámetros
  const generateCacheKey = (table: string, params: Record<string, any>): string => {
    return JSON.stringify(params);
  };
  
  // Función para verificar si un elemento en caché es válido
  const isCacheValid = (item: CacheItem<any>): boolean => {
    return Date.now() - item.timestamp < cacheConfig.ttl;
  };
  
  // Función para obtener datos con caché
  const fetchWithCache = useCallback(async <T>(
    table: string,
    params: {
      select?: string;
      eq?: Record<string, any>;
      order?: Record<string, { ascending: boolean }>;
      single?: boolean;
    } = {}
  ): Promise<T> => {
    try {
      setLoading(true);
      
      // Generar clave de caché
      const cacheKey = generateCacheKey(table, params);
      
      // Verificar si los datos están en caché y son válidos
      if (cache[table] && cache[table][cacheKey] && isCacheValid(cache[table][cacheKey])) {
        setLoading(false);
        return cache[table][cacheKey].data;
      }
      
      // Si no están en caché o han expirado, realizar la consulta
      let query = supabase.from(table).select(params.select || '*');
      
      // Aplicar filtros de igualdad
      if (params.eq) {
        Object.entries(params.eq).forEach(([column, value]) => {
          query = query.eq(column, value);
        });
      }
      
      // Aplicar ordenamiento
      if (params.order) {
        Object.entries(params.order).forEach(([column, { ascending }]) => {
          query = query.order(column, { ascending });
        });
      }
      
      // Ejecutar como consulta única si se especifica
      const { data, error } = params.single 
        ? await query.single() 
        : await query;
      
      if (error) {
        throw error;
      }
      
      // Almacenar en caché
      setCache(prevCache => {
        const tableCache = prevCache[table] || {};
        
        // Crear una copia del caché actual
        const newCache = {
          ...prevCache,
          [table]: {
            ...tableCache,
            [cacheKey]: {
              data,
              timestamp: Date.now()
            }
          }
        };
        
        // Limitar el tamaño del caché si es necesario
        if (cacheConfig.maxSize && Object.keys(tableCache).length >= cacheConfig.maxSize) {
          // Eliminar la entrada más antigua
          const oldestKey = Object.keys(tableCache).reduce((oldest, key) => {
            return tableCache[key].timestamp < tableCache[oldest].timestamp ? key : oldest;
          }, Object.keys(tableCache)[0]);
          
          delete newCache[table][oldestKey];
        }
        
        return newCache;
      });
      
      return data as T;
    } catch (err: any) {
      console.error(`Error al obtener datos de ${table}:`, err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cache, cacheConfig.maxSize, cacheConfig.ttl, supabase]);
  
  // Función para invalidar el caché de una tabla específica
  const invalidateCache = useCallback((table?: string) => {
    if (table) {
      setCache(prevCache => {
        const newCache = { ...prevCache };
        delete newCache[table];
        return newCache;
      });
    } else {
      // Invalidar todo el caché
      setCache({});
    }
  }, []);
  
  // Función para obtener datos de compañías por período
  const getCompaniasByPeriodo = useCallback(async (periodo: string) => {
    return fetchWithCache('vista_companias_periodo', {
      eq: { periodo },
      order: { total_primauf: { ascending: false } }
    });
  }, [fetchWithCache]);
  
  // Función para obtener datos de evolución del mercado
  const getEvolucionMercado = useCallback(async () => {
    return fetchWithCache('vista_evolucion_mercado', {
      order: { periodo: { ascending: true } }
    });
  }, [fetchWithCache]);
  
  // Función para obtener datos de concentración del mercado por período
  const getConcentracionMercado = useCallback(async (periodo: string) => {
    return fetchWithCache('vista_concentracion_mercado', {
      eq: { periodo }
    });
  }, [fetchWithCache]);
  
  // Función para obtener datos históricos de compañías
  const getHistoricalCompanias = useCallback(async () => {
    return fetchWithCache('vista_companias_periodo', {
      order: { periodo: { ascending: true } }
    });
  }, [fetchWithCache]);
  
  // Función para obtener datos históricos de concentración
  const getHistoricalConcentracion = useCallback(async () => {
    return fetchWithCache('vista_concentracion_mercado', {
      order: { periodo: { ascending: true } }
    });
  }, [fetchWithCache]);
  
  // Función para obtener datos de ramos por período
  const getRamosByPeriodo = useCallback(async (periodo: string) => {
    return fetchWithCache('vista_ramos_periodo', {
      eq: { periodo },
      order: { total_primauf: { ascending: false } }
    });
  }, [fetchWithCache]);
  
  // Función para obtener datos de corredores por período
  const getCorredoresByPeriodo = useCallback(async (periodo: string) => {
    return fetchWithCache('vista_corredores_periodo', {
      eq: { periodo },
      order: { total_uf: { ascending: false } }
    });
  }, [fetchWithCache]);
  
  // Función para obtener datos de evolución de corredores
  const getEvolucionCorredores = useCallback(async () => {
    return fetchWithCache('vista_evolucion_corredores', {
      order: { periodo: { ascending: true } }
    });
  }, [fetchWithCache]);
  
  return {
    loading,
    error,
    fetchWithCache,
    invalidateCache,
    getCompaniasByPeriodo,
    getEvolucionMercado,
    getConcentracionMercado,
    getHistoricalCompanias,
    getHistoricalConcentracion,
    getRamosByPeriodo,
    getCorredoresByPeriodo,
    getEvolucionCorredores
  };
}