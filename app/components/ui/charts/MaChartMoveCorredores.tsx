import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatNumber } from '@/lib/utils/formatters';
import { useSupabaseClient } from '@/lib/supabase/client';

interface MaChartMoveCorredoresProps {
  evolucionMercado: any[];
  periodos: string[];
}

export default function MaChartMoveCorredores({ evolucionMercado, periodos }: MaChartMoveCorredoresProps) {
  const [movimientosData, setMovimientosData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = useSupabaseClient();
  
  useEffect(() => {
    async function fetchMovimientosCorredores() {
      try {
        setLoading(true);
        
        // Usar la consulta SQL proporcionada para obtener los movimientos de corredores
        const { data, error } = await supabase
          .from('vista_evolucion_corredores')
          .select('periodo, tipo_cambio')
          .in('tipo_cambio', ['entrada', 'salida'])
          .order('periodo');
        
        if (error) {
          console.error('Error al obtener movimientos de corredores:', error);
          setError(error.message);
          return;
        }
        
        if (!data || data.length === 0) {
          console.warn('No se encontraron datos de movimientos de corredores');
          setMovimientosData([]);
          return;
        }
        
        // Agrupar los datos por período y contar entradas y salidas
        const movimientosPorPeriodo = periodos.map(periodo => {
          const movimientosPeriodo = data.filter(item => item.periodo === periodo);
          const entradas = movimientosPeriodo.filter(item => item.tipo_cambio === 'entrada').length;
          const salidas = movimientosPeriodo.filter(item => item.tipo_cambio === 'salida').length;
          
          return {
            periodo,
            entradas,
            salidas: -salidas, // Valor negativo para mostrar hacia abajo
            neto: entradas - salidas
          };
        });
        
        setMovimientosData(movimientosPorPeriodo);
      } catch (err: any) {
        console.error('Error al procesar datos de movimientos de corredores:', err);
        setError(err.message || 'Error desconocido');
      } finally {
        setLoading(false);
      }
    }
    
    fetchMovimientosCorredores();
  }, [supabase, periodos]);


  if (loading) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Movimientos Históricos de Corredores</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Cargando datos de movimientos...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Movimientos Históricos de Corredores</h3>
          <p className="mt-1 max-w-2xl text-sm text-red-500">
            Error al cargar datos: {error}
          </p>
        </div>
      </div>
    );
  }

  if (movimientosData.length === 0) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Movimientos Históricos de Corredores</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            No hay datos de movimientos disponibles para este período.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Movimientos Históricos de Corredores</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Entradas y salidas de corredores en el mercado
        </p>
      </div>
      <div className="px-4 py-5 sm:p-6">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={movimientosData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="periodo" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'salidas') {
                    return [Math.abs(Number(value)), 'Salidas'];
                  } else if (name === 'entradas') {
                    return [Number(value), 'Entradas'];
                  } else if (name === 'neto') {
                    return [Number(value), 'Neto'];
                  }
                  return [value, name];
                }}
              />
              <Legend />
              <Bar dataKey="entradas" fill="#4ade80" name="Entradas" />
              <Bar dataKey="salidas" fill="#f87171" name="Salidas" />
              <Bar dataKey="neto" fill="#60a5fa" name="Neto" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}