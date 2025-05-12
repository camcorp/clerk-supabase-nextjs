import React from 'react';
import { PeriodSummary } from '../hooks/useMarketData';
import { formatUF } from '../memoria-anual/utils/formatters';

interface MaCardSummaryProps {
  summary: PeriodSummary;
  loading: boolean;
}

export default function MaCardSummary({ summary, loading }: MaCardSummaryProps) {
  if (loading) {
    return <div className="text-center py-4">Cargando resumen...</div>;
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Resumen del Período</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Información general del mercado para el período seleccionado.
        </p>
      </div>
      <div className="border-t border-gray-200">
        <dl>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Total Prima UF</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {formatUF(summary.totalMercado, 0)}
              {summary.crecimientoTotal !== null && (
                <span className={`ml-2 ${summary.crecimientoTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {summary.crecimientoTotal >= 0 ? '+' : ''}{summary.crecimientoTotal.toFixed(2)}%
                </span>
              )}
            </dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Seguros Generales</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {formatUF(summary.totalGenerales, 0)}
              {summary.crecimientoGenerales !== null && (
                <span className={`ml-2 ${summary.crecimientoGenerales >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {summary.crecimientoGenerales >= 0 ? '+' : ''}{summary.crecimientoGenerales.toFixed(2)}%
                </span>
              )}
            </dd>
          </div>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Seguros de Vida</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {formatUF(summary.totalVida, 0)}
              {summary.crecimientoVida !== null && (
                <span className={`ml-2 ${summary.crecimientoVida >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {summary.crecimientoVida >= 0 ? '+' : ''}{summary.crecimientoVida.toFixed(2)}%
                </span>
              )}
            </dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Compañías</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {summary.companiasCount} ({summary.companiasGeneralesCount} Generales, {summary.companiasVidaCount} Vida)
            </dd>
          </div>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Movimientos</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <span className="text-green-600">+{summary.entradasPeriodo} entradas</span>, 
              <span className="text-red-600 ml-2">-{summary.salidasPeriodo} salidas</span>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}