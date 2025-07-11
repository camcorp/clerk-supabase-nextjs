'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatUF, formatCLP, formatPercent } from '@/lib/utils/formatters';
import { colors } from '@/config/theme';

// Definir tipos para los formatos de valores
type ValueType = 'UF' | 'CLP' | 'PERCENT' | 'NUMBER';

interface ChartDualAxisProps {
  data: Array<{
    periodo: string;
    valor: number;
    crecimiento?: number | null;
    [key: string]: any;
  }>;
  title?: string;
  subtitle?: string;
  primaryColor?: string;
  secondaryColor?: string;
  
  // Propiedades simplificadas para el eje Y1 (izquierdo)
  Y1valueLabel?: string;
  Y1valueType?: ValueType;
  Y1formatValue?: (value: number) => string;
  Y1axisDomain?: [number | string, number | string];
  
  // Propiedades simplificadas para el eje Y2 (derecho)
  Y2valueLabel?: string;
  Y2valueType?: ValueType;
  Y2formatValue?: (value: number) => string;
  Y2axisDomain?: [number | string, number | string];
  
  // Propiedades para compatibilidad con versiones anteriores
  valueLabel?: string;
  growthLabel?: string;
  valueType?: ValueType;
  growthType?: ValueType;
  formatValue?: (value: number) => string;
  formatGrowth?: (value: number) => string;
  leftAxisDomain?: [number | string, number | string];
  rightAxisDomain?: [number | string, number | string];
}

export default function ChartDualAxis({ 
  data, 
  title = "Evolución y Crecimiento", 
  subtitle,
  primaryColor = colors.companias.primary,
  secondaryColor = colors.status.info,
  
  // Usar nuevas propiedades con fallback a las anteriores
  Y1valueLabel,
  Y1valueType,
  Y1formatValue,
  Y1axisDomain,
  
  Y2valueLabel,
  Y2valueType,
  Y2formatValue,
  Y2axisDomain,
  
  // Propiedades anteriores para compatibilidad
  valueLabel = "Valor",
  growthLabel = "Crecimiento",
  valueType = 'UF',
  growthType = 'PERCENT',
  formatValue,
  formatGrowth,
  leftAxisDomain = ['dataMin - 100', 'dataMax + 100'],
  rightAxisDomain = [-30, 30]
}: ChartDualAxisProps) {
  
  // Usar nuevas propiedades si están definidas, sino usar las anteriores
  const finalY1Label = Y1valueLabel || valueLabel;
  const finalY2Label = Y2valueLabel || growthLabel;
  const finalY1Type = Y1valueType || valueType;
  const finalY2Type = Y2valueType || growthType;
  const finalY1Domain = Y1axisDomain || leftAxisDomain;
  const finalY2Domain = Y2axisDomain || rightAxisDomain;
  
  // Función para obtener el formateador según el tipo de valor
  const getFormatter = (type: ValueType, defaultFormatter?: (value: number) => string) => {
    if (defaultFormatter) return defaultFormatter;
    
    switch (type) {
      case 'CLP':
        return (value: number) => formatCLP(value / 1000, true, 0) + 'M';
      case 'UF':
        return (value: number) => formatUF(value, 0, false);
      case 'PERCENT':
        return (value: number) => formatPercent(value, 2);
      case 'NUMBER':
      default:
        return (value: number) => value.toLocaleString('es-CL');
    }
  };
  
  // Obtener formateadores para ambos ejes
  const finalY1Formatter = Y1formatValue || formatValue || getFormatter(finalY1Type);
  const finalY2Formatter = Y2formatValue || formatGrowth || getFormatter(finalY2Type);
  
  // Función para formatear ticks según el tipo
  const formatTickValue = (value: number, type: ValueType, formatter: (value: number) => string) => {
    switch (type) {
      case 'CLP':
        return formatter(value).split('$')[1]; // Mostrar sin el símbolo $ para los ticks
      case 'UF':
        return formatter(value).split(' ')[0]; // Quitar el "UF" para los ticks
      case 'PERCENT':
        return `${value}%`;
      case 'NUMBER':
      default:
        return value.toLocaleString('es-CL');
    }
  };
  
  // Asegurarse de que los datos tengan el formato correcto
  const chartData = data.map(item => ({
    ...item,
    periodo: item.periodo,
    valor: item.valor || 0,
    crecimiento: item.crecimiento || 0
  }));
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E9ECEF] overflow-hidden transition-all duration-300 hover:shadow-md">
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-[#0F3460] font-['Space_Grotesk']">{title}</h3>
          {subtitle && <p className="text-sm text-[#6C757D]">{subtitle}</p>}
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
              <XAxis 
                dataKey="periodo" 
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#E9ECEF' }}
              />
              <YAxis 
                yAxisId="left"
                tickFormatter={(value) => formatTickValue(value, finalY1Type, finalY1Formatter)}
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#E9ECEF' }}
                domain={finalY1Domain}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                tickFormatter={(value) => formatTickValue(value, finalY2Type, finalY2Formatter)}
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#E9ECEF' }}
                domain={finalY2Domain}
              />
              <Tooltip 
                formatter={(value: number, name: string) => {
                  if (name === finalY1Label) {
                    return [finalY1Formatter(value), finalY1Label];
                  }
                  return [finalY2Formatter(value), finalY2Label];
                }}
                labelFormatter={(label) => `Período: ${label}`}
              />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="valor" 
                name={finalY1Label} 
                stroke={primaryColor} 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6, stroke: primaryColor, strokeWidth: 2 }}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="crecimiento" 
                name={finalY2Label} 
                stroke={secondaryColor} 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6, stroke: secondaryColor, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}