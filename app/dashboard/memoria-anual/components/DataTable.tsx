interface DataTableProps {
    columns: string[];
    data: Record<string, any>[];
  }
  
  export default function DataTable({ columns, data }: DataTableProps) {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col} className="px-4 py-2 text-left border-b">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((row, index) => (
                <tr key={index} className="border-b">
                  {columns.map((col) => (
                    <td key={col} className="px-4 py-2">{row[col]}</td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="text-center py-4">No hay datos disponibles.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }