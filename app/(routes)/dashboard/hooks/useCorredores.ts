'use client';

import { useState, useEffect } from 'react';
import { useSupabaseCache } from './useSupabaseCache';

// Interfaz existente para Corredor (datos principales)
export interface Corredor {
  rut: string;
  // nombre: string; // 'nombre' no existe en 'intercia', se usa 'nombrecia'
  nombrecia: string; // Asegúrate que este campo exista en 'intercia' y 'vista_corredores_periodo'
  periodo: string;
  primauf: number; // Para 'intercia'
  total_uf?: number; // Para 'vista_corredores_periodo'
  // Añade otros campos que esperas de 'vista_corredores_periodo' si son diferentes
}

// Interfaz para los datos de evolución de corredores
export interface CorredorEvolucionItem {
  periodo: string;
  tipo_cambio?: 'entrada' | 'salida' | 'permanencia' | 'desconocido'; // Opcional ahora
  rut?: string; // Opcional, si está presente
  nombre?: string; // Opcional, si está presente
  num_entradas?: number; // Nuevo campo de la vista agregada
  num_salidas?: number; // Nuevo campo de la vista agregada
  // Otros campos relevantes
  [key: string]: any; // Para flexibilidad si hay más campos no definidos explícitamente
}

/**
 * Hook para obtener datos de corredores del mercado
 * @param selectedPeriodo Período seleccionado
 * @param periodos Lista de períodos disponibles (opcional, si no se usa directamente aquí)
 */
export function useCorredores(selectedPeriodo: string, periodos?: string[]) { // periodos es opcional si no se usa
  const [corredoresData, setCorredoresData] = useState<Corredor[]>([]); // Datos de 'intercia' para el período
  const [historicalCorredores, setHistoricalCorredores] = useState<Corredor[]>([]); // Datos históricos de 'vista_corredores_periodo'
  const [evolucionCorredores, setEvolucionCorredores] = useState<CorredorEvolucionItem[]>([]);
  // Nuevos estados para los datos por región y tipo de persona
  const [corredoresRegion, setCorredoresRegion] = useState<any[]>([]);
  const [corredoresTipoPersona, setCorredoresTipoPersona] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    // getCorredoresByPeriodo, // Se usará fetchWithCache para 'intercia' y 'vista_corredores_periodo'
    // getEvolucionCorredores,
    // getHistoricalCorredores, // Nueva función importada
    getCorredoresByRegion,
    getCorredoresByTipoPersona,
    fetchWithCache,
    supabase // supabase puede no ser necesario aquí si todo se maneja vía useSupabaseCache
  } = useSupabaseCache();
  
  useEffect(() => {
    async function loadData() {
      if (!selectedPeriodo) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // 1. Cargar datos de corredores del período actual (ej. de 'intercia' o 'vista_corredores_periodo')
        // Si 'corredoresData' debe ser específicamente de 'intercia':
        try {
          const currentPeriodoCorredores = await fetchWithCache('intercia', { // O 'vista_corredores_periodo' si es la fuente principal
            select: 'rut, nombrecia, periodo, primauf', // Ajusta los campos según la tabla
            eq: { periodo: selectedPeriodo }, // Filtrar por período si es necesario
            order: { periodo: { ascending: true } } // O por primauf, etc.
          }) as Corredor[] || [];
          setCorredoresData(currentPeriodoCorredores);
        } catch (err) {
          console.error('Error al cargar datos de corredores del período:', err);
          setCorredoresData([]);
        }

        // 2. Cargar datos históricos de corredores de 'vista_corredores_periodo'
        try {
          const historicalData = await fetchWithCache('vista_corredores_periodo', {
            order: { periodo: { ascending: true } }
          }) as Corredor[] || [];
          setHistoricalCorredores(historicalData);
        } catch (err) {
          console.error('Error al cargar datos históricos de corredores:', err);
          setHistoricalCorredores([]);
        }
        
        // 3. Cargar evolución de corredores
        try {
          const evolucionData = await fetchWithCache('vista_evolucion_corredores_agrupado', {
            order: { periodo: { ascending: true } }
          }) as any[] || [];
          
          if (!Array.isArray(evolucionData)) {
            console.error('Error al obtener datos de vista_evolucion_corredores_agrupado: Datos no válidos');
            setEvolucionCorredores([]);
          } else {
            // Transformar los datos de la vista agregada al formato esperado por los componentes
            const datosCorregidos = evolucionData.map((item: any): CorredorEvolucionItem => ({
              ...item,
              // No necesitamos asignar tipo_cambio ya que ahora trabajamos con conteos
            }));
            setEvolucionCorredores(datosCorregidos);
          }
        } catch (err) {
          console.error('Error al obtener datos de vista_evolucion_corredores_agrupado:', err);
          setEvolucionCorredores([]);
        }

        // 4. Cargar datos de corredores por región
        try {
          const regionData = await getCorredoresByRegion(selectedPeriodo) as any[] || [];
          setCorredoresRegion(regionData);
        } catch (err) {
          console.error('Error al cargar datos de corredores por región:', err);
          setCorredoresRegion([]);
        }

        // 5. Cargar datos de corredores por tipo de persona
        try {
          const tipoPersonaData = await getCorredoresByTipoPersona(selectedPeriodo) as any[] || [];
          setCorredoresTipoPersona(tipoPersonaData);
        } catch (err) {
          console.error('Error al cargar datos de corredores por tipo de persona:', err);
          setCorredoresTipoPersona([]);
        }
        
      } catch (err: any) {
        console.error('Error detallado en useCorredores:', err);
        setError(err.message || 'Error desconocido');
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [
    selectedPeriodo,
    // periodos, // Incluir solo si se usa en el efecto
    // getEvolucionCorredores,
    // getHistoricalCorredores,
    getCorredoresByRegion,
    getCorredoresByTipoPersona,
    fetchWithCache
    // supabase // Incluir solo si se usa directamente
  ]);
  
  return {
    corredoresData,
    historicalCorredores, // Devolver los datos históricos
    evolucionCorredores,
    corredoresRegion, // Nuevos datos
    corredoresTipoPersona, // Nuevos datos
    loading,
    error
  };
}