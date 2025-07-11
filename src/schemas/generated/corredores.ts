import { z } from 'zod';

// Esquema generado automáticamente para la tabla: corredores
// Generado el: 2025-06-22T20:25:20.520Z
// Registros en BD: 4080
// Relaciones FK: 0

export const CorredoresSchema = z.object({
  id: z.number().int(),
  rut: z.string(),
  nombre: z.string(),
  telefono: z.string(),
  domicilio: z.string(),
  ciudad: z.string(),
  region: z.number().int(),
  tipo_persona: z.string(),
  activo: z.boolean(),
  fecha_creacion: z.string().datetime(),
  fecha_actualizacion: z.string().datetime(),
});

export type Corredores = z.infer<typeof CorredoresSchema>;
