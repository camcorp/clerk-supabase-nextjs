'use client';

import { usePeriod } from '../context/PeriodContext';

export default function PeriodSelector() {
  const { selectedPeriodo, setSelectedPeriodo, periodos, loading } = usePeriod();

  if (loading) {
    return <div className="animate-pulse w-40 h-10 bg-gray-200 rounded"></div>;
  }

  return (
    <div className="flex items-center">
      <label htmlFor="periodo" className="mr-2 text-sm font-medium text-[#6C757D]">
        Periodo:
      </label>
      <select
        id="periodo"
        value={selectedPeriodo}
        onChange={(e) => setSelectedPeriodo(e.target.value)}
        className="block w-40 pl-3 pr-10 py-2 text-base border-[#E9ECEF] focus:outline-none focus:ring-[#1A7F8E] focus:border-[#1A7F8E] sm:text-sm rounded-md"
      >
        {periodos.map((periodo) => (
          <option key={periodo} value={periodo}>
            {periodo}
          </option>
        ))}
      </select>
    </div>
  );
}