const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testFlujoCompraCompleto() {
  const userId = 'user_test_123';
  const rutCorredor = '12345678-9';
  const periodo = '202412';
  
  console.log('=== INICIANDO PRUEBA DE FLUJO COMPLETO ===');
  
  try {
    // 1. Verificar corredor
    console.log('\n1. Verificando corredor...');
    const { data: corredor, error: errorCorredor } = await supabaseAdmin
      .from('corredores')
      .select('*')
      .eq('rut', rutCorredor)
      .single();
    
    if (errorCorredor) {
      console.error('❌ Error verificando corredor:', errorCorredor);
      return;
    }
    console.log('✅ Corredor encontrado:', corredor.nombre);
    
    // 2. Obtener producto
    console.log('\n2. Obteniendo producto rp_001...');
    const { data: producto, error: errorProducto } = await supabaseAdmin
      .from('productos')
      .select('*')
      .eq('codigo', 'rp_001')
      .single();
    
    if (errorProducto) {
      console.error('❌ Error obteniendo producto:', errorProducto);
      return;
    }
    console.log('✅ Producto encontrado:', producto.nombre);
    
    // 3. Simular pago
    console.log('\n3. Simulando pago...');
    const ordenComercio = `ORD_${Date.now()}`;
    const pagoData = {
      user_id: userId,
      rut: rutCorredor,
      producto_id: producto.id,
      orden_comercio: ordenComercio,
      amount: producto.precio || 50000,
      estado: 'completado',
      metodo_pago: 'simulado',
      flow_order: ordenComercio,
      flow_token: `token_${Date.now()}`,
      flow_url_confirmation: 'http://localhost:3000/confirmacion',
      flow_url_return: 'http://localhost:3000/retorno'
    };
    
    const { data: pago, error: errorPago } = await supabaseAdmin
      .from('pagos')
      .insert(pagoData)
      .select()
      .single();
    
    if (errorPago) {
      console.error('❌ Error simulando pago:', errorPago);
      return;
    }
    console.log('✅ Pago simulado:', pago.id);
    
    // 4. Crear acceso
    console.log('\n4. Creando acceso...');
    const fechaInicio = new Date();
    const fechaFin = new Date();
    fechaFin.setFullYear(fechaFin.getFullYear() + 1);
    
    const accesoData = {
      user_id: userId,
      producto_id: producto.id,
      modulo: `reporte_corredor_${rutCorredor}`,
      fecha_inicio: fechaInicio.toISOString(),
      fecha_fin: fechaFin.toISOString(),
      activo: true
    };
    
    const { data: acceso, error: errorAcceso } = await supabaseAdmin
      .from('accesos_usuarios')
      .insert(accesoData)
      .select()
      .single();
    
    if (errorAcceso) {
      console.error('❌ Error creando acceso:', errorAcceso);
      return;
    }
    console.log('✅ Acceso creado:', acceso.id);
    
    // 5. Verificar si ya existe reporte
    console.log('\n5. Verificando reporte existente...');
    const { data: reporteExistente } = await supabaseAdmin
      .from('reportes_individuales')
      .select('*')
      .eq('rut', rutCorredor)
      .eq('periodo', periodo)
      .eq('activo', true)
      .single();
    
    if (reporteExistente) {
      console.log('⚠️  Ya existe un reporte activo:', reporteExistente.id);
      console.log('✅ FLUJO COMPLETADO - Usando reporte existente');
      return;
    }
    
    // 6. Generar reporte
    console.log('\n6. Generando reporte individual...');
    const fechaExpiracion = new Date();
    fechaExpiracion.setMonth(fechaExpiracion.getMonth() + 3);
    
    const reporteData = {
      user_id: userId,
      rut: rutCorredor,
      periodo: periodo,
      datos_reporte: {
        rut: rutCorredor,
        periodo: periodo,
        fecha_generacion: new Date().toISOString(),
        tipo: 'individual',
        estado: 'generado'
      },
      fecha_generacion: new Date().toISOString(),
      fecha_expiracion: fechaExpiracion.toISOString(),
      activo: true
    };
    
    const { data: reporte, error: errorReporte } = await supabaseAdmin
      .from('reportes_individuales')
      .insert(reporteData)
      .select()
      .single();
    
    if (errorReporte) {
      console.error('❌ Error generando reporte:', errorReporte);
      return;
    }
    
    console.log('✅ Reporte generado exitosamente:', reporte.id);
    console.log('\n🎉 FLUJO COMPLETADO EXITOSAMENTE');
    
  } catch (error) {
    console.error('❌ Error en flujo completo:', error);
  }
}

testFlujoCompraCompleto();