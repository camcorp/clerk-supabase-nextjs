const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verificarRutsCorredores() {
  const rutsCorredores = ['760071951', '520023585', '761650777', '762503360'];
  
  console.log('🔍 Verificando RUTs de corredores que no generaron reportes...');
  console.log('RUTs a verificar:', rutsCorredores.join(', '));
  console.log('=' .repeat(80));
  
  for (const rutCorredor of rutsCorredores) {
    console.log(`\n📋 VERIFICANDO RUT: ${rutCorredor}`);
    console.log('-' .repeat(50));
    
    try {
      // 1. Verificar si el corredor existe
      console.log('1️⃣ Verificando corredor...');
      const { data: corredor, error: errorCorredor } = await supabaseAdmin
        .from('corredores')
        .select('rut, nombre, activo, fecha_creacion')
        .eq('rut', rutCorredor)
        .single();
      
      if (errorCorredor) {
        console.log('❌ Corredor no encontrado:', errorCorredor.message);
        continue;
      }
      
      console.log('✅ Corredor encontrado:', corredor.nombre);
      console.log('   Activo:', corredor.activo);
      
      // 2. Verificar pagos realizados
      console.log('\n2️⃣ Verificando pagos...');
      const { data: pagos, error: errorPagos } = await supabaseAdmin
        .from('pagos')
        .select('id, rut, estado, amount, producto_id, fecha_creacion, flow_status, flow_optional')
        .eq('rut', rutCorredor)
        .order('fecha_creacion', { ascending: false });
      
      if (errorPagos) {
        console.log('❌ Error consultando pagos:', errorPagos.message);
      } else if (pagos && pagos.length > 0) {
        console.log(`✅ ${pagos.length} pago(s) encontrado(s):`);
        pagos.forEach((pago, index) => {
          console.log(`   ${index + 1}. ID: ${pago.id}, Estado: ${pago.estado}, Flow Status: ${pago.flow_status}`);
          console.log(`      Monto: $${pago.amount}, Producto: ${pago.producto_id}`);
          console.log(`      Fecha: ${new Date(pago.fecha_creacion).toLocaleString('es-CL')}`);
          
          // Verificar si tiene rutCorredor en flow_optional
          if (pago.flow_optional) {
            try {
              const flowData = JSON.parse(pago.flow_optional);
              console.log(`      RUT Corredor en flow_optional: ${flowData.rutCorredor || 'No especificado'}`);
            } catch (e) {
              console.log(`      Flow optional: ${pago.flow_optional}`);
            }
          } else {
            console.log('      Flow optional: No disponible');
          }
        });
      } else {
        console.log('❌ No se encontraron pagos');
      }
      
      // 3. Verificar reportes individuales
      console.log('\n3️⃣ Verificando reportes individuales...');
      const { data: reportes, error: errorReportes } = await supabaseAdmin
        .from('reporte_individual')
        .select('id, rut, periodo, activo, fecha_generacion, fecha_expiracion')
        .eq('rut', rutCorredor)
        .order('fecha_generacion', { ascending: false });
      
      if (errorReportes) {
        console.log('❌ Error consultando reportes:', errorReportes.message);
      } else if (reportes && reportes.length > 0) {
        console.log(`✅ ${reportes.length} reporte(s) encontrado(s):`);
        reportes.forEach((reporte, index) => {
          console.log(`   ${index + 1}. ID: ${reporte.id}, Período: ${reporte.periodo}, Activo: ${reporte.activo}`);
          console.log(`      Generado: ${new Date(reporte.fecha_generacion).toLocaleString('es-CL')}`);
          console.log(`      Expira: ${new Date(reporte.fecha_expiracion).toLocaleDateString('es-CL')}`);
        });
      } else {
        console.log('❌ No se encontraron reportes individuales');
      }
      
      // 4. Verificar accesos de usuario (buscar por diferentes patrones de user_id)
      console.log('\n4️⃣ Verificando accesos de usuario...');
      
      // Buscar accesos que puedan estar relacionados con este RUT
      const { data: accesos, error: errorAccesos } = await supabaseAdmin
        .from('accesos_usuarios')
        .select('user_id, modulo, producto_id, activo, fecha_inicio, fecha_fin')
        .or(`user_id.ilike.%${rutCorredor}%,user_id.ilike.user_demo_${rutCorredor}%`)
        .order('fecha_inicio', { ascending: false });
      
      if (errorAccesos) {
        console.log('❌ Error consultando accesos:', errorAccesos.message);
      } else if (accesos && accesos.length > 0) {
        console.log(`✅ ${accesos.length} acceso(s) encontrado(s):`);
        accesos.forEach((acceso, index) => {
          console.log(`   ${index + 1}. User ID: ${acceso.user_id}, Módulo: ${acceso.modulo}`);
          console.log(`      Producto: ${acceso.producto_id}, Activo: ${acceso.activo}`);
          console.log(`      Desde: ${new Date(acceso.fecha_inicio).toLocaleDateString('es-CL')}`);
          console.log(`      Hasta: ${new Date(acceso.fecha_fin).toLocaleDateString('es-CL')}`);
        });
      } else {
        console.log('❌ No se encontraron accesos');
      }
      
      // 5. Resumen para este RUT
      console.log('\n📊 RESUMEN:');
      console.log(`   • Corredor existe: ${corredor ? '✅' : '❌'}`);
      console.log(`   • Tiene pagos: ${pagos && pagos.length > 0 ? '✅ (' + pagos.length + ')' : '❌'}`);
      console.log(`   • Tiene reportes: ${reportes && reportes.length > 0 ? '✅ (' + reportes.length + ')' : '❌'}`);
      console.log(`   • Tiene accesos: ${accesos && accesos.length > 0 ? '✅ (' + accesos.length + ')' : '❌'}`);
      
    } catch (error) {
      console.error(`❌ Error verificando RUT ${rutCorredor}:`, error.message);
    }
  }
  
  console.log('\n' + '=' .repeat(80));
  console.log('🔍 Verificación de todos los RUTs completada');
}

verificarRutsCorredores();