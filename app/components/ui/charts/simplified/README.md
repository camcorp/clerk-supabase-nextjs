# Biblioteca de Gráficos Simplificados

## Introducción

Esta biblioteca ofrece componentes de gráficos fáciles de usar para visualizar datos en la aplicación. Está diseñada para ser intuitiva incluso para personas sin conocimientos técnicos de programación.

## Componentes Disponibles

### SimpleLineChart

Gráfico de línea simple con un solo eje Y.

**Propiedades principales:**
- `data`: Array de datos a mostrar
- `xAxisKey`: Nombre del campo que se usará para el eje X
- `dataKey`: Nombre del campo que contiene los valores a graficar
- `title`: Título del gráfico
- `subtitle`: Subtítulo opcional
- `valueLabel`: Etiqueta para los valores
- `valueType`: Tipo de valor ('UF', 'CLP', 'PERCENT', 'NUMBER')
- `color`: Color de la línea

**Ejemplo:**
```jsx
<SimpleLineChart
  data={historicalData}
  xAxisKey="periodo"
  dataKey="total_primaclp"
  title="Evolución de Prima CLP"
  subtitle="Prima CLP por período"
  valueLabel="Prima CLP"
  valueType="CLP"
  color="#1A7F8E"
/>



## 4. Plan de Implementación

1. **Crear los componentes base**:
   - Implementar los cuatro componentes principales: SimpleLineChart, DualAxisChart, MultiSeriesChart y SimplePieChart
   - Asegurar que todos usen las mismas funciones de formato y estilos consistentes

2. **Actualizar las implementaciones existentes**:
   - Modificar las páginas que actualmente usan los componentes antiguos para usar los nuevos
   - Asegurar compatibilidad con los datos existentes

3. **Documentación**:
   - Crear el archivo README.md con ejemplos claros
   - Añadir comentarios en el código para facilitar el mantenimiento

## 5. Ejemplo de Uso en page.tsx

Aquí hay un ejemplo de cómo se vería la implementación en page.tsx usando los nuevos componentes:

```tsx
// Antes
<ChartDualAxis
  data={historicalData.map(item => ({
    ...item,
    valor: item.total_primaclp,
    crecimiento: item.crecimiento
  }))}
  title="Evolución de Prima CLP y Crecimiento"
  subtitle="Prima CLP y porcentaje de crecimiento por período"
  primaryColor={colors.companias.primary}
  secondaryColor={colors.status.info}
  valueLabel="Prima CLP"
  growthLabel="Crecimiento %"
  valueType="CLP"
  growthType="PERCENT"
/>

// Después
<DualAxisChart
  data={historicalData}
  xAxisKey="periodo"
  title="Evolución de Prima CLP y Crecimiento"
  subtitle="Prima CLP y porcentaje de crecimiento por período"
  Y1dataKey="total_primaclp"
  Y1valueLabel="Prima CLP"
  Y1valueType="CLP"
  Y1color={colors.companias.primary}
  Y2dataKey="crecimiento"
  Y2valueLabel="Crecimiento"
  Y2valueType="PERCENT"
  Y2color={colors.status.info}
/>