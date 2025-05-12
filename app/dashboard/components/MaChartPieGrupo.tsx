import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatUF } from '../memoria-anual/utils/formatters';

interface MaChartPieGrupoProps {
  concentracionMercado: any[];
}

export default function MaChartPieGrupo({ concentracionMercado }: MaChartPieGrupoProps) {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];
  
  // Ordenar por participación y tomar los 5 principales
  const topGrupos = [...concentracionMercado]
    .sort((a, b) => b.participacion_porcentaje - a.participacion_porcentaje)
    .slice(0, 5);
  
  // Calcular "Otros" si hay más de 5 grupos
  const otrosParticipacion = concentracionMercado.length > 5
    ? concentracionMercado
        .sort((a, b) => b.participacion_porcentaje - a.participacion_porcentaje)
        .slice(5)
        .reduce((sum, item) => sum + item.participacion_porcentaje, 0)
    : 0;
  
  const otrosPrimaUF = concentracionMercado.length > 5
    ? concentracionMercado
        .sort((a, b) => b.participacion_porcentaje - a.participacion_porcentaje)
        .slice(5)
        .reduce((sum, item) => sum + item.total_uf, 0)
    : 0;
  
  // Datos para el gráfico
  const pieData = [
    ...topGrupos.map(grupo => ({
      name: grupo.grupo,
      value: grupo.participacion_porcentaje,
      primaUF: grupo.total_uf
    }))
  ];
  
  // Agregar "Otros" si es necesario
  if (otrosParticipacion > 0) {
    pieData.push({
      name: 'Otros',
      value: otrosParticipacion,
      primaUF: otrosPrimaUF
    });
  }

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Participación de Mercado por Grupo
        </h3>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name, props) => {
                  if (name === 'value') {
                    return [`${typeof value === 'number' ? value.toFixed(2) : value}%`, 'Participación'];
                  }
                  if (name === 'primaUF') {
                    return [formatUF(Number(value), 0), 'Prima UF'];
                  }
                  return [value, name];
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}