import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Make the component more flexible with generic data type
interface ChartCardProps<T> {
  title: string;
  data: T[];
  xKey: string;  // Key to use for X axis (as string)
  yKey: string;  // Key to use for Y axis (as string)
  color?: string;
}

export default function ChartCard<T>({ 
  title, 
  data, 
  xKey = 'nombre', 
  yKey = 'primauf',
  color = '#1A7F8E'
}: ChartCardProps<T>) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E9ECEF] overflow-hidden transition-all duration-300 hover:shadow-md hover:translate-y-[-4px]">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-[#0F3460] font-['Space_Grotesk'] mb-4">{title}</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey={xKey} tick={{fontSize: 10}} />
              <YAxis />
              <Tooltip />
              <Bar dataKey={yKey} fill={color} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}