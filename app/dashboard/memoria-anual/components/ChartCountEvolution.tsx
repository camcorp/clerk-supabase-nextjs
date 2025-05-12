'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartCountEvolutionProps {
  data: Array<{
    periodo: string;
    [key: string]: any;
  }>;
  countKey: string;
  title?: string;
  subtitle?: string;
  color?: string;
}

export default function ChartCountEvolution({ 
  data, 
  countKey,
  title = "Evolución de Cantidades", 
  subtitle,
  color = "#1A7F8E"
}: ChartCountEvolutionProps) {
  
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
                dataKey="periodo" 
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#E9ECEF' }}
              />
              <YAxis 
                tickFormatter={(value) => Math.round(value).toString()}
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#E9ECEF' }}
              />
              <Tooltip 
                formatter={(value: number) => [Math.round(value), "Cantidad"]}
                labelFormatter={(label) => `Período: ${label}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey={countKey} 
                name="Cantidad" 
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