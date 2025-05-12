'use client';

import Link from 'next/link';
import React from 'react';

interface MaHeaderProps {
  selectedPeriodo: string;
  setSelectedPeriodo: (periodo: string) => void;
  periodos: string[];
}

export default function MaHeader({ selectedPeriodo, setSelectedPeriodo, periodos }: MaHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-semibold text-gray-900">Memoria Anual del Mercado Asegurador</h1>
      
      <div className="flex items-center space-x-4">
        <Link 
          href="/dashboard/memoria-anual"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Ver Memoria Completa
        </Link>
        
        <div className="flex items-center">
          <label htmlFor="periodo" className="mr-2 text-sm font-medium text-gray-700">
            Periodo:
          </label>
          <select
            id="periodo"
            value={selectedPeriodo}
            onChange={(e) => setSelectedPeriodo(e.target.value)}
            className="block w-40 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            {periodos.map((periodo) => (
              <option key={periodo} value={periodo}>
                {periodo}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}