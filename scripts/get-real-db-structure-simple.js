const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Configuración usando las nuevas API keys
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Verificando configuración...');
console.log('URL:', supabaseUrl);
console.log('Key prefix:', supabaseKey ? supabaseKey.substring(0, 15) + '...' : 'NO ENCONTRADA');
console.log('Key type:', supabaseKey?.startsWith('sb_secret_') ? 'Nueva Secret Key ✅' : 'Legacy Service Role');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Faltan variables de entorno de Supabase');
  process.exit(1);
}

// Crear cliente con las nuevas API keys
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testConnection() {
  console.log('\n🔌 Probando conexión con Supabase...');
  
  try {
    // Probar conexión básica
    const { data, error } = await supabase
      .from('pg_tables')
      .select('tablename, schemaname')
      .eq('schemaname', 'public')
      .limit(5);
    
    if (error) {
      console.log('⚠️  Método pg_tables falló, probando alternativa...');
      
      // Método alternativo: usar RPC para obtener tablas
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_table_rls_status', {
        table_name: 'profiles'
      });
      
      if (rpcError) {
        console.log('❌ Error de conexión:', rpcError.message);
        return false;
      }
      
      console.log('✅ Conexión exitosa (método RPC)');
      return true;
    }
    
    console.log('✅ Conexión exitosa');
    console.log(`📋 Encontradas ${data.length} tablas de muestra:`);
    data.forEach(table => {
      console.log(`   - ${table.tablename}`);
    });
    
    return true;
    
  } catch (err) {
    console.error('❌ Error de conexión:', err.message);
    return false;
  }
}

async function getTablesSimple() {
  console.log('\n📋 Obteniendo lista de tablas...');
  
  try {
    // Método 1: Usar pg_tables (más confiable)
    const { data, error } = await supabase
      .from('pg_tables')
      .select('tablename, schemaname')
      .eq('schemaname', 'public');
    
    if (error) {
      console.log('⚠️  pg_tables falló, intentando método directo...');
      
      // Método 2: Consulta SQL directa usando RPC
      const { data: sqlData, error: sqlError } = await supabase
        .rpc('exec_sql', {
          query: "SELECT tablename as table_name, 'BASE TABLE' as table_type FROM pg_tables WHERE schemaname = 'public'"
        });
      
      if (sqlError) {
        console.log('⚠️  RPC exec_sql falló, usando lista manual...');
        
        // Método 3: Lista manual de tablas conocidas
        const knownTables = [
          'profiles', 'companies', 'products', 'companias', 'corredores', 
          'productos', 'pagos', 'accesos_usuarios', 'reportes_individuales',
          'transacciones_flow', 'configuracion_flow'
        ];
        
        const manualData = [];
        for (const tableName of knownTables) {
          try {
            const { data: testData, error: testError } = await supabase
              .from(tableName)
              .select('*')
              .limit(1);
            
            if (!testError) {
              manualData.push({ table_name: tableName, table_type: 'BASE TABLE' });
              console.log(`   ✅ Tabla encontrada: ${tableName}`);
            }
          } catch (e) {
            console.log(`   ❌ Tabla no encontrada: ${tableName}`);
          }
        }
        
        return manualData;
      }
      
      return sqlData.map(row => ({
        table_name: row.result.tablename,
        table_type: 'BASE TABLE'
      }));
    }
    
    return data.map(row => ({
      table_name: row.tablename,
      table_type: 'BASE TABLE'
    }));
    
  } catch (err) {
    console.error('❌ Error obteniendo tablas:', err.message);
    throw err;
  }
}

async function getTableInfo(tableName) {
  console.log(`📊 Analizando tabla: ${tableName}`);
  
  try {
    // Obtener una muestra de datos para inferir estructura
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (error) {
      console.log(`   ⚠️  Error accediendo a ${tableName}: ${error.message}`);
      return {
        name: tableName,
        accessible: false,
        error: error.message,
        columns: [],
        sample_count: 0
      };
    }
    
    // Obtener conteo total
    const { count, error: countError } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });
    
    const columns = data && data.length > 0 ? Object.keys(data[0]) : [];
    
    return {
      name: tableName,
      accessible: true,
      columns: columns,
      sample_count: count || 0,
      sample_data: data?.[0] || null
    };
    
  } catch (err) {
    console.log(`   ❌ Error en ${tableName}: ${err.message}`);
    return {
      name: tableName,
      accessible: false,
      error: err.message,
      columns: [],
      sample_count: 0
    };
  }
}

async function generateSimpleDocs() {
  try {
    console.log('🚀 Iniciando análisis simplificado de la base de datos...');
    
    // Probar conexión
    const connected = await testConnection();
    if (!connected) {
      throw new Error('No se pudo establecer conexión con Supabase');
    }
    
    // Obtener tablas
    const tables = await getTablesSimple();
    console.log(`\n✅ Encontradas ${tables.length} tablas`);
    
    let markdown = '# Análisis de Base de Datos Supabase\n\n';
    markdown += `**Generado el:** ${new Date().toLocaleString()}\n\n`;
    markdown += `**URL:** ${supabaseUrl}\n`;
    markdown += `**Tipo de clave:** ${supabaseKey.startsWith('sb_secret_') ? 'Nueva Secret Key' : 'Legacy Service Role'}\n\n`;
    markdown += `## Resumen\n\n`;
    markdown += `- **Total de tablas encontradas:** ${tables.length}\n\n`;
    
    // Analizar cada tabla
    const tableInfos = [];
    for (const table of tables) {
      const info = await getTableInfo(table.table_name);
      tableInfos.push(info);
    }
    
    // Tablas accesibles
    const accessibleTables = tableInfos.filter(t => t.accessible);
    const inaccessibleTables = tableInfos.filter(t => !t.accessible);
    
    markdown += `- **Tablas accesibles:** ${accessibleTables.length}\n`;
    markdown += `- **Tablas con restricciones:** ${inaccessibleTables.length}\n\n`;
    
    // Detalles de tablas accesibles
    if (accessibleTables.length > 0) {
      markdown += '## Tablas Accesibles\n\n';
      
      for (const table of accessibleTables) {
        markdown += `### ${table.name}\n\n`;
        markdown += `- **Registros:** ${table.sample_count}\n`;
        markdown += `- **Columnas:** ${table.columns.length}\n\n`;
        
        if (table.columns.length > 0) {
          markdown += '**Estructura:**\n\n';
          markdown += '| Columna | Tipo (inferido) |\n';
          markdown += '|---------|-----------------|\n';
          
          table.columns.forEach(col => {
            const sampleValue = table.sample_data?.[col];
            const inferredType = typeof sampleValue;
            markdown += `| ${col} | ${inferredType} |\n`;
          });
          
          markdown += '\n';
        }
        
        if (table.sample_data) {
          markdown += '**Datos de muestra:**\n\n';
          markdown += '```json\n';
          markdown += JSON.stringify(table.sample_data, null, 2);
          markdown += '\n```\n\n';
        }
        
        markdown += '---\n\n';
      }
    }
    
    // Tablas con restricciones
    if (inaccessibleTables.length > 0) {
      markdown += '## Tablas con Restricciones de Acceso\n\n';
      
      inaccessibleTables.forEach(table => {
        markdown += `### ${table.name}\n\n`;
        markdown += `- **Error:** ${table.error}\n`;
        markdown += `- **Posible causa:** Row Level Security (RLS) o permisos\n\n`;
      });
    }
    
    // Guardar archivo
    const docsDir = path.join(process.cwd(), 'docs');
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }
    
    const filePath = path.join(docsDir, 'analisis-bd-supabase.md');
    fs.writeFileSync(filePath, markdown);
    
    console.log('\n✅ ¡Análisis completado!');
    console.log(`📄 Archivo generado: ${filePath}`);
    console.log(`📊 Tablas analizadas: ${tables.length}`);
    console.log(`✅ Tablas accesibles: ${accessibleTables.length}`);
    console.log(`⚠️  Tablas restringidas: ${inaccessibleTables.length}`);
    
    return { success: true, tablesCount: tables.length, accessibleCount: accessibleTables.length };
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

// Ejecutar
if (require.main === module) {
  generateSimpleDocs()
    .then(result => {
      console.log('\n🎉 Proceso completado exitosamente');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Error fatal:', error.message);
      process.exit(1);
    });
}

module.exports = { generateSimpleDocs };