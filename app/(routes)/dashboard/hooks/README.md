# Reestructuración de useMarketData

Este directorio contiene la reestructuración del hook `useMarketData` en hooks más específicos para mejorar la modularidad, mantenibilidad y rendimiento de la aplicación.

## Hooks Disponibles

### 1. useMarketTotal

Proporciona datos generales del mercado total.

```typescript
const { 
  evolucionMercado,
  concentracionMercado,
  historicalConcentracion,
  summary,
  loading,
  error 
} = useMarketTotal(selectedPeriodo, periodos);
```

### 2. useCompanias

Proporciona datos específicos de compañías.

```typescript
const { 
  companias,
  actoresSalientes,
  historicalCompanias,
  movimientosCompanias,
  loading,
  error 
} = useCompanias(selectedPeriodo, periodos);
```

### 3. useRamos

Proporciona datos específicos de ramos.

```typescript
const { 
  ramos,
  historicalRamos,
  loading,
  error 
} = useRamos(selectedPeriodo, periodos);
```

### 4. useCorredores

Proporciona datos específicos de corredores.

```typescript
const { 
  corredoresData,
  evolucionCorredores,
  loading,
  error 
} = useCorredores(selectedPeriodo, periodos);
```

## Ventajas de la Reestructuración

1. **Modularidad**: Cada hook se enfoca en un aspecto específico del mercado.
2. **Rendimiento**: Solo se cargan los datos necesarios para cada vista o componente.
3. **Mantenibilidad**: Código más organizado y fácil de mantener.
4. **Reutilización**: Los hooks pueden ser utilizados de forma independiente en diferentes partes de la aplicación.

## Ejemplo de Uso

```tsx
import { useMarketTotal, useCompanias } from '../hooks';

function DashboardPage() {
  const { summary, loading: loadingTotal } = useMarketTotal(selectedPeriodo, periodos);
  const { companias, loading: loadingCompanias } = useCompanias(selectedPeriodo, periodos);
  
  if (loadingTotal || loadingCompanias) {
    return <div>Cargando...</div>;
  }
  
  return (
    <div>
      <h1>Resumen del Mercado</h1>
      <p>Total Mercado: {summary.totalMercado}</p>
      <p>Número de Compañías: {summary.companiasCount}</p>
      
      <h2>Compañías</h2>
      <ul>
        {companias.map(compania => (
          <li key={compania.id}>{compania.nombrecia}</li>
        ))}
      </ul>
    </div>
  );
}
```

## Compatibilidad

El hook original `useMarketData` sigue disponible para mantener la compatibilidad con el código existente, pero se recomienda migrar gradualmente a los nuevos hooks específicos.