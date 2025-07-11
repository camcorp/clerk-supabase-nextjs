// Actualizar el componente para usar SimpleLineChart
import React, { useState } from 'react';
import SimpleLineChart from './simplified/SimpleLineChart';
import { formatUF, formatCLP, formatNumber, formatChartTooltip } from '@/lib/utils/formatters';

interface MaChartEvolProps {
  periodos: string[];
  historicalCompanias: any[];
}

export default function MaChartEvol({ periodos, historicalCompanias }: MaChartEvolProps) {
  const [moneda, setMoneda] = useState<'uf' | 'clp'>('uf');
  
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
  const valueType = moneda === 'uf' ? 'UF' : 'CLP';

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
        <SimpleLineChart
          data={data}
          xAxisKey="periodo"
          dataKey={dataKey}
          title="Evolución del Mercado"
          subtitle="Análisis de la evolución de primas desde el periodo más antiguo a el actual"
          valueLabel={nombreMoneda}
          valueType={valueType}
        />
      </div>
    </div>
  );
}