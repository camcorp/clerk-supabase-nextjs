require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 Configuración Supabase:');
console.log('URL:', supabaseUrl);
console.log('Service Key length:', supabaseServiceKey?.length);
console.log('Service Key starts with:', supabaseServiceKey?.substring(0, 20));

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables de entorno faltantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testConnection() {
  try {
    console.log('\n🧪 Probando conexión básica...');
    
    // Test 1: Consulta simple
    const { data: testData, error: testError } = await supabase
      .from('accesos_usuarios')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Error en consulta básica:', testError);
      return;
    }
    
    console.log('✅ Conexión básica exitosa');
    
    // Test 2: Verificar acceso específico
    console.log('\n🔍 Verificando acceso específico...');
    const { data: accessData, error: accessError } = await supabase
      .from('accesos_usuarios')
      .select('*')
      .eq('user_id', 'user_2witt4wDGLn9Rxdc5rO5w7QdRNH')
      .eq('modulo', 'reporte_corredor_762503360')
      .eq('activo', true);
    
    if (accessError) {
      console.error('❌ Error verificando acceso:', accessError);
      return;
    }
    
    console.log('✅ Acceso encontrado:', accessData);
    
    // Test 3: Simular verificación como en la app
    console.log('\n🎯 Simulando verificación de acceso...');
    const now = new Date().toISOString();
    const { data: verifyData, error: verifyError } = await supabase
      .from('accesos_usuarios')
      .select('*')
      .eq('user_id', 'user_2witt4wDGLn9Rxdc5rO5w7QdRNH')
      .eq('modulo', 'reporte_corredor_762503360')
      .eq('activo', true)
      .gte('fecha_fin', now)
      .single();
    
    if (verifyError) {
      console.error('❌ Error en verificación:', verifyError);
      return;
    }
    
    console.log('✅ Verificación exitosa:', verifyData);
    console.log('\n🎉 Todas las pruebas pasaron. El problema no es de conexión.');
    
  } catch (err) {
    console.error('💥 Error de conexión:', err);
  }
}

testConnection();