import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import fs from 'fs'
import path from 'path'

// Cargar variables de entorno
config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface TableInfo {
  table_name: string
  column_name: string
  data_type: string
  is_nullable: string
  column_default: string | null
  key_type?: string
}

interface ViewInfo {
  table_name: string
  column_name: string
  data_type: string
}

interface RLSInfo {
  tablename: string
  policyname: string
  permissive: string
  roles: string[]
  cmd: string
  qual: string
  with_check: string
}

async function getAllTables(): Promise<TableInfo[]> {
  console.log('🔍 Obteniendo estructura de tablas...')
  
  const { data, error } = await supabase.rpc('exec_sql', {
    query: `
      SELECT 
          t.table_name,
          c.column_name,
          c.data_type,
          c.is_nullable,
          c.column_default,
          CASE 
              WHEN pk.column_name IS NOT NULL THEN 'PRIMARY KEY'
              WHEN fk.column_name IS NOT NULL THEN 'FOREIGN KEY -> ' || fk.foreign_table_name || '(' || fk.foreign_column_name || ')'
              ELSE ''
          END as key_type
      FROM information_schema.tables t
      JOIN information_schema.columns c ON t.table_name = c.table_name
      LEFT JOIN (
          SELECT ku.table_name, ku.column_name
          FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage ku ON tc.constraint_name = ku.constraint_name
          WHERE tc.constraint_type = 'PRIMARY KEY'
      ) pk ON c.table_name = pk.table_name AND c.column_name = pk.column_name
      LEFT JOIN (
          SELECT 
              ku.table_name,
              ku.column_name,
              ccu.table_name AS foreign_table_name,
              ccu.column_name AS foreign_column_name
          FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage ku ON tc.constraint_name = ku.constraint_name
          JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
          WHERE tc.constraint_type = 'FOREIGN KEY'
      ) fk ON c.table_name = fk.table_name AND c.column_name = fk.column_name
      WHERE t.table_schema = 'public'
        AND t.table_type = 'BASE TABLE'
      ORDER BY t.table_name, c.ordinal_position;
    `
  })
  
  if (error) {
    console.error('Error obteniendo tablas:', error)
    return []
  }
  
  return data || []
}

async function getAllViews(): Promise<ViewInfo[]> {
  console.log('🔍 Obteniendo estructura de vistas...')
  
  const { data, error } = await supabase.rpc('exec_sql', {
    query: `
      SELECT 
          t.table_name,
          c.column_name,
          c.data_type
      FROM information_schema.tables t
      JOIN information_schema.columns c ON t.table_name = c.table_name
      WHERE t.table_schema = 'public'
        AND t.table_type IN ('VIEW', 'MATERIALIZED VIEW')
      ORDER BY t.table_name, c.ordinal_position;
    `
  })
  
  if (error) {
    console.error('Error obteniendo vistas:', error)
    return []
  }
  
  return data || []
}

async function getAllRLSPolicies(): Promise<RLSInfo[]> {
  console.log('🔍 Obteniendo políticas RLS...')
  
  const { data, error } = await supabase.rpc('exec_sql', {
    query: `
      SELECT 
          tablename,
          policyname,
          permissive,
          roles,
          cmd,
          qual,
          with_check
      FROM pg_policies
      ORDER BY tablename, policyname;
    `
  })
  
  if (error) {
    console.error('Error obteniendo políticas RLS:', error)
    return []
  }
  
  return data || []
}

function generateMarkdownReport(tables: TableInfo[], views: ViewInfo[], policies: RLSInfo[]): string {
  let report = `# Estructura Real de la Base de Datos\n\n`
  report += `Generado el: ${new Date().toISOString()}\n\n`
  
  // Agrupar tablas
  const tablesByName = tables.reduce((acc, table) => {
    if (!acc[table.table_name]) acc[table.table_name] = []
    acc[table.table_name].push(table)
    return acc
  }, {} as Record<string, TableInfo[]>)
  
  report += `## 📊 Tablas (${Object.keys(tablesByName).length})\n\n`
  
  Object.entries(tablesByName).forEach(([tableName, columns]) => {
    report += `### ${tableName}\n\n`
    report += `| Columna | Tipo | Nullable | Default | Clave |\n`
    report += `|---------|------|----------|---------|-------|\n`
    
    columns.forEach(col => {
      report += `| ${col.column_name} | ${col.data_type} | ${col.is_nullable} | ${col.column_default || 'N/A'} | ${col.key_type || ''} |\n`
    })
    
    report += `\n`
  })
  
  // Agrupar vistas
  const viewsByName = views.reduce((acc, view) => {
    if (!acc[view.table_name]) acc[view.table_name] = []
    acc[view.table_name].push(view)
    return acc
  }, {} as Record<string, ViewInfo[]>)
  
  report += `## 👁️ Vistas (${Object.keys(viewsByName).length})\n\n`
  
  Object.entries(viewsByName).forEach(([viewName, columns]) => {
    report += `### ${viewName}\n\n`
    report += `| Columna | Tipo |\n`
    report += `|---------|------|\n`
    
    columns.forEach(col => {
      report += `| ${col.column_name} | ${col.data_type} |\n`
    })
    
    report += `\n`
  })
  
  // Políticas RLS
  const policiesByTable = policies.reduce((acc, policy) => {
    if (!acc[policy.tablename]) acc[policy.tablename] = []
    acc[policy.tablename].push(policy)
    return acc
  }, {} as Record<string, RLSInfo[]>)
  
  report += `## 🔒 Políticas RLS\n\n`
  
  Object.entries(policiesByTable).forEach(([tableName, tablePolicies]) => {
    report += `### ${tableName}\n\n`
    tablePolicies.forEach(policy => {
      report += `- **${policy.policyname}**: ${policy.cmd} (${policy.permissive})\n`
      if (policy.qual) report += `  - Condición: \`${policy.qual}\`\n`
      if (policy.with_check) report += `  - Check: \`${policy.with_check}\`\n`
    })
    report += `\n`
  })
  
  return report
}

async function main() {
  console.log('🚀 Obteniendo estructura real de la base de datos...')
  console.log('=' .repeat(60))
  
  try {
    // Verificar conexión
    const { data, error } = await supabase.from('information_schema.tables').select('count').limit(1)
    if (error) throw new Error(`Error de conexión: ${error.message}`)
    
    console.log('✅ Conexión a Supabase exitosa')
    
    // Obtener estructura completa
    const [tables, views, policies] = await Promise.all([
      getAllTables(),
      getAllViews(),
      getAllRLSPolicies()
    ])
    
    console.log(`📊 Encontradas ${tables.length} columnas en tablas`)
    console.log(`👁️ Encontradas ${views.length} columnas en vistas`)
    console.log(`🔒 Encontradas ${policies.length} políticas RLS`)
    
    // Generar reporte
    const report = generateMarkdownReport(tables, views, policies)
    
    // Guardar en docs
    const docsDir = path.join(__dirname, '../docs')
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true })
    }
    
    const reportPath = path.join(docsDir, 'estructura-real-bd.md')
    fs.writeFileSync(reportPath, report)
    
    console.log(`\n📝 Reporte generado en: ${reportPath}`)
    console.log('\n🎯 Próximos pasos:')
    console.log('1. Revisar el reporte generado')
    console.log('2. Comparar con la estructura del frontend')
    console.log('3. Identificar discrepancias')
    console.log('4. Actualizar esquemas de validación')
    
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}