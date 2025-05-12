# Memoria Anual del Mercado - Outline, Checklist, y Prompts

## Outline General

### 1. Resumen General del Mercado

El Resumen General del Mercado proporciona una visión integral del estado actual del mercado asegurador, incluyendo:

* **Evolución del Mercado:** Análisis de la evolución de compañías en términos de entradas, salidas y fusiones.
* **Cambios en la estructura de mercado:** Identificación de cambios en la concentración del mercado, nuevos actores relevantes y tendencias significativas.
* **Tendencias por Grupo:** Comparación entre Seguros Generales y Vida.
* **Nuevos productos y actores destacados:** Resaltar productos o compañías que han mostrado un crecimiento significativo o una entrada destacada al mercado.
* **Tabla de Salidas:** Listado de actores que han dejado el mercado, incluyendo motivo (venta, fusión, cierre).

Este resumen permite a los usuarios identificar rápidamente las principales tendencias y cambios en el mercado asegurador durante el período seleccionado, facilitando la toma de decisiones estratégicas basadas en datos actualizados y precisos.

### 2. Tabla de Ramos

* **Evolución por ramo:** Mostrar evolución en CLP y UF por ramo, agrupados por Generales y Vida.
* **Cambios por ramo:** Identificar los ramos con mayor crecimiento o retroceso en CLP y UF.
* **Comparación entre grupos:** Comparación de los resultados por ramo entre Generales y Vida.

### 3. Selector de Período

* Permite seleccionar un período específico para la visualización del Resumen General y la Tabla de Ramos.

## Checklist

### Resumen General del Mercado

* [ ] Crear vista `vista_evolucion_mercado` para entradas, salidas y fusiones de compañías.
* [ ] Crear vista `vista_concentracion_mercado` para analizar cambios en concentración de mercado por grupo.
* [ ] Crear vista `vista_nuevos_productos` para identificar nuevos productos o actores destacados.
* [ ] Crear tabla `actores_salientes` con motivo de salida (venta, fusión, cierre).
* [ ] Crear componente `SummaryCard.tsx` para resumen en CLP y UF.
* [ ] Crear componente `SummaryCard.tsx` para tendencias por grupo (Generales vs. Vida).
* [ ] Crear componente `TrendChart.tsx` para mostrar evolución del mercado.
* [ ] Crear componente `ExitTable.tsx` para listar actores salientes y motivo de salida.
* [ ] Crear función `useFetchData` para conexión con Supabase.

### Tabla de Ramos

* [ ] Crear vista `vista_evolucion_ramos` para mostrar evolución por ramo en CLP y UF.
* [ ] Crear vista `vista_comparacion_grupos` para comparar Generales y Vida.
* [ ] Crear componente `DataTable.tsx` para la tabla de ramos.
* [ ] Crear componente `ComparisonChart.tsx` para comparar Generales vs. Vida por ramo.
* [ ] Crear función `useFetchRamos` para conexión con Supabase.

### Selector de Período

* [ ] Crear componente `PeriodSelector.tsx` con conexión a los períodos disponibles en Supabase.

## Prompts para TrSUPABASE

### 1.  vistas en Supabase

* "Genera la consulta SQL para crear la vista `vista_evolucion_mercado`, incluyendo columnas `periodo`, `rutcia`, `nombrecia`, `tipo_cambio` (entrada, salida, fusión) y `motivo` (texto descriptivo)."

```sql
CREATE VIEW vista_evolucion_mercado AS
SELECT DISTINCT
    i.periodo,
    i.rutcia,
    c.nombrecia,
    CASE
        WHEN i.primaclp = 0 AND i.primauf = 0 THEN 'salida'
        WHEN i.primaclp > 0 AND c.id IS NULL THEN 'entrada'
        ELSE 'fusión'
    END AS tipo_cambio,
    'Motivo pendiente de definir' AS motivo
FROM intercia i
LEFT JOIN companias c ON i.rutcia = c.rutcia;
```

* "Crea la vista `vista_concentracion_mercado` que incluya `periodo`, `grupo`, `total_clp`, `total_uf`, `participacion_porcentaje` y `varianza_anual`."

```sql
CREATE VIEW vista_concentracion_mercado AS
SELECT 
    i.periodo,
    i.grupo,
    SUM(i.primaclp) AS total_clp,
    SUM(i.primauf) AS total_uf,
    (SUM(i.primaclp) / (SELECT SUM(primaclp) FROM intercia WHERE periodo = i.periodo)) * 100 AS participacion_porcentaje,
    (SUM(i.primaclp) - LAG(SUM(i.primaclp)) OVER (PARTITION BY i.grupo ORDER BY i.periodo)) / LAG(SUM(i.primaclp)) OVER (PARTITION BY i.grupo ORDER BY i.periodo) * 100 AS varianza_anual
FROM intercia i
GROUP BY i.periodo, i.grupo;
```

* "Genera la tabla `actores_salientes` con columnas `id`, `rutcia`, `nombrecia`, `motivo` (texto), `fecha_salida`."

```sql
CREATE TABLE actores_salientes (
    id SERIAL PRIMARY KEY,
    rutcia VARCHAR(10) NOT NULL,
    nombrecia VARCHAR(100) NOT NULL,
    motivo TEXT,
    fecha_salida DATE
);
```
