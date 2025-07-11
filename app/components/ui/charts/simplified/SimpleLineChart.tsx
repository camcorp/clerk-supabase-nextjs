import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatUF, formatCLP, formatPercent, formatNumber } from '@/lib/utils/formatters';
import { colors } from '@/config/theme';

// Definir tipos para los formatos de valores
export type ValueType = 'UF' | 'CLP' | 'PERCENT' | 'NUMBER';

interface SimpleLineChartProps {
  // Datos y configuración básica
  data: Array<any>;
  xAxisKey: string;
  dataKey: string;
  title?: string;
  subtitle?: string;
  
  // Configuración del eje Y
  valueLabel: string;
  valueType: ValueType;
  valueDomain?: [number | string, number | string];
  
  // Estilo
  color?: string;
}

export default function SimpleLineChart({
  data,
  xAxisKey,
  dataKey,
  title = "Evolución",
  subtitle,
  valueLabel = "Valor",
  valueType = 'UF',
  valueDomain = ['dataMin - 100', 'dataMax + 100'],
  color = colors.companias.primary
}: SimpleLineChartProps) {
  
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
    <div className="bg-white rounded-xl shadow-sm border border-[#E9ECEF] overflow-hidden transition-all duration-300 hover:shadow-md">
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-[#0F3460] font-['Space_Grotesk']">{title}</h3>
          {subtitle && <p className="text-sm text-[#6C757D]">{subtitle}</p>}
        </div>
        
        <div className="h-80">
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
                formatter={(value: number) => [formatter(value), valueLabel]}
                labelFormatter={(label) => `${xAxisKey}: ${label}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey={dataKey} 
                name={valueLabel} 
                stroke={color} 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}