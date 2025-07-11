import { z } from 'zod';

// Esquema generado automáticamente para la tabla: pagos
// Generado el: 2025-06-22T20:25:20.521Z
// Registros en BD: 13
// Relaciones FK: 4

export const PagosSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string(), // FK
  rut: z.string(),
  producto_id: z.string().uuid(), // FK
  orden_comercio: z.string(),
  amount: z.number().int(),
  estado: z.string(),
  fecha_creacion: z.string().datetime(),
  token: z.string().nullable(),
  url_pago: z.string().nullable(),
  metodo_pago: z.string(),
  flow_token: z.string(),
  flow_order: z.number().int(),
  flow_payment_id: z.string(), // FK
  flow_status: z.string(),
  flow_subject: z.string(),
  flow_currency: z.string(),
  flow_payer_email: z.string(),
  flow_optional: z.string().nullable(),
  flow_pending_info: z.string().nullable(),
  flow_payment_data: z.string().nullable(),
  fecha_actualizacion: z.string().datetime(),
  ip_address: z.string().nullable(),
  user_agent: z.string().nullable(),
  subtotal: z.string().nullable(),
  iva: z.string().nullable(),
  datos_facturacion: z.string().nullable(),
  monto: z.string().nullable(),
  transaction_id: z.string().nullable(), // FK
});

export type Pagos = z.infer<typeof PagosSchema>;

// Relaciones detectadas:
// undefined → undefined.undefined
// undefined → undefined.undefined
// undefined → undefined.undefined
// undefined → undefined.undefined
