type SerieHistorica = {
  periodo: string
  prima_uf: number
  prima_clp: number
}

type Compania = {
  rutcia: string
  nombrecia: string
  grupo: string
  prima_uf?: number
  prima_clp?: number
  ranking?: number
  participacion?: number
  series_historicas?: SerieHistorica[]
}

export function useSeriesHistoricasAgrupadas(companias: Compania[] = []): Compania[] {
  console.log('🔧 Hook useSeriesHistoricasAgrupadas recibió:', companias.length, 'compañías');
  
  const resultado = companias.map((compania) => {
    const tieneSeriesHistoricas = Array.isArray(compania.series_historicas) && compania.series_historicas.length > 0;
    
    console.log(`🔧 Procesando ${compania.nombrecia}:`, {
      rutcia: compania.rutcia,
      tieneSeriesHistoricas,
      cantidadSeries: compania.series_historicas?.length || 0
    });
    
    return {
      rutcia: compania.rutcia,
      nombrecia: compania.nombrecia,
      grupo: compania.grupo,
      prima_uf: compania.prima_uf ?? 0,
      prima_clp: compania.prima_clp ?? 0,
      ranking: compania.ranking ?? null,
      participacion: compania.participacion ?? null,
      series_historicas: tieneSeriesHistoricas 
        ? [...compania.series_historicas].sort((a, b) => b.periodo.localeCompare(a.periodo))
        : [], // ✅ Incluir compañías sin series históricas con array vacío
    };
  });
  
  console.log('🔧 Hook resultado final:', resultado.length, 'compañías procesadas');
  return resultado;
}

// Hook adicional para expandir series históricas por período
export function useSeriesHistoricasExpandidas(companias: Compania[] = []) {
  const companiasConSeries = useSeriesHistoricasAgrupadas(companias);
  
  return companiasConSeries.flatMap((compania) => 
    compania.series_historicas?.map((serie, index) => {
      const prevSerie = index > 0 ? compania.series_historicas![index - 1] : null;
      const crecimiento = prevSerie && prevSerie.prima_clp > 0 ? 
        ((serie.prima_clp - prevSerie.prima_clp) / prevSerie.prima_clp) * 100 : 0;
      
      return {
        ...compania,
        periodo: serie.periodo,
        prima_uf_periodo: serie.prima_uf,
        prima_clp_periodo: serie.prima_clp,
        crecimiento,
        // Mantener datos originales de la compañía
        prima_uf_actual: compania.prima_uf,
        prima_clp_actual: compania.prima_clp
      };
    }) || []
  );
}