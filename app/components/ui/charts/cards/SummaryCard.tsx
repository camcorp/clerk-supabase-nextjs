import React from 'react';
import { formatUF, formatCLP, formatPercent, formatNumber } from '@/lib/utils/formatters';

interface SummaryCardProps {
  title: string;
  data?: Array<{
    label: string;
    value: number;
    format?: 'uf' | 'clp' | 'percent' | 'number';
  }>;
  color?: string;
  value?: string;
  trend?: number;
  trendLabel?: string;
}

export default function SummaryCard({ 
  title, 
  data, 
  color = '#1A7F8E',
  value,
  trend,
  trendLabel
}: SummaryCardProps) {
  // Función para formatear valores según el tipo
  const formatValue = (value: number, format?: string) => {
    switch (format) {
      case 'uf':
        return formatUF(value);
      case 'clp':
        return formatCLP(value);
      case 'percent':
        return formatPercent(value);
      case 'number':
        return formatNumber(value, 0);
      default:
        return value.toString();
    }
  };
  
  // Determinar si es una tarjeta simple o con múltiples datos
  const isSimpleCard = !data && value !== undefined;
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E9ECEF] overflow-hidden transition-all duration-300 hover:shadow-md">
      <div className="p-6">
        <h3 className="text-sm font-medium text-gray-500 mb-2">{title}</h3>
        
        {isSimpleCard ? (
          <div className="space-y-2">
            <p className="text-2xl font-semibold" style={{ color }}>
              {value}
            </p>
            
            {trend !== undefined && (
              <div className="flex items-center">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  trend > 0 
                    ? 'bg-green-100 text-green-800' 
                    : trend < 0 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-gray-100 text-gray-800'
                }`}>
                  {trend > 0 ? '+' : ''}{trend.toFixed(2)}%
                  {trend > 0 ? '↑' : trend < 0 ? '↓' : ''}
                </span>
                {trendLabel && (
                  <span className="ml-2 text-xs text-gray-500">{trendLabel}</span>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {data?.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{item.label}</span>
                <span className="text-sm font-medium" style={{ color }}>
                  {formatValue(item.value, item.format)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}