/**
 * Script para verificar si los registros de la compra simulada existen en la base de datos
 * RUT: 762686856, Período: 202412
 */

const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ebfauwdaoxfkzymozmqr.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImViZmF1d2Rhb3hma3p5bW96bXFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyMjE4MjMsImV4cCI6MjA2MTc5NzgyM30.CPZPwIYnspG9PnG09qf8AuLGN0Ek_WSyNBfXzdweZA0';

const supabase = createClient(supabaseUrl, supabaseKey);

// Datos de búsqueda
const RUT_BUSQUEDA = '762686856';
const PERIODO_BUSQUEDA = '202412';
const USER_ID_BUSQUEDA = 'user_demo_762686856';

async function verificarRegistros() {
  console.log('🔍 Verificando registros de compra simulada...');
  console.log(`📋 RUT: ${RUT_BUSQUEDA}`);
  console.log(`📋 Período: ${PERIODO_BUSQUEDA}`);
  console.log(`📋 Usuario: ${USER_ID_BUSQUEDA}`);
  console.log('');

  try {
    // 1. Verificar corredor
    console.log('1️⃣ Verificando corredor...');
    const { data: corredor, error: errorCorredor } = await supabase
      .from('corredores')
      .select('*')
      .eq('rut', RUT_BUSQUEDA)
      .single();

    if (errorCorredor) {
      console.log('❌ Error consultando corredor:', errorCorredor.message);
    } else if (corredor) {
      console.log('✅ Corredor encontrado:');
      console.log(`   - RUT: ${corredor.rut}`);
      console.log(`   - Nombre: ${corredor.nombre}`);
      console.log(`   - Activo: ${corredor.activo ? 'Sí' : 'No'}`);
      console.log(`   - Creado: ${new Date(corredor.fecha_creacion).toLocaleString('es-CL')}`);
    } else {
      console.log('❌ Corredor no encontrado');
    }
    console.log('');

    // 2. Verificar pagos
    console.log('2️⃣ Verificando pagos...');
    const { data: pagos, error: errorPagos } = await supabase
      .from('pagos')
      .select('*')
      .like('orden_comercio', `ORD_${RUT_BUSQUEDA}_${PERIODO_BUSQUEDA}_%`)
      .order('fecha_creacion', { ascending: false });

    if (errorPagos) {
      console.log('❌ Error consultando pagos:', errorPagos.message);
    } else if (pagos && pagos.length > 0) {
      console.log(`✅ ${pagos.length} pago(s) encontrado(s):`);
      pagos.forEach((pago, index) => {
        console.log(`   Pago ${index + 1}:`);
        console.log(`   - ID: ${pago.id}`);
        console.log(`   - Orden: ${pago.orden_comercio}`);
        console.log(`   - Monto: $${pago.amount.toLocaleString('es-CL')} CLP`);
        console.log(`   - Estado: ${pago.estado}`);
        console.log(`   - Método: ${pago.metodo_pago}`);
        console.log(`   - Fecha: ${new Date(pago.fecha_creacion).toLocaleString('es-CL')}`);
        console.log('');
      });
    } else {
      console.log('❌ No se encontraron pagos');
    }
    console.log('');

    // 3. Verificar accesos
    console.log('3️⃣ Verificando accesos...');
    const { data: accesos, error: errorAccesos } = await supabase
      .from('accesos_usuarios')
      .select('*')
      .eq('user_id', USER_ID_BUSQUEDA)
      .eq('modulo', 'reportes_individuales')
      .order('fecha_creacion', { ascending: false });

    if (errorAccesos) {
      console.log('❌ Error consultando accesos:', errorAccesos.message);
    } else if (accesos && accesos.length > 0) {
      console.log(`✅ ${accesos.length} acceso(s) encontrado(s):`);
      accesos.forEach((acceso, index) => {
        console.log(`   Acceso ${index + 1}:`);
        console.log(`   - ID: ${acceso.id}`);
        console.log(`   - Usuario: ${acceso.user_id}`);
        console.log(`   - Módulo: ${acceso.modulo}`);
        console.log(`   - Activo: ${acceso.activo ? 'Sí' : 'No'}`);
        console.log(`   - Desde: ${new Date(acceso.fecha_inicio).toLocaleDateString('es-CL')}`);
        console.log(`   - Hasta: ${new Date(acceso.fecha_fin).toLocaleDateString('es-CL')}`);
        console.log(`   - Creado: ${new Date(acceso.fecha_creacion).toLocaleString('es-CL')}`);
        console.log('');
      });
    } else {
      console.log('❌ No se encontraron accesos');
    }
    console.log('');

    // 4. Verificar reportes
    console.log('4️⃣ Verificando reportes...');
    const { data: reportes, error: errorReportes } = await supabase
      .from('reportes_individuales')
      .select('*')
      .eq('rut', RUT_BUSQUEDA)
      .eq('periodo', PERIODO_BUSQUEDA)
      .order('fecha_generacion', { ascending: false });

    if (errorReportes) {
      console.log('❌ Error consultando reportes:', errorReportes.message);
    } else if (reportes && reportes.length > 0) {
      console.log(`✅ ${reportes.length} reporte(s) encontrado(s):`);
      reportes.forEach((reporte, index) => {
        console.log(`   Reporte ${index + 1}:`);
        console.log(`   - ID: ${reporte.id}`);
        console.log(`   - RUT: ${reporte.rut}`);
        console.log(`   - Período: ${reporte.periodo}`);
        console.log(`   - Activo: ${reporte.activo ? 'Sí' : 'No'}`);
        console.log(`   - Generado: ${new Date(reporte.fecha_generacion).toLocaleString('es-CL')}`);
        console.log(`   - Expira: ${new Date(reporte.fecha_expiracion).toLocaleString('es-CL')}`);
        if (reporte.datos_reporte) {
          console.log(`   - Datos: ${JSON.stringify(reporte.datos_reporte).substring(0, 100)}...`);
        }
        console.log('');
      });
    } else {
      console.log('❌ No se encontraron reportes para este período');
    }
    console.log('');

    // 5. Verificar producto
    console.log('5️⃣ Verificando producto rp_001...');
    const { data: producto, error: errorProducto } = await supabase
      .from('productos')
      .select('*')
      .eq('codigo', 'rp_001')
      .single();

    if (errorProducto) {
      console.log('❌ Error consultando producto:', errorProducto.message);
    } else if (producto) {
      console.log('✅ Producto encontrado:');
      console.log(`   - Código: ${producto.codigo}`);
      console.log(`   - Nombre: ${producto.nombre}`);
      console.log(`   - Precio: $${producto.precio_bruto.toLocaleString('es-CL')} CLP`);
      console.log(`   - Activo: ${producto.activo ? 'Sí' : 'No'}`);
    } else {
      console.log('❌ Producto rp_001 no encontrado');
    }
    console.log('');

    // 6. Verificar todos los reportes del RUT
    console.log('6️⃣ Verificando todos los reportes del RUT...');
    const { data: todosReportes, error: errorTodosReportes } = await supabase
      .from('reportes_individuales')
      .select('*')
      .eq('rut', RUT_BUSQUEDA)
      .order('fecha_generacion', { ascending: false });

    if (errorTodosReportes) {
      console.log('❌ Error consultando todos los reportes:', errorTodosReportes.message);
    } else if (todosReportes && todosReportes.length > 0) {
      console.log(`✅ ${todosReportes.length} reporte(s) total(es) para el RUT:`);
      todosReportes.forEach((reporte, index) => {
        console.log(`   - Período ${reporte.periodo}: ${reporte.activo ? 'Activo' : 'Inactivo'} (${new Date(reporte.fecha_generacion).toLocaleDateString('es-CL')})`);
      });
    } else {
      console.log('❌ No se encontraron reportes para este RUT');
    }
    console.log('');

    // 7. Verificar todos los accesos del usuario
    console.log('7️⃣ Verificando todos los accesos del usuario...');
    const { data: todosAccesos, error: errorTodosAccesos } = await supabase
      .from('accesos_usuarios')
      .select('*')
      .eq('user_id', USER_ID_BUSQUEDA)
      .order('fecha_creacion', { ascending: false });

    if (errorTodosAccesos) {
      console.log('❌ Error consultando todos los accesos:', errorTodosAccesos.message);
    } else if (todosAccesos && todosAccesos.length > 0) {
      console.log(`✅ ${todosAccesos.length} acceso(s) total(es) para el usuario:`);
      todosAccesos.forEach((acceso, index) => {
        console.log(`   - Módulo ${acceso.modulo}: ${acceso.activo ? 'Activo' : 'Inactivo'} (${new Date(acceso.fecha_creacion).toLocaleDateString('es-CL')})`);
      });
    } else {
      console.log('❌ No se encontraron accesos para este usuario');
    }
    console.log('');

    // Resumen final
    console.log('📊 RESUMEN:');
    console.log('=' .repeat(50));
    console.log(`✅ Corredor existe: ${corredor ? 'SÍ' : 'NO'}`);
    console.log(`✅ Pagos encontrados: ${pagos ? pagos.length : 0}`);
    console.log(`✅ Accesos encontrados: ${accesos ? accesos.length : 0}`);
    console.log(`✅ Reportes período ${PERIODO_BUSQUEDA}: ${reportes ? reportes.length : 0}`);
    console.log(`✅ Reportes totales RUT: ${todosReportes ? todosReportes.length : 0}`);
    console.log(`✅ Producto rp_001 existe: ${producto ? 'SÍ' : 'NO'}`);
    console.log('');

    if (reportes && reportes.length > 0 && accesos && accesos.length > 0) {
      console.log('🎉 ¡La compra simulada fue exitosa! Los registros existen.');
      console.log('🌐 El reporte debería aparecer en el dashboard.');
      console.log('📋 URL del dashboard: http://localhost:3000/dashboard/corredor/reportes');
    } else {
      console.log('⚠️  La compra simulada no se completó correctamente.');
      console.log('💡 Posibles causas:');
      console.log('   - La simulación no se ejecutó');
      console.log('   - Error en las variables de entorno');
      console.log('   - Error en la función comprarReporte');
      console.log('   - Problema de conectividad con Supabase');
      console.log('');
      console.log('🔧 Soluciones recomendadas:');
      console.log('   1. Ejecutar la simulación de compra vía API');
      console.log('   2. Verificar variables de entorno de Supabase');
      console.log('   3. Revisar logs del servidor');
    }

  } catch (error) {
    console.error('💥 Error general:', error.message);
    console.log('');
    console.log('🔧 Posibles soluciones:');
    console.log('   1. Verificar variables de entorno de Supabase');
    console.log('   2. Verificar conectividad a internet');
    console.log('   3. Verificar que el proyecto Supabase esté activo');
  }
}

// Ejecutar verificación
if (require.main === module) {
  console.log('🔍 Verificación de Registros de Compra Simulada');
  console.log('=' .repeat(50));
  console.log('');
  
  verificarRegistros().catch(console.error);
}

module.exports = { verificarRegistros };