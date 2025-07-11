require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verificarPagosSinReporte() {
  try {
    console.log('🔍 Buscando pagos completados sin reporte...');
    
    // 1. Obtener todos los pagos completados
    const { data: pagosCompletados, error: errorPagos } = await supabaseAdmin
      .from('pagos')
      .select('*')
      .eq('estado', 'completed')
      .order('fecha_creacion', { ascending: false }); // ✅ Cambiado de 'created_at' a 'fecha_creacion'
    
    if (errorPagos) {
      console.error('❌ Error obteniendo pagos:', errorPagos);
      return;
    }
    
    console.log(`📊 Pagos completados encontrados: ${pagosCompletados.length}`);
    
    if (pagosCompletados.length === 0) {
      console.log('ℹ️ No hay pagos completados');
      return;
    }
    
    // 2. Para cada pago, verificar si existe el reporte
    const pagosSinReporte = [];
    
    for (const pago of pagosCompletados) {
      console.log(`\n🔍 Verificando pago ID: ${pago.id}, RUT: ${pago.rut}`);
      
      // Buscar reporte correspondiente
      const { data: reportes, error: errorReporte } = await supabaseAdmin
        .from('reportes_individuales')
        .select('*')
        .eq('user_id', pago.user_id)
        // CAMBIAR todas las referencias:
.eq('rut_factura', pago.rut_factura)
pago.rut_factura
console.log(`RUT Factura: ${pago.rut_factura}`)
        .eq('activo', true);
      
      if (errorReporte) {
        console.error(`❌ Error buscando reporte para pago ${pago.id}:`, errorReporte);
        continue;
      }
      
      if (!reportes || reportes.length === 0) {
        console.log(`❌ PAGO SIN REPORTE: ${pago.id}`);
        pagosSinReporte.push({
          pago_id: pago.id,
          user_id: pago.user_id,
          rut: pago.rut,
          monto: pago.monto,
          fecha_pago: pago.flow_payment_date || pago.fecha_creacion, // ✅ Cambiado de 'created_at' a 'fecha_creacion'
          flow_token: pago.flow_token
        });
      } else {
        console.log(`✅ Reporte encontrado: ${reportes[0].id}`);
      }
    }
    
    // 3. Mostrar resumen
    console.log('\n📋 RESUMEN:');
    console.log(`Total pagos completados: ${pagosCompletados.length}`);
    console.log(`Pagos sin reporte: ${pagosSinReporte.length}`);
    
    if (pagosSinReporte.length > 0) {
      console.log('\n❌ PAGOS SIN REPORTE:');
      pagosSinReporte.forEach((pago, index) => {
        console.log(`${index + 1}. Pago ID: ${pago.pago_id}`);
        console.log(`   RUT: ${pago.rut}`);
        console.log(`   User ID: ${pago.user_id}`);
        console.log(`   Monto: $${pago.monto}`);
        console.log(`   Fecha: ${pago.fecha_pago}`);
        console.log(`   Flow Token: ${pago.flow_token}`);
        console.log('');
      });
      
      console.log('\n🔧 SOLUCIÓN:');
      console.log('1. Aplicar el fix del webhook de Flow que proporcioné');
      console.log('2. Para los pagos existentes sin reporte, ejecutar:');
      console.log('   - Generar reportes manualmente usando generarReporteIndividual()');
      console.log('   - O crear un script de reparación');
    } else {
      console.log('✅ Todos los pagos completados tienen su reporte correspondiente');
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

verificarPagosSinReporte();