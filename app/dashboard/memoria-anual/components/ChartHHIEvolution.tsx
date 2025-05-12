'use client';

import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

interface ChartHHIEvolutionProps {
  data: Array<{
    periodo: string;
    hhi_general?: number;
    hhi?: number;
    grupo?: string;
    hhi_grupo?: number;
    [key: string]: any;
  }>;
  title?: string;
  subtitle?: string;
  threshold?: number;
}

export default function ChartHHIEvolution({ 
  data, 
  title = "Evolución del Índice HHI", 
  subtitle = "Índice Herfindahl-Hirschman de concentración del mercado",
  threshold = 1000
}: ChartHHIEvolutionProps) {
  const [selectedGrupo, setSelectedGrupo] = useState<string>('General');
  
  // Filtrar datos por grupo seleccionado
  const filteredData = data.filter(item => {
    if (selectedGrupo === 'General') {
      return true; // Mostrar todos los datos para 'General'
    }
    return item.grupo === selectedGrupo;
  });
  
  // Determinar el campo a usar (hhi_general o hhi_grupo)
  const dataKey = selectedGrupo === 'General' ? 'hhi_general' : 'hhi_grupo';
  
  // Obtener grupos únicos para el selector
  const gruposSet = new Set(data.map(item => item.grupo).filter(Boolean));
  // Convertir a array y asegurar que todos los elementos son string
  const grupos: string[] = ['General', ...Array.from(gruposSet).filter((grupo): grupo is string => typeof grupo === 'string')];
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E9ECEF] overflow-hidden transition-all duration-300 hover:shadow-md">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold text-[#0F3460] font-['Space_Grotesk']">{title}</h3>
            {subtitle && <p className="text-sm text-[#6C757D]">{subtitle}</p>}
          </div>
          
          {/* Selector de grupo */}
          <div className="flex space-x-2 bg-gray-100 rounded-lg p-1">
            {grupos.map(grupo => (
              <button
                key={grupo}
                onClick={() => setSelectedGrupo(grupo)}
                className={`px-3 py-1 rounded-md text-sm ${
                  selectedGrupo === grupo 
                    ? 'bg-white shadow-sm text-[#1A7F8E]' 
                    : 'text-gray-500 hover:bg-gray-200'
                }`}
              >
                {grupo === 'General' ? 'General' : `Grupo ${grupo}`}
              </button>
            ))}
          </div>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={filteredData}
              margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
              <XAxis 
                dataKey="periodo" 
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#E9ECEF' }}
              />
              <YAxis 
                tickFormatter={(value) => Math.round(value).toString()}
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#E9ECEF' }}
                domain={[0, 'dataMax + 100']}
              />
              <Tooltip 
                formatter={(value: number) => [Math.round(value), "HHI"]}
                labelFormatter={(label) => `Período: ${label}`}
              />
              <Legend />
              <ReferenceLine 
                y={threshold} 
                stroke="#FF6B6B" 
                strokeDasharray="3 3"
                label={{ 
                  value: `Threshold: ${threshold}`, 
                  position: 'insideBottomRight',
                  fill: '#FF6B6B',
                  fontSize: 12
                }}
              />
              <Line 
                type="monotone" 
                dataKey={dataKey} 
                name={selectedGrupo === 'General' ? "Índice HHI General" : `Índice HHI Grupo ${selectedGrupo}`} 
                stroke="#8884d8" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6, stroke: '#8884d8', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 text-xs text-[#6C757D]">
          <p>* Valores superiores a {threshold} indican un mercado altamente concentrado.</p>
        </div>
      </div>
    </div>
  );
}