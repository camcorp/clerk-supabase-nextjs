'use client';

import React, { useState, useEffect } from 'react';
import MultiSeriesChart from './simplified/MultiSeriesChart';
import { ReferenceLine } from 'recharts';

interface HHIChartProps {
  // Datos para el gráfico
  data: Array<{
    periodo: string;
    hhi_general?: number;
    hhi_vida?: number;
    hhi_generales?: number;
    hhi?: number;
    grupo?: string;
    hhi_grupo?: number;
    [key: string]: any;
  }>;
  
  // Configuración general
  title?: string;
  subtitle?: string;
  threshold?: number;
  showThreshold?: boolean;
  
  // Modo de visualización
  // 'single': muestra un solo grupo seleccionable (como ChartHHIEvolution)
  // 'multi': muestra múltiples series con checkboxes (como MaChartHHI)
  mode?: 'single' | 'multi';
}

export default function HHIChart({ 
  data, 
  title = "Índice de Concentración HHI", 
  subtitle = "Índice Herfindahl-Hirschman de concentración del mercado",
  threshold = 1000,
  showThreshold = true,
  mode = 'multi'
}: HHIChartProps) {
  // Estado para el modo 'single'
  const [selectedGrupo, setSelectedGrupo] = useState<string>('General');
  
  // Estado para el modo 'multi'
  const [selectedGroups, setSelectedGroups] = useState({
    general: true,
    vida: true,
    generales: true
  });
  
  // Obtener grupos únicos para el selector
  const gruposSet = new Set(data.map(item => item.grupo).filter(Boolean));
  const grupos: string[] = ['General', ...Array.from(gruposSet).filter((grupo): grupo is string => typeof grupo === 'string')];
  
  // Preparar datos según el modo
  let chartData = data;
  let series = [];
  
  if (mode === 'single') {
    // Filtrar datos por grupo seleccionado (modo 'single')
    chartData = data.filter(item => {
      if (selectedGrupo === 'General') {
        return true; // Mostrar todos los datos para 'General'
      }
      return item.grupo === selectedGrupo;
    });
    
    // Determinar el campo a usar (hhi_general o hhi_grupo)
    const dataKey = selectedGrupo === 'General' ? 'hhi_general' : 'hhi_grupo';
    
    series = [{
      dataKey,
      label: selectedGrupo === 'General' ? "Índice HHI General" : `Índice HHI Grupo ${selectedGrupo}`,
      color: "#8884d8"
    }];
  } else {
    // Configurar series para modo 'multi'
    if (selectedGroups.general) {
      series.push({
        dataKey: 'hhi_general',
        label: 'HHI General',
        color: '#8884d8'
      });
    }
    
    if (selectedGroups.vida) {
      series.push({
        dataKey: 'hhi_vida',
        label: 'HHI Vida',
        color: '#82ca9d'
      });
    }
    
    if (selectedGroups.generales) {
      series.push({
        dataKey: 'hhi_generales',
        label: 'HHI Generales',
        color: '#ffc658'
      });
    }
  }
  
  // Manejar cambios en los selectores para modo 'multi'
  const handleGroupToggle = (group: 'general' | 'vida' | 'generales') => {
    setSelectedGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E9ECEF] overflow-hidden transition-all duration-300 hover:shadow-md">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold text-[#0F3460] font-['Space_Grotesk']">{title}</h3>
            {subtitle && <p className="text-sm text-[#6C757D]">{subtitle}</p>}
          </div>
          
          {mode === 'single' ? (
            // Selector de grupo para modo 'single'
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
          ) : (
            // Checkboxes para modo 'multi'
            <div className="flex flex-wrap gap-4">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={selectedGroups.general}
                  onChange={() => handleGroupToggle('general')}
                  className="form-checkbox h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-sm text-gray-700">HHI General</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={selectedGroups.vida}
                  onChange={() => handleGroupToggle('vida')}
                  className="form-checkbox h-4 w-4 text-green-600"
                />
                <span className="ml-2 text-sm text-gray-700">HHI Vida</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={selectedGroups.generales}
                  onChange={() => handleGroupToggle('generales')}
                  className="form-checkbox h-4 w-4 text-yellow-600"
                />
                <span className="ml-2 text-sm text-gray-700">HHI Generales</span>
              </label>
            </div>
          )}
        </div>
        
        <div className="h-80">
          <MultiSeriesChart
            data={chartData}
            xAxisKey="periodo"
            title={title}
            subtitle={subtitle}
            series={series}
            valueType="NUMBER"
            valueDomain={[0, 'dataMax + 200']}
            referenceLines={showThreshold ? [
              {
                y: threshold,
                stroke: "#FF6B6B",
                strokeDasharray: "3 3",
                label: `Threshold: ${threshold}`
              }
            ] : []}
          />
        </div>
        
        <div className="mt-4 text-xs text-[#6C757D]">
          <p>* Valores superiores a {threshold} indican un mercado altamente concentrado.</p>
          <ul className="mt-2 list-disc pl-5">
            <li>HHI &lt; 1,500: Mercado no concentrado</li>
            <li>1,500 &lt; HHI &lt; 2,500: Moderadamente concentrado</li>
            <li>HHI &gt; 2,500: Altamente concentrado</li>
          </ul>
        </div>
      </div>
    </div>
  );
}