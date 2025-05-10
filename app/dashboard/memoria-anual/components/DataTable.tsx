import React from 'react';

// Define the column interface
interface Column {
  header: string;
  accessor: string;
  cell?: (value: any) => React.ReactNode;
}

interface DataTableProps {
  data: any[];
  columns: Column[];
  title?: string; // Añadir propiedad title como opcional
}

export default function DataTable({ data, columns, title }: DataTableProps) {
  return (
    <div className="overflow-x-auto">
      {title && (
        <h3 className="text-lg font-semibold text-[#0F3460] font-['Space_Grotesk'] mb-4">{title}</h3>
      )}
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column, colIndex) => (
                <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {column.cell 
                      ? column.cell(row[column.accessor]) 
                      : row[column.accessor]}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}