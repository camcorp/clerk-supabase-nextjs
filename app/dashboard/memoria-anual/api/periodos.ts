import { createServerSupabaseClient } from "@/lib/supabase-server";

export const getPeriods = async () => {
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
};