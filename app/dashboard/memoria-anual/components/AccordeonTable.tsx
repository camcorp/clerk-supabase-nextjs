'use client';

import React, { useState, useMemo } from 'react';
import { ChevronDownIcon, ChevronRightIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { formatUF, formatNumber } from '../utils/formatters';

interface Column<T> {
  header: string;
  accessor: keyof T;
  cell?: (value: any, row: T) => React.ReactNode;
  isSortable?: boolean;
  isNumeric?: boolean;
}

interface AccordeonTableProps<T> {
  data: T[];
  columns: Column<T>[];
  groupBy: keyof T;
  subGroupBy?: keyof T;
  title?: string;
  emptyMessage?: string;
  showTotal?: boolean;
  totalLabel?: string;
  onRowDetail?: (item: T) => void;
}

export default function AccordeonTable<T extends Record<string, any>>({
  data,
  columns,
  groupBy,
  subGroupBy,
  title,
  emptyMessage = 'No hay datos disponibles',
  showTotal = false,
  totalLabel = "Total",
  onRowDetail
}: AccordeonTableProps<T>) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [expandedSubGroups, setExpandedSubGroups] = useState<Set<string>>(new Set());
  
  // Agrupar datos
  const groupedData = useMemo(() => {
    const groups: Record<string, T[]> = {};
    
    data.forEach(item => {
      const groupValue = String(item[groupBy]);
      if (!groups[groupValue]) {
        groups[groupValue] = [];
      }
      groups[groupValue].push(item);
    });
    
    return groups;
  }, [data, groupBy]);
  
  // Agrupar datos por subgrupo si es necesario
  const getSubGroupedData = (groupItems: T[]) => {
    if (!subGroupBy) return {};
    
    const subGroups: Record<string, T[]> = {};
    
    groupItems.forEach(item => {
      const subGroupValue = String(item[subGroupBy]);
      if (!subGroups[subGroupValue]) {
        subGroups[subGroupValue] = [];
      }
      subGroups[subGroupValue].push(item);
    });
    
    return subGroups;
  };
  
  // Manejar expansión de grupos
  const toggleGroup = (group: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(group)) {
      newExpanded.delete(group);
    } else {
      newExpanded.add(group);
    }
    setExpandedGroups(newExpanded);
  };
  
  // Manejar expansión de subgrupos
  const toggleSubGroup = (subGroup: string) => {
    const newExpanded = new Set(expandedSubGroups);
    if (newExpanded.has(subGroup)) {
      newExpanded.delete(subGroup);
    } else {
      newExpanded.add(subGroup);
    }
    setExpandedSubGroups(newExpanded);
  };
  
  // Calcular totales para un grupo
  const calculateGroupTotals = (items: T[]) => {
    const totals: Record<string, number> = {};
    
    columns.forEach(column => {
      if (column.isNumeric) {
        const total = items.reduce((sum, row) => {
          const value = row[column.accessor];
          return sum + (typeof value === 'number' ? value : 0);
        }, 0);
        totals[column.accessor as string] = total;
      }
    });
    
    return totals;
  };
  
  // Formatear valores numéricos
  const formatValue = (value: any, column: Column<T>, row?: T) => {
    if (column.cell && row) {
      return column.cell(value, row);
    }
    
    if (column.isNumeric && typeof value === 'number') {
      // Usar la función formatUF para valores numéricos
      return formatUF(value, 2);
    }
    
    return value;
  };
  
  // Calcular el total general para las columnas numéricas
  const calculateGrandTotal = () => {
    const totals: Record<string, number> = {};
    
    // Inicializar totales para columnas numéricas
    columns.forEach(column => {
      if (column.isNumeric) {
        totals[column.accessor as string] = 0;
      }
    });
    
    // Sumar todos los valores
    data.forEach(item => {
      columns.forEach(column => {
        if (column.isNumeric) {
          totals[column.accessor as string] += Number(item[column.accessor]) || 0;
        }
      });
    });
    
    return totals;
  };
  
  const grandTotals = calculateGrandTotal();
  
  if (data.length === 0) {
    return (
      <div className="bg-white shadow overflow-hidden rounded-lg p-6 text-center text-gray-500">
        {emptyMessage}
      </div>
    );
  }
  
  return (
    <div className="bg-white shadow overflow-hidden rounded-lg">
      {title && (
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {/* Columna para expansión */}
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10"></th>
              
              {columns.map((column, index) => (
                <th
                  key={index}
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.isNumeric ? 'text-right' : ''
                  }`}
                >
                  {column.header}
                </th>
              ))}
              
              {/* Columna para botón de detalle si se proporciona onRowDetail */}
              {onRowDetail && (
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                  Detalle
                </th>
              )}
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-200">
            {Object.entries(groupedData).map(([group, groupItems], groupIndex) => {
              const isExpanded = expandedGroups.has(group);
              const groupTotals = calculateGroupTotals(groupItems);
              const subGroupedData = getSubGroupedData(groupItems);
              
              return (
                <React.Fragment key={groupIndex}>
                  {/* Fila de grupo */}
                  <tr 
                    className="bg-gray-50 cursor-pointer hover:bg-gray-100"
                    onClick={() => toggleGroup(group)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isExpanded ? (
                        <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronRightIcon className="h-5 w-5 text-gray-500" />
                      )}
                    </td>
                    
                    {columns.map((column, colIndex) => (
                      <td 
                        key={colIndex}
                        className={`px-6 py-4 whitespace-nowrap font-medium text-gray-900 ${
                          column.isNumeric ? 'text-right' : ''
                        }`}
                      >
                        {column.accessor === groupBy ? (
                          group
                        ) : column.isNumeric ? (
                          formatValue(groupTotals[column.accessor as string], column)
                        ) : (
                          ''
                        )}
                      </td>
                    ))}
                    
                    {/* Celda vacía para mantener la estructura si hay botón de detalle */}
                    {onRowDetail && <td className="px-6 py-4 whitespace-nowrap"></td>}
                  </tr>
                  
                  {/* Filas de subgrupo si está expandido */}
                  {isExpanded && subGroupBy && (
                    Object.entries(subGroupedData).map(([subGroup, subGroupItems], subGroupIndex) => {
                      const isSubExpanded = expandedSubGroups.has(`${group}-${subGroup}`);
                      const subGroupTotals = calculateGroupTotals(subGroupItems);
                      
                      return (
                        <React.Fragment key={`${groupIndex}-${subGroupIndex}`}>
                          {/* Fila de subgrupo */}
                          <tr 
                            className="bg-gray-100 cursor-pointer hover:bg-gray-200"
                            onClick={() => toggleSubGroup(`${group}-${subGroup}`)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap pl-10">
                              {isSubExpanded ? (
                                <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                              ) : (
                                <ChevronRightIcon className="h-4 w-4 text-gray-500" />
                              )}
                            </td>
                            
                            {columns.map((column, colIndex) => (
                              <td 
                                key={colIndex}
                                className={`px-6 py-4 whitespace-nowrap text-sm ${
                                  column.isNumeric ? 'text-right' : ''
                                }`}
                              >
                                {column.accessor === subGroupBy ? (
                                  subGroup
                                ) : column.isNumeric ? (
                                  formatValue(subGroupTotals[column.accessor as string], column)
                                ) : (
                                  ''
                                )}
                              </td>
                            ))}
                            
                            {/* Celda vacía para mantener la estructura si hay botón de detalle */}
                            {onRowDetail && <td className="px-6 py-4 whitespace-nowrap"></td>}
                          </tr>
                          
                          {/* Filas de detalle si el subgrupo está expandido */}
                          {isSubExpanded && subGroupItems.map((item, itemIndex) => (
                            <tr 
                              key={`${groupIndex}-${subGroupIndex}-${itemIndex}`}
                              className="hover:bg-gray-50"
                            >
                              <td className="px-6 py-4 whitespace-nowrap pl-16"></td>
                              
                              {columns.map((column, colIndex) => (
                                <td 
                                  key={colIndex}
                                  className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${
                                    column.isNumeric ? 'text-right' : ''
                                  }`}
                                >
                                  {formatValue(item[column.accessor], column, item)}
                                </td>
                              ))}
                              
                              {/* Botón de detalle para cada fila */}
                              {onRowDetail && (
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onRowDetail(item);
                                    }}
                                    className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 p-1 rounded"
                                  >
                                    <InformationCircleIcon className="h-5 w-5" />
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))}
                        </React.Fragment>
                      );
                    })
                  )}
                  
                  {/* Filas de detalle si no hay subgrupo o si el grupo está expandido */}
                  {isExpanded && !subGroupBy && groupItems.map((item, itemIndex) => (
                    <tr 
                      key={`${groupIndex}-${itemIndex}`}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap pl-10"></td>
                      
                      {columns.map((column, colIndex) => (
                        <td 
                          key={colIndex}
                          className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${
                            column.isNumeric ? 'text-right' : ''
                          }`}
                        >
                          {formatValue(item[column.accessor], column, item)}
                        </td>
                      ))}
                      
                      {/* Botón de detalle para cada fila */}
                      {onRowDetail && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRowDetail(item);
                            }}
                            className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 p-1 rounded"
                          >
                            <InformationCircleIcon className="h-5 w-5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
            
            {/* Total general */}
            {showTotal && (
              <tr className="bg-gray-50 font-semibold">
                <td colSpan={onRowDetail ? columns.length + 2 : columns.length + 1} className="px-6 py-4 text-sm text-gray-900">
                  <div className="flex justify-between items-center">
                    <span>{totalLabel}</span>
                    <div className="flex space-x-8">
                      {columns.map((column, colIndex) => (
                        column.isNumeric && (
                          <span key={colIndex} className="text-right">
                            {column.cell 
                              ? column.cell(grandTotals[column.accessor as string], {} as T) 
                              : formatValue(grandTotals[column.accessor as string], column)}
                          </span>
                        )
                      ))}
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

