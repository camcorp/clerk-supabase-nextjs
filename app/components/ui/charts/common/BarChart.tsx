'use client';

import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '@/app/components/ui/Card';
import { getChartColors } from '@/lib/utils/colors';
import { formatUF, formatCLP, formatPercent, formatPercentage, formatNumber } from '@/lib/utils/formatters';

interface BarChartProps {
  data: any[];
  dataKeys: string[];
  xAxisKey: string;
  title?: string;
  subtitle?: string;
  height?: number | string;
  colors?: string[];
  formatter?: (value: any, name: string) => [any, string];
  className?: string;
}

export default function BarChart({
  data,
  dataKeys,
  xAxisKey,
  title,
  subtitle,
  height = 300,
  colors = getChartColors(10),
  formatter,
  className = ''
}: BarChartProps) {
  return (
    <Card
      title={title}
      subtitle={subtitle}
      className={className}
    >
      <div style={{ height: typeof height === 'number' ? `${height}px` : height }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <Tooltip formatter={formatter || ((value) => [formatNumber(Number(value), 0), ''])} />
            <Legend />
            {dataKeys.map((key, index) => (
              <Bar 
                key={key} 
                dataKey={key} 
                fill={colors[index % colors.length]} 
                name={key}
              />
            ))}
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}