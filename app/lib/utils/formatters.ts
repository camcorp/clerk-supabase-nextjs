/**
 * Utilidades para formatear valores en la aplicación
 * Este archivo proporciona funciones para formatear diferentes tipos de valores
 * como monedas, porcentajes, números y fechas.
 */

/**
 * Sistema centralizado de funciones de formateo
 * Proporciona utilidades para formatear números, monedas, porcentajes y fechas
 */

/**
 * Formatea un número genérico con separadores de miles
 * @param value Valor a formatear
 * @param decimals Número de decimales (por defecto 2)
 * @returns Valor formateado como string (ej: "1.234,56")
 */
export function formatNumber(value: number | null | undefined, decimals: number = 0): string {
  if (value === null || value === undefined) return '0';
  
  return new Intl.NumberFormat('es-CL', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}

/**
 * Formatea un valor en Unidades de Fomento (UF)
 * @param value Valor a formatear
 * @param decimals Número de decimales (por defecto 2)
 * @param includeSymbol Incluir el símbolo UF (por defecto true)
 * @returns Valor formateado como string (ej: "UF 1.234,56")
 */
export function formatUF(value: number | null | undefined, decimals: number = 0, includeSymbol: boolean = true): string {
  if (value === null || value === undefined) return includeSymbol ? 'UF 0' : '0';
  
  return includeSymbol ? `UF ${formatNumber(value, decimals)}` : formatNumber(value, decimals);
}

/**
 * Formatea un valor en pesos chilenos (CLP)
 * @param value Valor a formatear
 * @param includeSymbol Incluir el símbolo $ (por defecto true)
 * @param decimals Número de decimales (por defecto 0)
 * @returns Valor formateado como string (ej: "$1.234.567")
 */
export function formatCLP(value: number | null | undefined, includeSymbol: boolean = true, decimals: number = 0): string {
  if (value === null || value === undefined) return includeSymbol ? '$0' : '0';
  
  if (includeSymbol) {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  } else {
    return formatNumber(value, decimals);
  }
}

/**
 * Formatea un valor como porcentaje
 * @param value Valor a formatear (ej: 0.1234 para 12.34%)
 * @param decimals Número de decimales (por defecto 2)
 * @returns Valor formateado como string (ej: "12,34%")
 */
export function formatPercent(value: number | null | undefined, decimals: number = 2): string {
  if (value === null || value === undefined) return '0%';
  
  // Verificar si el valor ya está en porcentaje (mayor que 1 o menor que -1)
  const normalizedValue = Math.abs(value) > 1 ? value : value * 100;
  
  return new Intl.NumberFormat('es-CL', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(normalizedValue / 100);
}

/**
 * Formatea una tendencia (crecimiento o decrecimiento)
 * @param value Valor a formatear
 * @param decimals Número de decimales (por defecto 2)
 * @returns Valor formateado como string con signo (ej: "+12,34%" o "-12,34%")
 */
export function formatTrend(value: number | null | undefined, decimals: number = 2): string {
  if (value === null || value === undefined) return '0%';
  
  // Verificar si el valor ya está en porcentaje (mayor que 1 o menor que -1)
  const normalizedValue = Math.abs(value) > 1 ? value : value * 100;
  
  const formattedValue = new Intl.NumberFormat('es-CL', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(Math.abs(normalizedValue));
  
  const sign = normalizedValue >= 0 ? '+' : '-';
  return `${sign}${formattedValue}%`;
}

/**
 * Formatea una fecha
 * @param date Fecha a formatear (como Date o string)
 * @returns Fecha formateada en formato local (es-CL)
 */
export function formatDate(date: Date | string): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return date.toLocaleDateString('es-CL');
}

// Alias para mantener compatibilidad
export const formatCurrency = formatCLP;
export const formatPercentage = formatPercent;

/**
 * Formatea un RUT chileno
 * @param rut RUT a formatear
 * @returns RUT formateado con puntos y guión (ej: "12.345.678-9")
 */
export function formatRUT(rut: string): string {
  // Remover puntos y guiones existentes
  const cleanRUT = rut.replace(/[.-]/g, '');
  
  if (cleanRUT.length < 2) return rut;
  
  // Separar número y dígito verificador
  const number = cleanRUT.slice(0, -1);
  const dv = cleanRUT.slice(-1);
  
  // Agregar puntos cada 3 dígitos
  const formattedNumber = number.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  return `${formattedNumber}-${dv}`;
}

/**
 * Determina el color para mostrar crecimiento/decrecimiento
 * @param value Valor numérico
 * @returns Clase CSS de color
 */
export function getGrowthColor(value: number): string {
  if (value > 0) return 'text-green-600';
  if (value < 0) return 'text-red-600';
  return 'text-gray-600';
}

/**
 * Determina el color de fondo para badges de crecimiento
 * @param value Valor numérico
 * @returns Clase CSS de color de fondo
 */
export function getGrowthBadgeColor(value: number): string {
  if (value > 0) return 'bg-green-100 text-green-800';
  if (value < 0) return 'bg-red-100 text-red-800';
  return 'bg-gray-100 text-gray-800';
}

/**
 * Determina el ícono para mostrar crecimiento/decrecimiento
 * @param value Valor numérico
 * @returns Nombre del ícono
 */
export function getGrowthIcon(value: number): string {
  if (value > 0) return 'TrendingUp';
  if (value < 0) return 'TrendingDown';
  return 'Minus';
}

/**
 * Determina el estilo del badge de concentración basado en el índice HHI
 * @param hhi Índice Herfindahl-Hirschman
 * @returns Objeto con clase CSS y etiqueta
 */
export function getConcentrationBadge(hhi: number): { className: string; label: string } {
  if (hhi < 0.15) {
    return { className: 'bg-green-100 text-green-800', label: 'Baja' };
  } else if (hhi < 0.25) {
    return { className: 'bg-yellow-100 text-yellow-800', label: 'Moderada' };
  } else {
    return { className: 'bg-red-100 text-red-800', label: 'Alta' };
  }
}


/**
 * Formatea valores para tooltips de gráficos, asegurando que no tengan decimales
 * @param value Valor a formatear (puede ser número o string)
 * @param includeSymbol Incluir símbolo de moneda (opcional)
 * @param moneda Tipo de moneda ('uf' o 'clp', por defecto ninguna)
 * @param label Etiqueta opcional para valores específicos como HHI
 * @returns Valor formateado como string sin decimales
 */
export function formatChartTooltip(
  value: number | string | null | undefined, 
  includeSymbol: boolean = false, 
  moneda?: 'uf' | 'clp',
  label?: string
): string | [string, string] {
  // Asegurarse de que el valor sea un número válido
  let numValue: number;
  try {
    numValue = typeof value === 'string' ? parseFloat(value) : Number(value || 0);
    // Si el resultado es NaN, usar 0
    if (isNaN(numValue)) numValue = 0;
  } catch (e) {
    numValue = 0;
  }
  
  // Redondear para eliminar decimales completamente
  const roundedValue = Math.round(numValue);
  
  // Formatear según el tipo de moneda
  let formattedValue: string;
  if (moneda === 'uf') {
    formattedValue = formatUF(roundedValue, 0, includeSymbol);
  } else if (moneda === 'clp') {
    formattedValue = formatCLP(roundedValue, includeSymbol, 0);
  } else {
    // Formateo estándar sin moneda
    formattedValue = formatNumber(roundedValue, 0);
  }
  
  // Si se proporciona una etiqueta, devolver como array para Recharts Tooltip
  if (label) {
    return [formattedValue, label];
  }
  
  return formattedValue;
}