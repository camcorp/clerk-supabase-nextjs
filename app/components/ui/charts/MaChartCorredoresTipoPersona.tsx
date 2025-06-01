'use client';

import React from 'react';
import '@/app/lib/utils/chartConfig'; // Importar la configuración de Chart.js
import { Pie } from 'react-chartjs-2';
import { formatUF, formatNumber } from '@/lib/utils/formatters';

interface MaChartCorredoresTipoPersonaProps {
  corredoresTipoPersona: any[];
  periodo: string;
}

export default function MaChartCorredoresTipoPersona({ corredoresTipoPersona, periodo }: MaChartCorredoresTipoPersonaProps) {
  // Mapeo de códigos de tipo de persona a nombres
  const tipoPersonaNombres: Record<string, string> = {
    'N': 'Persona Natural',
    'J': 'Persona Jurídica'
  };

  // Preparar datos para el gráfico
  const tiposPersona = corredoresTipoPersona.map(item => tipoPersonaNombres[item.tipo_persona] || `Tipo ${item.tipo_persona}`);
  const numeroCorredores = corredoresTipoPersona.map(item => item.numero_corredores);
  const primaTotalUF = corredoresTipoPersona.map(item => item.total_primauf);

  const dataCorredores = {
    labels: tiposPersona,
    datasets: [
      {
        label: 'Número de Corredores',
        data: numeroCorredores,
        backgroundColor: [
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 99, 132, 0.5)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  const dataPrima = {
    labels: tiposPersona,
    datasets: [
      {
        label: 'Prima Total (UF)',
        data: primaTotalUF,
        backgroundColor: [
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)'
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  const optionsCorredores = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Distribución de Corredores por Tipo de Persona - Periodo ${periodo}`
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw;
            const percentage = Math.round((value / numeroCorredores.reduce((a, b) => a + b, 0)) * 100);
            return `${label}: ${formatNumber(value)} (${percentage}%)`;
          }
        }
      }
    }
  };

  const optionsPrima = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Distribución de Prima por Tipo de Persona - Periodo ${periodo}`
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw;
            const percentage = Math.round((value / primaTotalUF.reduce((a, b) => a + b, 0)) * 100);
            return `${label}: ${formatUF(value)} (${percentage}%)`;
          }
        }
      }
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Distribución de Corredores por Tipo de Persona</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Distribución de corredores y prima total por tipo de persona para el periodo {periodo}.
        </p>
      </div>
      <div className="px-4 py-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-md font-medium text-gray-700 mb-2">Distribución por Número de Corredores</h4>
          <Pie data={dataCorredores} options={optionsCorredores} />
        </div>
        <div>
          <h4 className="text-md font-medium text-gray-700 mb-2">Distribución por Prima Total</h4>
          <Pie data={dataPrima} options={optionsPrima} />
        </div>
      </div>
    </div>
  );
}