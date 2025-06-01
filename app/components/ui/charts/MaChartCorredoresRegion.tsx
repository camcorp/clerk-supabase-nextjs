'use client';

import React from 'react';
import '@/app/lib/utils/chartConfig'; // Importar la configuración de Chart.js
import { Bar } from 'react-chartjs-2';
import { formatUF, formatNumber } from '@/lib/utils/formatters';

interface MaChartCorredoresRegionProps {
  corredoresRegion: any[];
  periodo: string;
}

export default function MaChartCorredoresRegion({ corredoresRegion, periodo }: MaChartCorredoresRegionProps) {
  // Mapeo de códigos de región a nombres
  const regionesNombres: Record<number, string> = {
    1: 'Tarapacá',
    2: 'Antofagasta',
    3: 'Atacama',
    4: 'Coquimbo',
    5: 'Valparaíso',
    6: "O'Higgins",
    7: 'Maule',
    8: 'Biobío',
    9: 'La Araucanía',
    10: 'Los Lagos',
    11: 'Aysén',
    12: 'Magallanes',
    13: 'Metropolitana',
    14: 'Los Ríos',
    15: 'Arica y Parinacota',
    16: 'Ñuble'
  };

  // Preparar datos para el gráfico
  const regiones = corredoresRegion.map(item => regionesNombres[item.region] || `Región ${item.region}`);
  const numeroCorredores = corredoresRegion.map(item => item.numero_corredores);
  const primaTotalUF = corredoresRegion.map(item => item.total_primauf);

  const data = {
    labels: regiones,
    datasets: [
      {
        label: 'Número de Corredores',
        data: numeroCorredores,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        yAxisID: 'y'
      },
      {
        label: 'Prima Total (UF)',
        data: primaTotalUF,
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
        yAxisID: 'y1'
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Distribución de Corredores por Región - Periodo ${periodo}`
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.raw;
            if (label === 'Número de Corredores') {
              return `${label}: ${formatNumber(value)}`;
            } else {
              return `${label}: ${formatUF(value)}`;
            }
          }
        }
      }
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Número de Corredores'
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: 'Prima Total (UF)'
        }
      },
    },
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Distribución de Corredores por Región</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Número de corredores y prima total por región para el periodo {periodo}.
        </p>
      </div>
      <div className="px-4 py-5 sm:p-6">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}