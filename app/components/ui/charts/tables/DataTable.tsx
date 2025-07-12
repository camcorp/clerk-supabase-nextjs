'use client';

import React, { useState, useMemo } from 'react';
// Update the import to use the correct path for Heroicons v2
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

import { formatNumber } from '@/lib/utils/formatters';

interface Column<T> {
  header: string;
  accessor: keyof T;
  cell?: (value: any, row: T) => React.ReactNode;
  isSortable?: boolean;
  isNumeric?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  selectable?: boolean;
  showTotals?: boolean;
  emptyMessage?: string;
  title?: string;  // Añadir esta propiedad
}

export default function DataTable<T extends Record<string, any>>({
  columns,
  data,
  selectable = false,
  showTotals = false,
  emptyMessage = 'No hay datos disponibles',
  title  // Añadir esta propiedad aquí
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T | null;
    direction: 'asc' | 'desc';
  }>({
    key: null,
    direction: 'asc'
  });
  
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  
  // Función para manejar el ordenamiento
  const handleSort = (key: keyof T) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === 'asc'
          ? 'desc'
          : 'asc'
    });
  };
  
  // Datos ordenados
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;
    
    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key!];
      const bValue = b[sortConfig.key!];
      
      // Manejar valores numéricos y strings
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc'
          ? aValue - bValue
          : bValue - aValue;
      }
      
      // Convertir a string para comparación
      const aString = String(aValue).toLowerCase();
      const bString = String(bValue).toLowerCase();
      
      if (aString < bString) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aString > bString) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);
  
  // Manejar selección de filas
  const toggleRowSelection = (index: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);
  };
  
  // Manejar selección de todas las filas
  const toggleSelectAll = () => {
    if (selectedRows.size === data.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(data.map((_, index) => index)));
    }
  };
  
  // Calcular totales para columnas numéricas
  const totals = useMemo(() => {
    if (!showTotals) return null;
    
    const result: Record<string, number> = {};
    
    columns.forEach(column => {
      if (column.isNumeric) {
        const total = data.reduce((sum, row) => {
          const value = row[column.accessor];
          return sum + (typeof value === 'number' ? value : 0);
        }, 0);
        result[column.accessor as string] = total;
      }
    });
    
    return result;
  }, [data, columns, showTotals]);
  
  // Formatear números
  const formatNumberValue = (value: number) => {
    return formatNumber(value);
  };
  
  if (data.length === 0) {
    return (
      <div className="bg-white shadow overflow-hidden rounded-lg p-6 text-center text-gray-500">
        {emptyMessage}
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto">
      {title && (
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        </div>
      )}
      <table className="min-w-full divide-y divide-gray-200 font-inter">
        <thead className="bg-gray-50">
          <tr>
            {selectable && (
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  checked={selectedRows.size === data.length && data.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
            )}
            {columns.map((column, index) => (
              <th
                key={index}
                scope="col"
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                  column.isSortable ? 'cursor-pointer select-none' : ''
                } ${column.isNumeric ? 'text-right' : ''}`}
                onClick={() => column.isSortable && handleSort(column.accessor)}
              >
                <div className="flex items-center justify-between">
                  <span>{column.header}</span>
                  {column.isSortable && (
                    <span className="ml-2">
                      {sortConfig.key === column.accessor ? (
                        sortConfig.direction === 'asc' ? (
                          <ChevronUpIcon className="h-4 w-4" />
                        ) : (
                          <ChevronDownIcon className="h-4 w-4" />
                        )
                      ) : (
                        <div className="h-4 w-4" />
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedData.map((row, rowIndex) => (
            <tr 
              key={rowIndex}
              className={selectedRows.has(rowIndex) ? 'bg-blue-50' : ''}
            >
              {selectable && (
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    checked={selectedRows.has(rowIndex)}
                    onChange={() => toggleRowSelection(rowIndex)}
                  />
                </td>
              )}
              {columns.map((column, colIndex) => (
                <td 
                  key={colIndex} 
                  className={`px-6 py-4 whitespace-nowrap text-sm ${
                    column.isNumeric ? 'text-right' : ''
                  }`}
                >
                  {column.cell 
                    ? column.cell(row[column.accessor], row)
                    : column.isNumeric && typeof row[column.accessor] === 'number'
                      ? formatNumber(row[column.accessor] as number)
                      : String(row[column.accessor] || '')}
                </td>
              ))}
            </tr>
          ))}
          
          {/* Fila de totales */}
          {showTotals && totals && (
            <tr className="bg-gray-50 font-medium">
              {selectable && <td className="px-6 py-4 whitespace-nowrap"></td>}
              {columns.map((column, colIndex) => (
                <td 
                  key={colIndex} 
                  className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                    column.isNumeric ? 'text-right' : ''
                  }`}
                >
                  {column.isNumeric && totals[column.accessor as string] !== undefined
                    ? formatNumber(totals[column.accessor as string])
                    : colIndex === 0 ? 'Total' : ''}
                </td>
              ))}
            </tr>
          )}
        </tbody>
      </table>
      
      {/* Información de filas seleccionadas */}
      {selectable && selectedRows.size > 0 && (
        <div className="bg-blue-50 p-2 text-sm text-blue-700 rounded-b-lg">
          {selectedRows.size} {selectedRows.size === 1 ? 'fila seleccionada' : 'filas seleccionadas'}
        </div>
      )}
    </div>
  );
}