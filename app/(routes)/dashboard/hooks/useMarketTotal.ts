'use client';

import { useState, useEffect } from 'react';
import { useSupabaseCache } from './useSupabaseCache';
// Podrías importar CorredorEvolucionItem si la estructura es idéntica
// import { CorredorEvolucionItem } from './useCorredores'; 

export interface PeriodSummary {
  totalGenerales: number;
  totalVida: number;
  totalMercado: number;
  crecimientoGenerales: number | null;
  crecimientoVida: number | null;
  crecimientoTotal: number | null;
  entradasPeriodo: number;
  salidasPeriodo: number;
  companiasCount: number;
  companiasGeneralesCount: number;
  companiasVidaCount: number;
  // Campos para corredores
  corredoresCount: number;
  crecimientoCorredores: number | null;
  entradasCorredores: number;
  salidasCorredores: number;
}

// Interfaz local para los datos de evolución de corredores si es diferente de CorredorEvolucionItem
interface MarketTotalEvolucionCorredorItem {
  periodo: string;
  tipo_cambio: string; // O ser más específico: 'entrada' | 'salida' | ...
  // otros campos si los hay
}

/**
 * Hook para obtener datos del mercado total
 * @param selectedPeriodo Período seleccionado
 * @param periodos Lista de períodos disponibles
 */
export function useMarketTotal(selectedPeriodo: string, periodos: string[]) {
  const [evolucionMercado, setEvolucionMercado] = useState<any[]>([]);
  const [concentracionMercado, setConcentracionMercado] = useState<any[]>([]);
  const [historicalConcentracion, setHistoricalConcentracion] = useState<any[]>([]);
  const [summary, setSummary] = useState<PeriodSummary>({
    totalGenerales: 0,
    totalVida: 0,
    totalMercado: 0,
    crecimientoGenerales: null,
    crecimientoVida: null,
    crecimientoTotal: null,
    entradasPeriodo: 0,
    salidasPeriodo: 0,
    companiasCount: 0,
    companiasGeneralesCount: 0,
    companiasVidaCount: 0,
    // Valores iniciales para corredores
    corredoresCount: 0,
    crecimientoCorredores: null,
    entradasCorredores: 0,
    salidasCorredores: 0
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Usar nuestro hook de caché
  const { 
    getEvolucionMercado,
    getConcentracionMercado,
    getHistoricalCompanias,
    getHistoricalConcentracion,
    // getEvolucionCorredores, // Si decides usarlo desde useSupabaseCache
    supabase
  } = useSupabaseCache();
  
  useEffect(() => {
    async function loadData() {
      if (!selectedPeriodo) return;
      
      try {
        setLoading(true);
        
        // En la función loadData()
        // 1. Cargar evolución del mercado usando caché
        // En la función loadData(), después de obtener evolucionData
        // Reemplaza esta línea:
        // const evolucionData = await getEvolucionMercado() as any[] || [];
        // console.log('Datos de evolución obtenidos:', evolucionData);
        // setEvolucionMercado(evolucionData);
        
        // Con este código:
        const evolucionData = await getEvolucionMercado() as any[] || [];
        console.log('Datos de evolución obtenidos (raw):', evolucionData);
        
        // Procesar datos de evolución para agrupar por período
        interface PeriodoGroup {
          periodo: string;
          entradas: any[];
          salidas: any[];
        }
        
        const processedEvolucionData: {periodo: string; num_entradas: number; num_salidas: number}[] = [];
        if (Array.isArray(evolucionData) && evolucionData.length > 0) {
          // Agrupar por período
          const periodoGroups: Record<string, PeriodoGroup> = {};
          
          evolucionData.forEach(item => {
            if (!periodoGroups[item.periodo]) {
              periodoGroups[item.periodo] = {
                periodo: item.periodo,
                entradas: [],
                salidas: []
              };
            }
            
            if (item.tipo_cambio === 'entrada') {
              periodoGroups[item.periodo].entradas.push(item);
            } else if (item.tipo_cambio === 'salida') {
              periodoGroups[item.periodo].salidas.push(item);
            }
          });
          
          // Convertir a array y calcular conteos
          Object.values(periodoGroups).forEach(group => {
            processedEvolucionData.push({
              periodo: group.periodo,
              num_entradas: group.entradas.length,
              num_salidas: group.salidas.length
            });
          });
          
          console.log('Datos de evolución procesados:', processedEvolucionData);
          setEvolucionMercado(processedEvolucionData);
        } else {
          console.log('No hay datos de evolución disponibles');
          setEvolucionMercado([]);
        }
        
        // 2. Cargar concentración del mercado usando caché
        try {
          const concentracionData = await getConcentracionMercado(selectedPeriodo) as any[] || [];
          
          // Transformar los datos para que tengan la estructura esperada por los componentes
          const transformedConcentracionData = Array.isArray(concentracionData) 
            ? concentracionData.map((item: any) => ({
                ...item,
                grupo: item.grupo,
                total_uf: item.total_uf || 0,
                participacion_porcentaje: item.participacion_porcentaje || 0,
                hhi: item.hhi || 0,
                tipo: item.grupo === '2' ? 'VIDA' : 'GENERALES'
              }))
            : [];
          
          setConcentracionMercado(transformedConcentracionData);
        } catch (err) {
          console.error('Error al obtener datos de vista_concentracion_mercado:', err);
          setConcentracionMercado([]);
        }
        
        // 3. Cargar datos históricos de compañías
        const historicalCompaniasData = await getHistoricalCompanias() as any[] || [];
        
        // 4. Cargar datos históricos de concentración
        try {
          const historicalConcentracionData = await getHistoricalConcentracion() as any[] || [];
          setHistoricalConcentracion(historicalConcentracionData);
        } catch (err) {
          console.error('Error al cargar datos históricos de concentración:', err);
          setHistoricalConcentracion([]);
        }
        
        // 5. Calcular resumen
        // Obtener compañías del período seleccionado
        const companiasData = historicalCompaniasData.filter((item: any) => item.periodo === selectedPeriodo);
        const companiasGenerales = Array.isArray(companiasData)
          ? companiasData.filter((item: any) => item.tipo === 'Generales')
          : [];
        const companiasVida = Array.isArray(companiasData)
          ? companiasData.filter((item: any) => item.tipo === 'Vida')
          : [];
        
        // Calcular totales
        const totalGenerales = companiasGenerales.reduce((sum: number, company: any) => sum + company.total_primauf, 0);
        const totalVida = companiasVida.reduce((sum: number, company: any) => sum + company.total_primauf, 0);
        const totalMercado = totalGenerales + totalVida;
        
        // Calcular movimientos para el período seleccionado
        const movimientosPeriodo = Array.isArray(evolucionData)
          ? evolucionData.filter((item: any) => item.periodo === selectedPeriodo)
          : [];
        const entradasPeriodo = movimientosPeriodo.filter((item: any) => item.tipo_cambio === 'entrada').length;
        const salidasPeriodo = movimientosPeriodo.filter((item: any) => item.tipo_cambio === 'salida').length;
        
        // Calcular crecimiento respecto al período anterior
        const periodoIndex = periodos.indexOf(selectedPeriodo);
        const periodoAnterior = periodoIndex < periodos.length - 1 ? periodos[periodoIndex + 1] : null;
        
        let crecimientoGenerales = null;
        let crecimientoVida = null;
        let crecimientoTotal = null;
        
        if (periodoAnterior) {
          const companiasAnteriores = Array.isArray(historicalCompaniasData)
            ? historicalCompaniasData.filter((item: any) => item.periodo === periodoAnterior)
            : [];
          const companiasGeneralesAnteriores = companiasAnteriores.filter((item: any) => item.tipo === 'Generales');
          const companiasVidaAnteriores = companiasAnteriores.filter((item: any) => item.tipo === 'Vida');
          
          const totalGeneralesAnterior = companiasGeneralesAnteriores.reduce((sum: number, company: any) => sum + company.total_primauf, 0);
          const totalVidaAnterior = companiasVidaAnteriores.reduce((sum: number, company: any) => sum + company.total_primauf, 0);
          const totalMercadoAnterior = totalGeneralesAnterior + totalVidaAnterior;
          
          if (totalGeneralesAnterior > 0) {
            crecimientoGenerales = ((totalGenerales - totalGeneralesAnterior) / totalGeneralesAnterior) * 100;
          }
          
          if (totalVidaAnterior > 0) {
            crecimientoVida = ((totalVida - totalVidaAnterior) / totalVidaAnterior) * 100;
          }
          
          if (totalMercadoAnterior > 0) {
            crecimientoTotal = ((totalMercado - totalMercadoAnterior) / totalMercadoAnterior) * 100;
          }
        }
        
        // Obtener datos de corredores para el período seleccionado
        let corredoresCount = 0;
        let crecimientoCorredores = null;
        let entradasCorredores = 0;
        let salidasCorredores = 0;
        
        try {
          // Consultar vista_corredores_periodo para obtener el número de corredores
          const { data: corredoresData, error: corredoresError } = await supabase
            .from('vista_corredores_periodo')
            .select('periodo, num_corredores')
            .eq('periodo', selectedPeriodo)
            .single();
          
          if (corredoresError) {
            console.error('Error al obtener datos de corredores:', corredoresError);
          }
          
          if (corredoresData) {
            console.log('Datos de corredores obtenidos:', corredoresData);
            corredoresCount = corredoresData.num_corredores || 0;
            
            // Obtener datos del período anterior para calcular crecimiento
            if (periodoAnterior) {
              const { data: corredoresDataAnterior, error: corredoresAnteriorError } = await supabase
                .from('vista_corredores_periodo')
                .select('periodo, num_corredores')
                .eq('periodo', periodoAnterior)
                .single();
              
              if (corredoresAnteriorError) {
                console.error('Error al obtener datos de corredores del período anterior:', corredoresAnteriorError);
              }
              
              if (corredoresDataAnterior && corredoresDataAnterior.num_corredores > 0) {
                crecimientoCorredores = ((corredoresCount - corredoresDataAnterior.num_corredores) / corredoresDataAnterior.num_corredores) * 100;
              }
            }
            
            // Obtener datos de evolución de corredores para calcular entradas y salidas
            // const evolucionCorredoresData = await getEvolucionCorredores() as MarketTotalEvolucionCorredorItem[] || [];
            // O si se sigue usando la llamada directa:
            const { data: evolucionCorredoresData, error: evolucionError } = await supabase
              .from('vista_evolucion_corredores')
              .select('periodo, tipo_cambio') // Selecciona solo los campos necesarios
              .eq('periodo', selectedPeriodo);
            
            if (evolucionError) {
              console.error('Error al obtener datos de evolución de corredores:', evolucionError);
            }
            
            if (evolucionCorredoresData && Array.isArray(evolucionCorredoresData)) {
              const typedEvolucionCorredoresData = evolucionCorredoresData as MarketTotalEvolucionCorredorItem[];
              console.log('Datos de evolución de corredores:', typedEvolucionCorredoresData);
              entradasCorredores = typedEvolucionCorredoresData.filter(item => item.tipo_cambio === 'entrada').length;
              salidasCorredores = typedEvolucionCorredoresData.filter(item => item.tipo_cambio === 'salida').length;
            }
          }
        } catch (err) {
          console.error('Error al obtener datos de corredores:', err);
        }
        
        // Calcular totales directamente de vista_concentracion_mercado
        let totalGeneralesFromDB = 0;
        let totalVidaFromDB = 0;
        let totalMercadoFromDB = 0;
        
        try {
          // Consultar totales por grupo
          const { data: totalesPorGrupo, error: totalesError } = await supabase
            .from('vista_concentracion_mercado')
            .select('grupo, total_uf')
            .eq('periodo', selectedPeriodo);
          
          if (totalesError) {
            console.error('Error al obtener totales por grupo:', totalesError);
          } else if (totalesPorGrupo && Array.isArray(totalesPorGrupo)) {
            // Grupo 1 = Generales, Grupo 2 = Vida
            const grupoGenerales = totalesPorGrupo.filter(item => item.grupo === '1');
            const grupoVida = totalesPorGrupo.filter(item => item.grupo === '2');
            
            totalGeneralesFromDB = grupoGenerales.reduce((sum, item) => sum + Number(item.total_uf || 0), 0);
            totalVidaFromDB = grupoVida.reduce((sum, item) => sum + Number(item.total_uf || 0), 0);
            totalMercadoFromDB = totalGeneralesFromDB + totalVidaFromDB;
          }
        } catch (err) {
          console.error('Error al calcular totales del mercado:', err);
        }
        
        // Actualizar el objeto summary con los nuevos totales
        setSummary({
          totalGenerales: totalGeneralesFromDB, // Use the values from DB instead
          totalVida: totalVidaFromDB,
          totalMercado: totalMercadoFromDB,
          crecimientoGenerales,
          crecimientoVida,
          crecimientoTotal,
          entradasPeriodo,
          salidasPeriodo,
          companiasCount: Array.isArray(companiasData) ? companiasData.length : 0,
          companiasGeneralesCount: companiasGenerales.length,
          companiasVidaCount: companiasVida.length,
          // Datos de corredores
          corredoresCount,
          crecimientoCorredores,
          entradasCorredores,
          salidasCorredores
        });
        
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
    getEvolucionMercado,
    getConcentracionMercado,
    getHistoricalCompanias,
    getHistoricalConcentracion,
    supabase
  ]);
  
  return {
    evolucionMercado,
    concentracionMercado,
    historicalConcentracion,
    summary,
    loading,
    error
  };
}