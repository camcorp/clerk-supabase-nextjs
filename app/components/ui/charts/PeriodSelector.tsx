'use client';

// Cambiar la importación:
import { usePeriod } from '@/memoria-anual/context/PeriodContext';
import { useState, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

export default function PeriodSelector() {
  const { selectedPeriodo, setSelectedPeriodo, periodos, loading } = usePeriod();
  const [isOpen, setIsOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Cierra el dropdown cuando se hace clic fuera del componente
  useEffect(() => {
    const handleClickOutside = (event) => {
      const selector = document.getElementById('period-selector');
      if (selector && !selector.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="relative w-44 h-10">
        <div className="absolute inset-0 bg-white/30 backdrop-blur-xl rounded-xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <div 
      id="period-selector"
      className="relative font-sans"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <label 
        htmlFor="periodo" 
        className="block mb-1.5 text-xs font-medium text-[#8A8A8E] transition-opacity duration-200"
      >
        Periodo
      </label>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`
          relative flex items-center justify-between
          w-44 px-4 py-2.5 cursor-pointer
          bg-white/80 backdrop-blur-xl
          border border-[#E5E5EA] dark:border-[#2C2C2E]
          rounded-xl shadow-sm
          transition-all duration-300 ease-out
          ${hovered ? 'bg-white/90 shadow-md translate-y-[-1px]' : ''}
          ${isOpen ? 'ring-2 ring-[#0071E3]/20 shadow-md' : ''}
        `}
      >
        <span className="text-sm font-medium text-[#1D1D1F]">
          {selectedPeriodo}
        </span>
        <ChevronDownIcon 
          className={`w-4 h-4 text-[#8A8A8E] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
        
        {/* Dropdown menu */}
        {isOpen && (
          <div className="
            absolute top-full left-0 mt-1 w-full z-10
            bg-white/90 backdrop-blur-xl
            border border-[#E5E5EA] dark:border-[#2C2C2E]
            rounded-xl shadow-lg
            overflow-hidden
            transition-all duration-200 ease-out
            animate-in fade-in-50 slide-in-from-top-2
          ">
            <div className="max-h-60 overflow-y-auto py-1">
              {periodos.map((periodo) => (
                <div
                  key={periodo}
                  onClick={() => {
                    setSelectedPeriodo(periodo);
                    setIsOpen(false);
                  }}
                  className={`
                    px-4 py-2.5 text-sm cursor-pointer
                    transition-colors duration-150 ease-in-out
                    ${selectedPeriodo === periodo ? 'bg-[#0071E3]/10 text-[#0071E3] font-medium' : 'text-[#1D1D1F] hover:bg-[#F5F5F7]'}
                  `}
                >
                  {periodo}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Hidden native select for accessibility */}
      <select
        id="periodo"
        value={selectedPeriodo}
        onChange={(e) => setSelectedPeriodo(e.target.value)}
        className="sr-only"
        aria-hidden="true"
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