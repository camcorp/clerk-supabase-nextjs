/**
 * Sistema de colores centralizado para el dashboard
 */

export const colors = {
  // Colores principales por sección
  companias: {
    primary: '#FF6478', // 255,100,124
    secondary: '#FF8C9A',
    light: '#FFE5E9',
  },
  ramos: {
    primary: '#429071', // 66,144,113
    secondary: '#6AAF8C',
    light: '#E5F2EC',
  },
  corredores: {
    primary: '#768CF3', // 118,140,243
    secondary: '#A5B4F7',
    light: '#EEF1FE',
  },
  
  // Colores base
  text: {
    primary: '#333333', // hex 333
    secondary: '#898989', // 137,137,137
    light: '#CCCCCC',
  },
  
  // Colores de estado
  status: {
    success: '#2ECC71',
    warning: '#F39C12',
    danger: '#E74C3C',
    info: '#3498DB',
  },
  
  // Colores de fondo
  background: {
    light: '#FFFFFF',
    medium: '#F8F9FC',
    dark: '#E9ECEF',
  },
  
  // Colores de borde
  border: {
    light: 'rgba(231,231,231,0.8)',
    medium: '#E9ECEF',
    dark: '#DEE2E6',
  },
  
  // Gradientes
  gradients: {
    primary: 'linear-gradient(to right, #0F3460, #1A7F8E)',
    card: 'linear-gradient(to bottom right, #FFFFFF, #F8F9FC)',
  }
};

// Función para obtener el color según el tipo (compañías, ramos, corredores)
export function getColorByType(type: 'companias' | 'ramos' | 'corredores', variant: 'primary' | 'secondary' | 'light' = 'primary') {
  return colors[type][variant];
}

// Función para obtener el color de texto
export function getTextColor(variant: 'primary' | 'secondary' | 'light' = 'primary') {
  return colors.text[variant];
}

// Función para obtener el color de estado
export function getStatusColor(status: 'success' | 'warning' | 'danger' | 'info') {
  return colors.status[status];
}