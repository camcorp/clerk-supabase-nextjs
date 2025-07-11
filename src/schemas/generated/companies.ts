import { z } from 'zod';

// Esquema generado automáticamente para la tabla: companies
// Generado el: 2025-06-22T20:25:20.510Z
// Registros en BD: 2
// Relaciones FK: 0

export const CompaniesSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  rut: z.string(),
  created_at: z.string().datetime(), // Timestamp
  updated_at: z.string().datetime(), // Timestamp
});

export type Companies = z.infer<typeof CompaniesSchema>;
