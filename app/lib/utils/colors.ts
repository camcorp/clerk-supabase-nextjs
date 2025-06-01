/**
 * Sistema de diseño centralizado - Paleta de colores
 */

// Colores primarios del sistema
export const colors = {
  // Colores principales
  primary: {
    deepBlue: '#0F3460', // Color principal de marca
    teal: '#1A7F8E',     // Acento secundario
    lavender: '#8D7AE6'  // Acento terciario
  },
  
  // Colores neutros
  neutral: {
    offWhite: '#F8F9FC', // Fondo
    lightGray: '#E9ECEF', // Fondos de tarjetas, bordes
    mediumGray: '#6C757D', // Texto secundario
    darkGray: '#343A40'  // Texto principal
  },
  
  // Colores de acento
  accent: {
    success: '#2ECC71', // Métricas positivas
    warning: '#F39C12', // Métricas neutras
    alert: '#E74C3C',   // Métricas negativas
    info: '#3498DB'     // Elementos informativos
  },
  
  // Colores específicos para secciones
  companias: {
    primary: '#1A7F8E',
    secondary: '#3EAEBB',
    light: '#E6F4F6'
  },
  ramos: {
    primary: '#0F3460',
    secondary: '#2E5894',
    light: '#E6EBF4'
  },
  corredores: {
    primary: '#6A4C93',
    secondary: '#8A6DB3',
    light: '#F0EBF7'
  },
  
  // Colores de estado
  status: {
    success: '#2ECC71',
    warning: '#F39C12',
    danger: '#E74C3C',
    info: '#3498DB'
  },
  
  // Colores de texto
  text: {
    primary: '#333333',
    secondary: '#898989',
    light: '#CCCCCC'
  }
};

/**
 * Obtiene el color para un dominio específico
 */
export function getDomainColor(domain: 'companias' | 'ramos' | 'corredores', variant: 'primary' | 'secondary' | 'light' = 'primary') {
  return colors[domain][variant];
}

/**
 * Obtiene el color para un estado
 */
export function getStatusColor(value: number | null | undefined): string {
  if (value === null || value === undefined) return colors.status.info;
  if (value > 0) return colors.status.success;
  if (value < 0) return colors.status.danger;
  return colors.status.info;
}

/**
 * Obtiene el color para una tendencia
 */
export function getTrendColor(value: number | null | undefined): string {
  if (value === null || value === undefined) return colors.status.info;
  return value >= 0 ? colors.status.success : colors.status.danger;
}

/**
 * Genera colores para gráficos
 */
export function getChartColors(count: number = 10): string[] {
  const baseColors = [
    '#3B82F6', // Azul
    '#10B981', // Verde
    '#F59E0B', // Amarillo
    '#EF4444', // Rojo
    '#8B5CF6', // Púrpura
    '#EC4899', // Rosa
    '#6366F1', // Índigo
    '#14B8A6', // Turquesa
    '#F97316', // Naranja
    '#06B6D4'  // Cian
  ];
  
  if (count <= baseColors.length) {
    return baseColors.slice(0, count);
  }
  
  const result = [...baseColors];
  for (let i = baseColors.length; i < count; i++) {
    const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);
    result.push(randomColor);
  }
  
  return result;
}