import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatNumber } from '@/lib/utils/formatters';

interface MaChartCorredoresMovimientosProps {
  periodos: string[];
  evolucionCorredores: Array<{
    periodo: string;
    num_entradas?: number;
    num_salidas?: number;
    tipo_cambio?: string;
  }>;
}

interface MovimientoData {
  periodo: string;
  entradas: number;
  salidas: number;
  neto: number;
}

export default function MaChartCorredoresMovimientos({ 
  periodos,
  evolucionCorredores 
}: MaChartCorredoresMovimientosProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Verificar si los datos ya vienen pre-procesados (con num_entradas y num_salidas)
  const datosPreProcesados = evolucionCorredores.length > 0 && 'num_entradas' in evolucionCorredores[0];
  
  // Transformar los datos según su formato
  const movimientosData = datosPreProcesados ? 
    // Si los datos ya vienen pre-procesados
    evolucionCorredores.map(item => ({
      periodo: item.periodo,
      entradas: Number(item.num_entradas || 0),
      salidas: -Math.abs(Number(item.num_salidas || 0)),
      neto: Number(item.num_entradas || 0) - Number(item.num_salidas || 0)
    })) :
    // Si los datos vienen sin procesar (formato original)
    periodos.map(periodo => {
      const dataPeriodo = evolucionCorredores.filter(item => item.periodo === periodo);
      const entradas = dataPeriodo.filter(item => item.tipo_cambio === 'entrada').length || 0;
      const salidas = dataPeriodo.filter(item => item.tipo_cambio === 'salida').length || 0;
      
      return {
        periodo,
        entradas,
        salidas: -salidas, // Valor negativo para mostrar hacia abajo
        neto: entradas - salidas
      };
    });

  // El resto del componente permanece igual
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
                formatter={(value, name: string) => {
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