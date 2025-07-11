const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verificarCompra761650777() {
  const rutCorredor = '761650777';
  const periodo = '202412'; // Asumiendo período actual
  
  console.log(`🔍 Verificando compra para RUT: ${rutCorredor}`);
  console.log('=' .repeat(50));
  
  try {
    // 1. Verificar si el corredor existe
    console.log('1️⃣ Verificando corredor...');
    const { data: corredor, error: errorCorredor } = await supabaseAdmin
      .from('corredores')
      .select('*')
      .eq('rut', rutCorredor)
      .single();
    
    if (errorCorredor) {
      console.log('❌ Corredor no encontrado:', errorCorredor.message);
      return;
    }
    
    console.log('✅ Corredor encontrado:', corredor.nombre);
    
    // 2. Verificar pagos realizados
    console.log('\n2️⃣ Verificando pagos...');
    const { data: pagos, error: errorPagos } = await supabaseAdmin
      .from('pagos')
      .select('*')
      .eq('rut', rutCorredor)
      .order('fecha_creacion', { ascending: false });
    
    if (errorPagos) {
      console.log('❌ Error consultando pagos:', errorPagos.message);
    } else if (pagos && pagos.length > 0) {
      console.log(`✅ ${pagos.length} pago(s) encontrado(s):`);
      pagos.forEach((pago, index) => {
        console.log(`   ${index + 1}. ID: ${pago.id}, Estado: ${pago.estado}, Monto: $${pago.amount}`);
        console.log(`      Fecha: ${new Date(pago.fecha_creacion).toLocaleString('es-CL')}`);
        console.log(`      Producto: ${pago.producto_id}`);
      });
    } else {
      console.log('❌ No se encontraron pagos');
    }
    
    // 3. Verificar accesos de usuario
    console.log('\n3️⃣ Verificando accesos...');
    const { data: accesos, error: errorAccesos } = await supabaseAdmin
      .from('accesos_usuarios')
      .select('*')
      .eq('user_id', `user_demo_${rutCorredor}`)
      .order('fecha_inicio', { ascending: false });
    
    if (errorAccesos) {
      console.log('❌ Error consultando accesos:', errorAccesos.message);
    } else if (accesos && accesos.length > 0) {
      console.log(`✅ ${accesos.length} acceso(s) encontrado(s):`);
      accesos.forEach((acceso, index) => {
        console.log(`   ${index + 1}. Producto: ${acceso.producto_id}, Módulo: ${acceso.modulo}`);
        console.log(`      Activo: ${acceso.activo}, Desde: ${new Date(acceso.fecha_inicio).toLocaleDateString('es-CL')}`);
        console.log(`      Hasta: ${new Date(acceso.fecha_fin).toLocaleDateString('es-CL')}`);
      });
    } else {
      console.log('❌ No se encontraron accesos');
    }
    
    // 4. Verificar reportes individuales
    console.log('\n4️⃣ Verificando reportes individuales...');
    const { data: reportes, error: errorReportes } = await supabaseAdmin
      .from('reportes_individuales')
      .select('*')
      .eq('rut', rutCorredor)
      .order('fecha_generacion', { ascending: false });
    
    if (errorReportes) {
      console.log('❌ Error consultando reportes:', errorReportes.message);
    } else if (reportes && reportes.length > 0) {
      console.log(`✅ ${reportes.length} reporte(s) encontrado(s):`);
      reportes.forEach((reporte, index) => {
        console.log(`   ${index + 1}. Período: ${reporte.periodo}, Activo: ${reporte.activo}`);
        console.log(`      Generado: ${new Date(reporte.fecha_generacion).toLocaleString('es-CL')}`);
        console.log(`      Expira: ${new Date(reporte.fecha_expiracion).toLocaleDateString('es-CL')}`);
      });
    } else {
      console.log('❌ No se encontraron reportes individuales');
    }
    
    // 5. Verificar transacciones Flow
    console.log('\n5️⃣ Verificando transacciones Flow...');
    const { data: transacciones, error: errorTransacciones } = await supabaseAdmin
      .from('transacciones_flow')
      .select('*')
      .eq('rut', rutCorredor)
      .order('fecha_creacion', { ascending: false });
    
    if (errorTransacciones) {
      console.log('❌ Error consultando transacciones:', errorTransacciones.message);
    } else if (transacciones && transacciones.length > 0) {
      console.log(`✅ ${transacciones.length} transacción(es) encontrada(s):`);
      transacciones.forEach((tx, index) => {
        console.log(`   ${index + 1}. Estado: ${tx.estado}, Flow Token: ${tx.flow_token}`);
        console.log(`      Fecha: ${new Date(tx.fecha_creacion).toLocaleString('es-CL')}`);
      });
    } else {
      console.log('❌ No se encontraron transacciones Flow');
    }
    
    console.log('\n' + '=' .repeat(50));
    console.log('🔍 Verificación completada');
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

verificarCompra761650777();