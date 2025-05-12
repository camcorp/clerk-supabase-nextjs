import React from 'react';

// Definir la interfaz para los items individuales
interface SummaryItem {
  label: string;
  value: string;
  icon?: string;
  trend?: string | null;
}

interface SummaryCardProps {
  title: string;
  value?: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: number;
  trendLabel?: string;
  tooltip?: string;
  items?: SummaryItem[];
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
  const getTrendColor = (trend: number | string) => {
    if (typeof trend === 'number') {
      if (trend >= 0) return 'text-[#2ECC71]'; // Success green
      return 'text-[#E74C3C]'; // Alert red
    } else if (trend === 'up') {
      return 'text-[#2ECC71]';
    } else if (trend === 'down') {
      return 'text-[#E74C3C]';
    }
    return 'text-gray-500'; // Neutral
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
        
        {trend !== undefined && (
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
        {items.map((item, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="text-sm text-[#6C757D]">{item.label}</span>
            <div className="flex items-center">
              <span className="font-semibold text-[#0F3460]">{item.value}</span>
              
              {item.trend && (
                <span className={`ml-2 ${getTrendColor(item.trend)}`}>
                  {item.trend === 'up' ? "↑" : item.trend === 'down' ? "↓" : ""}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}