import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface TableInfo {
  table_name: string
  column_name: string
  data_type: string
  is_nullable: string
}

interface SchemaSnapshot {
  timestamp: string
  tables: Record<string, TableInfo[]>
}

async function getCurrentSchema(): Promise<SchemaSnapshot> {
  const { data: tables, error } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .neq('table_name', 'schema_migrations')
  
  if (error) throw error
  
  const schema: SchemaSnapshot = {
    timestamp: new Date().toISOString(),
    tables: {}
  }
  
  for (const table of tables || []) {
    const { data: columns, error: colError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_schema', 'public')
      .eq('table_name', table.table_name)
      .order('ordinal_position')
    
    if (!colError && columns) {
      // Fix the assignment:
      schema.tables[table.table_name] = columns.map(col => ({
        table_name: table.table_name,
        column_name: col.column_name,
        data_type: col.data_type,
        is_nullable: col.is_nullable
      }))
    }
  }
  
  return schema
}

async function generateDatabaseDiff(): Promise<void> {
  console.log('📊 Generando comparación de esquemas...')
  
  try {
    const currentSchema = await getCurrentSchema()
    const schemaPath = path.join(process.cwd(), 'docs/db/current-schema.json')
    
    // Crear directorio si no existe
    const docsDir = path.dirname(schemaPath)
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true })
    }
    
    let previousSchema: SchemaSnapshot | null = null
    
    // Leer esquema anterior si existe
    if (fs.existsSync(schemaPath)) {
      const previousData = fs.readFileSync(schemaPath, 'utf8')
      previousSchema = JSON.parse(previousData)
    }
    
    // Generar diff si hay esquema anterior
    if (previousSchema) {
      console.log('\n🔍 Comparando con esquema anterior...')
      
      const currentTables = Object.keys(currentSchema.tables)
      const previousTables = Object.keys(previousSchema.tables)
      
      const addedTables = currentTables.filter(t => !previousTables.includes(t))
      const removedTables = previousTables.filter(t => !currentTables.includes(t))
      const commonTables = currentTables.filter(t => previousTables.includes(t))
      
      console.log(`\n📋 Cambios en tablas:`)
      if (addedTables.length > 0) {
        console.log(`  ➕ Agregadas: ${addedTables.join(', ')}`)
      }
      if (removedTables.length > 0) {
        console.log(`  ➖ Eliminadas: ${removedTables.join(', ')}`)
      }
      
      // Verificar cambios en columnas
      for (const tableName of commonTables) {
        const currentCols = currentSchema.tables[tableName]
        const previousCols = previousSchema.tables[tableName]
        
        const currentColNames = currentCols.map(c => c.column_name)
        const previousColNames = previousCols.map(c => c.column_name)
        
        const addedCols = currentColNames.filter(c => !previousColNames.includes(c))
        const removedCols = previousColNames.filter(c => !currentColNames.includes(c))
        
        if (addedCols.length > 0 || removedCols.length > 0) {
          console.log(`\n  📋 Tabla ${tableName}:`)
          if (addedCols.length > 0) {
            console.log(`    ➕ Columnas agregadas: ${addedCols.join(', ')}`)
          }
          if (removedCols.length > 0) {
            console.log(`    ➖ Columnas eliminadas: ${removedCols.join(', ')}`)
          }
        }
      }
      
      if (addedTables.length === 0 && removedTables.length === 0) {
        let hasColumnChanges = false
        for (const tableName of commonTables) {
          const currentCols = currentSchema.tables[tableName]
          const previousCols = previousSchema.tables[tableName]
          const currentColNames = currentCols.map(c => c.column_name)
          const previousColNames = previousCols.map(c => c.column_name)
          if (currentColNames.length !== previousColNames.length) {
            hasColumnChanges = true
            break
          }
        }
        if (!hasColumnChanges) {
          console.log('  ✅ No se detectaron cambios en el esquema')
        }
      }
    } else {
      console.log('📝 Primera ejecución - guardando esquema base')
    }
    
    // Guardar esquema actual
    fs.writeFileSync(schemaPath, JSON.stringify(currentSchema, null, 2))
    console.log(`\n💾 Esquema guardado en: ${schemaPath}`)
    
  } catch (error) {
    console.error('❌ Error generando diff:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  generateDatabaseDiff()
}

export { generateDatabaseDiff }