import { useSupabaseClient } from "@/lib/supabase-client";

export const getRamosData = async (periodo: string) => {
  const supabase = useSupabaseClient();
  const { data, error } = await supabase
    .from("vista_ramos_periodo")
    .select("*")
    .eq("periodo", periodo);

  if (error) {
    console.error("Error fetching ramos data:", error);
    return [];
  }

  return data;
};