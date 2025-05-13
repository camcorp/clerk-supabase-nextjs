'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';

// Importar todas las funciones de formato
import { formatUF, formatCLP, formatPercent, formatPercentage, formatNumber } from '../utils/formatters';

interface AccordeonTableProps {
  data: any[];
  columns: {
    header: string;
    accessor: string;
    isNumeric?: boolean;
    formatter?: (value: any) => string;
    width?: string;
  }[];
  groupBy: string;
  subGroupBy?: string;
  detailPath?: string;
}

export default function AccordeonTable({
  data,
  columns,
  groupBy,
  subGroupBy,
  detailPath
}: AccordeonTableProps) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [openSubGroups, setOpenSubGroups] = useState<Record<string, boolean>>({});

  // Agrupar datos por el campo groupBy
  const groupedData = data.reduce((acc, item) => {
    const groupValue = item[groupBy];
    if (!acc[groupValue]) {
      acc[groupValue] = [];
    }
    acc[groupValue].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  // Calcular totales por grupo
  const groupTotals = Object.keys(groupedData).reduce((acc, group) => {
    const total = groupedData[group].reduce((sum: number, item: any) => sum + (parseFloat(item.total_uf) || 0), 0);
    acc[group] = total;
    return acc;
  }, {} as Record<string, number>);

  // Calcular total general
  const totalGeneral = Object.values(groupTotals).reduce((sum, total) => sum + total, 0);

  // Agrupar por subgrupo si existe
  const getSubGroupedData = (groupItems: any[]) => {
    if (!subGroupBy) return {};
    
    return groupItems.reduce((acc, item) => {
      const subGroupValue = item[subGroupBy];
      if (!acc[subGroupValue]) {
        acc[subGroupValue] = [];
      }
      acc[subGroupValue].push(item);
      return acc;
    }, {} as Record<string, any[]>);
  };

  // Calcular totales por subgrupo
  const getSubGroupTotals = (subGroupedData: Record<string, any[]>) => {
    return Object.keys(subGroupedData).reduce((acc, subGroup) => {
      const total = subGroupedData[subGroup].reduce((sum: number, item: any) => sum + (parseFloat(item.total_uf) || 0), 0);
      acc[subGroup] = total;
      return acc;
    }, {} as Record<string, number>);
  };

  // Calcular crecimiento
  const getCrecimiento = (item: any) => {
    const crecimiento = item.crecimiento || 0;
    return (
      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
        crecimiento > 0 
          ? 'bg-green-100 text-green-800' 
          : crecimiento < 0 
            ? 'bg-red-100 text-red-800' 
            : 'bg-gray-100 text-gray-800'
      }`}>
        {formatPercentage(crecimiento)}
        {crecimiento > 0 ? '↑' : crecimiento < 0 ? '↓' : ''}
      </div>
    );
  };

  // Calcular participación
  const getParticipacion = (valor: number, total: number) => {
    const participacion = total > 0 ? (valor / total) * 100 : 0;
    return (
      <span className="text-gray-600">
        {formatPercent(participacion, 0)}
      </span>
    );
  };

  const toggleGroup = (group: string) => {
    setOpenGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  const toggleSubGroup = (subGroup: string) => {
    setOpenSubGroups(prev => ({
      ...prev,
      [subGroup]: !prev[subGroup]
    }));
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                scope="col"
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                  column.isNumeric ? 'text-right' : ''
                } ${column.width || ''}`}
              >
                {column.header}
              </th>
            ))}
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Participación
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Crecimiento
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Detalle
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {Object.keys(groupedData).map(group => {
            const isGroupOpen = openGroups[group] || false;
            const groupItems = groupedData[group];
            const subGroupedData = getSubGroupedData(groupItems);
            const subGroupTotals = getSubGroupTotals(subGroupedData);
            const groupTotal = groupTotals[group];
            
            return (
              <React.Fragment key={group}>
                {/* Fila de grupo */}
                <tr 
                  className={`${isGroupOpen ? 'bg-blue-50' : 'hover:bg-gray-50'} cursor-pointer`}
                  onClick={() => toggleGroup(group)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center">
                    {isGroupOpen ? <ChevronDown className="h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
                    {group}
                  </td>
                  {columns.slice(1).map((column, index) => (
                    <td 
                      key={index} 
                      className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${column.isNumeric ? 'text-right' : ''}`}
                    >
                      {column.accessor === 'total_uf' ? formatUF(groupTotal) : ''}
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    {getParticipacion(groupTotal, totalGeneral)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    {getCrecimiento(groupItems[0])}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    {detailPath && (
                      <Link href={`${detailPath}/${encodeURIComponent(group)}`} className="text-blue-600 hover:text-blue-800">
                        <ExternalLink className="h-4 w-4 inline" />
                      </Link>
                    )}
                  </td>
                </tr>

                {/* Filas de subgrupo si el grupo está abierto */}
                {isGroupOpen && subGroupBy && Object.keys(subGroupedData).map(subGroup => {
                  const isSubGroupOpen = openSubGroups[subGroup] || false;
                  const subGroupItems = subGroupedData[subGroup];
                  const subGroupTotal = subGroupTotals[subGroup];
                  
                  return (
                    <React.Fragment key={`${group}-${subGroup}`}>
                      {/* Fila de subgrupo */}
                      <tr 
                        className={`${isSubGroupOpen ? 'bg-gray-100' : 'hover:bg-gray-50'} cursor-pointer`}
                        onClick={() => toggleSubGroup(subGroup)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 pl-10 flex items-center">
                          {isSubGroupOpen ? <ChevronDown className="h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
                          {subGroup}
                        </td>
                        {columns.slice(1).map((column, index) => (
                          <td 
                            key={index} 
                            className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${column.isNumeric ? 'text-right' : ''}`}
                          >
                            {column.accessor === 'total_uf' ? formatUF(subGroupTotal) : ''}
                          </td>
                        ))}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                          {getParticipacion(subGroupTotal, groupTotal)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                          {getCrecimiento(subGroupItems[0])}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                          {detailPath && (
                            <Link href={`${detailPath}/${encodeURIComponent(group)}/${encodeURIComponent(subGroup)}`} className="text-blue-600 hover:text-blue-800">
                              <ExternalLink className="h-4 w-4 inline" />
                            </Link>
                          )}
                        </td>
                      </tr>

                      {/* Filas de elementos si el subgrupo está abierto */}
                      {isSubGroupOpen && subGroupItems.map((item: any, itemIndex: number) => (
                        <tr key={`${group}-${subGroup}-${itemIndex}`} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 pl-16">
                            {item.nombre || item.ramo || item[columns[2].accessor]}
                          </td>
                          {columns.slice(1).map((column, colIndex) => (
                            <td 
                              key={colIndex} 
                              className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${column.isNumeric ? 'text-right' : ''}`}
                            >
                              {column.formatter 
                                ? column.formatter(item[column.accessor]) 
                                : item[column.accessor]}
                            </td>
                          ))}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                            {getParticipacion(parseFloat(item.primauf || item.total_uf) || 0, subGroupTotal)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                            {getCrecimiento(item)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                            {detailPath && (
                              <Link href={`${detailPath}/${encodeURIComponent(item.id || item[columns[0].accessor])}`} className="text-blue-600 hover:text-blue-800">
                                <ExternalLink className="h-4 w-4 inline" />
                              </Link>
                            )}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}

                {/* Si no hay subgrupos, mostrar los elementos directamente */}
                {isGroupOpen && !subGroupBy && groupItems.map((item: any, itemIndex: number) => (
                  <tr key={`${group}-${itemIndex}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 pl-10">
                      {item[columns[0].accessor]}
                    </td>
                    {columns.slice(1).map((column, colIndex) => (
                      <td 
                        key={colIndex} 
                        className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${column.isNumeric ? 'text-right' : ''}`}
                      >
                        {column.formatter 
                          ? column.formatter(item[column.accessor]) 
                          : item[column.accessor]}
                      </td>
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      {getParticipacion(parseFloat(item.total_uf) || 0, groupTotal)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      {getCrecimiento(item)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      {detailPath && (
                        <Link href={`${detailPath}/${encodeURIComponent(item.id || item[columns[0].accessor])}`} className="text-blue-600 hover:text-blue-800">
                          <ExternalLink className="h-4 w-4 inline" />
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

