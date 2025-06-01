'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSupabaseClient } from '@/lib/supabase/client';

interface PeriodContextType {
  selectedPeriodo: string;
  periodos: string[];
  setSelectedPeriodo: (periodo: string) => void;
  loading: boolean; // Add this line
}

const PeriodContext = createContext<PeriodContextType | undefined>(undefined);

export function PeriodProvider({ children }: { children: ReactNode }) {
  const [selectedPeriodo, setSelectedPeriodo] = useState<string>('');
  const [periodos, setPeriodos] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // Add this line
  const supabase = useSupabaseClient();
  
  useEffect(() => {
    async function loadPeriodos() {
      try {
        setLoading(true); // Add this line
        const { data, error } = await supabase
          .from('periodos')
          .select('periodo')
          .order('periodo', { ascending: false });
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          const periodosList = data.map(item => item.periodo);
          setPeriodos(periodosList);
          
          // Seleccionar el período más reciente por defecto
          if (!selectedPeriodo && periodosList.length > 0) {
            setSelectedPeriodo(periodosList[0]);
          }
        }
      } catch (err) {
        console.error('Error al cargar períodos:', err);
      } finally {
        setLoading(false); // Add this line
      }
    }
    
    loadPeriodos();
  }, [supabase, selectedPeriodo]);
  
  return (
    <PeriodContext.Provider value={{ selectedPeriodo, periodos, setSelectedPeriodo, loading }}> // Add loading here
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

// Asegúrate de que los períodos estén en formato YYYYMM
// Ejemplo: ['202301', '202212', '202211', ...]