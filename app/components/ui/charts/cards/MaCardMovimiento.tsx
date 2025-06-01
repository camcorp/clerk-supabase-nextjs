'use client';

import React from 'react';
import { colors } from '@/config/theme';

interface MaCardMovimientoProps {
  entradasCount: number;
  salidasCount: number;
  tipo: 'companias' | 'corredores';
}

export default function MaCardMovimiento({ entradasCount, salidasCount, tipo }: MaCardMovimientoProps) {
  const titulo = tipo === 'companias' ? 'Movimiento de Compañías' : 'Movimiento de Corredores';
  
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <dt className="text-sm font-medium text-gray-500 truncate">
          {titulo}
        </dt>
        <dd className="mt-1 flex justify-between">
          <div>
            <span className="text-2xl font-semibold text-green-600">+{entradasCount}</span>
            <span className="ml-2 text-sm text-gray-500">Entradas</span>
          </div>
          <div>
            <span className="text-2xl font-semibold text-red-600">-{salidasCount}</span>
            <span className="ml-2 text-sm text-gray-500">Salidas</span>
          </div>
        </dd>
      </div>
    </div>
  );
}