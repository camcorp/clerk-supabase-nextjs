'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useSupabaseClient } from '../lib/supabase-client';

export function SupabaseExample() {
  const { user } = useUser();
  const supabase = useSupabaseClient();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Ejemplo de consulta a Supabase usando el cliente autenticado con Clerk
        const { data, error } = await supabase
          .from('examples')
          .select('*')
          .limit(10);

        if (error) throw error;
        setData(data || []);
      } catch (err: any) {
        console.error('Error al obtener datos:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchData();
    }
  }, [user, supabase]);

  if (!user) {
    return (
      <div className="p-4 bg-yellow-50 rounded-lg">
        <p className="text-yellow-700">Inicia sesión para ver tus datos</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Datos de Supabase</h2>
      
      {loading ? (
        <p>Cargando datos...</p>
      ) : error ? (
        <div className="p-4 bg-red-50 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      ) : data.length === 0 ? (
        <p>No hay datos disponibles</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {Object.keys(data[0]).map((key) => (
                  <th
                    key={key}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((item, index) => (
                <tr key={index}>
                  {Object.values(item).map((value: any, i) => (
                    <td
                      key={i}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                    >
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}