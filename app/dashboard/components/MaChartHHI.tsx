import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { formatNumber } from '../memoria-anual/utils/formatters';

interface MaChartHHIProps {
  historicalConcentracion: any[];
}

export default function MaChartHHI({ historicalConcentracion }: MaChartHHIProps) {
  // Procesar datos para el gráfico HHI
  // Crear un mapa para almacenar un solo valor HHI por período
  const hhiMap = new Map();
  
  // Primero, intentar encontrar registros con hhi_general
  historicalConcentracion.forEach(item => {
    if (item.periodo && item.hhi_general !== undefined && !hhiMap.has(item.periodo)) {
      hhiMap.set(item.periodo, item.hhi_general);
    }
  });
  
  // Si no hay registros con hhi_general, usar el campo hhi como respaldo
  if (hhiMap.size === 0) {
    historicalConcentracion.forEach(item => {
      if (item.periodo && item.hhi !== undefined) {
        // Solo guardar un valor por período (el primero que encontremos)
        if (!hhiMap.has(item.periodo)) {
          hhiMap.set(item.periodo, item.hhi);
        }
      }
    });
  }
  
  // Convertir el mapa a un array de objetos para el gráfico
  const hhiData = Array.from(hhiMap.entries())
    .map(([periodo, hhi]) => ({ periodo, hhi }))
    .sort((a, b) => a.periodo.localeCompare(b.periodo));

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