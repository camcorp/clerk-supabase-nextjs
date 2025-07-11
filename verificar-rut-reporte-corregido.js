require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase con NUEVAS API KEYS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ebfauwdaoxfkzymozmqr.supabase.co';
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY || 'sb_secret_gOuegO8r8OBKA0e873Rp-A_dOgBh8gT';

const supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey);

async function verificarRutReporte() {
  console.log('🔍 Verificando contenido de flow_optional en pagos (NUEVA API)...');
  
  try {
    // Verificar qué pagos existen y sus estados
    const { data: todosPagos, error: errorTodos } = await supabaseAdmin
      .from('pagos')
      .select('id, rut, flow_optional, flow_subject, orden_comercio, user_id, flow_status, estado')
      .limit(15);
    
    if (errorTodos) {
      console.error('❌ Error al obtener pagos:', errorTodos);
      return;
    }
    
    console.log(`\n📋 Total de pagos encontrados: ${todosPagos.length}\n`);
    
    // Agrupar por estado
    const porEstado = {};
    todosPagos.forEach(pago => {
      const estado = pago.flow_status || pago.estado || 'sin_estado';
      if (!porEstado[estado]) porEstado[estado] = [];
      porEstado[estado].push(pago);
    });
    
    console.log('📊 Pagos por estado:');
    Object.keys(porEstado).forEach(estado => {
      console.log(`   ${estado}: ${porEstado[estado].length} pagos`);
    });
    console.log('');
    
    // Mostrar detalles de algunos pagos
    console.log('📋 Detalles de los primeros 10 pagos:\n');
    todosPagos.slice(0, 10).forEach((pago, index) => {
      console.log(`${index + 1}. Pago ID: ${pago.id}`);
      console.log(`   RUT (facturación): ${pago.rut}`);
      console.log(`   flow_optional: ${pago.flow_optional || 'null'}`);
      console.log(`   flow_subject: ${pago.flow_subject || 'null'}`);
      console.log(`   orden_comercio: ${pago.orden_comercio || 'null'}`);
      console.log(`   flow_status: ${pago.flow_status || 'null'}`);
      console.log(`   estado: ${pago.estado || 'null'}`);
      console.log(`   user_id: ${pago.user_id || 'null'}`);
      console.log('');
    });
    
    // Verificar si flow_optional contiene RUTs diferentes
    const rutsDiferentes = todosPagos.filter(pago => 
      pago.flow_optional && pago.flow_optional !== pago.rut
    );
    
    if (rutsDiferentes.length > 0) {
      console.log('🎯 ENCONTRADOS RUTS DIFERENTES EN flow_optional:');
      rutsDiferentes.forEach(pago => {
        console.log(`   Pago ${pago.id}: RUT facturación=${pago.rut}, RUT reporte=${pago.flow_optional}`);
      });
    } else {
      console.log('⚠️  No se encontraron RUTs diferentes en flow_optional');
    }
    
    // Verificar si hay pagos con flow_optional no nulo
    const conFlowOptional = todosPagos.filter(pago => pago.flow_optional);
    if (conFlowOptional.length > 0) {
      console.log(`\n📝 ${conFlowOptional.length} pagos tienen flow_optional:`);
      conFlowOptional.forEach(pago => {
        console.log(`   ${pago.id}: flow_optional="${pago.flow_optional}"`);
      });
    }
    
    // Mostrar pagos completados para generar reportes
    const pagosCompletados = todosPagos.filter(pago => 
      pago.flow_status === 'completed' || pago.estado === 'completed'
    );
    
    if (pagosCompletados.length > 0) {
      console.log(`\n✅ ${pagosCompletados.length} pagos completados encontrados:`);
      pagosCompletados.forEach(pago => {
        console.log(`   ID: ${pago.id}, RUT: ${pago.rut}, User: ${pago.user_id}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

verificarRutReporte();