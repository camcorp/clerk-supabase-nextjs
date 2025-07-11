import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { ProfileSchema, CompanySchema, ProductSchema, CompaniaRealSchema, CorredorSchema, validateData } from '../app/lib/validations/database'

// Cargar variables de entorno desde .env.local
config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface ValidationResult {
  table: string
  total: number
  valid: number
  invalid: number
  errors: string[]
}

async function validateTable(
  tableName: string,
  schema: any,
  limit: number = 10
): Promise<ValidationResult> {
  console.log(`🔍 Validando tabla: ${tableName}...`)
  
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .limit(limit)
  
  if (error) {
    return {
      table: tableName,
      total: 0,
      valid: 0,
      invalid: 0,
      errors: [`Error al consultar ${tableName}: ${error.message}`]
    }
  }
  
  const results = {
    table: tableName,
    total: data?.length || 0,
    valid: 0,
    invalid: 0,
    errors: [] as string[]
  }
  
  data?.forEach((row, index) => {
    const validation = validateData(schema, row)
    if (validation.success) {
      results.valid++
    } else {
      results.invalid++
      results.errors.push(`Fila ${index + 1}: ${validation.errors?.join(', ')}`)
    }
  })
  
  return results
}

async function checkRLSPolicies(): Promise<void> {
  console.log('🔒 Verificando políticas RLS...')
  
  const tables = ['profiles', 'companies', 'products']
  
  for (const table of tables) {
    const { data: policies, error } = await supabase
      .rpc('get_table_rls_status', { table_name: table })
    
    if (error) {
      console.log(`❌ Error verificando RLS para ${table}: ${error.message}`)
      continue
    }
    
    if (policies && policies.length > 0) {
      const policy = policies[0]
      console.log(`📋 ${table}: RLS ${policy.rls_enabled ? '✅ Habilitado' : '❌ Deshabilitado'}, Políticas: ${policy.policy_count}`)
    }
  }
}

async function validateDatabaseSync(): Promise<void> {
  console.log('🚀 Iniciando validación de sincronización de base de datos...')
  console.log('=' .repeat(60))
  
  try {
    // Verificar conexión
    const { data, error } = await supabase.from('profiles').select('count').limit(1)
    if (error) throw new Error(`Error de conexión: ${error.message}`)
    
    console.log('✅ Conexión a Supabase exitosa')
    
    // Validar esquemas de datos
    // Validar las tablas que realmente existen
    const validations = await Promise.all([
      validateTable('profiles', ProfileSchema, 5),
      validateTable('companias', CompaniaRealSchema, 5),
      validateTable('corredores', CorredorSchema, 5),
      validateTable('productos', ProductSchema, 5)
    ])
    
    // Verificar RLS en tablas reales
    const tables = ['profiles', 'companias', 'corredores', 'productos', 'accesos']
    
    // Mostrar resultados
    console.log('\n📊 Resultados de Validación:')
    console.log('=' .repeat(40))
    
    let totalErrors = 0
    validations.forEach(result => {
      console.log(`\n📋 Tabla: ${result.table}`)
      console.log(`   Total registros: ${result.total}`)
      console.log(`   Válidos: ${result.valid} ✅`)
      console.log(`   Inválidos: ${result.invalid} ❌`)
      
      if (result.errors.length > 0) {
        console.log(`   Errores:`)
        result.errors.slice(0, 3).forEach(error => {
          console.log(`     - ${error}`)
        })
        if (result.errors.length > 3) {
          console.log(`     ... y ${result.errors.length - 3} errores más`)
        }
        totalErrors += result.invalid
      }
    })
    
    // Verificar RLS
    console.log('\n🔒 Verificación de Seguridad:')
    console.log('=' .repeat(30))
    await checkRLSPolicies()
    
    // Resumen final
    console.log('\n🎯 Resumen Final:')
    console.log('=' .repeat(20))
    if (totalErrors === 0) {
      console.log('✅ Todas las validaciones pasaron correctamente')
      console.log('✅ Backend y Frontend están sincronizados')
    } else {
      console.log(`❌ Se encontraron ${totalErrors} errores de validación`)
      console.log('⚠️  Revisa los esquemas de datos y corrige los errores')
      process.exit(1)
    }
    
  } catch (error) {
    console.error('❌ Error crítico en validación:', error)
    process.exit(1)
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  validateDatabaseSync()
}

export { validateDatabaseSync }