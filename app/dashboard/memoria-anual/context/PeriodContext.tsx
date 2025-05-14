'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useSupabaseClient } from '@/lib/supabase-client';
import { useQuery } from '@tanstack/react-query';

interface PeriodContextType {
  selectedPeriodo: string;
  setSelectedPeriodo: (periodo: string) => void;
  periodos: string[];
  loading: boolean;
}

const PeriodContext = createContext<PeriodContextType | undefined>(undefined);

export function PeriodProvider({ children }: { children: ReactNode }) {
  const [selectedPeriodo, setSelectedPeriodo] = useState<string>('');
  const supabase = useSupabaseClient();

  // Usar React Query para manejar la caché automáticamente
  const { data: periodos = [], isLoading } = useQuery({
    queryKey: ['periodos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('periodos')
        .select('periodo')
        .order('periodo', { ascending: false });
      
      if (error) {
        console.error('Error al cargar periodos:', error);
        return [] as string[];
      }
      
      if (!data || data.length === 0) {
        return [] as string[];
      }
      
      // Obtener valores únicos
      return Array.from(
        new Map(data.map(item => [item.periodo, item.periodo])).values()
      ) as string[];
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 horas
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 días (reemplaza a cacheTime)
  });

  // Usar useEffect para establecer el período predeterminado
  useEffect(() => {
    if (periodos.length > 0 && !selectedPeriodo) {
      setSelectedPeriodo(periodos[0]);
    }
  }, [periodos, selectedPeriodo]);

  return (
    <PeriodContext.Provider value={{ 
      selectedPeriodo, 
      setSelectedPeriodo, 
      periodos: periodos as string[], 
      loading: isLoading 
    }}>
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