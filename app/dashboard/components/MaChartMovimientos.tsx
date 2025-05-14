import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatNumber } from '../memoria-anual/utils/formatters';

interface MaChartMovimientosProps {
  datos: any[];
  periodos: string[];
  tipo: 'companias' | 'corredores';
}

export default function MaChartMovimientos({ datos, periodos, tipo }: MaChartMovimientosProps) {
  // Determinar el título y descripción según el tipo
  const titulo = tipo === 'companias' 
    ? 'Movimientos Históricos de Compañías' 
    : 'Movimientos Históricos de Corredores';
  
  const descripcion = tipo === 'companias'
    ? 'Entradas y salidas de compañías en el mercado asegurador'
    : 'Entradas y salidas de corredores en el mercado';

  // Procesar datos para todos los períodos
  const movimientosData = periodos.map(periodo => {
    // Filtrar movimientos para este período
    const movimientosPeriodo = datos.filter(item => item.periodo === periodo);
    
    console.log(`Movimientos para período ${periodo}:`, movimientosPeriodo);
    
    // Verificar la estructura de los datos
    if (movimientosPeriodo.length > 0) {
      console.log('Ejemplo de estructura de datos:', JSON.stringify(movimientosPeriodo[0]));
    }
    
    // Contar entradas y salidas con verificación de tipo_cambio
    const entradas = movimientosPeriodo.filter(item => 
      item.tipo_cambio === 'entrada' || 
      item.tipo_cambio === 'ENTRADA' || 
      item.tipo_cambio === 1
    ).length;
    
    const salidas = movimientosPeriodo.filter(item => 
      item.tipo_cambio === 'salida' || 
      item.tipo_cambio === 'SALIDA' || 
      item.tipo_cambio === 0
    ).length;
    
    console.log(`Período ${periodo}: entradas=${entradas}, salidas=${salidas}`);
    
    return {
      periodo,
      entradas,
      salidas: -salidas, // Valor negativo para mostrar hacia abajo
      neto: entradas - salidas
    };
  });

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">{titulo}</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          {descripcion}
        </p>
      </div>
      <div className="px-4 py-5 sm:p-6">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={movimientosData}
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
              <Bar dataKey="entradas" fill="#4ade80" name="Entradas" />
              <Bar dataKey="salidas" fill="#f87171" name="Salidas" />
              <Bar dataKey="neto" fill="#60a5fa" name="Neto" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}