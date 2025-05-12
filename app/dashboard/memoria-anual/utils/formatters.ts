/**
 * Formatea un valor numérico como UF (Unidad de Fomento)
 * @param value Valor numérico a formatear
 * @param decimals Número de decimales a mostrar
 * @param includeSymbol Si es true, incluye el símbolo 'UF' al final
 * @returns Valor formateado como UF
 */
export function formatUF(value: number, decimals: number = 0, includeSymbol: boolean = true): string {
  const formattedValue = new Intl.NumberFormat('es-CL', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals
  }).format(value);
  
  return includeSymbol ? `${formattedValue} UF` : formattedValue;
}

/**
 * Formatea un valor numérico como miles de pesos chilenos
 * @param value Valor numérico a formatear
 * @param includeSymbol Si es true, incluye el símbolo 'M$' al final
 * @returns Valor formateado como miles de pesos chilenos
 */
export function formatCLP(value: number, includeSymbol: boolean = true): string {
  const formattedValue = new Intl.NumberFormat('es-CL', {
    maximumFractionDigits: 0
  }).format(value);
  
  return includeSymbol ? `${formattedValue} M$` : formattedValue;
}

/**
 * Formatea un valor numérico como porcentaje
 * @param value Valor numérico a formatear
 * @param decimals Número de decimales a mostrar
 * @returns Valor formateado como porcentaje
 */
export function formatPercent(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'percent',
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals
  }).format(value / 100);
}

/**
 * Formatea un valor numérico como moneda (CLP)
 * @param value Valor numérico a formatear
 * @returns Valor formateado como moneda CLP
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP'
  }).format(value);
}

/**
 * Formatea un valor numérico genérico
 * @param value Valor numérico a formatear
 * @param decimals Número de decimales a mostrar
 * @returns Valor formateado
 */
export function formatNumber(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat('es-CL', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals
  }).format(value);
}