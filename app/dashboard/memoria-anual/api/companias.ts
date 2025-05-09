import { useSupabaseClient } from "@/lib/supabase-client";

export const getCompaniasData = async (periodo: string) => {
  const supabase = useSupabaseClient();
  const { data, error } = await supabase
    .from("vista_companias_periodo")
    .select("*")
    .eq("periodo", periodo);

  if (error) {
    console.error("Error fetching companias data:", error);
    return [];
  }

  return data;
};