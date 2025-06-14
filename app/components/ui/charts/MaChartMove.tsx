import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatNumber } from '@/lib/utils/formatters';

interface MaChartMoveProps {
  evolucionMercado: any[];
  periodos: string[];
}

export default function MaChartMove({ evolucionMercado, periodos }: MaChartMoveProps) {
  // Procesar datos para todos los períodos
  const movimientosData = periodos.map(periodo => {
    // Filtrar movimientos para este período
    const movimientosPeriodo = evolucionMercado.filter(item => item.periodo === periodo);
    
    // Contar entradas y salidas
    const entradas = movimientosPeriodo.filter(item => item.tipo_cambio === 'entrada').length;
    const salidas = movimientosPeriodo.filter(item => item.tipo_cambio === 'salida').length;
    
    return {
      periodo,
      entradas,
      salidas: -salidas, // Valor negativo para mostrar hacia abajo
      neto: entradas - salidas
    };
  });

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Movimientos Históricos de Corredores</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Entradas y salidas de actores en el mercado
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