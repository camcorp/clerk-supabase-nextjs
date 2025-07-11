import { z } from 'zod'

// Esquemas que coinciden con las vistas reales
export const CompaniaSchema = z.object({
  id: z.string(),
  nombrecia: z.string().min(1),
  periodo: z.string(),
  total_primauf: z.number(),
  grupo: z.string(),
  tipo: z.string()
})

// Mantener esquemas básicos para tablas de validación
// Esquema para perfiles de usuario
export const ProfileSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string(),
  email: z.string().email(),
  full_name: z.string().optional(),
  avatar_url: z.string().url().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
})

// Esquema para compañías del sector seguros
export const CompaniaRealSchema = z.object({
  id: z.number(),
  rutcia: z.string(),
  nombrecia: z.string(),
  grupo: z.string().optional()
})

// CorredorSchema already defined above

// Tipos TypeScript inferidos
export type Profile = z.infer<typeof ProfileSchema>
export type CompaniaReal = z.infer<typeof CompaniaRealSchema>
export type Corredor = z.infer<typeof CorredorSchema>
export const CompanySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  owner_id: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
})

export const ProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  price: z.number().positive(),
  company_id: z.string().uuid(),
  created_at: z.string().datetime()
})

// Tipos TypeScript
export type Compania = z.infer<typeof CompaniaSchema>
// Profile type already defined above
export type Company = z.infer<typeof CompanySchema>
export type Product = z.infer<typeof ProductSchema>

// Función de validación genérica
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean
  data?: T
  errors?: string[]
} {
  try {
    const validData = schema.parse(data)
    return { success: true, data: validData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
      }
    }
    return { success: false, errors: ['Error de validación desconocido'] }
  }
}

// Esquemas que coinciden con la estructura real
// ProfileSchema already defined above

// CompaniaRealSchema already defined above

// Esquema para corredores
export const CorredorSchema = z.object({
  id: z.number(),
rut_factura: z.string(),
  nombre: z.string(),
  telefono: z.string().optional(),
  domicilio: z.string().optional(),
  ciudad: z.string().optional(),
  region: z.number().optional(),
  tipo_persona: z.string().optional(),
  activo: z.boolean().optional()
})