'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { formatUF } from '../memoria-anual/utils/formatters';

interface MaChartBarEstructuraProps {
  data: any[];
  periodos: string[];
}

export default function MaChartBarEstructura({ data, periodos }: MaChartBarEstructuraProps) {
  const chartData = periodos
    .sort((a, b) => a.localeCompare(b))
    .map(periodo => {
      const totalUF = data
        .filter(c => c.periodo === periodo)
        .reduce((sum, company) => sum + (company.total_uf || 0), 0) || 0;
      return { periodo, totalUF };
    });

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Evolución de Primas UF
        </h3>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="periodo" />
              <YAxis />
              <Tooltip formatter={(value) => formatUF(Number(value), 0)} />
              <Legend />
              <Line type="monotone" dataKey="totalUF" stroke="#8884d8" name="Prima Total UF" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}