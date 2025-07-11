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

class RLSPolicyManager {
  constructor() {
    this.results = {
      enabledTables: [],
      createdPolicies: [],
      errors: []
    }
  }

  async enableRLSOnTables() {
    console.log('🔒 Habilitando RLS en tablas...')
    
    const tables = [
      'profiles', 'users', 'usuarios', 'empresas', 'companies', 'companias',
      'productos', 'products', 'corredores', 'reportes', 'comentarios',
      'archivos', 'pagos', 'carrito', 'accesos_usuarios', 'transacciones_flow',
      'reportes_individuales', 'user_subscriptions'
    ]

    for (const table of tables) {
      try {
        const { error } = await supabase.rpc('exec_sql', {
          sql_query: `ALTER TABLE IF EXISTS ${table} ENABLE ROW LEVEL SECURITY;`
        })
        
        if (error) {
          console.log(`⚠️  ${table}: ${error.message}`)
          this.results.errors.push({ table, action: 'enable_rls', error: error.message })
        } else {
          console.log(`✅ ${table}: RLS habilitado`)
          this.results.enabledTables.push(table)
        }
      } catch (err) {
        console.log(`❌ ${table}: ${err.message}`)
        this.results.errors.push({ table, action: 'enable_rls', error: err.message })
      }
    }
  }

  async createUserPolicies() {
    console.log('\n👤 Creando políticas para tablas de usuarios...')
    
    const userPolicies = [
      {
        table: 'profiles',
        policies: [
          {
            name: 'Users can view own profile',
            action: 'SELECT',
            condition: "auth.uid()::text = user_id OR auth.uid()::text = id::text"
          },
          {
            name: 'Users can update own profile', 
            action: 'UPDATE',
            condition: "auth.uid()::text = user_id OR auth.uid()::text = id::text"
          },
          {
            name: 'Users can insert own profile',
            action: 'INSERT', 
            condition: "auth.uid()::text = user_id OR auth.uid()::text = id::text"
          }
        ]
      },
      {
        table: 'users',
        policies: [
          {
            name: 'Users can view own user record',
            action: 'SELECT',
            condition: "auth.uid()::text = id::text"
          },
          {
            name: 'Users can update own user record',
            action: 'UPDATE', 
            condition: "auth.uid()::text = id::text"
          }
        ]
      },
      {
        table: 'usuarios',
        policies: [
          {
            name: 'Users can view own usuario record',
            action: 'SELECT',
            condition: "auth.uid()::text = user_id::text OR auth.uid()::text = id::text"
          },
          {
            name: 'Users can update own usuario record',
            action: 'UPDATE',
            condition: "auth.uid()::text = user_id::text OR auth.uid()::text = id::text"
          }
        ]
      }
    ]

    await this.createPolicies(userPolicies)
  }

  async createTransactionPolicies() {
    console.log('\n💳 Creando políticas para tablas de transacciones...')
    
    const transactionPolicies = [
      {
        table: 'pagos',
        policies: [
          {
            name: 'Users can view own payments',
            action: 'SELECT',
            condition: "auth.uid()::text = user_id::text"
          },
          {
            name: 'Users can insert own payments',
            action: 'INSERT',
            condition: "auth.uid()::text = user_id::text"
          }
        ]
      },
      {
        table: 'carrito',
        policies: [
          {
            name: 'Users can manage own cart',
            action: 'ALL',
            condition: "auth.uid()::text = user_id::text"
          }
        ]
      },
      {
        table: 'transacciones_flow',
        policies: [
          {
            name: 'Users can view own transactions',
            action: 'SELECT',
            condition: "auth.uid()::text = user_id::text"
          },
          {
            name: 'Users can insert own transactions',
            action: 'INSERT',
            condition: "auth.uid()::text = user_id::text"
          }
        ]
      }
    ]

    await this.createPolicies(transactionPolicies)
  }

  async createAccessPolicies() {
    console.log('\n🔑 Creando políticas para tablas de acceso...')
    
    const accessPolicies = [
      {
        table: 'accesos_usuarios',
        policies: [
          {
            name: 'Users can view own access',
            action: 'SELECT',
            condition: "auth.uid()::text = user_id::text"
          },
          {
            name: 'Users can insert own access',
            action: 'INSERT',
            condition: "auth.uid()::text = user_id::text"
          }
        ]
      },
      {
        table: 'user_subscriptions',
        policies: [
          {
            name: 'Users can manage own subscriptions',
            action: 'ALL',
            condition: "auth.uid()::text = user_id::text"
          }
        ]
      },
      {
        table: 'reportes_individuales',
        policies: [
          {
            name: 'Users can manage own reports',
            action: 'ALL',
            condition: "auth.uid()::text = user_id::text"
          }
        ]
      }
    ]

    await this.createPolicies(accessPolicies)
  }

  async createPublicReadPolicies() {
    console.log('\n📊 Creando políticas de lectura pública para datos de mercado...')
    
    const publicPolicies = [
      {
        table: 'companias',
        policies: [
          {
            name: 'Authenticated users can read companias',
            action: 'SELECT',
            condition: "auth.role() = 'authenticated'"
          }
        ]
      },
      {
        table: 'companies',
        policies: [
          {
            name: 'Authenticated users can read companies',
            action: 'SELECT',
            condition: "auth.role() = 'authenticated'"
          }
        ]
      },
      {
        table: 'empresas',
        policies: [
          {
            name: 'Authenticated users can read empresas',
            action: 'SELECT',
            condition: "auth.role() = 'authenticated'"
          }
        ]
      },
      {
        table: 'productos',
        policies: [
          {
            name: 'Authenticated users can read productos',
            action: 'SELECT',
            condition: "auth.role() = 'authenticated'"
          }
        ]
      },
      {
        table: 'products',
        policies: [
          {
            name: 'Authenticated users can read products',
            action: 'SELECT',
            condition: "auth.role() = 'authenticated'"
          }
        ]
      },
      {
        table: 'corredores',
        policies: [
          {
            name: 'Authenticated users can read corredores',
            action: 'SELECT',
            condition: "auth.role() = 'authenticated'"
          }
        ]
      },
      {
        table: 'reportes',
        policies: [
          {
            name: 'Authenticated users can read reportes',
            action: 'SELECT',
            condition: "auth.role() = 'authenticated'"
          }
        ]
      }
    ]

    await this.createPolicies(publicPolicies)
  }

  async createContentPolicies() {
    console.log('\n📝 Creando políticas para contenido...')
    
    const contentPolicies = [
      {
        table: 'comentarios',
        policies: [
          {
            name: 'Users can view all comments',
            action: 'SELECT',
            condition: "true"
          },
          {
            name: 'Users can manage own comments',
            action: 'ALL',
            condition: "auth.uid()::text = user_id::text"
          }
        ]
      },
      {
        table: 'archivos',
        policies: [
          {
            name: 'Users can view accessible files',
            action: 'SELECT',
            condition: "is_public = true OR auth.uid()::text = user_id::text"
          },
          {
            name: 'Users can manage own files',
            action: 'ALL',
            condition: "auth.uid()::text = user_id::text"
          }
        ]
      }
    ]

    await this.createPolicies(contentPolicies)
  }

  async createPolicies(tablesPolicies) {
    for (const tableConfig of tablesPolicies) {
      const { table, policies } = tableConfig
      
      for (const policy of policies) {
        try {
          // Primero eliminar la política si existe
          await supabase.rpc('exec_sql', {
            sql_query: `DROP POLICY IF EXISTS "${policy.name}" ON ${table};`
          })
          
          // Crear la nueva política
          let policySQL
          if (policy.action === 'ALL') {
            policySQL = `CREATE POLICY "${policy.name}" ON ${table} FOR ALL USING (${policy.condition});`
          } else if (policy.action === 'INSERT') {
            policySQL = `CREATE POLICY "${policy.name}" ON ${table} FOR ${policy.action} WITH CHECK (${policy.condition});`
          } else {
            policySQL = `CREATE POLICY "${policy.name}" ON ${table} FOR ${policy.action} USING (${policy.condition});`
          }
          
          const { error } = await supabase.rpc('exec_sql', {
            sql_query: policySQL
          })
          
          if (error) {
            console.log(`⚠️  ${table}.${policy.name}: ${error.message}`)
            this.results.errors.push({ 
              table, 
              policy: policy.name, 
              action: 'create_policy', 
              error: error.message 
            })
          } else {
            console.log(`✅ ${table}.${policy.name}: Creada`)
            this.results.createdPolicies.push({ table, policy: policy.name })
          }
        } catch (err) {
          console.log(`❌ ${table}.${policy.name}: ${err.message}`)
          this.results.errors.push({ 
            table, 
            policy: policy.name, 
            action: 'create_policy', 
            error: err.message 
          })
        }
      }
    }
  }

  async verifyPolicies() {
    console.log('\n🔍 Verificando políticas creadas...')
    
    try {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql_query: `
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
          ORDER BY tablename, policyname;
        `
      })
      
      if (error) {
        console.log('❌ Error verificando políticas:', error.message)
        return
      }
      
      console.log(`✅ ${data.length} políticas encontradas`)
      
      // Agrupar por tabla
      const policiesByTable = data.reduce((acc, policy) => {
        if (!acc[policy.tablename]) acc[policy.tablename] = []
        acc[policy.tablename].push(policy.policyname)
        return acc
      }, {})
      
      Object.entries(policiesByTable).forEach(([table, policies]) => {
        console.log(`📋 ${table}: ${policies.length} políticas`)
      })
      
    } catch (err) {
      console.log('❌ Error verificando políticas:', err.message)
    }
  }

  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        enabledTables: this.results.enabledTables.length,
        createdPolicies: this.results.createdPolicies.length,
        errors: this.results.errors.length
      },
      details: this.results
    }
    
    const reportPath = path.join(process.cwd(), 'rls-setup-report.json')
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    
    console.log(`\n📄 Reporte guardado en: rls-setup-report.json`)
    
    if (this.results.errors.length > 0) {
      console.log(`\n⚠️  Se encontraron ${this.results.errors.length} errores:`)
      this.results.errors.forEach(error => {
        console.log(`   - ${error.table}: ${error.error}`)
      })
    }
  }

  async run() {
    console.log('🚀 CONFIGURACIÓN DE POLÍTICAS RLS')
    console.log('=' .repeat(50))
    
    try {
      await this.enableRLSOnTables()
      await this.createUserPolicies()
      await this.createTransactionPolicies()
      await this.createAccessPolicies()
      await this.createPublicReadPolicies()
      await this.createContentPolicies()
      await this.verifyPolicies()
      await this.generateReport()
      
      console.log('\n🎉 Configuración de RLS completada')
      
    } catch (error) {
      console.error('❌ Error durante la configuración:', error.message)
      process.exit(1)
    }
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  const manager = new RLSPolicyManager()
  manager.run()
}

module.exports = RLSPolicyManager