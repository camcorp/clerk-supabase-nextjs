'use client';

import React from 'react';
import SimpleLineChart from './simplified/SimpleLineChart';

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
    <SimpleLineChart
      data={data}
      xAxisKey="periodo"
      dataKey={countKey}
      title={title}
      subtitle={subtitle}
      valueLabel="Cantidad"
      valueType="NUMBER"
      color={color}
    />
  );
}