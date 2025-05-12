import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { formatNumber } from '../memoria-anual/utils/formatters';

interface MaChartHHIProps {
  historicalConcentracion: any[];
}

export default function MaChartHHI({ historicalConcentracion }: MaChartHHIProps) {
  // Procesar datos para el gráfico HHI
  const hhiData = Array.from(new Set(historicalConcentracion.map(item => item.periodo)))
    .sort()
    .map(periodo => {
      // Obtener el HHI para este período (puede ser calculado o tomado directamente)
      const hhi = historicalConcentracion
        .filter(item => item.periodo === periodo)
        .reduce((max, item) => Math.max(max, item.hhi || 0), 0);
      
      return { periodo, hhi };
    });

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Evolución Índices de Concentración (HHI)
        </h3>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={hhiData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="periodo" />
              <YAxis />
              <Tooltip formatter={(value) => {
                if (typeof value === 'number') {
                  return formatNumber(value, 2);
                }
                return value;
              }} />
              <Legend />
              <Line type="monotone" dataKey="hhi" stroke="#82ca9d" name="Índice HHI" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}