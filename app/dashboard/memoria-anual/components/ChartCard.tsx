import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ChartCardProps {
  title: string;
  data: { periodo: string; clp: number; uf: number }[];
}

export default function ChartCard({ title, data }: ChartCardProps) {
  return (
    <div className="bg-white p-4 shadow rounded-lg mb-4">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid stroke="#e0e0e0" />
          <XAxis dataKey="periodo" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="clp" stroke="#4f46e5" />
          <Line type="monotone" dataKey="uf" stroke="#ef4444" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}