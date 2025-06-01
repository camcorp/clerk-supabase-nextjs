'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';

// Importar todas las funciones de formato
import { formatUF, formatCLP, formatPercent, formatPercentage, formatNumber } from '@/lib/utils/formatters';

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

  // ... existing code ...

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
          {/* ... existing code ... */}
        </tbody>
      </table>
    </div>
  );
}