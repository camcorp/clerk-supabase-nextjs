/**
 * Sistema de diseño centralizado - Paleta de colores y tipografía
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

// Tipografía del sistema
export const typography = {
  // Familias de fuentes
  fontFamily: {
    primary: "'Inter', sans-serif",
    secondary: "'Space Grotesk', sans-serif"
  },
  
  // Tamaños de fuente
  fontSize: {
    h1: '2.5rem',    // 40px - Títulos principales
    h2: '2rem',      // 32px - Títulos de sección
    h3: '1.5rem',    // 24px - Títulos de tarjetas
    bodyLarge: '1.125rem', // 18px - Contenido importante
    body: '1rem',    // 16px - Contenido regular
    small: '0.875rem', // 14px - Información secundaria
    micro: '0.75rem' // 12px - Etiquetas, subtítulos
  },
  
  // Pesos de fuente
  fontWeight: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  }
};

// Configuración del tema global para la aplicación
export const theme = {
  colors,
  fonts: {
    primary: 'var(--font-inter)',
    secondary: 'var(--font-space-grotesk)',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
  },
  borderRadius: {
    sm: '0.125rem',
    md: '0.25rem',
    lg: '0.5rem',
    xl: '1rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    xxl: '1536px',
  }
};

// Funciones de utilidad para acceder a los colores

export function getDomainColor(domain: 'companias' | 'ramos' | 'corredores', variant: 'primary' | 'secondary' | 'light' = 'primary') {
  return colors[domain][variant];
}

export function getStatusColor(status: 'success' | 'warning' | 'danger' | 'info') {
  return colors.status[status];
}

export function getTextColor(variant: 'primary' | 'secondary' | 'light' = 'primary') {
  return colors.text[variant];
}

export function getTrendColor(trend: number | null | undefined): string {
  if (trend === null || trend === undefined) return colors.text.secondary;
  return trend >= 0 ? colors.status.success : colors.status.danger;
}

export function getChartColors(count: number): string[] {
  const baseColors = [
    colors.primary.deepBlue,
    colors.primary.teal,
    colors.primary.lavender,
    colors.companias.primary,
    colors.ramos.primary,
    colors.corredores.primary,
    colors.accent.success,
    colors.accent.warning,
    colors.accent.alert,
    colors.accent.info
  ];
  
  return Array.from({ length: count }, (_, i) => baseColors[i % baseColors.length]);
}

export default theme;