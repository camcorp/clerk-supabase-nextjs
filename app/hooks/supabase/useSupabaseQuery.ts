import { useState, useEffect, useCallback, useMemo } from 'react';
import { PostgrestError } from '@supabase/supabase-js';
import supabase from '@/lib/supabase/client';

// Tipos para los filtros y ordenamiento
type FilterValue = string | number | boolean | null;
type Filters = Record<string, FilterValue>;
type OrderBy = { column: string; ascending?: boolean };

/**
 * Hook personalizado para realizar consultas a Supabase con filtrado y ordenamiento
 * @param table Nombre de la tabla o vista a consultar
 * @param initialFilters Filtros iniciales para la consulta
 * @param initialOrderBy Ordenamiento inicial para la consulta
 * @returns Objeto con datos, estado de carga, error y funciones para manipular la consulta
 */
export function useSupabaseQuery<T = any>(
  table: string,
  initialFilters: Filters = {},
  initialOrderBy: OrderBy | null = null
) {
  // Estados para almacenar los datos y el estado de la consulta
  const [data, setData] = useState<T[] | null>(null);
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<PostgrestError | Error | null>(null);
  
  // Estados para filtros y ordenamiento
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [orderBy, setOrderBy] = useState<OrderBy | null>(initialOrderBy);
  
  // Función para aplicar filtros a la consulta
  const applyFilters = useCallback((query: any, filters: Filters) => {
    let filteredQuery = query;
    
    // Aplicar cada filtro a la consulta
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (typeof value === 'string' && value.includes('*')) {
          // Usar LIKE para búsquedas con comodines
          const likeValue = value.replace(/\*/g, '%');
          filteredQuery = filteredQuery.ilike(key, likeValue);
        } else {
          // Usar igualdad exacta para otros casos
          filteredQuery = filteredQuery.eq(key, value);
        }
      }
    });
    
    return filteredQuery;
  }, []);
  
  // Función para ejecutar la consulta
  const executeQuery = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Iniciar la consulta básica
      let query = supabase.from(table).select('*', { count: 'exact' });
      
      // Aplicar filtros si existen
      if (Object.keys(filters).length > 0) {
        query = applyFilters(query, filters);
      }
      
      // Aplicar ordenamiento si existe
      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
      }
      
      // Ejecutar la consulta
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      setData(data as T[]);
      setCount(count);
    } catch (err) {
      console.error('Error en la consulta:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setData(null);
      setCount(null);
    } finally {
      setLoading(false);
    }
  }, [table, filters, orderBy, applyFilters]);
  
  // Función para actualizar filtros
  const updateFilters = useCallback((newFilters: Filters) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters
    }));
  }, []);
  
  // Función para limpiar filtros
  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);
  
  // Función para actualizar ordenamiento
  const updateOrderBy = useCallback((column: string, ascending?: boolean) => {
    setOrderBy({ column, ascending });
  }, []);
  
  // Memorizar las dependencias del efecto para evitar bucles infinitos
  const queryDependencies = useMemo(() => {
    return JSON.stringify({ table, filters, orderBy });
  }, [table, filters, orderBy]);
  
  // Ejecutar la consulta cuando cambian los parámetros
  useEffect(() => {
    executeQuery();
  }, [queryDependencies, executeQuery]);
  
  // Retornar los datos y funciones para manipular la consulta
  return {
    data,
    count,
    loading,
    error,
    filters,
    orderBy,
    updateFilters,
    clearFilters,
    updateOrderBy,
    refresh: executeQuery
  };
}

export default useSupabaseQuery;