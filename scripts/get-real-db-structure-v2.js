const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Configuración usando las nuevas API keys
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY; // Fallback a legacy

console.log('🔍 Verificando configuración...');
console.log('URL:', supabaseUrl);
console.log('Key prefix:', supabaseKey ? supabaseKey.substring(0, 15) + '...' : 'NO ENCONTRADA');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Faltan variables de entorno de Supabase');
  console.log('Asegúrate de tener configurado:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- SUPABASE_SECRET_KEY (nueva) o SUPABASE_SERVICE_ROLE_KEY (legacy)');
  process.exit(1);
}

// Crear cliente con bypass RLS
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  db: {
    schema: 'public'
  }
});

async function getTables() {
  console.log('📋 Obteniendo lista de tablas...');
  
  try {
    // Método directo usando SQL
    const { data, error } = await supabase
      .rpc('exec_sql', {
        query: `
          SELECT 
            table_name,
            table_type
          FROM information_schema.tables 
          WHERE table_schema = 'public'
            AND table_name NOT LIKE 'pg_%'
            AND table_name != 'schema_migrations'
          ORDER BY table_name;
        `
      });
      
    if (error) {
      console.log('⚠️  Método RPC falló, intentando consulta directa...');
      
      // Método alternativo directo
      const { data: directData, error: directError } = await supabase
        .from('information_schema.tables')
        .select('table_name, table_type')
        .eq('table_schema', 'public')
        .neq('table_name', 'schema_migrations');
        
      if (directError) {
        throw new Error(`Error obteniendo tablas: ${directError.message}`);
      }
      
      return directData;
    }
    
    return data;
  } catch (err) {
    console.error('❌ Error en getTables:', err.message);
    throw err;
  }
}

async function getTableColumns(tableName) {
  console.log(`📊 Obteniendo columnas de ${tableName}...`);
  
  try {
    const { data, error } = await supabase
      .rpc('exec_sql', {
        query: `
          SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default,
            character_maximum_length,
            numeric_precision,
            numeric_scale
          FROM information_schema.columns 
          WHERE table_schema = 'public' 
            AND table_name = '${tableName}'
          ORDER BY ordinal_position;
        `
      });

    if (error) {
      console.warn(`⚠️  Error obteniendo columnas de ${tableName}: ${error.message}`);
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.warn(`⚠️  Error columnas ${tableName}: ${err.message}`);
    return [];
  }
}

async function getRLSPolicies(tableName) {
  try {
    const { data, error } = await supabase.rpc('get_table_rls_status', {
      table_name: tableName
    });
    
    if (error) {
      console.warn(`⚠️  Error obteniendo RLS de ${tableName}: ${error.message}`);
      return { rls_enabled: false, policy_count: 0 };
    }
    
    return data?.[0] || { rls_enabled: false, policy_count: 0 };
  } catch (err) {
    console.warn(`⚠️  Error RLS ${tableName}: ${err.message}`);
    return { rls_enabled: false, policy_count: 0 };
  }
}

async function generateDatabaseDocs() {
  try {
    console.log('🚀 Iniciando extracción de esquema con nuevas API keys...');
    console.log(`📡 URL: ${supabaseUrl}`);
    console.log(`🔑 Usando clave: ${supabaseKey.substring(0, 20)}...`);
    
    // Obtener todas las tablas
    const tables = await getTables();
    console.log(`✅ Encontradas ${tables.length} tablas/vistas`);
    
    let markdown = '# Estructura Real de la Base de Datos\n\n';
    markdown += `Generado el: ${new Date().toLocaleString()}\n\n`;
    markdown += `## Resumen\n\n`;
    markdown += `- **Total de tablas/vistas**: ${tables.length}\n`;
    markdown += `- **URL Supabase**: ${supabaseUrl}\n`;
    markdown += `- **Tipo de clave**: ${supabaseKey.startsWith('sb_secret_') ? 'Nueva Secret Key' : 'Legacy Service Role'}\n\n`;
    
    // Procesar cada tabla
    for (const table of tables) {
      const tableName = table.table_name;
      const tableType = table.table_type;
      
      console.log(`\n📋 Procesando ${tableType}: ${tableName}`);
      
      markdown += `## ${tableName} (${tableType})\n\n`;
      
      // Obtener columnas
      const columns = await getTableColumns(tableName);
      
      if (columns.length > 0) {
        markdown += '### Columnas\n\n';
        markdown += '| Columna | Tipo | Nulo | Default | Longitud |\n';
        markdown += '|---------|------|------|---------|----------|\n';
        
        columns.forEach(col => {
          const length = col.character_maximum_length || 
                        (col.numeric_precision ? `${col.numeric_precision},${col.numeric_scale}` : '');
          markdown += `| ${col.column_name} | ${col.data_type} | ${col.is_nullable} | ${col.column_default || ''} | ${length} |\n`;
        });
        
        markdown += '\n';
      }
      
      // Obtener RLS solo para tablas (no vistas)
      if (tableType === 'BASE TABLE') {
        const rls = await getRLSPolicies(tableName);
        markdown += '### Row Level Security\n\n';
        markdown += `- **RLS Habilitado**: ${rls.rls_enabled ? '✅ Sí' : '❌ No'}\n`;
        markdown += `- **Políticas**: ${rls.policy_count}\n\n`;
      }
      
      markdown += '---\n\n';
    }
    
    // Guardar archivo
    const docsDir = path.join(process.cwd(), 'docs');
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }
    
    const filePath = path.join(docsDir, 'estructura-real-bd-v2.md');
    fs.writeFileSync(filePath, markdown);
    
    console.log('\n✅ ¡Documentación generada exitosamente!');
    console.log(`📄 Archivo: ${filePath}`);
    console.log(`📊 Tablas procesadas: ${tables.length}`);
    
    return { success: true, tablesCount: tables.length, filePath };
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  generateDatabaseDocs()
    .then(result => {
      console.log('\n🎉 Proceso completado exitosamente');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Error fatal:', error.message);
      process.exit(1);
    });
}

module.exports = { generateDatabaseDocs };