require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase - ACTUALIZADA para nuevas API keys
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

async function diagnosticarConexion() {
  console.log('🔍 DIAGNÓSTICO DE CONEXIÓN SUPABASE\n');
  
  // Mostrar configuración
  console.log('📋 Configuración:');
  console.log(`   URL: ${supabaseUrl}`);
  console.log(`   Secret Key: ${supabaseSecretKey ? 'CONFIGURADA' : 'NO CONFIGURADA'}`);
  console.log(`   Publishable Key: ${supabasePublishableKey ? 'CONFIGURADA' : 'NO CONFIGURADA'}`);
  console.log('');
  
  // Probar con diferentes clientes
  const clientes = [];
  
  if (supabaseSecretKey) {
    clientes.push({
      nombre: 'SECRET_KEY (Admin)',
      cliente: createClient(supabaseUrl, supabaseSecretKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })
    });
  }
  
  if (supabasePublishableKey) {
    clientes.push({
      nombre: 'PUBLISHABLE_KEY',
      cliente: createClient(supabaseUrl, supabasePublishableKey)
    });
  }
  
  for (const { nombre, cliente } of clientes) {
    console.log(`🧪 Probando cliente ${nombre}:`);
    
    try {
      // Primero probar conexión básica
      const { data: healthData, error: healthError } = await cliente
        .from('periodos')
        .select('periodo')
        .limit(1);
      
      if (healthError) {
        console.log(`   ❌ Error de conexión: ${healthError.message}`);
        console.log(`   📝 Detalles: ${JSON.stringify(healthError, null, 2)}`);
      } else {
        console.log(`   ✅ Conexión exitosa`);
        
        // Probar consulta a tabla pagos si existe
        try {
          const { data: pagosData, error: pagosError, count } = await cliente
            .from('pagos')
            .select('*', { count: 'exact' })
            .limit(5);
          
          if (pagosError) {
            console.log(`   ⚠️  Tabla 'pagos': ${pagosError.message}`);
          } else {
            console.log(`   📊 Tabla 'pagos': ${count} registros totales, ${pagosData.length} obtenidos`);
          }
        } catch (pagosErr) {
          console.log(`   ⚠️  Tabla 'pagos' no accesible: ${pagosErr.message}`);
        }
        
        // Probar consulta a tabla periodos
        try {
          const { data: periodosData, error: periodosError, count: periodosCount } = await cliente
            .from('periodos')
            .select('*', { count: 'exact' })
            .limit(5);
          
          if (periodosError) {
            console.log(`   ⚠️  Tabla 'periodos': ${periodosError.message}`);
          } else {
            console.log(`   📊 Tabla 'periodos': ${periodosCount} registros totales, ${periodosData.length} obtenidos`);
          }
        } catch (periodosErr) {
          console.log(`   ⚠️  Tabla 'periodos' no accesible: ${periodosErr.message}`);
        }
      }
    } catch (err) {
      console.log(`   💥 Excepción: ${err.message}`);
    }
    console.log('');
  }
  
  // Listar todas las tablas disponibles
  console.log('📋 Probando acceso a esquema de base de datos:');
  
  if (supabaseSecretKey) {
    try {
      const adminClient = createClient(supabaseUrl, supabaseSecretKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });
      
      // Intentar obtener información del esquema
      const { data: tablesData, error: tablesError } = await adminClient
        .rpc('get_schema_tables')
        .limit(10);
      
      if (tablesError) {
        console.log(`   ⚠️  No se pudo obtener lista de tablas: ${tablesError.message}`);
      } else {
        console.log(`   📊 Tablas encontradas: ${tablesData?.length || 0}`);
      }
    } catch (err) {
      console.log(`   ⚠️  Error al consultar esquema: ${err.message}`);
    }
  }
}

diagnosticarConexion();