import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatNumber, formatChartTooltip } from '@/lib/utils/formatters';

interface MaChartHHIProps {
  historicalConcentracion: any[];
}

export default function MaChartHHI({ historicalConcentracion }: MaChartHHIProps) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [selectedGroups, setSelectedGroups] = useState({
    general: true,
    vida: true,
    generales: true
  });
  
  // Función para procesar los datos del mercado
  const procesarDatos = React.useCallback(() => {
    // Verificar que historicalConcentracion sea un array válido
    const mercadoArray = Array.isArray(historicalConcentracion) ? historicalConcentracion : [];
    
    if (mercadoArray.length === 0) {
      setChartData([]);
      return;
    }
    
    // Crear un objeto para almacenar los datos por periodo
    const datosPorPeriodo: Record<string, any> = {};
    
    // Procesar los datos de concentración
    mercadoArray.forEach(item => {
      if (item && typeof item === 'object' && item.periodo) {
        const periodo = item.periodo;
        
        // Inicializar el periodo si no existe
        if (!datosPorPeriodo[periodo]) {
          datosPorPeriodo[periodo] = {
            periodo,
            hhi_general: 0,
            hhi_vida: 0,
            hhi_generales: 0
          };
        }
        
        // Si el item ya tiene los valores de HHI calculados, usarlos directamente
        if (item.hhi_general !== undefined) {
          datosPorPeriodo[periodo].hhi_general = item.hhi_general;
        }
        
        if (item.hhi_grupo !== undefined) {
          if (item.grupo === '1') {
            datosPorPeriodo[periodo].hhi_generales = item.hhi_grupo;
          } else if (item.grupo === '2') {
            datosPorPeriodo[periodo].hhi_vida = item.hhi_grupo;
          }
        }
        
        // Si no tienen los valores calculados, calcularlos manualmente
        if (!item.hhi_general || !item.hhi_grupo) {
          // Calcular HHI para cada periodo y grupo
          // Agrupar compañías por tipo
          const companiasGenerales = mercadoArray.filter(c => 
            c.periodo === periodo && 
            ((c.tipo === 'GENERALES') || (c.grupo && c.grupo.toLowerCase().includes('general')))
          );
          
          const companiasVida = mercadoArray.filter(c => 
            c.periodo === periodo && 
            ((c.tipo === 'VIDA') || (c.grupo && c.grupo.toLowerCase().includes('vida')))
          );
          
          const todasCompanias = mercadoArray.filter(c => c.periodo === periodo);
          
          // Calcular HHI para el mercado total
          const totalMercado = todasCompanias.reduce((sum, c) => sum + Number(c.total_uf || 0), 0);
          if (totalMercado > 0) {
            datosPorPeriodo[periodo].hhi_general = todasCompanias.reduce((sum, c) => {
              const participacion = (Number(c.total_uf || 0) / totalMercado) * 100;
              return sum + (participacion * participacion);
            }, 0);
          }
          
          // Calcular HHI para Generales
          const totalGenerales = companiasGenerales.reduce((sum, c) => sum + Number(c.total_uf || 0), 0);
          if (totalGenerales > 0) {
            datosPorPeriodo[periodo].hhi_generales = companiasGenerales.reduce((sum, c) => {
              const participacion = (Number(c.total_uf || 0) / totalGenerales) * 100;
              return sum + (participacion * participacion);
            }, 0);
          }
          
          // Calcular HHI para Vida
          const totalVida = companiasVida.reduce((sum, c) => sum + Number(c.total_uf || 0), 0);
          if (totalVida > 0) {
            datosPorPeriodo[periodo].hhi_vida = companiasVida.reduce((sum, c) => {
              const participacion = (Number(c.total_uf || 0) / totalVida) * 100;
              return sum + (participacion * participacion);
            }, 0);
          }
        }
      } // <-- Esta es la llave que falta para cerrar el if de la línea 28
    });
    
    // Convertir el objeto a un array para el gráfico
    const chartDataArray = Object.values(datosPorPeriodo);
    
    // Ordenar por periodo (ascendente)
    chartDataArray.sort((a, b) => a.periodo.localeCompare(b.periodo));
    
    setChartData(chartDataArray);
  }, [historicalConcentracion]);
  
  useEffect(() => {
    procesarDatos();
  }, [procesarDatos]);

  // Manejar cambios en los selectores
  const handleGroupToggle = (group: 'general' | 'vida' | 'generales') => {
    setSelectedGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  // Verificar si hay datos para mostrar
  const hayDatos = chartData.length > 0;

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Índice de Concentración HHI por Grupo
        </h3>
        
        {/* Selectores para filtrar los datos */}
        <div className="flex flex-wrap gap-4 mt-2 mb-4">
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
        
        <div className="mt-4 h-80">
          {hayDatos ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="periodo" />
                <YAxis 
                  // Calcular el dominio dinámicamente en lugar de usar un valor fijo
                  domain={[0, 'dataMax + 100']} // Añade un margen de 100 sobre el valor máximo
                  tickFormatter={(value) => {
  if (value >= 1000000) {
    return `${formatNumber(value / 1000000, 1)}M`;
  } else if (value >= 1000) {
    return `${formatNumber(value / 1000, 1)}K`;
  }
  return formatNumber(value, 0);
}} />
                <Tooltip 
                  formatter={(value, name) => {
                    // Convertir a número y usar la función centralizada formatChartTooltip
                    const numValue = typeof value === 'number' ? value : Number(value);
                    
                    // Determinar la etiqueta según el nombre del dataKey
                    let label = name;
                    if (name === 'hhi_general') label = 'HHI General';
                    if (name === 'hhi_vida') label = 'HHI Vida';
                    if (name === 'hhi_generales') label = 'HHI Generales';
                    
                    // Usar la función centralizada para formatear el valor
                    return [formatChartTooltip(numValue), label];
                  }}
                />
                <Legend />
                {selectedGroups.general && (
                  <Line 
                    type="monotone" 
                    dataKey="hhi_general" 
                    stroke="#8884d8" 
                    name="HHI General" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                )}
                {selectedGroups.vida && (
                  <Line 
                    type="monotone" 
                    dataKey="hhi_vida" 
                    stroke="#82ca9d" 
                    name="HHI Vida" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                )}
                {selectedGroups.generales && (
                  <Line 
                    type="monotone" 
                    dataKey="hhi_generales" 
                    stroke="#ffc658" 
                    name="HHI Generales" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-500">No hay datos de concentración disponibles</p>
            </div>
          )}
        </div>
        
        <div className="mt-4">
          <p className="text-sm text-gray-500">
            <strong>Nota:</strong> El índice Herfindahl-Hirschman (HHI) mide la concentración del mercado. 
            Valores más altos indican mayor concentración (rango: 0-10,000).
          </p>
          <ul className="mt-2 text-sm text-gray-500 list-disc pl-5">
            <li>HHI &lt; 1,500: Mercado no concentrado</li>
            <li>1,500 &lt; HHI &lt; 2,500: Moderadamente concentrado</li>
            <li>HHI &gt; 2,500: Altamente concentrado</li>
          </ul>
        </div>
      </div>
    </div>
  );
}