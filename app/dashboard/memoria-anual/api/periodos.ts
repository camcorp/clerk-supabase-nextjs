import { useSupabaseClient } from "@/lib/supabase-client";

export const getPeriods = async () => {
  const supabase = useSupabaseClient();
  const { data, error } = await supabase
    .from("uf_values")
    .select("periodo")
    .order("periodo", { ascending: false });

  if (error) {
    console.error("Error fetching periods:", error);
    return [];
  }

  return data.map((item) => item.periodo);
};