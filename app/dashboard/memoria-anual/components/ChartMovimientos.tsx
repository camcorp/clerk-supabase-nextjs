'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatNumber } from '../utils/formatters';
import { colors } from '../utils/systemcolors';

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
  // Determinar colores según el tipo
  const primaryColor = colors[tipo].primary;
  const lightColor = colors[tipo].light;
  
  // Determinar el título y descripción según el tipo si no se proporcionan
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

  // Usar los valores predeterminados si no se proporcionan
  const displayTitle = title || defaultTitle;
  const displaySubtitle = subtitle || defaultSubtitle;

  // Procesar datos para asegurar que las salidas sean negativas para visualización
  const chartData = data.map(item => ({
    ...item,
    salidas: -Math.abs(item.salidas || 0),
    neto: (item.entradas || 0) - (item.salidas || 0)
  }));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E9ECEF] overflow-hidden transition-all duration-300 hover:shadow-md">
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold font-['Space_Grotesk']" style={{ color: primaryColor }}>
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
              <Bar dataKey="entradas" fill={colors.status.success} name="Entradas" />
              <Bar dataKey="salidas" fill={colors.status.danger} name="Salidas" />
              {showNeto && <Bar dataKey="neto" fill={primaryColor} name="Neto" />}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}