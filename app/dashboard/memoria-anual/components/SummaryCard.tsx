interface SummaryCardProps {
    period: string;
    clp: number;
    uf: number;
  }
  
  export default function SummaryCard({ period, clp, uf }: SummaryCardProps) {
    return (
      <div className="bg-blue-100 p-4 rounded-lg mb-4">
        <h3 className="text-lg font-semibold mb-2">Resumen del período {period}</h3>
        <div className="flex justify-between">
          <div>
            <p className="text-gray-600">Total CLP:</p>
            <p className="text-xl font-bold">{clp.toLocaleString("es-CL")}</p>
          </div>
          <div>
            <p className="text-gray-600">Total UF:</p>
            <p className="text-xl font-bold">{uf.toFixed(2)}</p>
          </div>
        </div>
      </div>
    );
  }