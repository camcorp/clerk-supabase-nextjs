import { createServerSupabaseClient } from "@/lib/supabase-server";

export const getCorredoresData = async (periodo: string) => {
  const supabase = await createServerSupabaseClient();
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