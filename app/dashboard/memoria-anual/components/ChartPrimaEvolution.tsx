'use client';

import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatUF, formatCLP } from '../utils/formatters';

interface ChartPrimaEvolutionProps {
  title: string;
  subtitle?: string;
  data: any[];
  periodos: string[]; // Changed from periodo to periodos for consistency
  valueField: string;
  growthField: string;
  color: string;
}

export default function ChartPrimaEvolution({ data, title = "Evolución de Primas", subtitle }: ChartPrimaEvolutionProps) {
  const [moneda, setMoneda] = useState<'uf' | 'clp'>('uf');
  
  // Formatear valores según la moneda seleccionada
  const formatValue = (value: number) => {
    if (moneda === 'uf') {
      return formatUF(value, 2, false);
    } else {
      return formatCLP(value, false);
    }
  };
  
  // Determinar el campo a mostrar según la moneda seleccionada
  const dataKey = moneda === 'uf' ? 'total_uf' : 'total_clp';
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E9ECEF] overflow-hidden transition-all duration-300 hover:shadow-md">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold text-[#0F3460] font-['Space_Grotesk']">{title}</h3>
            {subtitle && <p className="text-sm text-[#6C757D]">{subtitle}</p>}
          </div>
          
          {/* Selector de moneda */}
          <div className="flex space-x-2 bg-gray-100 rounded-lg p-1">
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
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
              <XAxis 
                dataKey="periodo" 
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#E9ECEF' }}
              />
              <YAxis 
                tickFormatter={(value) => formatValue(value)}
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#E9ECEF' }}
              />
              <Tooltip 
                formatter={(value: number) => [
                  formatValue(value), 
                  moneda.toUpperCase()
                ]}
                labelFormatter={(label) => `Período: ${label}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey={dataKey} 
                name={moneda === 'uf' ? "Prima UF" : "Prima CLP"} 
                stroke="#1A7F8E" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6, stroke: '#1A7F8E', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}