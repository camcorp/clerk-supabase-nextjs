'use client';

import { useState, useEffect } from 'react';
// Importar correctamente desde lib/supabase-client.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

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
  
  // Crear cliente de Supabase directamente sin tipado específico
  const supabase = createClientComponentClient();
  
  useEffect(() => {
    async function loadData() {
      if (!selectedPeriodo) return;
      
      try {
        setLoading(true);
        
        // 1. Cargar compañías del período seleccionado
        const { data: companiasData, error: companiasError } = await supabase
          .from('vista_companias_periodo')
          .select('*')
          .eq('periodo', selectedPeriodo)
          .order('total_primauf', { ascending: false });
          
        if (companiasError) {
          console.error('Error al cargar compañías:', companiasError);
          throw companiasError;
        }
        
        setCompanias(companiasData || []);
        
        // 2. Cargar evolución del mercado
        const { data: evolucionData, error: evolucionError } = await supabase
          .from('vista_evolucion_mercado')
          .select('*')
          .order('periodo', { ascending: true });
          
        if (evolucionError) {
          console.error('Error al cargar evolución:', evolucionError);
          throw evolucionError;
        }
        
        setEvolucionMercado(evolucionData || []);
        
        // 3. Cargar concentración del mercado
        const { data: concentracionData, error: concentracionError } = await supabase
          .from('vista_concentracion_mercado')
          .select('*')
          .eq('periodo', selectedPeriodo);
          
        if (concentracionError) {
          console.error('Error al cargar concentración:', concentracionError);
          throw concentracionError;
        }
        
        // Transformar los datos para que tengan la estructura esperada por los componentes
        const transformedConcentracionData = concentracionData?.map(item => ({
          ...item,
          grupo: item.grupo,
          total_uf: item.total_uf || 0,
          participacion_porcentaje: item.participacion_porcentaje || 0,
          hhi: item.hhi || 0,
          tipo: item.grupo?.includes('Vida') ? 'VIDA' : 'GENERALES'
        })) || [];
        
        setConcentracionMercado(transformedConcentracionData);
        
        // 4. Cargar actores salientes
        try {
          const { data: actoresSalientesData, error: actoresSalientesError } = await supabase
            .from('actores_salientes')
            .select('*')
            .eq('fecha_salida', selectedPeriodo);
            
          if (actoresSalientesError) {
            console.error('Error al cargar actores salientes:', actoresSalientesError);
            // No lanzar error, solo establecer un array vacío
            setActoresSalientes([]);
          } else {
            setActoresSalientes(actoresSalientesData || []);
          }
        } catch (err) {
          console.error('Error al cargar actores salientes:', err);
          setActoresSalientes([]);
        }
        
        // 5. Cargar datos históricos de compañías
        const { data: historicalCompaniasData, error: historicalCompaniasError } = await supabase
          .from('vista_companias_periodo')
          .select('*')
          .order('periodo', { ascending: true });
          
        if (historicalCompaniasError) {
          console.error('Error históricos compañías:', historicalCompaniasError);
          throw historicalCompaniasError;
        }
        
        setHistoricalCompanias(historicalCompaniasData || []);
        
        // 6. Cargar datos históricos de concentración
        const { data: historicalConcentracionData, error: historicalConcentracionError } = await supabase
          .from('vista_concentracion_mercado')
          .select('*')  // Cambiado para obtener todos los campos
          .order('periodo', { ascending: true });

        if (historicalConcentracionError) {
          console.error('Error históricos concentración:', historicalConcentracionError);
          // Establecer un array vacío para evitar errores en los componentes
          setHistoricalConcentracion([]);
        } else {
          setHistoricalConcentracion(historicalConcentracionData || []);
        }
        
        // 7. Cargar movimientos de compañías
        const { data: movimientosData, error: movimientosError } = await supabase
          .from('vista_evolucion_mercado')
          .select('*')
          .order('periodo', { ascending: true });
          
        if (movimientosError) {
          console.error('Error al cargar movimientos:', movimientosError);
          throw movimientosError;
        }
        
        setMovimientosCompanias(movimientosData || []);
        
        // 8. Cargar datos de corredores
        const { data: corredoresFullData, error: corredoresFullError } = await supabase
          .from('intercia')
          .select('rut, nombrecia, periodo, primauf')  // Corregido: prima_uf → primauf
          .order('periodo', { ascending: true });
            
        if (corredoresFullError) {
          console.error('Error al cargar datos completos de corredores:', corredoresFullError);
          setCorredoresData([]);
        } else {
          setCorredoresData(corredoresFullData || []);
        }
        
        // 9. Cargar evolución de corredores
        try {
          // Usar el cliente Supabase que ya tiene configurada la autenticación
          const { data: evolucionCorredoresData, error: evolucionCorredoresError } = await supabase
            .from('vista_evolucion_corredores')
            .select('*')  // Usar select('*') que funciona correctamente según los logs
            .order('periodo', { ascending: true });
              
          if (evolucionCorredoresError) {
            console.error('Error al cargar evolución de corredores:', evolucionCorredoresError);
            setEvolucionCorredores([]);
          } else {
            console.log('Datos de evolución de corredores cargados correctamente:', evolucionCorredoresData?.length || 0);
            
            // Asegurarse de que todos los registros tengan el campo tipo_cambio
            const datosCorregidos = evolucionCorredoresData?.map(item => ({
              ...item,
              tipo_cambio: item.tipo_cambio || 'desconocido'
            })) || [];
            
            setEvolucionCorredores(datosCorregidos);
          }
        } catch (err) {
          console.error('Error inesperado al cargar evolución de corredores:', err);
          setEvolucionCorredores([]);
        }
        
        // 10. Calcular resumen
        // Filtrar compañías por tipo
        const companiasGenerales = companiasData?.filter((item: any) => item.tipo === 'Generales') || [];
        const companiasVida = companiasData?.filter((item: any) => item.tipo === 'Vida') || [];
        
        // Calcular totales
        const totalGenerales = companiasGenerales.reduce((sum: number, company: any) => sum + company.total_primauf, 0);
        const totalVida = companiasVida.reduce((sum: number, company: any) => sum + company.total_primauf, 0);
        const totalMercado = totalGenerales + totalVida;
        
        // Calcular movimientos para el período seleccionado
        const movimientosPeriodo = evolucionData?.filter((item: any) => item.periodo === selectedPeriodo) || [];
        const entradasPeriodo = movimientosPeriodo.filter((item: any) => item.tipo_cambio === 'entrada').length;
        const salidasPeriodo = movimientosPeriodo.filter((item: any) => item.tipo_cambio === 'salida').length;
        
        // Calcular crecimiento respecto al período anterior
        const periodoIndex = periodos.indexOf(selectedPeriodo);
        const periodoAnterior = periodoIndex < periodos.length - 1 ? periodos[periodoIndex + 1] : null;
        
        let crecimientoGenerales = null;
        let crecimientoVida = null;
        let crecimientoTotal = null;
        
        if (periodoAnterior) {
          const companiasAnteriores = historicalCompaniasData?.filter((item: any) => item.periodo === periodoAnterior) || [];
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
          companiasCount: companiasData?.length || 0,
          companiasGeneralesCount: companiasGenerales.length,
          companiasVidaCount: companiasVida.length
        });
        
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar datos. Por favor, intente nuevamente.');
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [supabase, selectedPeriodo, periodos]);

  return {
    companias,
    evolucionMercado,
    evolucionCorredores,
    concentracionMercado,
    actoresSalientes,
    loading,
    error,
    companiasData,
    historicalCompanias,
    historicalConcentracion,
    movimientosCompanias,
    corredoresData,
    summary
  };
}