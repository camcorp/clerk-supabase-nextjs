'use client';

import React, { useState } from 'react';
import { Compania } from '../hooks/useMarketData';
import { formatUF, formatNumber } from '../memoria-anual/utils/formatters';
// Corregir la importación de Heroicons
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

interface MaTableCompaniasProps {
  companias: Compania[];
  loading: boolean;
  historicalCompanias: any[];
  corredoresData?: any[];
  periodos: string[]; // Añadimos periodos como prop
}

export default function MaTableCompanias({ 
  companias, 
  loading, 
  historicalCompanias,
  corredoresData = [],
  periodos // Recibimos periodos como prop
}: MaTableCompaniasProps) {
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  if (loading) {
    return <div className="text-center py-4">Cargando datos de compañías...</div>;
  }

  // Agrupar compañías por grupo
  const companiasPorGrupo = companias.reduce((groups: Record<string, any[]>, compania) => {
    const grupo = compania.grupo || 'Sin Grupo';
    if (!groups[grupo]) {
      groups[grupo] = [];
    }
    groups[grupo].push(compania);
    return groups;
  }, {});

  // Calcular totales por grupo
  const totalesPorGrupo = Object.keys(companiasPorGrupo).map(grupo => {
    const companias = companiasPorGrupo[grupo];
    const totalPrima = companias.reduce((sum, c) => sum + c.total_primauf, 0);
    
    // Calcular crecimiento respecto al año anterior
    const periodoActual = companias[0]?.periodo;
    const periodoAnteriorIndex = periodos.indexOf(periodoActual) + 1;
    const periodoAnterior = periodoAnteriorIndex < periodos.length ? periodos[periodoAnteriorIndex] : null;
    
    let crecimiento = null;
    if (periodoAnterior) {
      const primaAnterior = historicalCompanias
        .filter(c => c.periodo === periodoAnterior && companias.some(actual => actual.nombrecia === c.nombrecia))
        .reduce((sum, c) => sum + (c.total_uf || 0), 0);
      
      if (primaAnterior > 0) {
        crecimiento = ((totalPrima - primaAnterior) / primaAnterior) * 100;
      }
    }
    
    // Contar corredores únicos que operan con compañías de este grupo
    const corredoresCount = new Set(
      corredoresData
        .filter(c => companias.some(cia => cia.nombrecia === c.nombrecia))
        .map(c => c.rut)
    ).size;
    
    return {
      grupo,
      totalPrima,
      crecimiento,
      corredoresCount,
      companias: companias.sort((a, b) => b.total_primauf - a.total_primauf) // Ordenar por prima descendente
    };
  }).sort((a, b) => b.totalPrima - a.totalPrima); // Ordenar grupos por prima total

  const toggleGroup = (grupo: string) => {
    setExpandedGroups(prev => 
      prev.includes(grupo) 
        ? prev.filter(g => g !== grupo) 
        : [...prev, grupo]
    );
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Compañías del Mercado</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Listado de compañías activas en el periodo seleccionado.
        </p>
      </div>
      <div className="px-4 py-5 sm:p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grupo / Compañía
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prima UF
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Crecimiento
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Corredores
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {totalesPorGrupo.map((grupoData) => (
                <React.Fragment key={grupoData.grupo}>
                  {/* Fila del grupo */}
                  <tr 
                    className="bg-gray-50 cursor-pointer hover:bg-gray-100"
                    onClick={() => toggleGroup(grupoData.grupo)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center">
                      {expandedGroups.includes(grupoData.grupo) ? (
                        <ChevronDownIcon className="h-5 w-5 mr-2" />
                      ) : (
                        <ChevronRightIcon className="h-5 w-5 mr-2" />
                      )}
                      {grupoData.grupo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                      {formatUF(grupoData.totalPrima, 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      {grupoData.crecimiento !== null ? (
                        <span className={grupoData.crecimiento >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {grupoData.crecimiento >= 0 ? '+' : ''}{formatNumber(grupoData.crecimiento, 2)}%
                        </span>
                      ) : (
                        <span className="text-gray-500">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                      {grupoData.corredoresCount}
                    </td>
                  </tr>
                  
                  {/* Filas de compañías del grupo */}
                  {expandedGroups.includes(grupoData.grupo) && grupoData.companias.map((compania) => (
                    <tr key={compania.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 pl-12 whitespace-nowrap text-sm text-gray-500">
                        {compania.nombrecia}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                        {formatUF(compania.total_primauf, 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        {(() => {
                          const periodoActual = compania.periodo;
                          const periodoAnteriorIndex = periodos.indexOf(periodoActual) + 1;
                          const periodoAnterior = periodoAnteriorIndex < periodos.length ? periodos[periodoAnteriorIndex] : null;
                          
                          if (!periodoAnterior) return <span className="text-gray-500">N/A</span>;
                          
                          const companiaAnterior = historicalCompanias.find(
                            c => c.periodo === periodoAnterior && c.nombrecia === compania.nombrecia
                          );
                          
                          if (!companiaAnterior || !companiaAnterior.total_uf) {
                            return <span className="text-green-600">Nuevo</span>;
                          }
                          
                          const crecimiento = ((compania.total_primauf - companiaAnterior.total_uf) / companiaAnterior.total_uf) * 100;
                          
                          return (
                            <span className={crecimiento >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {crecimiento >= 0 ? '+' : ''}{formatNumber(crecimiento, 2)}%
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                        {/* Número de corredores de esta compañía */}
                        {new Set(
                          corredoresData
                            .filter(c => c.nombrecia === compania.nombrecia)
                            .map(c => c.rut)
                        ).size}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
              
              {totalesPorGrupo.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                    No hay compañías para mostrar en este periodo.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50">
                <td className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </td>
                <td className="px-6 py-3 text-right text-xs font-medium text-gray-900 uppercase tracking-wider">
                  {formatUF(totalesPorGrupo.reduce((sum, grupo) => sum + grupo.totalPrima, 0), 0)}
                </td>
                <td className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  -
                </td>
                <td className="px-6 py-3 text-right text-xs font-medium text-gray-900 uppercase tracking-wider">
                  {new Set(corredoresData.map(c => c.rut)).size}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}