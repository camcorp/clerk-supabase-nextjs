'use client';

import GraficoPrimas from '@/components/GraficoPrimas';

export default function DashboardPage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Memoria Anual del Mercado de Corredores</h1>
      <p className="text-gray-700">Explora las tendencias del mercado de los últimos 13 años.</p>

      <div className="mt-8">
        <GraficoPrimas />
      </div>
    </main>
  );
}