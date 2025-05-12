'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

interface ChartMoveProps {
  data: Array<{
    periodo: string;
    entradas?: number;
    salidas?: number;
    neto?: number;
    [key: string]: any;
  }>;
  title?: string;
  subtitle?: string;
  showNeto?: boolean;
}

export default function ChartMove({ 
  data, 
  title = "Movimientos por Período", 
  subtitle = "Entradas y salidas de actores en el mercado",
  showNeto = true
}: ChartMoveProps) {
  
  // Verificar si hay datos disponibles
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-[#E9ECEF] overflow-hidden transition-all duration-300 hover:shadow-md">
        <div className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-[#0F3460] font-['Space_Grotesk']">{title}</h3>
            {subtitle && <p className="text-sm text-[#6C757D]">{subtitle}</p>}
          </div>
          <div className="flex justify-center items-center h-80">
            <p className="text-gray-500">No hay datos de movimientos disponibles</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E9ECEF] overflow-hidden transition-all duration-300 hover:shadow-md">
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-[#0F3460] font-['Space_Grotesk']">{title}</h3>
          {subtitle && <p className="text-sm text-[#6C757D]">{subtitle}</p>}
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
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
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#E9ECEF' }}
              />
              <Tooltip 
                formatter={(value: number, name: string) => {
                  const labels = {
                    entradas: "Entradas",
                    salidas: "Salidas",
                    neto: "Neto"
                  };
                  return [value, labels[name as keyof typeof labels] || name];
                }}
                labelFormatter={(label) => `Período: ${label}`}
              />
              <Legend />
              <ReferenceLine y={0} stroke="#000" />
              <Bar dataKey="entradas" name="Entradas" fill="#82ca9d" />
              <Bar dataKey="salidas" name="Salidas" fill="#ff7300" />
              {showNeto && <Bar dataKey="neto" name="Neto" fill="#8884d8" />}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}