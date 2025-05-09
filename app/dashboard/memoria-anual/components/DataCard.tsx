interface DataCardProps {
    title: string;
    clp: number;
    uf: number;
  }
  
  export default function DataCard({ title, clp, uf }: DataCardProps) {
    return (
      <div className="bg-white p-4 shadow rounded-lg mb-4">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <div className="flex justify-between items-center">
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