'use client';

import { useState } from 'react';
import { usePeriod } from './context/PeriodContext';
import CompaniasView from './views/Companias';
import RamosView from './views/Ramos';
import CorredoresView from './views/Corredores';
import PortadaView from './views/Portada'; // Importar la nueva vista
import PeriodSelector from '@/app/components/ui/charts/PeriodSelector';

// Definir las secciones disponibles
type Section = 'portada' | 'companias' | 'ramos' | 'corredores';

export default function MemoriaAnual() {
  const [activeSection, setActiveSection] = useState<Section>('portada'); // Cambiar a 'portada' como predeterminada
  const { selectedPeriodo } = usePeriod();

  // Renderizar la sección activa
  const renderSection = () => {
    switch (activeSection) {
      case 'portada':
        return <PortadaView selectedPeriodo={selectedPeriodo} />;
      case 'companias':
        return <CompaniasView />;
      case 'ramos':
        return <RamosView />;
      case 'corredores':
        return <CorredoresView />;
      default:
        return <PortadaView selectedPeriodo={selectedPeriodo} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#0F3460]">Memoria Anual del Mercado Asegurador</h1>
        <PeriodSelector />
      </div>

      {/* Navegación entre secciones */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveSection('portada')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeSection === 'portada'
                ? 'border-[#1A7F8E] text-[#1A7F8E]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Portada
          </button>
          <button
            onClick={() => setActiveSection('companias')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeSection === 'companias'
                ? 'border-[#1A7F8E] text-[#1A7F8E]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Compañías
          </button>
          <button
            onClick={() => setActiveSection('ramos')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeSection === 'ramos'
                ? 'border-[#1A7F8E] text-[#1A7F8E]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Ramos
          </button>
          <button
            onClick={() => setActiveSection('corredores')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeSection === 'corredores'
                ? 'border-[#1A7F8E] text-[#1A7F8E]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Corredores
          </button>
        </nav>
      </div>

      {/* Mostrar período seleccionado */}
      <div className="bg-[#F8F9FC] p-4 rounded-lg">
        <p className="text-[#6C757D]">
          Período seleccionado: <span className="font-semibold text-[#0F3460]">{selectedPeriodo}</span>
        </p>
      </div>

      {/* Contenido de la sección activa */}
      <div>{renderSection()}</div>
    </div>
  );
}