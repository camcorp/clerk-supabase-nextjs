'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSupabaseClient } from '@/lib/supabase/client';

interface PeriodContextType {
  selectedPeriodo: string;
  periodos: string[];
  setSelectedPeriodo: (periodo: string) => void;
  loading: boolean;
  error: string | null; // Add error to the interface
}

const PeriodContext = createContext<PeriodContextType | undefined>(undefined);

export function PeriodProvider({ children }: { children: ReactNode }) {
  const [selectedPeriodo, setSelectedPeriodo] = useState<string>('');
  const [periodos, setPeriodos] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null); // Add error state
  const supabase = useSupabaseClient();
  
  useEffect(() => {
    async function loadPeriodos() {
      try {
        setLoading(true);
        setError(null); // Reset error state
        // Change back to 'periodos' table as confirmed by user
        const { data, error } = await supabase
          .from('periodos')
          .select('periodo')
          .order('periodo', { ascending: false });
          
        if (error) {
          console.error('Error loading periods:', error);
          throw error;
        }
        
        console.log('Periods data loaded:', data);
        
        if (data && data.length > 0) {
          // Get unique periods
          const periodosList = [...new Set(data.map(item => item.periodo))];
          console.log('Available periods:', periodosList);
          setPeriodos(periodosList);
          
          // Select the most recent period by default
          if (!selectedPeriodo && periodosList.length > 0) {
            console.log('Setting default period:', periodosList[0]);
            setSelectedPeriodo(periodosList[0]);
          }
        } else {
          console.warn('No periods found in database');
        }
      } catch (err) {
        console.error('Error al cargar períodos:', err);
        setError('Failed to load periods');
      } finally {
        setLoading(false);
      }
    }
    
    loadPeriodos();
  }, [supabase]);
  
  return (
    <PeriodContext.Provider value={{ selectedPeriodo, periodos, setSelectedPeriodo, loading, error }}>
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