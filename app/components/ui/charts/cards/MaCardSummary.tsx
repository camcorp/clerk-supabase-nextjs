'use client';

import React from 'react';

// import { useMarketData } from '@/hooks/api/useMarketData'; // Eliminar esta línea, no se usa
import { formatUF, formatCLP, formatPercent, formatNumber } from '@/lib/utils/formatters';

interface MaCardSummaryProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number | null;
  trendLabel?: string;
  icon?: React.ReactNode;
}

export default function MaCardSummary({
  title,
  value,
  subtitle,
  trend,
  trendLabel,
  icon
}: MaCardSummaryProps) {
  // Format the value if it's a number
  // Format the value based on content type
  const formattedValue = typeof value === 'number' 
    ? title.includes('Prima') || subtitle === 'UF' 
      ? formatUF(value) 
      : formatNumber(value) 
    : value;
  
  // Determine trend color
  const trendColor = trend === null || trend === undefined
    ? 'text-gray-500' 
    : trend >= 0 
      ? 'text-green-600' 
      : 'text-red-600';
  
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-start">
          <div>
            <dt className="text-sm font-medium text-gray-500 truncate">
              {title}
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {formattedValue}
            </dd>
            {subtitle && (
              <dd className="mt-2 text-sm text-gray-500">
                {subtitle}
              </dd>
            )}
            {trend !== null && trend !== undefined && (
              <dd className={`mt-2 text-sm ${trendColor}`}>
                {trend >= 0 ? '+' : ''}{trend.toFixed(2)}% {trendLabel || 'vs periodo anterior'}
              </dd>
            )}
          </div>
          {icon && (
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-1 sm:gap-4">
              {icon}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}