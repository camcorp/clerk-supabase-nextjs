import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { formatUF, formatCLP, formatPercent, formatNumber } from '@/lib/utils/formatters';
import { colors } from '@/config/theme';

// Definir tipos para los formatos de valores
export type ValueType = 'UF' | 'CLP' | 'PERCENT' | 'NUMBER';

interface SeriesConfig {
  dataKey: string;
  label: string;
  color: string;
}

interface ReferenceLineConfig {
  y: number;
  stroke: string;
  strokeDasharray?: string;
  label?: string;
}

interface MultiSeriesChartProps {
  // Datos y configuración básica
  data: Array<any>;
  xAxisKey: string;
  title?: string;
  subtitle?: string;
  
  // Configuración de las series
  series: SeriesConfig[];
  
  // Configuración del eje Y
  valueType: ValueType;
  valueDomain?: [number | string, number | string];
  
  // Líneas de referencia
  referenceLines?: ReferenceLineConfig[];
}

export default function MultiSeriesChart({
  data,
  xAxisKey = "periodo",
  title = "Comparativa",
  subtitle,
  series,
  valueType = 'UF',
  valueDomain = ['dataMin - 100', 'dataMax + 100'],
  referenceLines = [],
}: MultiSeriesChartProps) {
  
  // Función para obtener el formateador según el tipo de valor
  const getFormatter = (type: ValueType) => {
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
  
  const formatter = getFormatter(valueType);
  
  // Función para formatear ticks según el tipo
  const formatTickValue = (value: number) => {
    switch (valueType) {
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
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
        <XAxis 
          dataKey={xAxisKey} 
          tick={{ fontSize: 12 }}
          tickLine={{ stroke: '#E9ECEF' }}
        />
        <YAxis 
          tickFormatter={formatTickValue}
          tick={{ fontSize: 12 }}
          tickLine={{ stroke: '#E9ECEF' }}
          domain={valueDomain}
        />
        <Tooltip 
          formatter={(value: number) => [formatter(value), valueType]}
          labelFormatter={(label) => `${xAxisKey}: ${label}`}
        />
        <Legend />
        
        {/* Líneas de referencia */}
        {referenceLines.map((line, index) => (
          <ReferenceLine 
            key={index}
            y={line.y} 
            stroke={line.stroke} 
            strokeDasharray={line.strokeDasharray}
            label={{ 
              value: line.label, 
              position: 'insideBottomRight',
              fill: line.stroke,
              fontSize: 12
            }}
          />
        ))}
        
        {series.map((serie, index) => (
          <Line 
            key={index}
            type="monotone" 
            dataKey={serie.dataKey} 
            name={serie.label} 
            stroke={serie.color} 
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6, stroke: serie.color, strokeWidth: 2 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}