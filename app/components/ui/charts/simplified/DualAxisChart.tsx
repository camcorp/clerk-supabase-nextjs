import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatUF, formatCLP, formatPercent, formatNumber } from '@/lib/utils/formatters';
import { colors } from '@/config/theme';

// Definir tipos para los formatos de valores
export type ValueType = 'UF' | 'CLP' | 'PERCENT' | 'NUMBER';

interface DualAxisChartProps {
  // Datos y configuración básica
  data: Array<any>;
  xAxisKey: string;
  title?: string;
  subtitle?: string;
  
  // Configuración del eje Y1 (izquierdo)
  Y1dataKey: string;
  Y1valueLabel: string;
  Y1valueType: ValueType;
  Y1domain?: [number | string, number | string];
  Y1color?: string;
  
  // Configuración del eje Y2 (derecho)
  Y2dataKey: string;
  Y2valueLabel: string;
  Y2valueType: ValueType;
  Y2domain?: [number | string, number | string];
  Y2color?: string;
}

export default function DualAxisChart({ 
  data, 
  xAxisKey = "periodo",
  title = "Gráfico de Doble Eje", 
  subtitle,
  
  // Eje Y1 (izquierdo)
  Y1dataKey = "valor",
  Y1valueLabel = "Valor",
  Y1valueType = 'UF',
  Y1domain = ['dataMin - 100', 'dataMax + 100'],
  Y1color = colors.companias.primary,
  
  // Eje Y2 (derecho)
  Y2dataKey = "crecimiento",
  Y2valueLabel = "Crecimiento",
  Y2valueType = 'PERCENT',
  Y2domain = [-30, 30],
  Y2color = colors.status.info
}: DualAxisChartProps) {
  
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
  
  // Obtener formateadores para ambos ejes
  const Y1formatter = getFormatter(Y1valueType);
  const Y2formatter = getFormatter(Y2valueType);
  
  // Función para formatear ticks según el tipo
  const formatTickValue = (value: number, type: ValueType) => {
    switch (type) {
      case 'CLP':
        return getFormatter(type)(value).split('$')[1]; // Mostrar sin el símbolo $ para los ticks
      case 'UF':
        return getFormatter(type)(value).split(' ')[0]; // Quitar el "UF" para los ticks
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
                yAxisId="left"
                tickFormatter={(value) => formatTickValue(value, Y1valueType)}
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#E9ECEF' }}
                domain={Y1domain}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                tickFormatter={(value) => formatTickValue(value, Y2valueType)}
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#E9ECEF' }}
                domain={Y2domain}
              />
              <Tooltip 
                formatter={(value: number, name: string) => {
                  if (name === Y1valueLabel) {
                    return [Y1formatter(value), Y1valueLabel];
                  }
                  return [Y2formatter(value), Y2valueLabel];
                }}
                labelFormatter={(label) => `${xAxisKey}: ${label}`}
              />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey={Y1dataKey} 
                name={Y1valueLabel} 
                stroke={Y1color} 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6, stroke: Y1color, strokeWidth: 2 }}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey={Y2dataKey} 
                name={Y2valueLabel} 
                stroke={Y2color} 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6, stroke: Y2color, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}