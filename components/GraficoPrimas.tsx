'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

type DataRow = {
  anio: number;
  prima_neta: number;
};

export default function GraficoPrimas() {
  const [data, setData] = useState<DataRow[]>([]);

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from('intermediacion_anual')
        .select('anio, prima_neta')
        .order('anio', { ascending: true });

      if (error) {
        console.error('Error fetching data:', error);
      } else {
        setData(data);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="w-full h-96">
      <h2 className="text-xl font-semibold mb-2">Evolución de Primas Netas por Año</h2>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="anio" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="prima_neta" stroke="#3b82f6" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}