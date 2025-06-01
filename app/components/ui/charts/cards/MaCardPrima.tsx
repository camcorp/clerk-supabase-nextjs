'use client';

import React from 'react';
import { formatUF } from '@/lib/utils/formatters';

interface MaCardPrimaProps {
  totalPrimauf: number;
  growth: number | null;
}

export default function MaCardPrima({ totalPrimauf, growth }: MaCardPrimaProps) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <dt className="text-sm font-medium text-gray-500 truncate">
          Prima Total del Mercado
        </dt>
        <dd className="mt-1 text-3xl font-semibold text-gray-900">
          {formatUF(totalPrimauf, 0)}
        </dd>
        {growth !== null && (
          <dd className={`mt-2 text-sm ${(growth as number) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {(growth as number) >= 0 ? '+' : ''}{(growth as number).toFixed(2)}% vs periodo anterior
          </dd>
        )}
      </div>
    </div>
  );
}