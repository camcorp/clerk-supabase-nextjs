'use client';

import { useState, useEffect } from 'react';
import { useSupabaseCache } from '../supabase/useSupabaseCache';

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
    supabase
  } = useSupabaseCache();
  
  useEffect(() => {
    async function loadData() {
      if (!selectedPeriodo) return;
      
      try {
        setLoading(true);
        
        // 1. Cargar evolución del mercado usando caché
        const evolucionData = await getEvolucionMercado() as any[] || [];
        setEvolucionMercado(evolucionData);
        
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
                tipo: item.grupo?.includes('Vida') ? 'VIDA' : 'GENERALES'
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
          }
          
          // Obtener datos de entradas y salidas de corredores
          // Fix for line 214
          const { data: movimientosCorredores, error: movimientosCorredoresError } = await supabase
            .from('vista_evolucion_corredores')
            .select('periodo, tipo_cambio')
            .eq('periodo', selectedPeriodo);
          
          if (movimientosCorredoresError) {
            console.error('Error al obtener datos de movimientos de corredores:', movimientosCorredoresError);
          }
          
          if (movimientosCorredores) {
            entradasCorredores = movimientosCorredores.filter((item: { tipo_cambio: string }) => item.tipo_cambio === 'entrada').length;
            salidasCorredores = movimientosCorredores.filter((item: { tipo_cambio: string }) => item.tipo_cambio === 'salida').length;
          }
          
        } catch (err) {
          console.error('Error al procesar datos de corredores:', err);
        }
        
        // Actualizar el resumen
        setSummary({
          totalGenerales,
          totalVida,
          totalMercado,
          crecimientoGenerales,
          crecimientoVida,
          crecimientoTotal,
          entradasPeriodo,
          salidasPeriodo,
          companiasCount: companiasData.length,
          companiasGeneralesCount: companiasGenerales.length,
          companiasVidaCount: companiasVida.length,
          corredoresCount,
          crecimientoCorredores,
          entradasCorredores,
          salidasCorredores
        });
        
      } catch (err: any) {
        console.error('Error detallado al cargar datos del mercado:', err);
        setError(err.message || 'Error desconocido');
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [selectedPeriodo, periodos, getEvolucionMercado, getConcentracionMercado, getHistoricalCompanias, getHistoricalConcentracion, supabase]);
  
  return {
    evolucionMercado,
    concentracionMercado,
    historicalConcentracion,
    summary,
    loading,
    error
  };
}