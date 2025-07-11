'use client';

import React, { useState } from 'react';
import SimpleLineChart from './simplified/SimpleLineChart';
import { colors } from '@/lib/utils/colors';

interface ChartPrimaEvolutionProps {
  title?: string;
  subtitle?: string;
  data: any[];
  periodos: string[];
  valueField: string;
  growthField: string;
  color: string;
  showTitle?: boolean;
}

export default function ChartPrimaEvolution({ 
  data, 
  title = "Evolución de Primas", 
  subtitle,
  color = colors.companias.primary,
  showTitle = true
}: ChartPrimaEvolutionProps) {
  const [moneda, setMoneda] = useState<'uf' | 'clp'>('uf');
  
  // Determinar el campo a mostrar según la moneda seleccionada
  const dataKey = moneda === 'uf' ? 'total_uf' : 'total_clp';
  const valueType = moneda === 'uf' ? 'UF' : 'CLP';
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E9ECEF] overflow-hidden transition-all duration-300 hover:shadow-md">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          {showTitle && (
            <div>
              <h3 className="text-lg font-semibold text-[#0F3460] font-sans">{title}</h3>
              {subtitle && <p className="text-sm text-[#6C757D]">{subtitle}</p>}
            </div>
          )}
          
          {/* Selector de moneda */}
          <div className={`flex space-x-2 bg-gray-100 rounded-lg p-1 ${!showTitle ? 'ml-auto' : ''}`}>
            <button
              onClick={() => setMoneda('uf')}
              className={`px-3 py-1 rounded-md text-sm ${
                moneda === 'uf' 
                  ? 'bg-white shadow-sm text-[#1A7F8E]' 
                  : 'text-gray-500 hover:bg-gray-200'
              }`}
            >
              UF
            </button>
            <button
              onClick={() => setMoneda('clp')}
              className={`px-3 py-1 rounded-md text-sm ${
                moneda === 'clp' 
                  ? 'bg-white shadow-sm text-[#1A7F8E]' 
                  : 'text-gray-500 hover:bg-gray-200'
              }`}
            >
              CLP
            </button>
          </div>
        </div>
        
        <SimpleLineChart
          data={data}
          xAxisKey="periodo"
          dataKey={dataKey}
          title={showTitle ? title : undefined}
          subtitle={showTitle ? subtitle : undefined}
          valueLabel={moneda === 'uf' ? "Prima UF" : "Prima CLP"}
          valueType={valueType}
          color={color}
        />
      </div>
    </div>
  );
}