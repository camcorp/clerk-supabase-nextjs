'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useSupabaseClient } from '@/lib/supabase-client';

interface PeriodContextType {
  selectedPeriodo: string;
  setSelectedPeriodo: (periodo: string) => void;
  periodos: string[];
  loading: boolean;
}

const PeriodContext = createContext<PeriodContextType | undefined>(undefined);

export function PeriodProvider({ children }: { children: ReactNode }) {
  const [selectedPeriodo, setSelectedPeriodo] = useState<string>('');
  const [periodos, setPeriodos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = useSupabaseClient();

  useEffect(() => {
    async function loadPeriodos() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('periodos')
          .select('periodo')
          .order('periodo', { ascending: false });
        
        if (error) throw error;
        
        // Obtener valores únicos
        const uniquePeriods = Array.from(
          new Map(data.map(item => [item.periodo, item.periodo])).values()
        );
        setPeriodos(uniquePeriods);
        
        // Establecer el período más reciente como predeterminado
        if (uniquePeriods.length > 0 && !selectedPeriodo) {
          setSelectedPeriodo(uniquePeriods[0]);
        }
      } catch (err) {
        console.error('Error al cargar periodos:', err);
      } finally {
        setLoading(false);
      }
    }
    
    loadPeriodos();
  }, [supabase, selectedPeriodo]); // Añadimos selectedPeriodo como dependencia

  return (
    <PeriodContext.Provider value={{ selectedPeriodo, setSelectedPeriodo, periodos, loading }}>
      {children}
    </PeriodContext.Provider>
  );
}

export function usePeriod() {
  const context = useContext(PeriodContext);
  if (context === undefined) {
    throw new Error('usePeriod debe ser usado dentro de un PeriodProvider');
  }
  return context;
}