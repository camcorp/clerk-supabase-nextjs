import { useEffect, useState } from "react";
import { useSupabaseClient } from "@/lib/supabase-client";

interface PeriodSelectorProps {
  onSelect: (periodo: string) => void;
}

export default function PeriodSelector({ onSelect }: PeriodSelectorProps) {
  const [periodos, setPeriodos] = useState<string[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const supabase = useSupabaseClient();

  useEffect(() => {
    const fetchPeriods = async () => {
      const { data, error } = await supabase
        .from("uf_values")
        .select("periodo")
        .order("periodo", { ascending: false });

      if (error) console.error("Error fetching periods:", error);
      else setPeriodos(data.map((item) => item.periodo));
    };

    fetchPeriods();
  }, [supabase]);

  const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = event.target.value;
    setSelectedPeriod(selected);
    onSelect(selected);
  };

  return (
    <div className="mb-4">
      <label htmlFor="periodSelector" className="block mb-2 text-sm font-medium">
        Seleccionar Período:
      </label>
      <select
        id="periodSelector"
        value={selectedPeriod}
        onChange={handleSelect}
        className="border p-2 rounded w-full"
      >
        <option value="">Selecciona un período</option>
        {periodos.map((periodo) => (
          <option key={periodo} value={periodo}>
            {periodo}
          </option>
        ))}
      </select>
    </div>
  );
}