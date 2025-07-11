#!/usr/bin/env node

/**
 * Script de diagnóstico RLS - Verifica políticas y acceso a tablas
 * Compatible con nuevas API keys de Supabase
 */

require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

// Configuración con nuevas API keys
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = 
  process.env.SUPABASE_SECRET_KEY ||                    // Nueva secret key (preferida)
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||   // Nueva publishable key
  process.env.SUPABASE_SERVICE_ROLE_KEY ||              // Legacy service_role
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;            // Legacy anon key

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno de Supabase no configuradas');
  process.exit(1);
}

const keyType = supabaseKey.startsWith('sb_secret_') ? 'Nueva Secret Key' :
               supabaseKey.startsWith('sb_publishable_') ? 'Nueva Publishable Key' :
               supabaseKey.includes('service_role') ? 'Legacy Service Role' :
               'Legacy Anon Key';

const supabase = createClient(supabaseUrl, supabaseKey);

// Colores para logging
const colors = {
  reset: '\x1b[0m', red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m',
  blue: '\x1b[34m', magenta: '\x1b[35m', cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  title: (msg) => console.log(`\n${colors.cyan}${msg}${colors.reset}`),
  subtitle: (msg) => console.log(`${colors.magenta}${msg}${colors.reset}`)
};

async function getAllRLSPolicies() {
  log.subtitle('🔍 Obteniendo todas las políticas RLS...');
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      query: `
        SELECT schemaname, tablename, policyname, 
               permissive, roles, cmd, qual, with_check
        FROM pg_policies 
        WHERE schemaname = 'public'
        ORDER BY tablename, policyname;
      `
    });
    
    if (error) {
      log.error(`Error obteniendo políticas: ${error.message}`);
      return [];
    }
    
    return data || [];
  } catch (err) {
    log.error(`Error en consulta de políticas: ${err.message}`);
    return [];
  }
}

async function getTablesWithRLS() {
  log.subtitle('🔒 Verificando tablas con RLS habilitado...');
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      query: `
        SELECT schemaname, tablename, rowsecurity
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY tablename;
      `
    });
    
    if (error) {
      log.error(`Error obteniendo estado RLS: ${error.message}`);
      return [];
    }
    
    return data || [];
  } catch (err) {
    log.error(`Error en consulta RLS: ${err.message}`);
    return [];
  }
}

async function testTableAccess() {
  log.subtitle('🧪 Probando acceso a tablas...');
  
  const commonTables = [
    'profiles', 'users', 'usuarios', 'empresas', 'companies', 'companias',
    'productos', 'products', 'corredores', 'reportes', 'comentarios', 
    'archivos', 'pagos', 'carrito', 'accesos_usuarios'
  ];
  
  const accessResults = [];
  
  for (const tableName of commonTables) {
    try {
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true })
        .limit(1);
      
      if (!error) {
        accessResults.push({
          table: tableName,
          accessible: true,
          recordCount: count || 0,
          error: null
        });
        log.success(`${tableName}: Accesible (${count || 0} registros)`);
      } else {
        accessResults.push({
          table: tableName,
          accessible: false,
          recordCount: 0,
          error: error.message
        });
        log.warning(`${tableName}: ${error.message}`);
      }
    } catch (err) {
      // Tabla no existe
    }
  }
  
  return accessResults;
}

async function generateRLSDiagnostic() {
  log.title('🚀 DIAGNÓSTICO DE POLÍTICAS RLS');
  log.info(`🔑 Usando: ${keyType}`);
  
  try {
    // Obtener datos
    const [policies, tablesRLS, accessResults] = await Promise.all([
      getAllRLSPolicies(),
      getTablesWithRLS(),
      testTableAccess()
    ]);
    
    // Análisis de resultados
    log.title('📊 RESULTADOS DEL DIAGNÓSTICO');
    
    // 1. Tablas con RLS habilitado
    const tablesWithRLS = tablesRLS.filter(t => t.rowsecurity === true);
    const tablesWithoutRLS = tablesRLS.filter(t => t.rowsecurity === false);
    
    log.subtitle(`🔒 Tablas con RLS habilitado (${tablesWithRLS.length}):`);
    tablesWithRLS.forEach(table => {
      const tablePolicies = policies.filter(p => p.tablename === table.tablename);
      log.info(`  ${table.tablename}: ${tablePolicies.length} políticas`);
    });
    
    log.subtitle(`🔓 Tablas sin RLS (${tablesWithoutRLS.length}):`);
    tablesWithoutRLS.forEach(table => {
      log.warning(`  ${table.tablename}: Sin protección RLS`);
    });
    
    // 2. Análisis de políticas
    log.subtitle('📋 Análisis de políticas por tabla:');
    const policiesByTable = policies.reduce((acc, policy) => {
      if (!acc[policy.tablename]) acc[policy.tablename] = [];
      acc[policy.tablename].push(policy);
      return acc;
    }, {});
    
    Object.entries(policiesByTable).forEach(([tableName, tablePolicies]) => {
      log.info(`\n  📋 ${tableName} (${tablePolicies.length} políticas):`);
      tablePolicies.forEach(policy => {
        const roleInfo = Array.isArray(policy.roles) ? policy.roles.join(', ') : policy.roles;
        log.info(`    - ${policy.policyname}: ${policy.cmd} para ${roleInfo}`);
        if (policy.qual) {
          log.info(`      Condición: ${policy.qual}`);
        }
      });
    });
    
    // 3. Tablas inaccesibles
    const inaccessibleTables = accessResults.filter(r => !r.accessible);
    if (inaccessibleTables.length > 0) {
      log.subtitle(`⚠️  Tablas con restricciones de acceso (${inaccessibleTables.length}):`);
      inaccessibleTables.forEach(table => {
        log.warning(`  ${table.table}: ${table.error}`);
      });
    }
    
    // 4. Recomendaciones
    log.title('💡 RECOMENDACIONES');
    
    if (tablesWithoutRLS.length > 0) {
      log.warning('🔓 Tablas sin RLS detectadas:');
      log.info('   Considera habilitar RLS para mayor seguridad');
      log.info('   Ejecuta: node scripts/unified-schema-manager.js --fix');
    }
    
    if (inaccessibleTables.length > 0) {
      log.warning('⚠️  Tablas inaccesibles detectadas:');
      log.info('   Verifica las políticas RLS o permisos de la API key');
      log.info('   Usa service_role key para acceso completo');
    }
    
    const accessibleCount = accessResults.filter(r => r.accessible).length;
    log.success(`✅ Diagnóstico completado: ${accessibleCount}/${accessResults.length} tablas accesibles`);
    
    return {
      policies,
      tablesRLS,
      accessResults,
      summary: {
        totalTables: tablesRLS.length,
        tablesWithRLS: tablesWithRLS.length,
        totalPolicies: policies.length,
        accessibleTables: accessibleCount,
        inaccessibleTables: inaccessibleTables.length
      }
    };
    
  } catch (error) {
    log.error(`Error en diagnóstico: ${error.message}`);
    throw error;
  }
}

// CLI
if (require.main === module) {
  generateRLSDiagnostic()
    .then(result => {
      console.log('\n🎉 Diagnóstico completado exitosamente');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Error en diagnóstico:', error.message);
      process.exit(1);
    });
}

module.exports = { generateRLSDiagnostic };