import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { formatUF, formatCLP } from '../memoria-anual/utils/formatters';

interface MaChartEvolProps {
  periodos: string[];
  historicalCompanias: any[];
}

export default function MaChartEvol({ periodos, historicalCompanias }: MaChartEvolProps) {
  const [moneda, setMoneda] = useState<'uf' | 'clp'>('uf');
  
  // Formatear valores según la moneda seleccionada
  const formatValue = (value: number) => {
    if (moneda === 'uf') {
      return formatUF(value, 2, false);
    } else {
      return formatCLP(value, false);
    }
  };
  
  const data = periodos
    .sort((a, b) => a.localeCompare(b))
    .map(periodo => {
      const totalUF = historicalCompanias
        .filter(c => c.periodo === periodo)
        .reduce((sum, company) => sum + (company.total_primauf || 0), 0) || 0;
      
      const totalCLP = historicalCompanias
        .filter(c => c.periodo === periodo)
        .reduce((sum, company) => sum + (company.total_primaclp || 0), 0) || 0;
      
      return { 
        periodo, 
        totalUF, 
        totalCLP 
      };
    });

  // Determinar el campo a mostrar según la moneda seleccionada
  const dataKey = moneda === 'uf' ? 'totalUF' : 'totalCLP';
  const nombreMoneda = moneda === 'uf' ? 'Prima Total UF' : 'Prima Total CLP';

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
      <div className="px-4 py-5 sm:px-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Evolución del Mercado</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Análisis de la evolución de primas desde el periodo más antiguo a el actual.
            </p>
          </div>
          
          {/* Selector de moneda */}
          <div className="flex space-x-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setMoneda('uf')}
              className={`px-3 py-1 rounded-md text-sm ${
                moneda === 'uf' 
                  ? 'bg-white shadow-sm text-blue-600' 
                  : 'text-gray-500 hover:bg-gray-200'
              }`}
            >
              UF
            </button>
            <button
              onClick={() => setMoneda('clp')}
              className={`px-3 py-1 rounded-md text-sm ${
                moneda === 'clp' 
                  ? 'bg-white shadow-sm text-blue-600' 
                  : 'text-gray-500 hover:bg-gray-200'
              }`}
            >
              CLP
            </button>
          </div>
        </div>
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
              <YAxis tickFormatter={(value) => formatValue(value)} />
              <Tooltip 
                formatter={(value) => [formatValue(Number(value)), moneda.toUpperCase()]} 
                labelFormatter={(label) => `Período: ${label}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey={dataKey} 
                stroke="#8884d8" 
                name={nombreMoneda}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6, stroke: '#8884d8', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}