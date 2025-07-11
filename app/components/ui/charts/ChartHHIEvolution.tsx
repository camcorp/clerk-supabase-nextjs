'use client';

import React, { useState } from 'react';
import SimpleLineChart from './simplified/SimpleLineChart';
import { ValueType } from './simplified/SimpleLineChart';

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
  showTitle?: boolean;
}

export default function ChartHHIEvolution({ 
  data, 
  title = "Evolución del Índice HHI", 
  subtitle = "Índice Herfindahl-Hirschman de concentración del mercado",
  threshold = 1000,
  showTitle = true
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
          {showTitle && (
            <div>
              <h3 className="text-lg font-semibold text-[#0F3460] font-sans">{title}</h3>
              {subtitle && <p className="text-sm text-[#6C757D]">{subtitle}</p>}
            </div>
          )}
          
          {/* Selector de grupo */}
          <div className={`flex space-x-2 bg-gray-100 rounded-lg p-1 ${!showTitle ? 'ml-auto' : ''}`}>
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
          <SimpleLineChart
            data={filteredData}
            xAxisKey="periodo"
            dataKey={dataKey}
            title={selectedGrupo === 'General' ? "Índice HHI General" : `Índice HHI Grupo ${selectedGrupo}`}
            valueLabel="HHI"
            valueType="NUMBER"
            valueDomain={[0, 'dataMax + 200']}
            color="#8884d8"
          />
        </div>
        
        <div className="mt-4 text-xs text-[#6C757D]">
          <p>* Valores superiores a {threshold} indican un mercado altamente concentrado.</p>
        </div>
      </div>
    </div>
  );
}