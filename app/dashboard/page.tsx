'use client';

import { useEffect, useState } from 'react';
import { useSupabaseClient } from '../../lib/supabase-client';

// Definir la interfaz para las compañías
interface Compania {
  id: number;
  nombrecia: string;
  // Puedes añadir más campos según tu esquema de base de datos
}

export default function Dashboard() {
  const [companias, setCompanias] = useState<Compania[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Obtener el cliente de Supabase
  const supabase = useSupabaseClient();
  
  useEffect(() => {
    // Función para cargar las compañías
    async function loadCompanias() {
      try {
        setLoading(true);
        
        // Realizar la consulta a Supabase
        const { data, error } = await supabase
          .from('companias')
          .select('id, nombrecia')
          .order('nombrecia', { ascending: true });
        
        if (error) {
          throw error;
        }
        
        // Actualizar el estado con los datos
        setCompanias(data || []);
      } catch (err) {
        console.error('Error al cargar compañías:', err);
        setError('No se pudieron cargar las compañías. Por favor, intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    }
    
    loadCompanias();
  }, [supabase]);
  
  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>
        
        {/* Mostrar mensaje de carga */}
        {loading && (
          <div className="text-center py-4">
            <p className="text-gray-500">Cargando compañías...</p>
          </div>
        )}
        
        {/* Mostrar mensaje de error */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Mostrar lista de compañías */}
        {!loading && !error && (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {companias.length > 0 ? (
                companias.map((compania) => (
                  <li key={compania.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-blue-600 truncate">
                          {compania.nombrecia}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            ID: {compania.id}
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
                  No hay compañías disponibles
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}