'use client';

import { useState, useEffect, Suspense } from 'react';
import { usePeriod } from '@/memoria-anual/context/PeriodContext';
import CompaniasView from '@/memoria-anual/views/Companias';
import RamosView from '@/memoria-anual/views/Ramos';
import CorredoresView from '@/memoria-anual/views/Corredores';
import PortadaView from '@/memoria-anual/views/Portada';
import PeriodSelector from '@/components/ui/charts/PeriodSelector';
import { useSearchParams } from 'next/navigation';

// Definir las secciones disponibles
type Section = 'portada' | 'companias' | 'ramos' | 'corredores';

function MemoriaAnualContent() {
  const searchParams = useSearchParams();
  const [activeSection, setActiveSection] = useState<Section>(
    (searchParams.get('section') as Section) || 'portada'
  );
  const { selectedPeriodo } = usePeriod();

  // Update activeSection when URL changes
  useEffect(() => {
    const section = searchParams.get('section') as Section;
    if (section && ['portada', 'companias', 'ramos', 'corredores'].includes(section)) {
      setActiveSection(section);
    }
  }, [searchParams]);

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
      {/* Header con selector de período */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#0F3460]">Memoria Anual</h1>
        <PeriodSelector />
      </div>

      {/* Navigation */}
      <div className="flex space-x-4 border-b">
        {[
          { key: 'portada', label: 'Portada' },
          { key: 'companias', label: 'Compañías' },
          { key: 'ramos', label: 'Ramos' },
          { key: 'corredores', label: 'Corredores' }
        ].map((section) => (
          <button
            key={section.key}
            onClick={() => setActiveSection(section.key as Section)}
            className={`px-4 py-2 font-medium transition-colors ${
              activeSection === section.key
                ? 'text-[#0F3460] border-b-2 border-[#0F3460]'
                : 'text-gray-600 hover:text-[#0F3460]'
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="mt-6">
        {renderSection()}
      </div>
    </div>
  );
}

export default function MemoriaAnualPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MemoriaAnualContent />
    </Suspense>
  );
}