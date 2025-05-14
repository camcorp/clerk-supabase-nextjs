'use client';

import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatUF, formatCLP, formatPercent } from '../utils/formatters';
import { colors } from '../utils/colors';

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
  valueLabel?: string;
  growthLabel?: string;
  formatValue?: (value: number) => string;
  formatGrowth?: (value: number) => string;
}

export default function ChartDualAxis({ 
  data, 
  title = "Evolución y Crecimiento", 
  subtitle,
  primaryColor = colors.companias.primary,
  secondaryColor = colors.status.info,
  valueLabel = "Valor",
  growthLabel = "Crecimiento",
  formatValue = (value: number) => formatUF(value, 2, false),
  formatGrowth = (value: number) => formatPercent(value, 2)
}: ChartDualAxisProps) {
  
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
                tickFormatter={(value) => formatValue(value).split(' ')[0]}
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#E9ECEF' }}
                domain={['dataMin - 100', 'dataMax + 100']}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                tickFormatter={(value) => `${value}%`}
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#E9ECEF' }}
                domain={[-30, 30]}
              />
              <Tooltip 
                formatter={(value: number, name: string) => {
                  if (name === valueLabel) {
                    return [formatValue(value), valueLabel];
                  }
                  return [`${value.toFixed(2)}%`, growthLabel];
                }}
                labelFormatter={(label) => `Período: ${label}`}
              />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="valor" 
                name={valueLabel} 
                stroke={primaryColor} 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6, stroke: primaryColor, strokeWidth: 2 }}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="crecimiento" 
                name={growthLabel} 
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