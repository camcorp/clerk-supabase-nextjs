import React from 'react';
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatUF, formatCLP, formatPercent, formatNumber } from '@/lib/utils/formatters';

// Definir tipos para los formatos de valores
export type ValueType = 'UF' | 'CLP' | 'PERCENT' | 'NUMBER';

interface SimplePieChartProps {
  // Datos y configuración básica
  data: Array<{
    name: string;
    value: number;
    [key: string]: any;
  }>;
  title?: string;
  subtitle?: string;
  
  // Configuración del valor
  valueLabel: string;
  valueType: ValueType;
  
  // Estilo
  colors?: string[];
  showLegend?: boolean;
  showPercentage?: boolean;
}

export default function SimplePieChart({
  data,
  title = "Distribución",
  subtitle,
  valueLabel = "Valor",
  valueType = 'UF',
  colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'],
  showLegend = true,
  showPercentage = true
}: SimplePieChartProps) {
  
  // Función para obtener el formateador según el tipo de valor
  const getFormatter = (type: ValueType) => {
    switch (type) {
      case 'CLP':
        return (value: number) => formatCLP(value, true, 0);
      case 'UF':
        return (value: number) => formatUF(value, 0, true);
      case 'PERCENT':
        return (value: number) => formatPercent(value, 2);
      case 'NUMBER':
      default:
        return (value: number) => formatNumber(value, 0);
    }
  };
  
  const formatter = getFormatter(valueType);
  
  // Calcular el total para los porcentajes
  const total = data.reduce((sum, entry) => sum + entry.value, 0);
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E9ECEF] overflow-hidden transition-all duration-300 hover:shadow-md">
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-[#0F3460] font-['Space_Grotesk']">{title}</h3>
          {subtitle && <p className="text-sm text-[#6C757D]">{subtitle}</p>}
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => {
                  const formattedValue = formatter(value);
                  if (showPercentage) {
                    const percentage = ((value / total) * 100).toFixed(1);
                    return [`${formattedValue} (${percentage}%)`, valueLabel];
                  }
                  return [formattedValue, valueLabel];
                }}
              />
              {showLegend && <Legend />}
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}