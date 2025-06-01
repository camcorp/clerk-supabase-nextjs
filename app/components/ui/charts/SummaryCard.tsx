import React from 'react';
import { colors, getTrendColor } from '@/config/theme';

// ... existing code ...

// Definir la interfaz para los items individuales
interface SummaryItem {
  label: string;
  value: string;
  icon?: string;
  trend?: string | null;
}

interface SummaryCardProps {
  title: string;
  value?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: number | null;
  trendLabel?: string;
  tooltip?: string;
  items?: Array<{
    label: string;
    value: any;
    format?: string;
    trend?: number | null | string;
    icon?: React.ReactNode;
    tooltip?: string;  // Añadir propiedad tooltip para descripciones adicionales
  }>;
  color?: string;
  data?: Array<{
    label: string;
    value: any;
    format: string;
  }>;
}

export default function SummaryCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  trendLabel, 
  tooltip, 
  items 
}: SummaryCardProps) {
  // Determine trend color based on value
  const getTrendColor = (trendValue: number | string | null | undefined) => {
    if (trendValue === null || trendValue === undefined) {
      return 'text-gray-500'; // Neutral
    }
    
    if (typeof trendValue === 'number') {
      if (trendValue >= 0) return 'text-[#2ECC71]'; // Success green
      return 'text-[#E74C3C]'; // Alert red
    } else if (trendValue === 'up') {
      return 'text-[#2ECC71]';
    } else if (trendValue === 'down') {
      return 'text-[#E74C3C]';
    }
    return 'text-gray-500'; // Neutral
  };
  
  // Format trend value for display
  const formatTrend = (trendValue: number | null | undefined): string => {
    if (trendValue === null || trendValue === undefined) return '';
    return trendValue > 0 ? `+${trendValue.toFixed(1)}%` : `${trendValue.toFixed(1)}%`;
  };

  // Renderizar la versión simple (un solo valor)
  if (!items) {
    return (
      <div className="bg-gradient-to-br from-white to-[#f8f9fc] rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-[rgba(231,231,231,0.8)] p-6 transition-all duration-300 hover:translate-y-[-5px] hover:shadow-[0_10px_25px_rgba(0,0,0,0.08)]">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm font-medium text-[#6C757D] font-['Inter']">{title}</h3>
            {value && (
              <p className={`mt-2 text-2xl font-bold font-['Inter'] bg-gradient-to-r from-[#0F3460] to-[#1A7F8E] bg-clip-text text-transparent`}>
                {value}
              </p>
            )}
            {subtitle && (
              <p className="mt-1 text-xs text-[#6C757D] font-['Inter']">{subtitle}</p>
            )}
          </div>
          {icon && (
            <div className="p-2 bg-[#F8F9FC] rounded-lg">
              {icon}
            </div>
          )}
        </div>
        
        {trend !== undefined && trend !== null && (
          <div className="mt-4 flex items-center">
            <span className={getTrendColor(trend)}>
              {trend >= 0 ? "↑" : "↓"} {Math.abs(trend).toFixed(1)}%
            </span>
            {trendLabel && <span className="ml-2 text-xs text-[#6C757D]">{trendLabel}</span>}
          </div>
        )}
      </div>
    );
  }

  // Renderizar la versión con múltiples items
  return (
    <div className="bg-gradient-to-br from-white to-[#f8f9fc] rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-[rgba(231,231,231,0.8)] p-6 transition-all duration-300 hover:translate-y-[-5px] hover:shadow-[0_10px_25px_rgba(0,0,0,0.08)]">
      <h3 className="text-sm font-medium text-[#6C757D] font-['Inter'] mb-4">{title}</h3>
      
      <div className="space-y-4">
        {items && items.length > 0 && (
          <div className="mt-4 space-y-2">
            {items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-sm text-[#6C757D]">{item.label}</span>
                <div className="flex items-center">
                  <span className="font-semibold text-[#0F3460]">{item.value}</span>
                  
                  {item.trend !== undefined && (
                    <span className={`ml-2 ${getTrendColor(item.trend)}`}>
                      {typeof item.trend === 'string' 
                        ? (item.trend === 'up' ? "↑" : item.trend === 'down' ? "↓" : "") 
                        : (item.trend !== null && typeof item.trend === 'number' 
                          ? (item.trend >= 0 ? "↑" : "↓") + " " + Math.abs(item.trend).toFixed(1) + "%" 
                          : "")}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}