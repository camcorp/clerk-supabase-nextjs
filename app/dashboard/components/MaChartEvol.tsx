import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { formatUF } from '../memoria-anual/utils/formatters';

interface MaChartEvolProps {
  periodos: string[];
  historicalCompanias: any[];
}

export default function MaChartEvol({ periodos, historicalCompanias }: MaChartEvolProps) {
  const data = periodos
    .sort((a, b) => a.localeCompare(b))
    .map(periodo => {
      const totalUF = historicalCompanias
        .filter(c => c.periodo === periodo)
        .reduce((sum, company) => sum + (company.total_uf || 0), 0) || 0;
      return { periodo, totalUF };
    });

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Evolución del Mercado</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Análisis de la evolución de primas desde el periodo más antiguo a el actual.
        </p>
      </div>
      <div className="px-4 py-5 sm:p-6">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
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