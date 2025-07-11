# Demostración de Compra de Reporte para RUT 762686856

## Errores Corregidos en reportes.ts

✅ **Correcciones realizadas:**

1. **Código de producto corregido**: Cambiado de `'REPORTE_CORREDOR'` a `'rp_001'`
2. **Precios actualizados**: 
   - Precio neto: $29.990
   - Precio bruto: $35.688,10
3. **Función obtenerReportesComprados corregida**:
   - Cambiado `'reportes_individuales'` por `'reporte_individual'`
   - Cambiado `obtenerCorredor` por `getCorredor`
   - Corregida la lógica para extraer el RUT del módulo
4. **Búsqueda de producto corregida** en `comprarReporte`

## Proceso de Compra para RUT 762686856

Para simular la compra del reporte para el corredor con RUT 762686856, el sistema ahora:

### 1. Verificación del Corredor
```sql
SELECT rut, nombre, telefono, domicilio, ciudad, region, tipo_persona 
FROM corredores 
WHERE rut = '762686856';
```

### 2. Obtención del Producto rp_001
```sql
SELECT * FROM productos WHERE codigo = 'rp_001';
```

### 3. Simulación de Pago
```sql
INSERT INTO pagos (
  user_id, 
  rut, 
  producto_id, 
  orden_comercio, 
  amount, 
  estado, 
  fecha_creacion, 
  token
) VALUES (
  'user_id_ejemplo',
  '762686856',
  'producto_id_rp_001',
  'ORD_timestamp_random',
  35688.10,
  'COMPLETADO',
  NOW(),
  'TKN_random_token'
);
```

### 4. Creación de Acceso
```sql
INSERT INTO accesos (
  user_id,
  producto_id,
  modulo,
  fecha_inicio,
  fecha_fin,
  activo
) VALUES (
  'user_id_ejemplo',
  'producto_id_rp_001',
  'reporte_corredor_762686856',
  NOW(),
  NOW() + INTERVAL '1 month',
  true
);
```

### 5. Generación del Reporte Individual
```sql
INSERT INTO reporte_individual (
  user_id,
  rut,
  periodo,
  data,
  fecha_generacion,
  fecha_expiracion,
  activo
) VALUES (
  'user_id_ejemplo',
  '762686856',
  '202412',
  '{ "corredor": {...}, "indicadores": {...} }',
  NOW(),
  NOW() + INTERVAL '3 months',
  true
);
```

## Uso de la API Corregida

Para comprar un reporte usando las funciones corregidas:

```javascript
import { comprarReporte } from '@/lib/api/reportes';

// Comprar reporte para el RUT 762686856
const resultado = await comprarReporte(
  'user_id_del_usuario',  // ID del usuario autenticado
  '762686856',            // RUT del corredor
  '202412'                // Período (opcional, por defecto 202412)
);

if (resultado.success) {
  console.log('Reporte comprado exitosamente:', resultado.reporte);
} else {
  console.error('Error en la compra:', resultado.error);
}
```

## Verificación de Reportes Comprados

Para obtener los reportes comprados por un usuario:

```javascript
import { obtenerReportesComprados } from '@/lib/api/reportes';

const reportes = await obtenerReportesComprados('user_id_del_usuario');
console.log('Reportes comprados:', reportes);
```

## Estructura de Datos Corregida

La función `obtenerReportesComprados` ahora retorna:

```javascript
[
  {
    rut: '762686856',
    nombre: 'Nombre del Corredor',
    periodo: '202412',
    fecha_compra: '2024-01-15T10:30:00Z',
    fecha_expiracion: '2024-02-15T10:30:00Z',
    activo: true
  }
]
```

## Acceso al Reporte

Una vez comprado, el usuario puede acceder al reporte en:
`/dashboard/corredor/reportes/762686856`

El sistema verificará automáticamente:
1. Que el usuario tenga acceso activo
2. Que el reporte no haya expirado
3. Que el reporte exista en la base de datos

---

**Estado**: ✅ Todas las correcciones implementadas y listas para uso.