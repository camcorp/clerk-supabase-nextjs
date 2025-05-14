/**
 * Colores centralizados para el dashboard
 * Estos colores se utilizan en todos los componentes para mantener consistencia visual
 */

export const DASHBOARD_COLORS = {
  // Colores principales por sección
  COMPANIAS: {
    primary: '#FF647C', // 255,100,124
    light: '#FFB3C1',
    dark: '#CC5063',
    background: '#FFF5F7'
  },
  RAMOS: {
    primary: '#429071', // 66,144,113
    light: '#A3D5C2',
    dark: '#35735A',
    background: '#F0F9F5'
  },
  CORREDORES: {
    primary: '#768CF3', // 118,140,243
    light: '#B9C4F9',
    dark: '#5F70C2',
    background: '#F5F7FF'
  },
  
  // Colores base
  BASE: {
    black: '#333333', // hex 333
    gray: '#898989', // 137,137,137
    lightGray: '#E5E7EB',
    white: '#FFFFFF'
  },
  
  // Colores para estados
  STATUS: {
    success: '#4ADE80',
    warning: '#FBBF24',
    error: '#F87171',
    info: '#60A5FA'
  },
  
  // Colores para gráficos
  CHART: {
    blue: '#3B82F6',
    green: '#10B981',
    red: '#EF4444',
    yellow: '#F59E0B',
    purple: '#8B5CF6',
    pink: '#EC4899',
    indigo: '#6366F1',
    teal: '#14B8A6',
    orange: '#F97316',
    cyan: '#06B6D4'
  }
};

// Función para obtener un color por tipo
export function getColorByType(type: 'companias' | 'ramos' | 'corredores') {
  switch (type) {
    case 'companias':
      return DASHBOARD_COLORS.COMPANIAS.primary;
    case 'ramos':
      return DASHBOARD_COLORS.RAMOS.primary;
    case 'corredores':
      return DASHBOARD_COLORS.CORREDORES.primary;
    default:
      return DASHBOARD_COLORS.BASE.black;
  }
}

// Función para obtener un array de colores para gráficos
export function getChartColors(count: number) {
  const colors = Object.values(DASHBOARD_COLORS.CHART);
  const result = [];
  
  for (let i = 0; i < count; i++) {
    result.push(colors[i % colors.length]);
  }
  
  return result;
}