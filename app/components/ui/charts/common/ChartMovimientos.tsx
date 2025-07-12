'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatNumber, formatChartTooltip } from '@/lib/utils/formatters';
import { colors, typography, theme, getDomainColor, getStatusColor } from '@/app/config/theme';

interface ChartMovimientosProps {
  data: Array<{
    periodo: string;
    entradas: number;
    salidas: number;
    neto?: number;
  }>;
  title?: string;
  subtitle?: string;
  showNeto?: boolean;
  tipo: 'companias' | 'ramos' | 'corredores';
}

export default function ChartMovimientos({ 
  data, 
  title, 
  subtitle,
  showNeto = true,
  tipo
}: ChartMovimientosProps) {
  // Determine colors based on type using theme
  const primaryColor = getDomainColor(tipo, 'primary');
  const secondaryColor = getDomainColor(tipo, 'secondary');
  const lightColor = getDomainColor(tipo, 'light');
  
  // Determine title and description based on type if not provided
  const defaultTitle = tipo === 'companias' 
    ? 'Movimientos de Compañías' 
    : tipo === 'corredores'
      ? 'Movimientos de Corredores'
      : 'Movimientos de Ramos';
  
  const defaultSubtitle = tipo === 'companias'
    ? 'Entradas y salidas de compañías en el mercado asegurador'
    : tipo === 'corredores'
      ? 'Entradas y salidas de corredores en el mercado'
      : 'Cambios en la oferta de ramos de seguros';

  // Use default values if not provided
  const displayTitle = title || defaultTitle;
  const displaySubtitle = subtitle || defaultSubtitle;

  // Process data to ensure exits are negative for visualization
  const chartData = data.map(item => ({
    ...item,
    periodo: item.periodo,
    entradas: item.entradas || 0,
    salidas: -Math.abs(item.salidas || 0),
    neto: (item.entradas || 0) - (item.salidas || 0)
  }));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E9ECEF] overflow-hidden transition-all duration-300 hover:shadow-md">
      <div className="p-6">
        <div className="mb-4">
          <h3 className={`text-lg font-semibold ${theme.fonts.secondary}`} style={{ color: primaryColor }}>
            {displayTitle}
          </h3>
          {displaySubtitle && <p className="text-sm text-[#6C757D]">{displaySubtitle}</p>}
        </div>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="periodo" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'salidas') {
                    return [Math.abs(Number(value)), 'Salidas'];
                  } else if (name === 'entradas') {
                    return [Number(value), 'Entradas'];
                  } else if (name === 'neto') {
                    return [Number(value), 'Neto'];
                  }
                  return [value, name];
                }}
              />
              <Legend />
              <Bar dataKey="entradas" fill={getStatusColor('success')} name="Entradas" />
              <Bar dataKey="salidas" fill={getStatusColor('danger')} name="Salidas" />
              {showNeto && <Bar dataKey="neto" fill={primaryColor} name="Neto" />}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}