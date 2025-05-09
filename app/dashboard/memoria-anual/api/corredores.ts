import { supabase } from "@/lib/supabaseClient";

export const getCorredoresData = async (periodo: string) => {
  const { data, error } = await supabase
    .from("vista_corredores_periodo")
    .select("*")
    .eq("periodo", periodo);

  if (error) {
    console.error("Error fetching corredores data:", error);
    return [];
  }

  return data;
};