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
}

export function useMarketData(selectedPeriodo: string, periodos: string[]) {
  const [companias, setCompanias] = useState<Compania[]>([]);
  const [evolucionMercado, setEvolucionMercado] = useState<any[]>([]);
  const [evolucionCorredores, setEvolucionCorredores] = useState<any[]>([]);
  const [concentracionMercado, setConcentracionMercado] = useState<any[]>([]);
  const [actoresSalientes, setActoresSalientes] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [companiasData, setCompaniasData] = useState<any[]>([]);
  const [historicalCompanias, setHistoricalCompanias] = useState<any[]>([]);
  const [historicalConcentracion, setHistoricalConcentracion] = useState<any[]>([]);
  const [movimientosCompanias, setMovimientosCompanias] = useState<any[]>([]);
  const [corredoresData, setCorredoresData] = useState<any[]>([]);
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
    companiasVidaCount: 0
  });
  
  // Usar nuestro hook de caché en lugar del cliente Supabase directo
  const { 
    getCompaniasByPeriodo,
    getEvolucionMercado,
    getConcentracionMercado,
    getHistoricalCompanias,
    getHistoricalConcentracion,
    getCorredoresByPeriodo,
    getEvolucionCorredores,
    fetchWithCache
  } = useSupabaseCache();
  
  useEffect(() => {
    async function loadData() {
      if (!selectedPeriodo) return;
      
      try {
        setLoading(true);
        
        // 1. Cargar compañías del período seleccionado usando caché
        const companiasData = await getCompaniasByPeriodo(selectedPeriodo) as any[] || [];
        setCompanias(companiasData as Compania[]);
        
        // 2. Cargar evolución del mercado usando caché
        const evolucionData = await getEvolucionMercado() as any[] || [];
        setEvolucionMercado(evolucionData);
        
        // 3. Cargar concentración del mercado usando caché
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
        
        // 4. Cargar actores salientes
        try {
          const actoresSalientesData = await fetchWithCache('actores_salientes', {
            eq: { fecha_salida: selectedPeriodo }
          }) as any[] || [];
          setActoresSalientes(actoresSalientesData);
        } catch (err) {
          console.error('Error al cargar actores salientes:', err);
          setActoresSalientes([]);
        }
        
        // 5. Cargar datos históricos de compañías
        const historicalCompaniasData = await getHistoricalCompanias() as any[] || [];
        setHistoricalCompanias(historicalCompaniasData);
        
        // 6. Cargar datos históricos de concentración
        const historicalConcentracionData = await getHistoricalConcentracion() as any[] || [];
        setHistoricalConcentracion(historicalConcentracionData);
        
        // 7. Cargar movimientos de compañías (reutilizamos los datos de evolución)
        setMovimientosCompanias(evolucionData);
        
        // 8. Cargar datos de corredores
        try {
          const corredoresFullData = await fetchWithCache('intercia', {
            select: 'rut, nombrecia, periodo, primauf',
            order: { periodo: { ascending: true } }
          }) as any[] || [];
          setCorredoresData(corredoresFullData);
        } catch (err) {
          console.error('Error al cargar datos completos de corredores:', err);
          setCorredoresData([]);
        }
        
        // 9. Cargar evolución de corredores
        try {
          const evolucionCorredoresData = await getEvolucionCorredores() as any[] || [];
          
          // Asegurarse de que todos los registros tengan el campo tipo_cambio
          const datosCorregidos = Array.isArray(evolucionCorredoresData)
            ? evolucionCorredoresData.map((item: any) => ({
                ...item,
                tipo_cambio: item.tipo_cambio || 'desconocido'
              }))
            : [];
          
          setEvolucionCorredores(datosCorregidos);
        } catch (err) {
          console.error('Error inesperado al cargar evolución de corredores:', err);
          setEvolucionCorredores([]);
        }
        
        // 10. Calcular resumen
        // Filtrar compañías por tipo
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
        
        setSummary({
          totalGenerales,
          totalVida,
          totalMercado,
          crecimientoGenerales,
          crecimientoVida,
          crecimientoTotal,
          entradasPeriodo,
          salidasPeriodo,
          companiasCount: Array.isArray(companiasData) ? companiasData.length : 0,
          companiasGeneralesCount: companiasGenerales.length,
          companiasVidaCount: companiasVida.length
        });
        
      } catch (err: any) {
        console.error('Error al cargar datos de mercado:', err);
        setError(err.message);
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
    getConcentracionMercado,
    getHistoricalCompanias,
    getHistoricalConcentracion,
    getCorredoresByPeriodo,
    getEvolucionCorredores,
    fetchWithCache
  ]);
  
  return {
    companias,
    evolucionMercado,
    concentracionMercado,
    actoresSalientes,
    historicalCompanias,
    historicalConcentracion,
    movimientosCompanias,
    corredoresData,
    evolucionCorredores,
    summary,
    loading,
    error
  };
}