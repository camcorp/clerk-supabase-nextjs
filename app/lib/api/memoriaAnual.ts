import { createServerSupabaseClient } from '@/lib/supabase/server';

// Tipos comunes
export interface PeriodData {
  periodo: string;
}

// API para obtener períodos
export async function getPeriods(): Promise<string[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("periodos")
    .select("periodo")
    .order("periodo", { ascending: false });

  if (error) {
    console.error("Error fetching periods:", error);
    return [];
  }

  return data.map((item) => item.periodo);
}

// API para obtener datos de compañías
export async function getCompaniasData(periodo: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("vista_companias_periodo")
    .select("*")
    .eq("periodo", periodo);

  if (error) {
    console.error("Error fetching companias data:", error);
    return [];
  }

  return data;
}

// API para obtener datos de ramos
export async function getRamosData(periodo: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("vista_ramos_periodo")
    .select("*")
    .eq("periodo", periodo)
    .order('ramo', { ascending: true });

  if (error) {
    console.error("Error fetching ramos data:", error);
    return [];
  }

  return data;
}

// API para obtener datos de corredores
export async function getCorredoresData(periodo: string) {
  const supabase = await createServerSupabaseClient();
  
  // Obtener datos del período
  const { data: periodData, error: periodError } = await supabase
    .from("vista_corredores_periodo")
    .select("periodo, total_clp, total_uf, num_corredores")
    .eq("periodo", periodo);
    
  if (periodError) {
    console.error("Error al obtener datos de corredores:", periodError);
    return [];
  }
  
  return periodData;
}