import { z } from 'zod';

// Esquema generado automáticamente para la tabla: productos
// Generado el: 2025-06-22T20:25:20.520Z
// Registros en BD: 10
// Relaciones FK: 0

export const ProductosSchema = z.object({
  id: z.string().uuid(),
  codigo: z.string(),
  nombre: z.string(),
  descripcion: z.string(),
  precio_neto: z.number().int(),
  precio_bruto: z.number().int(),
  activo: z.boolean(),
  fecha_creacion: z.string().datetime(),
  iva: z.number().int(),
  tipo_producto: z.string(),
  duracion_dias: z.number().int(),
});

export type Productos = z.infer<typeof ProductosSchema>;
