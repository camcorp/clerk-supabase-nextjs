'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';

// Importar todas las funciones de formato
import { formatUF, formatCLP, formatPercent, formatPercentage, formatNumber } from '@/lib/utils/formatters';
import { getTrendColor } from '@/lib/utils/colors';

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
  idField?: string;
  formatGroupTotal?: (items: any[]) => string; // Añadida esta propiedad
}

export default function AccordeonTable({
  data,
  columns,
  groupBy,
  subGroupBy,
  detailPath,
  idField,
  formatGroupTotal
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
    const groupItems = groupedData[group];
    
    // Si hay una función personalizada para calcular el total, usarla
    if (formatGroupTotal) {
      // Convertir el resultado a número para operaciones posteriores
      const formattedTotal = formatGroupTotal(groupItems);
      // Extraer el valor numérico (asumiendo que formatGroupTotal devuelve un string formateado)
      const numericValue = parseFloat(formattedTotal.replace(/[^\d.-]/g, ''));
      acc[group] = isNaN(numericValue) ? 0 : numericValue;
    } else {
      // Cálculo estándar
      const total = groupItems.reduce((sum: number, item: any) => {
        // Intentar obtener el valor de diferentes campos posibles para la prima
        const value = parseFloat(item.total_uf) || parseFloat(item.primauf) || parseFloat(item.total_primauf) || 0;
        return sum + value;
      }, 0);
      acc[group] = total;
    }
    
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
      const subGroupItems = subGroupedData[subGroup];
      
      // Si hay una función personalizada para calcular el total, usarla
      if (formatGroupTotal) {
        // Convertir el resultado a número para operaciones posteriores
        const formattedTotal = formatGroupTotal(subGroupItems);
        // Extraer el valor numérico (asumiendo que formatGroupTotal devuelve un string formateado)
        const numericValue = parseFloat(formattedTotal.replace(/[^\d.-]/g, ''));
        acc[subGroup] = isNaN(numericValue) ? 0 : numericValue;
      } else {
        // Cálculo estándar
        const total = subGroupItems.reduce((sum: number, item: any) => {
          // Intentar obtener el valor de diferentes campos posibles para la prima
          const value = parseFloat(item.total_uf) || parseFloat(item.primauf) || parseFloat(item.total_primauf) || 0;
          return sum + value;
        }, 0);
        acc[subGroup] = total;
      }
      
      return acc;
    }, {} as Record<string, number>);
  };

  // Calcular crecimiento
  const getCrecimiento = (item: any) => {
    const crecimiento = item.crecimiento || 0;
    return (
      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
        crecimiento > 0 
          ? 'bg-green-100' 
          : crecimiento < 0 
            ? 'bg-red-100' 
            : 'bg-gray-100'
      }`} style={{ color: getTrendColor(crecimiento) }}>
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

  // Función renderDetailLink corregida - Definida fuera del JSX
  const renderDetailLink = (item: any) => {
    if (!detailPath) return null;
    
    // Construir la URL correctamente
    const itemId = item[idField || 'id'] || '';
    const encodedItemId = encodeURIComponent(itemId);
    const detailUrl = `${detailPath}/${encodedItemId}`;
    
    return (
      <Link 
        href={detailUrl}
        className="text-blue-600 hover:text-blue-900 text-sm"
      >
        Ver detalle
      </Link>
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
                      {column.accessor === 'total_uf' || column.accessor === 'primauf' || column.accessor === 'total_primauf' ? formatUF(groupTotal) : ''}
                    </td>
                  ))}
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
                            {column.accessor === 'total_uf' || column.accessor === 'primauf' || column.accessor === 'total_primauf' ? formatUF(subGroupTotal) : ''}
                          </td>
                        ))}
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
                            {item.nombre || item.ramo || item[columns[0].accessor]}
                          </td>
                          {columns.slice(1).map((column, colIndex) => (
                            <td 
                              key={colIndex} 
                              className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${column.isNumeric ? 'text-right' : ''}`}
                            >
                              {column.formatter 
                                ? column.formatter(item[column.accessor])
                                : column.isNumeric 
                                  ? formatNumber(item[column.accessor])
                                  : item[column.accessor]}
                            </td>
                          ))}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                            {renderDetailLink(item)}
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
                      {renderDetailLink(item)}
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

