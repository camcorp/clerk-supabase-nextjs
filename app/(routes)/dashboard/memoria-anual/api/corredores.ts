'use server';

import { createServerSupabaseClient } from "@/lib/supabase/server";

export const getCorredoresData = async (periodo: string) => {
  const supabase = await createServerSupabaseClient();
  
  // Obtener todos los datos de vista_corredores_periodo
  const { data: periodData, error: periodError } = await supabase
    .from("vista_corredores_periodo")
    .select("periodo, total_clp, total_uf, num_corredores")
    .order('periodo', { ascending: false });
    
  if (periodError) {
    console.error("Error al obtener datos de corredores por período:", periodError);
    return [];
  }
  
  // Obtener datos de concentración para todos los periodos
  const { data: concentracionData, error: concentracionError } = await supabase
    .from("vista_concentracion_corredores")
    .select("periodo, hhi_general, grupo, hhi_grupo")
    .order('periodo', { ascending: false });
    
  if (concentracionError) {
    console.error("Error al obtener datos de concentración:", concentracionError);
    console.error("Detalles del error:", concentracionError.message, concentracionError.details);
  }
  
  // Si no hay datos, devolvemos un array vacío
  if (!periodData || periodData.length === 0) {
    return [];
  }
  
  // Transformar los datos para el componente
  return periodData.map((item, index) => {
    const concentracion = concentracionData?.filter(c => c.periodo === item.periodo) || [];
    const hhiGeneral = concentracion.find(c => c.grupo === '1')?.hhi_general || 0;
    
    return {
      id: index,
      periodo: item.periodo,
      total_clp: item.total_clp,
      total_uf: item.total_uf,
      num_corredores: item.num_corredores,
      hhi_general: hhiGeneral,
      concentracion: concentracion
    };
  });
};

// Obtener datos históricos para gráficos temporales
export const getHistoricalCorredoresData = async () => {
  const supabase = await createServerSupabaseClient();
  
  // Datos de evolución temporal
  const { data: evolutionData, error: evolutionError } = await supabase
    .from("vista_corredores_periodo")
    .select("periodo, total_clp, total_uf, num_corredores")
    .order('periodo', { ascending: true });
    
  if (evolutionError) {
    console.error("Error al obtener datos históricos de corredores:", evolutionError);
    console.error("Detalles del error:", evolutionError.message, evolutionError.details);
    return { evolution: [], concentracion: [], movimientos: [] };
  }
  
  // Datos de concentración
  const { data: concentracionData, error: concentracionError } = await supabase
    .from("vista_concentracion_corredores")
    .select("periodo, hhi_general, grupo, hhi_grupo")
    .order('periodo', { ascending: true });
    
  if (concentracionError) {
    console.error("Error al obtener datos históricos de concentración:", concentracionError);
    console.error("Detalles del error:", concentracionError.message, concentracionError.details);
  }
  
  // Datos de entradas y salidas
  const { data: movimientosData, error: movimientosError } = await supabase
    .from("vista_evolucion_corredores")
    .select("periodo, rut, nombre, tipo_cambio")
    .order('periodo', { ascending: true });
    
  if (movimientosError) {
    console.error("Error al obtener datos de movimientos de corredores:", movimientosError);
    console.error("Detalles del error:", movimientosError.message, movimientosError.details);
  }
  
  // Calcular tasas de variación para cada período
  const evolutionWithRates = evolutionData?.map((item, index) => {
    let variacion_num_corredores = null;
    let variacion_total_uf = null;
    
    if (index > 0) {
      const prevItem = evolutionData[index - 1];
      
      if (prevItem.num_corredores > 0) {
        variacion_num_corredores = ((item.num_corredores - prevItem.num_corredores) / prevItem.num_corredores) * 100;
      }
      
      if (prevItem.total_uf > 0) {
        variacion_total_uf = ((item.total_uf - prevItem.total_uf) / prevItem.total_uf) * 100;
      }
    }
    
    return {
      ...item,
      variacion_num_corredores,
      variacion_total_uf
    };
  }) || [];
  
  // Procesar datos de movimientos por período
  const movimientosPorPeriodo: Record<string, { entradas: number, salidas: number }> = {};
  
  if (movimientosData) {
    movimientosData.forEach(item => {
      if (!movimientosPorPeriodo[item.periodo]) {
        movimientosPorPeriodo[item.periodo] = { entradas: 0, salidas: 0 };
      }
      
      if (item.tipo_cambio === 'entrada') {
        movimientosPorPeriodo[item.periodo].entradas++;
      } else if (item.tipo_cambio === 'salida') {
        movimientosPorPeriodo[item.periodo].salidas++;
      }
    });
  }
  
  // Convertir el objeto de movimientos a un array para el gráfico
  const movimientosArray = Object.entries(movimientosPorPeriodo).map(([periodo, datos]) => ({
    periodo,
    entradas: datos.entradas,
    salidas: datos.salidas,
    neto: datos.entradas - datos.salidas
  }));
  
  // Asegurarse de que los datos de concentración estén correctamente formateados
  const concentracionFormateada = concentracionData?.map(item => ({
    ...item,
    hhi_general: Number(item.hhi_general),
    hhi_grupo: Number(item.hhi_grupo)
  })) || [];
  
  return {
    evolution: evolutionWithRates,
    concentracion: concentracionFormateada,
    movimientos: movimientosArray
  };
};