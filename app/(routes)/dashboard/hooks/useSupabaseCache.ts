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
  
  const [cache, setCache] = useState<CacheState>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Combinar la configuración proporcionada con los valores predeterminados
  const cacheConfig: CacheConfig = {
    ...DEFAULT_CONFIG,
    ...config
  };
  
  // Remove the generateCacheKey function from here
  
  // Función para obtener datos con caché
  // Move this function to the top, before it's used in other functions
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
      
      // Log para depuración
      console.log(`Iniciando consulta a tabla: ${table} con parámetros:`, params);
      
      // Move the generateCacheKey function inside the useCallback
      const generateCacheKey = (table: string, params: Record<string, any>): string => {
        return JSON.stringify(params);
      };
      
      const cacheKey = generateCacheKey(table, params);
      
      // isCacheValid function is already inside the useCallback
      const isCacheValid = (item: CacheItem<any>): boolean => {
        return Date.now() - item.timestamp < cacheConfig.ttl;
      };
      
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
      
      // Log para depuración
      console.log(`Ejecutando consulta SQL para tabla: ${table}`);
      
      // Ejecutar como consulta única si se especifica
      const { data, error } = params.single 
        ? await query.single() 
        : await query;
      
      // Log para depuración
      console.log(`Resultado de consulta a ${table}:`, { 
        tieneError: !!error, 
        tieneData: !!data, 
        cantidadRegistros: Array.isArray(data) ? data.length : (data ? 1 : 0) 
      });
      
      if (error) {
        // Check if it's a "no rows returned" error for single query
        if (params.single && error.code === 'PGRST116') {
          // For "no rows returned" in single query, return empty object but don't throw
          console.warn(`No se encontraron filas en ${table} con parámetros:`, params);
          return (params.single ? {} : []) as T;
        }
        
        // Mejorar el mensaje de error para incluir más detalles
        console.error(`Error detallado al obtener datos de ${table}:`, {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          table: table,
          params: params
        });
        
        throw new Error(`Error al consultar ${table}: ${error.message || 'Error desconocido'}`);
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
      // Mejorar el registro de errores para proporcionar más contexto
      console.error(`Error detallado al obtener datos de ${table}:`, {
        error: err,
        message: err.message,
        stack: err.stack,
        table: table,
        params: params
      });
      
      setError(err.message || `Error desconocido al consultar ${table}`);
      
      // Return empty array or object but log more details
      console.warn(`Devolviendo resultado vacío para ${table} debido a error:`, err);
      return (params.single ? {} : []) as T;
    } finally {
      setLoading(false);
    }
  }, [cache, cacheConfig.ttl, cacheConfig.maxSize, supabase]);
  
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
    try {
      console.log('Iniciando consulta de evolución de mercado');
      
      const result = await fetchWithCache('vista_evolucion_mercado', {
        order: { periodo: { ascending: true } }
      });
      
      console.log('Resultado de evolución de mercado:', result);
      
      return Array.isArray(result) ? result : [];
    } catch (err: any) {
      console.error('Error detallado al obtener datos de evolución del mercado:', {
        mensaje: err.message,
        codigo: err.code,
        detalles: err.details
      });
      
      // Proporcionar datos vacíos para evitar bloqueos en la UI
      return [];
    }
  }, [fetchWithCache]);
  
  // Función para obtener datos de concentración del mercado por período
  const getConcentracionMercado = useCallback(async (periodo: string) => {
    try {
      console.log('Iniciando consulta de concentración de mercado para periodo:', periodo);
      
      const result = await fetchWithCache('vista_concentracion_mercado', {
        eq: { periodo }
      });
      
      console.log('Resultado de concentración de mercado:', result);
      
      // Ensure we always return an array, even if the result is empty
      return Array.isArray(result) ? result : [];
    } catch (err: any) {
      console.error('Error detallado al obtener datos de concentración:', {
        mensaje: err.message,
        codigo: err.code,
        detalles: err.details,
        periodo: periodo
      });
      
      // Proporcionar datos vacíos para evitar bloqueos en la UI
      return [];
    }
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
  
  // Función para obtener datos de concentración de ramos por período
  const getConcentracionRamos = useCallback(async (periodo: string) => {
    try {
      console.log('Iniciando consulta de concentración de ramos para periodo:', periodo);
      
      // First, try to get all data to debug
      const allData = await fetchWithCache('vista_concentracion_ramos', {
        order: { periodo: { ascending: false } }
      });
      
      console.log('Todos los datos de vista_concentracion_ramos:', allData);
      console.log('Periodos disponibles:', Array.isArray(allData) ? [...new Set(allData.map(item => item.periodo))] : 'No es array');
      
      // Now filter by the specific period
      const result = await fetchWithCache('vista_concentracion_ramos', {
        eq: { periodo: periodo }
      });
      
      console.log('Resultado filtrado para periodo', periodo, ':', result);
      
      // If no data for the specific period, try to get the most recent period
      if (!result || (Array.isArray(result) && result.length === 0)) {
        console.log('No se encontraron datos para el periodo específico, buscando el más reciente');
        
        if (Array.isArray(allData) && allData.length > 0) {
          // Get the most recent period
          const periodos = [...new Set(allData.map(item => item.periodo))].sort().reverse();
          const mostRecentPeriod = periodos[0];
          
          console.log('Periodo más reciente encontrado:', mostRecentPeriod);
          
          const recentResult = await fetchWithCache('vista_concentracion_ramos', {
            eq: { periodo: mostRecentPeriod }
          });
          
          console.log('Datos del periodo más reciente:', recentResult);
          return Array.isArray(recentResult) ? recentResult : [];
        }
      }
      
      return Array.isArray(result) ? result : [];
    } catch (err: any) {
      console.error('Error detallado al obtener datos de vista_concentracion_ramos:', {
        error: err,
        message: err.message,
        periodo: periodo
      });
      return [];
    }
  }, [fetchWithCache]);
  // Función para obtener datos de grupos por período
const getGruposByPeriodo = useCallback(async (periodo: string) => {
  return fetchWithCache('vista_grupos_periodo', {
    eq: { periodo },
    order: { total_primauf: { ascending: false } }
  });
}, [fetchWithCache]);

  // Función para obtener datos históricos de grupos
  const getHistoricalGrupos = useCallback(async () => {
  return fetchWithCache('vista_grupos_periodo', {
    order: { periodo: { ascending: true } }
  });
  }, [fetchWithCache]);
  
  // Función para obtener datos de corredores por región
  const getCorredoresByRegion = useCallback(async (periodo: string) => {
  return fetchWithCache('vista_corredores_region', {
    eq: { periodo },
    order: { total_primaclp: { ascending: false } }
  });
  }, [fetchWithCache]);
  
  // Función para obtener datos históricos de corredores por región
  const getHistoricalCorredoresByRegion = useCallback(async () => {
  return fetchWithCache('vista_corredores_region', {
    order: { periodo: { ascending: true } }
  });
  }, [fetchWithCache]);
  
  // Función para obtener datos de corredores por tipo de persona
  const getCorredoresByTipoPersona = useCallback(async (periodo: string) => {
  return fetchWithCache('vista_corredores_tipo_persona', {
    eq: { periodo },
    order: { total_primaclp: { ascending: false } }
  });
  }, [fetchWithCache]);
  
  // Función para obtener datos históricos de corredores por tipo de persona
  const getHistoricalCorredoresByTipoPersona = useCallback(async () => {
  return fetchWithCache('vista_corredores_tipo_persona', {
    order: { periodo: { ascending: true } }
  });
  }, [fetchWithCache]);
  
  // Añadir estas nuevas funciones al objeto de retorno
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
  getConcentracionRamos, 
  getGruposByPeriodo,
  getHistoricalGrupos,
  getCorredoresByRegion,
  getHistoricalCorredoresByRegion,
  getCorredoresByTipoPersona,
  getHistoricalCorredoresByTipoPersona,
  supabase
  };
}