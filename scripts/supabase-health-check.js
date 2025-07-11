#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno de Supabase no configuradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

class SupabaseHealthChecker {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      apiKeyInfo: {},
      rlsPolicies: [],
      rlsEnabledTables: [],
      tableAccess: {},
      views: [],
      functions: [],
      storage: {},
      applicationUsage: {},
      recommendations: []
    }
  }

  async runCompleteCheck() {
    console.log('🚀 VERIFICACIÓN COMPLETA DE SUPABASE')
    console.log('=' .repeat(50))

    try {
      await this.checkApiKey()
      await this.checkRLSPolicies()
      await this.checkRLSEnabledTables()
      await this.checkTableAccess()
      await this.checkViews()
      await this.checkFunctions()
      await this.checkStorage()
      await this.analyzeApplicationUsage()
      await this.generateRecommendations()
      await this.generateReport()
      
      console.log('\n🎉 Verificación completada exitosamente')
      console.log(`📄 Reporte guardado en: supabase-health-report.json`)
      
    } catch (error) {
      console.error('❌ Error durante la verificación:', error.message)
      process.exit(1)
    }
  }

  async checkApiKey() {
    console.log('\n🔑 Verificando configuración de API Key...')
    
    this.results.apiKeyInfo = {
      type: supabaseKey.startsWith('sbp_') ? 'Nueva Secret Key' : 'Legacy Key',
      canCreateRPC: true,
      canAccessInformationSchema: true
    }
    
    console.log(`✓ Tipo de clave: ${this.results.apiKeyInfo.type}`)
  }

  async checkRLSPolicies() {
    console.log('\n🔒 Obteniendo políticas RLS...')
    
    const query = `
      SELECT 
        schemaname, 
        tablename, 
        policyname, 
        permissive, 
        roles, 
        cmd, 
        qual 
      FROM pg_policies 
      WHERE schemaname = 'public'
      ORDER BY tablename, policyname
    `
    
    try {
      const { data, error } = await supabase.rpc('exec_sql', { 
        sql_query: query 
      })
      
      if (error) throw error
      
      this.results.rlsPolicies = data || []
      console.log(`✓ Encontradas ${this.results.rlsPolicies.length} políticas RLS`)
      
      // Mostrar resumen por tabla
      const policiesByTable = this.results.rlsPolicies.reduce((acc, policy) => {
        if (!acc[policy.tablename]) acc[policy.tablename] = []
        acc[policy.tablename].push(policy)
        return acc
      }, {})
      
      Object.entries(policiesByTable).forEach(([table, policies]) => {
        console.log(`  📋 ${table}: ${policies.length} política(s)`)
      })
      
    } catch (error) {
      console.error('❌ Error obteniendo políticas RLS:', error.message)
      this.results.rlsPolicies = []
    }
  }

  async checkRLSEnabledTables() {
    console.log('\n🛡️ Verificando tablas con RLS habilitado...')
    
    const query = `
      SELECT 
        schemaname, 
        tablename, 
        rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'public' AND rowsecurity = true
      ORDER BY tablename
    `
    
    try {
      const { data, error } = await supabase.rpc('exec_sql', { 
        sql_query: query 
      })
      
      if (error) throw error
      
      this.results.rlsEnabledTables = data || []
      console.log(`✓ ${this.results.rlsEnabledTables.length} tablas con RLS habilitado`)
      
      this.results.rlsEnabledTables.forEach(table => {
        console.log(`  🔒 ${table.tablename}`)
      })
      
    } catch (error) {
      console.error('❌ Error verificando RLS:', error.message)
      this.results.rlsEnabledTables = []
    }
  }

  async checkTableAccess() {
    console.log('\n🧪 Probando acceso a tablas...')
    
    const commonTables = [
      'profiles', 'users', 'usuarios', 'empresas', 'companies', 'companias',
      'productos', 'products', 'corredores', 'reportes', 'comentarios',
      'archivos', 'pagos', 'carrito', 'accesos_usuarios', 'transacciones_flow',
      'reportes_individuales', 'user_subscriptions'
    ]
    
    for (const tableName of commonTables) {
      try {
        const { data, error, count } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true })
        
        if (error) {
          this.results.tableAccess[tableName] = {
            accessible: false,
            error: error.message,
            recordCount: 0
          }
          console.log(`❌ ${tableName}: ${error.message}`)
        } else {
          this.results.tableAccess[tableName] = {
            accessible: true,
            recordCount: count || 0
          }
          console.log(`✓ ${tableName}: Accesible (${count || 0} registros)`)
        }
      } catch (error) {
        this.results.tableAccess[tableName] = {
          accessible: false,
          error: error.message,
          recordCount: 0
        }
        console.log(`❌ ${tableName}: ${error.message}`)
      }
    }
  }

  async checkViews() {
    console.log('\n👁️ Verificando vistas...')
    
    const query = `
      SELECT 
        schemaname,
        viewname,
        definition
      FROM pg_views 
      WHERE schemaname = 'public'
      ORDER BY viewname
    `
    
    try {
      const { data, error } = await supabase.rpc('exec_sql', { 
        sql_query: query 
      })
      
      if (error) throw error
      
      this.results.views = data || []
      console.log(`✓ Encontradas ${this.results.views.length} vistas`)
      
      this.results.views.forEach(view => {
        console.log(`  👁️ ${view.viewname}`)
      })
      
    } catch (error) {
      console.error('❌ Error obteniendo vistas:', error.message)
      this.results.views = []
    }
  }

  async checkFunctions() {
    console.log('\n⚙️ Verificando funciones...')
    
    const query = `
      SELECT 
        routine_name,
        routine_type,
        data_type
      FROM information_schema.routines 
      WHERE routine_schema = 'public'
      ORDER BY routine_name
    `
    
    try {
      const { data, error } = await supabase.rpc('exec_sql', { 
        sql_query: query 
      })
      
      if (error) throw error
      
      this.results.functions = data || []
      console.log(`✓ Encontradas ${this.results.functions.length} funciones`)
      
      this.results.functions.forEach(func => {
        console.log(`  ⚙️ ${func.routine_name} (${func.routine_type})`)
      })
      
    } catch (error) {
      console.error('❌ Error obteniendo funciones:', error.message)
      this.results.functions = []
    }
  }

  async checkStorage() {
    console.log('\n📦 Verificando Storage...')
    
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets()
      
      if (error) throw error
      
      this.results.storage = {
        buckets: buckets || [],
        totalBuckets: buckets?.length || 0
      }
      
      console.log(`✓ ${this.results.storage.totalBuckets} buckets encontrados`)
      
      for (const bucket of buckets || []) {
        console.log(`  📦 ${bucket.name} (${bucket.public ? 'público' : 'privado'})`)
        
        // Verificar archivos en cada bucket
        try {
          const { data: files } = await supabase.storage
            .from(bucket.name)
            .list('', { limit: 10 })
          
          this.results.storage[bucket.name] = {
            fileCount: files?.length || 0,
            sampleFiles: files?.slice(0, 5) || []
          }
          
          console.log(`    📄 ${files?.length || 0} archivos`)
        } catch (bucketError) {
          console.log(`    ❌ Error accediendo al bucket: ${bucketError.message}`)
        }
      }
      
    } catch (error) {
      console.error('❌ Error verificando Storage:', error.message)
      this.results.storage = { buckets: [], totalBuckets: 0 }
    }
  }

  async analyzeApplicationUsage() {
    console.log('\n🔍 Analizando uso en la aplicación...')
    
    const analysis = {
      apiRoutes: [],
      components: [],
      hooks: [],
      schemas: []
    }
    
    try {
      // Analizar rutas API
      const apiDir = path.join(process.cwd(), 'app', 'api')
      if (fs.existsSync(apiDir)) {
        const apiRoutes = this.scanDirectory(apiDir, '.ts', '.js')
        analysis.apiRoutes = apiRoutes.map(route => {
          const content = fs.readFileSync(route, 'utf8')
          return {
            file: route.replace(process.cwd(), ''),
            usesSupabase: content.includes('supabase'),
            tablesUsed: this.extractTableNames(content)
          }
        })
      }
      
      // Analizar componentes
      const componentsDir = path.join(process.cwd(), 'app', 'components')
      if (fs.existsSync(componentsDir)) {
        const components = this.scanDirectory(componentsDir, '.tsx', '.jsx')
        analysis.components = components.map(comp => {
          const content = fs.readFileSync(comp, 'utf8')
          return {
            file: comp.replace(process.cwd(), ''),
            usesSupabase: content.includes('supabase'),
            tablesUsed: this.extractTableNames(content)
          }
        })
      }
      
      // Analizar hooks (múltiples directorios)
      const hooksDirs = [
        path.join(process.cwd(), 'app', 'hooks'),
        path.join(process.cwd(), 'app', '(routes)', 'dashboard', 'hooks'),
        path.join(process.cwd(), 'app', 'lib')
      ]
      
      analysis.hooks = []
      hooksDirs.forEach(hooksDir => {
        if (fs.existsSync(hooksDir)) {
          const hooks = this.scanDirectory(hooksDir, '.ts', '.tsx')
          const hooksAnalysis = hooks.map(hook => {
            const content = fs.readFileSync(hook, 'utf8')
            return {
              file: hook.replace(process.cwd(), ''),
              usesSupabase: content.includes('supabase'),
              tablesUsed: this.extractTableNames(content)
            }
          })
          analysis.hooks.push(...hooksAnalysis)
        }
      })
      
      // Analizar esquemas Zod
      const schemasFile = path.join(process.cwd(), 'app', 'lib', 'validations', 'database.ts')
      if (fs.existsSync(schemasFile)) {
        const content = fs.readFileSync(schemasFile, 'utf8')
        analysis.schemas = this.extractZodSchemas(content)
      }
      
      this.results.applicationUsage = analysis
      
      console.log(`✓ ${analysis.apiRoutes.length} rutas API analizadas`)
      console.log(`✓ ${analysis.components.length} componentes analizados`)
      console.log(`✓ ${analysis.hooks.length} hooks analizados`)
      console.log(`✓ ${analysis.schemas.length} esquemas Zod encontrados`)
      
    } catch (error) {
      console.error('❌ Error analizando aplicación:', error.message)
    }
  }

  scanDirectory(dir, ...extensions) {
    const files = []
    
    function scanRecursive(currentDir) {
      const items = fs.readdirSync(currentDir)
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item)
        const stat = fs.statSync(fullPath)
        
        if (stat.isDirectory()) {
          scanRecursive(fullPath)
        } else if (extensions.some(ext => item.endsWith(ext))) {
          files.push(fullPath)
        }
      }
    }
    
    if (fs.existsSync(dir)) {
      scanRecursive(dir)
    }
    
    return files
  }

  extractTableNames(content) {
    const patterns = [
      /\.from\(['"`]([^'"` ]+)['"`]\)/g,
      /\.select\([^)]*\)\.from\(['"`]([^'"` ]+)['"`]\)/g,
      /\.insert\([^)]*\)\.into\(['"`]([^'"` ]+)['"`]\)/g,
      /\.update\(['"`]([^'"` ]+)['"`]\)/g,
      /\.delete\(\)\.from\(['"`]([^'"` ]+)['"`]\)/g,
      /supabase\.from\(['"`]([^'"` ]+)['"`]\)/g,
      /['"`]([a-z_]+)['"`]\s*:\s*['"`]SELECT/gi,
      /FROM\s+([a-z_]+)/gi,
      /INSERT\s+INTO\s+([a-z_]+)/gi,
      /UPDATE\s+([a-z_]+)/gi,
      /DELETE\s+FROM\s+([a-z_]+)/gi
    ]
    
    const tables = new Set()
    
    patterns.forEach(pattern => {
      const matches = content.match(pattern) || []
      matches.forEach(match => {
        const tableMatch = match.match(/['"`]([a-z_]+)['"`]/) || match.match(/\s([a-z_]+)$/i)
        if (tableMatch && tableMatch[1]) {
          const tableName = tableMatch[1].toLowerCase()
          // Filtrar nombres que no son tablas
          if (!['select', 'insert', 'update', 'delete', 'from', 'into', 'set', 'where'].includes(tableName)) {
            tables.add(tableName)
          }
        }
      })
    })
    
    return Array.from(tables)
  }

  extractZodSchemas(content) {
    const schemaMatches = content.match(/export const (\w+Schema) = z\.object/g) || []
    return schemaMatches.map(match => 
      match.replace(/export const (\w+Schema) = z\.object/, '$1')
    )
  }

  async generateRecommendations() {
    console.log('\n💡 Generando recomendaciones...')
    
    const recommendations = []
    
    // Verificar tablas sin políticas RLS
    const tablesWithRLS = new Set(this.results.rlsEnabledTables.map(t => t.tablename))
    const accessibleTables = Object.keys(this.results.tableAccess)
      .filter(table => this.results.tableAccess[table].accessible)
    
    const tablesWithoutRLS = accessibleTables.filter(table => !tablesWithRLS.has(table))
    
    if (tablesWithoutRLS.length > 0) {
      recommendations.push({
        type: 'security',
        priority: 'high',
        title: 'Tablas sin RLS habilitado',
        description: `Las siguientes tablas no tienen RLS habilitado: ${tablesWithoutRLS.join(', ')}`,
        action: 'Habilitar RLS y crear políticas apropiadas'
      })
    }
    
    // Verificar tablas con RLS pero sin políticas
    const tablesWithPolicies = new Set(this.results.rlsPolicies.map(p => p.tablename))
    const rlsTablesWithoutPolicies = this.results.rlsEnabledTables
      .filter(table => !tablesWithPolicies.has(table.tablename))
    
    if (rlsTablesWithoutPolicies.length > 0) {
      recommendations.push({
        type: 'security',
        priority: 'critical',
        title: 'Tablas con RLS pero sin políticas',
        description: `Estas tablas tienen RLS habilitado pero no tienen políticas: ${rlsTablesWithoutPolicies.map(t => t.tablename).join(', ')}`,
        action: 'Crear políticas RLS o deshabilitar RLS'
      })
    }
    
    // Verificar uso de tablas en la aplicación
    const usedTables = new Set()
    
    // Recopilar tablas de todas las fuentes
    this.results.applicationUsage.apiRoutes?.forEach(route => {
      route.tablesUsed?.forEach(table => usedTables.add(table))
    })
    
    this.results.applicationUsage.hooks?.forEach(hook => {
      hook.tablesUsed?.forEach(table => usedTables.add(table))
    })
    
    this.results.applicationUsage.components?.forEach(component => {
      component.tablesUsed?.forEach(table => usedTables.add(table))
    })
    
    console.log(`📊 Tablas encontradas en uso: ${Array.from(usedTables).join(', ')}`)
    
    const unusedTables = accessibleTables.filter(table => !usedTables.has(table))
    if (unusedTables.length > 0) {
      recommendations.push({
        type: 'optimization',
        priority: 'medium',
        title: 'Tablas no utilizadas en la aplicación',
        description: `Estas tablas existen pero no se usan: ${unusedTables.join(', ')}`,
        action: 'Revisar si son necesarias o implementar su uso'
      })
    }
    
    this.results.recommendations = recommendations
    
    recommendations.forEach(rec => {
      const icon = rec.priority === 'critical' ? '🚨' : rec.priority === 'high' ? '⚠️' : 'ℹ️'
      console.log(`${icon} ${rec.title}`)
      console.log(`   ${rec.description}`)
      console.log(`   💡 ${rec.action}`)
    })
  }

  async generateReport() {
    const reportPath = path.join(process.cwd(), 'supabase-health-report.json')
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2))
    
    // Generar también un reporte HTML
    const htmlReport = this.generateHTMLReport()
    const htmlPath = path.join(process.cwd(), 'supabase-health-report.html')
    fs.writeFileSync(htmlPath, htmlReport)
    
    console.log(`\n📄 Reportes generados:`)
    console.log(`   📋 JSON: supabase-health-report.json`)
    console.log(`   🌐 HTML: supabase-health-report.html`)
  }

  generateHTMLReport() {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte de Salud de Supabase</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px; }
        .table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .table th { background-color: #f2f2f2; }
        .status-ok { color: #4CAF50; }
        .status-error { color: #f44336; }
        .status-warning { color: #ff9800; }
        .recommendation { background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; margin: 10px 0; border-radius: 4px; }
        .recommendation.critical { background: #f8d7da; border-color: #f5c6cb; }
        .recommendation.high { background: #fff3cd; border-color: #ffeaa7; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Reporte de Salud de Supabase</h1>
            <p>Generado el: ${new Date(this.results.timestamp).toLocaleString('es-ES')}</p>
        </div>
        
        <div class="section">
            <h2>📊 Resumen General</h2>
            <table class="table">
                <tr><td><strong>Políticas RLS</strong></td><td>${this.results.rlsPolicies.length}</td></tr>
                <tr><td><strong>Tablas con RLS</strong></td><td>${this.results.rlsEnabledTables.length}</td></tr>
                <tr><td><strong>Tablas Accesibles</strong></td><td>${Object.values(this.results.tableAccess).filter(t => t.accessible).length}</td></tr>
                <tr><td><strong>Vistas</strong></td><td>${this.results.views.length}</td></tr>
                <tr><td><strong>Funciones</strong></td><td>${this.results.functions.length}</td></tr>
                <tr><td><strong>Buckets de Storage</strong></td><td>${this.results.storage.totalBuckets}</td></tr>
            </table>
        </div>
        
        <div class="section">
            <h2>🔒 Políticas RLS</h2>
            <table class="table">
                <thead>
                    <tr><th>Tabla</th><th>Política</th><th>Comando</th><th>Roles</th></tr>
                </thead>
                <tbody>
                    ${this.results.rlsPolicies.map(policy => `
                        <tr>
                            <td>${policy.tablename}</td>
                            <td>${policy.policyname}</td>
                            <td>${policy.cmd}</td>
                            <td>${policy.roles}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <div class="section">
            <h2>🧪 Acceso a Tablas</h2>
            <table class="table">
                <thead>
                    <tr><th>Tabla</th><th>Estado</th><th>Registros</th><th>Error</th></tr>
                </thead>
                <tbody>
                    ${Object.entries(this.results.tableAccess).map(([table, info]) => `
                        <tr>
                            <td>${table}</td>
                            <td class="${info.accessible ? 'status-ok' : 'status-error'}">
                                ${info.accessible ? '✓ Accesible' : '❌ Error'}
                            </td>
                            <td>${info.recordCount}</td>
                            <td>${info.error || '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <div class="section">
            <h2>💡 Recomendaciones</h2>
            ${this.results.recommendations.map(rec => `
                <div class="recommendation ${rec.priority}">
                    <h4>${rec.title}</h4>
                    <p>${rec.description}</p>
                    <p><strong>Acción:</strong> ${rec.action}</p>
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>
    `
  }
}

// Ejecutar verificación
if (require.main === module) {
  const checker = new SupabaseHealthChecker()
  checker.runCompleteCheck().catch(console.error)
}

module.exports = SupabaseHealthChecker