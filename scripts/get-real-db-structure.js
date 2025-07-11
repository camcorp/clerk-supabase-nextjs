const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')
const fs = require('fs')
const path = require('path')

// Cargar variables de entorno
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function getAllTablesAndViews() {
  console.log('🔍 Obteniendo estructura completa de la base de datos...')
  
  // Query para obtener todas las tablas y vistas con sus columnas
  const query = `
    SELECT 
        t.table_name,
        t.table_type,
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
    ORDER BY t.table_name, c.ordinal_position;
  `
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', { query })
    
    if (error) {
      console.error('Error ejecutando query:', error)
      // Fallback: usar queries más simples
      return await getBasicStructure()
    }
    
    return data || []
  } catch (err) {
    console.error('Error en query compleja, usando método alternativo:', err)
    return await getBasicStructure()
  }
}

async function getBasicStructure() {
  console.log('📋 Usando método alternativo para obtener estructura...')
  
  const results = []
  
  // Obtener lista de tablas
  const { data: tables } = await supabase
    .from('information_schema.tables')
    .select('table_name, table_type')
    .eq('table_schema', 'public')
  
  if (tables) {
    for (const table of tables) {
      console.log(`  📊 Procesando: ${table.table_name}`)
      
      // Obtener columnas de cada tabla
      const { data: columns } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable, column_default')
        .eq('table_schema', 'public')
        .eq('table_name', table.table_name)
        .order('ordinal_position')
      
      if (columns) {
        columns.forEach(col => {
          results.push({
            table_name: table.table_name,
            table_type: table.table_type,
            column_name: col.column_name,
            data_type: col.data_type,
            is_nullable: col.is_nullable,
            column_default: col.column_default,
            key_type: ''
          })
        })
      }
    }
  }
  
  return results
}

async function getRLSPolicies() {
  console.log('🔒 Obteniendo políticas RLS...')
  
  try {
    const { data, error } = await supabase
      .from('pg_policies')
      .select('*')
    
    if (error) {
      console.error('Error obteniendo políticas RLS:', error)
      return []
    }
    
    return data || []
  } catch (err) {
    console.error('Error en políticas RLS:', err)
    return []
  }
}

function generateMarkdownReport(structure, policies) {
  let report = `# Estructura Real de la Base de Datos\n\n`
  report += `Generado el: ${new Date().toISOString()}\n\n`
  
  // Agrupar por tabla
  const tablesByName = structure.reduce((acc, item) => {
    if (!acc[item.table_name]) {
      acc[item.table_name] = {
        type: item.table_type,
        columns: []
      }
    }
    acc[item.table_name].columns.push(item)
    return acc
  }, {})
  
  // Separar tablas y vistas
  const tables = Object.entries(tablesByName).filter(([name, info]) => 
    info.type === 'BASE TABLE'
  )
  const views = Object.entries(tablesByName).filter(([name, info]) => 
    info.type === 'VIEW' || info.type === 'MATERIALIZED VIEW'
  )
  
  report += `## 📊 Tablas (${tables.length})\n\n`
  
  tables.forEach(([tableName, tableInfo]) => {
    report += `### ${tableName}\n\n`
    report += `| Columna | Tipo | Nullable | Default | Clave |\n`
    report += `|---------|------|----------|---------|-------|\n`
    
    tableInfo.columns.forEach(col => {
      report += `| ${col.column_name} | ${col.data_type} | ${col.is_nullable} | ${col.column_default || 'N/A'} | ${col.key_type || ''} |\n`
    })
    
    report += `\n`
  })
  
  report += `## 👁️ Vistas (${views.length})\n\n`
  
  views.forEach(([viewName, viewInfo]) => {
    report += `### ${viewName} (${viewInfo.type})\n\n`
    report += `| Columna | Tipo |\n`
    report += `|---------|------|\n`
    
    viewInfo.columns.forEach(col => {
      report += `| ${col.column_name} | ${col.data_type} |\n`
    })
    
    report += `\n`
  })
  
  // Políticas RLS
  if (policies.length > 0) {
    const policiesByTable = policies.reduce((acc, policy) => {
      if (!acc[policy.tablename]) acc[policy.tablename] = []
      acc[policy.tablename].push(policy)
      return acc
    }, {})
    
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
  }
  
  return report
}

async function main() {
  console.log('🚀 Obteniendo estructura real de la base de datos...')
  console.log('=' .repeat(60))
  
  try {
    // Verificar conexión
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('count')
      .limit(1)
    
    if (error) throw new Error(`Error de conexión: ${error.message}`)
    
    console.log('✅ Conexión a Supabase exitosa')
    
    // Obtener estructura completa
    const [structure, policies] = await Promise.all([
      getAllTablesAndViews(),
      getRLSPolicies()
    ])
    
    console.log(`📊 Encontradas ${structure.length} columnas en total`)
    console.log(`🔒 Encontradas ${policies.length} políticas RLS`)
    
    // Generar reporte
    const report = generateMarkdownReport(structure, policies)
    
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
    
    // Mostrar resumen en consola
    const tables = structure.filter(s => s.table_type === 'BASE TABLE')
    const views = structure.filter(s => s.table_type === 'VIEW' || s.table_type === 'MATERIALIZED VIEW')
    
    console.log('\n📋 Resumen de estructura encontrada:')
    console.log(`   📊 Tablas: ${new Set(tables.map(t => t.table_name)).size}`)
    console.log(`   👁️ Vistas: ${new Set(views.map(v => v.table_name)).size}`)
    console.log(`   🔒 Políticas RLS: ${policies.length}`)
    
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

module.exports = { main }