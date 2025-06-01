'use client';

// Exportar todos los hooks reestructurados
export * from './useMarketTotal';
export * from './useCompanias';
export * from './useRamos';
// Exportar explícitamente desde useCorredores para evitar ambigüedad
export { useCorredores } from './useCorredores';
export type { Corredor } from './useCorredores';

// Mantener la exportación del hook original para compatibilidad
export { useMarketData } from './useMarketData';
export type { PeriodSummary, Compania } from './useMarketData';

// Exportar otros hooks útiles
export * from './useSupabaseCache';