import { z } from 'zod';

// Esquema generado automáticamente para la tabla: products
// Generado el: 2025-06-22T20:25:20.503Z
// Registros en BD: 2
// Relaciones FK: 0

export const ProductsSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  price: z.number().int(),
  description: z.string(),
  created_at: z.string().datetime(), // Timestamp
  updated_at: z.string().datetime(), // Timestamp
});

export type Products = z.infer<typeof ProductsSchema>;
