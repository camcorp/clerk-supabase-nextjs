require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno de Supabase no encontradas');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

async function verificarEstructuraTabla() {
  console.log('🔍 Verificando estructura de tabla reportes_individuales...');
  
  try {
    // Consultar la estructura de la tabla
    const { data, error } = await supabaseAdmin
      .rpc('get_table_structure', { table_name: 'reportes_individuales' })
      .single();
    
    if (error) {
      console.log('⚠️ Función get_table_structure no disponible, usando consulta alternativa...');
      
      // Consulta alternativa para obtener información de columnas
      const { data: columns, error: colError } = await supabaseAdmin
        .from('information_schema.columns')
        .select('column_name, data_type, character_maximum_length, is_nullable')
        .eq('table_name', 'reportes_individuales')
        .eq('table_schema', 'public');
      
      if (colError) {
        console.error('❌ Error al consultar estructura:', colError);
        return;
      }
      
      console.log('📋 Estructura de la tabla reportes_individuales:');
      columns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type}${col.character_maximum_length ? `(${col.character_maximum_length})` : ''} ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
      
    } else {
      console.log('📋 Estructura de la tabla:', data);
    }
    
    // Intentar insertar un registro de prueba para identificar el problema
    console.log('\n🧪 Probando inserción de prueba...');
    
    const testData = {
      user_id: 'test_user',
      rut: '123456',
      periodo: '202312', // 6 caracteres
      fecha_expiracion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      datos_reporte: { test: true }
    };
    
    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('reportes_individuales')
      .insert(testData)
      .select();
    
    if (insertError) {
      console.error('❌ Error en inserción de prueba:', insertError);
    } else {
      console.log('✅ Inserción de prueba exitosa:', insertData);
      
      // Limpiar el registro de prueba
      await supabaseAdmin
        .from('reportes_individuales')
        .delete()
        .eq('id', insertData[0].id);
      console.log('🧹 Registro de prueba eliminado');
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

verificarEstructuraTabla();