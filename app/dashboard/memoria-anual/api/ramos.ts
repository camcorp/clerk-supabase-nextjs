'use server';

import { createServerSupabaseClient } from "@/lib/supabase-server";

export const getRamosData = async (periodo: string) => {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("vista_ramos_periodo")
    .select("ramo, grupo,subgrupo,periodo, total_primaclp, total_primauf")
    .eq("periodo", periodo)
    .order('ramo', { ascending: true });

  if (error) {
    console.error("Error fetching ramos data:", error);
    return [];
  }

  // Transformar los datos para mantener la compatibilidad con el componente
  return data.map(item => ({
    ...item,
    grupo: item.grupo,   
    subgrupo: item.subgrupo,
     nombre: item.ramo,
    total_clp: item.total_primaclp,
    total_uf: item.total_primauf,
    primaclp: item.total_primaclp,
    primauf: item.total_primauf
  }));
};